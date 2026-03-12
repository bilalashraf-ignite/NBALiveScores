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
        // Mock player stats: Real Madrid (home) vs Barcelona (away)
        playerStats: {
          home: [
            // Real Madrid starters
            {
              jerseyNumber: '7',
              lastName: 'Campazzo',
              firstName: 'Facundo',
              minutes: '32:45',
              points: 18,
              fieldGoals: { made: 7, attempted: 13 },
              threePointers: { made: 3, attempted: 7 },
              freeThrows: { made: 1, attempted: 2 },
              rebounds: 3,
              assists: 8,
              steals: 2,
              blocks: 0
            },
            {
              jerseyNumber: '13',
              lastName: 'Yabusele',
              firstName: 'Guerschon',
              minutes: '30:30',
              points: 16,
              fieldGoals: { made: 6, attempted: 12 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 2, attempted: 3 },
              rebounds: 9,
              assists: 2,
              steals: 1,
              blocks: 2
            },
            {
              jerseyNumber: '3',
              lastName: 'Hezonja',
              firstName: 'Mario',
              minutes: '28:20',
              points: 14,
              fieldGoals: { made: 5, attempted: 11 },
              threePointers: { made: 2, attempted: 6 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 5,
              assists: 3,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '23',
              lastName: 'Llull',
              firstName: 'Sergio',
              minutes: '26:15',
              points: 12,
              fieldGoals: { made: 4, attempted: 9 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 2, attempted: 3 },
              rebounds: 2,
              assists: 4,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '22',
              lastName: 'Tavares',
              firstName: 'Walter',
              minutes: '24:40',
              points: 10,
              fieldGoals: { made: 5, attempted: 8 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 1 },
              rebounds: 8,
              assists: 1,
              steals: 0,
              blocks: 2
            },
            // Real Madrid bench
            {
              jerseyNumber: '1',
              lastName: 'Causeur',
              firstName: 'Fabien',
              minutes: '18:25',
              points: 8,
              fieldGoals: { made: 3, attempted: 6 },
              threePointers: { made: 1, attempted: 3 },
              freeThrows: { made: 1, attempted: 1 },
              rebounds: 2,
              assists: 2,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '5',
              lastName: 'Rudy',
              firstName: 'Fernandez',
              minutes: '15:30',
              points: 5,
              fieldGoals: { made: 2, attempted: 5 },
              threePointers: { made: 0, attempted: 2 },
              freeThrows: { made: 1, attempted: 1 },
              rebounds: 3,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '9',
              lastName: 'Deck',
              firstName: 'Gabriel',
              minutes: '12:45',
              points: 2,
              fieldGoals: { made: 0, attempted: 3 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 1,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            // DNP
            {
              jerseyNumber: '10',
              lastName: 'Alocen',
              firstName: 'Carlos',
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
              jerseyNumber: '20',
              lastName: 'Ndiaye',
              firstName: 'Ibou',
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
            // Barcelona starters
            {
              jerseyNumber: '33',
              lastName: 'Mirotic',
              firstName: 'Nikola',
              minutes: '33:20',
              points: 21,
              fieldGoals: { made: 8, attempted: 15 },
              threePointers: { made: 3, attempted: 8 },
              freeThrows: { made: 2, attempted: 3 },
              rebounds: 7,
              assists: 2,
              steals: 1,
              blocks: 1
            },
            {
              jerseyNumber: '1',
              lastName: 'Satoransky',
              firstName: 'Tomas',
              minutes: '31:15',
              points: 15,
              fieldGoals: { made: 5, attempted: 10 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 3, attempted: 4 },
              rebounds: 4,
              assists: 7,
              steals: 2,
              blocks: 0
            },
            {
              jerseyNumber: '24',
              lastName: 'Laprovittola',
              firstName: 'Nicolas',
              minutes: '29:45',
              points: 13,
              fieldGoals: { made: 4, attempted: 9 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 3, attempted: 4 },
              rebounds: 3,
              assists: 5,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '44',
              lastName: 'Vesely',
              firstName: 'Jan',
              minutes: '27:30',
              points: 11,
              fieldGoals: { made: 5, attempted: 8 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 1, attempted: 2 },
              rebounds: 9,
              assists: 1,
              steals: 0,
              blocks: 2
            },
            {
              jerseyNumber: '9',
              lastName: 'Higgins',
              firstName: 'Cory',
              minutes: '26:10',
              points: 10,
              fieldGoals: { made: 3, attempted: 8 },
              threePointers: { made: 1, attempted: 3 },
              freeThrows: { made: 3, attempted: 3 },
              rebounds: 2,
              assists: 3,
              steals: 0,
              blocks: 0
            },
            // Barcelona bench
            {
              jerseyNumber: '23',
              lastName: 'Abrines',
              firstName: 'Alex',
              minutes: '19:45',
              points: 7,
              fieldGoals: { made: 3, attempted: 7 },
              threePointers: { made: 0, attempted: 3 },
              freeThrows: { made: 1, attempted: 1 },
              rebounds: 3,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '7',
              lastName: 'Paulí',
              firstName: 'Joel',
              minutes: '16:20',
              points: 3,
              fieldGoals: { made: 1, attempted: 4 },
              threePointers: { made: 0, attempted: 1 },
              freeThrows: { made: 1, attempted: 1 },
              rebounds: 4,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '14',
              lastName: 'Nnaji',
              firstName: 'Chimezie',
              minutes: '13:30',
              points: 2,
              fieldGoals: { made: 1, attempted: 3 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 1,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            // DNP
            {
              jerseyNumber: '11',
              lastName: 'Sanli',
              firstName: 'Sertac',
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
              jerseyNumber: '55',
              lastName: 'Parker',
              firstName: 'Jabari',
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
