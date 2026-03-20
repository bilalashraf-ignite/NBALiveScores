/**
 * Normalized domain types for sports game data.
 * These types are API-agnostic and represent our internal domain model.
 * External API responses should be mapped to these types via adapters.
 */

/**
 * Supported basketball leagues.
 */
export type BasketballLeague = 'NBA' | 'NCAA' | 'EuroLeague';

/**
 * Supported football (soccer) leagues.
 */
export type FootballLeague = 'PremierLeague' | 'LaLiga' | 'Bundesliga' | 'SerieA' | 'Ligue1';

/**
 * Supported cricket leagues/tournaments.
 */
export type CricketLeague = 'IPL' | 'BBL' | 'PSL' | 'CPL' | 'ICC' | 'CountyChampionship';

/**
 * All supported leagues.
 * Each league has its own adapter implementation.
 */
export type League = BasketballLeague | FootballLeague | CricketLeague;

/**
 * Array of all supported basketball leagues.
 */
export const BASKETBALL_LEAGUES: readonly BasketballLeague[] = ['NBA', 'NCAA', 'EuroLeague'] as const;

/**
 * Array of all supported football leagues.
 */
export const FOOTBALL_LEAGUES: readonly FootballLeague[] = ['PremierLeague', 'LaLiga', 'Bundesliga', 'SerieA', 'Ligue1'] as const;

/**
 * Array of all supported cricket leagues.
 */
export const CRICKET_LEAGUES: readonly CricketLeague[] = ['IPL', 'BBL', 'PSL', 'CPL', 'ICC', 'CountyChampionship'] as const;

/**
 * Array of all supported leagues across all sports.
 */
export const VALID_LEAGUES: readonly League[] = [
  ...BASKETBALL_LEAGUES,
  ...FOOTBALL_LEAGUES,
  ...CRICKET_LEAGUES,
] as const;

/**
 * Sport type discriminator.
 */
export type Sport = 'basketball' | 'football' | 'cricket';

/**
 * Helper to determine sport from league.
 */
export function getSportFromLeague(league: League): Sport {
  if ((FOOTBALL_LEAGUES as readonly string[]).includes(league)) return 'football';
  if ((CRICKET_LEAGUES as readonly string[]).includes(league)) return 'cricket';
  return 'basketball';
}

/**
 * Type guard to check if a league is a football league.
 */
export function isFootballLeague(league: League): league is FootballLeague {
  return (FOOTBALL_LEAGUES as readonly string[]).includes(league);
}

/**
 * Type guard to check if a league is a basketball league.
 */
export function isBasketballLeague(league: League): league is BasketballLeague {
  return (BASKETBALL_LEAGUES as readonly string[]).includes(league);
}

/**
 * Type guard to check if a league is a cricket league.
 */
export function isCricketLeague(league: League): league is CricketLeague {
  return (CRICKET_LEAGUES as readonly string[]).includes(league);
}

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
 * Complete representation of a game with all essential data.
 * Supports both basketball and football with sport-specific optional fields.
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
  /** Current period/quarter (1-4, or 5+ for overtime) - Basketball */
  period?: number;
  /** Time remaining in current period (e.g., "5:32") - Basketball */
  timeRemaining?: string;
  /** Which team currently has possession */
  possession?: 'home' | 'away';
  /** Team fouls count (optional - not all APIs provide this data) - Basketball */
  teamFouls?: TeamFouls;
  /** Current half (1 or 2) - Football */
  half?: 1 | 2;
  /** Current minute (1-90+) - Football */
  minute?: number;
  /** Added/stoppage time - Football */
  addedTime?: number;
  /** Current innings (1, 2, 3, or 4 for test) - Cricket */
  innings?: number;
  /** Overs completed (e.g., "15.3" = 15 overs and 3 balls) - Cricket */
  overs?: string;
  /** Wickets fallen in current innings - Cricket */
  wickets?: number;
  /** Runs scored in current innings - Cricket */
  runs?: number;
  /** Run rate (runs per over) - Cricket */
  runRate?: number;
  /** Required run rate to win (for chasing team) - Cricket */
  requiredRunRate?: number;
  /** Match format (T20, ODI, Test) - Cricket */
  matchFormat?: 'T20' | 'ODI' | 'Test';
  /** Target score to chase (if second innings) - Cricket */
  target?: number;
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
 * This is the basketball-specific version.
 */
