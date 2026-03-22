/**
 * Profile Layout Component
 *
 * Authentication Protection:
 * - This route is protected by NextAuth middleware (src/lib/auth.ts)
 * - The `authorized` callback in auth.ts checks if routes are in the public routes list
 * - /profile is NOT in public routes, so it requires authentication
 * - Unauthenticated users are automatically redirected to /signin?callbackUrl=/profile
 *
 * Protected routes logic (from auth.ts):
 * ```
 * const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/error'];
 * const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
 * if (!isPublicRoute && !isAuthenticated) {
 *   return Response.redirect(new URL(`/signin?callbackUrl=${callbackUrl}`, request.nextUrl));
 * }
 * ```
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
