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
        // Mock player stats: Duke (home) vs UNC (away)
        playerStats: {
          home: [
            // Duke starters
            {
              jerseyNumber: '5',
              lastName: 'Filipowski',
              firstName: 'Kyle',
              minutes: '32:15',
              points: 22,
              fieldGoals: { made: 8, attempted: 14 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 4, attempted: 6 },
              rebounds: 10,
              assists: 3,
              steals: 1,
              blocks: 2
            },
            {
              jerseyNumber: '2',
              lastName: 'Proctor',
              firstName: 'Tyrese',
              minutes: '30:45',
              points: 18,
              fieldGoals: { made: 7, attempted: 13 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 4,
              assists: 6,
              steals: 3,
              blocks: 0
            },
            {
              jerseyNumber: '15',
              lastName: 'Roach',
              firstName: 'Jeremy',
              minutes: '28:30',
              points: 14,
              fieldGoals: { made: 5, attempted: 10 },
              threePointers: { made: 2, attempted: 6 },
              freeThrows: { made: 2, attempted: 4 },
              rebounds: 3,
              assists: 4,
              steals: 2,
              blocks: 0
            },
            {
              jerseyNumber: '0',
              lastName: 'McCain',
              firstName: 'Jared',
              minutes: '26:20',
              points: 11,
              fieldGoals: { made: 4, attempted: 9 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 1, attempted: 2 },
              rebounds: 5,
              assists: 2,
              steals: 1,
              blocks: 1
            },
            {
              jerseyNumber: '1',
              lastName: 'Mitchell',
              firstName: 'Mark',
              minutes: '24:15',
              points: 7,
              fieldGoals: { made: 3, attempted: 6 },
              threePointers: { made: 0, attempted: 1 },
              freeThrows: { made: 1, attempted: 2 },
              rebounds: 7,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            // Duke bench
            {
              jerseyNumber: '11',
              lastName: 'Young',
              firstName: 'TJ',
              minutes: '16:45',
              points: 0,
              fieldGoals: { made: 0, attempted: 2 },
              threePointers: { made: 0, attempted: 1 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 1,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '12',
              lastName: 'Schutt',
              firstName: 'Ryan',
              minutes: '12:30',
              points: 0,
              fieldGoals: { made: 0, attempted: 1 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '3',
              lastName: 'Power',
              firstName: 'Sean',
              minutes: '8:15',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            // DNP
            {
              jerseyNumber: '4',
              lastName: 'Blakes',
              firstName: 'Jaylen',
              minutes: '0:00',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '23',
              lastName: 'Stewart',
              firstName: 'Caleb',
              minutes: '0:00',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            }
          ],
          away: [
            // UNC starters
            {
              jerseyNumber: '1',
              lastName: 'Bacot',
              firstName: 'Armando',
              minutes: '33:20',
              points: 20,
              fieldGoals: { made: 8, attempted: 14 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 4, attempted: 6 },
              rebounds: 12,
              assists: 2,
              steals: 1,
              blocks: 2
            },
            {
              jerseyNumber: '5',
              lastName: 'Cadeau',
              firstName: 'Elliot',
              minutes: '31:45',
              points: 16,
              fieldGoals: { made: 6, attempted: 11 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 2, attempted: 4 },
              rebounds: 3,
              assists: 7,
              steals: 2,
              blocks: 0
            },
            {
              jerseyNumber: '2',
              lastName: 'Davis',
              firstName: 'RJ',
              minutes: '29:30',
              points: 14,
              fieldGoals: { made: 5, attempted: 12 },
              threePointers: { made: 2, attempted: 6 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 5,
              assists: 3,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '4',
              lastName: 'Ingram',
              firstName: 'Harrison',
              minutes: '27:15',
              points: 11,
              fieldGoals: { made: 4, attempted: 10 },
              threePointers: { made: 1, attempted: 5 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 6,
              assists: 1,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '10',
              lastName: 'Trimble',
              firstName: 'Seth',
              minutes: '25:40',
              points: 7,
              fieldGoals: { made: 3, attempted: 8 },
              threePointers: { made: 1, attempted: 3 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 4,
              assists: 2,
              steals: 0,
              blocks: 0
            },
            // UNC bench
            {
              jerseyNumber: '3',
              lastName: 'Jackson',
              firstName: 'Cormac',
              minutes: '18:20',
              points: 0,
              fieldGoals: { made: 0, attempted: 2 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '14',
              lastName: 'Washington',
              firstName: 'Jalen',
              minutes: '14:45',
              points: 0,
              fieldGoals: { made: 0, attempted: 1 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '13',
              lastName: 'High',
              firstName: 'Zayden',
              minutes: '10:30',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            // DNP
            {
              jerseyNumber: '0',
              lastName: 'Withers',
              firstName: 'Jalen',
              minutes: '0:00',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '15',
              lastName: 'Wojcik',
              firstName: 'Jared',
              minutes: '0:00',
              points: 0,
              fieldGoals: { made: 0, attempted: 0 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            }
          ]
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
