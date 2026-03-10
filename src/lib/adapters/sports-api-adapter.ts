import { Game } from '@/types/sports-data';

/**
 * Abstract interface for sports data providers.
 *
 * This adapter pattern prevents vendor lock-in by abstracting external API specifics.
 * To swap providers, implement this interface for the new API and update configuration.
 *
 * Target: Developer can swap API providers in under 4 hours.
 *
 * See PITFALLS.md #7 for rationale on API abstraction from day one.
 */
export interface SportsDataAdapter {
  /**
   * Fetch all live games for a specific league.
   * @param league - League identifier (e.g., "nba", "ncaa", "euroleague")
   * @returns Array of live games, or empty array if none are live
   */
  getLiveGames(league: string): Promise<Game[]>;

  /**
   * Fetch a single game by its ID.
   * @param gameId - Unique game identifier
   * @returns Game data
   * @throws Error if game not found
   */
  getGame(gameId: string): Promise<Game>;

  /**
   * Fetch scheduled games for a specific league and date.
   * @param league - League identifier (e.g., "nba", "ncaa", "euroleague")
   * @param date - Date to fetch games for (UTC)
   * @returns Array of scheduled games for that date
   */
  getScheduledGames(league: string, date: Date): Promise<Game[]>;
}
