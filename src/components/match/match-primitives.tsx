'use client';

import Image from 'next/image';
import { GradientButton } from '@/components/ui/gradient-button';
import type { Team } from '@/types/sports-data';

// Stat box for displaying match statistics
interface StatBoxProps {
  value: number;
  label: string;
  icon?: 'corner' | 'yellow' | 'foul' | 'red' | 'shot' | 'save';
}

const iconMap: Record<string, string> = {
  corner: '🚩',
  yellow: '🟨',
  foul: '⚠️',
  red: '🟥',
  shot: '⚽',
  save: '🧤',
};

export function StatBox({ value, label, icon }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1a1a2e] border border-purple-500/10 min-w-[80px]">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {icon && <span className="text-sm">{iconMap[icon]}</span>}
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

// Match actions (Watch Live, Stats buttons)
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

// Stat progress bar for comparing home vs away stats
interface StatProgressBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  homeLabel?: string;
  awayLabel?: string;
  isPercentage?: boolean;
}

export function StatProgressBar({
  label,
  homeValue,
  awayValue,
  homeLabel,
  awayLabel,
  isPercentage = false,
}: StatProgressBarProps) {
  const total = homeValue + awayValue;
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;

  const formatValue = (value: number) => {
    if (isPercentage) {
      return `${Math.round(value)}%`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">
          {homeLabel || formatValue(homeValue)}
        </span>
        <span className="text-gray-400 uppercase text-xs tracking-wide">
          {label}
        </span>
        <span className="font-semibold text-white">
          {awayLabel || formatValue(awayValue)}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-[#252540]">
        <div
          className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

// Team shield with logo and name
interface TeamShieldProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const fontSizes = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function TeamShield({ team, size = 'md', showName = true }: TeamShieldProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20
          border border-purple-500/30
          flex items-center justify-center overflow-hidden
        `}
      >
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name}
            width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
            height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
            className="object-contain"
          />
        ) : (
          <span className={`font-bold text-purple-400 ${fontSizes[size]}`}>
            {team.abbreviation?.charAt(0) || team.name.charAt(0)}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-white text-center max-w-[100px] truncate">
          {team.name}
        </span>
      )}
    </div>
  );
}
