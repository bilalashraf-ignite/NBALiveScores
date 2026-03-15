'use client';

import { useState, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

/**
 * Pull-to-refresh component for mobile-native refresh gesture.
 *
 * Features:
 * - 80px pull threshold for comfortable gesture
 * - Only activates at top of page (scrollY === 0)
 * - Visual feedback with indicator and loading spinner
 * - Haptic feedback on successful refresh trigger
 * - Prevents default browser pull-to-refresh behavior
 *
 * Pattern source: RESEARCH.md Pattern 6 (Mobile Gestures - Pull-to-Refresh)
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHapticFeedback();

  const threshold = 80; // 80px pull distance triggers refresh

  // Pull-to-refresh gesture using @use-gesture/react
  const bind = useDrag(
    ({ down, movement: [, my], memo }) => {
      // Only activate at top of page
      if (!memo && window.scrollY !== 0) {
        return memo;
      }

      // Update indicator position and text via ref
      if (indicatorRef.current && my > 0) {
        const clampedY = Math.min(my, 120);
        indicatorRef.current.style.transform = `translateY(${clampedY}px)`;
        indicatorRef.current.style.opacity = String(Math.min(clampedY / threshold, 1));

        // Update text based on threshold
        const textElement = indicatorRef.current.querySelector('[data-pull-text]');
        if (textElement) {
          textElement.textContent = my > threshold ? 'Release to refresh' : 'Pull to refresh';
        }

        // Show indicator
        indicatorRef.current.style.display = 'flex';
      }

      // On release
      if (!down) {
        if (my > threshold && !isRefreshing) {
          // Crossed threshold - trigger refresh
          setIsRefreshing(true);
          trigger('success');
          onRefresh().finally(() => {
            setIsRefreshing(false);
            // Hide indicator after refresh
            if (indicatorRef.current) {
              indicatorRef.current.style.display = 'none';
            }
          });
        }

        // Reset indicator
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = 'translateY(0)';
          indicatorRef.current.style.opacity = '0';
          if (!isRefreshing) {
            indicatorRef.current.style.display = 'none';
          }
        }
      }

      return memo ?? true;
    },
    {
      axis: 'y',
      filterTaps: true,
      bounds: { top: 0, bottom: 120 },
      rubberband: true,
    }
  );

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ overscrollBehaviorY: 'contain' }}
      {...bind()}
    >
      {/* Pull-to-refresh indicator */}
      <div
        ref={indicatorRef}
        className="absolute left-0 right-0 top-0 flex items-center justify-center"
        style={{
          display: 'none',
          opacity: 0,
          transform: 'translateY(0)',
          height: `${threshold}px`,
        }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {isRefreshing ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <span data-pull-text>Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {/* Content with margin to prevent overlap during pull */}
      <div style={{ marginTop: isRefreshing ? `${threshold}px` : 0 }}>
        {children}
      </div>
    </div>
  );
}
