'use client';

interface AssetCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export function AssetCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
}: AssetCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const changeIcons = {
    positive: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    negative: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <div className="p-4 rounded-xl bg-[#16162a] border border-purple-500/10 hover:border-purple-500/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeColors[changeType]}`}>
              {changeIcons[changeType]}
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-purple-500/10">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
