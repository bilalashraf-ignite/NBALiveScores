'use client';

import { useCallback } from 'react';

export type HapticPattern = 'nudge' | 'success' | 'error';

export interface HapticFeedbackResult {
  trigger: (pattern: HapticPattern) => void;
}

/**
 * Hook to trigger haptic feedback using Vibration API.
 * Gracefully degrades when API is unsupported.
 *
 * Patterns:
 * - nudge: Light tap (10ms) - for button taps, card clicks
 * - success: Double tap (10ms, 50ms pause, 10ms) - for successful actions
 * - error: Long vibration (30ms) - for errors
 *
 * Used in Phase 05 Plan 02 for mobile polish.
 */
export function useHapticFeedback(): HapticFeedbackResult {
  const trigger = useCallback((pattern: HapticPattern) => {
    // Check if Vibration API is supported
    // Note: we check navigator.vibrate at call time, not at hook creation time
    if (typeof navigator.vibrate !== 'function') {
      return;
    }

    // Trigger pattern-specific vibration
    switch (pattern) {
      case 'nudge':
        navigator.vibrate(10);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error':
        navigator.vibrate(30);
        break;
    }
  }, []);

  return { trigger };
}
