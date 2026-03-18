'use client';

import { PieChart } from '@/components/charts/pie-chart';

// Asset card for displaying individual asset metrics
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

// Digital assets grid display
interface DigitalAssetsProps {
  totalBalance?: number;
  monthlyGrowth?: number;
  activeAssets?: number;
}

export function DigitalAssets({
  totalBalance = 12450.80,
  monthlyGrowth = 15.4,
  activeAssets = 8,
}: DigitalAssetsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Digital Assets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AssetCard
          title="Total Balance"
          value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+2.5%"
          changeType="positive"
          icon={
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <AssetCard
          title="Monthly Growth"
          value={`+${monthlyGrowth}%`}
          change="+0.8%"
          changeType="positive"
          icon={
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <AssetCard
          title="Active Assets"
          value={`${activeAssets} Tokens`}
          change="No change"
          changeType="neutral"
          icon={
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// Portfolio diversity pie chart display
interface PortfolioItem {
  name: string;
  percentage: number;
  color: string;
}

interface PortfolioDiversityProps {
  items?: PortfolioItem[];
}

const defaultItems: PortfolioItem[] = [
  { name: 'Ethereum', percentage: 68.2, color: '#627eea' },
  { name: 'Solana', percentage: 21.8, color: '#9945ff' },
  { name: 'Others', percentage: 10.0, color: '#6366f1' },
];

export function PortfolioDiversity({ items = defaultItems }: PortfolioDiversityProps) {
  const chartData = items.map(item => ({
    label: item.name,
    value: item.percentage,
    color: item.color,
  }));

  return (
    <div className="p-4 rounded-xl bg-[#16162a] border border-purple-500/10">
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
        Portfolio Diversity
      </h4>

      <div className="flex items-center gap-6">
        <PieChart data={chartData} size={100} />

        <div className="flex-1 space-y-2">
          <p className="text-sm text-gray-300 mb-3">ETH Focused</p>
          {items.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-400 flex-1">{item.name}</span>
              <span className="text-sm font-medium text-white">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
