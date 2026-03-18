'use client';

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: string[];
}

const defaultTabs = ['All', 'Goals', 'Halves', 'Cards', 'Corners'];

export function MarketTabs({
  activeTab,
  onTabChange,
  tabs = defaultTabs,
}: MarketTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
            transition-all duration-200
            ${activeTab === tab
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-purple-500/10 hover:border-purple-500/30'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
