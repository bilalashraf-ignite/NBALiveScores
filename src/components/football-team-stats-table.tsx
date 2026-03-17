import type { Team, FootballTeamStats } from '@/types/sports-data';

/**
 * Props for FootballTeamStatsTable component
 */
interface FootballTeamStatsTableProps {
  homeStats: FootballTeamStats;
  awayStats: FootballTeamStats;
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Configuration for each stat row in the table
 */
interface StatRow {
  label: string;
  getValue: (stats: FootballTeamStats) => string;
  getCompareValue: (stats: FootballTeamStats) => number;
  higherIsBetter: boolean;
}

/**
 * Football team statistics comparison table component.
 * Displays key football stats in side-by-side format with bold highlighting for better values.
 *
 * Stats displayed (in order):
 * 1. Possession %
 * 2. Shots
 * 3. Shots on Target
 * 4. Corners
 * 5. Fouls
 * 6. Offsides
 * 7. Yellow Cards
 * 8. Red Cards
 * 9. Pass Accuracy %
 * 10. Tackles
 * 11. Saves
 */
export function FootballTeamStatsTable({ homeStats, awayStats, homeTeam, awayTeam }: FootballTeamStatsTableProps) {
  /**
   * Configuration for all stats in specified order
   */
  const stats: StatRow[] = [
    {
      label: 'Possession',
      getValue: (stats) => `${stats.possession}%`,
      getCompareValue: (stats) => stats.possession,
      higherIsBetter: true
    },
    {
      label: 'Shots',
      getValue: (stats) => String(stats.shots),
      getCompareValue: (stats) => stats.shots,
      higherIsBetter: true
    },
    {
      label: 'Shots on Target',
      getValue: (stats) => String(stats.shotsOnTarget),
      getCompareValue: (stats) => stats.shotsOnTarget,
      higherIsBetter: true
    },
    {
      label: 'Corners',
      getValue: (stats) => String(stats.corners),
      getCompareValue: (stats) => stats.corners,
      higherIsBetter: true
    },
    {
      label: 'Fouls',
      getValue: (stats) => String(stats.fouls),
      getCompareValue: (stats) => stats.fouls,
      higherIsBetter: false
    },
    {
      label: 'Offsides',
      getValue: (stats) => String(stats.offsides),
      getCompareValue: (stats) => stats.offsides,
      higherIsBetter: false
    },
    {
      label: 'Yellow Cards',
      getValue: (stats) => String(stats.yellowCards),
      getCompareValue: (stats) => stats.yellowCards,
      higherIsBetter: false
    },
    {
      label: 'Red Cards',
      getValue: (stats) => String(stats.redCards),
      getCompareValue: (stats) => stats.redCards,
      higherIsBetter: false
    },
    {
      label: 'Pass Accuracy',
      getValue: (stats) => `${stats.passAccuracy}%`,
      getCompareValue: (stats) => stats.passAccuracy,
      higherIsBetter: true
    },
    {
      label: 'Tackles',
      getValue: (stats) => String(stats.tackles),
      getCompareValue: (stats) => stats.tackles,
      higherIsBetter: true
    },
    {
      label: 'Saves',
      getValue: (stats) => String(stats.saves),
      getCompareValue: (stats) => stats.saves,
      higherIsBetter: true
    }
  ];

  /**
   * Determine if home team has better value for a stat
   */
  const isHomeBetter = (stat: StatRow): boolean => {
    const homeValue = stat.getCompareValue(homeStats);
    const awayValue = stat.getCompareValue(awayStats);

    if (homeValue === awayValue) return false;

    if (stat.higherIsBetter) {
      return homeValue > awayValue;
    } else {
      return homeValue < awayValue;
    }
  };

  /**
   * Determine if away team has better value for a stat
   */
  const isAwayBetter = (stat: StatRow): boolean => {
    const homeValue = stat.getCompareValue(homeStats);
    const awayValue = stat.getCompareValue(awayStats);

    if (homeValue === awayValue) return false;

    if (stat.higherIsBetter) {
      return awayValue > homeValue;
    } else {
      return awayValue < homeValue;
    }
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-700">
          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
            {homeTeam.name}
          </th>
          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            Stat
          </th>
          <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
            {awayTeam.name}
          </th>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat) => {
          const homeBetter = isHomeBetter(stat);
          const awayBetter = isAwayBetter(stat);

          return (
            <tr key={stat.label} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td
                className={`border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 ${
                  homeBetter ? 'font-bold' : ''
                }`}
              >
                {stat.getValue(homeStats)}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </td>
              <td
                className={`border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300 ${
                  awayBetter ? 'font-bold' : ''
                }`}
              >
                {stat.getValue(awayStats)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
