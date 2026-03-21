import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileLogger } from "@/lib/logger";

// Allowed image hostnames (must match next.config.ts remotePatterns)
const ALLOWED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
  "platform-lookaside.fbsbx.com",
] as const;

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];

function isAllowedImageUrl(urlString: string): { valid: boolean; error?: string } {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { valid: false, error: "Invalid image URL" };
  }

  if (url.protocol !== "https:") {
    return { valid: false, error: "Image URL must use HTTPS" };
  }

  if (!ALLOWED_IMAGE_HOSTS.includes(url.hostname as typeof ALLOWED_IMAGE_HOSTS[number])) {
    return { valid: false, error: "Image URL is not from a trusted source" };
  }

  // Cloudinary URLs don't always have extensions in the path, so only check for other hosts
  if (url.hostname !== "res.cloudinary.com") {
    const pathname = url.pathname.toLowerCase();
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));
    if (!hasValidExtension) {
      return { valid: false, error: "URL does not appear to be an image" };
    }
  }

  return { valid: true };
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const validation = isAllowedImageUrl(imageUrl);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        image: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    profileLogger.error({ err: error }, "Avatar update error");
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ message: "Avatar removed" });
  } catch (error) {
    profileLogger.error({ err: error }, "Avatar delete error");
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}
