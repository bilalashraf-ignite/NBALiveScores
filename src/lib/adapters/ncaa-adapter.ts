import { BaseAdapter } from './base-adapter';
import type { Game, GameState, League, GameDetails, TeamStats, PlayerStats, HistoricalMatchup } from '@/types/sports-data';
import type { SportsDataAdapter } from './sports-api-adapter';
import { CACHE_TTL, cache } from '@/lib/cache';

/**
 * Adapter for NCAA basketball games.
 * Uses henrygd/ncaa-api (5 req/sec limit) for free NCAA data.
 *
 * API: https://github.com/henrygd/ncaa-api
 * Rate limit: 5 requests/second
 *
 * Phase 3: Returns mock data. Real API integration deferred until keys configured.
 */
export class NcaaAdapter extends BaseAdapter implements SportsDataAdapter {
  protected league: League = 'NCAA';
  protected baseUrl: string = 'https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1';

  /**
   * Fetch all live NCAA games.
   *
   * Phase 3: Returns mock data for UI development and testing.
   * Real implementation will fetch from NCAA API and map to Game[] format.
   *
   * @param league - League identifier (should be "ncaa")
   * @returns Array of live NCAA games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    const cacheKey = cache.keys.liveGames('ncaa');
    return this.fetchWithCache(cacheKey, CACHE_TTL.LIVE_GAME, async () => {
      // Phase 3: Mock data (API integration deferred until keys configured)
      // Real implementation: fetch(this.baseUrl), parse JSON, map to Game[]

      // Generate 2-3 mock NCAA games
      const mockGames: Game[] = [
        {
          id: 'ncaa-1',
          league: 'NCAA',
          homeTeam: {
            id: 'duke',
            name: 'Duke Blue Devils',
            abbreviation: 'DUKE'
          },
          awayTeam: {
            id: 'unc',
            name: 'UNC Tar Heels',
            abbreviation: 'UNC'
          },
          score: { home: 72, away: 68 },
          state: 'live' as GameState,
          scheduledTime: new Date(),
          period: 2,
          timeRemaining: '3:45'
        },
        {
          id: 'ncaa-2',
          league: 'NCAA',
          homeTeam: {
            id: 'kentucky',
            name: 'Kentucky Wildcats',
            abbreviation: 'UK'
          },
          awayTeam: {
            id: 'louisville',
            name: 'Louisville Cardinals',
            abbreviation: 'LOU'
          },
          score: { home: 55, away: 51 },
          state: 'halftime' as GameState,
          scheduledTime: new Date(),
          period: 2
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
    throw new Error('getGame not implemented for NCAA adapter');
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
   * @param league - League identifier (must be 'NCAA')
   * @returns Promise resolving to detailed game information
   */
  async getGameDetails(gameId: string, league: League): Promise<GameDetails> {
    try {
      // Return mock GameDetails data for UI development
      const mockDetails: GameDetails = {
        gameId,
        league: 'NCAA',
        homeTeam: {
          id: 'duke',
          name: 'Duke Blue Devils',
          abbreviation: 'DUKE',
          logoUrl: undefined
        },
        awayTeam: {
          id: 'unc',
          name: 'UNC Tar Heels',
          abbreviation: 'UNC',
          logoUrl: undefined
        },
        status: 'live' as GameState,
        score: {
          home: 72,
          away: 68
        },
        gameContext: {
          period: 2,
          timeRemaining: '3:45',
          possession: 'away'
        },
        teamFouls: {
          home: 4,
          away: 3
        },
        // Mock NCAA team stats: Duke vs UNC live game
        teamStats: {
          home: {
            fieldGoals: { made: 28, attempted: 55, percentage: 50.9 },
            threePointers: { made: 8, attempted: 22, percentage: 36.4 },
            freeThrows: { made: 8, attempted: 12, percentage: 66.7 },
            assists: 15,
            turnovers: 11,
            reboundsOffensive: 6,
            reboundsDefensive: 24,
            reboundsTotal: 30,
            steals: 7,
            blocks: 3
          },
          away: {
            fieldGoals: { made: 26, attempted: 58, percentage: 44.8 },
            threePointers: { made: 6, attempted: 18, percentage: 33.3 },
            freeThrows: { made: 10, attempted: 14, percentage: 71.4 },
            assists: 13,
            turnovers: 14,
            reboundsOffensive: 8,
            reboundsDefensive: 22,
            reboundsTotal: 30,
            steals: 5,
            blocks: 2
          }
        },
        // Placeholder empty arrays - will be populated in Plan 03
        playerStats: {
          home: [],
          away: []
        },
        // Mock historical matchup data: Duke vs UNC rivalry
        historicalMatchup: {
          lastFiveMeetings: [
            {
              date: '2026-02-22',
              homeTeam: 'Duke Blue Devils',
              awayTeam: 'UNC Tar Heels',
              homeScore: 78,
              awayScore: 80,
              winner: 'away'
            },
            {
              date: '2026-01-18',
              homeTeam: 'UNC Tar Heels',
              awayTeam: 'Duke Blue Devils',
              homeScore: 72,
              awayScore: 75,
              winner: 'away'
            },
            {
              date: '2025-12-05',
              homeTeam: 'Duke Blue Devils',
              awayTeam: 'UNC Tar Heels',
              homeScore: 82,
              awayScore: 77,
              winner: 'home'
            },
            {
              date: '2025-03-15',
              homeTeam: 'UNC Tar Heels',
              awayTeam: 'Duke Blue Devils',
              homeScore: 68,
              awayScore: 70,
              winner: 'away'
            },
            {
              date: '2025-02-08',
              homeTeam: 'Duke Blue Devils',
              awayTeam: 'UNC Tar Heels',
              homeScore: 73,
              awayScore: 69,
              winner: 'home'
            }
          ],
          seasonSeries: {
            wins: 1,
            losses: 1,
            leader: 'tied'
          },
          allTimeRecord: {
            wins: 145,
            losses: 115,
            leader: 'away'
          },
          averageCombinedPoints: 150
        }
      };

      return mockDetails;
    } catch (error) {
      this.handleError(error, 'fetching game details');
    }
  }
}
