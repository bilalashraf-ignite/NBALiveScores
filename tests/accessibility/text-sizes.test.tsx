import { render } from '@testing-library/react';
import { GameCard } from '@/components/game-card';
import { StatusBadge } from '@/components/status-badge';
import { GameState } from '@/types/sports-data';

describe('Text Size Accessibility', () => {
  it('Team name text uses font-semibold class', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 100, away: 98 },
      state: GameState.LIVE,
      scheduledTime: new Date()
    };

    const { container } = render(<GameCard game={mockGame} onClick={() => {}} />);
    const teamNames = container.querySelectorAll('.font-semibold');

    // Should have at least 2 team names (home and away)
    expect(teamNames.length).toBeGreaterThanOrEqual(2);
  });

  it('Score text uses text-3xl class (30px)', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 100, away: 98 },
      state: GameState.LIVE,
      scheduledTime: new Date()
    };

    const { container } = render(<GameCard game={mockGame} onClick={() => {}} />);
    const scoreElements = container.querySelectorAll('.text-3xl');

    // Should have 2 scores (home and away)
    expect(scoreElements.length).toBe(2);
  });

  it('Status badge uses text-xs class (12px minimum)', () => {
    const { container } = render(<StatusBadge status={GameState.LIVE} />);
    const badge = container.firstChild as HTMLElement;

    // Verify text-xs class is applied
    expect(badge.className).toContain('text-xs');
  });

  it('Game context uses text-sm class (14px)', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 100, away: 98 },
      state: GameState.LIVE,
      scheduledTime: new Date(),
      period: 4,
      timeRemaining: '2:30'
    };

    const { container } = render(<GameCard game={mockGame} onClick={() => {}} />);
    const contextText = container.querySelector('.text-sm');

    // Verify text-sm class is present on game context
    expect(contextText).toBeTruthy();
  });
});
