'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHapticFeedback();

  const threshold = 80; // 80px pull distance triggers refresh

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate at top of page
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only track downward pulls
      if (distance > 0) {
        setPullDistance(distance);

        // Prevent default browser refresh
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > threshold && !isRefreshing) {
        // Trigger refresh
        setIsRefreshing(true);
        trigger('success'); // Haptic feedback

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset state
      setPullDistance(0);
      setStartY(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, isRefreshing, onRefresh, trigger, threshold]);

  // Calculate visual feedback
  const isPulling = pullDistance > 0 && !isRefreshing;
  const shouldShowIndicator = isPulling || isRefreshing;
  const indicatorHeight = Math.min(pullDistance, threshold);
  const isReadyToRefresh = pullDistance > threshold;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ overscrollBehaviorY: 'contain' }}
    >
      {/* Pull-to-refresh indicator */}
      {shouldShowIndicator && (
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-center transition-opacity"
          style={{
            height: `${indicatorHeight}px`,
            opacity: isPulling ? Math.min(pullDistance / threshold, 1) : 1,
          }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
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
            ) : isReadyToRefresh ? (
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Release to refresh</span>
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
                <span>Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content with margin to prevent overlap during pull */}
      <div style={{ marginTop: isRefreshing ? `${threshold}px` : 0 }}>
        {children}
      </div>
    </div>
  );
}
