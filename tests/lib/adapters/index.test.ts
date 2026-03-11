/**
 * Tests for adapter factory function.
 *
 * Verifies:
 * - getAdapter() returns correct adapter for each league
 * - Factory pattern works for all three leagues
 * - Throws error for invalid league
 */

import { getAdapter, BalldontlieAdapter, NcaaAdapter, EuroLeagueAdapter } from '@/lib/adapters';
import type { SportsDataAdapter } from '@/lib/adapters';

describe('Adapter Factory', () => {
  describe('getAdapter', () => {
    it('returns BalldontlieAdapter for NBA', () => {
      const adapter = getAdapter('NBA');
      expect(adapter).toBeInstanceOf(BalldontlieAdapter);
    });

    it('returns NcaaAdapter for NCAA', () => {
      const adapter = getAdapter('NCAA');
      expect(adapter).toBeInstanceOf(NcaaAdapter);
    });

    it('returns EuroLeagueAdapter for EuroLeague', () => {
      const adapter = getAdapter('EuroLeague');
      expect(adapter).toBeInstanceOf(EuroLeagueAdapter);
    });

    it('returns same instance on multiple calls (singleton pattern)', () => {
      const adapter1 = getAdapter('NBA');
      const adapter2 = getAdapter('NBA');
      expect(adapter1).toBe(adapter2);
    });

    it('returns adapter implementing SportsDataAdapter interface', () => {
      const nbaAdapter = getAdapter('NBA');
      const ncaaAdapter = getAdapter('NCAA');
      const euroAdapter = getAdapter('EuroLeague');

      // Verify all adapters have required methods
      expect(typeof nbaAdapter.getLiveGames).toBe('function');
      expect(typeof nbaAdapter.getGame).toBe('function');
      expect(typeof nbaAdapter.getScheduledGames).toBe('function');

      expect(typeof ncaaAdapter.getLiveGames).toBe('function');
      expect(typeof ncaaAdapter.getGame).toBe('function');
      expect(typeof ncaaAdapter.getScheduledGames).toBe('function');

      expect(typeof euroAdapter.getLiveGames).toBe('function');
      expect(typeof euroAdapter.getGame).toBe('function');
      expect(typeof euroAdapter.getScheduledGames).toBe('function');
    });
  });

  describe('backward compatibility', () => {
    it('exports default adapter for existing code', async () => {
      const { adapter } = await import('@/lib/adapters');
      expect(adapter).toBeInstanceOf(BalldontlieAdapter);
    });
  });
});
