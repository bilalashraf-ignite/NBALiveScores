import { Game, GameState, Team, Score, League, GameDetails, TeamStats, PlayerStats, HistoricalMatchup } from '@/types/sports-data';
import { SportsDataAdapter } from './sports-api-adapter';
import { BaseAdapter } from './base-adapter';

/**
 * Adapter for balldontlie.io API (free NBA data provider).
 *
 * This implementation maps balldontlie.io's response format to our normalized
 * domain types, enabling easy swapping to different providers.
 *
 * API Documentation: https://docs.balldontlie.io/
 *
 * Note: Phase 1 implementation returns mock data. Network calls will be added
 * in Phase 2 after API key configuration is established.
 */
export class BalldontlieAdapter extends BaseAdapter implements SportsDataAdapter {
  protected league: League = 'NBA';
  protected baseUrl: string = 'https://api.balldontlie.io/v1';
  private readonly apiKey: string;

  /**
   * Create a new balldontlie.io adapter.
   * @param apiKey - API key from balldontlie.io (required for production use)
   */
  constructor(apiKey: string = process.env.BALLDONTLIE_API_KEY || '') {
    super();
    this.apiKey = apiKey;
  }

  /**
   * Fetch all live NBA games.
   *
   * Note: Phase 2 returns mock data. Real API calls will be added in Phase 3.
   *
   * @param league - League identifier (only "nba" supported by balldontlie.io)
   * @returns Array of live games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    try {
      // Phase 2: Return mock data for UI development
      // Phase 3: Implement actual HTTP fetch to /games endpoint with live filter

      // Generate mock games with various states
      const states = [GameState.LIVE, GameState.HALFTIME, GameState.FINAL, GameState.SCHEDULED];
      const mockGames: Game[] = [];

      for (let i = 0; i < 8; i++) {
        const state = states[i % states.length];
        const homeScore = Math.floor(Math.random() * 40) + 80;
        const awayScore = Math.floor(Math.random() * 40) + 80;

        mockGames.push({
          id: `game-${i}`,
          league: 'NBA',
          homeTeam: {
            id: `team-home-${i}`,
            name: `Home Team ${i}`,
            abbreviation: `HT${i}`,
            logoUrl: undefined
          },
          awayTeam: {
            id: `team-away-${i}`,
            name: `Away Team ${i}`,
            abbreviation: `AT${i}`,
            logoUrl: undefined
          },
          score: { home: homeScore, away: awayScore },
          state: state,
          scheduledTime: new Date(Date.now() - 3600000),
          period: state === GameState.LIVE || state === GameState.HALFTIME
            ? Math.floor(Math.random() * 4) + 1
            : undefined,
          timeRemaining: state === GameState.LIVE ? '8:42' : undefined,
          possession: state === GameState.LIVE
            ? (Math.random() > 0.5 ? 'home' : 'away')
            : undefined,
          teamFouls: state === GameState.LIVE || state === GameState.HALFTIME
            ? { home: Math.floor(Math.random() * 7), away: Math.floor(Math.random() * 7) }
            : undefined
        });
      }

      return mockGames;
    } catch (error) {
      console.error('Failed to fetch live games from balldontlie.io:', error);
      return []; // Graceful degradation
    }
  }

  /**
   * Fetch a single game by ID.
   *
   * Note: Phase 1 throws error. Implementation will be added in Phase 2.
   *
   * @param gameId - Game identifier
   * @returns Game data
   * @throws Error if game not found
   */
  async getGame(gameId: string): Promise<Game> {
    try {
      // Phase 1: Throw error (no network calls yet)
      // Phase 2: Implement actual HTTP fetch to /games/{id} endpoint
      // const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
      //   headers: { 'Authorization': this.apiKey }
      // });
      // const data = await response.json();
      // return this.mapToGame(data);

      throw new Error(`Game ${gameId} not found (Phase 1: network calls not implemented)`);
    } catch (error) {
      console.error('Failed to fetch game from balldontlie.io:', error);
      throw error;
    }
  }

  /**
   * Fetch scheduled games for a specific date.
   *
   * Note: Phase 1 returns empty array. Implementation will be added in Phase 2.
   *
   * @param league - League identifier (only "nba" supported)
   * @param date - Date to fetch games for (UTC)
   * @returns Array of scheduled games
   */
  async getScheduledGames(league: string, date: Date): Promise<Game[]> {
    try {
      // Phase 1: Return empty array (no network calls yet)
      // Phase 2: Implement actual HTTP fetch with date filter
      // const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      // const response = await fetch(`${this.baseUrl}/games?date=${dateStr}`, {
      //   headers: { 'Authorization': this.apiKey }
      // });
      // const data = await response.json();
      // return data.data.filter(g => g.status === 'scheduled').map(this.mapToGame);

      return [];
    } catch (error) {
      console.error('Failed to fetch scheduled games from balldontlie.io:', error);
      return []; // Graceful degradation
    }
  }

