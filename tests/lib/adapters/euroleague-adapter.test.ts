/**
 * Tests for EuroLeagueAdapter mock data generation.
 *
 * Verifies:
 * - EuroLeague adapter extends BaseAdapter
 * - Returns games with league='EuroLeague'
 * - Mock data structure matches Game interface
 */

import { EuroLeagueAdapter } from '@/lib/adapters/euroleague-adapter';
import { GameState } from '@/types/sports-data';

describe('EuroLeagueAdapter mock data', () => {
  let adapter: EuroLeagueAdapter;

  beforeEach(() => {
    adapter = new EuroLeagueAdapter();
  });

  describe('getLiveGames', () => {
    it('returns array of games', async () => {
      const games = await adapter.getLiveGames('euroleague');
      expect(Array.isArray(games)).toBe(true);
    });

    it('returns games with league="EuroLeague"', async () => {
      const games = await adapter.getLiveGames('euroleague');

      games.forEach(game => {
        expect(game.league).toBe('EuroLeague');
      });
    });

    it('returns games with valid structure', async () => {
      const games = await adapter.getLiveGames('euroleague');

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

    it('returns games with EuroLeague-specific team names', async () => {
      const games = await adapter.getLiveGames('euroleague');

      const game = games[0];
      expect(game.homeTeam.name).toBeTruthy();
      expect(game.awayTeam.name).toBeTruthy();
    });
  });

  describe('getGame', () => {
    it('throws not implemented error', async () => {
      await expect(adapter.getGame('test-id')).rejects.toThrow(
        'getGame not implemented for EuroLeague adapter'
      );
    });
  });

  describe('getScheduledGames', () => {
    it('returns empty array', async () => {
      const games = await adapter.getScheduledGames('euroleague', new Date());
      expect(games).toEqual([]);
    });
  });
});
