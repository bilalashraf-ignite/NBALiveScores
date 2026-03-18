'use client';

import type { Team, Score } from '@/types/sports-data';
import { TeamShield } from './match-primitives';
import { LiveBadge } from '@/components/ui/live-badge';

interface MatchHeaderProps {
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
  status: 'live' | 'halftime' | 'finished' | 'upcoming';
  matchTime?: string;
  league?: string;
}

export function MatchHeader({
  homeTeam,
  awayTeam,
  score,
  status,
  matchTime,
  league,
}: MatchHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#252540] to-[#1a1a2e] border border-purple-500/20 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-500 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-pink-500 blur-3xl" />
      </div>

      <div className="relative">
        {/* League badge */}
        {league && (
          <div className="flex justify-center mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-wider">{league}</span>
          </div>
        )}

        {/* Teams and Score */}
        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Home Team */}
          <TeamShield team={homeTeam} size="lg" />

          {/* Score */}
          <div className="text-center">
            <div className="flex items-center gap-4">
              <span className="text-4xl md:text-5xl font-bold text-white">{score.home}</span>
              <span className="text-2xl text-gray-500">-</span>
              <span className="text-4xl md:text-5xl font-bold text-white">{score.away}</span>
            </div>
            <div className="mt-3">
              <LiveBadge
                variant={status}
                time={status === 'live' ? matchTime : undefined}
              />
            </div>
          </div>

          {/* Away Team */}
          <TeamShield team={awayTeam} size="lg" />
        </div>
      </div>
    </div>
  );
}
