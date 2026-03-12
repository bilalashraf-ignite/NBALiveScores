/**
 * Loading skeleton for game detail modal.
 * Displays animated placeholders while GameDetails data is fetching.
 *
 * Reuses pattern from GameCardSkeleton (animate-pulse on gray rectangles).
 * Structure matches final modal layout to prevent layout shift.
 */
export function GameDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" data-testid="game-detail-skeleton">
      {/* Score header skeleton */}
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />

      {/* Team stats skeleton (3-4 rows) */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Player stats skeleton (5-6 rows) */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}