export interface BasketballGameDetails {
  /** Game identifier */
  gameId: string;
  /** League this game belongs to */
  league: BasketballLeague;
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

/**
 * Football (soccer) team statistics for a game.
 */
export interface FootballTeamStats {
  /** Ball possession percentage (0-100) */
  possession: number;
  /** Total shots */
  shots: number;
  /** Shots on target */
  shotsOnTarget: number;
  /** Corner kicks */
  corners: number;
  /** Fouls committed */
  fouls: number;
  /** Offsides */
  offsides: number;
  /** Yellow cards */
  yellowCards: number;
  /** Red cards */
  redCards: number;
  /** Total passes */
  passes: number;
  /** Pass accuracy percentage (0-100) */
  passAccuracy: number;
  /** Tackles */
  tackles: number;
  /** Goalkeeper saves */
  saves: number;
}

/**
 * Football (soccer) player statistics for a game.
 */
export interface FootballPlayerStats {
  /** Player's jersey number */
  jerseyNumber: string;
  /** Player's last name */
  lastName: string;
  /** Player's first name */
  firstName: string;
  /** Player position */
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  /** Minutes played */
  minutesPlayed: number;
  /** Goals scored */
  goals: number;
  /** Assists */
  assists: number;
  /** Shots */
  shots: number;
  /** Shots on target */
  shotsOnTarget: number;
  /** Passes completed */
  passes: number;
  /** Pass accuracy percentage */
  passAccuracy: number;
  /** Tackles */
  tackles: number;
  /** Interceptions */
  interceptions: number;
  /** Fouls committed */
  fouls: number;
  /** Times fouled */
  fouled: number;
  /** Yellow cards */
  yellowCards: number;
  /** Red cards */
  redCards: number;
  /** Goalkeeper saves (GK only) */
  saves?: number;
}

/**
 * Football game context information (half, minute).
 */
export interface FootballGameContext {
  /** Current half (1 or 2) */
  half: 1 | 2;
  /** Current minute (1-90+) */
  minute: number;
  /** Added/stoppage time */
  addedTime?: number;
}

/**
 * Goal scorer information for football games.
 */
export interface GoalScorer {
  /** Player name */
  player: string;
  /** Which team scored */
  team: 'home' | 'away';
  /** Minute of the goal */
  minute: number;
  /** Assisted by (optional) */
  assistedBy?: string;
  /** Was it a penalty? */
  isPenalty?: boolean;
  /** Was it an own goal? */
  isOwnGoal?: boolean;
}

/**
 * Detailed football game information.
 */
export interface FootballGameDetails {
  /** Game identifier */
  gameId: string;
  /** League this game belongs to */
  league: FootballLeague;
  /** Home team information */
  homeTeam: Team;
  /** Away team information */
  awayTeam: Team;
  /** Game status (live, final, etc.) */
  status: GameState;
  /** Current score */
  score: Score;
  /** Optional game context (half, minute) for live games */
  gameContext?: FootballGameContext;
  /** Team statistics for both teams */
  teamStats: {
    home: FootballTeamStats;
    away: FootballTeamStats;
  };
  /** Player statistics for both teams */
  playerStats: {
    home: FootballPlayerStats[];
    away: FootballPlayerStats[];
  };
  /** Goal scorers */
  scorers: GoalScorer[];
  /** Historical matchup data */
  historicalMatchup: HistoricalMatchup;
}

// ============================================
// CRICKET TYPES
// ============================================

/**
 * Cricket match format types.
 */
export type CricketMatchFormat = 'T20' | 'ODI' | 'Test';

/**
 * Cricket innings score summary.
 */
export interface CricketInnings {
  /** Innings number (1, 2, 3, or 4 for Test) */
  inningsNumber: number;
  /** Team batting in this innings */
  battingTeam: 'home' | 'away';
  /** Runs scored */
  runs: number;
  /** Wickets fallen */
  wickets: number;
  /** Overs bowled (e.g., "20.0", "45.3") */
  overs: string;
  /** Run rate */
  runRate: number;
  /** Is this innings completed? */
  isCompleted: boolean;
  /** Declared (Test matches) */
  declared?: boolean;
}

/**
 * Ball-by-ball delivery information.
 */
export interface CricketBall {
  /** Over number (0-indexed within the over, so 0-5) */
  ballNumber: number;
  /** Over number (e.g., 15 for 15th over) */
  overNumber: number;
  /** Formatted over.ball (e.g., "15.3") */
  overBall: string;
  /** Runs scored on this ball */
  runs: number;
  /** Type of extra (wide, no-ball, bye, leg-bye) */
  extras?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';
  /** Extra runs */
  extraRuns?: number;
  /** Was it a wicket? */
  isWicket: boolean;
  /** Wicket type if applicable */
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | 'retired';
  /** Dismissed batsman name */
  dismissedBatsman?: string;
  /** Bowler name */
  bowler: string;
  /** Batsman on strike */
  batsman: string;
  /** Is it a boundary (4) */
  isFour: boolean;
  /** Is it a six */
  isSix: boolean;
  /** Commentary text */
  commentary?: string;
}

/**
 * Over summary for quick display.
 */
export interface CricketOver {
  /** Over number */
  overNumber: number;
  /** Bowler name */
  bowler: string;
  /** Runs scored in this over */
  runs: number;
  /** Wickets taken in this over */
  wickets: number;
  /** Ball-by-ball breakdown (e.g., ["1", "0", "4", "W", "0", "2"]) */
  balls: string[];
  /** Maiden over (0 runs, no extras) */
  isMaiden: boolean;
}

/**
 * Cricket batsman statistics.
 */
export interface CricketBatsmanStats {
  /** Player name */
  name: string;
  /** Is currently batting */
  isOnStrike: boolean;
  /** Is at the crease (not out) */
  isNotOut: boolean;
  /** Runs scored */
  runs: number;
  /** Balls faced */
  balls: number;
  /** Number of fours */
  fours: number;
  /** Number of sixes */
  sixes: number;
  /** Strike rate (runs per 100 balls) */
  strikeRate: number;
  /** How the batsman got out (if out) */
  dismissal?: string;
}

/**
 * Cricket bowler statistics.
 */
export interface CricketBowlerStats {
  /** Player name */
  name: string;
  /** Is currently bowling */
  isBowling: boolean;
  /** Overs bowled (e.g., "4.0") */
  overs: string;
  /** Maiden overs */
  maidens: number;
  /** Runs conceded */
  runs: number;
  /** Wickets taken */
  wickets: number;
  /** Economy rate (runs per over) */
  economy: number;
  /** Dot balls bowled */
  dots?: number;
  /** Wides bowled */
  wides?: number;
  /** No-balls bowled */
  noBalls?: number;
}

/**
 * Cricket team stats for a match.
 */
export interface CricketTeamStats {
  /** Total runs */
  totalRuns: number;
  /** Total wickets */
  totalWickets: number;
  /** Total overs */
  totalOvers: string;
  /** Run rate */
  runRate: number;
  /** Extras breakdown */
  extras: {
    total: number;
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
  /** Partnerships (optional) */
  partnerships?: Array<{
    batsman1: string;
    batsman2: string;
    runs: number;
    balls: number;
  }>;
}

/**
 * Cricket game context (current match state).
 */
export interface CricketGameContext {
  /** Current innings number */
  currentInnings: number;
  /** Overs completed in current innings */
  overs: string;
  /** Required run rate (if chasing) */
  requiredRunRate?: number;
  /** Target score (if chasing) */
  target?: number;
  /** Runs needed to win */
  runsNeeded?: number;
  /** Balls remaining */
  ballsRemaining?: number;
  /** Current batsmen on crease */
  currentBatsmen?: {
    striker: CricketBatsmanStats;
    nonStriker: CricketBatsmanStats;
  };
  /** Current bowler */
  currentBowler?: CricketBowlerStats;
  /** Recent overs summary */
  recentOvers?: CricketOver[];
  /** Last ball details */
  lastBall?: CricketBall;
}

/**
 * Detailed cricket game information.
 */
export interface CricketGameDetails {
  /** Game identifier */
  gameId: string;
  /** League this game belongs to */
  league: CricketLeague;
  /** Home team information */
  homeTeam: Team;
  /** Away team information */
  awayTeam: Team;
  /** Game status (live, final, etc.) */
  status: GameState;
  /** Match format */
  matchFormat: CricketMatchFormat;
  /** Current score (simplified) */
  score: Score;
  /** All innings data */
  innings: CricketInnings[];
  /** Optional game context for live games */
  gameContext?: CricketGameContext;
  /** Team statistics */
  teamStats: {
    home: CricketTeamStats;
    away: CricketTeamStats;
  };
  /** Batting stats per innings */
  battingStats: {
    home: CricketBatsmanStats[];
    away: CricketBatsmanStats[];
  };
  /** Bowling stats per innings */
  bowlingStats: {
    home: CricketBowlerStats[];
    away: CricketBowlerStats[];
  };
  /** Ball-by-ball data (recent balls, limited for performance) */
  ballByBall?: CricketBall[];
  /** Toss information */
  toss?: {
    winner: 'home' | 'away';
    decision: 'bat' | 'bowl';
  };
  /** Venue information */
  venue?: string;
  /** Match result (if completed) */
  result?: string;
  /** Historical matchup data */
  historicalMatchup: HistoricalMatchup;
}

/**
 * Union type for game details (basketball, football, or cricket).
 */
export type GameDetails = BasketballGameDetails | FootballGameDetails | CricketGameDetails;

/**
 * Type guard to check if game details are for football.
 */
export function isFootballGameDetails(details: GameDetails): details is FootballGameDetails {
  return isFootballLeague(details.league as League);
}

/**
 * Type guard to check if game details are for basketball.
 */
export function isBasketballGameDetails(details: GameDetails): details is BasketballGameDetails {
  return isBasketballLeague(details.league as League);
}

/**
 * Type guard to check if game details are for cricket.
 */
export function isCricketGameDetails(details: GameDetails): details is CricketGameDetails {
  return isCricketLeague(details.league as League);
}
