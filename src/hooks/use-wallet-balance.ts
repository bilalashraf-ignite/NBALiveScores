"use client";

import { useState, useEffect, useCallback } from "react";
import type { StarPointBalance } from "@/types/user";

interface UseWalletBalanceResult {
  balance: StarPointBalance | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

export function useWalletBalance(): UseWalletBalanceResult {
  const [balance, setBalance] = useState<StarPointBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/star-points/balance");

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view your balance");
          return;
        }
        if (response.status === 403) {
          setError("Account access restricted");
          return;
        }
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refreshBalance: fetchBalance,
  };
}
