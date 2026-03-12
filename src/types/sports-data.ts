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
 * Includes all specified stats with made-attempted format for shooting stats.
 */
export interface PlayerStats {
  /** Player's jersey number (e.g., "23") */
  jerseyNumber: string;
  /** Player's last name (e.g., "James") */
  lastName: string;
  /** Player's first name (for full name display) */
  firstName: string;
  /** Minutes played in MM:SS format (e.g., "32:15" or "0:00" for DNP) */
  minutes: string;
  /** Total points scored */
  points: number;
  /** Field goals (2-point + 3-point) made and attempted */
  fieldGoals: { made: number; attempted: number };
  /** Three-pointers made and attempted */
  threePointers: { made: number; attempted: number };
  /** Free throws made and attempted */
  freeThrows: { made: number; attempted: number };
  /** Total rebounds (offensive + defensive) */
  rebounds: number;
  /** Assists */
  assists: number;
  /** Steals */
  steals: number;
  /** Blocks */
  blocks: number;
}

/**
 * Historical matchup data between two teams.
 * Shows last 5 meetings, season series record, and all-time head-to-head record.
 * All fields are optional to support graceful degradation when data unavailable.
 */
export interface HistoricalMatchup {
  /** Last 5 meetings between the two teams (most recent first) */
  lastFiveMeetings?: Array<{
    /** ISO date format "2024-12-15" */
    date: string;
    /** Home team name */
    homeTeam: string;
    /** Away team name */
    awayTeam: string;
    /** Home team score */
    homeScore: number;
    /** Away team score */
    awayScore: number;
    /** Which team won the matchup */
    winner: 'home' | 'away';
  }>;
  /** Current season series record (wins/losses from one team's perspective) */
  seasonSeries?: {
    /** Season wins for one team */
    wins: number;
    /** Season losses for one team */
    losses: number;
    /** Which team leads the season series */
    leader: 'home' | 'away' | 'tied';
  };
  /** All-time head-to-head record (wins/losses from one team's perspective) */
  allTimeRecord?: {
    /** All-time wins for one team */
    wins: number;
    /** All-time losses for one team */
    losses: number;
    /** Which team leads all-time */
    leader: 'home' | 'away';
  };
  /** Average combined points per matchup across history */
  averageCombinedPoints?: number;
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
