# Phase 04: Game Details & Statistics - Research

**Researched:** 2026-03-12
**Domain:** Modal dialogs, data tables, on-demand data fetching in Next.js App Router
**Confidence:** HIGH

## Summary

Phase 04 adds a comprehensive game details modal with team statistics, player statistics, and historical matchup data. The modal overlays on top of the home page (maintaining SSE connection), fetches detailed game data on-demand, and presents statistics in sortable tables with historical context.

**Key technical findings:**
- **Radix UI Dialog** is the standard for accessible React modals with built-in focus trapping, ESC/outside-click handling, and ARIA compliance
- **TanStack Table v8** is the industry standard for sortable React tables with flexible state management and built-in sorting functions
- **Browser history integration** via `history.pushState()` and `popstate` event enables back button dismissal without breaking SSE connection
- **Horizontal scroll** is the accepted mobile pattern for wide tables (wrap in `overflow-x: auto` container)
- **Testing modals** with React Testing Library is straightforward using portal queries and `waitFor()` for visibility assertions

**Primary recommendation:** Use Radix UI Dialog for accessibility-compliant modal, TanStack Table for sortable player statistics, custom comparison table for team stats, and browser History API for back button support.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**1. Game Detail Page Structure**
- **Navigation Pattern:** Modal/overlay popup (URL does not change, overlays on home page)
- **Modal Dismissal Methods:** X button (top-right), click outside on backdrop, ESC key, browser back button (requires history.pushState)
- **Content Layout:** Single scrollable modal container (no tabs), scroll order: score → team stats → top performers → player stats → historical data
- **Modal Animation:** Fade in + scale up from center (smooth, modern feel)
- **SSE Connection Behavior:** Keep SSE active while modal open, home page updates in background

**2. Team Statistics Display**
- **Statistics to Display:** FG%, 3P%, FT%, Assists, Turnovers, Offensive/Defensive/Total Rebounds, Steals, Blocks
- **Data Scope:** Current game only (no season averages), game totals only (no quarter breakdown)
- **Format:** Side-by-side comparison table (Home | Stat Name | Away), shooting stats with Made-Attempted + Percentage, bold the better stat value (no color coding)
- **Scroll Behavior:** Team stats table scrolls away naturally (not sticky/fixed)

**3. Player Statistics Display**
- **Statistics to Display:** Points, FG, 3P, FT, Rebounds, Assists, Steals, Blocks, Minutes played
- **Table Organization:** Both teams in one table separated by visual divider (home team first, divider, away team)
- **Default Sort Order:** By points scored (highest first)
- **Interactive Features:** Sortable columns (click header to re-sort by any stat)
- **Format:** Shooting stats as Made-Attempted (e.g., "8-15 FG"), player names as jersey number + last name (e.g., "#23 James"), DNP players shown with 0:00 minutes
- **Mobile Handling:** Horizontal scroll for wide table (all columns remain visible)

**4. Historical Matchup Data**
- **Data to Display:** Last 5 meetings (date, score, winner), season series record (e.g., "Team A leads 2-1 this season"), head-to-head all-time record, average combined points per matchup
- **Display Format:** Simple list for last 5 meetings, text summary for series records, placement at bottom of modal after all stats
- **Fallback Strategy:** Show "Historical data unavailable" message if no data (section always present)

**5. Implementation Strategy**
- **Data Strategy:** Use mock data for Phase 4 UI implementation (defer real API integration similar to Phase 3)
- **Game State Support:** LIVE games (full stats), FINAL games (full stats), SCHEDULED games (modal not available, no stats yet)
- **Data Model:** Create separate `GameDetails` interface (does not extend `Game`), fetch GameDetails on-demand when modal opens
- **Code Structure:** `BaseAdapter.getGameDetails(gameId, league)` method, GameCard click handler opens modal

### Claude's Discretion

**1. Modal Component Library:** Use Radix UI Dialog (already in use for accessibility) or build custom modal?
   - **Research recommendation:** Use Radix UI Dialog (accessibility built-in, focus trap, ESC/outside click handling)

**2. Stat Abbreviations:** Use standard basketball abbreviations or spell out?
   - **Research recommendation:** Use abbreviations in table headers (space-constrained), provide aria-label for accessibility

**3. Empty State:** What if a game has no player stats data?
   - **Research recommendation:** Show team stats + "Player statistics unavailable" message, historical data section functions independently

