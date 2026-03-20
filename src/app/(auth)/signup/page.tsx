"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { OAuthButton } from "@/components/ui/oauth-button";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle redirect after successful signup
  useEffect(() => {
    if (success) {
      timeoutRef.current = setTimeout(() => {
        router.push("/signin");
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-white">
          Account created!
        </h2>
        <p className="mt-2 text-gray-400">
          Redirecting you to sign in...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-purple-500/20">
            <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Create Account</h2>
        <p className="mt-2 text-gray-400">
          Join the most vibrant sports community
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400"
        >
          {error}
        </div>
      )}

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-4">
        <OAuthButton provider="google" />
        <OAuthButton provider="facebook" />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#0f0f1a] px-4 text-gray-500">
            or sign up with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          name="name"
          type="text"
          label="Full Name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />

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

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
        />

        {/* Submit button */}
        <GradientButton
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Create Account
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

      {/* Sign in link */}
      <p className="text-center text-gray-400">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Sign In
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
