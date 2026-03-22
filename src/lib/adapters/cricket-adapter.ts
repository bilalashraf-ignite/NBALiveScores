import {
  Game,
  GameState,
  League,
  CricketLeague,
  CricketGameDetails,
  CricketInnings,
  CricketBatsmanStats,
  CricketBowlerStats,
  CricketTeamStats,
  CricketOver,
  CricketBall,
  CricketMatchFormat,
} from '@/types/sports-data';
import { SportsDataAdapter } from './sports-api-adapter';
import { BaseAdapter } from './base-adapter';
import { CACHE_TTL } from '@/lib/cache';

/**
 * Adapter for cricket data using CricketData.org API.
 *
 * Supports: IPL, BBL, PSL, CPL, ICC (International), County Championship
 * API Documentation: https://cricketdata.org/
 *
 * Note: Phase 1 implementation returns mock data. Real API calls will be added
 * when API keys are configured.
 */
export class CricketAdapter extends BaseAdapter implements SportsDataAdapter {
  protected league: League = 'IPL';
  protected baseUrl: string = 'https://api.cricapi.com/v1';
  private readonly apiKey: string;

  // League ID mapping for CricketData.org
  private static readonly LEAGUE_IDS: Record<CricketLeague, string> = {
    IPL: 'ipl',
    BBL: 'bbl',
    PSL: 'psl',
    CPL: 'cpl',
    ICC: 'icc',
    CountyChampionship: 'county',
  };

  // Team data for mock games per league
  private static readonly TEAMS: Record<CricketLeague, Array<{ name: string; abbreviation: string }>> = {
    IPL: [
      { name: 'Mumbai Indians', abbreviation: 'MI' },
      { name: 'Chennai Super Kings', abbreviation: 'CSK' },
      { name: 'Royal Challengers Bangalore', abbreviation: 'RCB' },
      { name: 'Kolkata Knight Riders', abbreviation: 'KKR' },
      { name: 'Delhi Capitals', abbreviation: 'DC' },
      { name: 'Rajasthan Royals', abbreviation: 'RR' },
      { name: 'Sunrisers Hyderabad', abbreviation: 'SRH' },
      { name: 'Punjab Kings', abbreviation: 'PBKS' },
      { name: 'Gujarat Titans', abbreviation: 'GT' },
      { name: 'Lucknow Super Giants', abbreviation: 'LSG' },
    ],
    BBL: [
      { name: 'Melbourne Stars', abbreviation: 'STA' },
      { name: 'Sydney Sixers', abbreviation: 'SIX' },
      { name: 'Perth Scorchers', abbreviation: 'SCO' },
      { name: 'Brisbane Heat', abbreviation: 'HEA' },
      { name: 'Adelaide Strikers', abbreviation: 'STR' },
      { name: 'Hobart Hurricanes', abbreviation: 'HUR' },
      { name: 'Sydney Thunder', abbreviation: 'THU' },
      { name: 'Melbourne Renegades', abbreviation: 'REN' },
    ],
    PSL: [
      { name: 'Karachi Kings', abbreviation: 'KK' },
      { name: 'Lahore Qalandars', abbreviation: 'LQ' },
      { name: 'Islamabad United', abbreviation: 'IU' },
      { name: 'Peshawar Zalmi', abbreviation: 'PZ' },
      { name: 'Quetta Gladiators', abbreviation: 'QG' },
      { name: 'Multan Sultans', abbreviation: 'MS' },
    ],
    CPL: [
      { name: 'Trinbago Knight Riders', abbreviation: 'TKR' },
      { name: 'Jamaica Tallawahs', abbreviation: 'JT' },
      { name: 'Guyana Amazon Warriors', abbreviation: 'GAW' },
      { name: 'Barbados Royals', abbreviation: 'BR' },
      { name: 'St Lucia Kings', abbreviation: 'SLK' },
      { name: 'St Kitts and Nevis Patriots', abbreviation: 'SNP' },
    ],
    ICC: [
      { name: 'India', abbreviation: 'IND' },
      { name: 'Australia', abbreviation: 'AUS' },
      { name: 'England', abbreviation: 'ENG' },
      { name: 'South Africa', abbreviation: 'SA' },
      { name: 'New Zealand', abbreviation: 'NZ' },
      { name: 'Pakistan', abbreviation: 'PAK' },
      { name: 'West Indies', abbreviation: 'WI' },
      { name: 'Sri Lanka', abbreviation: 'SL' },
      { name: 'Bangladesh', abbreviation: 'BAN' },
      { name: 'Afghanistan', abbreviation: 'AFG' },
    ],
    CountyChampionship: [
      { name: 'Surrey', abbreviation: 'SUR' },
      { name: 'Hampshire', abbreviation: 'HAM' },
      { name: 'Essex', abbreviation: 'ESS' },
      { name: 'Yorkshire', abbreviation: 'YOR' },
      { name: 'Lancashire', abbreviation: 'LAN' },
      { name: 'Warwickshire', abbreviation: 'WAR' },
      { name: 'Somerset', abbreviation: 'SOM' },
      { name: 'Kent', abbreviation: 'KEN' },
    ],
  };

