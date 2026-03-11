import type { League } from '@/types/sports-data';
import { cache } from '@/lib/cache';

/**
 * Base adapter class providing shared cache and error handling logic.
 * League-specific adapters extend this to avoid duplicating infrastructure code.
 *
 * This pattern ensures consistent caching and error handling across all league adapters,
 * reducing code duplication and ensuring uniform behavior.
 */
export abstract class BaseAdapter {
  /** League identifier for logging and error messages */
  protected abstract league: League;
  /** Base URL for the league's API */
  protected abstract baseUrl: string;

  /**
   * Fetch data with caching layer.
   * Tries cache first, falls back to provided fetch function.
   *
   * This implements a cache-first strategy that reduces API calls and improves
   * response times while ensuring fresh data when cache misses occur.
   *
   * @param cacheKey - Redis cache key
   * @param ttl - Time to live in seconds
   * @param fetchFn - Function that fetches data from API
   * @returns Fetched or cached data
   * @throws Error with league prefix if fetch fails
   */
  protected async fetchWithCache<T>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try cache first
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      console.log(`[${this.league}] Cache hit: ${cacheKey}`);
      return cached;
    }

    // Fetch from API
    try {
      console.log(`[${this.league}] Cache miss, fetching from API...`);
      const data = await fetchFn();
      await cache.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`[${this.league}] API fetch failed: ${message}`);
    }
  }

  /**
   * Handle errors with league context.
   * Adds league prefix to error messages for easier debugging.
   *
   * @param error - Error object or unknown error
   * @param context - Context string describing what operation failed
   * @throws Error with league prefix and context
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[${this.league}] ${context}: ${message}`);
  }
}
