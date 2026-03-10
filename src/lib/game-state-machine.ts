import { Game, GameState } from '@/types/sports-data';

/**
 * Polling interval constants (in milliseconds).
 *
 * These intervals implement adaptive polling to prevent rate limit exhaustion.
 * Free APIs typically allow 10-30 requests/minute - naive polling would exhaust
 * this quickly. Adaptive polling reduces API calls by 70-80% (see PITFALLS.md #1).
 *
 * Research recommendations:
 * - Scheduled games: 5-10 minutes (low priority, infrequent changes)
 * - Live games: 10-15 seconds (high priority, frequent updates)
 * - Halftime: 2-5 minutes (medium priority, predictable duration)
 * - Final games: Stop polling (no changes expected)
 * - Postponed: 30 minutes (check for rescheduling)
 */
const POLLING_INTERVALS = {
  SCHEDULED: 5 * 60 * 1000,  // 5 minutes for scheduled games
  LIVE: 15 * 1000,           // 15 seconds for live games (balances freshness vs rate limits)
  HALFTIME: 2 * 60 * 1000,   // 2 minutes during halftime
  FINAL: null,               // Stop polling finished games
  POSTPONED: 30 * 60 * 1000, // 30 minutes for postponed (check for rescheduling)
  CANCELLED: null            // Stop polling cancelled games
} as const;

/**
 * Get the appropriate polling interval for a game based on its state.
 *
 * Adaptive polling strategy:
 * - LIVE games poll frequently (15s) for real-time updates
 * - SCHEDULED games poll infrequently (5min) since they rarely change
 * - HALFTIME polls moderately (2min) since duration is predictable
 * - FINAL/CANCELLED games don't poll (null) since they won't change
 *
 * This prevents rate limit exhaustion on free APIs while maintaining
 * responsiveness for active games.
 *
 * @param state - Current game state
 * @returns Polling interval in milliseconds, or null to stop polling
 */
export function getPollingInterval(state: GameState): number | null {
  return POLLING_INTERVALS[state];
}

/**
 * Game state machine for managing state transitions and polling logic.
 *
 * Addresses PITFALLS.md #4 (game state mismanagement) by enforcing valid
 * state transitions and providing centralized state determination logic.
 */
export class GameStateMachine {
  /**
   * Valid state transitions (from -> to).
   * Enforces logical game flow and prevents invalid transitions.
   */
  private static readonly VALID_TRANSITIONS: Record<GameState, GameState[]> = {
    [GameState.SCHEDULED]: [GameState.LIVE, GameState.POSTPONED, GameState.CANCELLED],
    [GameState.LIVE]: [GameState.HALFTIME, GameState.FINAL],
    [GameState.HALFTIME]: [GameState.LIVE, GameState.FINAL],
    [GameState.FINAL]: [], // Final is terminal
    [GameState.POSTPONED]: [GameState.SCHEDULED], // Can be rescheduled
    [GameState.CANCELLED]: [] // Cancelled is terminal
  };

  /**
   * Determine the current state of a game from external API data.
   *
   * This method encapsulates the logic for interpreting API responses
   * and mapping them to our GameState enum. Different APIs may represent
   * states differently, so this provides a consistent determination strategy.
   *
   * @param game - Game data (potentially from external API)
   * @returns Determined GameState
   */
  determineState(game: Game): GameState {
    // If game already has a state, validate and return it
    if (game.state) {
      return game.state;
    }

    // Fallback logic for determining state from other fields
    // (in case API doesn't provide explicit state)
    const now = new Date();

    if (game.scheduledTime > now) {
      return GameState.SCHEDULED;
    }

    if (game.period && game.period > 0) {
      if (game.timeRemaining === '0:00' && game.period >= 4) {
        return GameState.FINAL;
      }
      if (game.period === 2 && game.timeRemaining === '0:00') {
        return GameState.HALFTIME;
      }
      return GameState.LIVE;
    }

    return GameState.SCHEDULED;
  }

  /**
   * Validate whether a state transition is logically valid.
   *
   * Prevents impossible transitions like FINAL -> LIVE or CANCELLED -> SCHEDULED.
   * This helps catch bugs in API data or integration logic early.
   *
   * @param from - Current state
   * @param to - Proposed new state
   * @returns true if transition is valid, false otherwise
   */
  validateTransition(from: GameState, to: GameState): boolean {
    // Same state is always valid (no transition)
    if (from === to) {
      return true;
    }

    const validNextStates = GameStateMachine.VALID_TRANSITIONS[from] || [];
    return validNextStates.includes(to);
  }

  /**
   * Determine if a game should be polled based on its state and last poll time.
   *
   * Implements adaptive polling strategy:
   * 1. Check if game state allows polling (FINAL/CANCELLED don't poll)
   * 2. Check if enough time has passed since last poll
   *
   * @param game - Game to check
   * @param lastPollTime - Timestamp of last poll
   * @returns true if game should be polled now, false otherwise
   */
  shouldPoll(game: Game, lastPollTime: Date): boolean {
    const interval = getPollingInterval(game.state);

    // null interval means stop polling (FINAL/CANCELLED)
    if (interval === null) {
      return false;
    }

    const now = new Date();
    const timeSinceLastPoll = now.getTime() - lastPollTime.getTime();

    return timeSinceLastPoll >= interval;
  }
}

// TODO Phase 2: Test state transitions (SCHEDULED -> LIVE -> HALFTIME -> LIVE -> FINAL)
// TODO Phase 2: Test polling intervals match research recommendations
// TODO Phase 2: Test invalid transitions are rejected (e.g., FINAL -> LIVE)
// TODO Phase 2: Test shouldPoll respects intervals for each state
// TODO Phase 2: Test edge cases (overtime, double overtime, extended halftime)
