/**
 * Type tests for sports-data domain types.
 *
 * These tests verify TypeScript interfaces compile correctly and
 * enforce expected type contracts.
 */

import { Game, GameState, TeamFouls, League } from '@/types/sports-data';

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
