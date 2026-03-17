/**
 * SSE (Server-Sent Events) endpoint for real-time live game updates.
 *
 * Streams game data every 15 seconds using EventSource protocol.
 * Implements unidirectional server-push pattern for automatic score updates
 * without client polling overhead.
 *
 * Multi-league support with parallel fetching from:
 * - Basketball: NBA, NCAA, EuroLeague
 * - Football: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
 * Uses Promise.allSettled to ensure one failing API doesn't block others.
 *
 * Critical configuration:
 * - runtime = 'nodejs' prevents edge runtime buffering
 * - dynamic = 'force-dynamic' disables caching
 *
 * Pattern source: RESEARCH.md Pattern 1 & Pattern 4 (SSE + parallel multi-league)
 * Prevents Pitfall 2: Response buffering breaks SSE streaming
 */

import { getAdapter } from '@/lib/adapters';
import type { League, Game } from '@/types/sports-data';
import { apiLogger } from '@/lib/logger';

// CRITICAL: Prevent buffering and caching that breaks SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fetch games from all supported leagues in parallel.
 * Uses Promise.allSettled for fault tolerance - one failing API doesn't block others.
 *
 * @returns Object with combined games array and per-league error map
 */
async function fetchAllLeagues(): Promise<{
  games: Game[];
  errors: Partial<Record<League, string>>;
}> {
  const leagues: League[] = [
    // Basketball
    'NBA', 'NCAA', 'EuroLeague',
    // Football
    'PremierLeague', 'LaLiga', 'Bundesliga', 'SerieA', 'Ligue1'
  ];

  // Parallel fetches — don't wait for slow APIs
  const results = await Promise.allSettled(
    leagues.map(async (league) => {
      const adapter = getAdapter(league);
      return adapter.getLiveGames(league);
    })
  );

  const games: Game[] = [];
  const errors: Partial<Record<League, string>> = {};

  results.forEach((result, index) => {
    const league = leagues[index];
    if (result.status === 'fulfilled') {
      games.push(...result.value);
    } else {
      errors[league] = result.reason.message;
      apiLogger.error({ err: result.reason, league }, 'League fetch failed');
    }
  });

  return { games, errors };
}

/**
 * Async generator that yields game updates at client-specified frequency.
 * Fetches from all three leagues in parallel on each update.
 *
 * @param frequency - Update interval in milliseconds (clamped to 5s-60s range)
 */
async function* scoreUpdates(frequency: number) {
  const encoder = new TextEncoder();

  while (true) {
    try {
      const { games, errors } = await fetchAllLeagues();

      // Send games data (SSE format: data: <json>\n\n)
      const data = `data: ${JSON.stringify(games)}\n\n`;
      yield encoder.encode(data);

      // Optional: send errors as separate event type for per-league warnings
      if (Object.keys(errors).length > 0) {
        const errorData = `event: error\ndata: ${JSON.stringify(errors)}\n\n`;
        yield encoder.encode(errorData);
      }

      // Wait for client-specified frequency before next update
      await new Promise(resolve => setTimeout(resolve, frequency));
    } catch (error) {
      apiLogger.error({ err: error }, 'Error fetching live games');
      // Send empty array on error (graceful degradation)
      const data = `data: ${JSON.stringify([])}\n\n`;
      yield encoder.encode(data);
      await new Promise(resolve => setTimeout(resolve, frequency));
    }
  }
}

/**
 * Convert async generator to ReadableStream for Response API.
 * This bridges the generator pattern with the Streams API.
 */
function iteratorToStream(iterator: AsyncGenerator<Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

/**
 * GET handler for SSE endpoint.
 * Returns a streaming response with proper SSE headers.
 *
 * Query params:
 *   ?frequency=<ms> - Update interval (default: 15000, clamped to 5000-60000)
 *
 * Usage from client:
 *   const eventSource = new EventSource('/api/scores/live?frequency=10000');
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
 */
export async function GET(request: Request) {
  // Extract frequency from query params
  const { searchParams } = new URL(request.url);
  const rawFrequency = parseInt(searchParams.get('frequency') || '15000');

  // Clamp to safe range: 5s-60s (prevents abuse and staleness)
  const frequency = Math.max(5000, Math.min(rawFrequency, 60000));

  const stream = iteratorToStream(scoreUpdates(frequency));

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
