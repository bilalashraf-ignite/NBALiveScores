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

    // Fetch user with accounts in a single query
    const userWithAccounts = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    return NextResponse.json({
      accounts: userWithAccounts?.accounts ?? [],
      hasPassword: !!userWithAccounts?.password,
    });
  } catch (error) {
    profileLogger.error({ err: error }, "Accounts fetch error");
    return NextResponse.json(
      { error: "Failed to fetch linked accounts" },
      { status: 500 }
    );
  }
}
