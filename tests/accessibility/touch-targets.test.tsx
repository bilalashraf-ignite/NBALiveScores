import { render, screen } from '@testing-library/react';
import { GameCard } from '@/components/game-card';
import { GameList } from '@/components/game-list';
import { GameDetailModal } from '@/components/game-detail-modal';
import { GameState } from '@/types/sports-data';

describe('Touch Target Accessibility', () => {
  it('GameCard has minimum 120px height class', () => {
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

    const { container } = render(
      <GameCard game={mockGame} onClick={() => {}} />
    );

    const card = container.firstChild as HTMLElement;

    // Verify min-h-[120px] class is applied
    expect(card.className).toContain('min-h-[120px]');
  });

  it('Modal close button has minimum 48x48px touch target', () => {
    render(
      <GameDetailModal
        open={true}
        onOpenChange={() => {}}
        gameId="1"
        league="NBA"
      />
    );

    // Find close button in document (Radix Portal renders outside container)
    const closeButton = document.querySelector('.h-12.w-12') as HTMLElement;

    expect(closeButton).toBeTruthy();
    if (closeButton) {
      // Verify h-12 and w-12 classes are applied (Tailwind: h-12 = 48px, w-12 = 48px)
      expect(closeButton.className).toContain('h-12');
      expect(closeButton.className).toContain('w-12');
    }
  });

  it('GameCard is clickable and keyboard accessible for LIVE games', () => {
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

    const { container } = render(
      <GameCard game={mockGame} onClick={() => {}} />
    );

    const card = container.firstChild as HTMLElement;

    // Verify role and tabIndex for keyboard accessibility
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabIndex')).toBe('0');
  });

  it('GameCard is not clickable for SCHEDULED games', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 0, away: 0 },
      state: GameState.SCHEDULED,
      scheduledTime: new Date()
    };

    const { container } = render(
      <GameCard game={mockGame} onClick={() => {}} />
    );

    const card = container.firstChild as HTMLElement;

    // Verify no role or tabIndex for non-clickable scheduled games
    expect(card.getAttribute('role')).toBeNull();
    expect(card.getAttribute('tabIndex')).toBeNull();
  });
});
