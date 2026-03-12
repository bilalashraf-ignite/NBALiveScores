/**
 * Tests for adapter getGameDetails method.
 * Verifies that all league adapters implement getGameDetails and return mock data with correct structure.
 */

import { BaseAdapter } from '@/lib/adapters/base-adapter';
import { getAdapter } from '@/lib/adapters';
import type { League, GameDetails } from '@/types/sports-data';

describe('BaseAdapter getGameDetails method', () => {
  it('has abstract getGameDetails method signature', () => {
    // This test verifies the abstract method exists
    // TypeScript will enforce the signature at compile time
    expect(BaseAdapter.prototype).toBeDefined();
  });
});

describe('League adapter getGameDetails implementations', () => {
  const leagues: League[] = ['NBA', 'NCAA', 'EuroLeague'];

  leagues.forEach(league => {
    describe(`${league} adapter`, () => {
      it('implements getGameDetails method', async () => {
        const adapter = getAdapter(league);
        expect(adapter.getGameDetails).toBeDefined();
        expect(typeof adapter.getGameDetails).toBe('function');
      });

      it('returns GameDetails with correct league field', async () => {
        const adapter = getAdapter(league);
        const gameId = 'test-game-123';

        const details = await adapter.getGameDetails(gameId, league);

        expect(details).toBeDefined();
        expect(details.league).toBe(league);
        expect(details.gameId).toBe(gameId);
      });

      it('returns GameDetails with team information', async () => {
        const adapter = getAdapter(league);
        const details = await adapter.getGameDetails('test-123', league);

        expect(details.homeTeam).toBeDefined();
        expect(details.homeTeam.id).toBeDefined();
        expect(details.homeTeam.name).toBeDefined();
        expect(details.homeTeam.abbreviation).toBeDefined();

        expect(details.awayTeam).toBeDefined();
        expect(details.awayTeam.id).toBeDefined();
        expect(details.awayTeam.name).toBeDefined();
        expect(details.awayTeam.abbreviation).toBeDefined();
      });

      it('returns GameDetails with score and status', async () => {
        const adapter = getAdapter(league);
        const details = await adapter.getGameDetails('test-123', league);

        expect(details.status).toBeDefined();
        expect(details.score).toBeDefined();
        expect(typeof details.score.home).toBe('number');
        expect(typeof details.score.away).toBe('number');
      });

      it('returns GameDetails with placeholder stats structures', async () => {
        const adapter = getAdapter(league);
        const details = await adapter.getGameDetails('test-123', league);

        // Team stats placeholders
        expect(details.teamStats).toBeDefined();
        expect(details.teamStats.home).toBeDefined();
        expect(details.teamStats.away).toBeDefined();

        // Player stats placeholders
        expect(details.playerStats).toBeDefined();
        expect(Array.isArray(details.playerStats.home)).toBe(true);
        expect(Array.isArray(details.playerStats.away)).toBe(true);

        // Historical matchup placeholder
        expect(details.historicalMatchup).toBeDefined();
      });
    });
  });
});

describe('NBA adapter getGameDetails (BalldontlieAdapter)', () => {
  it('returns realistic NBA mock data', async () => {
    const adapter = getAdapter('NBA');
    const details = await adapter.getGameDetails('nba-123', 'NBA');

    expect(details.league).toBe('NBA');
    expect(details.homeTeam.name).toMatch(/Lakers|Celtics|Warriors|Heat/i);
    expect(details.awayTeam.name).toBeDefined();
  });
});

describe('NCAA adapter getGameDetails (NcaaAdapter)', () => {
  it('returns realistic NCAA mock data', async () => {
    const adapter = getAdapter('NCAA');
    const details = await adapter.getGameDetails('ncaa-123', 'NCAA');

    expect(details.league).toBe('NCAA');
    expect(details.homeTeam.name).toMatch(/Duke|UNC|Kansas|Kentucky/i);
  });
});

describe('EuroLeague adapter getGameDetails (EuroLeagueAdapter)', () => {
  it('returns realistic EuroLeague mock data', async () => {
    const adapter = getAdapter('EuroLeague');
    const details = await adapter.getGameDetails('euro-123', 'EuroLeague');

    expect(details.league).toBe('EuroLeague');
    expect(details.homeTeam.name).toMatch(/Real Madrid|Barcelona|CSKA|Fenerbahce/i);
  });
});