  /**
   * Map balldontlie.io API response to our normalized Game type.
   *
   * Handles API quirks:
   * - balldontlie.io uses separate home_team/visitor_team objects
   * - Status field needs mapping to our GameState enum
   * - Time fields are in UTC but may need parsing
   * - Some fields may be null/undefined and need defaults
   *
   * @param apiResponse - Raw API response object
   * @returns Normalized Game object
   */
  private mapToGame(apiResponse: any): Game {
    // Phase 2: Implement actual mapping logic based on API response format
    // This is a placeholder showing the expected structure

    const homeTeam: Team = {
      id: String(apiResponse.home_team?.id || ''),
      name: apiResponse.home_team?.full_name || '',
      abbreviation: apiResponse.home_team?.abbreviation || '',
      logoUrl: undefined // balldontlie.io doesn't provide logos
    };

    const awayTeam: Team = {
      id: String(apiResponse.visitor_team?.id || ''),
      name: apiResponse.visitor_team?.full_name || '',
      abbreviation: apiResponse.visitor_team?.abbreviation || '',
      logoUrl: undefined
    };

    const score: Score = {
      home: apiResponse.home_team_score || 0,
      away: apiResponse.visitor_team_score || 0
    };

    // Map API status to our GameState enum
    const state = this.mapStatus(apiResponse.status);

    // Parse scheduled time (ensure UTC)
    const scheduledTime = new Date(apiResponse.date);

    return {
      id: String(apiResponse.id),
      league: 'NBA',
      homeTeam,
      awayTeam,
      score,
      state,
      scheduledTime,
      period: apiResponse.period || undefined,
      timeRemaining: apiResponse.time || undefined,
      possession: undefined // balldontlie.io doesn't provide possession data
    };
  }

  /**
   * Map balldontlie.io status string to our GameState enum.
   *
   * @param status - API status string
   * @returns Normalized GameState
   */
  private mapStatus(status: string): GameState {
    // balldontlie.io status values (from their docs):
    // - "scheduled" -> SCHEDULED
    // - "in progress" -> LIVE
    // - "halftime" -> HALFTIME
    // - "final" -> FINAL
    // - "postponed" -> POSTPONED
    // - "cancelled" -> CANCELLED

    switch (status?.toLowerCase()) {
      case 'scheduled':
        return GameState.SCHEDULED;
      case 'in progress':
        return GameState.LIVE;
      case 'halftime':
        return GameState.HALFTIME;
      case 'final':
        return GameState.FINAL;
      case 'postponed':
        return GameState.POSTPONED;
      case 'cancelled':
        return GameState.CANCELLED;
      default:
        return GameState.SCHEDULED; // Default fallback
    }
  }

