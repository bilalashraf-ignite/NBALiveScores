'use client';

import { AssetCard } from './asset-card';

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
