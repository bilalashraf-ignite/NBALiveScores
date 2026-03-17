"use client";

import Link from "next/link";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/signin"
        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Sign up
      </Link>
    </div>
  );
}
