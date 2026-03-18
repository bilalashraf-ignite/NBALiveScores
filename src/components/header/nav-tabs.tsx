'use client';

interface NavTab {
  id: string;
  label: string;
  href?: string;
}

interface NavTabsProps {
  tabs: NavTab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

export function NavTabs({ tabs, activeTab, onTabChange }: NavTabsProps) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${activeTab === tab.id
              ? 'text-white bg-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-purple-500/10'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
