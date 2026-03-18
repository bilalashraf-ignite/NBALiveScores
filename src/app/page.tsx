'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { useSSE } from '@/hooks/useSSE';
import { useNetworkType } from '@/hooks/useNetworkType';
import { Game, League, Sport, getSportFromLeague } from '@/types/sports-data';
import { ErrorFallback } from '@/components/error-fallback';
import { GameDetailSkeleton } from '@/components/game-detail-skeleton';
import { PullToRefresh } from '@/components/pull-to-refresh';
import { DashboardHeader } from '@/components/header/dashboard-header';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LeftSidebar } from '@/components/sidebar/left-sidebar';
import { MatchCard } from '@/components/match/match-card';
import { FeaturedMatch } from '@/components/match/featured-match';
import { DateFilter } from '@/components/filters/date-filter';
import { ViewToggle } from '@/components/filters/view-toggle';
import { uiLogger } from '@/lib/client-logger';

// Lazy load GameDetailModal with skeleton fallback
const GameDetailModal = dynamic(() => import('@/components/game-detail-modal').then(mod => ({ default: mod.GameDetailModal })), {
  loading: () => <GameDetailSkeleton />,
  ssr: false,
});

// Sport items for sidebar
const sportsItems = [
  { id: 'football' as Sport, name: 'Football', icon: '⚽' },
  { id: 'basketball' as Sport, name: 'Basketball', icon: '🏀' },
  { id: 'cricket' as Sport, name: 'Cricket', icon: '🏏' },
];

// League colors for sidebar
const leagueColors: Record<League, string> = {
  PremierLeague: '#3d195b',
  LaLiga: '#ee8707',
  Bundesliga: '#d20515',
  SerieA: '#008fd7',
  Ligue1: '#091c3e',
  NBA: '#c8102e',
  NCAA: '#0033a0',
  EuroLeague: '#f68428',
  // Cricket leagues
  IPL: '#004ba0',
  BBL: '#00a651',
  PSL: '#00843d',
  CPL: '#e31837',
  ICC: '#1c4587',
  CountyChampionship: '#1a472a',
};

export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport>('football');
  const [selectedLeague, setSelectedLeague] = useState<League | 'all'>('all');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameLeague, setSelectedGameLeague] = useState<League | null>(null);
  const [activeTab, setActiveTab] = useState('live');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Network type detection for adaptive frequency
  const { effectiveType } = useNetworkType();

  // SSE connection for live updates with adaptive frequency
  const { data: games, isConnected, error, reconnect } = useSSE<Game[]>({
    url: '/api/scores/live',
    adaptiveFrequency: true,
  });

  // Filter games by selected sport
  const basketballGames = games?.filter(g => getSportFromLeague(g.league) === 'basketball') || [];
  const footballGames = games?.filter(g => getSportFromLeague(g.league) === 'football') || [];
  const cricketGames = games?.filter(g => getSportFromLeague(g.league) === 'cricket') || [];
  const sportGames = selectedSport === 'basketball'
    ? basketballGames
    : selectedSport === 'cricket'
      ? cricketGames
      : footballGames;

  // Filter by league if selected
  const filteredGames = selectedLeague === 'all'
    ? sportGames
    : sportGames.filter(g => g.league === selectedLeague);

  // Get unique leagues for sidebar
  const activeLeagues = [...new Set(sportGames.map(g => g.league))];

  // Reset league filter when switching sports
  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    setSelectedLeague('all');
  };

  // Update timestamp when new data arrives
  useEffect(() => {
    if (games) {
      setLastUpdated(new Date());
    }
  }, [games]);

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/scores/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league: 'nba' }),
      });
      if (!response.ok) throw new Error('Refresh failed');
      setTimeout(() => setIsRefreshing(false), 1000);
    } catch (err) {
      uiLogger.error({ err }, 'Manual refresh error');
      setIsRefreshing(false);
    }
  }, []);

  // Game click handler - opens game detail modal
  const handleGameClick = useCallback((gameId: string, league: League) => {
    setSelectedGameId(gameId);
    setSelectedGameLeague(league);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reconnect}>
      <DashboardHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <DashboardLayout
        leftSidebar={
          <LeftSidebar
            sports={sportsItems.map(sport => ({
              ...sport,
              count: sport.id === 'basketball'
                ? basketballGames.length
                : sport.id === 'cricket'
                  ? cricketGames.length
                  : footballGames.length,
            }))}
            leagues={activeLeagues.map(league => ({
              id: league,
              name: league === 'PremierLeague' ? 'Premier League' : league,
              color: leagueColors[league],
            }))}
            selectedSport={selectedSport}
            selectedLeague={selectedLeague}
            onSelectSport={handleSportChange}
            onSelectLeague={setSelectedLeague}
          />
        }
      >
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header with filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Live Matches</h1>
              <p className="text-gray-400 text-sm mt-1">
                Showing all active sports events globally
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateFilter />
              <ViewToggle view={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Network indicator */}
          {(effectiveType === '2g' || effectiveType === '3g' || effectiveType === 'slow-2g') && (
            <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 px-4 py-2 text-sm text-purple-300">
              <span>📶 Data saver active - reduced update frequency</span>
            </div>
          )}

          {/* Connection status */}
          {!isConnected && games && lastUpdated && (
            <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
              <div className="flex items-center gap-2 text-yellow-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">Connection lost. Showing cached data from {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="text-sm font-medium text-yellow-300 hover:text-yellow-200"
              >
                {isRefreshing ? 'Reconnecting...' : 'Retry'}
              </button>
            </div>
          )}

          {/* Loading state */}
          {!games && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-[#16162a] border border-purple-500/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Match cards grid */}
          {filteredGames.length > 0 && (
            <PullToRefresh onRefresh={handleManualRefresh}>
              <div className={`
                grid gap-6
                ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
                }
              `}>
                {filteredGames.map((game) => (
                  <MatchCard
                    key={game.id}
                    game={game}
                    onClick={() => handleGameClick(game.id, game.league)}
                  />
                ))}
              </div>
            </PullToRefresh>
          )}

          {/* Empty state */}
          {games && filteredGames.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                <span className="text-3xl">
                  {selectedSport === 'basketball' ? '🏀' : selectedSport === 'cricket' ? '🏏' : '⚽'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">No matches available</h3>
              <p className="text-gray-400 mt-2">
                There are no {selectedSport} matches at the moment.
              </p>
            </div>
          )}

          {/* Featured Match Section */}
          {filteredGames.length > 0 && (
            <div className="mt-8">
              <FeaturedMatch />
            </div>
          )}
        </div>

        {/* Game detail modal */}
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
      </DashboardLayout>
    </ErrorBoundary>
  );
}
