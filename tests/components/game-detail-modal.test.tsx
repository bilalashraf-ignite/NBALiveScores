/**
 * RED tests for GameDetailModal component
 * These tests MUST fail until the component is implemented
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameDetailModal } from '@/components/game-detail-modal';
import type { League } from '@/types/sports-data';

// Mock dependencies
jest.mock('@/hooks/use-game-details', () => ({
  useGameDetails: jest.fn()
}));

jest.mock('@/hooks/use-modal-history', () => ({
  useModalHistory: jest.fn()
}));

import { useGameDetails } from '@/hooks/use-game-details';
import { useModalHistory } from '@/hooks/use-modal-history';

describe('GameDetailModal component (RED TEST)', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useModalHistory as jest.Mock).mockImplementation(() => {});
  });

  it('should render with controlled open state', () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    const { container } = render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('should call onOpenChange(false) when X button clicked', async () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    const user = userEvent.setup();

    (useGameDetails as jest.Mock).mockReturnValue({
      data: {
        gameId: 'game-123',
        league: 'NBA',
        homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL' },
        awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW' },
        status: 'live',
        score: { home: 95, away: 92 },
        teamStats: { home: {}, away: {} },
        playerStats: { home: [], away: [] },
        historicalMatchup: {}
      },
      loading: false,
      error: null
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange(false) when ESC key pressed', async () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    const user = userEvent.setup();

    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    await user.keyboard('{Escape}');

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onOpenChange(false) when backdrop clicked', async () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    const user = userEvent.setup();

    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    const { container } = render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Click on backdrop (overlay element)
    const backdrop = container.querySelector('[data-radix-dialog-overlay]');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('should show GameDetailSkeleton while loading', () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    // Check for skeleton loader
    expect(screen.getByTestId('game-detail-skeleton')).toBeInTheDocument();
  });

  it('should show error message when error occurs', () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to load game details')
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(
      screen.getByText(/failed to load game details/i)
    ).toBeInTheDocument();
  });

  it('should show game data when loaded', async () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    const mockGameDetails = {
      gameId: 'game-123',
      league: 'NBA',
      homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW' },
      status: 'live',
      score: { home: 95, away: 92 },
      teamStats: {
        home: {
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
        },
        away: {
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
        }
      },
      playerStats: { home: [], away: [] },
      historicalMatchup: {
        lastFiveMeetings: [],
        seasonSeries: undefined,
        allTimeRecord: undefined,
        averageCombinedPoints: undefined
      }
    };

    (useGameDetails as jest.Mock).mockReturnValue({
      data: mockGameDetails,
      loading: false,
      error: null
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('Warriors')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });

  it('should integrate useModalHistory for back button support', () => {
    // This test will FAIL because GameDetailModal component doesn't exist yet
    (useGameDetails as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(
      <GameDetailModal
        gameId="game-123"
        league={'NBA' as League}
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(useModalHistory).toHaveBeenCalledWith(true, expect.any(Function));
  });

  // TODO (05-02): Add scroll lock and swipe-to-close tests when implementing mobile gestures
  // describe('Scroll Lock', () => {
  //   it('Locks body scroll when modal opens', () => {
  //     // Verify document.body.style.position is 'fixed' when open=true
  //     // Verify document.body.style.paddingRight is set (scrollbar compensation)
  //   });
  //
  //   it('Restores scroll position when modal closes', () => {
  //     // Set window.scrollY = 500
  //     // Spy on window.scrollTo
  //     // Open then close modal
  //     // Verify scrollTo called with (0, 500)
  //   });
  //
  //   it('Handles swipe-to-close gesture', () => {
  //     // Simulate touchStart at clientY: 100
  //     // Simulate touchMove to clientY: 220 (120px swipe exceeds 100px threshold)
  //     // Simulate touchEnd
  //     // Verify onOpenChange called with false
  //   });
  // });
});
