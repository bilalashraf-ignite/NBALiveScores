import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/tokens";
import { authLogger } from "@/lib/logger";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parseResult = resetPasswordSchema.safeParse(body);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || "Invalid request";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { token, email, password } = parseResult.data;

  try {
    // Look up user by email to get the canonical userId
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // Verify the token using userId (token is scoped to userId for security)
    const verificationToken = await verifyToken(token, `password-reset:${user.id}`);

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    // Hash and update password using userId (not email) to prevent mis-targeting
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and delete token atomically to prevent token burn on failure
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `password-reset:${user.id}`,
            token,
          },
        },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    authLogger.error({ err: error }, "Reset password error");
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
