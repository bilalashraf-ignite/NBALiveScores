"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { OAuthButton } from "@/components/ui/oauth-button";

// Validate callbackUrl to prevent open redirect attacks
function isValidCallbackUrl(url: string | null): string {
  if (!url) return "/";
  // Must be a relative path starting with single "/" and not "//" (protocol-relative)
  // Must not contain a scheme (e.g., http:, https:, javascript:)
  if (
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)
  ) {
    return url;
  }
  return "/";
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = isValidCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
        <p className="mt-2 text-gray-400">
          Ready to break some records today?
        </p>
      </div>

      {/* Error message */}
      {(error || errorMessage) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error === "OAuthAccountNotLinked"
            ? "This email is already associated with another account. Please sign in with your original method."
            : errorMessage || "An error occurred during sign in."}
        </div>
      )}

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-4">
        <OAuthButton provider="google" callbackUrl={callbackUrl} />
        <OAuthButton provider="apple" callbackUrl={callbackUrl} />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#0f0f1a] px-4 text-gray-500">
            or login with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-purple-500/30 bg-[#1a1a2e] text-purple-500 focus:ring-purple-500/50 focus:ring-offset-0"
          />
          <label htmlFor="remember" className="text-sm text-gray-400">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit button */}
        <GradientButton
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign In
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </GradientButton>
      </form>

      {/* Sign up link */}
      <p className="text-center text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Create Account
        </Link>
      </p>

      {/* Footer links */}
      <div className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500">
        <Link href="/privacy" className="hover:text-gray-400 transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-gray-400 transition-colors">
          Terms of Service
        </Link>
        <Link href="/support" className="hover:text-gray-400 transition-colors">
          Support
        </Link>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-8 w-48 rounded bg-purple-500/20" />
            <div className="mt-2 h-4 w-64 rounded bg-purple-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 rounded-lg bg-purple-500/10" />
            <div className="h-12 rounded-lg bg-purple-500/10" />
          </div>
          <div className="space-y-4">
            <div className="h-12 rounded-lg bg-purple-500/10" />
            <div className="h-12 rounded-lg bg-purple-500/10" />
          </div>
          <div className="h-12 rounded-lg bg-purple-500/20" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
