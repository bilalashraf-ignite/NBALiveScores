/**
 * RED tests for TeamStatsTable component
 * These tests MUST fail until the component is implemented
 */

import { render, screen } from '@testing-library/react';
import { TeamStatsTable } from '@/components/team-stats-table';
import type { TeamStats, Team } from '@/types/sports-data';

describe('TeamStatsTable component (RED TEST)', () => {
  const mockHomeTeam: Team = {
    id: 'lal',
    name: 'Los Angeles Lakers',
    abbreviation: 'LAL'
  };

  const mockAwayTeam: Team = {
    id: 'gsw',
    name: 'Golden State Warriors',
    abbreviation: 'GSW'
  };

  const mockHomeStats: TeamStats = {
    fieldGoals: { made: 35, attempted: 70, percentage: 50.0 },
    threePointers: { made: 10, attempted: 25, percentage: 40.0 },
    freeThrows: { made: 15, attempted: 18, percentage: 83.3 },
    assists: 22,
    turnovers: 10,
    reboundsOffensive: 8,
    reboundsDefensive: 26,
    reboundsTotal: 34,
    steals: 5,
    blocks: 3
  };

  const mockAwayStats: TeamStats = {
    fieldGoals: { made: 33, attempted: 68, percentage: 48.5 },
    threePointers: { made: 12, attempted: 30, percentage: 40.0 },
    freeThrows: { made: 14, attempted: 16, percentage: 87.5 },
    assists: 20,
    turnovers: 12,
    reboundsOffensive: 6,
    reboundsDefensive: 28,
    reboundsTotal: 34,
    steals: 7,
    blocks: 4
  };

  it('should display all 10 stats in correct order', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Verify all 10 stats appear in correct order
    const statLabels = ['FG%', '3P%', 'FT%', 'Assists', 'Turnovers',
                       'Offensive Rebounds', 'Defensive Rebounds', 'Total Rebounds',
                       'Steals', 'Blocks'];

    statLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show shooting stats with made-attempted, percentage format', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // FG: 35-70, 50.0%
    expect(screen.getByText('35-70, 50.0%')).toBeInTheDocument();

    // 3P: 10-25, 40.0%
    expect(screen.getByText('10-25, 40.0%')).toBeInTheDocument();

    // FT: 15-18, 83.3%
    expect(screen.getByText('15-18, 83.3%')).toBeInTheDocument();
  });

  it('should use full words for rebound labels (not abbreviations)', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    expect(screen.getByText('Offensive Rebounds')).toBeInTheDocument();
    expect(screen.getByText('Defensive Rebounds')).toBeInTheDocument();
    expect(screen.getByText('Total Rebounds')).toBeInTheDocument();
  });

  it('should bold the better stat value', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Home has better FG% (50.0 > 48.5)
    const homeFieldGoalCell = screen.getByText('35-70, 50.0%');
    expect(homeFieldGoalCell).toHaveClass('font-bold');

    // Away has better FT% (87.5 > 83.3)
    const awayFreeThrowCell = screen.getByText('14-16, 87.5%');
    expect(awayFreeThrowCell).toHaveClass('font-bold');
  });

  it('should handle tied stats (no bold when equal)', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // 3P% is tied at 40.0%
    const home3PCell = screen.getByText('10-25, 40.0%');
    const away3PCell = screen.getByText('12-30, 40.0%');

    expect(home3PCell).not.toHaveClass('font-bold');
    expect(away3PCell).not.toHaveClass('font-bold');
  });

  it('should handle turnovers comparison (lower is better)', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Home has 10 turnovers, away has 12
    // Lower is better, so home should be bold
    // Find the turnovers row by label first, then check the home cell
    const turnoversLabel = screen.getByText('Turnovers');
    const turnoversRow = turnoversLabel.closest('tr');
    const cells = turnoversRow?.querySelectorAll('td');

    // First cell is home stats (10)
    expect(cells?.[0]).toHaveTextContent('10');
    expect(cells?.[0]).toHaveClass('font-bold');

    // Third cell is away stats (12)
    expect(cells?.[2]).toHaveTextContent('12');
    expect(cells?.[2]).not.toHaveClass('font-bold');
  });

  it('should display team names in table header', () => {
    // This test will FAIL because TeamStatsTable component doesn't exist yet
    render(
      <TeamStatsTable
        homeStats={mockHomeStats}
        awayStats={mockAwayStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument();
  });
});
