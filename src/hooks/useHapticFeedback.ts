/**
 * Hook for triggering haptic feedback on supported devices.
 * Provides graceful degradation when haptics are not supported.
 *
 * Patterns:
 * - success: Haptic feedback for successful actions (e.g., pull-to-refresh complete)
 * - nudge: Subtle haptic for tap acknowledgment
 * - error: Haptic feedback for errors
 * - buzz: Generic vibration pattern
 *
 * Pattern source: RESEARCH.md Pattern 6 (Mobile Gestures with Haptic Feedback)
 */
export function useHapticFeedback() {
  const trigger = (pattern: 'success' | 'nudge' | 'error' | 'buzz') => {
    // Graceful degradation - only trigger if Vibration API is supported
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    // Map patterns to vibration durations
    const vibrationPatterns: Record<string, number | number[]> = {
      success: [50, 30, 50],
      nudge: 10,
      error: [100, 30, 100, 30, 100],
      buzz: 50,
    };

    navigator.vibrate(vibrationPatterns[pattern] || 10);
  };

  return { trigger };
}
