/**
 * Type tests for sports-data domain types.
 *
 * These tests verify TypeScript interfaces compile correctly and
 * enforce expected type contracts.
 */

import {
  Game,
  GameState,
  TeamFouls,
  League,
  GameDetails,
  TeamStats,
  PlayerStats,
  HistoricalMatchup
} from '@/types/sports-data';

describe('League type', () => {
  it('accepts NBA as valid league', () => {
    const league: League = 'NBA';
    expect(league).toBe('NBA');
  });

  it('accepts NCAA as valid league', () => {
    const league: League = 'NCAA';
    expect(league).toBe('NCAA');
  });

  it('accepts EuroLeague as valid league', () => {
    const league: League = 'EuroLeague';
    expect(league).toBe('EuroLeague');
  });

  it('enforces type safety at compile time', () => {
    const validLeagues: League[] = ['NBA', 'NCAA', 'EuroLeague'];
    expect(validLeagues).toHaveLength(3);
  });
});

describe('TeamFouls interface', () => {
  it('accepts valid TeamFouls with home and away counts', () => {
    const fouls: TeamFouls = {
      home: 3,
      away: 2
    };

    expect(fouls.home).toBe(3);
    expect(fouls.away).toBe(2);
  });

  it('enforces number types for home and away', () => {
    // This test verifies TypeScript compilation
    // If TeamFouls allows non-numbers, this will fail at compile time
    const fouls: TeamFouls = {
      home: 0,
      away: 6
    };

    expect(typeof fouls.home).toBe('number');
    expect(typeof fouls.away).toBe('number');
  });
});