  // Player names for mock data
  private static readonly BATSMEN = [
    'V. Kohli', 'R. Sharma', 'S. Gill', 'K. Rahul', 'S. Iyer',
    'R. Pant', 'H. Pandya', 'R. Jadeja', 'A. Patel', 'M. Shami',
    'D. Warner', 'S. Smith', 'M. Labuschagne', 'T. Head', 'G. Maxwell',
    'J. Root', 'B. Stokes', 'J. Buttler', 'H. Brook', 'M. Wood',
  ];

  private static readonly BOWLERS = [
    'J. Bumrah', 'M. Shami', 'M. Siraj', 'K. Yadav', 'R. Ashwin',
    'P. Cummins', 'M. Starc', 'J. Hazlewood', 'A. Zampa', 'N. Lyon',
    'J. Anderson', 'S. Broad', 'M. Wood', 'A. Rashid', 'J. Archer',
  ];

  constructor(apiKey: string = process.env.CRICKET_API_KEY || '') {
    super();
    this.apiKey = apiKey;
  }

  /**
   * Convert cricket overs string to decimal.
   * In cricket, "18.2" means 18 overs and 2 balls (6 balls per over).
   * So "18.2" = 18 + 2/6 = 18.333...
   */
  private convertOversToDecimal(overs: string): number {
    const parts = overs.split('.');
    const wholeOvers = parseInt(parts[0], 10) || 0;
    const balls = parts[1] ? parseInt(parts[1], 10) : 0;
    return wholeOvers + balls / 6;
  }

  /**
   * Get the match format based on league.
   */
  private getMatchFormat(league: CricketLeague): CricketMatchFormat {
    switch (league) {
      case 'IPL':
      case 'BBL':
      case 'PSL':
      case 'CPL':
        return 'T20';
      case 'CountyChampionship':
        return 'Test';
      case 'ICC':
      default:
        return 'ODI';
    }
  }

  /**
   * Get max overs for match format.
   */
  private getMaxOvers(format: CricketMatchFormat): number {
    switch (format) {
      case 'T20':
        return 20;
      case 'ODI':
        return 50;
      case 'Test':
        return 90; // Per day
    }
  }

