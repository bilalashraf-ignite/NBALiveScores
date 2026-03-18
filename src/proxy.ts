import { auth } from "@/lib/auth";

// Re-export auth as proxy for Next.js 16+ convention
export const proxy = auth;

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
