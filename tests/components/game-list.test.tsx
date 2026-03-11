import { render, screen } from '@testing-library/react';
import { GameList } from '@/components/game-list';
import { Game, GameState, League } from '@/types/sports-data';

// Mock GameCard component to simplify testing
jest.mock('@/components/game-card', () => ({
  GameCard: ({ game }: { game: Game }) => (
    <div data-testid={`game-card-${game.league}-${game.id}`}>{game.homeTeam.name}</div>
  ),
}));

const createMockGame = (overrides: Partial<Game> = {}): Game => ({
  id: 'game-1',
  league: 'NBA',
  state: GameState.SCHEDULED,
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
  score: { home: 0, away: 0 },
  scheduledTime: new Date('2026-03-11T19:00:00Z'),
  ...overrides,
});

describe('GameList', () => {
  describe('Test 1: Live games sorted before scheduled/final games', () => {
    it('should sort live and halftime games before other states', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', state: GameState.SCHEDULED }),
        createMockGame({ id: 'game-2', state: GameState.LIVE }),
        createMockGame({ id: 'game-3', state: GameState.FINAL }),
        createMockGame({ id: 'game-4', state: GameState.HALFTIME }),
      ];

      render(<GameList games={games} />);

      const cards = screen.getAllByTestId(/game-card-/);

      // Live and halftime games should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'game-card-NBA-game-2'); // LIVE
      expect(cards[1]).toHaveAttribute('data-testid', 'game-card-NBA-game-4'); // HALFTIME
      // Scheduled and final in original order
      expect(cards[2]).toHaveAttribute('data-testid', 'game-card-NBA-game-1'); // SCHEDULED
      expect(cards[3]).toHaveAttribute('data-testid', 'game-card-NBA-game-3'); // FINAL
    });
  });

  describe('Test 2: Empty state shows message', () => {
    it('should display "No games available" when games array is empty', () => {
      render(<GameList games={[]} />);

      expect(screen.getByText(/no games available/i)).toBeInTheDocument();
    });
  });

  describe('Test 3: Grid layout renders with responsive classes', () => {
    it('should render grid with responsive column classes', () => {
      const games = [createMockGame()];

      const { container } = render(<GameList games={games} />);

      // Find the grid container
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1'); // Mobile
      expect(gridContainer).toHaveClass('md:grid-cols-2'); // Tablet
      expect(gridContainer).toHaveClass('lg:grid-cols-3'); // Desktop
    });
  });

  describe('Test 4: GameCard components rendered for each game', () => {
    it('should render a GameCard for each game in sorted array', () => {
      const games = [
        createMockGame({ id: 'game-1' }),
        createMockGame({ id: 'game-2' }),
        createMockGame({ id: 'game-3' }),
      ];

      render(<GameList games={games} />);

      expect(screen.getByTestId('game-card-NBA-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-NBA-game-2')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-NBA-game-3')).toBeInTheDocument();
    });
  });

  describe('Test 5: League filtering', () => {
    it('should filter games by selected league', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
        createMockGame({ id: 'game-2', league: 'NCAA' }),
        createMockGame({ id: 'game-3', league: 'EuroLeague' }),
      ];

      render(<GameList games={games} selectedLeague="NBA" />);

      // Only NBA game should be rendered
      expect(screen.getByTestId('game-card-NBA-game-1')).toBeInTheDocument();
      expect(screen.queryByTestId('game-card-NCAA-game-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('game-card-EuroLeague-game-3')).not.toBeInTheDocument();
    });

    it('should show all games when selectedLeague is "all"', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
        createMockGame({ id: 'game-2', league: 'NCAA' }),
      ];

      render(<GameList games={games} selectedLeague="all" />);

      expect(screen.getByTestId('game-card-NBA-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-NCAA-game-2')).toBeInTheDocument();
    });

    it('should default to "all" when selectedLeague is undefined', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
        createMockGame({ id: 'game-2', league: 'NCAA' }),
      ];

      render(<GameList games={games} />);

      // Both games should render
      expect(screen.getByTestId('game-card-NBA-game-1')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-NCAA-game-2')).toBeInTheDocument();
    });

    it('should show empty state with league-specific message when no games match filter', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
      ];

      render(<GameList games={games} selectedLeague="NCAA" />);

      expect(screen.getByText('No NCAA games available')).toBeInTheDocument();
    });

    it('should show generic message when filter is "all" and no games exist', () => {
      render(<GameList games={[]} selectedLeague="all" />);

      expect(screen.getByText('No games available')).toBeInTheDocument();
    });

    it('should maintain live/halftime sorting after filtering', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA', state: GameState.SCHEDULED }),
        createMockGame({ id: 'game-2', league: 'NBA', state: GameState.LIVE }),
        createMockGame({ id: 'game-3', league: 'NCAA', state: GameState.LIVE }),
      ];

      render(<GameList games={games} selectedLeague="NBA" />);

      const cards = screen.getAllByTestId(/game-card-/);

      // Live NBA game should be first
      expect(cards[0]).toHaveAttribute('data-testid', 'game-card-NBA-game-2');
      expect(cards[1]).toHaveAttribute('data-testid', 'game-card-NBA-game-1');
      // NCAA game should not be present
      expect(cards.length).toBe(2);
    });
  });

  describe('Test 6: Stable keys with league prefix', () => {
    it('should use league-id composite key format', () => {
      const games: Game[] = [
        createMockGame({ id: '123', league: 'NBA' }),
        createMockGame({ id: '123', league: 'NCAA' }), // Same ID, different league
      ];

      render(<GameList games={games} />);

      // Both should render with unique keys
      expect(screen.getByTestId('game-card-NBA-123')).toBeInTheDocument();
      expect(screen.getByTestId('game-card-NCAA-123')).toBeInTheDocument();
    });
  });

  describe('Test 7: Last updated timestamp displayed and formatted correctly', () => {
    it('should display formatted "last updated" timestamp', () => {
      const games = [createMockGame()];
      // Use a date in the past so formatDistanceToNow includes "ago"
      const lastUpdated = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      render(<GameList games={games} lastUpdated={lastUpdated} />);

      // Should contain "Last updated" text
      expect(screen.getByText(/last updated/i)).toBeInTheDocument();
      // Should contain time reference (minutes/hours/seconds)
      expect(screen.getByText(/last updated:/i).textContent).toMatch(/(minute|second|hour)/i);
    });

    it('should not display timestamp when lastUpdated is undefined', () => {
      const games = [createMockGame()];

      render(<GameList games={games} />);

      expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
    });
  });
});
