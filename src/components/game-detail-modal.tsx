'use client';

import { useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDrag } from '@use-gesture/react';
import { useGameDetails } from '@/hooks/use-game-details';
import { useModalHistory } from '@/hooks/use-modal-history';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { GameDetailSkeleton } from './game-detail-skeleton';
import { TeamStatsTable } from './team-stats-table';
import { PlayerStatsTable } from './player-stats-table';
import { HistoricalMatchup } from './historical-matchup';
import { FootballTeamStatsTable } from './football-team-stats-table';
import { FootballPlayerStatsTable } from './football-player-stats-table';
import { FootballScorers } from './football-scorers';
import type { League } from '@/types/sports-data';
import { getSportFromLeague, isFootballGameDetails } from '@/types/sports-data';

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
  // Ref for direct DOM manipulation (no React state for transform)
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch game details on-demand when modal opens
  const { data, loading, error } = useGameDetails(gameId, league, open);

  // Scroll lock with scrollbar compensation to prevent page jump
  useEffect(() => {
    if (!open) return;

    // Calculate scrollbar width (varies by OS/browser: 0-17px)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Store original scroll position
    const scrollY = window.scrollY;

    // Lock scroll with compensation
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // Restore scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Integrate with browser history for back button support
  useModalHistory(open, () => onOpenChange(false));

  // Haptic feedback
  const { trigger } = useHapticFeedback();

  // Swipe-to-close gesture using @use-gesture/react
  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy] }) => {
      // Only allow downward drag
      const clampedY = Math.max(0, Math.min(my, 100));

      // Apply transform directly to DOM via ref (no React re-render)
      if (contentRef.current) {
        if (down) {
          // During drag - update transform
          contentRef.current.style.transform = `translate(-50%, calc(-50% + ${clampedY}px))`;
        } else {
          // Released - check if threshold crossed
          if (my > 100) {
            // Crossed threshold - trigger close
            trigger('nudge');
            onOpenChange(false);
          }
          // Reset transform
          contentRef.current.style.transform = 'translate(-50%, -50%)';
        }
      }
    },
    {
      axis: 'y',
      filterTaps: true,
      bounds: { top: 0, bottom: 100 },
      rubberband: true,
      threshold: 10,
    }
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal content with swipe-to-close gesture */}
        <Dialog.Content
          ref={contentRef}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:bg-gray-800"
          aria-describedby="game-details-description"
          {...bind()}
        >
          {/* Accessible title (visually hidden) */}
          <Dialog.Title className="sr-only">Game Details</Dialog.Title>

          {/* Accessible description */}
          <Dialog.Description id="game-details-description" className="sr-only">
            Detailed information about the game including scores, team statistics, player statistics, and historical matchup data.
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
                      <p className="text-lg font-semibold text-foreground">{data.awayTeam.name}</p>
                      <p className="text-3xl font-bold text-foreground">{data.score.away}</p>
                    </div>

                    {/* VS divider */}
                    <div className="text-gray-500 dark:text-gray-400">VS</div>

                    {/* Home team */}
                    <div className="flex-1 text-left">
                      <p className="text-lg font-semibold text-foreground">{data.homeTeam.name}</p>
                      <p className="text-3xl font-bold text-foreground">{data.score.home}</p>
                    </div>
                  </div>

                  {/* Game context - sport-aware display */}
                  {getSportFromLeague(league) === 'football' && isFootballGameDetails(data) && data.gameContext && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {data.gameContext.half === 1 ? '1st Half' : '2nd Half'} - {data.gameContext.minute}'
                      {data.gameContext.addedTime && data.gameContext.addedTime > 0 && `+${data.gameContext.addedTime}`}
                    </div>
                  )}
                  {getSportFromLeague(league) === 'basketball' && 'gameContext' in data && data.gameContext && 'period' in data.gameContext && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Q{data.gameContext.period} - {data.gameContext.timeRemaining}
                      {'possession' in data.gameContext && data.gameContext.possession && (
                        <span className="ml-2">
                          ({data.gameContext.possession === 'home' ? data.homeTeam.abbreviation : data.awayTeam.abbreviation} possession)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  <div className="mt-1 text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {data.status}
                  </div>
                </div>

                {/* Football: Goal Scorers Section */}
                {isFootballGameDetails(data) && data.scorers && data.scorers.length > 0 && (
                  <FootballScorers
                    scorers={data.scorers}
                    homeTeam={data.homeTeam}
                    awayTeam={data.awayTeam}
                  />
                )}

                {/* Team Statistics Section - Sport-aware */}
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">Team Statistics</h2>
                  {data.teamStats && data.teamStats.home && data.teamStats.away ? (
                    isFootballGameDetails(data) ? (
                      <FootballTeamStatsTable
                        homeStats={data.teamStats.home}
                        awayStats={data.teamStats.away}
                        homeTeam={data.homeTeam}
                        awayTeam={data.awayTeam}
                      />
                    ) : (
                      <TeamStatsTable
                        homeStats={data.teamStats.home}
                        awayStats={data.teamStats.away}
                        homeTeam={data.homeTeam}
                        awayTeam={data.awayTeam}
                      />
                    )
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Team statistics unavailable</p>
                  )}
                </div>

                {/* Player Statistics Section - Sport-aware */}
                <div>
                  <h2 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">Player Statistics</h2>
                  {data.playerStats && data.playerStats.home && data.playerStats.away ? (
                    isFootballGameDetails(data) ? (
                      <FootballPlayerStatsTable
                        homeStats={data.playerStats.home}
                        awayStats={data.playerStats.away}
                        homeTeam={data.homeTeam}
                        awayTeam={data.awayTeam}
                      />
                    ) : (
                      <PlayerStatsTable
                        homeStats={data.playerStats.home}
                        awayStats={data.playerStats.away}
                        homeTeam={data.homeTeam}
                        awayTeam={data.awayTeam}
                      />
                    )
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Player statistics unavailable</p>
                  )}
                </div>

                {/* Historical Matchup Section */}
                <div>
                  <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">Historical Matchup</h2>
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
