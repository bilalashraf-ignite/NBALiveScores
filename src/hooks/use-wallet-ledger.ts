"use client";

import { useState, useEffect, useCallback } from "react";
import type { StarPointLedgerEntry } from "@/types/user";

interface UseWalletLedgerResult {
  entries: StarPointLedgerEntry[];
  isLoading: boolean;
  error: string | null;
  refreshLedger: () => Promise<void>;
}

export function useWalletLedger(): UseWalletLedgerResult {
  const [entries, setEntries] = useState<StarPointLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/star-points/ledger");

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to view transactions");
          return;
        }
        if (response.status === 403) {
          setError("Account access restricted");
          return;
        }
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      // Defensively validate response shape
      const items = data && Array.isArray(data.items) ? data.items : [];
      setEntries(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    entries,
    isLoading,
    error,
    refreshLedger: fetchLedger,
  };
}
