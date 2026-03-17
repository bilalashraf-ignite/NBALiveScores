"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { AuthButtons } from "./auth-buttons";
import { StarBalanceBadge } from "./star-balance-badge";

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Basketball Scores
          </h1>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            ) : session ? (
              <>
                <StarBalanceBadge />
                <UserMenu session={session} />
              </>
            ) : (
              <AuthButtons />
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
