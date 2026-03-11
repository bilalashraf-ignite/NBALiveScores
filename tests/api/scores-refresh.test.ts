/**
 * Tests for manual refresh endpoint.
 *
 * Verifies:
 * - Cache invalidation and refresh
 * - Fresh data fetch from adapter
 * - Error handling with cache fallback
 * - Response format
 */

import { POST } from '@/app/api/scores/refresh/route';
import { adapter } from '@/lib/adapters';
import { cache, CACHE_TTL } from '@/lib/cache';
import { Game, GameState } from '@/types/sports-data';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/adapters', () => ({
  adapter: {
    getLiveGames: jest.fn(),
  },
}));

jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: {
      liveGames: (league: string) => `games:live:${league}`,
    },
  },
  CACHE_TTL: {
    LIVE_GAME: 10,
  },
}));

const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: {
      id: '1',
      name: 'Lakers',
      abbreviation: 'LAL',
    },
    awayTeam: {
      id: '2',
      name: 'Warriors',
      abbreviation: 'GSW',
    },
    score: {
      home: 95,
      away: 88,
    },
    state: GameState.LIVE,
    scheduledTime: new Date('2026-03-11T19:00:00Z'),
    period: 3,
    timeRemaining: '5:32',
  },
];

// Helper to create mock request
function createMockRequest(body?: any): NextRequest {
  return {
    json: async () => body || {},
  } as NextRequest;
}

describe('POST /api/scores/refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch fresh data and update cache', async () => {
    (adapter.getLiveGames as jest.Mock).mockResolvedValue(mockGames);
    (cache.del as jest.Mock).mockResolvedValue(undefined);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const request = createMockRequest({ league: 'nba' });
    const response = await POST(request);
    const data = await response.json();

    expect(adapter.getLiveGames).toHaveBeenCalledWith('nba');
    expect(cache.del).toHaveBeenCalledWith('games:live:nba');
    expect(cache.set).toHaveBeenCalledWith(
      'games:live:nba',
      mockGames,
      CACHE_TTL.LIVE_GAME
    );

    expect(data.success).toBe(true);
    expect(data.games).toEqual(mockGames);
    expect(data.timestamp).toBeDefined();
  });

  it('should default to nba league when not specified', async () => {
    (adapter.getLiveGames as jest.Mock).mockResolvedValue(mockGames);
    (cache.del as jest.Mock).mockResolvedValue(undefined);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const request = createMockRequest();
    await POST(request);

    expect(adapter.getLiveGames).toHaveBeenCalledWith('nba');
    expect(cache.del).toHaveBeenCalledWith('games:live:nba');
  });

  it('should handle invalid request body gracefully', async () => {
    (adapter.getLiveGames as jest.Mock).mockResolvedValue(mockGames);
    (cache.del as jest.Mock).mockResolvedValue(undefined);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const request = {
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed with default league
    expect(data.success).toBe(true);
    expect(adapter.getLiveGames).toHaveBeenCalledWith('nba');
  });

  it('should return cached data when adapter fails', async () => {
    (adapter.getLiveGames as jest.Mock).mockRejectedValue(new Error('API error'));
    (cache.get as jest.Mock).mockResolvedValue(mockGames);

    const request = createMockRequest({ league: 'nba' });
    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.games).toEqual(mockGames);
    expect(data.cached).toBe(true);
    expect(response.status).toBe(200);
  });

  it('should return error when both adapter and cache fail', async () => {
    (adapter.getLiveGames as jest.Mock).mockRejectedValue(new Error('API error'));
    (cache.get as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({ league: 'nba' });
    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('Unable to refresh scores. Please try again.');
    expect(response.status).toBe(500);
  });

  it('should handle cache errors during fallback', async () => {
    (adapter.getLiveGames as jest.Mock).mockRejectedValue(new Error('API error'));
    (cache.get as jest.Mock).mockRejectedValue(new Error('Cache error'));

    const request = createMockRequest({ league: 'nba' });
    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('Unable to refresh scores. Please try again.');
    expect(response.status).toBe(500);
  });

  it('should clear cache before updating', async () => {
    (adapter.getLiveGames as jest.Mock).mockResolvedValue(mockGames);
    (cache.del as jest.Mock).mockResolvedValue(undefined);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const request = createMockRequest({ league: 'nba' });
    await POST(request);

    // Verify cache.del was called before cache.set
    expect(cache.del).toHaveBeenCalledBefore(cache.set as jest.Mock);
  });
});

// Helper matcher for call order
expect.extend({
  toHaveBeenCalledBefore(received, other) {
    const receivedCalls = (received as jest.Mock).mock.invocationCallOrder;
    const otherCalls = (other as jest.Mock).mock.invocationCallOrder;

    const pass =
      receivedCalls.length > 0 &&
      otherCalls.length > 0 &&
      receivedCalls[0] < otherCalls[0];

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be called before ${other}`
          : `expected ${received} to be called before ${other}`,
    };
  },
});
