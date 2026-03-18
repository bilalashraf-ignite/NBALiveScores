'use client';

import type { CricketInnings, CricketBatsmanStats, CricketBowlerStats } from '@/types/sports-data';

interface CricketScorecardProps {
  innings: CricketInnings[];
  battingStats: {
    home: CricketBatsmanStats[];
    away: CricketBatsmanStats[];
  };
  bowlingStats: {
    home: CricketBowlerStats[];
    away: CricketBowlerStats[];
  };
  homeTeamName: string;
  awayTeamName: string;
}

export function CricketScorecard({
  innings,
  battingStats,
  bowlingStats,
  homeTeamName,
  awayTeamName,
}: CricketScorecardProps) {
  return (
    <div className="space-y-6">
      {/* Innings Summary */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
        <h3 className="text-sm font-semibold text-purple-300 mb-3">Innings Summary</h3>
        <div className="space-y-2">
          {innings.map((inning) => (
            <div
              key={inning.inningsNumber}
              className={`flex items-center justify-between p-3 rounded-lg ${
                inning.isCompleted ? 'bg-gray-800/50' : 'bg-purple-500/10 border border-purple-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">
                  {inning.inningsNumber === 1 ? '1st Inn' : '2nd Inn'}
                </span>
                <span className="font-medium text-white">
                  {inning.battingTeam === 'home' ? homeTeamName : awayTeamName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-white">
                  {inning.runs}/{inning.wickets}
                </span>
                <span className="text-sm text-gray-400">
                  ({inning.overs} ov)
                </span>
                <span className="text-sm text-purple-300">
                  RR: {inning.runRate.toFixed(2)}
                </span>
                {inning.declared && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                    dec
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batting Scorecard */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 overflow-hidden">
        <div className="p-4 border-b border-purple-500/10">
          <h3 className="text-sm font-semibold text-purple-300">Batting</h3>
        </div>

        {/* Home Team Batting */}
        <div className="p-4 border-b border-purple-500/10">
          <h4 className="text-xs text-gray-500 mb-3">{homeTeamName}</h4>
          <BattingTable batsmen={battingStats.home} />
        </div>

        {/* Away Team Batting */}
        <div className="p-4">
          <h4 className="text-xs text-gray-500 mb-3">{awayTeamName}</h4>
          <BattingTable batsmen={battingStats.away} />
        </div>
      </div>

      {/* Bowling Scorecard */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 overflow-hidden">
        <div className="p-4 border-b border-purple-500/10">
          <h3 className="text-sm font-semibold text-purple-300">Bowling</h3>
        </div>

        {/* Home Team Bowling */}
        <div className="p-4 border-b border-purple-500/10">
          <h4 className="text-xs text-gray-500 mb-3">{homeTeamName}</h4>
          <BowlingTable bowlers={bowlingStats.home} />
        </div>

        {/* Away Team Bowling */}
        <div className="p-4">
          <h4 className="text-xs text-gray-500 mb-3">{awayTeamName}</h4>
          <BowlingTable bowlers={bowlingStats.away} />
        </div>
      </div>
    </div>
  );
}

function BattingTable({ batsmen }: { batsmen: CricketBatsmanStats[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left pb-2 pr-4">Batsman</th>
            <th className="text-center pb-2 px-2">R</th>
            <th className="text-center pb-2 px-2">B</th>
            <th className="text-center pb-2 px-2">4s</th>
            <th className="text-center pb-2 px-2">6s</th>
            <th className="text-center pb-2 px-2">SR</th>
          </tr>
        </thead>
        <tbody>
          {batsmen.map((batsman, index) => (
            <tr key={index} className="border-t border-gray-800/50">
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${batsman.isNotOut ? 'text-green-400' : 'text-white'}`}>
                    {batsman.name}
                    {batsman.isOnStrike && <span className="text-yellow-400 ml-1">*</span>}
                  </span>
                </div>
                {batsman.dismissal && (
                  <span className="text-xs text-gray-500">{batsman.dismissal}</span>
                )}
              </td>
              <td className="text-center py-2 px-2 font-bold text-white">{batsman.runs}</td>
              <td className="text-center py-2 px-2 text-gray-400">{batsman.balls}</td>
              <td className="text-center py-2 px-2 text-gray-400">{batsman.fours}</td>
              <td className="text-center py-2 px-2 text-gray-400">{batsman.sixes}</td>
              <td className="text-center py-2 px-2 text-purple-300">{batsman.strikeRate.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BowlingTable({ bowlers }: { bowlers: CricketBowlerStats[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left pb-2 pr-4">Bowler</th>
            <th className="text-center pb-2 px-2">O</th>
            <th className="text-center pb-2 px-2">M</th>
            <th className="text-center pb-2 px-2">R</th>
            <th className="text-center pb-2 px-2">W</th>
            <th className="text-center pb-2 px-2">Econ</th>
          </tr>
        </thead>
        <tbody>
          {bowlers.map((bowler, index) => (
            <tr key={index} className="border-t border-gray-800/50">
              <td className="py-2 pr-4">
                <span className={`font-medium ${bowler.isBowling ? 'text-green-400' : 'text-white'}`}>
                  {bowler.name}
                  {bowler.isBowling && <span className="text-yellow-400 ml-1">*</span>}
                </span>
              </td>
              <td className="text-center py-2 px-2 text-gray-400">{bowler.overs}</td>
              <td className="text-center py-2 px-2 text-gray-400">{bowler.maidens}</td>
              <td className="text-center py-2 px-2 text-gray-400">{bowler.runs}</td>
              <td className="text-center py-2 px-2 font-bold text-white">{bowler.wickets}</td>
              <td className="text-center py-2 px-2 text-purple-300">{bowler.economy.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
