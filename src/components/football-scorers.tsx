import type { Team, GoalScorer } from '@/types/sports-data';

interface FootballScorersProps {
  scorers: GoalScorer[];
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * Football goal scorers display component.
 * Shows goal scorers split by home and away teams with minute, penalty, and own goal indicators.
 */
export function FootballScorers({ scorers, homeTeam, awayTeam }: FootballScorersProps) {
  const homeScorers = scorers.filter((s) => s.team === 'home');
  const awayScorers = scorers.filter((s) => s.team === 'away');

  if (scorers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
        Goal Scorers
      </h3>
      <div className="flex justify-between gap-4">
        {/* Home team scorers */}
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {homeTeam.abbreviation}
          </div>
          {homeScorers.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500">-</div>
          ) : (
            <div className="space-y-1">
              {homeScorers.map((scorer, index) => (
                <div key={`home-${index}`} className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{scorer.player}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">{scorer.minute}'</span>
                  {scorer.isPenalty && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(P)</span>
                  )}
                  {scorer.isOwnGoal && (
                    <span className="text-xs text-red-500 dark:text-red-400 ml-1">(OG)</span>
                  )}
                  {scorer.assistedBy && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 block ml-2">
                      Assist: {scorer.assistedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300 dark:bg-gray-600" />

        {/* Away team scorers */}
        <div className="flex-1 text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {awayTeam.abbreviation}
          </div>
          {awayScorers.length === 0 ? (
            <div className="text-sm text-gray-400 dark:text-gray-500">-</div>
          ) : (
            <div className="space-y-1">
              {awayScorers.map((scorer, index) => (
                <div key={`away-${index}`} className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{scorer.player}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">{scorer.minute}'</span>
                  {scorer.isPenalty && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(P)</span>
                  )}
                  {scorer.isOwnGoal && (
                    <span className="text-xs text-red-500 dark:text-red-400 ml-1">(OG)</span>
                  )}
                  {scorer.assistedBy && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 block mr-2">
                      Assist: {scorer.assistedBy}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
