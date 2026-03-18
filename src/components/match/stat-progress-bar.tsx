'use client';

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
