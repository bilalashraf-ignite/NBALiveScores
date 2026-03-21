import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { authLogger } from "@/lib/logger";

// Rate limit: 1 password reset email per 15 minutes per user
const PASSWORD_RESET_COOLDOWN_MS = 15 * 60 * 1000;

// IP-based rate limiting (in-memory for dev, use Redis in production)
// Note: In-memory approach won't work across serverless instances; for production
// multi-instance deployments, replace with Redis-backed rate limiting.
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const IP_RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per minute per IP
const IP_RATE_LIMIT_MAX_ENTRIES = 10000; // Cap to prevent unbounded growth
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Cleanup every 5 minutes

function cleanupStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;

  for (const [ip, record] of ipRequestCounts) {
    if (now >= record.resetAt) {
      ipRequestCounts.delete(ip);
    }
  }
}

function getClientIp(headersList: Headers): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of stale entries
  cleanupStaleEntries();

  // Safety cap: if map is too large, clear it to prevent memory issues
  if (ipRequestCounts.size >= IP_RATE_LIMIT_MAX_ENTRIES) {
    ipRequestCounts.clear();
  }

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
