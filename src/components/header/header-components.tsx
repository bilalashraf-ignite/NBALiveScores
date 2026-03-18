'use client';

import Link from "next/link";
import { useWalletBalance } from "@/hooks/use-wallet-balance";

// Auth buttons for unauthenticated users
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

// Star balance badge showing user's star points
export function StarBalanceBadge() {
  const { balance, isLoading, error } = useWalletBalance();

  if (isLoading) {
    return (
      <div className="h-8 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (error || balance === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
      <span className="text-yellow-600 dark:text-yellow-400">★</span>
      <span>{balance.balance.toLocaleString()}</span>
    </div>
  );
}

// Navigation tabs interface and component
interface NavTab {
  id: string;
  label: string;
  href?: string;
}

interface NavTabsProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

export function NavTabs({ tabs, activeTab, onTabChange }: NavTabsProps) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${activeTab === tab.id
              ? 'text-white bg-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
