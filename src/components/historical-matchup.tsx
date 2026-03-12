'use client';

import { format } from 'date-fns';
import type { HistoricalMatchup as HistoricalMatchupData, Team } from '@/types/sports-data';

interface HistoricalMatchupProps {
  data: HistoricalMatchupData | null | undefined;
  homeTeam: Team;
  awayTeam: Team;
}

/**
 * HistoricalMatchup component displays last 5 meetings, season series record,
 * and all-time head-to-head record between two teams.
 *
 * Features:
 * - Last 5 meetings with dates, scores, and winner indication
 * - Season series summary (e.g., "Lakers leads 2-1")
 * - All-time record summary (e.g., "Celtics leads 163-127")
 * - Average combined points per matchup
 * - Fallback message when historical data unavailable
 *
 * All data fields are optional to support graceful degradation.
 */
export function HistoricalMatchup({
  data,
  homeTeam,
  awayTeam
}: HistoricalMatchupProps) {
  // Check if data is unavailable
  const isDataUnavailable =
    !data || !data.lastFiveMeetings || data.lastFiveMeetings.length === 0;

  if (isDataUnavailable) {
    return (
      <div className="text-gray-600 dark:text-gray-400">
        <p>Historical data unavailable</p>
      </div>
    );
  }

  // Helper function to get team name based on leader
  const getLeaderTeamName = (leader: 'home' | 'away' | 'tied') => {
    if (leader === 'tied') return null;
    return leader === 'home' ? homeTeam.name : awayTeam.name;
  };

  return (
    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
      {/* Last 5 Meetings Section */}
      <h3 className="text-lg font-semibold mb-3">Last 5 Meetings</h3>
      <ul className="space-y-2">
        {data.lastFiveMeetings.map((meeting, index) => {
          const formattedDate = format(new Date(meeting.date), 'MMM d, yyyy');
          const winnerName = meeting.winner === 'home' ? meeting.homeTeam : meeting.awayTeam;

          return (
            <li key={index} className="flex justify-between text-sm" data-testid={`meeting-${index}`}>
              {/* Date on the left */}
              <span className="text-gray-600 dark:text-gray-400">{formattedDate}</span>

              {/* Teams and scores in the middle */}
              <span>
                <span className={meeting.homeTeam === winnerName ? 'font-bold' : ''}>
                  {meeting.homeTeam}
                </span>
                {' '}
                {meeting.homeScore}
                {', '}
                <span className={meeting.awayTeam === winnerName ? 'font-bold' : ''}>
                  {meeting.awayTeam}
                </span>
                {' '}
                {meeting.awayScore}
              </span>

              {/* Winner indicator on the right */}
              <span className="text-gray-500 dark:text-gray-400" data-testid={`winner-indicator-${index}`}>
                {winnerName}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Season Series Summary */}
      {data.seasonSeries && (
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          Season series:{' '}
          {data.seasonSeries.leader === 'tied' ? (
            <>Tied {data.seasonSeries.wins}-{data.seasonSeries.losses}</>
          ) : (
            <>
              {getLeaderTeamName(data.seasonSeries.leader)} leads {data.seasonSeries.wins}-{data.seasonSeries.losses}
            </>
          )}
        </p>
      )}

      {/* All-Time Record Summary */}
      {data.allTimeRecord && (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          All-time: {getLeaderTeamName(data.allTimeRecord.leader)} leads {data.allTimeRecord.wins}-{data.allTimeRecord.losses}
        </p>
      )}

      {/* Average Combined Points */}
      {data.averageCombinedPoints && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Average combined points: {data.averageCombinedPoints}
        </p>
      )}
    </div>
  );
}
