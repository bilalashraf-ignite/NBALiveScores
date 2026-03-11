/**
 * SSE (Server-Sent Events) endpoint for real-time live game updates.
 *
 * Streams game data every 15 seconds using EventSource protocol.
 * Implements unidirectional server-push pattern for automatic score updates
 * without client polling overhead.
 *
 * Critical configuration:
 * - runtime = 'nodejs' prevents edge runtime buffering
 * - dynamic = 'force-dynamic' disables caching
 *
 * Pattern source: RESEARCH.md Pattern 1 (verified against Next.js docs)
 * Prevents Pitfall 2: Response buffering breaks SSE streaming
 */

import { adapter } from '@/lib/adapters';
import { cache, CACHE_TTL } from '@/lib/cache';
import { Game } from '@/types/sports-data';

// CRITICAL: Prevent buffering and caching that breaks SSE
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Async generator that yields game updates every 15 seconds.
 * Implements cache-first strategy with 10-second TTL for live games.
 */
async function* scoreUpdates() {
  const encoder = new TextEncoder();

  while (true) {
    try {
      const cacheKey = cache.keys.liveGames('nba');

      // Try cache first
      let games = await cache.get<Game[]>(cacheKey);

      // On cache miss or stale data, fetch from adapter
      if (!games) {
        games = await adapter.getLiveGames('nba');
        await cache.set(cacheKey, games, CACHE_TTL.LIVE_GAME);
      }

      // Format as SSE: data: <json>\n\n (two newlines required)
      const data = `data: ${JSON.stringify(games)}\n\n`;
      yield encoder.encode(data);

      // Wait 15 seconds before next update
      await new Promise(resolve => setTimeout(resolve, 15000));
    } catch (error) {
      console.error('Error fetching live games:', error);
      // Send empty array on error (graceful degradation)
      const data = `data: ${JSON.stringify([])}\n\n`;
      yield encoder.encode(data);
      await new Promise(resolve => setTimeout(resolve, 15000));
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
 * Usage from client:
 *   const eventSource = new EventSource('/api/scores/live');
 *   eventSource.onmessage = (e) => console.log(JSON.parse(e.data));
 */
export async function GET() {
  const stream = iteratorToStream(scoreUpdates());

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
