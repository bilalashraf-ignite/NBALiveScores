/**
 * Normalized domain types for basketball game data.
 * These types are API-agnostic and represent our internal domain model.
 * External API responses should be mapped to these types via adapters.
 */

/**
 * All possible states a basketball game can be in.
 * Used to determine polling frequency and display logic.
 */
export enum GameState {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  HALFTIME = 'halftime',
  FINAL = 'final',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled'
}

/**
 * Represents a basketball team with minimal identifying information.
 */
export interface Team {
  /** Internal unique identifier (not tied to any specific API) */
  id: string;
  /** Full team name (e.g., "Los Angeles Lakers") */
  name: string;
  /** Team abbreviation (e.g., "LAL") */
  abbreviation: string;
  /** Optional URL to team logo image */
  logoUrl?: string;
}

/**
 * Current score for a game.
 */
export interface Score {
  /** Home team score */
  home: number;
  /** Away team score */
  away: number;
}

/**
 * Team fouls count for each team.
 * Used to display foul counts during live games.
 */
export interface TeamFouls {
  /** Home team fouls */
  home: number;
  /** Away team fouls */
  away: number;
}

/**
 * Complete representation of a basketball game with all essential data.
 */
export interface Game {
  /** Internal unique identifier (not tied to any specific API) */
  id: string;
  /** Home team information */
  homeTeam: Team;
  /** Away team information */
  awayTeam: Team;
  /** Current score */
  score: Score;
  /** Current game state */
  state: GameState;
  /**
   * Scheduled start time of the game.
   * CRITICAL: Always stored in UTC. Convert to local timezone only for display.
   * This prevents timezone chaos (see PITFALLS.md #3).
   */
  scheduledTime: Date;
  /** Current period/quarter (1-4, or 5+ for overtime) */
  period?: number;
  /** Time remaining in current period (e.g., "5:32") */
  timeRemaining?: string;
  /** Which team currently has possession */
  possession?: 'home' | 'away';
  /** Team fouls count (optional - not all APIs provide this data) */
  teamFouls?: TeamFouls;
}
