'use client';

import { useState, useCallback, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSSE } from '@/hooks/useSSE';
import { Game, League } from '@/types/sports-data';
import { GameList } from '@/components/game-list';
import { LeagueFilter } from '@/components/league-filter';
import { GameCardSkeleton } from '@/components/game-card-skeleton';
import { StaleDataBanner } from '@/components/stale-data-banner';
import { ErrorFallback } from '@/components/error-fallback';

/**
 * Home page integrating SSE streaming with game display and error handling.
 *
 * Features:
 * - SSE connection for live score updates (LIVE-07)
 * - Loading skeletons during initial load (UX-05)
 * - Stale data warning when disconnected (UX-04)
 * - Manual refresh capability (LIVE-08)
 * - Error boundary for graceful error handling (UX-03)
 *
 * Pattern source: RESEARCH.md Pattern 2 (SSE) + Pattern 4 (Error Boundary)
 */
export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | 'all'>('all');

  // SSE connection for live updates
  const { data: games, isConnected, error, reconnect } = useSSE<Game[]>({
    url: '/api/scores/live',
  });

  // Update timestamp when new data arrives
  useEffect(() => {
    if (games) {
      setLastUpdated(new Date());
    }
  }, [games]);

  // Manual refresh handler (LIVE-08)
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/scores/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: 'nba' }),
      });
      if (!response.ok) throw new Error('Refresh failed');
      // SSE will pick up the updated data automatically
      setTimeout(() => setIsRefreshing(false), 1000); // Brief feedback
    } catch (err) {
      console.error('Manual refresh error:', err);
      setIsRefreshing(false);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reconnect}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with manual refresh button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Live Basketball Scores</h1>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            title="Refresh scores"
          >
            {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>

        {/* League filter */}
        {games && (
          <LeagueFilter
            games={games}
            selectedLeague={selectedLeague}
            onSelectLeague={setSelectedLeague}
          />
        )}

        {/* Stale data warning - show when disconnected but have cached data */}
        {!isConnected && games && lastUpdated && (
          <StaleDataBanner lastUpdated={lastUpdated} onRefresh={handleManualRefresh} />
        )}

        {/* Loading state - show skeletons while waiting for initial data */}
        {!games && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Game list - show when data available */}
        {games && (
          <GameList
            games={games}
            selectedLeague={selectedLeague}
            lastUpdated={lastUpdated || undefined}
          />
        )}

        {/* Error state - handled by ErrorBoundary */}
        {/* If error thrown during render, ErrorFallback shown automatically */}
      </div>
    </ErrorBoundary>
  );
}
