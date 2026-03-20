import { Game, GameState, Team, Score, League, FootballLeague, FootballGameDetails, FootballTeamStats, FootballPlayerStats, GoalScorer } from '@/types/sports-data';
import { SportsDataAdapter } from './sports-api-adapter';
import { BaseAdapter } from './base-adapter';

/**
 * Adapter for football (soccer) data using API-Sports (v3.football.api-sports.io).
 *
 * Supports: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
 * API Documentation: https://www.api-football.com/documentation-v3
 *
 * Note: Phase 1 implementation returns mock data. Real API calls will be added
 * when API keys are configured.
 */
export class FootballAdapter extends BaseAdapter implements SportsDataAdapter {
  protected league: League = 'PremierLeague';
  protected baseUrl: string = 'https://v3.football.api-sports.io';
  private readonly apiKey: string;

  // League ID mapping for API-Sports
  private static readonly LEAGUE_IDS: Record<FootballLeague, number> = {
    PremierLeague: 39,   // English Premier League
    LaLiga: 140,         // Spanish La Liga
    Bundesliga: 78,      // German Bundesliga
    SerieA: 135,         // Italian Serie A
    Ligue1: 61,          // French Ligue 1
  };

  // Team data for mock games per league
  private static readonly TEAMS: Record<FootballLeague, Array<{ name: string; abbreviation: string }>> = {
    PremierLeague: [
      { name: 'Manchester City', abbreviation: 'MCI' },
      { name: 'Arsenal', abbreviation: 'ARS' },
      { name: 'Liverpool', abbreviation: 'LIV' },
      { name: 'Manchester United', abbreviation: 'MUN' },
      { name: 'Chelsea', abbreviation: 'CHE' },
      { name: 'Tottenham', abbreviation: 'TOT' },
      { name: 'Newcastle', abbreviation: 'NEW' },
      { name: 'Brighton', abbreviation: 'BHA' },
    ],
    LaLiga: [
      { name: 'Real Madrid', abbreviation: 'RMA' },
      { name: 'Barcelona', abbreviation: 'BAR' },
      { name: 'Atletico Madrid', abbreviation: 'ATM' },
      { name: 'Sevilla', abbreviation: 'SEV' },
      { name: 'Real Sociedad', abbreviation: 'RSO' },
      { name: 'Villarreal', abbreviation: 'VIL' },
      { name: 'Athletic Bilbao', abbreviation: 'ATH' },
      { name: 'Real Betis', abbreviation: 'BET' },
    ],
    Bundesliga: [
      { name: 'Bayern Munich', abbreviation: 'BAY' },
      { name: 'Borussia Dortmund', abbreviation: 'BVB' },
      { name: 'RB Leipzig', abbreviation: 'RBL' },
      { name: 'Bayer Leverkusen', abbreviation: 'B04' },
      { name: 'Union Berlin', abbreviation: 'UNB' },
      { name: 'Freiburg', abbreviation: 'FRE' },
      { name: 'Eintracht Frankfurt', abbreviation: 'SGE' },
      { name: 'Wolfsburg', abbreviation: 'WOB' },
    ],
    SerieA: [
      { name: 'Inter Milan', abbreviation: 'INT' },
      { name: 'AC Milan', abbreviation: 'ACM' },
      { name: 'Napoli', abbreviation: 'NAP' },
      { name: 'Juventus', abbreviation: 'JUV' },
      { name: 'Roma', abbreviation: 'ROM' },
      { name: 'Lazio', abbreviation: 'LAZ' },
      { name: 'Atalanta', abbreviation: 'ATA' },
      { name: 'Fiorentina', abbreviation: 'FIO' },
    ],
    Ligue1: [
      { name: 'Paris Saint-Germain', abbreviation: 'PSG' },
      { name: 'Marseille', abbreviation: 'MAR' },
      { name: 'Monaco', abbreviation: 'MON' },
      { name: 'Lyon', abbreviation: 'LYO' },
      { name: 'Lille', abbreviation: 'LIL' },
      { name: 'Nice', abbreviation: 'NIC' },
      { name: 'Lens', abbreviation: 'LEN' },
      { name: 'Rennes', abbreviation: 'REN' },
    ],
  };

  constructor(apiKey: string = process.env.FOOTBALL_API_KEY || '') {
    super();
    this.apiKey = apiKey;
  }

