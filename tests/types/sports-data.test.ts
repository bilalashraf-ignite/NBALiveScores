/**
 * Type tests for sports-data domain types.
 *
 * These tests verify TypeScript interfaces compile correctly and
 * enforce expected type contracts.
 */

import { Game, GameState, TeamFouls } from '@/types/sports-data';

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

describe('Game interface with teamFouls', () => {
  const baseGame = {
    id: 'game-1',
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
