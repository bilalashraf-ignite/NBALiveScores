"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { AuthButtons } from "./auth-buttons";
import { StarBalanceBadge } from "./star-balance-badge";
import { SportTabs } from "@/components/sport-tabs";
import type { Sport } from "@/types/sports-data";

interface HeaderProps {
  selectedSport?: Sport;
  onSelectSport?: (sport: Sport) => void;
  basketballCount?: number;
  footballCount?: number;
}

export function Header({
  selectedSport = 'basketball',
  onSelectSport,
  basketballCount = 0,
  footballCount = 0
}: HeaderProps) {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Live Scores
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
        {/* Sport tabs */}
        {onSelectSport && (
          <SportTabs
            selectedSport={selectedSport}
            onSelectSport={onSelectSport}
            basketballCount={basketballCount}
            footballCount={footballCount}
          />
        )}
      </div>
    </header>
  );
}
