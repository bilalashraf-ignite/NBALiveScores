import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

// Rate limit: 1 password reset email per 15 minutes per user
const PASSWORD_RESET_COOLDOWN_MS = 15 * 60 * 1000;

// Generic success response to prevent email enumeration
const SUCCESS_RESPONSE = {
  message: "If an account exists with this email, you will receive a password reset link.",
};

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check IP rate limit first
    const ipRateLimit = await rateLimiters.passwordResetIp.check(clientIp);
    if (!ipRateLimit.allowed) {
      authLogger.warn({ ip: clientIp }, "Password reset IP rate limit exceeded");
      // Return success to prevent enumeration
      return NextResponse.json(SUCCESS_RESPONSE);
    }

    let email: string;
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(SUCCESS_RESPONSE);
    }

    // Atomically claim the right to send a reset email.
    // This prevents race conditions where concurrent requests both pass cooldown check.
    const cooldownCutoff = new Date(Date.now() - PASSWORD_RESET_COOLDOWN_MS);
    const claimResult = await prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [
          { lastPasswordResetEmailSent: null },
          { lastPasswordResetEmailSent: { lt: cooldownCutoff } },
        ],
      },
      data: { lastPasswordResetEmailSent: new Date() },
    });

    // If no rows updated, cooldown is active or another request claimed it
    if (claimResult.count === 0) {
      authLogger.warn({ userId: user.id }, "Password reset user cooldown active");
      // Return success to prevent enumeration
      return NextResponse.json(SUCCESS_RESPONSE);
    }

    // Successfully claimed - now safe to generate token and send email
    try {
      const token = await generatePasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      authLogger.error({ err: emailError }, "Failed to send password reset email");
      // Still return success to prevent enumeration
    }

    return NextResponse.json(SUCCESS_RESPONSE);
  } catch (error) {
    authLogger.error({ err: error }, "Forgot password error");
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
