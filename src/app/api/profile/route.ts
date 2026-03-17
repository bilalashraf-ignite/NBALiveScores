import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileLogger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        phone: true,
        bio: true,
        location: true,
        birthday: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    profileLogger.error({ err: error }, "Profile fetch error");
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, bio, location, birthday, gender } = body;

    // Validate birthday format if provided
    let parsedBirthday: Date | undefined;
    if (birthday) {
      parsedBirthday = new Date(birthday);
      if (isNaN(parsedBirthday.getTime())) {
        return NextResponse.json(
          { error: "Invalid birthday format" },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(birthday !== undefined && { birthday: parsedBirthday }),
        ...(gender !== undefined && { gender }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        phone: true,
        bio: true,
        location: true,
        birthday: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    profileLogger.error({ err: error }, "Profile update error");
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
