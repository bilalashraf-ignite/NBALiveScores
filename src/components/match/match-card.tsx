'use client';

import Image from 'next/image';
import { LiveBadge } from '@/components/ui/live-badge';
import { GradientButton } from '@/components/ui/gradient-button';
import type { Game, League } from '@/types/sports-data';
import { getSportFromLeague, GameState } from '@/types/sports-data';

interface MatchCardProps {
  game: Game;
  onClick?: () => void;
}

const leagueLabels: Record<League, string> = {
  NBA: 'NBA',
  NCAA: 'NCAA',
  EuroLeague: 'EuroLeague',
  PremierLeague: 'Premier League',
  LaLiga: 'La Liga',
  Bundesliga: 'Bundesliga',
  SerieA: 'Serie A',
  Ligue1: 'Ligue 1',
  IPL: 'IPL',
  BBL: 'Big Bash',
  PSL: 'PSL',
  CPL: 'CPL',
  ICC: 'International',
  CountyChampionship: 'County',
};

function getMatchTime(game: Game): string {
  const sport = getSportFromLeague(game.league);
  if (sport === 'football') {
    return `${game.minute || 0}'`;
  } else if (sport === 'cricket') {
    return game.overs ? `${game.overs} ov` : '';
  } else {
    return game.period ? `Q${game.period}` : '';
  }
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

export function MatchCard({ game, onClick }: MatchCardProps) {
  const isLive = game.state === GameState.LIVE || game.state === GameState.HALFTIME;
  const matchTime = getMatchTime(game);
  const badgeVariant = getBadgeVariant(game.state);

  // Mock odds for display (in real app, these would come from the API)
  const homeOdds = (1 + Math.random() * 2).toFixed(1);
  const awayOdds = (1 + Math.random() * 3).toFixed(1);

  return (
    <div
      onClick={onClick}
      className="
        group relative overflow-hidden rounded-xl
        bg-[#16162a] border border-purple-500/10
        hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5
        transition-all duration-300 cursor-pointer
      "
    >
      {/* Header with badge and league */}
      <div className="flex items-center justify-between px-4 pt-4">
        <LiveBadge
          variant={badgeVariant}
          time={isLive ? matchTime : undefined}
        />
        <span className="text-xs text-gray-500">{leagueLabels[game.league]}</span>
      </div>

      {/* Teams and Score */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden">
              {game.homeTeam.logoUrl ? (
                <Image
                  src={game.homeTeam.logoUrl}
                  alt={game.homeTeam.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-purple-400">
                  {game.homeTeam.abbreviation?.charAt(0) || game.homeTeam.name.charAt(0)}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-white truncate">
              {game.homeTeam.name}
            </p>
          </div>

          {/* Score */}
          <div className="text-center px-4">
            {getSportFromLeague(game.league) === 'cricket' ? (
              <>
                <p className="text-2xl font-bold text-white">
                  {game.runs !== undefined ? `${game.runs}/${game.wickets}` : '-'}
                </p>
                {game.overs && (
                  <p className="text-xs text-gray-400 mt-1">({game.overs} ov)</p>
                )}
                {game.target && (
                  <p className="text-xs text-purple-300 mt-1">
                    Target: {game.target}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">
                  {game.score.home} - {game.score.away}
                </p>
                {isLive && game.state === GameState.HALFTIME && (
                  <p className="text-xs text-yellow-400 mt-1">HT: {game.score.home}-{game.score.away}</p>
                )}
              </>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden">
              {game.awayTeam.logoUrl ? (
                <Image
                  src={game.awayTeam.logoUrl}
                  alt={game.awayTeam.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-purple-400">
                  {game.awayTeam.abbreviation?.charAt(0) || game.awayTeam.name.charAt(0)}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-white truncate">
              {game.awayTeam.name}
            </p>
          </div>
        </div>
      </div>

      {/* Footer with odds and bet button */}
      <div className="flex items-center gap-3 px-4 pb-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 font-semibold">
            {homeOdds}
          </span>
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 font-semibold">
            {awayOdds}
          </span>
        </div>
        <GradientButton
          size="sm"
          className="flex-1 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            // Handle bet click
          }}
        >
          Bet Now
          <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </GradientButton>
      </div>
    </div>
  );
}
