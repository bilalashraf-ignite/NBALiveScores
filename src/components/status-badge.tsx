import { GameState } from '@/types/sports-data'

interface StatusBadgeProps {
  status: GameState
}

/**
 * Color-coded status badge for game states with pulse animation on live games.
 * 
 * Design rationale (from RESEARCH.md):
 * - Pulse animation only on small badges (not entire cards) to prevent mobile jank
 * - Color grouping: LIVE+HALFTIME (red), FINAL (gray), SCHEDULED (blue), POSTPONED+CANCELLED (yellow)
 * - CSS-based animation (no JS) for performance
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<GameState, { color: string; animate: string; label: string }> = {
    [GameState.LIVE]: {
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      animate: 'animate-pulse',
      label: 'LIVE'
    },
    [GameState.HALFTIME]: {
      color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      animate: 'animate-pulse',
      label: 'HALFTIME'
    },
    [GameState.FINAL]: {
      color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
      animate: '',
      label: 'FINAL'
    },
    [GameState.SCHEDULED]: {
      color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      animate: '',
      label: 'SCHEDULED'
    },
    [GameState.POSTPONED]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      animate: '',
      label: 'POSTPONED'
    },
    [GameState.CANCELLED]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      animate: '',
      label: 'CANCELLED'
    },
  }

  const { color, animate, label } = config[status]

  return (
    <span className={`inline-flex items-center justify-center min-w-[100px] rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color} ${animate}`}>
      {label}
    </span>
  )
}
