/**
 * Manual refresh endpoint for live scores.
 *
 * User-triggered action to fetch fresh game data and update cache.
 * Uses POST method (not GET) because it has side effects: cache invalidation.
 *
 * Implements LIVE-08 requirement: Manual refresh button for user-initiated updates.
 *
 * Error handling strategy: On adapter failure, return cached data if available,
 * otherwise return helpful error message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adapter } from '@/lib/adapters';
import { cache, CACHE_TTL } from '@/lib/cache';

/**
 * POST handler for manual score refresh.
 *
 * Request body:
 * ```json
 * { "league": "nba" }
 * ```
 *
 * Response:
 * ```json
 * {
 *   "success": true,
 *   "games": [...],
 *   "timestamp": "2026-03-11T13:00:00.000Z"
 * }
 * ```
 *
 * @param request - Next.js request object
 * @returns JSON response with updated games and timestamp
 */
export async function POST(request: NextRequest) {
  try {
    // Extract league from request body (default to 'nba')
    const body = await request.json().catch(() => ({}));
    const league = body.league || 'nba';

    // Fetch fresh data from adapter
    const games = await adapter.getLiveGames(league);

    // Clear stale cache
    const cacheKey = cache.keys.liveGames(league);
    await cache.del(cacheKey);

    // Update with fresh data
    await cache.set(cacheKey, games, CACHE_TTL.LIVE_GAME);

    // Return success response with fresh data
    return NextResponse.json({
      success: true,
      games,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Manual refresh failed:', error);

    // Attempt to return cached data on adapter failure
    try {
      const league = 'nba'; // Default fallback
      const cachedGames = await cache.get(cache.keys.liveGames(league));

      if (cachedGames) {
        return NextResponse.json({
          success: true,
          games: cachedGames,
          timestamp: new Date().toISOString(),
          cached: true,
        });
      }
    } catch (cacheError) {
      console.error('Cache fallback also failed:', cacheError);
    }

    // No cached data available - return error
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to refresh scores. Please try again.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
