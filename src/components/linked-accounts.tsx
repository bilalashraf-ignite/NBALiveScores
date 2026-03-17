"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";

interface LinkedAccount {
  id: string;
  provider: string;
  providerAccountId: string;
}

interface AccountsData {
  accounts: LinkedAccount[];
  hasPassword: boolean;
}

const providerInfo: Record<string, { name: string; icon: React.ReactNode }> = {
  google: {
    name: "Google",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  facebook: {
    name: "Facebook",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
};

export function LinkedAccounts() {
  const [data, setData] = useState<AccountsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const accountsData = await response.json();
      setData(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleLink = async (provider: string) => {
    signIn(provider, { callbackUrl: "/profile" });
  };

  const handleUnlink = async (provider: string) => {
    if (!data) return;

    // Check safeguard
    const otherAccounts = data.accounts.filter((a) => a.provider !== provider);
    if (!data.hasPassword && otherAccounts.length === 0) {
      setError(
        "Cannot unlink this account. Set a password first or link another account."
      );
      return;
    }

    setUnlinking(provider);
    setError("");

    try {
      const response = await fetch(`/api/profile/accounts/${provider}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unlink account");
      }

      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink account");
    } finally {
      setUnlinking(null);
    }
  };

  const linkedProviders = data?.accounts.map((a) => a.provider) || [];
  const availableProviders = ["google", "facebook"].filter(
    (p) => !linkedProviders.includes(p)
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Connected Accounts
      </h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Linked accounts */}
        {data?.accounts.map((account) => {
          const info = providerInfo[account.provider];
          if (!info) return null;

          return (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                {info.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {info.name}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Connected
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUnlink(account.provider)}
                disabled={unlinking === account.provider}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              >
                {unlinking === account.provider ? "Unlinking..." : "Unlink"}
              </button>
            </div>
          );
        })}

        {/* Available to link */}
        {availableProviders.map((provider) => {
          const info = providerInfo[provider];
          if (!info) return null;

          return (
            <div
              key={provider}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                {info.icon}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {info.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Not connected
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleLink(provider)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Connect
              </button>
            </div>
          );
        })}
      </div>

      {!data?.hasPassword && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Tip: Set a password to ensure you can always access your account.
        </p>
      )}
    </div>
  );
}