describe('Game interface with league field', () => {
  it('requires league field of type League', () => {
    const game: Game = {
      id: 'game-1',
      league: 'NBA',
      homeTeam: {
        id: 'team-1',
        name: 'Lakers',
        abbreviation: 'LAL'
      },
      awayTeam: {
        id: 'team-2',
        name: 'Celtics',
        abbreviation: 'BOS'
      },
      score: {
        home: 98,
        away: 95
      },
      state: GameState.LIVE,
      scheduledTime: new Date('2024-01-15T19:00:00Z')
    };

    expect(game.league).toBe('NBA');
    expect(['NBA', 'NCAA', 'EuroLeague']).toContain(game.league);
  });

  it('accepts all valid League values', () => {
    const nbaGame: Game = {
      id: 'nba-1',
      league: 'NBA',
      homeTeam: { id: '1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: '2', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 98, away: 95 },
      state: GameState.LIVE,
      scheduledTime: new Date()
    };

    const ncaaGame: Game = {
      id: 'ncaa-1',
      league: 'NCAA',
      homeTeam: { id: '1', name: 'Duke', abbreviation: 'DUKE' },
      awayTeam: { id: '2', name: 'UNC', abbreviation: 'UNC' },
      score: { home: 70, away: 68 },
      state: GameState.FINAL,
      scheduledTime: new Date()
    };

    const euroGame: Game = {
      id: 'euro-1',
      league: 'EuroLeague',
      homeTeam: { id: '1', name: 'Real Madrid', abbreviation: 'RMB' },
      awayTeam: { id: '2', name: 'Barcelona', abbreviation: 'BAR' },
      score: { home: 85, away: 82 },
      state: GameState.FINAL,
      scheduledTime: new Date()
    };

    expect(nbaGame.league).toBe('NBA');
    expect(ncaaGame.league).toBe('NCAA');
    expect(euroGame.league).toBe('EuroLeague');
  });
});

describe('Game interface with teamFouls', () => {
  const baseGame = {
    id: 'game-1',
    league: 'NBA' as League,
    homeTeam: {
      id: 'team-1',
      name: 'Lakers',
      abbreviation: 'LAL'
    },
    awayTeam: {
      id: 'team-2',
      name: 'Celtics',
      abbreviation: 'BOS'
    },
    score: {
      home: 98,
      away: 95
    },
    state: GameState.LIVE,
    scheduledTime: new Date('2024-01-15T19:00:00Z')
  };

  it('accepts Game with optional teamFouls field', () => {
    const gameWithFouls: Game = {
      ...baseGame,
      teamFouls: {
        home: 4,
        away: 3
      }
    };

    expect(gameWithFouls.teamFouls).toBeDefined();
    expect(gameWithFouls.teamFouls?.home).toBe(4);
    expect(gameWithFouls.teamFouls?.away).toBe(3);
  });

  it('allows Game objects without teamFouls field (optional)', () => {
    // This should compile successfully - teamFouls is optional
    const gameWithoutFouls: Game = {
      ...baseGame
    };

    expect(gameWithoutFouls.teamFouls).toBeUndefined();
  });

  it('allows teamFouls to be explicitly undefined', () => {
    const game: Game = {
      ...baseGame,
      teamFouls: undefined
    };

    expect(game.teamFouls).toBeUndefined();
  });
});

// ============================================================================
// PHASE 04 RED TESTS - These tests will FAIL until types are implemented
// ============================================================================

describe('GameDetails interface (RED TEST)', () => {
  it('should have all required fields', () => {
    // This test will FAIL because GameDetails type doesn't exist yet
    const mockGameDetails: GameDetails = {
      gameId: 'test-123',
      league: 'NBA' as League,
      homeTeam: { id: 'lal', name: 'Los Angeles Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'gsw', name: 'Golden State Warriors', abbreviation: 'GSW' },
      status: GameState.LIVE,
      score: { home: 95, away: 92 },
      gameContext: { period: 3, timeRemaining: '5:32' },
      teamStats: {
        home: {} as TeamStats,
        away: {} as TeamStats
      },
      playerStats: {
        home: [],
        away: []
      },
      historicalMatchup: {} as HistoricalMatchup
    };

    expect(mockGameDetails.gameId).toBe('test-123');
    expect(mockGameDetails.league).toBe('NBA');
    expect(mockGameDetails.teamStats).toBeDefined();
    expect(mockGameDetails.playerStats).toBeDefined();
    expect(mockGameDetails.historicalMatchup).toBeDefined();
  });
});

describe('TeamStats interface (RED TEST)', () => {
  it('should have all 10 required fields', () => {
    // This test will FAIL because TeamStats type doesn't exist yet
    const mockTeamStats: TeamStats = {
      fieldGoals: { made: 33, attempted: 68, percentage: 48.5 },
      threePointers: { made: 12, attempted: 30, percentage: 40.0 },
      freeThrows: { made: 18, attempted: 22, percentage: 81.8 },
      assists: 24,
      turnovers: 12,
      reboundsOffensive: 8,
      reboundsDefensive: 28,
      reboundsTotal: 36,
      steals: 7,
      blocks: 4
    };

    // Verify shooting stats structure
    expect(mockTeamStats.fieldGoals.made).toBe(33);
    expect(mockTeamStats.fieldGoals.attempted).toBe(68);
    expect(mockTeamStats.fieldGoals.percentage).toBe(48.5);

    // Verify rebound breakdown (all three types)
    expect(mockTeamStats.reboundsOffensive).toBe(8);
    expect(mockTeamStats.reboundsDefensive).toBe(28);
    expect(mockTeamStats.reboundsTotal).toBe(36);

    // Verify all other stats
    expect(mockTeamStats.assists).toBe(24);
    expect(mockTeamStats.turnovers).toBe(12);
    expect(mockTeamStats.steals).toBe(7);
    expect(mockTeamStats.blocks).toBe(4);
  });
});

describe('PlayerStats interface (RED TEST)', () => {
  it('should have all required fields', () => {
    // This test will FAIL because PlayerStats type doesn't exist yet
    const mockPlayerStats: PlayerStats = {
      jerseyNumber: '23',
      lastName: 'James',
      firstName: 'LeBron',
      minutes: '32:15',
      points: 28,
      fieldGoals: { made: 10, attempted: 18 },
      threePointers: { made: 2, attempted: 5 },
      freeThrows: { made: 6, attempted: 8 },
      rebounds: 9,
      assists: 7,
      steals: 2,
      blocks: 1
    };

    expect(mockPlayerStats.jerseyNumber).toBe('23');
    expect(mockPlayerStats.lastName).toBe('James');
    expect(mockPlayerStats.firstName).toBe('LeBron');
    expect(mockPlayerStats.minutes).toBe('32:15');
    expect(mockPlayerStats.points).toBe(28);
    expect(mockPlayerStats.fieldGoals.made).toBe(10);
    expect(mockPlayerStats.fieldGoals.attempted).toBe(18);
    expect(mockPlayerStats.rebounds).toBe(9);
    expect(mockPlayerStats.assists).toBe(7);
    expect(mockPlayerStats.steals).toBe(2);
    expect(mockPlayerStats.blocks).toBe(1);
  });
});

describe('HistoricalMatchup interface (RED TEST)', () => {
  it('should have all optional fields defined', () => {
    // This test will FAIL because HistoricalMatchup type doesn't fully exist yet
    const mockHistoricalMatchup: HistoricalMatchup = {
      lastFiveMeetings: [
        {
          date: '2026-02-15',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          homeScore: 120,
          awayScore: 115,
          winner: 'home'
        },
        {
          date: '2026-01-20',
          homeTeam: 'Warriors',
          awayTeam: 'Lakers',
          homeScore: 108,
          awayScore: 112,
          winner: 'away'
        }
      ],
      seasonSeries: {
        wins: 2,
        losses: 1,
        leader: 'home'
      },
      allTimeRecord: {
        wins: 45,
        losses: 32,
        leader: 'home'
      },
      averageCombinedPoints: 228
    };

    expect(mockHistoricalMatchup.lastFiveMeetings).toHaveLength(2);
    expect(mockHistoricalMatchup.lastFiveMeetings![0].date).toBe('2026-02-15');
    expect(mockHistoricalMatchup.lastFiveMeetings![0].homeTeam).toBe('Lakers');
    expect(mockHistoricalMatchup.lastFiveMeetings![0].awayTeam).toBe('Warriors');
    expect(mockHistoricalMatchup.lastFiveMeetings![0].homeScore).toBe(120);
    expect(mockHistoricalMatchup.lastFiveMeetings![0].awayScore).toBe(115);
    expect(mockHistoricalMatchup.lastFiveMeetings![0].winner).toBe('home');
    expect(mockHistoricalMatchup.seasonSeries?.wins).toBe(2);
    expect(mockHistoricalMatchup.seasonSeries?.losses).toBe(1);
    expect(mockHistoricalMatchup.seasonSeries?.leader).toBe('home');
    expect(mockHistoricalMatchup.allTimeRecord?.wins).toBe(45);
    expect(mockHistoricalMatchup.allTimeRecord?.losses).toBe(32);
    expect(mockHistoricalMatchup.allTimeRecord?.leader).toBe('home');
    expect(mockHistoricalMatchup.averageCombinedPoints).toBe(228);
  });

  it('should allow empty lastFiveMeetings for fallback scenario', () => {
    // This test will FAIL because HistoricalMatchup type doesn't fully exist yet
    const mockHistoricalMatchup: HistoricalMatchup = {
      lastFiveMeetings: [],
      seasonSeries: undefined,
      allTimeRecord: undefined,
      averageCombinedPoints: undefined
    };

    expect(mockHistoricalMatchup.lastFiveMeetings).toHaveLength(0);
    expect(mockHistoricalMatchup.seasonSeries).toBeUndefined();
  });

  it('should accept 5 meetings for full historical data', () => {
    // Test with exactly 5 meetings (the max we display)
    const mockHistoricalMatchup: HistoricalMatchup = {
      lastFiveMeetings: [
        { date: '2026-03-01', homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 105, awayScore: 112, winner: 'away' },
        { date: '2026-01-15', homeTeam: 'Celtics', awayTeam: 'Lakers', homeScore: 98, awayScore: 95, winner: 'home' },
        { date: '2025-12-10', homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 110, awayScore: 108, winner: 'home' },
        { date: '2025-11-22', homeTeam: 'Celtics', awayTeam: 'Lakers', homeScore: 102, awayScore: 100, winner: 'home' },
        { date: '2025-10-30', homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 115, awayScore: 113, winner: 'home' }
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
    };

    expect(mockHistoricalMatchup.lastFiveMeetings).toHaveLength(5);
    expect(mockHistoricalMatchup.lastFiveMeetings![0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should allow tied season series', () => {
    const mockHistoricalMatchup: HistoricalMatchup = {
      lastFiveMeetings: [
        { date: '2026-02-01', homeTeam: 'Duke', awayTeam: 'UNC', homeScore: 78, awayScore: 80, winner: 'away' },
        { date: '2026-01-10', homeTeam: 'UNC', awayTeam: 'Duke', homeScore: 72, awayScore: 75, winner: 'away' }
      ],
      seasonSeries: {
        wins: 1,
        losses: 1,
        leader: 'tied'
      },
      allTimeRecord: {
        wins: 145,
        losses: 115,
        leader: 'away'
      },
      averageCombinedPoints: 150
    };

    expect(mockHistoricalMatchup.seasonSeries?.leader).toBe('tied');
    expect(mockHistoricalMatchup.seasonSeries?.wins).toBe(1);
    expect(mockHistoricalMatchup.seasonSeries?.losses).toBe(1);
  });
});

// ============================================================================
// PLAN 04-03 Task 1 RED TESTS - Adapter getGameDetails with PlayerStats
// ============================================================================

describe('BalldontlieAdapter.getGameDetails with PlayerStats (RED TEST)', () => {
  it('should return GameDetails with player stats for both teams', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    expect(gameDetails).toBeDefined();
    expect(gameDetails.playerStats).toBeDefined();
    expect(gameDetails.playerStats.home).toBeDefined();
    expect(gameDetails.playerStats.away).toBeDefined();
    expect(Array.isArray(gameDetails.playerStats.home)).toBe(true);
    expect(Array.isArray(gameDetails.playerStats.away)).toBe(true);
  });

  it('should return 10-12 players per team', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    expect(gameDetails.playerStats.home.length).toBeGreaterThanOrEqual(10);
    expect(gameDetails.playerStats.home.length).toBeLessThanOrEqual(12);
    expect(gameDetails.playerStats.away.length).toBeGreaterThanOrEqual(10);
    expect(gameDetails.playerStats.away.length).toBeLessThanOrEqual(12);
  });

  it('should include realistic NBA star players (Lakers vs Celtics)', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    // Check for LeBron James on home team (Lakers)
    const lebron = gameDetails.playerStats.home.find(
      (p) => p.lastName === 'James' && p.jerseyNumber === '23'
    );
    expect(lebron).toBeDefined();
    expect(lebron?.firstName).toBe('LeBron');
    expect(lebron?.points).toBeGreaterThanOrEqual(20);
    expect(lebron?.minutes).not.toBe('0:00');

    // Check for Jayson Tatum on away team (Celtics)
    const tatum = gameDetails.playerStats.away.find(
      (p) => p.lastName === 'Tatum' && p.jerseyNumber === '0'
    );
    expect(tatum).toBeDefined();
    expect(tatum?.firstName).toBe('Jayson');
    expect(tatum?.points).toBeGreaterThanOrEqual(20);
  });

  it('should include at least one DNP player with 0:00 minutes', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    const allPlayers = [
      ...gameDetails.playerStats.home,
      ...gameDetails.playerStats.away,
    ];
    const dnpPlayers = allPlayers.filter((p) => p.minutes === '0:00');

    expect(dnpPlayers.length).toBeGreaterThanOrEqual(1);

    // DNP players should have zero stats
    dnpPlayers.forEach((dnp) => {
      expect(dnp.points).toBe(0);
      expect(dnp.fieldGoals.made).toBe(0);
      expect(dnp.fieldGoals.attempted).toBe(0);
      expect(dnp.rebounds).toBe(0);
      expect(dnp.assists).toBe(0);
    });
  });

  it('should have realistic stat distributions (starters vs bench)', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    const allPlayers = [
      ...gameDetails.playerStats.home,
      ...gameDetails.playerStats.away,
    ];

    // Filter out DNP players for this test
    const activePlayers = allPlayers.filter((p) => p.minutes !== '0:00');

    // At least 8 players (4 per team) should have significant minutes
    const startersOrRegulars = activePlayers.filter((p) => {
      const [mins] = p.minutes.split(':').map(Number);
      return mins >= 25;
    });
    expect(startersOrRegulars.length).toBeGreaterThanOrEqual(8);

    // Check points distribution (stars should score more)
    const highScorers = activePlayers.filter((p) => p.points >= 20);
    expect(highScorers.length).toBeGreaterThanOrEqual(2); // At least 2 star players
  });

  it('should have shooting stats with made-attempted structure', async () => {
    const { BalldontlieAdapter } = await import('@/lib/adapters/balldontlie-adapter');
    const adapter = new BalldontlieAdapter();
    const gameDetails = await adapter.getGameDetails('nba-1', 'NBA');

    const player = gameDetails.playerStats.home[0];

    expect(player.fieldGoals).toHaveProperty('made');
    expect(player.fieldGoals).toHaveProperty('attempted');
    expect(player.threePointers).toHaveProperty('made');
    expect(player.threePointers).toHaveProperty('attempted');
    expect(player.freeThrows).toHaveProperty('made');
    expect(player.freeThrows).toHaveProperty('attempted');

    // made should never exceed attempted
    expect(player.fieldGoals.made).toBeLessThanOrEqual(
      player.fieldGoals.attempted
    );
    expect(player.threePointers.made).toBeLessThanOrEqual(
      player.threePointers.attempted
    );
    expect(player.freeThrows.made).toBeLessThanOrEqual(
      player.freeThrows.attempted
    );
  });
});

