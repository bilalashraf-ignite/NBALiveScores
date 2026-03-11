/**
 * Loading skeleton matching GameCard structure.
 * 
 * Design rationale (from RESEARCH.md):
 * - Matches GameCard dimensions exactly to prevent layout shift
 * - Pulse animation on individual elements (not parent) for performance
 * - Used during initial page load (UX-05 requirement)
 * - Small elements animated independently to stay within performance budget
 */
export function GameCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        {/* Status badge skeleton - top-right */}
        <div className="flex justify-end">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
        </div>

        {/* Home team skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-12 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Away team skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-12 animate-pulse rounded bg-gray-200"></div>
        </div>

        {/* Game context skeleton */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}
