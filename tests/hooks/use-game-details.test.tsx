/**
 * RED tests for useGameDetails hook
 * These tests MUST fail until the hook is implemented
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useGameDetails } from '@/hooks/use-game-details';
import type { League, GameDetails } from '@/types/sports-data';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useGameDetails hook (RED TEST)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state when enabled=true', () => {
    // This test will FAIL because useGameDetails hook doesn't exist yet
    const { result } = renderHook(() =>
      useGameDetails('game-123', 'NBA' as League, true)
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch from correct API endpoint when enabled=true', async () => {
    // This test will FAIL because useGameDetails hook doesn't exist yet
    const mockGameDetails: GameDetails = {
      gameId: 'game-123',
      league: 'NBA',
      homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW' },
      status: 'live' as any,
      score: { home: 95, away: 92 },
      teamStats: { home: {} as any, away: {} as any },
      playerStats: { home: [], away: [] },
      historicalMatchup: {} as any
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGameDetails
    });

    renderHook(() => useGameDetails('game-123', 'NBA' as League, true));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/games/NBA/game-123/details');
    });
  });

  it('should return data after successful fetch', async () => {
    // This test will FAIL because useGameDetails hook doesn't exist yet
    const mockGameDetails: GameDetails = {
      gameId: 'game-123',
      league: 'NBA',
      homeTeam: { id: 'lal', name: 'Lakers', abbreviation: 'LAL' },
      awayTeam: { id: 'gsw', name: 'Warriors', abbreviation: 'GSW' },
      status: 'live' as any,
      score: { home: 95, away: 92 },
      teamStats: { home: {} as any, away: {} as any },
      playerStats: { home: [], away: [] },
      historicalMatchup: {} as any
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGameDetails
    });

    const { result } = renderHook(() =>
      useGameDetails('game-123', 'NBA' as League, true)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockGameDetails);
      expect(result.current.error).toBeNull();
    });
  });

  it('should return error after failed fetch', async () => {
    // This test will FAIL because useGameDetails hook doesn't exist yet
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useGameDetails('game-123', 'NBA' as League, true)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should not fetch when enabled=false', async () => {
    // This test will FAIL because useGameDetails hook doesn't exist yet
    const { result } = renderHook(() =>
      useGameDetails('game-123', 'NBA' as League, false)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
