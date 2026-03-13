'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useGameDetails } from '@/hooks/use-game-details';
import { useModalHistory } from '@/hooks/use-modal-history';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { GameDetailSkeleton } from './game-detail-skeleton';
import { TeamStatsTable } from './team-stats-table';
import { PlayerStatsTable } from './player-stats-table';
import { HistoricalMatchup } from './historical-matchup';
import type { League } from '@/types/sports-data';

interface GameDetailModalProps {
  gameId: string;
  league: League;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal dialog for displaying detailed game information.
 * Opens when user clicks on a game card, shows team stats, player stats, and historical matchup.
 *
 * Features:
 * - On-demand data fetching (only when modal opens)
 * - Browser back button support via useModalHistory
 * - Multiple dismissal methods: X button, ESC key, backdrop click, back button
 * - Loading skeleton while data fetches
 * - Smooth fade + scale animation
 *
 * Pattern from RESEARCH.md Pattern 1 (Radix UI Dialog with controlled state).
 */
export function GameDetailModal({
  gameId,
  league,
  open,
  onOpenChange
}: GameDetailModalProps) {
  // Swipe-to-close state
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);

  // Fetch game details on-demand when modal opens
  const { data, loading, error } = useGameDetails(gameId, league, open);

  // Integrate with browser history for back button support
  useModalHistory(open, () => onOpenChange(false));

  // Haptic feedback
  const { trigger } = useHapticFeedback();

  // Swipe gesture handlers
  const handleSwipeStart = (e: React.TouchEvent) => {
    setSwipeStartY(e.touches[0].clientY);
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (swipeStartY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - swipeStartY;

    // Only track downward swipes
    if (distance > 0) {
      setSwipeDistance(distance);
    }
  };

  const handleSwipeEnd = () => {
    // Close modal if swipe exceeds 100px threshold
    if (swipeDistance > 100) {
      trigger('nudge');
      onOpenChange(false);
    }

    // Reset swipe state
    setSwipeDistance(0);
    setSwipeStartY(0);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal content with swipe-to-close gesture */}
        <Dialog.Content
          className="fixed left-[50%] top-[50%] max-h-[90vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg bg-white p-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:bg-gray-800"
          aria-describedby="game-details-description"
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          style={{ transform: `translate(-50%, -50%) translateY(${Math.min(swipeDistance, 100)}px)` }}
        >
          {/* Accessible title (visually hidden) */}
          <Dialog.Title className="sr-only">Game Details</Dialog.Title>

          {/* Accessible description */}
          <Dialog.Description id="game-details-description" className="sr-only">
            Detailed information about the basketball game including scores, team statistics, player statistics, and historical matchup data.
          </Dialog.Description>

          {/* Close button (X) - Material Design 48x48px touch target */}
          <Dialog.Close className="absolute right-4 top-4 h-12 w-12 flex items-center justify-center rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* Modal content body */}
          <div className="mt-4">
            {loading && <GameDetailSkeleton />}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-900 dark:bg-red-900/20 dark:text-red-200">
                <p className="font-semibold">Error loading game details</p>
                <p className="text-sm">{error.message}</p>
              </div>
            )}

            {data && !loading && !error && (
              <div className="space-y-6">
                {/* Game info header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4">
                    {/* Away team */}
                    <div className="flex-1 text-right">
                      <p className="text-lg font-semibold">{data.awayTeam.name}</p>
                      <p className="text-3xl font-bold">{data.score.away}</p>
                    </div>

                    {/* VS divider */}
                    <div className="text-gray-500">VS</div>

                    {/* Home team */}
                    <div className="flex-1 text-left">
                      <p className="text-lg font-semibold">{data.homeTeam.name}</p>
                      <p className="text-3xl font-bold">{data.score.home}</p>
                    </div>
                  </div>

                  {/* Game context (period, time, possession) */}
                  {data.gameContext && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Q{data.gameContext.period} - {data.gameContext.timeRemaining}
                      {data.gameContext.possession && (
                        <span className="ml-2">
                          ({data.gameContext.possession === 'home' ? data.homeTeam.abbreviation : data.awayTeam.abbreviation} possession)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mt-1 text-sm font-medium uppercase tracking-wide text-gray-500">
                    {data.status}
                  </div>
                </div>

                {/* Team Statistics Section */}
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-4">Team Statistics</h2>
                  {data.teamStats && data.teamStats.home && data.teamStats.away ? (
                    <TeamStatsTable
                      homeStats={data.teamStats.home}
                      awayStats={data.teamStats.away}
                      homeTeam={data.homeTeam}
                      awayTeam={data.awayTeam}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Team statistics unavailable</p>
                  )}
                </div>

                {/* Player Statistics Section */}
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-4">Player Statistics</h2>
                  {data.playerStats && data.playerStats.home && data.playerStats.away ? (
                    <PlayerStatsTable
                      homeStats={data.playerStats.home}
                      awayStats={data.playerStats.away}
                      homeTeam={data.homeTeam}
                      awayTeam={data.awayTeam}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Player statistics unavailable</p>
                  )}
                </div>

                {/* Historical Matchup Section */}
                <div>
                  <h2 className="text-xl font-bold mt-8 mb-4">Historical Matchup</h2>
                  <HistoricalMatchup
                    data={data.historicalMatchup}
                    homeTeam={data.homeTeam}
                    awayTeam={data.awayTeam}
                  />
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
