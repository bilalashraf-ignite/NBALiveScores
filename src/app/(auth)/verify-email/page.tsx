"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const controller = new AbortController();

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type");
        let data: { error?: string } | null = null;

        if (contentType?.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            // JSON parsing failed despite content-type header
          }
        }

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data?.error || "Verification failed.");
        }
      } catch (error) {
        // Ignore aborted requests (component unmounted or deps changed)
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verifyEmail();

    return () => {
      controller.abort();
    };
  }, [token, email]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto flex items-center justify-center h-12 w-12">
            <LoadingSpinner />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Verifying your email...
          </h2>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
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
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Email Verified!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
          <Link
            href="/signin"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in to your account
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Verification Failed
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
          <Link
            href="/signin"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12">
            <LoadingSpinner />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Loading...
          </h2>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
