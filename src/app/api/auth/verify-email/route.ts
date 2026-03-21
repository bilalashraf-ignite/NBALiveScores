import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authLogger } from "@/lib/logger";

// IP-based rate limiting (in-memory for dev, use Redis in production)
// TODO: For production multi-instance deployments, replace with Redis-backed
// rate limiting (e.g., @upstash/ratelimit) as in-memory Maps won't persist
// across serverless instances or cold starts.
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const IP_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const IP_RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 verification attempts per minute per IP

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

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  const headersList = await headers();
  const clientIp = getClientIp(headersList);

  // Check IP rate limit first
  if (!checkIpRateLimit(clientIp)) {
    authLogger.warn({ ip: clientIp }, "Email verification IP rate limit exceeded");
    return NextResponse.json(
      { error: "Too many verification attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parseResult = verifyEmailSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || "Invalid request";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { token, email } = parseResult.data;

  try {
    // Use interactive transaction to atomically verify token, delete it, and update user
    const result = await prisma.$transaction(async (tx) => {
      // Atomically find and delete the token - prevents TOCTOU race
      const deletedToken = await tx.verificationToken.deleteMany({
        where: {
          token,
          identifier: email,
          expires: { gt: new Date() },
        },
      });

      // If no token was deleted, it was invalid or expired
      if (deletedToken.count === 0) {
        return { success: false, reason: "invalid_token" } as const;
      }

      // Token was valid and is now deleted - update user
      const updateResult = await tx.user.updateMany({
        where: { email },
        data: { emailVerified: new Date() },
      });

      if (updateResult.count === 0) {
        return { success: false, reason: "user_not_found" } as const;
      }

      return { success: true } as const;
    });

    if (!result.success) {
      if (result.reason === "invalid_token") {
        return NextResponse.json(
          { error: "Invalid or expired verification link" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    authLogger.error({ err: error }, "Email verification error");
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