  /**
   * Fetch all live games for a specific cricket league.
   *
   * Returns an empty array if no games are found or if an error occurs.
   * Callers should check array length to determine if games exist.
   *
   * @param league - League identifier (e.g., 'IPL', 'BBL')
   * @returns Array of live games, or empty array on error/no games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    try {
      const cricketLeague = league as CricketLeague;
      const teams = CricketAdapter.TEAMS[cricketLeague] || CricketAdapter.TEAMS.IPL;
      const matchFormat = this.getMatchFormat(cricketLeague);
      const maxOvers = this.getMaxOvers(matchFormat);

      // Generate mock games with various states
      const states = [GameState.LIVE, GameState.LIVE, GameState.FINAL, GameState.SCHEDULED];
      const mockGames: Game[] = [];

      // Generate 3 games per league
      for (let i = 0; i < 3; i++) {
        const state = states[i % states.length];
        const homeTeamIndex = (i * 2) % teams.length;
        const awayTeamIndex = (i * 2 + 1) % teams.length;

        // Generate cricket-specific score data
        const currentOvers = state === GameState.SCHEDULED
          ? 0
          : Math.floor(Math.random() * maxOvers);
        const currentBalls = Math.floor(Math.random() * 6);
        const overs = `${currentOvers}.${currentBalls}`;
        const runs = state === GameState.SCHEDULED
          ? 0
          : Math.floor(Math.random() * 180) + 50;
        const wickets = state === GameState.SCHEDULED
          ? 0
          : Math.min(Math.floor(Math.random() * 7), 10);
        const runRate = currentOvers > 0 ? parseFloat((runs / currentOvers).toFixed(2)) : 0;

        // For second innings, generate target
        const isSecondInnings = Math.random() > 0.5 && state === GameState.LIVE;
        const target = isSecondInnings ? Math.floor(Math.random() * 50) + 150 : undefined;
        const requiredRunRate = target && currentOvers > 0 && currentOvers < maxOvers
          ? parseFloat(((target - runs) / (maxOvers - currentOvers)).toFixed(2))
          : undefined;

        mockGames.push({
          id: `${cricketLeague.toLowerCase()}-game-${i}`,
          league: cricketLeague,
          homeTeam: {
            id: `${cricketLeague.toLowerCase()}-team-home-${i}`,
            name: teams[homeTeamIndex].name,
            abbreviation: teams[homeTeamIndex].abbreviation,
            logoUrl: undefined,
          },
          awayTeam: {
            id: `${cricketLeague.toLowerCase()}-team-away-${i}`,
            name: teams[awayTeamIndex].name,
            abbreviation: teams[awayTeamIndex].abbreviation,
            logoUrl: undefined,
          },
          score: { home: runs, away: target || 0 },
          state: state,
          scheduledTime: new Date(Date.now() - 3600000),
          // Cricket-specific fields
          innings: isSecondInnings ? 2 : 1,
          overs: state === GameState.LIVE ? overs : undefined,
          wickets: state === GameState.LIVE ? wickets : undefined,
          runs: state === GameState.LIVE ? runs : undefined,
          runRate: state === GameState.LIVE ? runRate : undefined,
          requiredRunRate: requiredRunRate,
          matchFormat: matchFormat,
          target: target,
        });
      }

      return mockGames;
    } catch (error) {
      console.error(`Failed to fetch live games from cricket API for ${league}:`, error);
      return [];
    }
  }

  /**
   * Fetch a single game by ID.
   *
   * Returns null if the game is not found or if an error occurs.
   * Callers should check for null before using the result.
   *
   * Note: Phase 1 implementation - real API calls not yet implemented.
   *
   * @param gameId - Unique game identifier
   * @returns Game object if found, or null on error/not found
   */
  async getGame(gameId: string): Promise<Game | null> {
    try {
      // Phase 1: Return null for not implemented
      // TODO: Implement real API call when API keys are configured
      console.warn(`CricketAdapter.getGame: Game ${gameId} lookup not implemented in Phase 1`);
      return null;
    } catch (error) {
      console.error(`Failed to fetch game ${gameId} from cricket API:`, error);
      return null;
    }
  }

  /**
   * Fetch scheduled games for a specific date.
   *
   * Returns an empty array if no games are scheduled or if an error occurs.
   * Callers should check array length to determine if games exist.
   *
   * Note: Phase 1 implementation - real API calls not yet implemented.
   *
   * @param league - League identifier (e.g., 'IPL', 'BBL')
   * @param date - Date to fetch scheduled games for
   * @returns Array of scheduled games, or empty array on error/no games
   */
  async getScheduledGames(league: string, date: Date): Promise<Game[]> {
    try {
      // Phase 1: Return empty array for not implemented
      // TODO: Implement real API call when API keys are configured
      return [];
    } catch (error) {
      console.error(`Failed to fetch scheduled games for ${league} on ${date.toISOString()}:`, error);
      return [];
    }
  }

