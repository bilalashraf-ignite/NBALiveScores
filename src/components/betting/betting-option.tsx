'use client';

interface BettingOptionProps {
  label: string;
  odds: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function BettingOption({
  label,
  odds,
  isSelected = false,
  onClick,
}: BettingOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-4 rounded-xl
        border transition-all duration-200 min-w-[100px]
        ${isSelected
          ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500/50 ring-2 ring-purple-500/30'
          : 'bg-[#1a1a2e] border-purple-500/10 hover:border-purple-500/30'
        }
      `}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-purple-400'}`}>
        {odds.toFixed(2)}
      </span>
    </button>
  );
}
