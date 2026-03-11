import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeagueFilter } from '@/components/league-filter';
import { Game, GameState, League } from '@/types/sports-data';

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

describe('LeagueFilter', () => {
  const mockOnSelectLeague = jest.fn();

  beforeEach(() => {
    mockOnSelectLeague.mockClear();
  });

  describe('Test 1: All four filter pills render', () => {
    it('should render All, NBA, NCAA, and EuroLeague pills', () => {
      const games = [createMockGame()];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="all"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /nba/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ncaa/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /euroleague/i })).toBeInTheDocument();
    });
  });

  describe('Test 2: Game counts calculated correctly', () => {
    it('should show correct count for each league', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
        createMockGame({ id: 'game-2', league: 'NBA' }),
        createMockGame({ id: 'game-3', league: 'NCAA' }),
        createMockGame({ id: 'game-4', league: 'EuroLeague' }),
      ];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="all"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      expect(screen.getByRole('tab', { name: /all \(4\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /nba \(2\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ncaa \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /euroleague \(1\)/i })).toBeInTheDocument();
    });

    it('should show 0 count for leagues with no games', () => {
      const games: Game[] = [
        createMockGame({ id: 'game-1', league: 'NBA' }),
      ];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="all"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      expect(screen.getByRole('tab', { name: /nba \(1\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ncaa \(0\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /euroleague \(0\)/i })).toBeInTheDocument();
    });
  });

  describe('Test 3: onClick calls onSelectLeague with correct league ID', () => {
    it('should call onSelectLeague with "NBA" when NBA pill clicked', async () => {
      const user = userEvent.setup();
      const games = [createMockGame({ league: 'NBA' })];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="all"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      await user.click(screen.getByRole('tab', { name: /nba/i }));

      expect(mockOnSelectLeague).toHaveBeenCalledWith('NBA');
      expect(mockOnSelectLeague).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectLeague with "all" when All pill clicked', async () => {
      const user = userEvent.setup();
      const games = [createMockGame()];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="NBA"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      await user.click(screen.getByRole('tab', { name: /all/i }));

      expect(mockOnSelectLeague).toHaveBeenCalledWith('all');
    });
  });

  describe('Test 4: Selected pill has active styling', () => {
    it('should apply bg-blue-600 class to selected pill', () => {
      const games = [createMockGame({ league: 'NBA' })];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="NBA"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      const nbaPill = screen.getByRole('tab', { name: /nba/i });
      expect(nbaPill).toHaveClass('bg-blue-600');
      expect(nbaPill).toHaveClass('text-white');
    });

    it('should set aria-selected=true on selected pill', () => {
      const games = [createMockGame()];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="NCAA"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      expect(screen.getByRole('tab', { name: /ncaa/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /nba/i })).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Test 5: Unselected pills have default styling', () => {
    it('should apply bg-gray-100 class to unselected pills', () => {
      const games = [createMockGame()];

      render(
        <LeagueFilter
          games={games}
          selectedLeague="NBA"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      const ncaaPill = screen.getByRole('tab', { name: /ncaa/i });
      expect(ncaaPill).toHaveClass('bg-gray-100');
      expect(ncaaPill).toHaveClass('text-gray-700');
    });
  });

  describe('Test 6: Empty state with no games', () => {
    it('should show 0 count for all leagues when no games', () => {
      render(
        <LeagueFilter
          games={[]}
          selectedLeague="all"
          onSelectLeague={mockOnSelectLeague}
        />
      );

      expect(screen.getByRole('tab', { name: /all \(0\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /nba \(0\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ncaa \(0\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /euroleague \(0\)/i })).toBeInTheDocument();
    });
  });
});