  /**
   * Fetch detailed game information.
   */
  async getGameDetails(gameId: string, league: League): Promise<CricketGameDetails> {
    const cricketLeague = league as CricketLeague;
    const teams = CricketAdapter.TEAMS[cricketLeague] || CricketAdapter.TEAMS.IPL;
    const matchFormat = this.getMatchFormat(cricketLeague);

    const mockDetails: CricketGameDetails = {
      gameId,
      league: cricketLeague,
      homeTeam: {
        id: 'team-home',
        name: teams[0].name,
        abbreviation: teams[0].abbreviation,
        logoUrl: undefined,
      },
      awayTeam: {
        id: 'team-away',
        name: teams[1].name,
        abbreviation: teams[1].abbreviation,
        logoUrl: undefined,
      },
      status: GameState.LIVE,
      matchFormat: matchFormat,
      score: { home: 156, away: 142 },
      innings: this.generateMockInnings(teams, matchFormat),
      gameContext: this.generateMockGameContext(),
      teamStats: {
        home: this.generateMockTeamStats(156, 6, '18.2'),
        away: this.generateMockTeamStats(142, 10, '19.4'),
      },
      battingStats: {
        home: this.generateMockBattingStats(),
        away: this.generateMockBattingStats(),
      },
      bowlingStats: {
        home: this.generateMockBowlingStats(),
        away: this.generateMockBowlingStats(),
      },
      ballByBall: this.generateMockBallByBall(),
      toss: {
        winner: 'away',
        decision: 'bat',
      },
      venue: 'Wankhede Stadium, Mumbai',
      historicalMatchup: {
        lastFiveMeetings: [
          { date: '2026-01-15', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 185, awayScore: 162, winner: 'home' },
          { date: '2025-09-22', homeTeam: teams[1].name, awayTeam: teams[0].name, homeScore: 172, awayScore: 175, winner: 'away' },
          { date: '2025-04-10', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 168, awayScore: 165, winner: 'home' },
          { date: '2024-12-05', homeTeam: teams[1].name, awayTeam: teams[0].name, homeScore: 190, awayScore: 156, winner: 'home' },
          { date: '2024-08-18', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 145, awayScore: 148, winner: 'away' },
        ],
        seasonSeries: { wins: 2, losses: 1, leader: 'home' },
        allTimeRecord: { wins: 18, losses: 14, leader: 'home' },
        averageCombinedPoints: 320,
      },
    };

    return mockDetails;
  }

  /**
   * Generate mock innings data.
   */
  private generateMockInnings(
    teams: Array<{ name: string; abbreviation: string }>,
    format: CricketMatchFormat
  ): CricketInnings[] {
    return [
      {
        inningsNumber: 1,
        battingTeam: 'away',
        runs: 142,
        wickets: 10,
        overs: '19.4',
        runRate: 7.23,
        isCompleted: true,
      },
      {
        inningsNumber: 2,
        battingTeam: 'home',
        runs: 156,
        wickets: 6,
        overs: '18.2',
        runRate: 8.51,
        isCompleted: false,
      },
    ];
  }

  /**
   * Generate mock game context.
   */
  private generateMockGameContext() {
    return {
      currentInnings: 2,
      overs: '18.2',
      target: 143,
      runsNeeded: 0,
      ballsRemaining: 10,
      currentBatsmen: {
        striker: {
          name: 'R. Sharma',
          isOnStrike: true,
          isNotOut: true,
          runs: 67,
          balls: 42,
          fours: 6,
          sixes: 4,
          strikeRate: 159.52,
        },
        nonStriker: {
          name: 'H. Pandya',
          isOnStrike: false,
          isNotOut: true,
          runs: 28,
          balls: 18,
          fours: 2,
          sixes: 2,
          strikeRate: 155.56,
        },
      },
      currentBowler: {
        name: 'J. Bumrah',
        isBowling: true,
        overs: '3.2',
        maidens: 0,
        runs: 24,
        wickets: 2,
        economy: 7.2,
      },
      recentOvers: this.generateMockRecentOvers(),
    };
  }

  /**
   * Generate mock team stats.
   */
  private generateMockTeamStats(runs: number, wickets: number, overs: string): CricketTeamStats {
    const oversNum = this.convertOversToDecimal(overs);
    return {
      totalRuns: runs,
      totalWickets: wickets,
      totalOvers: overs,
      runRate: parseFloat((runs / oversNum).toFixed(2)),
      extras: {
        total: Math.floor(Math.random() * 15) + 5,
        wides: Math.floor(Math.random() * 6) + 2,
        noBalls: Math.floor(Math.random() * 3),
        byes: Math.floor(Math.random() * 4),
        legByes: Math.floor(Math.random() * 3),
      },
    };
  }

  /**
   * Generate mock batting stats.
   */
  private generateMockBattingStats(): CricketBatsmanStats[] {
    const batsmen = CricketAdapter.BATSMEN.slice(0, 7);
    return batsmen.map((name, index) => {
      const isOut = index < 5;
      const runs = Math.floor(Math.random() * 60) + (index === 0 ? 30 : 5);
      const balls = Math.floor(Math.random() * 40) + 10;
      return {
        name,
        isOnStrike: index === 5,
        isNotOut: !isOut,
        runs,
        balls,
        fours: Math.floor(Math.random() * 6),
        sixes: Math.floor(Math.random() * 3),
        strikeRate: parseFloat(((runs / balls) * 100).toFixed(2)),
        dismissal: isOut ? ['c Smith b Starc', 'b Cummins', 'lbw b Zampa', 'run out', 'c & b Lyon'][index % 5] : undefined,
      };
    });
  }

