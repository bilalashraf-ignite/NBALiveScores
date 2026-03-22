import { NextRequest, NextResponse } from 'next/server';
import { getAdapter } from '@/lib/adapters';
import type { League } from '@/types/sports-data';
import { VALID_LEAGUES } from '@/types/sports-data';
import { apiLogger } from '@/lib/logger';

/**
 * GET /api/games/[league]/[gameId]/details
 *
 * Fetches detailed game information including team stats, player stats, and historical matchup.
 * Called on-demand when user opens game detail modal.
 *
 * @param request - Next.js request object
 * @param params - Route parameters { league, gameId }
 * @returns JSON response with GameDetails or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ league: string; gameId: string }> }
) {
  try {
    const { league, gameId } = await params;

    // Validate league parameter
    if (!VALID_LEAGUES.includes(league as League)) {
      return NextResponse.json(
        { error: `Invalid league: ${league}. Must be one of: ${VALID_LEAGUES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate gameId parameter
    if (!gameId || gameId.trim() === '') {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Get adapter for league and fetch game details
    const adapter = getAdapter(league as League);
    const gameDetails = await adapter.getGameDetails(gameId, league as League);

    return NextResponse.json(gameDetails);
  } catch (error) {
    apiLogger.error({ err: error }, 'Failed to fetch game details');

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch game details: ${message}` },
      { status: 500 }
    );
  }
}
