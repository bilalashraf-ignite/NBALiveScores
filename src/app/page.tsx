'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { useSSE } from '@/hooks/useSSE';
import { useNetworkType } from '@/hooks/useNetworkType';
import { Game, League } from '@/types/sports-data';
import { GameList } from '@/components/game-list';
import { LeagueFilter } from '@/components/league-filter';
import { GameCardSkeleton } from '@/components/game-card-skeleton';
import { StaleDataBanner } from '@/components/stale-data-banner';
import { ErrorFallback } from '@/components/error-fallback';
import { GameDetailSkeleton } from '@/components/game-detail-skeleton';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { ThemeToggle } from '@/components/theme-toggle';

// Lazy load GameDetailModal with skeleton fallback
// ssr: false because modal uses browser-only APIs (window.history in useModalHistory hook)
const GameDetailModal = dynamic(() => import('@/components/game-detail-modal').then(mod => ({ default: mod.GameDetailModal })), {
  loading: () => <GameDetailSkeleton />,
  ssr: false,
});

/**
 * Home page integrating SSE streaming with game display and error handling.
 *
 * Features:
 * - SSE connection for live score updates (LIVE-07)
 * - Adaptive frequency based on network type (MOB-04)
 * - Loading skeletons during initial load (UX-05)
 * - Stale data warning when disconnected (UX-04)
 * - Manual refresh capability (LIVE-08)
 * - Error boundary for graceful error handling (UX-03)
 *
 * Ad-free interface per UX-02 requirement.
 * No third-party ad networks, no sponsored content, no pop-ups.
 * Clean focus on live game scores.
 *
 * Pattern source: RESEARCH.md Pattern 2 (SSE) + Pattern 4 (Error Boundary)
 */
export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | 'all'>('all');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameLeague, setSelectedGameLeague] = useState<League | null>(null);

  // Network type detection for adaptive frequency
  const { effectiveType } = useNetworkType();

  // SSE connection for live updates with adaptive frequency
  const { data: games, isConnected, error, reconnect } = useSSE<Game[]>({
    url: '/api/scores/live',
    adaptiveFrequency: true, // Enable cellular detection
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

  // Game click handler (NAV-04) - opens game detail modal
  const handleGameClick = useCallback((gameId: string, league: League) => {
    setSelectedGameId(gameId);
    setSelectedGameLeague(league);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reconnect}>
      {/* Sticky header with app title and theme toggle */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Basketball Scores</h1>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with manual refresh button */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Live Scores</h2>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="min-h-[48px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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

        {/* Network indicator - show when on slow cellular connection */}
        {(effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            <span title="Reduced update frequency to save data">📶 Data saver active</span>
          </div>
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
          <PullToRefresh onRefresh={handleManualRefresh}>
            <GameList
              games={games}
              selectedLeague={selectedLeague}
              lastUpdated={lastUpdated || undefined}
              onGameClick={handleGameClick}
            />
          </PullToRefresh>
        )}

        {/* Error state - handled by ErrorBoundary */}
        {/* If error thrown during render, ErrorFallback shown automatically */}

        {/* Game detail modal (NAV-04, STAT-05) */}
        {selectedGameId && selectedGameLeague && (
          <GameDetailModal
            gameId={selectedGameId}
            league={selectedGameLeague}
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedGameId(null);
                setSelectedGameLeague(null);
              }
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
