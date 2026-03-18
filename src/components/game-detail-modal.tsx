'use client';

import { useRef, useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDrag } from '@use-gesture/react';
import { useGameDetails } from '@/hooks/use-game-details';
import { useModalHistory } from '@/hooks/use-modal-history';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { GameDetailSkeleton } from './game-detail-skeleton';
import { MatchHeader } from './match/match-header';
import { MatchActions } from './match/match-actions';
import { StatProgressBar } from './match/stat-progress-bar';
import { StatBox } from './match/stat-box';
import { BettingMarkets } from './betting/betting-markets';
import { BetSlip } from './betting/bet-slip';
import { FootballScorers } from './football-scorers';
import type { League } from '@/types/sports-data';
import { getSportFromLeague, isFootballGameDetails, GameState } from '@/types/sports-data';

interface GameDetailModalProps {
  gameId: string;
  league: League;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BetSelection {
  type: string;
  odds: number;
  label: string;
}

function getBadgeVariant(state: GameState): 'live' | 'halftime' | 'finished' | 'upcoming' {
  switch (state) {
    case GameState.LIVE:
      return 'live';
    case GameState.HALFTIME:
      return 'halftime';
    case GameState.FINAL:
      return 'finished';
    default:
      return 'upcoming';
  }
}

/**
 * Modal dialog for displaying detailed game information with betting interface.
 * Opens when user clicks on a game card, shows team stats, betting markets, and bet slip.
 */
export function GameDetailModal({
  gameId,
  league,
  open,
  onOpenChange
}: GameDetailModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [betSelections, setBetSelections] = useState<BetSelection[]>([]);

  const { data, loading, error } = useGameDetails(gameId, league, open);

  // Scroll lock with scrollbar compensation
  useEffect(() => {
    if (!open) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  useModalHistory(open, () => onOpenChange(false));
  const { trigger } = useHapticFeedback();

  const bind = useDrag(
    ({ down, movement: [, my] }) => {
      const clampedY = Math.max(0, Math.min(my, 150));
      if (contentRef.current) {
        if (down) {
          contentRef.current.style.transform = `translate(-50%, calc(-50% + ${clampedY}px))`;
          contentRef.current.style.opacity = `${1 - clampedY / 200}`;
        } else {
          if (my > 100) {
            trigger('nudge');
            onOpenChange(false);
          }
          contentRef.current.style.transform = '';
          contentRef.current.style.opacity = '';
        }
      }
    },
    { axis: 'y', filterTaps: true, threshold: 10 }
  );

  const handleSelectBet = (selection: BetSelection) => {
    setBetSelections(prev => {
      const exists = prev.find(s => s.type === selection.type);
      if (exists) {
        return prev.filter(s => s.type !== selection.type);
      }
      return [...prev, selection];
    });
  };

  const handleRemoveSelection = (type: string) => {
    setBetSelections(prev => prev.filter(s => s.type !== type));
  };

  const handleClearAll = () => {
    setBetSelections([]);
  };

  const getSelectedBetType = () => {
    return betSelections.length > 0 ? betSelections[betSelections.length - 1].type : null;
  };

  const getMatchTime = () => {
    if (!data) return '';
    const sport = getSportFromLeague(league);
    if (sport === 'football' && isFootballGameDetails(data) && data.gameContext) {
      return `${data.gameContext.minute}'`;
    }
    return '';
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          ref={contentRef}
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] w-[95vw] max-w-6xl overflow-hidden rounded-2xl bg-[#0f0f1a] shadow-2xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby="game-details-description"
        >
          {/* Drag handle */}
          <div
            ref={dragHandleRef}
            className="sticky top-0 z-10 flex justify-center py-3 cursor-grab active:cursor-grabbing bg-[#0f0f1a] rounded-t-2xl touch-none"
            {...bind()}
          >
            <div className="h-1.5 w-12 rounded-full bg-purple-500/30" />
          </div>

          <Dialog.Title className="sr-only">Game Details</Dialog.Title>
          <Dialog.Description id="game-details-description" className="sr-only">
            Detailed game information with betting options
          </Dialog.Description>

          <Dialog.Close className="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-full bg-[#1a1a2e] opacity-70 hover:opacity-100 transition-opacity z-20">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </Dialog.Close>

          {/* Content */}
          <div className="max-h-[calc(90vh-48px)] overflow-y-auto">
            {loading && <GameDetailSkeleton />}

            {error && (
              <div className="p-6">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-300">
                  <p className="font-semibold">Error loading game details</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              </div>
            )}

            {data && !loading && !error && (
              <div className="flex flex-col lg:flex-row">
                {/* Main Content */}
                <div className="flex-1 p-6 space-y-6">
                  {/* Match Header */}
                  <MatchHeader
                    homeTeam={data.homeTeam}
                    awayTeam={data.awayTeam}
                    score={data.score}
                    status={getBadgeVariant(data.status)}
                    matchTime={getMatchTime()}
                    league={league}
                  />

                  {/* Match Actions */}
                  <MatchActions
                    isLive={data.status === GameState.LIVE || data.status === GameState.HALFTIME}
                  />

                  {/* Goal Scorers (Football) */}
                  {isFootballGameDetails(data) && data.scorers && data.scorers.length > 0 && (
                    <FootballScorers
                      scorers={data.scorers}
                      homeTeam={data.homeTeam}
                      awayTeam={data.awayTeam}
                    />
                  )}

                  {/* Team Statistics */}
                  {data.teamStats && data.teamStats.home && data.teamStats.away && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Match Statistics</h3>
                      <div className="space-y-4 p-4 rounded-xl bg-[#16162a] border border-purple-500/10">
                        {isFootballGameDetails(data) ? (
                          <>
                            <StatProgressBar
                              label="Possession"
                              homeValue={data.teamStats.home.possession || 50}
                              awayValue={data.teamStats.away.possession || 50}
                              isPercentage
                            />
                            <StatProgressBar
                              label="Total Shots"
                              homeValue={data.teamStats.home.shots || 0}
                              awayValue={data.teamStats.away.shots || 0}
                            />
                            <StatProgressBar
                              label="Shots on Target"
                              homeValue={data.teamStats.home.shotsOnTarget || 0}
                              awayValue={data.teamStats.away.shotsOnTarget || 0}
                            />
                            <StatProgressBar
                              label="Passes"
                              homeValue={data.teamStats.home.passes || 0}
                              awayValue={data.teamStats.away.passes || 0}
                            />
                          </>
                        ) : (
                          <>
                            <StatProgressBar
                              label="Field Goals"
                              homeValue={(data.teamStats.home as { fieldGoals?: { made: number } }).fieldGoals?.made || 0}
                              awayValue={(data.teamStats.away as { fieldGoals?: { made: number } }).fieldGoals?.made || 0}
                            />
                            <StatProgressBar
                              label="Rebounds"
                              homeValue={(data.teamStats.home as { reboundsTotal?: number }).reboundsTotal || 0}
                              awayValue={(data.teamStats.away as { reboundsTotal?: number }).reboundsTotal || 0}
                            />
                            <StatProgressBar
                              label="Assists"
                              homeValue={(data.teamStats.home as { assists?: number }).assists || 0}
                              awayValue={(data.teamStats.away as { assists?: number }).assists || 0}
                            />
                          </>
                        )}
                      </div>

                      {/* Stat Boxes for Football */}
                      {isFootballGameDetails(data) && (
                        <div className="grid grid-cols-4 gap-3">
                          <StatBox
                            value={(data.teamStats.home.corners || 0) + (data.teamStats.away.corners || 0)}
                            label="Corners"
                            icon="corner"
                          />
                          <StatBox
                            value={(data.teamStats.home.yellowCards || 0) + (data.teamStats.away.yellowCards || 0)}
                            label="Yellow"
                            icon="yellow"
                          />
                          <StatBox
                            value={(data.teamStats.home.fouls || 0) + (data.teamStats.away.fouls || 0)}
                            label="Fouls"
                            icon="foul"
                          />
                          <StatBox
                            value={(data.teamStats.home.redCards || 0) + (data.teamStats.away.redCards || 0)}
                            label="Red"
                            icon="red"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Betting Markets */}
                  <BettingMarkets
                    homeTeam={data.homeTeam}
                    awayTeam={data.awayTeam}
                    onSelectBet={handleSelectBet}
                    selectedBet={getSelectedBetType()}
                  />
                </div>

                {/* Bet Slip Sidebar (Desktop) */}
                <div className="hidden lg:block w-80 border-l border-purple-500/10">
                  <BetSlip
                    selections={betSelections}
                    onRemoveSelection={handleRemoveSelection}
                    onClearAll={handleClearAll}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bet Slip (Fixed bottom) */}
          {betSelections.length > 0 && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0f0f1a] border-t border-purple-500/10">
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                onClick={() => {/* Open mobile bet slip */}}
              >
                View Bet Slip ({betSelections.length})
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
