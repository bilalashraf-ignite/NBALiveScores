import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

// Rate limit: 1 verification email per hour
const VERIFICATION_EMAIL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true, lastVerificationEmailSent: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "No email associated with this account" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check rate limit (informative check for user-friendly error message)
    if (user.lastVerificationEmailSent) {
      const timeSinceLastEmail = Date.now() - user.lastVerificationEmailSent.getTime();
      if (timeSinceLastEmail < VERIFICATION_EMAIL_COOLDOWN_MS) {
        const minutesRemaining = Math.ceil(
          (VERIFICATION_EMAIL_COOLDOWN_MS - timeSinceLastEmail) / (60 * 1000)
        );
        return NextResponse.json(
          { error: `Please wait ${minutesRemaining} minute(s) before requesting another verification email` },
          { status: 429 }
        );
      }
    }

    // Atomically claim the right to send a verification email.
    // This prevents race conditions where concurrent requests both pass cooldown check.
    const cooldownCutoff = new Date(Date.now() - VERIFICATION_EMAIL_COOLDOWN_MS);
    const claimResult = await prisma.user.updateMany({
      where: {
        id: session.user.id,
        emailVerified: null,
        OR: [
          { lastVerificationEmailSent: null },
          { lastVerificationEmailSent: { lt: cooldownCutoff } },
        ],
      },
      data: { lastVerificationEmailSent: new Date() },
    });

    // If claim failed, either concurrent request beat us or state changed
    if (claimResult.count === 0) {
      return NextResponse.json(
        { error: "Please wait before requesting another verification email" },
        { status: 429 }
      );
    }

    // Successfully claimed - now safe to generate and send
    const token = await generateVerificationToken(user.email);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    authLogger.error({ err: error }, "Resend verification error");
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
