import { formatDistanceToNow } from 'date-fns';
import { Game, GameState } from '@/types/sports-data';
import { GameCard } from './game-card';

interface GameListProps {
  games: Game[];
  lastUpdated?: Date;
}

/**
 * Game list container component that sorts games and displays them in responsive grid.
 *
 * Sorting logic: Live/Halftime games first (user's primary intent), then others.
 * Pattern source: RESEARCH.md Code Example - Responsive Game Card Grid
 */
export function GameList({ games, lastUpdated }: GameListProps) {
  // Sort games: Live/Halftime first, then others
  const sortedGames = [...games].sort((a, b) => {
    const liveStates = [GameState.LIVE, GameState.HALFTIME];
    const aIsLive = liveStates.includes(a.state);
    const bIsLive = liveStates.includes(b.state);
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;
    return 0; // Maintain original order within same priority
  });

  // Empty state
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">🏀</div>
        <p className="text-lg text-gray-600">No live games at the moment</p>
        <p className="mt-2 text-sm text-gray-500">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div>
      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="mb-4 text-sm text-gray-600">
          Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
      )}

      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
