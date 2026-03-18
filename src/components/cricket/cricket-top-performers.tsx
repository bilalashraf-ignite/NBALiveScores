'use client';

import type { CricketBatsmanStats, CricketBowlerStats, Team } from '@/types/sports-data';

interface CricketTopPerformersProps {
  battingStats: {
    home: CricketBatsmanStats[];
    away: CricketBatsmanStats[];
  };
  bowlingStats: {
    home: CricketBowlerStats[];
    away: CricketBowlerStats[];
  };
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Cricket top performers display component.
 * Shows top run scorers and wicket takers split by home and away teams.
 * Similar to FootballScorers but for cricket.
 */
export function CricketTopPerformers({
  battingStats,
  bowlingStats,
  homeTeam,
  awayTeam,
}: CricketTopPerformersProps) {
  // Get top 3 batsmen from each team (sorted by runs)
  const topHomeBatsmen = [...battingStats.home]
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3);
  const topAwayBatsmen = [...battingStats.away]
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3);

  // Get top wicket takers from each team (sorted by wickets)
  const topHomeBowlers = [...bowlingStats.home]
    .filter((b) => b.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 3);
  const topAwayBowlers = [...bowlingStats.away]
    .filter((b) => b.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Top Run Scorers */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
        <h3 className="text-sm font-semibold text-purple-300 mb-4 text-center">
          Top Run Scorers
        </h3>
        <div className="flex justify-between gap-4">
          {/* Home team batsmen */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-3 font-medium">
              {homeTeam.abbreviation}
            </div>
            {topHomeBatsmen.length === 0 ? (
              <div className="text-sm text-gray-500">-</div>
            ) : (
              <div className="space-y-2">
                {topHomeBatsmen.map((batsman, index) => (
                  <BatsmanRow key={index} batsman={batsman} rank={index + 1} />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px bg-purple-500/20" />

          {/* Away team batsmen */}
          <div className="flex-1 text-right">
            <div className="text-xs text-gray-500 mb-3 font-medium">
              {awayTeam.abbreviation}
            </div>
            {topAwayBatsmen.length === 0 ? (
              <div className="text-sm text-gray-500">-</div>
            ) : (
              <div className="space-y-2">
                {topAwayBatsmen.map((batsman, index) => (
                  <BatsmanRow key={index} batsman={batsman} rank={index + 1} align="right" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Wicket Takers */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
        <h3 className="text-sm font-semibold text-purple-300 mb-4 text-center">
          Top Wicket Takers
        </h3>
        <div className="flex justify-between gap-4">
          {/* Home team bowlers */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-3 font-medium">
              {homeTeam.abbreviation}
            </div>
            {topHomeBowlers.length === 0 ? (
              <div className="text-sm text-gray-500">No wickets</div>
            ) : (
              <div className="space-y-2">
                {topHomeBowlers.map((bowler, index) => (
                  <BowlerRow key={index} bowler={bowler} rank={index + 1} />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px bg-purple-500/20" />

          {/* Away team bowlers */}
          <div className="flex-1 text-right">
            <div className="text-xs text-gray-500 mb-3 font-medium">
              {awayTeam.abbreviation}
            </div>
            {topAwayBowlers.length === 0 ? (
              <div className="text-sm text-gray-500">No wickets</div>
            ) : (
              <div className="space-y-2">
                {topAwayBowlers.map((bowler, index) => (
                  <BowlerRow key={index} bowler={bowler} rank={index + 1} align="right" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BatsmanRow({
  batsman,
  rank,
  align = 'left',
}: {
  batsman: CricketBatsmanStats;
  rank: number;
  align?: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
      {/* Rank badge */}
      <span
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}
        `}
      >
        {rank}
      </span>

      {/* Player info */}
      <div className={isRight ? 'text-right' : ''}>
        <div className="flex items-center gap-1">
          <span className={`font-medium text-white ${isRight ? 'order-2' : ''}`}>
            {batsman.name}
          </span>
          {batsman.isNotOut && (
            <span className={`text-xs text-green-400 ${isRight ? 'order-1' : ''}`}>*</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-bold text-purple-300">{batsman.runs}</span>
          <span>({batsman.balls})</span>
          {batsman.fours > 0 && <span>{batsman.fours}x4</span>}
          {batsman.sixes > 0 && <span>{batsman.sixes}x6</span>}
        </div>
      </div>
    </div>
  );
}

function BowlerRow({
  bowler,
  rank,
  align = 'left',
}: {
  bowler: CricketBowlerStats;
  rank: number;
  align?: 'left' | 'right';
}) {
  const isRight = align === 'right';

  return (
    <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : ''}`}>
      {/* Rank badge */}
      <span
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          ${rank === 1 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}
        `}
      >
        {rank}
      </span>

      {/* Player info */}
      <div className={isRight ? 'text-right' : ''}>
        <div className="font-medium text-white">{bowler.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-bold text-purple-300">
            {bowler.wickets}/{bowler.runs}
          </span>
          <span>({bowler.overs} ov)</span>
          <span className={bowler.economy < 6 ? 'text-green-400' : bowler.economy > 10 ? 'text-red-400' : ''}>
            Econ: {bowler.economy.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
