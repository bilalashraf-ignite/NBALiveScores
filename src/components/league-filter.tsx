import type { League, Game } from '@/types/sports-data';

interface LeagueFilterProps {
  games: Game[];
  selectedLeague: League | 'all';
  onSelectLeague: (league: League | 'all') => void;
}

/**
 * League filter pills/chips component.
 * Shows game counts per league and allows filtering by league.
 *
 * Pattern source: RESEARCH.md Pattern 6 (Multi-League Support)
 * Requirements: LEAGUE-04 (filter by league)
 */
export function LeagueFilter({ games, selectedLeague, onSelectLeague }: LeagueFilterProps) {
  // Count games per league
  const counts = games.reduce((acc, game) => {
    acc[game.league] = (acc[game.league] || 0) + 1;
    return acc;
  }, {} as Record<League, number>);

  const filters: Array<{ id: League | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'NBA', label: 'NBA' },
    { id: 'NCAA', label: 'NCAA' },
    { id: 'EuroLeague', label: 'EuroLeague' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6" role="tablist">
      {filters.map((filter) => {
        const count = filter.id === 'all'
          ? games.length
          : counts[filter.id as League] || 0;
        const isActive = selectedLeague === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onSelectLeague(filter.id)}
            role="tab"
            aria-selected={isActive}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {filter.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
