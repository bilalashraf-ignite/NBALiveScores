import { NextResponse } from "next/server";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { authLogger, hashEmail } from "@/lib/logger";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

// Name validation constraints
const MAX_NAME_LENGTH = 100;

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const clientIp = getClientIp(headersList);

    // Check IP rate limit first (before parsing body)
    const ipRateLimit = await rateLimiters.signupIp.check(clientIp);
    if (!ipRateLimit.allowed) {
      authLogger.warn({ ip: clientIp }, "Signup IP rate limit exceeded");
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    let name: string | undefined;
    let email: string;
    let password: string;
    try {
      const body = await request.json();
      name = body.name;
      email = body.email;
      password = body.password;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Sanitize and validate name
    let sanitizedName: string | undefined;
    if (name !== undefined && name !== null) {
      sanitizedName = String(name).trim().slice(0, MAX_NAME_LENGTH);
      // If name was provided but is empty after trimming, reject it
      if (name && !sanitizedName) {
        return NextResponse.json(
          { error: "Name cannot be empty or whitespace only" },
          { status: 400 }
        );
      }
      // Set to undefined if empty to store as null in DB
      if (!sanitizedName) {
        sanitizedName = undefined;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check email-based rate limit (before expensive operations)
    const emailRateLimit = await rateLimiters.signupEmail.check(email.toLowerCase());
    if (!emailRateLimit.allowed) {
      authLogger.warn({ emailHash: hashEmail(email) }, "Signup email rate limit exceeded");
      return NextResponse.json(
        { error: "Too many signup attempts for this email. Please try again later." },
        { status: 429 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Hash password (expensive operation - protected by rate limiting above)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user - handle unique constraint violation atomically
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: sanitizedName,
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      // Handle unique constraint violation (email already exists)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Generate verification token and send email (optional verification)
    try {
      const token = await generateVerificationToken(email);
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      // Log error but don't fail signup - verification is optional
      authLogger.error({ err: emailError }, "Failed to send verification email");
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    authLogger.error({ err: error }, "Signup error");
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