**4. Loading State:** How to handle delay fetching GameDetails when modal opens?
   - **Research recommendation:** Show skeleton loader inside modal while fetching, reuse existing SkeletonCard pattern from Phase 2

### Deferred Ideas (OUT OF SCOPE)
- Real API integration for game details (Phase 4 uses mock data, API integration deferred)
- Advanced stats like True Shooting % or Player Efficiency Rating (v2.0 requirement ADV-04)
- Shot charts and visualizations (v2.0, requires paid APIs with tracking data)
- Quarter-by-quarter breakdown of team statistics
- Season averages comparison alongside game statistics
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HIST-03 | User can view historical head-to-head matchup data between teams | Browser history API enables back button, Radix Dialog provides modal container, HistoricalMatchup component displays data |
| HIST-04 | User can see last 5 meetings between two teams with outcomes | Simple list pattern in HistoricalMatchup component, date formatting with date-fns |
| STAT-01 | User can view basic team statistics during live games (field goal %, rebounds, assists) | TeamStatsTable component with side-by-side comparison, shooting percentage calculations |
| STAT-02 | User can view turnovers for each team | TeamStatsTable includes turnovers row in standard order |
| STAT-03 | User can view individual player statistics during live games | TanStack Table v8 provides sortable player stats table |
| STAT-04 | User can see player points, rebounds, and assists | PlayerStatsTable columns include PTS, REB, AST with sorting support |
| STAT-05 | User can access player statistics by expanding game details | GameCard onClick handler triggers modal, fetches GameDetails on-demand |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-dialog | 1.1.15+ | Accessible modal dialogs | Industry standard for React modals, built-in accessibility (focus trap, ESC handling, ARIA), actively maintained, WAI-ARIA compliant |
| @tanstack/react-table | 8.x | Headless table library with sorting | Industry standard for React tables, framework-agnostic, flexible state management, built-in sorting with 6 sort functions, actively maintained |
| date-fns | 4.1.0 (already installed) | Date formatting for historical data | Already in project, lightweight, modern alternative to moment.js, excellent for formatting last 5 meetings dates |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-error-boundary | 6.1.1 (already installed) | Error boundaries for modal content | Already in project, use for graceful error handling when GameDetails fetch fails |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Radix UI Dialog | Headless UI Dialog | Headless UI is also excellent but Radix has better WAI-ARIA compliance and more granular control; Radix is more popular in 2026 |
| TanStack Table | Custom sorting logic | Custom sorting misses edge cases (mixed alphanumeric, undefined values, case sensitivity); TanStack has 6 battle-tested sort functions |
| Unified radix-ui package | Individual @radix-ui/react-dialog | Unified package is newer (Feb 2026), but for single component, individual package is fine; unified is better for 5+ Radix components |

**Installation:**
```bash
npm install @radix-ui/react-dialog @tanstack/react-table
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── game-detail-modal.tsx        # Main modal component (Radix Dialog.Root)
│   ├── team-stats-table.tsx         # Team comparison table (custom component)
│   ├── player-stats-table.tsx       # Player stats with sorting (TanStack Table)
│   ├── historical-matchup.tsx       # Last 5 games display
│   └── game-card.tsx                # Add onClick handler to open modal
├── hooks/
│   ├── use-game-details.ts          # Fetch hook for GameDetails data
│   └── use-modal-history.ts         # Browser history integration for back button
├── types/
│   └── sports-data.ts               # Extend with GameDetails, TeamStats, PlayerStats, HistoricalMatchup interfaces
└── lib/adapters/
    └── base-adapter.ts              # Add getGameDetails() abstract method
```

### Pattern 1: Radix UI Dialog with Controlled State
**What:** Modal state managed in parent component, Radix Dialog provides accessibility primitives
**When to use:** All modal interactions (open/close via X, backdrop, ESC, back button)
**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/dialog
import * as Dialog from '@radix-ui/react-dialog'