  /**
   * Generate mock bowling stats.
   */
  private generateMockBowlingStats(): CricketBowlerStats[] {
    const bowlers = CricketAdapter.BOWLERS.slice(0, 5);
    return bowlers.map((name, index) => {
      const wholeOvers = Math.floor(Math.random() * 3) + 2;
      const balls = Math.floor(Math.random() * 6);
      const oversStr = `${wholeOvers}.${balls}`;
      const runs = Math.floor(Math.random() * 30) + 15;
      const oversDecimal = this.convertOversToDecimal(oversStr);
      return {
        name,
        isBowling: index === 0,
        overs: oversStr,
        maidens: Math.floor(Math.random() * 2),
        runs,
        wickets: Math.floor(Math.random() * 3),
        economy: parseFloat((runs / oversDecimal).toFixed(2)),
        dots: Math.floor(Math.random() * 10) + 5,
        wides: Math.floor(Math.random() * 3),
        noBalls: Math.floor(Math.random() * 2),
      };
    });
  }

  /**
   * Generate mock recent overs.
   */
  private generateMockRecentOvers(): CricketOver[] {
    const overs: CricketOver[] = [];
    for (let i = 16; i <= 18; i++) {
      const balls: string[] = [];
      let runs = 0;
      let wickets = 0;
      for (let j = 0; j < 6; j++) {
        const outcome = Math.random();
        let ball: string;
        if (outcome < 0.3) {
          ball = '0';
        } else if (outcome < 0.5) {
          ball = '1';
          runs += 1;
        } else if (outcome < 0.65) {
          ball = '2';
          runs += 2;
        } else if (outcome < 0.8) {
          ball = '4';
          runs += 4;
        } else if (outcome < 0.9) {
          ball = '6';
          runs += 6;
        } else {
          ball = 'W';
          wickets += 1;
        }
        balls.push(ball);
      }
      overs.push({
        overNumber: i,
        bowler: CricketAdapter.BOWLERS[i % CricketAdapter.BOWLERS.length],
        runs,
        wickets,
        balls,
        isMaiden: runs === 0 && wickets === 0,
      });
    }
    return overs;
  }

  /**
   * Generate mock ball-by-ball data.
   */
  private generateMockBallByBall(): CricketBall[] {
    const balls: CricketBall[] = [];
    const currentOver = 18;

    for (let i = 0; i < 6; i++) {
      const runs = [1, 0, 4, 2, 0, 6][i];
      balls.push({
        ballNumber: i,
        overNumber: currentOver,
        overBall: `${currentOver}.${i + 1}`,
        runs,
        isWicket: false,
        bowler: 'J. Bumrah',
        batsman: i % 2 === 0 ? 'R. Sharma' : 'H. Pandya',
        isFour: runs === 4,
        isSix: runs === 6,
        commentary: this.generateBallCommentary(runs),
      });
    }

    return balls;
  }

  /**
   * Generate commentary for a ball.
   */
  private generateBallCommentary(runs: number): string {
    switch (runs) {
      case 0:
        return 'Good length delivery, defended back to the bowler.';
      case 1:
        return 'Pushed to mid-off, quick single taken.';
      case 2:
        return 'Worked away to the leg side, come back for two.';
      case 4:
        return 'FOUR! Beautifully driven through the covers!';
      case 6:
        return 'SIX! Massive hit over long-on into the stands!';
      default:
        return 'Good delivery.';
    }
  }

  /**
   * Map API status to GameState.
   */
  private mapStatus(status: string): GameState {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED':
      case 'NOT STARTED':
        return GameState.SCHEDULED;
      case 'LIVE':
      case 'IN PROGRESS':
      case '1ST INNINGS':
      case '2ND INNINGS':
        return GameState.LIVE;
      case 'INNINGS BREAK':
      case 'TEA':
      case 'LUNCH':
      case 'DRINKS':
        return GameState.HALFTIME;
      case 'COMPLETED':
      case 'FINISHED':
      case 'RESULT':
        return GameState.FINAL;
      case 'ABANDONED':
      case 'NO RESULT':
        return GameState.CANCELLED;
      case 'POSTPONED':
      case 'DELAYED':
        return GameState.POSTPONED;
      default:
        return GameState.SCHEDULED;
    }
  }
}
