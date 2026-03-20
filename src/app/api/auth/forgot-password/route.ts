import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

// Rate limit: 1 password reset email per 15 minutes per user
const PASSWORD_RESET_COOLDOWN_MS = 15 * 60 * 1000;

// IP-based rate limiting (in-memory for dev, use Redis in production)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const IP_RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per minute per IP

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now >= record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + IP_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= IP_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Generic success response to prevent email enumeration
const SUCCESS_RESPONSE = {
  message: "If an account exists with this email, you will receive a password reset link.",
};

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check IP rate limit first
    if (!checkIpRateLimit(clientIp)) {
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
      select: { id: true, lastPasswordResetEmailSent: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(SUCCESS_RESPONSE);
    }

    // Check per-user cooldown
    if (user.lastPasswordResetEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastPasswordResetEmailSent.getTime();
      if (timeSinceLastEmail < PASSWORD_RESET_COOLDOWN_MS) {
        authLogger.warn({ userId: user.id }, "Password reset user cooldown active");
        // Return success to prevent enumeration
        return NextResponse.json(SUCCESS_RESPONSE);
      }
    }

    // Generate reset token (scoped to userId for security) and send email
    try {
      const token = await generatePasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);

      // Update last password reset email sent timestamp atomically
      await prisma.user.update({
        where: { id: user.id },
        data: { lastPasswordResetEmailSent: new Date() },
      });
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
