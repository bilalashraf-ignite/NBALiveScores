"use client";

import { useState } from "react";

interface EmailVerificationProps {
  email: string | null;
  emailVerified: Date | null;
}

export function EmailVerification({ email, emailVerified }: EmailVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!email) return null;

  if (emailVerified) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-green-600 dark:text-green-400">
          Email verified
        </span>
      </div>
    );
  }

  const handleResend = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        // Defensively parse JSON - response may not be JSON
        let errorMessage = "Failed to send verification email";
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          try {
            const data = await response.json();
            errorMessage = data?.error || errorMessage;
          } catch {
            // JSON parsing failed, use fallback
            errorMessage = response.statusText || errorMessage;
          }
        } else {
          errorMessage = response.statusText || errorMessage;
        }
        setError(errorMessage);
      }
    } catch {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Your email is not verified. Verify your email to secure your account.
          </p>

          {success && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Verification email sent! Check your inbox.
            </p>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {!success && (
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100 underline disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
