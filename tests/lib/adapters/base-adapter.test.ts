/**
 * Tests for BaseAdapter shared logic.
 *
 * Verifies:
 * - Cache-first fetching strategy
 * - Cache updates on successful fetch
 * - Error handling with league prefixes
 * - Error propagation from fetch functions
 */

import { BaseAdapter } from '@/lib/adapters/base-adapter';
import { cache, CACHE_TTL } from '@/lib/cache';
import type { Game, League } from '@/types/sports-data';

// Mock cache module
jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    keys: {
      liveGames: (league: string) => `games:live:${league}`,
    },
  },
  CACHE_TTL: {
    LIVE_GAME: 10,
  },
}));

// Concrete implementation for testing
class TestAdapter extends BaseAdapter {
  protected league: League = 'NBA';
  protected baseUrl: string = 'https://test.api.com';

  // Expose protected method for testing
  public async testFetchWithCache<T>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    return this.fetchWithCache(cacheKey, ttl, fetchFn);
  }

  // Expose protected method for testing
  public testHandleError(error: unknown, context: string): never {
    return this.handleError(error, context);
  }
}

describe('BaseAdapter', () => {
  let adapter: TestAdapter;

  beforeEach(() => {
    adapter = new TestAdapter();
    jest.clearAllMocks();
  });

  describe('fetchWithCache', () => {
    it('should return cached data on cache hit', async () => {
      const mockData = { test: 'data' };
      const cacheKey = 'test-key';
      const mockFetchFn = jest.fn();

      (cache.get as jest.Mock).mockResolvedValue(mockData);

      const result = await adapter.testFetchWithCache(
        cacheKey,
        CACHE_TTL.LIVE_GAME,
        mockFetchFn
      );

      expect(result).toEqual(mockData);
      expect(cache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockFetchFn).not.toHaveBeenCalled();
      expect(cache.set).not.toHaveBeenCalled();
    });

    it('should call fetch function on cache miss', async () => {
      const mockData = { test: 'data' };
      const cacheKey = 'test-key';
      const mockFetchFn = jest.fn().mockResolvedValue(mockData);

      (cache.get as jest.Mock).mockResolvedValue(null);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await adapter.testFetchWithCache(
        cacheKey,
        CACHE_TTL.LIVE_GAME,
        mockFetchFn
      );

      expect(result).toEqual(mockData);
      expect(cache.get).toHaveBeenCalledWith(cacheKey);
      expect(mockFetchFn).toHaveBeenCalled();
    });

    it('should set cache on successful fetch', async () => {
      const mockData = { test: 'data' };
      const cacheKey = 'test-key';
      const ttl = CACHE_TTL.LIVE_GAME;
      const mockFetchFn = jest.fn().mockResolvedValue(mockData);

      (cache.get as jest.Mock).mockResolvedValue(null);
      (cache.set as jest.Mock).mockResolvedValue(undefined);

      await adapter.testFetchWithCache(cacheKey, ttl, mockFetchFn);

      expect(cache.set).toHaveBeenCalledWith(cacheKey, mockData, ttl);
    });

    it('should throw error with league prefix on fetch failure', async () => {
      const cacheKey = 'test-key';
      const mockFetchFn = jest.fn().mockRejectedValue(new Error('API error'));

      (cache.get as jest.Mock).mockResolvedValue(null);

      await expect(
        adapter.testFetchWithCache(cacheKey, CACHE_TTL.LIVE_GAME, mockFetchFn)
      ).rejects.toThrow('[NBA] API fetch failed: API error');
    });

    it('should propagate errors from fetch function', async () => {
      const cacheKey = 'test-key';
      const mockFetchFn = jest.fn().mockRejectedValue(new Error('Network timeout'));

      (cache.get as jest.Mock).mockResolvedValue(null);

      await expect(
        adapter.testFetchWithCache(cacheKey, CACHE_TTL.LIVE_GAME, mockFetchFn)
      ).rejects.toThrow('[NBA] API fetch failed: Network timeout');
    });
  });

  describe('handleError', () => {
    it('should throw error with league prefix and context', () => {
      const error = new Error('Test error');

      expect(() => {
        adapter.testHandleError(error, 'fetching games');
      }).toThrow('[NBA] fetching games: Test error');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';

      expect(() => {
        adapter.testHandleError(error, 'unknown operation');
      }).toThrow('[NBA] unknown operation: Unknown error');
    });
  });
});
