import { formatDistanceToNow } from 'date-fns';

/**
 * Warning banner displayed when showing cached/stale data.
 * Appears when SSE connection is lost but cached data is still available.
 *
 * Design: Yellow-themed warning with timestamp and manual refresh action (UX-04).
 * Pattern source: RESEARCH.md Pattern 4.
 */

interface StaleDataBannerProps {
  lastUpdated: Date;
  onRefresh: () => void;
}

export function StaleDataBanner({ lastUpdated, onRefresh }: StaleDataBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-800">⚠️</span>
          <span className="text-sm text-yellow-800">
            Showing cached data from {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm font-semibold text-yellow-800 hover:text-yellow-900"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
