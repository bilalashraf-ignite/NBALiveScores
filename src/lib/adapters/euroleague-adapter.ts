import { BaseAdapter } from './base-adapter';
import type { Game, GameState, League, GameDetails, TeamStats, PlayerStats, HistoricalMatchup } from '@/types/sports-data';
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

  /**
   * Fetch detailed game information including team stats, player stats, and historical matchup.
   *
   * Phase 4 Plan 01: Returns mock data. Real API integration deferred per CONTEXT.md locked decision.
   *
   * @param gameId - Game identifier
   * @param league - League identifier (must be 'EuroLeague')
   * @returns Promise resolving to detailed game information
   */
  async getGameDetails(gameId: string, league: League): Promise<GameDetails> {
    try {
      // Return mock GameDetails data for UI development
      const mockDetails: GameDetails = {
        gameId,
        league: 'EuroLeague',
        homeTeam: {
          id: 'real',
          name: 'Real Madrid',
          abbreviation: 'RMB',
          logoUrl: undefined
        },
        awayTeam: {
          id: 'barca',
          name: 'Barcelona',
          abbreviation: 'BAR',
          logoUrl: undefined
        },
        status: 'final' as GameState,
        score: {
          home: 85,
          away: 82
        },
        gameContext: {
          period: 4,
          timeRemaining: '0:00',
          possession: 'home'
        },
        teamFouls: {
          home: 5,
          away: 6
        },
        // Mock EuroLeague team stats: Real Madrid vs Barcelona final game
        teamStats: {
          home: {
            fieldGoals: { made: 32, attempted: 68, percentage: 47.1 },
            threePointers: { made: 10, attempted: 28, percentage: 35.7 },
            freeThrows: { made: 11, attempted: 15, percentage: 73.3 },
            assists: 18,
            turnovers: 9,
            reboundsOffensive: 7,
            reboundsDefensive: 26,
            reboundsTotal: 33,
            steals: 6,
            blocks: 4
          },
          away: {
            fieldGoals: { made: 30, attempted: 64, percentage: 46.9 },
            threePointers: { made: 8, attempted: 24, percentage: 33.3 },
            freeThrows: { made: 14, attempted: 18, percentage: 77.8 },
            assists: 16,
            turnovers: 11,
            reboundsOffensive: 5,
            reboundsDefensive: 28,
            reboundsTotal: 33,
            steals: 4,
            blocks: 3
          }
        },
        // Placeholder empty arrays - will be populated in Plan 03
        playerStats: {
          home: [],
          away: []
        },
        // Mock historical matchup data: Real Madrid vs Barcelona rivalry
        historicalMatchup: {
          lastFiveMeetings: [
            {
              date: '2026-03-08',
              homeTeam: 'Real Madrid',
              awayTeam: 'Barcelona',
              homeScore: 85,
              awayScore: 82,
              winner: 'home'
            },
            {
              date: '2026-02-12',
              homeTeam: 'Barcelona',
              awayTeam: 'Real Madrid',
              homeScore: 90,
              awayScore: 88,
              winner: 'home'
            },
            {
              date: '2025-12-20',
              homeTeam: 'Real Madrid',
              awayTeam: 'Barcelona',
              homeScore: 78,
              awayScore: 81,
              winner: 'away'
            },
            {
              date: '2025-11-05',
              homeTeam: 'Barcelona',
              awayTeam: 'Real Madrid',
              homeScore: 75,
              awayScore: 79,
              winner: 'away'
            },
            {
              date: '2025-10-15',
              homeTeam: 'Real Madrid',
              awayTeam: 'Barcelona',
              homeScore: 92,
              awayScore: 89,
              winner: 'home'
            }
          ],
          seasonSeries: {
            wins: 2,
            losses: 0,
            leader: 'away'
          },
          allTimeRecord: {
            wins: 98,
            losses: 85,
            leader: 'home'
          },
          averageCombinedPoints: 165
        }
      };

      return mockDetails;
    } catch (error) {
      this.handleError(error, 'fetching game details');
    }
  }
}
