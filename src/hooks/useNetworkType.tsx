'use client';

import { useState, useEffect } from 'react';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export interface NetworkTypeResult {
  effectiveType: EffectiveConnectionType;
  isSupported: boolean;
}

/**
 * Hook to detect network connection type using Network Information API.
 * Falls back to 4g when API is unsupported.
 *
 * Used for adaptive SSE frequency in Phase 05 Plan 04.
 */
export function useNetworkType(): NetworkTypeResult {
  const [networkType, setNetworkType] = useState<NetworkTypeResult>({
    effectiveType: '4g',
    isSupported: false
  });

  useEffect(() => {
    // Check if Network Information API is supported
    const connection = (navigator as any).connection;

    if (!connection) {
      return;
    }

    // Set initial network type
    setNetworkType({
      effectiveType: connection.effectiveType || '4g',
      isSupported: true
    });

    // Listen for network changes
    const handleChange = () => {
      setNetworkType({
        effectiveType: connection.effectiveType || '4g',
        isSupported: true
      });
    };

    connection.addEventListener('change', handleChange);

    return () => {
      connection.removeEventListener('change', handleChange);
    };
  }, []);

  return networkType;
}
