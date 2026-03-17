/**
 * Custom React hook for managing Server-Sent Events (SSE) connections.
 *
 * Handles EventSource lifecycle including connection, reconnection, and cleanup.
 * Critical: Cleanup on unmount prevents memory leaks from orphaned connections.
 *
 * Pattern source: RESEARCH.md Pattern 2 (verified against OneUptime guide Jan 2026)
 * Prevents Pitfall 1: Missing cleanup causes memory leaks
 *
 * @example
 * ```tsx
 * const { data, isConnected, error, reconnect } = useSSE<Game[]>({
 *   url: '/api/scores/live',
 *   enabled: true
 * });
 * ```
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNetworkType } from './useNetworkType';
import { sseLogger } from '@/lib/client-logger';

export interface UseSSEOptions {
  /** URL of the SSE endpoint to connect to */
  url: string;
  /** Whether the connection should be active (default: true) */
  enabled?: boolean;
  /** Enable adaptive frequency based on network type (default: false) */
  adaptiveFrequency?: boolean;
}

export interface UseSSEReturn<T> {
  /** Parsed data from the most recent SSE message */
  data: T | null;
  /** Whether the connection is currently open */
  isConnected: boolean;
  /** Error object if connection fails or data parsing fails */
  error: Error | null;
  /** Function to manually reconnect */
  reconnect: () => void;
}

/**
 * Hook to manage an SSE connection with automatic cleanup.
 *
 * Adaptive frequency reduces bandwidth on cellular connections:
 * - WiFi/4G: 10 second updates (baseline)
 * - 2G/3G: 20 second updates (50% reduction)
 * - Detects network changes and adjusts immediately
 *
 * @template T - The type of data expected from the SSE endpoint
 * @param options - Configuration for the SSE connection
 * @returns Connection state and controls
 */
export function useSSE<T>(options: UseSSEOptions): UseSSEReturn<T> {
  const { url, enabled = true, adaptiveFrequency = false } = options;

  const { effectiveType } = useNetworkType();

  // Calculate update frequency based on network
  const frequency = useMemo(() => {
    if (!adaptiveFrequency) return 10000; // Default 10s

    // Cellular (2G/3G): 20s (50% reduction)
    if (['slow-2g', '2g', '3g'].includes(effectiveType)) {
      return 20000;
    }

    // WiFi/4G: 10s
    return 10000;
  }, [adaptiveFrequency, effectiveType]);

  // State management
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref to hold EventSource instance (persists across renders)
  const eventSourceRef = useRef<EventSource | null>(null);

  /**
   * Connect to the SSE endpoint.
   * Sets up event handlers for open, message, and error events.
   */
  const connect = useCallback(() => {
    // Don't connect if disabled
    if (!enabled) {
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`${url}?frequency=${frequency}`);
      eventSourceRef.current = eventSource;

      // Connection opened successfully
      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      // Message received
      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data) as T;
          setData(parsedData);
        } catch (parseError) {
          sseLogger.error({ err: parseError }, 'Failed to parse SSE data');
          setError(new Error('Failed to parse SSE data'));
        }
      };

      // Connection error or closed
      eventSource.onerror = () => {
        setIsConnected(false);
        setError(new Error('SSE connection failed'));
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [url, enabled, frequency]);

  /**
   * Manually reconnect to the SSE endpoint.
   * Closes existing connection and creates a new one.
   */
  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    connect();
  }, [connect]);

  // Connect on mount or when dependencies change
  useEffect(() => {
    connect();

    // CRITICAL: Cleanup function to prevent memory leaks
    // EventSource connections persist after unmount without this
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    data,
    isConnected,
    error,
    reconnect,
  };
}
