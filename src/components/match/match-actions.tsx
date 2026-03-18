'use client';

import { GradientButton } from '@/components/ui/gradient-button';

interface MatchActionsProps {
  onWatchLive?: () => void;
  onViewStats?: () => void;
  isLive?: boolean;
}

export function MatchActions({ onWatchLive, onViewStats, isLive = true }: MatchActionsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {isLive && (
        <GradientButton onClick={onWatchLive}>
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Live
        </GradientButton>
      )}
      <button
        onClick={onViewStats}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-[#1a1a2e] border border-purple-500/20
          text-gray-300 hover:border-purple-500/40 hover:text-white
          transition-all duration-200
        "
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Stats
      </button>
    </div>
  );
}
