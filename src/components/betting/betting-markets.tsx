'use client';

import { useState } from 'react';
import { MarketTabs, BettingOption } from './betting-primitives';
import type { Team } from '@/types/sports-data';

interface MarketOdds {
  over: number;
  under: number;
}

interface BettingMarketsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  goalsOdds?: MarketOdds;
  cardsOdds?: MarketOdds;
  cornersOdds?: MarketOdds;
  onSelectBet?: (selection: { type: string; odds: number; label: string }) => void;
  selectedBet?: string | null;
}

export function BettingMarkets({
  homeTeam,
  awayTeam,
  homeOdds = 1.45,
  drawOdds = 4.20,
  awayOdds = 6.80,
  goalsOdds = { over: 1.85, under: 1.95 },
  cardsOdds = { over: 1.75, under: 2.05 },
  cornersOdds = { over: 1.90, under: 1.90 },
  onSelectBet,
  selectedBet,
}: BettingMarketsProps) {
  const [activeTab, setActiveTab] = useState('All');

  const handleBetClick = (type: string, odds: number, label: string) => {
    onSelectBet?.({ type, odds, label });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Main Markets</h3>
        <MarketTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Match Result */}
      <div className="space-y-3">
        <h4 className="text-sm text-gray-400 uppercase tracking-wide">Match Result</h4>
        <div className="grid grid-cols-3 gap-3">
          <BettingOption
            label={homeTeam.name}
            odds={homeOdds}
            isSelected={selectedBet === 'home'}
            onClick={() => handleBetClick('home', homeOdds, `${homeTeam.name} to Win`)}
          />
          <BettingOption
            label="Draw"
            odds={drawOdds}
            isSelected={selectedBet === 'draw'}
            onClick={() => handleBetClick('draw', drawOdds, 'Draw')}
          />
          <BettingOption
            label={awayTeam.name}
            odds={awayOdds}
            isSelected={selectedBet === 'away'}
            onClick={() => handleBetClick('away', awayOdds, `${awayTeam.name} to Win`)}
          />
        </div>
      </div>

      {/* Goals market */}
      {(activeTab === 'All' || activeTab === 'Goals') && (
        <div className="space-y-3">
          <h4 className="text-sm text-gray-400 uppercase tracking-wide">Over/Under 2.5 Goals</h4>
          <div className="grid grid-cols-2 gap-3">
            <BettingOption
              label="Over 2.5"
              odds={goalsOdds.over}
              isSelected={selectedBet === 'over25'}
              onClick={() => handleBetClick('over25', goalsOdds.over, 'Over 2.5 Goals')}
            />
            <BettingOption
              label="Under 2.5"
              odds={goalsOdds.under}
              isSelected={selectedBet === 'under25'}
              onClick={() => handleBetClick('under25', goalsOdds.under, 'Under 2.5 Goals')}
            />
          </div>
        </div>
      )}

      {/* Cards market */}
      {(activeTab === 'All' || activeTab === 'Cards') && (
        <div className="space-y-3">
          <h4 className="text-sm text-gray-400 uppercase tracking-wide">Total Cards</h4>
          <div className="grid grid-cols-2 gap-3">
            <BettingOption
              label="Over 4.5"
              odds={cardsOdds.over}
              isSelected={selectedBet === 'cards_over'}
              onClick={() => handleBetClick('cards_over', cardsOdds.over, 'Over 4.5 Cards')}
            />
            <BettingOption
              label="Under 4.5"
              odds={cardsOdds.under}
              isSelected={selectedBet === 'cards_under'}
              onClick={() => handleBetClick('cards_under', cardsOdds.under, 'Under 4.5 Cards')}
            />
          </div>
        </div>
      )}

      {/* Corners market */}
      {(activeTab === 'All' || activeTab === 'Corners') && (
        <div className="space-y-3">
          <h4 className="text-sm text-gray-400 uppercase tracking-wide">Total Corners</h4>
          <div className="grid grid-cols-2 gap-3">
            <BettingOption
              label="Over 9.5"
              odds={cornersOdds.over}
              isSelected={selectedBet === 'corners_over'}
              onClick={() => handleBetClick('corners_over', cornersOdds.over, 'Over 9.5 Corners')}
            />
            <BettingOption
              label="Under 9.5"
              odds={cornersOdds.under}
              isSelected={selectedBet === 'corners_under'}
              onClick={() => handleBetClick('corners_under', cornersOdds.under, 'Under 9.5 Corners')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
