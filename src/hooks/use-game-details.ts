import { useState, useEffect } from 'react';
import type { GameDetails, League } from '@/types/sports-data';

interface UseGameDetailsResult {
  data: GameDetails | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching detailed game information on-demand.
 * Only fetches when enabled=true, allowing lazy loading when modal opens.
 *
 * Pattern from RESEARCH.md Pattern 4 (on-demand data fetching).
 *
 * @param gameId - Game identifier
 * @param league - League identifier
 * @param enabled - Whether to fetch data (set to true when modal opens)
 * @returns Object with data, loading, and error states
 */
export function useGameDetails(
  gameId: string,
  league: League,
  enabled: boolean
): UseGameDetailsResult {
  const [data, setData] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      return;
    }

    // Reset state when fetching new data
    setLoading(true);
    setError(null);

    // Fetch game details from API
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`/api/games/${league}/${gameId}/details`);

        if (!response.ok) {
          throw new Error(`Failed to fetch game details: ${response.statusText}`);
        }

        const gameDetails = await response.json();
        setData(gameDetails);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId, league, enabled]);

  return { data, loading, error };
}
