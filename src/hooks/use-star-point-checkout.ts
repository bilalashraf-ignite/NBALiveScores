"use client";

import { useState, useCallback } from "react";
import type { CheckoutSessionResponse } from "@/types/user";

interface UseStarPointCheckoutResult {
  isLoading: boolean;
  error: string | null;
  createCheckout: (productCode: string) => Promise<CheckoutSessionResponse | null>;
}

export function useStarPointCheckout(): UseStarPointCheckoutResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = useCallback(async (productCode: string): Promise<CheckoutSessionResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/wallet/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCode }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please sign in to purchase");
          return null;
        }
        if (response.status === 400) {
          setError("Invalid product selected");
          return null;
        }
        if (response.status === 403) {
          setError("Account access restricted");
          return null;
        }
        throw new Error("Failed to create checkout session");
      }

      const data: CheckoutSessionResponse = await response.json();

      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    createCheckout,
  };
}
