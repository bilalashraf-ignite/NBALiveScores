import type { Team, TeamStats } from '@/types/sports-data';

/**
 * Props for TeamStatsTable component
 */
interface TeamStatsTableProps {
  homeStats: TeamStats;
  awayStats: TeamStats;
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Configuration for each stat row in the table
 */
interface StatRow {
  label: string;
  getValue: (stats: TeamStats) => string;
  getCompareValue: (stats: TeamStats) => number;
  higherIsBetter: boolean;
}

/**
 * Team statistics comparison table component.
 * Displays 10 stats in side-by-side format with bold highlighting for better values.
 *
 * Stats displayed (in order):
 * 1. FG% (Field Goal Percentage)
 * 2. 3P% (Three-Point Percentage)
 * 3. FT% (Free Throw Percentage)
 * 4. Assists
 * 5. Turnovers
 * 6. Offensive Rebounds
 * 7. Defensive Rebounds
 * 8. Total Rebounds
 * 9. Steals
 * 10. Blocks
 */
export function TeamStatsTable({ homeStats, awayStats, homeTeam, awayTeam }: TeamStatsTableProps) {
  /**
   * Configuration for all 10 stats in specified order
   */
  const stats: StatRow[] = [
    {
      label: 'FG%',
      getValue: (stats) => {
        const fg = stats.fieldGoals;
        return `${fg.made}-${fg.attempted}, ${fg.percentage.toFixed(1)}%`;
      },
      getCompareValue: (stats) => stats.fieldGoals.percentage,
      higherIsBetter: true
    },
    {
      label: '3P%',
      getValue: (stats) => {
        const tp = stats.threePointers;
        return `${tp.made}-${tp.attempted}, ${tp.percentage.toFixed(1)}%`;
      },
      getCompareValue: (stats) => stats.threePointers.percentage,
      higherIsBetter: true
    },
    {
      label: 'FT%',
      getValue: (stats) => {
        const ft = stats.freeThrows;
        return `${ft.made}-${ft.attempted}, ${ft.percentage.toFixed(1)}%`;
      },
      getCompareValue: (stats) => stats.freeThrows.percentage,
      higherIsBetter: true
    },
    {
      label: 'Assists',
      getValue: (stats) => String(stats.assists),
      getCompareValue: (stats) => stats.assists,
      higherIsBetter: true
    },
    {
      label: 'Turnovers',
      getValue: (stats) => String(stats.turnovers),
      getCompareValue: (stats) => stats.turnovers,
      higherIsBetter: false
    },
    {
      label: 'Offensive Rebounds',
      getValue: (stats) => String(stats.reboundsOffensive),
      getCompareValue: (stats) => stats.reboundsOffensive,
      higherIsBetter: true
    },
    {
      label: 'Defensive Rebounds',
      getValue: (stats) => String(stats.reboundsDefensive),
      getCompareValue: (stats) => stats.reboundsDefensive,
      higherIsBetter: true
    },
    {
      label: 'Total Rebounds',
      getValue: (stats) => String(stats.reboundsTotal),
      getCompareValue: (stats) => stats.reboundsTotal,
      higherIsBetter: true
    },
    {
      label: 'Steals',
      getValue: (stats) => String(stats.steals),
      getCompareValue: (stats) => stats.steals,
      higherIsBetter: true
    },
    {
      label: 'Blocks',
      getValue: (stats) => String(stats.blocks),
      getCompareValue: (stats) => stats.blocks,
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
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
            {homeTeam.name}
          </th>
          <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">
            Stat
          </th>
          <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
            {awayTeam.name}
          </th>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat) => {
          const homeBetter = isHomeBetter(stat);
          const awayBetter = isAwayBetter(stat);

          return (
            <tr key={stat.label} className="hover:bg-gray-50">
              <td
                className={`border border-gray-300 px-4 py-2 text-left text-sm ${
                  homeBetter ? 'font-bold' : ''
                }`}
              >
                {stat.getValue(homeStats)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-600">
                {stat.label}
              </td>
              <td
                className={`border border-gray-300 px-4 py-2 text-right text-sm ${
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
