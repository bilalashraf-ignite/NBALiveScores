import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/tokens";
import { authLogger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      );
    }

    // Verify the token
    const verificationToken = await verifyToken(token, email);

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Update user and delete token in a transaction to prevent race conditions
    const [updateResult] = await prisma.$transaction([
      // Update user's emailVerified field
      prisma.user.updateMany({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      // Invalidate the token to prevent replay attacks
      prisma.verificationToken.deleteMany({
        where: { token, identifier: email },
      }),
    ]);

    if (updateResult.count === 0) {
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
