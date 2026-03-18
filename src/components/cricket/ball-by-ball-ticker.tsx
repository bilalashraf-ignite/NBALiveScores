'use client';

import type { CricketOver, CricketBall, CricketBatsmanStats, CricketBowlerStats } from '@/types/sports-data';

interface BallByBallTickerProps {
  recentOvers: CricketOver[];
  lastBall?: CricketBall;
  currentBatsmen?: {
    striker: CricketBatsmanStats;
    nonStriker: CricketBatsmanStats;
  };
  currentBowler?: CricketBowlerStats;
  totalScore: number;
  wickets: number;
  overs: string;
  target?: number;
  runsNeeded?: number;
  ballsRemaining?: number;
}

export function BallByBallTicker({
  recentOvers,
  lastBall,
  currentBatsmen,
  currentBowler,
  totalScore,
  wickets,
  overs,
  target,
  runsNeeded,
  ballsRemaining,
}: BallByBallTickerProps) {
  return (
    <div className="space-y-4">
      {/* Current Score Summary */}
      <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-white">{totalScore}/{wickets}</span>
            <span className="text-gray-400 ml-2">({overs} ov)</span>
          </div>
          {target && runsNeeded !== undefined && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Need</div>
              <div className="text-xl font-bold text-purple-300">
                {runsNeeded > 0 ? `${runsNeeded} runs` : 'Won!'}
              </div>
              {ballsRemaining !== undefined && ballsRemaining > 0 && (
                <div className="text-xs text-gray-500">
                  from {ballsRemaining} balls
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Batsmen */}
      {currentBatsmen && (
        <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
          <h4 className="text-xs text-gray-500 mb-3">AT THE CREASE</h4>
          <div className="grid grid-cols-2 gap-4">
            <BatsmanCard batsman={currentBatsmen.striker} isStriker={true} />
            <BatsmanCard batsman={currentBatsmen.nonStriker} isStriker={false} />
          </div>
        </div>
      )}

      {/* Current Bowler */}
      {currentBowler && (
        <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
          <h4 className="text-xs text-gray-500 mb-3">BOWLING</h4>
          <BowlerCard bowler={currentBowler} />
        </div>
      )}

      {/* This Over */}
      {recentOvers.length > 0 && (
        <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs text-gray-500">THIS OVER</h4>
            <span className="text-sm text-white">
              Over {recentOvers[recentOvers.length - 1]?.overNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {recentOvers[recentOvers.length - 1]?.balls.map((ball, index) => (
              <BallBadge key={index} ball={ball} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Overs Summary */}
      {recentOvers.length > 1 && (
        <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
          <h4 className="text-xs text-gray-500 mb-3">RECENT OVERS</h4>
          <div className="space-y-3">
            {recentOvers.slice(0, -1).reverse().map((over) => (
              <div key={over.overNumber} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12">Over {over.overNumber}</span>
                  <span className="text-sm text-gray-400">{over.bowler}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {over.balls.map((ball, index) => (
                      <BallBadge key={index} ball={ball} size="sm" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white ml-2">
                    {over.runs} runs
                  </span>
                  {over.isMaiden && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                      M
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Ball Commentary */}
      {lastBall?.commentary && (
        <div className="bg-[#16162a] rounded-xl border border-purple-500/10 p-4">
          <h4 className="text-xs text-gray-500 mb-2">LAST BALL</h4>
          <div className="flex items-start gap-3">
            <BallBadge ball={lastBall.runs.toString()} />
            <p className="text-sm text-gray-300 flex-1">{lastBall.commentary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BatsmanCard({ batsman, isStriker }: { batsman: CricketBatsmanStats; isStriker: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${isStriker ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-gray-800/50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-medium ${isStriker ? 'text-purple-300' : 'text-white'}`}>
          {batsman.name}
          {isStriker && <span className="text-yellow-400 ml-1">*</span>}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{batsman.runs}</span>
        <span className="text-sm text-gray-400">({batsman.balls})</span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span>{batsman.fours} fours</span>
        <span>{batsman.sixes} sixes</span>
        <span className="text-purple-300">SR: {batsman.strikeRate.toFixed(1)}</span>
      </div>
    </div>
  );
}

function BowlerCard({ bowler }: { bowler: CricketBowlerStats }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium text-white">{bowler.name}</span>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span>{bowler.overs} overs</span>
          <span>{bowler.maidens} maidens</span>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white">{bowler.wickets}</span>
          <span className="text-gray-400">-</span>
          <span className="text-xl font-bold text-white">{bowler.runs}</span>
        </div>
        <span className="text-xs text-purple-300">Econ: {bowler.economy.toFixed(1)}</span>
      </div>
    </div>
  );
}

function BallBadge({ ball, size = 'md' }: { ball: string; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-xs' : 'w-8 h-8 text-sm';

  let bgColor = 'bg-gray-700';
  let textColor = 'text-white';

  switch (ball) {
    case '0':
      bgColor = 'bg-gray-600';
      textColor = 'text-gray-300';
      break;
    case '1':
    case '2':
    case '3':
      bgColor = 'bg-gray-700';
      textColor = 'text-white';
      break;
    case '4':
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      break;
    case '6':
      bgColor = 'bg-green-500';
      textColor = 'text-white';
      break;
    case 'W':
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      break;
    case 'Wd':
    case 'Nb':
      bgColor = 'bg-yellow-500';
      textColor = 'text-black';
      break;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-bold
        ${sizeClasses} ${bgColor} ${textColor}
      `}
    >
      {ball}
    </span>
  );
}
