import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileLogger } from "@/lib/logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await params;

    // Get user's accounts and check if they have a password
    const [accounts, user] = await Promise.all([
      prisma.account.findMany({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      }),
    ]);

    // Safeguard: Ensure user has at least one auth method remaining
    const hasPassword = !!user?.password;
    const otherAccounts = accounts.filter((a) => a.provider !== provider);

    if (!hasPassword && otherAccounts.length === 0) {
      return NextResponse.json(
        {
          error:
            "Cannot unlink this account. You must have at least one way to sign in (either a password or another linked account).",
        },
        { status: 400 }
      );
    }

    // Find and delete the account
    const accountToDelete = accounts.find((a) => a.provider === provider);

    if (!accountToDelete) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    await prisma.account.delete({
      where: { id: accountToDelete.id },
    });

    return NextResponse.json({ message: "Account unlinked successfully" });
  } catch (error) {
    profileLogger.error({ err: error }, "Unlink account error");
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    );
  }
}
