import { Game, GameDetails, League } from '@/types/sports-data';

/**
 * Abstract interface for sports data providers.
 *
 * This adapter pattern prevents vendor lock-in by abstracting external API specifics.
 * To swap providers, implement this interface for the new API and update configuration.
 *
 * Target: Developer can swap API providers in under 4 hours.
 *
 * Error Handling Convention:
 * - Array methods return empty arrays on error or no results
 * - Single-item methods return null on error or not found
 * - Errors are logged internally; callers check for null/empty results
 *
 * See PITFALLS.md #7 for rationale on API abstraction from day one.
 */
export interface SportsDataAdapter {
  /**
   * Fetch all live games for a specific league.
   *
   * Returns an empty array if no games are live or if an error occurs.
   * Callers should check array length to determine if games exist.
   *
   * @param league - League identifier (e.g., "nba", "ncaa", "euroleague")
   * @returns Array of live games, or empty array on error/no games
   */
  getLiveGames(league: string): Promise<Game[]>;

  /**
   * Fetch a single game by its ID.
   *
   * Returns null if the game is not found or if an error occurs.
   * Callers should check for null before using the result.
   *
   * @param gameId - Unique game identifier
   * @returns Game data if found, or null on error/not found
   */
  getGame(gameId: string): Promise<Game | null>;

  /**
   * Fetch scheduled games for a specific league and date.
   *
   * Returns an empty array if no games are scheduled or if an error occurs.
   * Callers should check array length to determine if games exist.
   *
   * @param league - League identifier (e.g., "nba", "ncaa", "euroleague")
   * @param date - Date to fetch games for (UTC)
   * @returns Array of scheduled games, or empty array on error/no games
   */
  getScheduledGames(league: string, date: Date): Promise<Game[]>;

  /**
   * Fetch detailed game information including team stats, player stats, and historical matchup.
   * Called on-demand when user opens game detail modal.
   * @param gameId - Game identifier
   * @param league - League identifier
   * @returns Promise resolving to detailed game information
   */
  getGameDetails(gameId: string, league: League): Promise<GameDetails>;
}
