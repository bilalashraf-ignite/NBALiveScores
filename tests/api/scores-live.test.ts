/**
 * Tests for SSE live scores endpoint with multi-league support.
 *
 * Verifies:
 * - SSE headers are set correctly
 * - Stream returns properly formatted SSE data
 * - Parallel fetching from all three leagues (NBA, NCAA, EuroLeague)
 * - One league failure doesn't prevent others from loading
 * - Games from all leagues are combined in response
 * - Promise.allSettled used for fault tolerance
 */

import { GET } from '@/app/api/scores/live/route';
import { getAdapter } from '@/lib/adapters';
import { Game, GameState } from '@/types/sports-data';

// Mock getAdapter to return mock adapters
jest.mock('@/lib/adapters', () => ({
  getAdapter: jest.fn(),
}));

// Don't use fake timers - we need real async behavior for streams

const mockNBAGames: Game[] = [
  {
    id: 'nba-1',
    league: 'NBA',
    homeTeam: { id: '1', name: 'Lakers', abbreviation: 'LAL' },
    awayTeam: { id: '2', name: 'Warriors', abbreviation: 'GSW' },
    score: { home: 95, away: 88 },
    state: GameState.LIVE,
    scheduledTime: new Date('2026-03-11T19:00:00Z'),
    period: 3,
    timeRemaining: '5:32',
  },
];

const mockNCAAGames: Game[] = [
  {
    id: 'ncaa-1',
    league: 'NCAA',
    homeTeam: { id: 'duke', name: 'Duke', abbreviation: 'DUKE' },
    awayTeam: { id: 'unc', name: 'UNC', abbreviation: 'UNC' },
    score: { home: 72, away: 68 },
    state: GameState.LIVE,
    scheduledTime: new Date('2026-03-11T19:00:00Z'),
    period: 2,
    timeRemaining: '3:45',
  },
];

const mockEuroGames: Game[] = [
  {
    id: 'euro-1',
    league: 'EuroLeague',
    homeTeam: { id: 'real', name: 'Real Madrid', abbreviation: 'RMB' },
    awayTeam: { id: 'barca', name: 'Barcelona', abbreviation: 'BAR' },
    score: { home: 85, away: 82 },
    state: GameState.FINAL,
    scheduledTime: new Date('2026-03-11T19:00:00Z'),
  },
];

describe('GET /api/scores/live (multi-league)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup any open connections
  });

  it('should return SSE stream with correct headers', async () => {
    (getAdapter as jest.Mock).mockReturnValue({
      getLiveGames: jest.fn().mockResolvedValue([]),
    });

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should fetch from all three leagues in parallel', async () => {
    const mockAdapters = {
      NBA: { getLiveGames: jest.fn().mockResolvedValue(mockNBAGames) },
      NCAA: { getLiveGames: jest.fn().mockResolvedValue(mockNCAAGames) },
      EuroLeague: { getLiveGames: jest.fn().mockResolvedValue(mockEuroGames) },
    };

    (getAdapter as jest.Mock).mockImplementation((league) => mockAdapters[league]);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // Extract JSON from SSE format
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);

      // Verify all adapters were called
      expect(getAdapter).toHaveBeenCalledWith('NBA');
      expect(getAdapter).toHaveBeenCalledWith('NCAA');
      expect(getAdapter).toHaveBeenCalledWith('EuroLeague');
      expect(mockAdapters.NBA.getLiveGames).toHaveBeenCalledWith('NBA');
      expect(mockAdapters.NCAA.getLiveGames).toHaveBeenCalledWith('NCAA');
      expect(mockAdapters.EuroLeague.getLiveGames).toHaveBeenCalledWith('EuroLeague');

      // Verify combined games from all leagues
      expect(games).toHaveLength(3);
      expect(games).toEqual(expect.arrayContaining([
        expect.objectContaining({ league: 'NBA' }),
        expect.objectContaining({ league: 'NCAA' }),
        expect.objectContaining({ league: 'EuroLeague' }),
      ]));
    }
  });

  it('should handle partial failures gracefully (Promise.allSettled)', async () => {
    const mockAdapters = {
      NBA: { getLiveGames: jest.fn().mockResolvedValue(mockNBAGames) },
      NCAA: { getLiveGames: jest.fn().mockRejectedValue(new Error('NCAA API down')) },
      EuroLeague: { getLiveGames: jest.fn().mockResolvedValue(mockEuroGames) },
    };

    (getAdapter as jest.Mock).mockImplementation((league) => mockAdapters[league]);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);

      // Should contain games from NBA and EuroLeague (NCAA failed)
      expect(games).toHaveLength(2);
      expect(games).toEqual(expect.arrayContaining([
        expect.objectContaining({ league: 'NBA' }),
        expect.objectContaining({ league: 'EuroLeague' }),
      ]));

      // Verify NCAA was attempted despite failure
      expect(getAdapter).toHaveBeenCalledWith('NCAA');
      expect(mockAdapters.NCAA.getLiveGames).toHaveBeenCalled();
    }
  });

  it('should return combined games array with correct league fields', async () => {
    const mockAdapters = {
      NBA: { getLiveGames: jest.fn().mockResolvedValue(mockNBAGames) },
      NCAA: { getLiveGames: jest.fn().mockResolvedValue(mockNCAAGames) },
      EuroLeague: { getLiveGames: jest.fn().mockResolvedValue(mockEuroGames) },
    };

    (getAdapter as jest.Mock).mockImplementation((league) => mockAdapters[league]);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);

      // Verify each game has correct league field
      const nbaGame = games.find((g: Game) => g.id === 'nba-1');
      const ncaaGame = games.find((g: Game) => g.id === 'ncaa-1');
      const euroGame = games.find((g: Game) => g.id === 'euro-1');

      expect(nbaGame?.league).toBe('NBA');
      expect(ncaaGame?.league).toBe('NCAA');
      expect(euroGame?.league).toBe('EuroLeague');
    }
  });

  it('should return SSE formatted data', async () => {
    const mockAdapters = {
      NBA: { getLiveGames: jest.fn().mockResolvedValue(mockNBAGames) },
      NCAA: { getLiveGames: jest.fn().mockResolvedValue([]) },
      EuroLeague: { getLiveGames: jest.fn().mockResolvedValue([]) },
    };

    (getAdapter as jest.Mock).mockImplementation((league) => mockAdapters[league]);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // SSE format: data: <json>\n\n
      expect(text).toMatch(/^data: /);
      expect(text).toMatch(/\n\n$/);

      // Verify valid JSON
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      expect(() => JSON.parse(jsonStr)).not.toThrow();
    }
  });

  it('should handle all leagues failing gracefully', async () => {
    const mockAdapters = {
      NBA: { getLiveGames: jest.fn().mockRejectedValue(new Error('NBA error')) },
      NCAA: { getLiveGames: jest.fn().mockRejectedValue(new Error('NCAA error')) },
      EuroLeague: { getLiveGames: jest.fn().mockRejectedValue(new Error('Euro error')) },
    };

    (getAdapter as jest.Mock).mockImplementation((league) => mockAdapters[league]);

    const response = await GET();
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const { value } = await reader.read();
      const text = decoder.decode(value);

      // Should return empty array when all leagues fail
      const jsonStr = text.replace(/^data: /, '').replace(/\n\n$/, '');
      const games = JSON.parse(jsonStr);
      expect(games).toEqual([]);
    }
  });
});