export function GameDetailModal({ gameId, league, open, onOpenChange }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title>Game Details</Dialog.Title>
          <Dialog.Description>Team and player statistics</Dialog.Description>
          {/* Content */}
          <Dialog.Close>X</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Pattern 2: TanStack Table with Sorting State
**What:** Headless table with controlled sorting state for player statistics
**When to use:** Player stats table with sortable columns (points, rebounds, assists, etc.)
**Example:**
```typescript
// Source: https://tanstack.com/table/v8/docs/guide/sorting
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table'

export function PlayerStatsTable({ homeStats, awayStats }) {
  const [sorting, setSorting] = useState([{ id: 'points', desc: true }])

  const table = useReactTable({
    data: [...homeStats, ...awayStats],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th onClick={header.column.getToggleSortingHandler()}>
                {header.column.columnDef.header}
                {header.column.getIsSorted() === 'asc' ? ' ▲' :
                 header.column.getIsSorted() === 'desc' ? ' ▼' : ''}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      {/* tbody */}
    </table>
  )
}
```

### Pattern 3: Browser History Integration for Back Button
**What:** Use `history.pushState()` when modal opens, listen to `popstate` event for back button
**When to use:** Enable browser back button to close modal without breaking SSE connection
**Example:**
```typescript
// Source: https://medium.com/@ndabosed/how-to-use-the-pushstate-and-popstate-in-reactjs-2951d9117f32
export function useModalHistory(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (isOpen) {
      // Push state when modal opens
      window.history.pushState({ modal: true }, '')
    }

    const handlePopState = (event: PopStateEvent) => {
      if (isOpen) {
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isOpen, onClose])
}
```

### Pattern 4: On-Demand Data Fetching with Loading State
**What:** Fetch GameDetails when modal opens, show skeleton while loading
**When to use:** Avoid fetching detailed stats for all games on home page (only fetch when user opens modal)
**Example:**
```typescript
export function useGameDetails(gameId: string, league: League, enabled: boolean) {
  const [data, setData] = useState<GameDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    setLoading(true)
    fetch(`/api/games/${league}/${gameId}/details`)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [gameId, league, enabled])

  return { data, loading, error }
}
```

### Pattern 5: Horizontal Scroll for Wide Tables (Mobile)
**What:** Wrap table in div with `overflow-x: auto` for horizontal scrolling on mobile
**When to use:** Player stats table with many columns (10+ columns)
**Example:**
```typescript
// Source: https://muhimasri.com/blogs/react-responsive-table/
export function PlayerStatsTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        {/* Table content with nowrap on cells */}
      </table>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Don't change URL for modal:** Breaks SSE connection; use state + history.pushState instead
- **Don't use tabs for content sections:** CONTEXT.md locked decision is single scroll container
- **Don't fetch GameDetails on home page load:** On-demand fetch when modal opens (reduces API calls)
- **Don't build custom focus trap:** Radix Dialog handles this automatically
- **Don't hide columns on mobile:** Use horizontal scroll pattern instead (CONTEXT.md decision)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible modal dialogs | Custom modal with focus trap, ESC handling, ARIA attributes | Radix UI Dialog | Focus trapping edge cases (nested portals, tab order, screen reader announcements), WAI-ARIA compliance requires deep expertise |
| Sortable table logic | Custom sorting functions for each column | TanStack Table | Edge cases: mixed alphanumeric values, undefined/null handling, case sensitivity, multi-column sort, performance optimization with memoization |
| Browser history for modal | Custom `window.history` management | useModalHistory hook pattern | Easy to create memory leaks with event listeners, hard to sync modal state with history state, complex cleanup logic |
| Date formatting | Custom date formatting functions | date-fns (already installed) | Timezone handling, locale support, DST transitions (already using for Phase 3 timezone work) |
| Percentage calculations | Manual percentage math with rounding | Helper functions with null checks | Division by zero, null/undefined handling, consistent rounding rules (1 decimal for FG%?) |

**Key insight:** Modal accessibility is deceptively complex. Radix Dialog handles focus restoration after close, screen reader announcements, portal event bubbling, nested modal scenarios, and keyboard navigation edge cases that take months to discover and fix in custom implementations.

## Common Pitfalls

### Pitfall 1: Portal Event Bubbling Breaks Outside-Click Detection
**What goes wrong:** When modal uses React portal, clicking outside doesn't trigger close because event listeners on parent don't detect clicks inside portal
**Why it happens:** Portals render outside React tree, so DOM event bubbling doesn't match React tree structure
**How to avoid:** Radix Dialog handles this automatically with `onPointerDownOutside` and `onInteractOutside` props that understand portals
**Warning signs:** Modal doesn't close when clicking backdrop, or closes unexpectedly when clicking inside modal content

### Pitfall 2: Focus Trap Doesn't Work with DNP Players (Many Rows)
**What goes wrong:** Player stats table with 20+ rows (including DNP) causes scrollable content inside modal, breaking focus trap when user tabs past last button
**Why it happens:** Focus trap libraries struggle with dynamically sized scrollable content inside modals
**How to avoid:** Radix Dialog's focus scope works with scrollable content; ensure table wrapper has proper `overflow-y: auto` and max-height
**Warning signs:** Focus escapes modal when tabbing through long player list, keyboard navigation broken

### Pitfall 3: SSE Connection Breaks When Modal Opens
**What goes wrong:** Opening modal re-mounts home page component, breaking SSE connection and losing live updates
**Why it happens:** Modal changes routing/state in way that triggers React remount
**How to avoid:** Keep modal state in page component (`src/app/page.tsx`), use controlled Radix Dialog, never change URL (use history.pushState for back button only, not routing)
**Warning signs:** Live scores stop updating when modal opens, "Last updated" timestamp freezes

### Pitfall 4: Sorting Breaks with Undefined Player Stats
**What goes wrong:** Sorting by rebounds fails when DNP players have undefined/null stats, causing table to break or show incorrect order
**Why it happens:** Default JS sort treats undefined inconsistently, DNP players should appear last but may appear first
**How to avoid:** TanStack Table's `sortUndefined: 'last'` column option handles this; alternatively use custom accessor that converts undefined to -1 for numeric sorts
**Warning signs:** DNP players appear at top when sorting by any stat, clicking sort header multiple times gives inconsistent results

### Pitfall 5: Made/Attempted Format Hard to Sort Numerically
**What goes wrong:** Player FG column shows "8-15" (made-attempted) as string, sorting alphabetically instead of by percentage or made field goals
**Why it happens:** Displaying combined string in cell but trying to sort by numeric value requires separate accessor and display logic
**How to avoid:** TanStack Table accessorFn returns numeric value for sorting, cell formatter displays "made-attempted" string
```typescript
{
  header: 'FG',
  accessorFn: row => row.fieldGoals.made, // Sort by made
  cell: info => `${info.row.original.fieldGoals.made}-${info.row.original.fieldGoals.attempted}`
}
```
**Warning signs:** Clicking FG column header sorts "2-5" before "10-15", sorting appears random

### Pitfall 6: Modal Animation Causes Layout Shift on Close
**What goes wrong:** Modal closing animation (fade + scale) causes home page scores to "jump" because modal unmounts before animation completes
**Why it happens:** React removes modal content immediately, animation doesn't finish
**How to avoid:** Radix Dialog's `forceMount` prop keeps content mounted during exit animation; control visibility with CSS/data-state attribute
**Warning signs:** Home page "flashes" when modal closes, scores jump position, smooth experience broken

### Pitfall 7: Historical Data "Unavailable" Shows Empty Section
**What goes wrong:** When historical data missing, section shows blank space instead of helpful message, confusing users
**Why it happens:** Conditional rendering hides entire section when data is null/undefined
**How to avoid:** Always render HistoricalMatchup component, show "Historical data unavailable" message when data.lastFiveMeetings is empty
**Warning signs:** Inconsistent modal height between games with/without historical data, users ask "where's the history?"

## Code Examples

Verified patterns from official sources and project conventions:

### Modal Integration with GameCard Click Handler
```typescript
// Source: Project pattern from src/components/game-card.tsx
// Modified to add onClick for modal trigger
interface GameCardProps {
  game: Game
  onClick?: () => void  // NEW: Make card clickable
}

export function GameCard({ game, onClick }: GameCardProps) {
  const canShowDetails = game.state === GameState.LIVE || game.state === GameState.FINAL

  return (
    <div
      className={`relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${
        canShowDetails ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={canShowDetails ? onClick : undefined}
      role={canShowDetails ? 'button' : undefined}
      tabIndex={canShowDetails ? 0 : undefined}
    >
      {/* Existing GameCard content */}
    </div>
  )
}
```

### Team Stats Comparison Table
```typescript
// Custom component (not TanStack Table - simpler for fixed comparison layout)
interface TeamStatsTableProps {
  homeStats: TeamStats
  awayStats: TeamStats
  homeTeam: Team
  awayTeam: Team
}

export function TeamStatsTable({ homeStats, awayStats, homeTeam, awayTeam }: TeamStatsTableProps) {
  const stats = [
    {
      label: 'FG%',
      home: `${homeStats.fieldGoals.made}-${homeStats.fieldGoals.attempted}, ${homeStats.fieldGoals.percentage}%`,
      away: `${awayStats.fieldGoals.made}-${awayStats.fieldGoals.attempted}, ${awayStats.fieldGoals.percentage}%`,
      compareValue: (h: TeamStats, a: TeamStats) => h.fieldGoals.percentage - a.fieldGoals.percentage
    },
    // ... more stats
  ]

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">{homeTeam.name}</th>
          <th className="text-center">Stat</th>
          <th className="text-right">{awayTeam.name}</th>
        </tr>
      </thead>
      <tbody>
        {stats.map(stat => {
          const homeIsBetter = stat.compareValue(homeStats, awayStats) > 0
          return (
            <tr key={stat.label}>
              <td className={homeIsBetter ? 'font-bold' : ''}>{stat.home}</td>
              <td className="text-center text-gray-600">{stat.label}</td>
              <td className={!homeIsBetter ? 'font-bold' : ''}>{stat.away}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
```

### TanStack Table Column Definitions for Player Stats
```typescript
// Source: https://tanstack.com/table/v8/docs/guide/sorting
import { ColumnDef } from '@tanstack/react-table'

const playerColumns: ColumnDef<PlayerStats>[] = [
  {
    header: 'Player',
    accessorFn: row => row.lastName,
    cell: info => `#${info.row.original.jerseyNumber} ${info.row.original.lastName}`,
    enableSorting: false, // Keep players in team order by default
  },
  {
    header: 'MIN',
    accessorKey: 'minutes',
    sortingFn: 'alphanumeric', // Handles "32:15" format
  },
  {
    id: 'points',
    header: 'PTS',
    accessorKey: 'points',
    sortDescFirst: true, // Default to descending (highest first)
    sortUndefined: 'last', // DNP players with 0 points go last
  },
  {
    header: 'FG',
    accessorFn: row => row.fieldGoals.made,
    cell: info => `${info.row.original.fieldGoals.made}-${info.row.original.fieldGoals.attempted}`,
    sortDescFirst: true,
  },
  // ... more columns
]
```

### Loading Skeleton for Modal Content
```typescript
// Reuse pattern from src/components/game-card-skeleton.tsx
export function GameDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score header skeleton */}
      <div className="h-20 bg-gray-200 rounded animate-pulse" />

      {/* Team stats table skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Player stats table skeleton */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Modal library | Radix UI Primitives | 2023-2024 | Radix provides unstyled primitives (bring your own styles) vs styled components; better for design systems |
| React Table v7 | TanStack Table v8 | 2022 | v8 is framework-agnostic, better TypeScript support, improved performance, removed internal state management |
| Individual @radix-ui/react-* packages | Unified radix-ui package | Feb 2026 | Cleaner dependency management, single package replaces multiple, tree-shakeable |
| Custom sorting logic | TanStack Table built-in sortingFn | 2022 (v8 release) | 6 built-in sort functions handle edge cases, custom logic prone to bugs |
| Modal routing (URL changes) | Modal state + history.pushState | Ongoing best practice | Keeps background state alive (SSE connection), back button support without routing |

**Deprecated/outdated:**
- **React Modal library:** Still works but lacks modern primitives approach; Radix/Headless UI are 2026 standard
- **Moment.js:** Deprecated in favor of date-fns or Luxon; project already uses date-fns 4.1.0
- **Inline sorting state in component:** TanStack Table encourages controlled state pattern for better testing and state management

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + React Testing Library 16.3.2 |
| Config file | jest.config.js (Next.js integration via next/jest) |
| Quick run command | `npm test -- --testPathPattern="game-detail-modal"` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-05 | User can access player statistics by expanding game details | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ Wave 0 |
| STAT-01 | User can view basic team statistics during live games | unit | `npm test -- tests/components/team-stats-table.test.tsx -x` | ❌ Wave 0 |
| STAT-02 | User can view turnovers for each team | unit | `npm test -- tests/components/team-stats-table.test.tsx -x` | ❌ Wave 0 |
| STAT-03 | User can view individual player statistics during live games | unit | `npm test -- tests/components/player-stats-table.test.tsx -x` | ❌ Wave 0 |
| STAT-04 | User can see player points, rebounds, and assists | unit | `npm test -- tests/components/player-stats-table.test.tsx -x` | ❌ Wave 0 |
| HIST-03 | User can view historical head-to-head matchup data between teams | unit | `npm test -- tests/components/historical-matchup.test.tsx -x` | ❌ Wave 0 |
| HIST-04 | User can see last 5 meetings between two teams with outcomes | unit | `npm test -- tests/components/historical-matchup.test.tsx -x` | ❌ Wave 0 |
| NAV-04 | User navigates from home page game card to detailed game view | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="<component-under-test>" -x` (single component, fail-fast)
- **Per wave merge:** `npm test` (full suite, all 141+ tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/components/game-detail-modal.test.tsx` — covers modal open/close, dismissal methods (X, ESC, outside click, back button), SSE connection maintained, loading states
- [ ] `tests/components/team-stats-table.test.tsx` — covers all 10 stats displayed, side-by-side format, bold highlighting, shooting percentage calculations
- [ ] `tests/components/player-stats-table.test.tsx` — covers sorting by all columns (PTS, REB, AST), DNP players shown, made-attempted format, horizontal scroll wrapper
- [ ] `tests/components/historical-matchup.test.tsx` — covers last 5 meetings display, "unavailable" fallback message, date formatting
- [ ] `tests/integration/game-detail-modal.test.tsx` — covers full user flow (click game card → modal opens → view stats → close modal → SSE still active)
- [ ] `tests/hooks/use-game-details.test.tsx` — covers on-demand fetch, loading state, error handling
- [ ] `tests/hooks/use-modal-history.test.tsx` — covers pushState on open, popstate listener, cleanup on unmount

## Sources

### Primary (HIGH confidence)
- [Radix UI Dialog - Official Docs](https://www.radix-ui.com/primitives/docs/components/dialog) - Complete API reference, keyboard interactions, accessibility features
- [TanStack Table v8 Sorting Guide](https://tanstack.com/table/v8/docs/guide/sorting) - Sorting implementation, state management, built-in sorting functions
- [TanStack Table v8 Sorting API](https://tanstack.com/table/v8/docs/api/features/sorting) - API reference for sorting features
- [TanStack Table React Examples](https://tanstack.com/table/v8/docs/framework/react/examples/sorting) - Live sorting examples
- [MDN History.pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) - Browser history API reference
- [MDN popstate event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) - Event triggered by history navigation
- Project codebase: `src/components/game-card.tsx`, `src/types/sports-data.ts`, `tests/setup.ts` - Existing patterns and conventions

### Secondary (MEDIUM confidence)
- [shadcn/ui Unified Radix Package Changelog](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - Feb 2026 unified radix-ui package announcement
- [Testing Library Modal Examples](https://testing-library.com/docs/example-react-modal/) - Official React Testing Library modal testing patterns
- [React Table Horizontal Scroll Guide](https://muhimasri.com/blogs/react-responsive-table/) - Responsive table patterns with overflow-x
- [Using pushState and popState in React](https://medium.com/@ndabosed/how-to-use-the-pushstate-and-popstate-in-reactjs-2951d9117f32) - React integration pattern for browser history
- [LogRocket Accessible Modal Focus Trap](https://blog.logrocket.com/build-accessible-modal-focus-trap-react/) - Focus trap implementation patterns

### Tertiary (LOW confidence - flagged for validation)
- [Basketball box score UI best practices](https://chromewebstore.google.com/detail/obmjelnefbpppnlclofadlniafdnhjpc) - Chrome extension showing enhanced ESPN box score layout (side-by-side teams)
- General web search results on React modal pitfalls and common mistakes - provided patterns and anti-patterns but should be validated during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Radix UI and TanStack Table are verified industry standards from official docs, actively maintained, well-documented
- Architecture: HIGH - Patterns verified from official Radix/TanStack docs and existing project conventions (GameCard, test patterns)
- Pitfalls: MEDIUM - Based on documented GitHub issues and community articles; should be validated during implementation but represent real-world experience
- Browser history integration: MEDIUM - MDN docs are authoritative but React integration pattern is community-sourced; needs testing to confirm SSE connection remains stable

**Research date:** 2026-03-12
**Valid until:** 30 days (stable ecosystem, well-established libraries)

**Open questions for implementation:**
- Exact animation timing for modal fade/scale (Radix provides primitives, need to define duration)
- Skeleton loader design details (reuse Phase 2 pattern but adapt for modal content layout)
- Mock data structure for GameDetails (define realistic player roster size, stat ranges)
- TanStack Table styling approach (Tailwind classes directly or separate table stylesheet?)
