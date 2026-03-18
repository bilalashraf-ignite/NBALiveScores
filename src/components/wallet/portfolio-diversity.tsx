'use client';

import { PieChart } from '@/components/charts/pie-chart';

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
