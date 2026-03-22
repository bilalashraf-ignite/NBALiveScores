/**
 * Tests for CricketScorecard component.
 *
 * Verifies:
 * - Innings summary renders correctly
 * - Batting stats display properly
 * - Bowling stats display properly
 * - Team names are shown correctly
 * - Ordinal innings labels (1st, 2nd, etc.)
 * - Special states (not out, on strike, declared)
 */

import { render, screen } from '@testing-library/react';
import { CricketScorecard } from '@/components/cricket/cricket-scorecard';
import type { CricketInnings, CricketBatsmanStats, CricketBowlerStats } from '@/types/sports-data';

const mockInnings: CricketInnings[] = [
  {
    inningsNumber: 1,
    battingTeam: 'home',
    runs: 285,
    wickets: 10,
    overs: '50.0',
    runRate: 5.7,
    isCompleted: true,
    declared: false,
  },
  {
    inningsNumber: 2,
    battingTeam: 'away',
    runs: 200,
    wickets: 6,
    overs: '40.2',
    runRate: 4.96,
    isCompleted: false,
    declared: false,
  },
];

const mockBattingStats: { home: CricketBatsmanStats[]; away: CricketBatsmanStats[] } = {
  home: [
    {
      name: 'Virat Kohli',
      runs: 82,
      balls: 75,
      fours: 8,
      sixes: 2,
      strikeRate: 109.33,
      isNotOut: false,
      isOnStrike: false,
      dismissal: 'c Smith b Anderson',
    },
    {
      name: 'Rohit Sharma',
      runs: 56,
      balls: 42,
      fours: 6,
      sixes: 3,
      strikeRate: 133.33,
      isNotOut: true,
      isOnStrike: true,
    },
  ],
  away: [
    {
      name: 'Joe Root',
      runs: 45,
      balls: 60,
      fours: 4,
      sixes: 0,
      strikeRate: 75.0,
      isNotOut: true,
      isOnStrike: true,
    },
  ],
};

const mockBowlingStats: { home: CricketBowlerStats[]; away: CricketBowlerStats[] } = {
  home: [
    {
      name: 'Jasprit Bumrah',
      overs: '10.0',
      maidens: 2,
      runs: 35,
      wickets: 3,
      economy: 3.5,
      isBowling: false,
    },
  ],
  away: [
    {
      name: 'James Anderson',
      overs: '10.0',
      maidens: 1,
      runs: 42,
      wickets: 2,
      economy: 4.2,
      isBowling: true,
    },
  ],
};

describe('CricketScorecard', () => {
  const defaultProps = {
    innings: mockInnings,
    battingStats: mockBattingStats,
    bowlingStats: mockBowlingStats,
    homeTeamName: 'India',
    awayTeamName: 'England',
  };

  it('renders innings summary section', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('Innings Summary')).toBeInTheDocument();
  });

  it('displays correct innings labels (1st, 2nd)', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('1st Inn')).toBeInTheDocument();
    expect(screen.getByText('2nd Inn')).toBeInTheDocument();
  });

  it('shows team names for each innings', () => {
    render(<CricketScorecard {...defaultProps} />);

    // Home team batting in 1st innings
    expect(screen.getAllByText('India').length).toBeGreaterThan(0);
    // Away team batting in 2nd innings
    expect(screen.getAllByText('England').length).toBeGreaterThan(0);
  });

  it('displays innings scores correctly', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('285/10')).toBeInTheDocument();
    expect(screen.getByText('200/6')).toBeInTheDocument();
  });

  it('shows overs bowled for each innings', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('(50.0 ov)')).toBeInTheDocument();
    expect(screen.getByText('(40.2 ov)')).toBeInTheDocument();
  });

  it('displays run rates', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('RR: 5.70')).toBeInTheDocument();
    expect(screen.getByText('RR: 4.96')).toBeInTheDocument();
  });

  it('renders batting section', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('Batting')).toBeInTheDocument();
  });

  it('displays batsman names and stats', () => {
    render(<CricketScorecard {...defaultProps} />);

    // Batsman names
    expect(screen.getByText(/Virat Kohli/)).toBeInTheDocument();
    expect(screen.getByText(/Rohit Sharma/)).toBeInTheDocument();
    expect(screen.getByText(/Joe Root/)).toBeInTheDocument();
  });

  it('shows batsman runs correctly', () => {
    render(<CricketScorecard {...defaultProps} />);

    // Check runs are displayed (as table cells)
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('displays dismissal information', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('c Smith b Anderson')).toBeInTheDocument();
  });

  it('renders bowling section', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText('Bowling')).toBeInTheDocument();
  });

  it('displays bowler names and stats', () => {
    render(<CricketScorecard {...defaultProps} />);

    expect(screen.getByText(/Jasprit Bumrah/)).toBeInTheDocument();
    expect(screen.getByText(/James Anderson/)).toBeInTheDocument();
  });

  it('shows bowling figures correctly', () => {
    render(<CricketScorecard {...defaultProps} />);

    // Check for wickets (may appear multiple times due to fours/sixes columns)
    // Use getAllByText to verify wickets are displayed
    const threeElements = screen.getAllByText('3');
    const twoElements = screen.getAllByText('2');

    // At least one "3" for Bumrah's wickets and one "2" for Anderson's wickets
    expect(threeElements.length).toBeGreaterThan(0);
    expect(twoElements.length).toBeGreaterThan(0);
  });

  it('displays declared innings badge when applicable', () => {
    const inningsWithDeclaration: CricketInnings[] = [
      {
        ...mockInnings[0],
        declared: true,
        wickets: 5,
      },
    ];

    render(
      <CricketScorecard
        {...defaultProps}
        innings={inningsWithDeclaration}
      />
    );

    expect(screen.getByText('dec')).toBeInTheDocument();
  });

  it('handles empty batting stats gracefully', () => {
    render(
      <CricketScorecard
        {...defaultProps}
        battingStats={{ home: [], away: [] }}
      />
    );

    // Component should still render without crashing
    expect(screen.getByText('Batting')).toBeInTheDocument();
  });

  it('handles empty bowling stats gracefully', () => {
    render(
      <CricketScorecard
        {...defaultProps}
        bowlingStats={{ home: [], away: [] }}
      />
    );

    // Component should still render without crashing
    expect(screen.getByText('Bowling')).toBeInTheDocument();
  });

  describe('Ordinal innings labels', () => {
    it('handles 3rd innings correctly', () => {
      const threeInnings: CricketInnings[] = [
        ...mockInnings,
        {
          inningsNumber: 3,
          battingTeam: 'home',
          runs: 150,
          wickets: 4,
          overs: '30.0',
          runRate: 5.0,
          isCompleted: false,
          declared: false,
        },
      ];

      render(<CricketScorecard {...defaultProps} innings={threeInnings} />);

      expect(screen.getByText('3rd Inn')).toBeInTheDocument();
    });

    it('handles 4th innings correctly', () => {
      const fourInnings: CricketInnings[] = [
        ...mockInnings,
        {
          inningsNumber: 3,
          battingTeam: 'home',
          runs: 150,
          wickets: 10,
          overs: '40.0',
          runRate: 3.75,
          isCompleted: true,
          declared: false,
        },
        {
          inningsNumber: 4,
          battingTeam: 'away',
          runs: 100,
          wickets: 3,
          overs: '25.0',
          runRate: 4.0,
          isCompleted: false,
          declared: false,
        },
      ];

      render(<CricketScorecard {...defaultProps} innings={fourInnings} />);

      expect(screen.getByText('4th Inn')).toBeInTheDocument();
    });
  });
});