  /**
   * Fetch detailed game information including team stats, player stats, and historical matchup.
   *
   * Note: Phase 4 Plan 01 returns mock data. Real API integration deferred per CONTEXT.md locked decision.
   *
   * @param gameId - Game identifier
   * @param league - League identifier (must be 'NBA')
   * @returns Promise resolving to detailed game information
   */
  async getGameDetails(gameId: string, league: League): Promise<GameDetails> {
    try {
      // Return mock GameDetails data for UI development
      // Real API integration will be added when API keys are configured

      const mockDetails: GameDetails = {
        gameId,
        league: 'NBA',
        homeTeam: {
          id: 'team-lal',
          name: 'Los Angeles Lakers',
          abbreviation: 'LAL',
          logoUrl: undefined
        },
        awayTeam: {
          id: 'team-bos',
          name: 'Boston Celtics',
          abbreviation: 'BOS',
          logoUrl: undefined
        },
        status: GameState.LIVE,
        score: {
          home: 98,
          away: 95
        },
        gameContext: {
          period: 3,
          timeRemaining: '8:42',
          possession: 'home'
        },
        teamFouls: {
          home: 3,
          away: 2
        },
        // Mock NBA team stats: Lakers vs Celtics live game
        teamStats: {
          home: {
            fieldGoals: { made: 38, attempted: 82, percentage: 46.3 },
            threePointers: { made: 12, attempted: 35, percentage: 34.3 },
            freeThrows: { made: 18, attempted: 22, percentage: 81.8 },
            assists: 8,
            turnovers: 12,
            reboundsOffensive: 10,
            reboundsDefensive: 28,
            reboundsTotal: 38,
            steals: 6,
            blocks: 5
          },
          away: {
            fieldGoals: { made: 42, attempted: 88, percentage: 47.7 },
            threePointers: { made: 15, attempted: 38, percentage: 39.5 },
            freeThrows: { made: 14, attempted: 18, percentage: 77.8 },
            assists: 12,
            turnovers: 10,
            reboundsOffensive: 8,
            reboundsDefensive: 32,
            reboundsTotal: 40,
            steals: 8,
            blocks: 6
          }
        },
        // Mock player stats: Lakers (home) vs Celtics (away)
        playerStats: {
          home: [
            // Lakers starters
            {
              jerseyNumber: '23',
              lastName: 'James',
              firstName: 'LeBron',
              minutes: '35:24',
              points: 28,
              fieldGoals: { made: 10, attempted: 18 },
              threePointers: { made: 2, attempted: 6 },
              freeThrows: { made: 6, attempted: 8 },
              rebounds: 8,
              assists: 10,
              steals: 2,
              blocks: 1
            },
            {
              jerseyNumber: '3',
              lastName: 'Davis',
              firstName: 'Anthony',
              minutes: '33:15',
              points: 24,
              fieldGoals: { made: 9, attempted: 16 },
              threePointers: { made: 0, attempted: 2 },
              freeThrows: { made: 6, attempted: 8 },
              rebounds: 12,
              assists: 3,
              steals: 1,
              blocks: 3
            },
            {
              jerseyNumber: '1',
              lastName: 'Russell',
              firstName: "D'Angelo",
              minutes: '28:45',
              points: 15,
              fieldGoals: { made: 6, attempted: 14 },
              threePointers: { made: 3, attempted: 8 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 3,
              assists: 6,
              steals: 1,
              blocks: 0
            },
            {
              jerseyNumber: '28',
              lastName: 'Hachimura',
              firstName: 'Rui',
              minutes: '26:30',
              points: 12,
              fieldGoals: { made: 5, attempted: 10 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 5,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '15',
              lastName: 'Christie',
              firstName: 'Max',
              minutes: '24:12',
              points: 8,
              fieldGoals: { made: 3, attempted: 7 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 4,
              assists: 2,
              steals: 1,
              blocks: 0
            },
            // Lakers bench players
            {
              jerseyNumber: '5',
              lastName: 'Reaves',
              firstName: 'Austin',
              minutes: '18:30',
              points: 6,
              fieldGoals: { made: 2, attempted: 6 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 0, attempted: 2 },
              rebounds: 2,
              assists: 3,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '4',
              lastName: 'Redick',
              firstName: 'JJ',
              minutes: '15:45',
              points: 3,
              fieldGoals: { made: 1, attempted: 4 },
              threePointers: { made: 1, attempted: 3 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 1,
              assists: 1,
              steals: 1,
              blocks: 1
            },
            {
              jerseyNumber: '10',
              lastName: 'Hayes',
              firstName: 'Jaxson',
              minutes: '12:20',
              points: 2,
              fieldGoals: { made: 1, attempted: 3 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 3,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '7',
              lastName: 'Knecht',
              firstName: 'Dalton',
              minutes: '8:15',
              points: 0,
              fieldGoals: { made: 0, attempted: 2 },
              threePointers: { made: 0, attempted: 2 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 0,
              assists: 0,
              steals: 0,
              blocks: 0
            },
            // DNP player
            {
              jerseyNumber: '8',
              lastName: 'Reddish',
              firstName: 'Cam',
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
              jerseyNumber: '35',
              lastName: 'Castleton',
              firstName: 'Colin',
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
            // Celtics starters
            {
              jerseyNumber: '0',
              lastName: 'Tatum',
              firstName: 'Jayson',
              minutes: '36:15',
              points: 32,
              fieldGoals: { made: 12, attempted: 22 },
              threePointers: { made: 4, attempted: 10 },
              freeThrows: { made: 4, attempted: 6 },
              rebounds: 9,
              assists: 5,
              steals: 2,
              blocks: 1
            },
            {
              jerseyNumber: '7',
              lastName: 'Brown',
              firstName: 'Jaylen',
              minutes: '34:20',
              points: 22,
              fieldGoals: { made: 8, attempted: 16 },
              threePointers: { made: 3, attempted: 7 },
              freeThrows: { made: 3, attempted: 4 },
              rebounds: 6,
              assists: 4,
              steals: 2,
              blocks: 0
            },
            {
              jerseyNumber: '9',
              lastName: 'Holiday',
              firstName: 'Jrue',
              minutes: '30:45',
              points: 14,
              fieldGoals: { made: 5, attempted: 11 },
              threePointers: { made: 2, attempted: 5 },
              freeThrows: { made: 2, attempted: 2 },
              rebounds: 4,
              assists: 7,
              steals: 3,
              blocks: 0
            },
            {
              jerseyNumber: '8',
              lastName: 'Porzingis',
              firstName: 'Kristaps',
              minutes: '28:30',
              points: 16,
              fieldGoals: { made: 6, attempted: 13 },
              threePointers: { made: 3, attempted: 7 },
              freeThrows: { made: 1, attempted: 2 },
              rebounds: 8,
              assists: 2,
              steals: 0,
              blocks: 3
            },
            {
              jerseyNumber: '11',
              lastName: 'White',
              firstName: 'Derrick',
              minutes: '27:15',
              points: 11,
              fieldGoals: { made: 4, attempted: 9 },
              threePointers: { made: 3, attempted: 6 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 3,
              assists: 5,
              steals: 1,
              blocks: 1
            },
            // Celtics bench players
            {
              jerseyNumber: '13',
              lastName: 'Horford',
              firstName: 'Al',
              minutes: '20:45',
              points: 8,
              fieldGoals: { made: 3, attempted: 7 },
              threePointers: { made: 2, attempted: 4 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 6,
              assists: 2,
              steals: 0,
              blocks: 1
            },
            {
              jerseyNumber: '30',
              lastName: 'Hauser',
              firstName: 'Sam',
              minutes: '16:30',
              points: 5,
              fieldGoals: { made: 2, attempted: 5 },
              threePointers: { made: 1, attempted: 4 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 2,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '26',
              lastName: 'Kornet',
              firstName: 'Luke',
              minutes: '14:20',
              points: 4,
              fieldGoals: { made: 2, attempted: 4 },
              threePointers: { made: 0, attempted: 0 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 4,
              assists: 1,
              steals: 0,
              blocks: 0
            },
            {
              jerseyNumber: '20',
              lastName: 'Pritchard',
              firstName: 'Payton',
              minutes: '10:15',
              points: 3,
              fieldGoals: { made: 1, attempted: 3 },
              threePointers: { made: 1, attempted: 2 },
              freeThrows: { made: 0, attempted: 0 },
              rebounds: 1,
              assists: 2,
              steals: 0,
              blocks: 0
            },
            // DNP player
            {
              jerseyNumber: '27',
              lastName: 'Springer',
              firstName: 'Jaden',
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
              lastName: 'Walsh',
              firstName: 'Jordan',
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
        // Mock historical matchup data: Lakers vs Celtics rivalry
        historicalMatchup: {
          lastFiveMeetings: [
            {
              date: '2026-03-01',
              homeTeam: 'Los Angeles Lakers',
              awayTeam: 'Boston Celtics',
              homeScore: 105,
              awayScore: 112,
              winner: 'away'
            },
            {
              date: '2026-01-15',
              homeTeam: 'Boston Celtics',
              awayTeam: 'Los Angeles Lakers',
              homeScore: 98,
              awayScore: 95,
              winner: 'home'
            },
            {
              date: '2025-12-10',
              homeTeam: 'Los Angeles Lakers',
              awayTeam: 'Boston Celtics',
              homeScore: 110,
              awayScore: 108,
              winner: 'home'
            },
            {
              date: '2025-11-22',
              homeTeam: 'Boston Celtics',
              awayTeam: 'Los Angeles Lakers',
              homeScore: 102,
              awayScore: 100,
              winner: 'home'
            },
            {
              date: '2025-10-30',
              homeTeam: 'Los Angeles Lakers',
              awayTeam: 'Boston Celtics',
              homeScore: 115,
              awayScore: 113,
              winner: 'home'
            }
          ],
          seasonSeries: {
            wins: 2,
            losses: 1,
            leader: 'home'
          },
          allTimeRecord: {
            wins: 163,
            losses: 127,
            leader: 'away'
          },
          averageCombinedPoints: 208
        }
      };

      return mockDetails;
    } catch (error) {
      this.handleError(error, 'fetching game details');
    }
  }
}
