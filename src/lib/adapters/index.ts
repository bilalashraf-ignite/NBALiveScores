/**
 * Sports data adapter exports.
 *
 * Multi-league adapter factory provides unified access to basketball and football data.
 * Each league has a dedicated adapter implementing the SportsDataAdapter interface.
 *
 * Usage:
 *   const nbaAdapter = getAdapter('NBA');
 *   const games = await nbaAdapter.getLiveGames('nba');
 *   const premierLeagueAdapter = getAdapter('PremierLeague');
 *   const footballGames = await premierLeagueAdapter.getLiveGames('PremierLeague');
 */

import type { League } from '@/types/sports-data';
import type { SportsDataAdapter } from './sports-api-adapter';
import { BalldontlieAdapter } from './balldontlie-adapter';
import { NcaaAdapter } from './ncaa-adapter';
import { EuroLeagueAdapter } from './euroleague-adapter';
import { FootballAdapter } from './football-adapter';

// Singleton football adapter (same API for all football leagues)
const footballAdapter = new FootballAdapter();

// Singleton instances for each league
const adapters: Record<League, SportsDataAdapter> = {
  // Basketball leagues
  NBA: new BalldontlieAdapter(),
  NCAA: new NcaaAdapter(),
  EuroLeague: new EuroLeagueAdapter(),
  // Football leagues (all use same adapter)
  PremierLeague: footballAdapter,
  LaLiga: footballAdapter,
  Bundesliga: footballAdapter,
  SerieA: footballAdapter,
  Ligue1: footballAdapter,
};

/**
 * Get adapter instance for specified league.
 * Returns singleton instance to ensure consistent caching.
 *
 * @param league - League identifier
 * @returns Adapter instance implementing SportsDataAdapter
 * @throws Error if league not supported
 */
export function getAdapter(league: League): SportsDataAdapter {
  const adapter = adapters[league];
  if (!adapter) {
    throw new Error(`No adapter configured for league: ${league}`);
  }
  return adapter;
}

// Backward compatibility - default adapter for existing code
export const adapter = adapters.NBA;

// Named exports for direct access
export { BalldontlieAdapter, NcaaAdapter, EuroLeagueAdapter, FootballAdapter };
export type { SportsDataAdapter };
