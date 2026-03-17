import crypto from "crypto";
import { prisma } from "./db";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function generatePasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: `password-reset:${userId}` },
  });

  // Create new token scoped to userId for security
  await prisma.verificationToken.create({
    data: {
      identifier: `password-reset:${userId}`,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string, identifier: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      identifier,
      expires: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return null;
  }

  // Token is valid - caller is responsible for deleting it atomically
  // with the state change it authorizes (e.g., in a transaction)
  return verificationToken;
}
