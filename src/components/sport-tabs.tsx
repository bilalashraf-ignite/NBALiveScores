import type { Sport } from '@/types/sports-data';

interface SportTabsProps {
  selectedSport: Sport;
  onSelectSport: (sport: Sport) => void;
  basketballCount: number;
  footballCount: number;
}

/**
 * Sport tabs component for switching between Basketball and Football scores.
 * Displays game counts for each sport.
 */
export function SportTabs({ selectedSport, onSelectSport, basketballCount, footballCount }: SportTabsProps) {
  const tabs: Array<{ id: Sport; label: string; icon: string; count: number }> = [
    { id: 'basketball', label: 'Basketball', icon: '🏀', count: basketballCount },
    { id: 'football', label: 'Football', icon: '⚽', count: footballCount },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8" aria-label="Sport tabs">
        {tabs.map((tab) => {
          const isActive = selectedSport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSport(tab.id)}
              className={`
                relative py-4 px-1 text-sm font-medium transition-colors min-h-[48px]
                ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`
                  rounded-full px-2 py-0.5 text-xs
                  ${isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }
                `}>
                  {tab.count}
                </span>
              </span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
