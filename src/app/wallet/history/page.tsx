"use client";

import Link from "next/link";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useWalletLedger } from "@/hooks/use-wallet-ledger";

function formatDate(dateString: string, locale?: string): string {
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const DEFAULT_BADGE_COLOR = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400";

const ENTRY_TYPE_CONFIG: Record<string, { label: string; badgeColor: string }> = {
  CREDIT_PURCHASE: {
    label: "Purchase",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  DEBIT_REFUND: {
    label: "Refund",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  CREDIT_ADJUSTMENT: {
    label: "Bonus",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  DEBIT_SPEND: {
    label: "Spent",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  DEBIT_ADJUSTMENT: {
    label: "Adjustment",
    badgeColor: DEFAULT_BADGE_COLOR,
  },
};

function getEntryTypeLabel(entryType: string): string {
  return ENTRY_TYPE_CONFIG[entryType]?.label ?? entryType;
}

function getEntryTypeBadgeColor(entryType: string): string {
  return ENTRY_TYPE_CONFIG[entryType]?.badgeColor ?? DEFAULT_BADGE_COLOR;
}

export default function WalletHistoryPage() {
  const { balance, isLoading: balanceLoading } = useWalletBalance();
  const { entries, isLoading: ledgerLoading, error } = useWalletLedger();

  const isLoading = balanceLoading || ledgerLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All your Star Points transactions
            </p>
          </div>
          <Link
            href="/profile"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to Profile
          </Link>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Current Balance
          </p>
          {balanceLoading ? (
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              {balance?.balance.toLocaleString() ?? 0}
              <span className="text-2xl ml-1">★</span>
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Transaction List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Transactions
            </h2>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No transactions yet
              </p>
              <Link
                href="/profile#wallet"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm"
              >
                Purchase Star Points
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {entry.reason}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEntryTypeBadgeColor(
                            entry.entryType
                          )}`}
                        >
                          {getEntryTypeLabel(entry.entryType)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-lg font-semibold ml-4 ${
                        entry.pointsDelta >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {entry.pointsDelta >= 0 ? "+" : ""}
                      {entry.pointsDelta.toLocaleString()} ★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
