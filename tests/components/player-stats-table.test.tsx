/**
 * RED tests for PlayerStatsTable component
 * These tests MUST fail until the component is implemented
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerStatsTable } from '@/components/player-stats-table';
import type { PlayerStats, Team } from '@/types/sports-data';

describe('PlayerStatsTable component (RED TEST)', () => {
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

  const mockHomePlayerStats: PlayerStats[] = [
    {
      jerseyNumber: '23',
      lastName: 'James',
      firstName: 'LeBron',
      minutes: '32:15',
      points: 28,
      fieldGoals: { made: 10, attempted: 18 },
      threePointers: { made: 2, attempted: 5 },
      freeThrows: { made: 6, attempted: 8 },
      rebounds: 9,
      assists: 7,
      steals: 2,
      blocks: 1
    },
    {
      jerseyNumber: '3',
      lastName: 'Davis',
      firstName: 'Anthony',
      minutes: '30:45',
      points: 22,
      fieldGoals: { made: 9, attempted: 15 },
      threePointers: { made: 0, attempted: 2 },
      freeThrows: { made: 4, attempted: 5 },
      rebounds: 12,
      assists: 3,
      steals: 1,
      blocks: 3
    },
    {
      jerseyNumber: '15',
      lastName: 'Walker',
      firstName: 'Kemba',
      minutes: '0:00',
      points: 0,
      fieldGoals: { made: 0, attempted: 0 },
      threePointers: { made: 0, attempted: 0 },
      freeThrows: { made: 0, attempted: 0 },
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0
    }
  ];

  const mockAwayPlayerStats: PlayerStats[] = [
    {
      jerseyNumber: '30',
      lastName: 'Curry',
      firstName: 'Stephen',
      minutes: '34:20',
      points: 32,
      fieldGoals: { made: 12, attempted: 20 },
      threePointers: { made: 6, attempted: 12 },
      freeThrows: { made: 2, attempted: 2 },
      rebounds: 5,
      assists: 8,
      steals: 3,
      blocks: 0
    },
    {
      jerseyNumber: '23',
      lastName: 'Green',
      firstName: 'Draymond',
      minutes: '28:30',
      points: 8,
      fieldGoals: { made: 3, attempted: 6 },
      threePointers: { made: 2, attempted: 4 },
      freeThrows: { made: 0, attempted: 0 },
      rebounds: 10,
      assists: 6,
      steals: 2,
      blocks: 2
    }
  ];

  it('should display all columns', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    const columns = ['Player', 'MIN', 'PTS', 'FG', '3P', 'FT', 'REB', 'AST', 'STL', 'BLK'];
    columns.forEach(column => {
      // Use regex pattern to handle potential sort indicators
      expect(screen.getByText(new RegExp(column))).toBeInTheDocument();
    });
  });

  it('should default sort by points descending', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Curry (32 pts) should appear before James (28 pts)
    const rows = screen.getAllByRole('row');
    const curryRowIndex = rows.findIndex(row => row.textContent?.includes('Curry'));
    const jamesRowIndex = rows.findIndex(row => row.textContent?.includes('James'));

    expect(curryRowIndex).toBeLessThan(jamesRowIndex);
  });

  it('should toggle sort order when clicking PTS header', async () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    const user = userEvent.setup();

    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    const ptsHeader = screen.getByText(/PTS/);

    // Click once to sort ascending
    await user.click(ptsHeader);

    const rows = screen.getAllByRole('row');
    const walkerRowIndex = rows.findIndex(row => row.textContent?.includes('Walker'));
    const curryRowIndex = rows.findIndex(row => row.textContent?.includes('Curry'));

    // Walker (0 pts) should now appear before Curry (32 pts)
    expect(walkerRowIndex).toBeLessThan(curryRowIndex);
  });

  it('should sort by rebounds when clicking REB header', async () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    const user = userEvent.setup();

    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    const rebHeader = screen.getByText('REB');
    await user.click(rebHeader);

    // Davis has 12 rebounds (highest), should appear first
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row

    expect(firstDataRow.textContent).toContain('Davis');
    expect(firstDataRow.textContent).toContain('12');
  });

  it('should display shooting stats as made-attempted format', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Check FG format: "10-18"
    expect(screen.getByText(/10-18/)).toBeInTheDocument();

    // Check 3P format: "6-12"
    expect(screen.getByText(/6-12/)).toBeInTheDocument();

    // Check FT format: "6-8"
    expect(screen.getByText(/6-8/)).toBeInTheDocument();
  });

  it('should display player names as "#23 James" format', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    expect(screen.getByText('#23 James')).toBeInTheDocument();
    expect(screen.getByText('#30 Curry')).toBeInTheDocument();
    expect(screen.getByText('#3 Davis')).toBeInTheDocument();
  });

  it('should show DNP players with 0:00 minutes', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Walker is DNP with 0:00 minutes
    expect(screen.getByText('#15 Walker')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should have visual divider between teams', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    const { container } = render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Check for divider element or class between teams
    const divider = container.querySelector('[data-testid="team-divider"]');
    expect(divider).toBeInTheDocument();
  });

  it('should have horizontal scroll wrapper (overflow-x-auto class)', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    const { container } = render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    const scrollWrapper = container.querySelector('.overflow-x-auto');
    expect(scrollWrapper).toBeInTheDocument();
  });

  it('should display sort indicators', () => {
    // This test will FAIL because PlayerStatsTable component doesn't exist yet
    render(
      <PlayerStatsTable
        homeStats={mockHomePlayerStats}
        awayStats={mockAwayPlayerStats}
        homeTeam={mockHomeTeam}
        awayTeam={mockAwayTeam}
      />
    );

    // Default sort by PTS desc, should show descending indicator
    const ptsHeader = screen.getByText(/PTS/);
    expect(ptsHeader.textContent).toMatch(/▼|↓/);
  });
});
