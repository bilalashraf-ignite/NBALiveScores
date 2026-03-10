import { Game, GameState, Team, Score } from '@/types/sports-data';
import { SportsDataAdapter } from './sports-api-adapter';

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
export class BalldontlieAdapter implements SportsDataAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  /**
   * Create a new balldontlie.io adapter.
   * @param apiKey - API key from balldontlie.io (required for production use)
   * @param baseUrl - Base URL for API (defaults to official endpoint)
   */
  constructor(
    apiKey: string = process.env.BALLDONTLIE_API_KEY || '',
    baseUrl: string = 'https://api.balldontlie.io/v1'
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all live NBA games.
   *
   * Note: Phase 1 returns empty array. Implementation will be added in Phase 2.
   *
   * @param league - League identifier (only "nba" supported by balldontlie.io)
   * @returns Array of live games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    try {
      // Phase 1: Return empty array (no network calls yet)
      // Phase 2: Implement actual HTTP fetch to /games endpoint with live filter
      // const response = await fetch(`${this.baseUrl}/games?live=true`, {
      //   headers: { 'Authorization': this.apiKey }
      // });
      // const data = await response.json();
      // return data.data.map(this.mapToGame);

      return [];
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
}
