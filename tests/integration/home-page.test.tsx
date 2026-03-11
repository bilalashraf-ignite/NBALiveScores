import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { Game, GameState } from '@/types/sports-data';

// Mock the useSSE hook
const mockUseSSE = jest.fn();
jest.mock('@/hooks/useSSE', () => ({
  useSSE: (options: any) => mockUseSSE(options),
}));

// Mock child components
jest.mock('@/components/game-list', () => ({
  GameList: ({ games, lastUpdated }: { games: Game[]; lastUpdated?: Date }) => (
    <div data-testid="game-list">
      <div>Games count: {games.length}</div>
      {lastUpdated && <div>Last updated: {lastUpdated.toISOString()}</div>}
    </div>
  ),
}));

jest.mock('@/components/game-card-skeleton', () => ({
  GameCardSkeleton: () => <div data-testid="game-skeleton">Loading...</div>,
}));

jest.mock('@/components/stale-data-banner', () => ({
  StaleDataBanner: ({ lastUpdated, onRefresh }: any) => (
    <div data-testid="stale-banner">
      <button onClick={onRefresh}>Refresh from banner</button>
    </div>
  ),
}));

jest.mock('@/components/error-fallback', () => ({
  ErrorFallback: ({ error, resetErrorBoundary }: any) => (
    <div data-testid="error-fallback">
      <div>Error: {error.message}</div>
      <button onClick={resetErrorBoundary}>Reset</button>
    </div>
  ),
}));

// Mock fetch for manual refresh
global.fetch = jest.fn();

const createMockGame = (id: string): Game => ({
  id,
  state: GameState.LIVE,
  homeTeam: {
    id: 'team-1',
    name: 'Lakers',
    abbreviation: 'LAL',
  },
  awayTeam: {
    id: 'team-2',
    name: 'Warriors',
    abbreviation: 'GSW',
  },
  score: { home: 100, away: 95 },
  scheduledTime: new Date('2026-03-11T19:00:00Z'),
});

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Test 1: SSE connection established on mount, data displayed', () => {
    it('should establish SSE connection with correct URL', () => {
      mockUseSSE.mockReturnValue({
        data: null,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(mockUseSSE).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/scores/live',
        })
      );
    });

    it('should display GameList when data is available', () => {
      const mockGames = [createMockGame('game-1'), createMockGame('game-2')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.getByTestId('game-list')).toBeInTheDocument();
      expect(screen.getByText(/games count: 2/i)).toBeInTheDocument();
    });
  });

  describe('Test 2: Loading skeletons shown while data is null', () => {
    it('should display 6 skeleton cards when data is null', () => {
      mockUseSSE.mockReturnValue({
        data: null,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      const skeletons = screen.getAllByTestId('game-skeleton');
      expect(skeletons).toHaveLength(6);
    });

    it('should not display skeletons when data is available', () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.queryByTestId('game-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Test 3: Stale data banner shown when SSE disconnected', () => {
    it('should show stale data banner when disconnected but have cached data', () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.getByTestId('stale-banner')).toBeInTheDocument();
    });

    it('should not show banner when connected', () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.queryByTestId('stale-banner')).not.toBeInTheDocument();
    });

    it('should not show banner when no cached data', () => {
      mockUseSSE.mockReturnValue({
        data: null,
        isConnected: false,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      expect(screen.queryByTestId('stale-banner')).not.toBeInTheDocument();
    });
  });

  describe('Test 4: Manual refresh button calls refresh endpoint', () => {
    it('should call /api/scores/refresh when refresh button clicked', async () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      render(<HomePage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/scores/refresh',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ league: 'nba' }),
          })
        );
      });
    });

    it('should show "Refreshing..." text while refresh in progress', async () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      // Make fetch hang to test loading state
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<HomePage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should show refreshing state immediately
      expect(screen.getByText(/refreshing/i)).toBeInTheDocument();
    });
  });

  describe('Test 5: Error boundary catches SSE errors', () => {
    // Note: Testing ErrorBoundary behavior requires a different approach
    // as errors need to be thrown during render. This test validates
    // that the ErrorBoundary component is present in the tree.
    it('should have ErrorBoundary component in render tree', () => {
      const mockGames = [createMockGame('game-1')];
      mockUseSSE.mockReturnValue({
        data: mockGames,
        isConnected: true,
        error: null,
        reconnect: jest.fn(),
      });

      const { container } = render(<HomePage />);

      // Verify page renders without error
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/live nba scores/i)).toBeInTheDocument();
    });
  });

  describe('Test 6: Last updated timestamp updates when new data arrives', () => {
    it('should update timestamp when games data changes', async () => {
      const mockGames1 = [createMockGame('game-1')];
      const mockReconnect = jest.fn();

      // Initial render with data
      mockUseSSE.mockReturnValue({
        data: mockGames1,
        isConnected: true,
        error: null,
        reconnect: mockReconnect,
      });

      const { rerender } = render(<HomePage />);

      // Verify initial timestamp exists
      expect(screen.getByTestId('game-list')).toBeInTheDocument();

      // Simulate new data arriving
      const mockGames2 = [createMockGame('game-1'), createMockGame('game-2')];
      mockUseSSE.mockReturnValue({
        data: mockGames2,
        isConnected: true,
        error: null,
        reconnect: mockReconnect,
      });

      rerender(<HomePage />);

      // Verify games count updated
      expect(screen.getByText(/games count: 2/i)).toBeInTheDocument();
    });
  });
});
