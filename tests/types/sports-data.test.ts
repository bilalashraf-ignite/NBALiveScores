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
    // This test will FAIL because HistoricalMatchup type doesn't exist yet
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
    expect(mockHistoricalMatchup.lastFiveMeetings![0].winner).toBe('home');
    expect(mockHistoricalMatchup.seasonSeries?.wins).toBe(2);
    expect(mockHistoricalMatchup.allTimeRecord?.wins).toBe(45);
    expect(mockHistoricalMatchup.averageCombinedPoints).toBe(228);
  });

  it('should allow empty lastFiveMeetings for fallback scenario', () => {
    // This test will FAIL because HistoricalMatchup type doesn't exist yet
    const mockHistoricalMatchup: HistoricalMatchup = {
      lastFiveMeetings: [],
      seasonSeries: undefined,
      allTimeRecord: undefined,
      averageCombinedPoints: undefined
    };

    expect(mockHistoricalMatchup.lastFiveMeetings).toHaveLength(0);
    expect(mockHistoricalMatchup.seasonSeries).toBeUndefined();
  });
});
