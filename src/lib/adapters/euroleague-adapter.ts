import { BaseAdapter } from './base-adapter';
import type { Game, GameState, League } from '@/types/sports-data';
import type { SportsDataAdapter } from './sports-api-adapter';
import { CACHE_TTL, cache } from '@/lib/cache';

/**
 * Adapter for EuroLeague basketball games.
 * Uses official EuroLeague API at api-live.euroleague.net
 *
 * API: https://api-live.euroleague.net/swagger/index.html
 *
 * Phase 3: Returns mock data. Real API integration deferred until auth requirements verified.
 */
export class EuroLeagueAdapter extends BaseAdapter implements SportsDataAdapter {
  protected league: League = 'EuroLeague';
  protected baseUrl: string = 'https://api-live.euroleague.net';

  /**
   * Fetch all live EuroLeague games.
   *
   * Phase 3: Returns mock data for UI development and testing.
   * Real implementation will fetch from EuroLeague API and map to Game[] format.
   *
   * @param league - League identifier (should be "euroleague")
   * @returns Array of live EuroLeague games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    const cacheKey = cache.keys.liveGames('euroleague');
    return this.fetchWithCache(cacheKey, CACHE_TTL.LIVE_GAME, async () => {
      // Phase 3: Mock data (API integration deferred until auth requirements verified)
      // Real implementation: fetch from /v1/games endpoint, map to Game[]

      // Generate 1-2 mock EuroLeague games
      const mockGames: Game[] = [
        {
          id: 'euro-1',
          league: 'EuroLeague',
          homeTeam: {
            id: 'real',
            name: 'Real Madrid',
            abbreviation: 'RMB'
          },
          awayTeam: {
            id: 'barca',
            name: 'Barcelona',
            abbreviation: 'BAR'
          },
          score: { home: 85, away: 82 },
          state: 'final' as GameState,
          scheduledTime: new Date()
        },
        {
          id: 'euro-2',
          league: 'EuroLeague',
          homeTeam: {
            id: 'efes',
            name: 'Anadolu Efes',
            abbreviation: 'EFS'
          },
          awayTeam: {
            id: 'olympiacos',
            name: 'Olympiacos',
            abbreviation: 'OLY'
          },
          score: { home: 78, away: 74 },
          state: 'live' as GameState,
          scheduledTime: new Date(),
          period: 4,
          timeRemaining: '2:15'
        }
      ];

      return mockGames;
    });
  }

  /**
   * Fetch a single game by ID.
   *
   * Not implemented in Phase 3.
   *
   * @param gameId - Game identifier
   * @throws Error indicating not implemented
   */
  async getGame(gameId: string): Promise<Game> {
    throw new Error('getGame not implemented for EuroLeague adapter');
  }

  /**
   * Fetch scheduled games for a specific date.
   *
   * Not implemented in Phase 3.
   *
   * @param league - League identifier
   * @param date - Date to fetch games for
   * @returns Empty array
   */
  async getScheduledGames(league: string, date: Date): Promise<Game[]> {
    return [];
  }
}
