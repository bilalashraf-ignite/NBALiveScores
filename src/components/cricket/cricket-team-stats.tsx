'use client';

import type { CricketTeamStats } from '@/types/sports-data';
import { StatProgressBar } from '@/components/match/stat-progress-bar';

interface CricketTeamStatsTableProps {
  homeStats: CricketTeamStats;
  awayStats: CricketTeamStats;
  homeTeamName: string;
  awayTeamName: string;
}

export function CricketTeamStatsTable({
  homeStats,
  awayStats,
  homeTeamName,
  awayTeamName,
}: CricketTeamStatsTableProps) {
  return (
    <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
      <h3 className="text-sm font-semibold text-purple-300 mb-4">Team Statistics</h3>

      {/* Team Headers */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="font-medium text-white">{homeTeamName}</span>
        <span className="font-medium text-white">{awayTeamName}</span>
      </div>

      <div className="space-y-4">
        {/* Total Runs */}
        <StatProgressBar
          label="Total Runs"
          homeValue={homeStats.totalRuns}
          awayValue={awayStats.totalRuns}
        />

        {/* Run Rate */}
        <StatProgressBar
          label="Run Rate"
          homeValue={homeStats.runRate}
          awayValue={awayStats.runRate}
        />

        {/* Extras */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Extras</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-white">{homeStats.extras.total}</span>
              <span className="text-xs text-gray-500">
                (W:{homeStats.extras.wides} NB:{homeStats.extras.noBalls} B:{homeStats.extras.byes} LB:{homeStats.extras.legByes})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-gray-500">
                (W:{awayStats.extras.wides} NB:{awayStats.extras.noBalls} B:{awayStats.extras.byes} LB:{awayStats.extras.legByes})
              </span>
              <span className="font-bold text-white">{awayStats.extras.total}</span>
            </div>
          </div>
        </div>

        {/* Overs */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Overs Bowled</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span>{homeStats.totalOvers}</span>
            <span>{awayStats.totalOvers}</span>
          </div>
        </div>

        {/* Partnerships */}
        {(homeStats.partnerships || awayStats.partnerships) && (
          <div className="pt-4 border-t border-purple-500/10">
            <h4 className="text-xs text-gray-500 mb-3">Partnerships</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Home Partnerships */}
              <div className="space-y-2">
                {homeStats.partnerships?.slice(0, 3).map((p, i) => (
                  <div key={i} className="text-xs">
                    <div className="text-gray-400">
                      {p.batsman1} & {p.batsman2}
                    </div>
                    <div className="font-medium text-white">
                      {p.runs} ({p.balls} balls)
                    </div>
                  </div>
                ))}
              </div>
              {/* Away Partnerships */}
              <div className="space-y-2 text-right">
                {awayStats.partnerships?.slice(0, 3).map((p, i) => (
                  <div key={i} className="text-xs">
                    <div className="text-gray-400">
                      {p.batsman1} & {p.batsman2}
                    </div>
                    <div className="font-medium text-white">
                      {p.runs} ({p.balls} balls)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
