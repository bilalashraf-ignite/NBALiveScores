import { render } from '@testing-library/react';
import { GameCard } from '@/components/game-card';
import { GameCardSkeleton } from '@/components/game-card-skeleton';
import { GameState } from '@/types/sports-data';

describe('Skeleton Dimension Matching', () => {
  it('GameCardSkeleton has similar padding and border classes as GameCard', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 100, away: 98 },
      state: GameState.LIVE,
      scheduledTime: new Date()
    };

    const { container: skeletonContainer } = render(<GameCardSkeleton />);
    const { container: cardContainer } = render(
      <GameCard game={mockGame} onClick={() => {}} />
    );

    const skeleton = skeletonContainer.firstChild as HTMLElement;
    const card = cardContainer.firstChild as HTMLElement;

    // Both should have p-6 padding
    expect(skeleton.className).toContain('p-6');
    expect(card.className).toContain('p-6');

    // Both should have rounded-lg
    expect(skeleton.className).toContain('rounded-lg');
    expect(card.className).toContain('rounded-lg');
  });

  it('Skeleton has matching padding class (p-6)', () => {
    const { container } = render(<GameCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;

    // Verify p-6 class is applied (1.5rem = 24px)
    expect(skeleton.className).toContain('p-6');
  });

  it('Skeleton has same border and shadow classes as GameCard', () => {
    const mockGame = {
      id: '1',
      league: 'NBA' as const,
      homeTeam: { id: 'h1', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'a1', name: 'Celtics', abbreviation: 'BOS' },
      score: { home: 100, away: 98 },
      state: GameState.LIVE,
      scheduledTime: new Date()
    };

    const { container: skeletonContainer } = render(<GameCardSkeleton />);
    const { container: cardContainer } = render(
      <GameCard game={mockGame} onClick={() => {}} />
    );

    const skeleton = skeletonContainer.firstChild as HTMLElement;
    const card = cardContainer.firstChild as HTMLElement;

    // Both should have border classes
    expect(skeleton.className).toContain('border');
    expect(card.className).toContain('border');

    // Both should have shadow classes
    expect(skeleton.className).toContain('shadow');
    expect(card.className).toContain('shadow');
  });

  it('Skeleton contains team logo placeholders with h-10 w-10 classes', () => {
    const { container } = render(<GameCardSkeleton />);

    // Should have 2 logo placeholders (home and away teams) with h-10 and w-10 classes
    const logoPlaceholders = container.querySelectorAll('.h-10.w-10');
    expect(logoPlaceholders.length).toBeGreaterThanOrEqual(2);

    // Verify each placeholder has both h-10 and w-10 classes (40px each)
    logoPlaceholders.forEach(placeholder => {
      expect(placeholder.className).toContain('h-10');
      expect(placeholder.className).toContain('w-10');
    });
  });
});
