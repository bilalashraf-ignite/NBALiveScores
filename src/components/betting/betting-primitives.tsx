'use client';

// Combo boost promotional banner
export function ComboBoostPromo() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-4">
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-purple-500/30 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <span className="text-xl">🔥</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">COMBO BOOST</h4>
          <p className="text-xs text-gray-400">Add 3+ selections for 50% extra winnings!</p>
        </div>
      </div>
    </div>
  );
}

// Individual betting option button
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

// Market category tabs
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
