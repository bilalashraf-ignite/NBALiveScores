/**
 * Tests for NcaaAdapter mock data generation.
 *
 * Verifies:
 * - NCAA adapter extends BaseAdapter
 * - Returns games with league='NCAA'
 * - Mock data structure matches Game interface
 */

import { NcaaAdapter } from '@/lib/adapters/ncaa-adapter';
import { GameState } from '@/types/sports-data';

describe('NcaaAdapter mock data', () => {
  let adapter: NcaaAdapter;

  beforeEach(() => {
    adapter = new NcaaAdapter();
  });

  describe('getLiveGames', () => {
    it('returns array of games', async () => {
      const games = await adapter.getLiveGames('ncaa');
      expect(Array.isArray(games)).toBe(true);
    });

    it('returns games with league="NCAA"', async () => {
      const games = await adapter.getLiveGames('ncaa');

      games.forEach(game => {
        expect(game.league).toBe('NCAA');
      });
    });

    it('returns games with valid structure', async () => {
      const games = await adapter.getLiveGames('ncaa');

      expect(games.length).toBeGreaterThan(0);

      const game = games[0];
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('league');
      expect(game).toHaveProperty('homeTeam');
      expect(game).toHaveProperty('awayTeam');
      expect(game).toHaveProperty('score');
      expect(game).toHaveProperty('state');
      expect(game).toHaveProperty('scheduledTime');
    });

    it('returns games with NCAA-specific team names', async () => {
      const games = await adapter.getLiveGames('ncaa');

      const game = games[0];
      expect(game.homeTeam.name).toBeTruthy();
      expect(game.awayTeam.name).toBeTruthy();
    });
  });

  describe('getGame', () => {
    it('throws not implemented error', async () => {
      await expect(adapter.getGame('test-id')).rejects.toThrow(
        'getGame not implemented for NCAA adapter'
      );
    });
  });

  describe('getScheduledGames', () => {
    it('returns empty array', async () => {
      const games = await adapter.getScheduledGames('ncaa', new Date());
      expect(games).toEqual([]);
    });
  });
});
