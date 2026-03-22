'use client';

import { useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { StakeInput } from './stake-input';
import { ComboBoostPromo } from './betting-primitives';

interface BetSelection {
  id: string;
  type: string;
  odds: number;
  label: string;
}

interface BetSlipProps {
  selections: BetSelection[];
  onRemoveSelection?: (id: string) => void;
  onClearAll?: () => void;
  onPlaceBet?: (stake: number) => void;
}

export function BetSlip({
  selections,
  onRemoveSelection,
  onClearAll,
  onPlaceBet,
}: BetSlipProps) {
  const [stake, setStake] = useState(10);

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  // Round to cents precision to avoid floating-point display errors
  const potentialReturn = Math.round(stake * totalOdds * 100) / 100;

  return (
    <div className="flex flex-col h-full bg-[#16162a] rounded-xl border border-purple-500/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">BET SLIP</span>
          {selections.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
              {selections.length}
            </span>
          )}
        </div>
        {selections.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selections.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Click on odds to add selections</p>
          </div>
        ) : (
          <>
            {/* Selections */}
            {selections.map((selection) => (
              <div
                key={selection.id}
                className="relative p-3 rounded-lg bg-[#1a1a2e] border border-purple-500/10"
              >
                <button
                  onClick={() => onRemoveSelection?.(selection.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-sm text-gray-400">{selection.label}</p>
                <p className="text-lg font-bold text-purple-400">{selection.odds.toFixed(2)}</p>
              </div>
            ))}

            {/* Stake Input */}
            <StakeInput value={stake} onChange={setStake} />

            {/* Potential Return */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a2e] border border-purple-500/20">
              <span className="text-sm text-gray-400">Potential Return</span>
              <span className="text-xl font-bold text-white">${potentialReturn.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-500/10 space-y-3">
        {selections.length > 0 && (
          <GradientButton
            className="w-full"
            onClick={() => onPlaceBet?.(stake)}
          >
            Place Bet
          </GradientButton>
        )}
        <ComboBoostPromo />
      </div>
    </div>
  );
}
