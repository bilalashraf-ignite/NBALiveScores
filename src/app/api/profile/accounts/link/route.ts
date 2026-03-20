import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { profileLogger } from "@/lib/logger";

// This endpoint returns the OAuth URL for linking a new provider
// The actual linking happens through NextAuth's OAuth flow
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let provider: string;
    try {
      const body = await request.json();
      provider = body.provider;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!["google", "facebook"].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Return the OAuth signin URL with callback to profile
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/profile?linked=${provider}`;
    const signinUrl = `${baseUrl}/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.json({ url: signinUrl });
  } catch (error) {
    profileLogger.error({ err: error }, "Link account error");
    return NextResponse.json(
      { error: "Failed to initiate account linking" },
      { status: 500 }
    );
  }
}