describe('NcaaAdapter.getGameDetails with PlayerStats (RED TEST)', () => {
  it('should return GameDetails with player stats for NCAA game', async () => {
    const { NcaaAdapter } = await import('@/lib/adapters/ncaa-adapter');
    const adapter = new NcaaAdapter();
    const gameDetails = await adapter.getGameDetails('ncaa-1', 'NCAA');

    expect(gameDetails.playerStats.home).toBeDefined();
    expect(gameDetails.playerStats.away).toBeDefined();
    expect(gameDetails.playerStats.home.length).toBeGreaterThanOrEqual(10);
    expect(gameDetails.playerStats.away.length).toBeGreaterThanOrEqual(10);
  });

  it('should include at least one DNP player', async () => {
    const { NcaaAdapter } = await import('@/lib/adapters/ncaa-adapter');
    const adapter = new NcaaAdapter();
    const gameDetails = await adapter.getGameDetails('ncaa-1', 'NCAA');

    const allPlayers = [
      ...gameDetails.playerStats.home,
      ...gameDetails.playerStats.away,
    ];
    const dnpPlayers = allPlayers.filter((p) => p.minutes === '0:00');

    expect(dnpPlayers.length).toBeGreaterThanOrEqual(1);
  });
});

describe('EuroLeagueAdapter.getGameDetails with PlayerStats (RED TEST)', () => {
  it('should return GameDetails with player stats for EuroLeague game', async () => {
    const { EuroLeagueAdapter } = await import('@/lib/adapters/euroleague-adapter');
    const adapter = new EuroLeagueAdapter();
    const gameDetails = await adapter.getGameDetails('euroleague-1', 'EuroLeague');

    expect(gameDetails.playerStats.home).toBeDefined();
    expect(gameDetails.playerStats.away).toBeDefined();
    expect(gameDetails.playerStats.home.length).toBeGreaterThanOrEqual(10);
    expect(gameDetails.playerStats.away.length).toBeGreaterThanOrEqual(10);
  });

  it('should include at least one DNP player', async () => {
    const { EuroLeagueAdapter } = await import('@/lib/adapters/euroleague-adapter');
    const adapter = new EuroLeagueAdapter();
    const gameDetails = await adapter.getGameDetails('euroleague-1', 'EuroLeague');

    const allPlayers = [
      ...gameDetails.playerStats.home,
      ...gameDetails.playerStats.away,
    ];
    const dnpPlayers = allPlayers.filter((p) => p.minutes === '0:00');

    expect(dnpPlayers.length).toBeGreaterThanOrEqual(1);
  });
});
