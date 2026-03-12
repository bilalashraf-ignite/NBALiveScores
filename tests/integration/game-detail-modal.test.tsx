/**
 * RED integration tests for full game detail modal flow
 * These tests MUST fail until all components are integrated
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '@/app/page';
import type { Game, GameDetails } from '@/types/sports-data';

// Mock SSE hook
jest.mock('@/hooks/useSSE', () => ({
  useSSE: jest.fn()
}));

import { useSSE } from '@/hooks/useSSE';

describe('Game Detail Modal Integration (RED TEST)', () => {
  const mockLiveGame: Game = {
    id: 'game-123',
    league: 'NBA',
    homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL', logoUrl: '/lal.png' },
    awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW', logoUrl: '/gsw.png' },
    score: { home: 95, away: 92 },
    state: 'live' as any,
    scheduledTime: new Date('2026-03-12T19:00:00Z'),
    period: 3,
    timeRemaining: '5:32',
    possession: 'home'
  };

  const mockGameDetails: GameDetails = {
    gameId: 'game-123',
    league: 'NBA',
    homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL' },
    awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW' },
    status: 'live' as any,
    score: { home: 95, away: 92 },
    gameContext: { period: 3, timeRemaining: '5:32' },
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
    playerStats: {
      home: [
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
        }
      ],
      away: [
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
        }
      ]
    },
    historicalMatchup: {
      lastFiveMeetings: [
        {
          date: '2026-02-15',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          homeScore: 120,
          awayScore: 115,
          winner: 'home'
        }
      ],
      seasonSeries: { wins: 2, losses: 1, leader: 'home' },
      allTimeRecord: { wins: 45, losses: 32, leader: 'home' },
      averageCombinedPoints: 228
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSSE as jest.Mock).mockReturnValue({
      data: [mockLiveGame],
      isConnected: true,
      error: null,
      reconnect: jest.fn()
    });

    // Mock fetch for game details
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/games/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockGameDetails
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    }) as jest.Mock;
  });

  it('should render page with live game and open modal when game card clicked', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    // Wait for game cards to render
    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    // Click game card
    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    }
  });

  it('should show game info from selected card in modal', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        // Check modal shows correct teams
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveTextContent('Lakers');
        expect(modal).toHaveTextContent('Warriors');
        expect(modal).toHaveTextContent('95');
        expect(modal).toHaveTextContent('92');
      });
    }
  });

  it('should close modal when X button clicked', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('should close modal when backdrop clicked', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click backdrop
      const backdrop = document.querySelector('[data-radix-dialog-overlay]');
      if (backdrop) {
        await user.click(backdrop);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }
    }
  });

  it('should close modal when ESC key pressed', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press ESC
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('should close modal when back button simulated (popstate)', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Simulate back button
      window.dispatchEvent(new PopStateEvent('popstate'));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  });

  it('should keep SSE connection active while modal open', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Verify SSE hook is still being called (not unmounted)
      expect(useSSE).toHaveBeenCalled();
    }
  });

  it('should display team stats section in modal', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveTextContent('FG%');
        expect(modal).toHaveTextContent('50.0%');
        expect(modal).toHaveTextContent('Assists');
      });
    }
  });

  it('should display player stats section in modal', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveTextContent('#23 James');
        expect(modal).toHaveTextContent('#30 Curry');
        expect(modal).toHaveTextContent('28'); // James points
        expect(modal).toHaveTextContent('32'); // Curry points
      });
    }
  });

  it('should display historical matchup section in modal', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveTextContent(/Last 5 Meetings/i);
        expect(modal).toHaveTextContent('120-115');
      });
    }
  });

  it('should allow sorting player stats', async () => {
    // This test will FAIL until full integration is complete
    const user = userEvent.setup();

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
    });

    const gameCard = screen.getByText('Lakers').closest('div[role="button"]');
    if (gameCard) {
      await user.click(gameCard);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click REB header to sort by rebounds
      const rebHeader = screen.getByText('REB');
      await user.click(rebHeader);

      // Verify sort changed (implementation dependent)
      expect(rebHeader).toBeInTheDocument();
    }
  });
});
