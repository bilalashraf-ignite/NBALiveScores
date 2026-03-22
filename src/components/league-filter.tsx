import type { League, Game } from '@/types/sports-data';

interface LeagueFilterProps {
  games: Game[];
  selectedLeague: League | 'all';
  onSelectLeague: (league: League | 'all') => void;
}

// League labels mapping
const leagueLabels: Record<League, string> = {
  // Basketball
  NBA: 'NBA',
  NCAA: 'NCAA',
  EuroLeague: 'EuroLeague',
  // Football
  PremierLeague: 'Premier League',
  LaLiga: 'La Liga',
  Bundesliga: 'Bundesliga',
  SerieA: 'Serie A',
  Ligue1: 'Ligue 1',
  // Cricket
  IPL: 'IPL',
  BBL: 'Big Bash League',
  PSL: 'Pakistan Super League',
  CPL: 'Caribbean Premier League',
  ICC: 'International',
  CountyChampionship: 'County Championship',
};

/**
 * League filter pills/chips component.
 * Shows game counts per league and allows filtering by league.
 * Dynamically shows only leagues that have games.
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

  // Get unique leagues from games and build filters dynamically
  const uniqueLeagues = Array.from(new Set(games.map(g => g.league)));

  const filters: Array<{ id: League | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    ...uniqueLeagues.map(league => ({
      id: league,
      label: leagueLabels[league] || league,
    })),
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
              rounded-full px-4 py-2 min-h-[48px] text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
