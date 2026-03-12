/**
 * Type tests for GameDetails interface and related types.
 * These tests verify the GameDetails interface structure required for on-demand game data fetching.
 */

import { GameDetails, TeamStats, PlayerStats, HistoricalMatchup, League, GameState } from '@/types/sports-data';

describe('GameDetails interface', () => {
  it('has all required fields', () => {
    const details: GameDetails = {
      gameId: 'game-123',
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
      status: GameState.LIVE,
      score: {
        home: 98,
        away: 95
      },
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

    expect(details.gameId).toBe('game-123');
    expect(details.league).toBe('NBA');
    expect(details.homeTeam.name).toBe('Lakers');
    expect(details.awayTeam.name).toBe('Celtics');
    expect(details.teamStats).toBeDefined();
    expect(details.playerStats).toBeDefined();
    expect(details.historicalMatchup).toBeDefined();
  });

  it('accepts optional gameContext and teamFouls fields', () => {
    const details: GameDetails = {
      gameId: 'game-123',
      league: 'NBA',
      homeTeam: { id: '1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: '2', name: 'Celtics', abbreviation: 'BOS' },
      status: GameState.LIVE,
      score: { home: 98, away: 95 },
      gameContext: {
        period: 3,
        timeRemaining: '5:32',
        possession: 'home'
      },
      teamFouls: {
        home: 3,
        away: 2
      },
      teamStats: { home: {} as TeamStats, away: {} as TeamStats },
      playerStats: { home: [], away: [] },
      historicalMatchup: {} as HistoricalMatchup
    };

    expect(details.gameContext?.period).toBe(3);
    expect(details.teamFouls?.home).toBe(3);
  });

  it('enforces League type for league field', () => {
    const leagues: League[] = ['NBA', 'NCAA', 'EuroLeague'];

    leagues.forEach(league => {
      const details: GameDetails = {
        gameId: 'game-1',
        league,
        homeTeam: { id: '1', name: 'Team A', abbreviation: 'TMA' },
        awayTeam: { id: '2', name: 'Team B', abbreviation: 'TMB' },
        status: GameState.FINAL,
        score: { home: 100, away: 95 },
        teamStats: { home: {} as TeamStats, away: {} as TeamStats },
        playerStats: { home: [], away: [] },
        historicalMatchup: {} as HistoricalMatchup
      };

      expect(['NBA', 'NCAA', 'EuroLeague']).toContain(details.league);
    });
  });
});

describe('TeamStats interface (placeholder)', () => {
  it('is defined as placeholder for Plan 02', () => {
    // TeamStats will be fully defined in Plan 02
    // For now, verify it can be used as placeholder object
    const stats: TeamStats = {} as TeamStats;
    expect(stats).toBeDefined();
  });
});

describe('PlayerStats interface (placeholder)', () => {
  it('is defined as placeholder for Plan 03', () => {
    // PlayerStats will be fully defined in Plan 03
    // For now, verify it can be used as placeholder array
    const stats: PlayerStats[] = [];
    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);
  });
});

describe('HistoricalMatchup interface (placeholder)', () => {
  it('is defined as placeholder for Plan 04', () => {
    // HistoricalMatchup will be fully defined in Plan 04
    // For now, verify it can be used as placeholder object
    const matchup: HistoricalMatchup = {} as HistoricalMatchup;
    expect(matchup).toBeDefined();
  });
});
