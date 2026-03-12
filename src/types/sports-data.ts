/**
 * Normalized domain types for basketball game data.
 * These types are API-agnostic and represent our internal domain model.
 * External API responses should be mapped to these types via adapters.
 */

/**
 * Supported basketball leagues.
 * Each league has its own adapter implementation.
 */
export type League = 'NBA' | 'NCAA' | 'EuroLeague';

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
  /** League this game belongs to */
  league: League;
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

/**
 * Game context information (period, time, possession).
 * Used for live game state display.
 */
export interface GameContext {
  /** Current period/quarter (1-4, or 5+ for overtime) */
  period: number;
  /** Time remaining in current period (e.g., "5:32") */
  timeRemaining: string;
  /** Which team currently has possession */
  possession: 'home' | 'away';
}

/**
 * Shooting statistics with made, attempted, and percentage.
 */
export interface ShootingStat {
  made: number;
  attempted: number;
  percentage: number;
}

/**
 * Team statistics for a game.
 * Includes all 10 specified stats: shooting (FG, 3P, FT), assists, turnovers,
 * rebounds (offensive, defensive, total), steals, and blocks.
 */
export interface TeamStats {
  fieldGoals: ShootingStat;
  threePointers: ShootingStat;
  freeThrows: ShootingStat;
  assists: number;
  turnovers: number;
  reboundsOffensive: number;
  reboundsDefensive: number;
  reboundsTotal: number;
  steals: number;
  blocks: number;
}

/**
 * Player statistics for a game.
 * Placeholder for Plan 03 - will be fully defined with all player fields.
 */
export interface PlayerStats {
  // Will be populated in Plan 03 with:
  // jerseyNumber, lastName, firstName, minutes, points,
  // fieldGoals, threePointers, freeThrows, rebounds, assists, steals, blocks
}

/**
 * Historical matchup data between two teams.
 * Placeholder for Plan 04 - will be fully defined with matchup history.
 */
export interface HistoricalMatchup {
  // Will be populated in Plan 04 with:
  // lastFiveMeetings, seasonSeries, allTimeRecord, averageCombinedPoints
}

/**
 * Detailed game information fetched on-demand when user opens game modal.
 * Extends basic Game data with team stats, player stats, and historical matchup data.
 */
export interface GameDetails {
  /** Game identifier */
  gameId: string;
  /** League this game belongs to */
  league: League;
  /** Home team information */
  homeTeam: Team;
  /** Away team information */
  awayTeam: Team;
  /** Game status (live, final, etc.) */
  status: GameState;
  /** Current score */
  score: Score;
  /** Optional game context (period, time, possession) for live games */
  gameContext?: GameContext;
  /** Optional team fouls */
  teamFouls?: TeamFouls;
  /** Team statistics for both teams */
  teamStats: {
    home: TeamStats;
    away: TeamStats;
  };
  /** Player statistics for both teams */
  playerStats: {
    home: PlayerStats[];
    away: PlayerStats[];
  };
  /** Historical matchup data */
  historicalMatchup: HistoricalMatchup;
}
