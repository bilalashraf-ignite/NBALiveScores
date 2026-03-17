"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function WalletCancelContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-6">
          <svg
            className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
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
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Purchase Cancelled
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your purchase was cancelled and you have not been charged. You can try
          again whenever you&apos;re ready.
        </p>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Back to My Wallet
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

export default function WalletCancelPage() {
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
      <WalletCancelContent />
    </Suspense>
  );
}
