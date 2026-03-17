import { useRef } from 'react';
import { WebHaptics } from 'web-haptics';

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
  // Lazy-initialize WebHaptics instance
  const hapticsRef = useRef<WebHaptics | null>(null);

  const trigger = (pattern: 'success' | 'nudge' | 'error' | 'buzz') => {
    // Graceful degradation - only trigger if supported
    if (!WebHaptics.isSupported) return;

    // Lazy initialization to avoid creating instance if never used
    if (!hapticsRef.current) {
      hapticsRef.current = new WebHaptics();
    }

    hapticsRef.current.trigger(pattern);
  };

  return { trigger };
}
