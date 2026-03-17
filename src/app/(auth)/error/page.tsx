"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Error signing in with the OAuth provider.",
  OAuthCallback: "Error in the OAuth callback.",
  OAuthCreateAccount: "Could not create an account using this OAuth provider.",
  EmailCreateAccount: "Could not create an account using this email.",
  Callback: "Error in the authentication callback.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  EmailSignin: "Error sending the verification email.",
  CredentialsSignin: "Sign in failed. Check the details you provided.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An error occurred during authentication.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="text-center">
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
        Authentication Error
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
      <div className="mt-6 space-x-4">
        <Link
          href="/signin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try again
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
