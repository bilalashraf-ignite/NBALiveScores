/**
 * Tests for SSE live scores endpoint.
 *
 * Verifies:
 * - SSE headers are set correctly
 * - Stream returns properly formatted SSE data
 * - Cache integration works
 * - Error handling returns empty array
 */

import { GET } from '@/app/api/scores/live/route';
import { adapter } from '@/lib/adapters';
import { cache, CACHE_TTL } from '@/lib/cache';
import { Game, GameState } from '@/types/sports-data';

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

// Don't use fake timers - we need real async behavior for streams

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

describe('GET /api/scores/live', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup any open connections
  });

  it('should return SSE stream with correct headers', async () => {
    (cache.get as jest.Mock).mockResolvedValue(mockGames);

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should fetch from cache first', async () => {
    (cache.get as jest.Mock).mockResolvedValue(mockGames);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const response = await GET();
    const reader = response.body?.getReader();

    // Read first chunk to trigger the generator
    if (reader) {
      const readPromise = reader.read();
      // Allow pending promises to resolve
      await Promise.resolve();
      await readPromise;
    }

    expect(cache.get).toHaveBeenCalledWith('games:live:nba');
    expect(adapter.getLiveGames).not.toHaveBeenCalled();
  });

  it('should fetch from adapter on cache miss and update cache', async () => {
    (cache.get as jest.Mock).mockResolvedValue(null);
    (adapter.getLiveGames as jest.Mock).mockResolvedValue(mockGames);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    // Read first chunk to trigger the generator
    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // Verify the data returned matches what adapter would provide
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);
      expect(games).toEqual(mockGames);

      // Verify cache was checked
      expect(cache.get).toHaveBeenCalledWith('games:live:nba');

      // Verify adapter was called due to cache miss
      expect(adapter.getLiveGames).toHaveBeenCalledWith('nba');

      // Verify cache was updated
      expect(cache.set).toHaveBeenCalledWith(
        'games:live:nba',
        mockGames,
        CACHE_TTL.LIVE_GAME
      );
    }
  });

  it('should return SSE formatted data', async () => {
    (cache.get as jest.Mock).mockResolvedValue(mockGames);
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // SSE format: data: <json>\n\n
      expect(text).toMatch(/^data: /);
      expect(text).toMatch(/\n\n$/);

      // Extract JSON and verify
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);
      expect(games).toEqual(mockGames);
    }
  });

  it('should handle errors gracefully', async () => {
    (cache.get as jest.Mock).mockRejectedValue(new Error('Cache error'));
    (adapter.getLiveGames as jest.Mock).mockRejectedValue(new Error('API error'));
    (cache.set as jest.Mock).mockResolvedValue(undefined);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // Should return empty array on error
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);
      expect(games).toEqual([]);
    }
  });
});