  /**
   * Fetch all live games for a specific football league.
   *
   * Note: Returns mock data for UI development.
   *
   * @param league - League identifier
   * @returns Array of live games
   */
  async getLiveGames(league: string): Promise<Game[]> {
    try {
      const footballLeague = league as FootballLeague;
      const teams = FootballAdapter.TEAMS[footballLeague] || FootballAdapter.TEAMS.PremierLeague;

      // Generate mock games with various states
      const states = [GameState.LIVE, GameState.HALFTIME, GameState.FINAL, GameState.SCHEDULED];
      const mockGames: Game[] = [];

      // Generate 4 games per league
      for (let i = 0; i < 4; i++) {
        const state = states[i % states.length];
        const homeScore = state === GameState.SCHEDULED ? 0 : Math.floor(Math.random() * 4);
        const awayScore = state === GameState.SCHEDULED ? 0 : Math.floor(Math.random() * 4);
        const homeTeamIndex = (i * 2) % teams.length;
        const awayTeamIndex = (i * 2 + 1) % teams.length;

        mockGames.push({
          id: `${footballLeague.toLowerCase()}-game-${i}`,
          league: footballLeague,
          homeTeam: {
            id: `${footballLeague.toLowerCase()}-team-home-${i}`,
            name: teams[homeTeamIndex].name,
            abbreviation: teams[homeTeamIndex].abbreviation,
            logoUrl: undefined
          },
          awayTeam: {
            id: `${footballLeague.toLowerCase()}-team-away-${i}`,
            name: teams[awayTeamIndex].name,
            abbreviation: teams[awayTeamIndex].abbreviation,
            logoUrl: undefined
          },
          score: { home: homeScore, away: awayScore },
          state: state,
          scheduledTime: new Date(Date.now() - 3600000),
          // Football-specific fields
          half: state === GameState.LIVE ? (Math.random() > 0.5 ? 2 : 1) : undefined,
          minute: state === GameState.LIVE
            ? Math.floor(Math.random() * 45) + (Math.random() > 0.5 ? 45 : 0) + 1
            : state === GameState.HALFTIME ? 45 : undefined,
          addedTime: state === GameState.LIVE && Math.random() > 0.7
            ? Math.floor(Math.random() * 5) + 1
            : undefined,
        });
      }

      return mockGames;
    } catch (error) {
      console.error(`Failed to fetch live games from football API for ${league}:`, error);
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
   * @param gameId - Game identifier
   * @returns Game data if found, or null on error/not found
   */
  async getGame(gameId: string): Promise<Game | null> {
    try {
      console.warn(`FootballAdapter.getGame: Game ${gameId} lookup not implemented in Phase 1`);
      return null;
    } catch (error) {
      console.error(`Failed to fetch game ${gameId} from football API:`, error);
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
   * @param league - League identifier
   * @param date - Date to fetch games for (UTC)
   * @returns Array of scheduled games, or empty array on error/no games
   */
  async getScheduledGames(league: string, date: Date): Promise<Game[]> {
    try {
      return [];
    } catch (error) {
      console.error(`Failed to fetch scheduled games for ${league}:`, error);
      return [];
    }
  }

  /**
   * Fetch detailed game information including team stats, player stats, and scorers.
   *
   * @param gameId - Game identifier
   * @param league - League identifier
   * @returns Promise resolving to detailed game information
   */
  async getGameDetails(gameId: string, league: League): Promise<FootballGameDetails> {
    const footballLeague = league as FootballLeague;
    const teams = FootballAdapter.TEAMS[footballLeague] || FootballAdapter.TEAMS.PremierLeague;

    const mockDetails: FootballGameDetails = {
      gameId,
      league: footballLeague,
      homeTeam: {
        id: 'team-home',
        name: teams[0].name,
        abbreviation: teams[0].abbreviation,
        logoUrl: undefined
      },
      awayTeam: {
        id: 'team-away',
        name: teams[1].name,
        abbreviation: teams[1].abbreviation,
        logoUrl: undefined
      },
      status: GameState.LIVE,
      score: {
        home: 2,
        away: 1
      },
      gameContext: {
        half: 2,
        minute: 67,
        addedTime: undefined
      },
      teamStats: {
        home: this.generateMockTeamStats(55),
        away: this.generateMockTeamStats(45)
      },
      playerStats: {
        home: this.generateMockPlayerStats(teams[0].name),
        away: this.generateMockPlayerStats(teams[1].name)
      },
      scorers: this.generateMockScorers(teams[0].name, teams[1].name),
      historicalMatchup: {
        lastFiveMeetings: [
          { date: '2026-01-15', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 3, awayScore: 1, winner: 'home' },
          { date: '2025-09-22', homeTeam: teams[1].name, awayTeam: teams[0].name, homeScore: 2, awayScore: 2, winner: 'home' },
          { date: '2025-04-10', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 1, awayScore: 0, winner: 'home' },
          { date: '2024-12-05', homeTeam: teams[1].name, awayTeam: teams[0].name, homeScore: 1, awayScore: 2, winner: 'away' },
          { date: '2024-08-18', homeTeam: teams[0].name, awayTeam: teams[1].name, homeScore: 0, awayScore: 1, winner: 'away' },
        ],
        seasonSeries: { wins: 1, losses: 0, leader: 'home' },
        allTimeRecord: { wins: 45, losses: 38, leader: 'home' },
        averageCombinedPoints: 3.2
      }
    };

    return mockDetails;
  }

  /**
   * Generate mock team stats with given possession percentage.
   */
  private generateMockTeamStats(possession: number): FootballTeamStats {
    return {
      possession,
      shots: Math.floor(Math.random() * 10) + 5,
      shotsOnTarget: Math.floor(Math.random() * 5) + 2,
      corners: Math.floor(Math.random() * 8) + 1,
      fouls: Math.floor(Math.random() * 12) + 5,
      offsides: Math.floor(Math.random() * 4),
      yellowCards: Math.floor(Math.random() * 3),
      redCards: Math.random() > 0.9 ? 1 : 0,
      passes: Math.floor(Math.random() * 200) + 300,
      passAccuracy: Math.floor(Math.random() * 15) + 80,
      tackles: Math.floor(Math.random() * 15) + 10,
      saves: Math.floor(Math.random() * 5) + 1,
    };
  }

  /**
   * Generate mock player stats for a team.
   */
  private generateMockPlayerStats(teamName: string): FootballPlayerStats[] {
    const positions: Array<'GK' | 'DEF' | 'MID' | 'FWD'> = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];
    const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel'];

    return positions.map((position, index) => {
      const isGK = position === 'GK';
      const minutesPlayed = index < 11 ? (90 - Math.floor(Math.random() * 20)) : Math.floor(Math.random() * 30);

      return {
        jerseyNumber: String(index + 1),
        lastName: lastNames[index % lastNames.length],
        firstName: firstNames[index % firstNames.length],
        position,
        minutesPlayed,
        goals: isGK ? 0 : (position === 'FWD' ? Math.floor(Math.random() * 2) : (Math.random() > 0.9 ? 1 : 0)),
        assists: isGK ? 0 : Math.floor(Math.random() * 2),
        shots: isGK ? 0 : Math.floor(Math.random() * 4),
        shotsOnTarget: isGK ? 0 : Math.floor(Math.random() * 2),
        passes: Math.floor(Math.random() * 40) + 20,
        passAccuracy: Math.floor(Math.random() * 20) + 75,
        tackles: isGK ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 6),
        interceptions: Math.floor(Math.random() * 4),
        fouls: Math.floor(Math.random() * 3),
        fouled: Math.floor(Math.random() * 3),
        yellowCards: Math.random() > 0.85 ? 1 : 0,
        redCards: 0,
        saves: isGK ? Math.floor(Math.random() * 5) + 1 : undefined,
      };
    });
  }

  /**
   * Generate mock scorers for a game.
   */
  private generateMockScorers(homeTeam: string, awayTeam: string): GoalScorer[] {
    return [
      { player: 'Rodriguez', team: 'home', minute: 23, assistedBy: 'Martinez' },
      { player: 'Smith', team: 'away', minute: 45, isPenalty: true },
      { player: 'Garcia', team: 'home', minute: 67, assistedBy: 'Johnson' },
    ];
  }

  /**
   * Map API-Sports status string to our GameState enum.
   */
  private mapStatus(status: string): GameState {
    switch (status?.toUpperCase()) {
      case 'NS':
      case 'TBD':
        return GameState.SCHEDULED;
      case '1H':
      case '2H':
      case 'ET':
      case 'P':
      case 'BT':
      case 'LIVE':
        return GameState.LIVE;
      case 'HT':
        return GameState.HALFTIME;
      case 'FT':
      case 'AET':
      case 'PEN':
        return GameState.FINAL;
      case 'PST':
      case 'SUSP':
        return GameState.POSTPONED;
      case 'CANC':
      case 'ABD':
      case 'AWD':
      case 'WO':
        return GameState.CANCELLED;
      default:
        return GameState.SCHEDULED;
    }
  }
}
