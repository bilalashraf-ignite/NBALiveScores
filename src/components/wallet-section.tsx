"use client";

import { useState } from "react";
import Link from "next/link";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletLedger } from "@/hooks/use-wallet-ledger";
import { useStarPointCheckout } from "@/hooks/use-star-point-checkout";
import type { StarPointProduct } from "@/types/user";

// Product packages for quick purchase (matches backend products.ts)
const STAR_POINT_PACKAGES: StarPointProduct[] = [
  { code: "star_100", name: "100 Star Points", points: 100, amountCents: 499, currency: "usd" },
  { code: "star_500", name: "500 Star Points", points: 500, amountCents: 1999, currency: "usd" },
  { code: "star_1000", name: "1,000 Star Points", points: 1000, amountCents: 3499, currency: "usd" },
];

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getEntryTypeLabel(entryType: string): string {
  switch (entryType) {
    case "CREDIT_PURCHASE":
      return "Purchase";
    case "DEBIT_REFUND":
      return "Refund";
    case "CREDIT_ADJUSTMENT":
      return "Bonus";
    case "DEBIT_SPEND":
      return "Spent";
    case "DEBIT_ADJUSTMENT":
      return "Adjustment";
    default:
      return entryType;
  }
}

export function WalletSection() {
  const { balance, isLoading: balanceLoading, error: balanceError, refreshBalance } = useWalletBalance();
  const { entries, isLoading: ledgerLoading, error: ledgerError } = useWalletLedger();
  const { isLoading: checkoutLoading, error: checkoutError, createCheckout } = useStarPointCheckout();

  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);

  const handlePurchase = async (productCode: string) => {
    setPurchasingProduct(productCode);
    try {
      await createCheckout(productCode);
    } finally {
      setPurchasingProduct(null);
    }
  };

  // Loading skeleton
  if (balanceLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (balanceError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
        {balanceError}
      </div>
    );
  }

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Star Points Wallet
      </h3>

      {/* Error Messages */}
      {(checkoutError || ledgerError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {checkoutError || ledgerError}
        </div>
      )}

      {/* Balance Display */}
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {balance?.balance.toLocaleString() ?? 0}
            <span className="text-lg ml-1">★</span>
          </p>
          {balance?.pendingPurchases != null && balance.pendingPurchases > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {balance.pendingPurchases} pending transaction(s)
            </p>
          )}
        </div>
        <button
          onClick={refreshBalance}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Refresh balance"
        >
          Refresh
        </button>
      </div>

      {/* Quick Purchase Packages */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Purchase Star Points
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STAR_POINT_PACKAGES.map((pkg) => {
            const isPurchasing = purchasingProduct === pkg.code || checkoutLoading;
            return (
              <button
                key={pkg.code}
                onClick={() => handlePurchase(pkg.code)}
                disabled={isPurchasing}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {pkg.points.toLocaleString()} ★
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(pkg.amountCents)}
                </span>
                {purchasingProduct === pkg.code && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Redirecting...
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Transactions
          </h4>
          {entries.length > 5 && (
            <Link
              href="/wallet/history"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all
            </Link>
          )}
        </div>

        {ledgerLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.reason}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getEntryTypeLabel(entry.entryType)} · {formatDate(entry.createdAt)}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    entry.pointsDelta >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {entry.pointsDelta >= 0 ? "+" : ""}
                  {entry.pointsDelta.toLocaleString()} ★
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
