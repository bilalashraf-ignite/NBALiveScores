import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Generate reset token (scoped to userId for security) and send email
    try {
      const token = await generatePasswordResetToken(user.id);
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      authLogger.error({ err: emailError }, "Failed to send password reset email");
      // Still return success to prevent enumeration
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    authLogger.error({ err: error }, "Forgot password error");
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
