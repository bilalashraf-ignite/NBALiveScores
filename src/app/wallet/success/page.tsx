"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function WalletSuccessContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");

  useEffect(() => {
    // Could optionally refresh balance or trigger confetti here
  }, [purchaseId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
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

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Purchase Successful!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your Star Points have been added to your account. They should appear
          in your balance within a few moments.
        </p>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            View My Wallet
          </Link>

          <Link
            href="/"
            className="block w-full px-6 py-3 text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WalletSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center animate-pulse">
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-8" />
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      }
    >
      <WalletSuccessContent />
    </Suspense>
  );
}
