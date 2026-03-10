/**
 * Sports data adapter exports.
 *
 * To swap API providers:
 * 1. Implement SportsDataAdapter interface for new provider
 * 2. Update the default export below
 * 3. Update environment configuration
 *
 * Target time to swap: Under 4 hours (addresses PITFALLS.md #7)
 */

export { SportsDataAdapter } from './sports-api-adapter';
export { BalldontlieAdapter } from './balldontlie-adapter';

// Default adapter (can be changed via configuration)
export { BalldontlieAdapter as DefaultAdapter } from './balldontlie-adapter';
