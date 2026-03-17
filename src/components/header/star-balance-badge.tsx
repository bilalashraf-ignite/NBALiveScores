"use client";

import { useWalletBalance } from "@/hooks/use-wallet-balance";

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
