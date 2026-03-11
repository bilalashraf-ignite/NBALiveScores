/**
 * Tests for BalldontlieAdapter mock data generation.
 *
 * Note: Phase 2 focuses on mock data structure. Network calls and real API
 * integration will be tested in Phase 3.
 */

import { BalldontlieAdapter } from '@/lib/adapters/balldontlie-adapter';
import { GameState } from '@/types/sports-data';

describe('BalldontlieAdapter mock data', () => {
  let adapter: BalldontlieAdapter;

  beforeEach(() => {
    adapter = new BalldontlieAdapter('test-api-key');
  });

  describe('getLiveGames teamFouls field', () => {
    it('returns games with teamFouls for LIVE games', async () => {
      const games = await adapter.getLiveGames('nba');

      // Find a LIVE game in the results
      const liveGame = games.find(g => g.state === GameState.LIVE);

      if (liveGame) {
        expect(liveGame.teamFouls).toBeDefined();
        expect(liveGame.teamFouls?.home).toBeGreaterThanOrEqual(0);
        expect(liveGame.teamFouls?.away).toBeGreaterThanOrEqual(0);
        expect(typeof liveGame.teamFouls?.home).toBe('number');
        expect(typeof liveGame.teamFouls?.away).toBe('number');
      }
    });

    it('returns games with teamFouls for HALFTIME games', async () => {
      const games = await adapter.getLiveGames('nba');

      // Find a HALFTIME game in the results
      const halftimeGame = games.find(g => g.state === GameState.HALFTIME);

      if (halftimeGame) {
        expect(halftimeGame.teamFouls).toBeDefined();
        expect(halftimeGame.teamFouls?.home).toBeGreaterThanOrEqual(0);
        expect(halftimeGame.teamFouls?.away).toBeGreaterThanOrEqual(0);
      }
    });

    it('returns undefined teamFouls for FINAL games', async () => {
      const games = await adapter.getLiveGames('nba');

      // Find a FINAL game in the results
      const finalGame = games.find(g => g.state === GameState.FINAL);

      if (finalGame) {
        expect(finalGame.teamFouls).toBeUndefined();
      }
    });

    it('returns undefined teamFouls for SCHEDULED games', async () => {
      const games = await adapter.getLiveGames('nba');

      // Find a SCHEDULED game in the results
      const scheduledGame = games.find(g => g.state === GameState.SCHEDULED);

      if (scheduledGame) {
        expect(scheduledGame.teamFouls).toBeUndefined();
      }
    });

    it('generates realistic fouls values in 0-6 range', async () => {
      const games = await adapter.getLiveGames('nba');

      // Check all LIVE/HALFTIME games have realistic fouls
      const liveOrHalftimeGames = games.filter(
        g => g.state === GameState.LIVE || g.state === GameState.HALFTIME
      );

      liveOrHalftimeGames.forEach(game => {
        if (game.teamFouls) {
          expect(game.teamFouls.home).toBeGreaterThanOrEqual(0);
          expect(game.teamFouls.home).toBeLessThan(7); // 0-6 range
          expect(game.teamFouls.away).toBeGreaterThanOrEqual(0);
          expect(game.teamFouls.away).toBeLessThan(7); // 0-6 range
        }
      });
    });
  });
});
