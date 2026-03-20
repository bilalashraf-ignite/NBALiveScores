import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const rememberMe = credentials.rememberMe === "true";

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true, password: true, status: true },
        });

        if (!user || !user.password) {
          return null;
        }

        // Prevent disabled users from signing in
        if (user.status === UserStatus.DISABLED) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      const isAuthenticated = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't require auth
      const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/error'];
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

      // If on public route and authenticated → redirect to dashboard
      if (isPublicRoute && isAuthenticated) {
        return Response.redirect(new URL('/', request.nextUrl));
      }

      // If on protected route and NOT authenticated → redirect to signin
      if (!isPublicRoute && !isAuthenticated) {
        const callbackUrl = encodeURIComponent(pathname);
        return Response.redirect(new URL(`/signin?callbackUrl=${callbackUrl}`, request.nextUrl));
      }

      return true; // Allow access
    },
    async signIn({ user }) {
      // Block disabled users from signing in (applies to all providers)
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { status: true },
        });
        if (dbUser?.status === UserStatus.DISABLED) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Set extended expiration if "Remember Me" was checked (30 days vs default)
        if ('rememberMe' in user && user.rememberMe) {
          token.maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
        }
      }

      // Handle session updates (e.g., after profile update)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
