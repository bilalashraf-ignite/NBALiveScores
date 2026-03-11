# Phase 3: Multi-League & Schedule - Research

**Researched:** 2026-03-11
**Domain:** Multi-source data aggregation, adapter pattern architecture, JavaScript Intl timezone handling, React filtering patterns
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 extends Phase 2's NBA-only foundation to support three leagues (NBA, NCAA, EuroLeague) with scheduled games and timezone-aware display. The technical challenge centers on parallel data fetching from multiple APIs, maintaining adapter abstraction, and handling timezone conversion without external libraries.

**Key insight:** The adapter pattern established in Phase 1-2 scales naturally to multi-league support through inheritance. A BaseAdapter class can consolidate shared logic (caching, error handling, rate limiting), while league-specific adapters (NBAAdapter, NCAAAdapter, EuroLeagueAdapter) handle API mapping. JavaScript's Intl.DateTimeFormat API handles timezone detection, DST transitions, and 12h/24h formatting natively — no external library needed.

**API landscape:** Free NCAA data is available via henrygd's ncaa-api (5 req/sec limit) and ESPN's unofficial API (unlimited but unstable). EuroLeague has an official API at api-live.euroleague.net with swagger docs. All three require adapter implementations that map to our normalized Game domain model.

**Primary recommendation:** Use Promise.allSettled() for parallel league fetches (allows partial success), implement BaseAdapter with composition over inheritance for shared logic, leverage Intl API for all timezone operations, and use React useState with array.filter() for league filtering UI.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**League Data Sources:**
- Supported leagues: NBA, NCAA, EuroLeague from the start (all three simultaneously)
- Adapter architecture: One adapter per league (NBAAdapter, NCAAAdapter, EuroLeagueAdapter)
  - Each implements the existing SportsDataAdapter interface
  - Shared BaseAdapter class for common logic (cache, error handling, rate limiting)
  - getAdapter(league: League) function returns appropriate adapter instance
- API selection: Research free APIs for NCAA and EuroLeague during planning phase
  - balldontlie.io provides NBA data (already integrated)
  - NCAA and EuroLeague need free API sources to be identified
  - Evaluate: rate limits, data quality, reliability, update frequency
- Game type extension: Add `league: League` enum field to Game interface
  - `League = 'NBA' | 'NCAA' | 'EuroLeague'` type-safe enum
  - Explicit league identification in data model
- Fetch strategy: Parallel fetches for all leagues simultaneously
  - Don't wait for slow APIs — show games as they load
  - Three concurrent API calls on page load
- Cache strategy: Same TTL for all leagues
  - Live games: 10 seconds
  - Scheduled games: 2 minutes
  - Final games: 15 minutes
  - Consistent behavior across leagues, simpler implementation
- Error handling: Show cached data with per-league warning banners
  - "NCAA scores may be outdated" banner when NCAA API fails
  - Other leagues continue working normally
  - Matches Phase 2 stale data banner pattern

**League Filtering UI:**
- Filter component: Pills/chips above game list
  - Horizontal row: "All" | "NBA (5)" | "NCAA (12)" | "EuroLeague (3)"
  - Positioned directly above GameList component
  - Compact, mobile-friendly, reuses card-based visual language
- Game counts: Show real-time counts per league
  - Format: "NBA (5)" shows 5 NBA games currently available
  - Updates dynamically as game states change
  - Helps users know what's available before filtering
- Default state: "All leagues" selected on page load
  - Unified view showing all games mixed together
  - Matches Phase 2 "all live games on one page" philosophy
  - User can filter to specific league if desired
- Filtering behavior: Keep same sorting logic when filtered
  - Live/halftime games first, then scheduled games
  - Sorting doesn't change — just filters which games display
  - Consistent, predictable behavior

**Timezone Handling:**
- Detection: Auto-detect via browser Intl.DateTimeFormat API
  - `Intl.DateTimeFormat().resolvedOptions().timeZone` provides user timezone
  - Automatic, no user configuration needed
  - Works for 99% of users without manual setup
- Time format: Auto-detect 12h vs 24h from browser locale
  - US users see "7:30 PM" (12-hour)
  - European users see "19:30" (24-hour)
  - Respects user's system preferences via Intl.DateTimeFormat
- DST transitions: Automatic via JavaScript Date APIs
  - Browser Date object and Intl.DateTimeFormat handle DST automatically
  - No special logic or warnings needed
  - Just works across timezone changes
- Display format: No timezone abbreviation shown
  - Times already converted to user's timezone
  - Just show "7:30 PM" without "PST" suffix
  - Cleaner UI, less clutter

### Claude's Discretion
- Exact pill/chip styling (borders, colors, active state)
- Loading state for filter counts during initial fetch
- Transition animations when filtering games
- Error messages when no games match filter
- Empty state handling for leagues with no games
- BaseAdapter implementation details (exact shared methods)
- Specific free API choices for NCAA and EuroLeague (after research)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAGUE-02 | User can view games from NCAA league | NCAA API sources identified (henrygd/ncaa-api, ESPN unofficial), adapter pattern enables implementation |
| LEAGUE-03 | User can view games from EuroLeague | EuroLeague official API available (api-live.euroleague.net), swagger docs provide endpoint structure |
| LEAGUE-04 | User can filter or navigate games by specific league | React useState + array.filter() pattern, pill/chip component libraries (MUI, shadcn/ui) |
| SCHED-01 | User can view upcoming game fixtures | SportsDataAdapter.getScheduledGames() already defined, adapter implementations needed |
| SCHED-02 | User sees game date and time in their local timezone | Intl.DateTimeFormat handles conversion, resolvedOptions().timeZone for detection |
| SCHED-03 | User sees scheduled matchups before games start | GameState.SCHEDULED filtering, adapter mapping for scheduled games |
| SCHED-04 | User sees timezone-aware game times that adjust for DST transitions | Intl.DateTimeFormat handles DST automatically via browser timezone database |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript type unions | 5.x | League enum type definition | Type-safe league identification, no runtime overhead |
| JavaScript Intl API | Native | Timezone detection and formatting | Browser built-in, handles DST automatically, no dependencies |
| Promise.allSettled() | Native | Parallel API fetching | Allows partial success, better than Promise.all() for multi-source |
| React useState | 19.2.3 | Filter state management | Simple, built-in, sufficient for single-dimension filtering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date formatting utilities | Already installed in Phase 2, lightweight for relative dates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Promise.allSettled() | Promise.all() | Promise.all() fails fast (all fail if one fails), allSettled allows partial results |
| Intl.DateTimeFormat | date-fns-tz library | date-fns-tz adds 10KB, Intl is native and handles DST better |
| React useState | useReducer | useReducer is overkill for single-dimension filtering, useState is simpler |
| Custom filter component | MUI Chip component | MUI adds 80KB+ bundle size, custom Tailwind component is lighter |
| Adapter inheritance | Adapter composition | Both valid — composition more flexible, inheritance more intuitive for this use case |

**Installation:**
```bash
# No new dependencies required
# date-fns already installed in Phase 2
# All timezone handling uses native Intl API
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── types/
│   └── sports-data.ts          # Add League enum, extend Game with league field
├── lib/
│   └── adapters/
│       ├── sports-api-adapter.ts    # Already exists — interface unchanged
│       ├── base-adapter.ts          # NEW: Shared cache/error/rate limit logic
│       ├── balldontlie-adapter.ts   # MODIFY: Extends BaseAdapter, add league field
│       ├── ncaa-adapter.ts          # NEW: NCAA data source adapter
│       ├── euroleague-adapter.ts    # NEW: EuroLeague data source adapter
│       └── index.ts                 # MODIFY: Export getAdapter(league) factory
├── components/
│   ├── league-filter.tsx       # NEW: Pills/chips for league selection
│   └── game-list.tsx           # MODIFY: Add selectedLeague prop for filtering
└── app/
    ├── page.tsx                # MODIFY: Add league filter above game list
    └── api/scores/live/route.ts  # MODIFY: Fetch from all adapters in parallel
```

### Pattern 1: League Enum and Type Extension
**What:** Type-safe league identification in domain model
**When to use:** Always — enables filtering, adapter selection, error messages

**Example:**
```typescript
// src/types/sports-data.ts
// Source: TypeScript handbook - String Literal Types

export type League = 'NBA' | 'NCAA' | 'EuroLeague'

export interface Game {
  id: string
  league: League  // NEW FIELD
  homeTeam: Team
  awayTeam: Team
  score: Score
  state: GameState
  scheduledTime: Date
  period?: number
  timeRemaining?: string
  possession?: 'home' | 'away'
  teamFouls?: TeamFouls
}
```

### Pattern 2: BaseAdapter with Shared Logic
**What:** Abstract base class for common adapter functionality
**When to use:** When multiple adapters share cache, error handling, rate limiting

**Example:**
```typescript
// src/lib/adapters/base-adapter.ts
// Source: TypeScript adapter pattern - refactoring.guru/design-patterns/adapter/typescript

import { Game } from '@/types/sports-data'
import { getCachedData, setCachedData } from '@/lib/cache'

export abstract class BaseAdapter {
  protected abstract league: string
  protected abstract baseUrl: string

  /**
   * Fetch data with caching layer.
   * Subclasses override fetchFromAPI() for API-specific logic.
   */
  protected async fetchWithCache<T>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try cache first
    const cached = await getCachedData<T>(cacheKey)
    if (cached) return cached

    // Fetch from API
    try {
      const data = await fetchFn()
      await setCachedData(cacheKey, data, ttl)
      return data
    } catch (error) {
      console.error(`[${this.league}] API fetch failed:`, error)
      throw error
    }
  }

  /**
   * Rate limiting helper (optional — implement if API has strict limits).
   */
  protected async rateLimit(): Promise<void> {
    // Implement token bucket or similar if needed
  }

  /**
   * Handle API errors with graceful fallback.
   */
  protected handleError(error: unknown, context: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`[${this.league}] ${context}: ${message}`)
  }
}
```

### Pattern 3: Adapter Factory Function
**What:** Factory pattern to return correct adapter based on league
**When to use:** Centralized adapter instantiation, dependency injection

**Example:**
```typescript
// src/lib/adapters/index.ts
// Source: Factory pattern - refactoring.guru/design-patterns/factory-method

import { League } from '@/types/sports-data'
import { SportsDataAdapter } from './sports-api-adapter'
import { BalldontlieAdapter } from './balldontlie-adapter'
import { NcaaAdapter } from './ncaa-adapter'
import { EuroLeagueAdapter } from './euroleague-adapter'

const adapters: Record<League, SportsDataAdapter> = {
  NBA: new BalldontlieAdapter(),
  NCAA: new NcaaAdapter(),
  EuroLeague: new EuroLeagueAdapter(),
}

export function getAdapter(league: League): SportsDataAdapter {
  const adapter = adapters[league]
  if (!adapter) {
    throw new Error(`No adapter configured for league: ${league}`)
  }
  return adapter
}

export { BalldontlieAdapter, NcaaAdapter, EuroLeagueAdapter }
```

### Pattern 4: Parallel Multi-League Fetch with Promise.allSettled()
**What:** Fetch from all leagues concurrently, handle partial failures gracefully
**When to use:** Multi-source data aggregation where one failure shouldn't block others

**Example:**
```typescript
// src/app/api/scores/live/route.ts
// Source: MDN - Promise.allSettled()

import { getAdapter } from '@/lib/adapters'
import type { League, Game } from '@/types/sports-data'

async function fetchAllLeagues(): Promise<{
  games: Game[]
  errors: Partial<Record<League, string>>
}> {
  const leagues: League[] = ['NBA', 'NCAA', 'EuroLeague']

  // Parallel fetches — don't wait for slow APIs
  const results = await Promise.allSettled(
    leagues.map(async (league) => {
      const adapter = getAdapter(league)
      return adapter.getLiveGames(league)
    })
  )

  const games: Game[] = []
  const errors: Partial<Record<League, string>> = {}

  results.forEach((result, index) => {
    const league = leagues[index]
    if (result.status === 'fulfilled') {
      games.push(...result.value)
    } else {
      errors[league] = result.reason.message
      console.error(`[${league}] Fetch failed:`, result.reason)
    }
  })

  return { games, errors }
}
```

### Pattern 5: Timezone Formatting with Intl.DateTimeFormat
**What:** Browser-native timezone conversion and formatting
**When to use:** Always — for displaying game times to users

**Example:**
```typescript
// src/components/game-time.tsx
// Source: MDN - Intl.DateTimeFormat

interface GameTimeProps {
  scheduledTime: Date
}

export function GameTime({ scheduledTime }: GameTimeProps) {
  // Auto-detect user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Format with auto-detected 12h/24h preference
  const formatter = new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimeZone,
    // hour12 omitted — browser uses locale default
  })

  return (
    <time dateTime={scheduledTime.toISOString()}>
      {formatter.format(scheduledTime)}
    </time>
  )
}

// Example outputs:
// - US user: "Mar 11, 7:30 PM"
// - EU user: "11 Mar, 19:30"
// DST handled automatically by browser timezone database
```

### Pattern 6: League Filter Pills with React State
**What:** Interactive filter UI with pill/chip buttons and game counts
**When to use:** Single-dimension filtering with visual feedback

**Example:**
```typescript
// src/components/league-filter.tsx
// Source: React docs - State management, Medium article on filter pills

import { League } from '@/types/sports-data'

interface LeagueFilterProps {
  games: Game[]
  selectedLeague: League | 'all'
  onSelectLeague: (league: League | 'all') => void
}

export function LeagueFilter({ games, selectedLeague, onSelectLeague }: LeagueFilterProps) {
  // Count games per league
  const counts = games.reduce((acc, game) => {
    acc[game.league] = (acc[game.league] || 0) + 1
    return acc
  }, {} as Record<League, number>)

  const filters: Array<{ id: League | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'NBA', label: 'NBA' },
    { id: 'NCAA', label: 'NCAA' },
    { id: 'EuroLeague', label: 'EuroLeague' },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => {
        const count = filter.id === 'all'
          ? games.length
          : counts[filter.id as League] || 0
        const isActive = selectedLeague === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onSelectLeague(filter.id)}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {filter.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
```

### Pattern 7: Filtered Game List
**What:** GameList component with optional league filter
**When to use:** Displaying games with optional filtering

**Example:**
```typescript
// src/components/game-list.tsx (modified)
// Source: React docs - Array filtering

import { Game, GameState, League } from '@/types/sports-data'

interface GameListProps {
  games: Game[]
  selectedLeague?: League | 'all'
  lastUpdated?: Date
}

export function GameList({ games, selectedLeague = 'all', lastUpdated }: GameListProps) {
  // Filter by selected league
  const filteredGames = selectedLeague === 'all'
    ? games
    : games.filter(game => game.league === selectedLeague)

  // Sort: live/halftime first (existing logic from Phase 2)
  const sortedGames = [...filteredGames].sort((a, b) => {
    const liveStates = [GameState.LIVE, GameState.HALFTIME]
    const aIsLive = liveStates.includes(a.state)
    const bIsLive = liveStates.includes(b.state)
    if (aIsLive && !bIsLive) return -1
    if (!aIsLive && bIsLive) return 1
    return 0
  })

  // Empty state
  if (sortedGames.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">
          {selectedLeague === 'all'
            ? 'No games available'
            : `No ${selectedLeague} games available`
          }
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedGames.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Promise.all() for multi-source:** Fails fast if one API fails — use Promise.allSettled() to allow partial success
- **Adapter without shared base:** Duplicating cache/error logic across 3 adapters — consolidate in BaseAdapter
- **Manual DST handling:** Never calculate DST transitions manually — Intl API handles this via browser timezone database
- **Timezone abbreviations (PST, EST):** Ambiguous and confusing — just show converted time without abbreviation
- **External timezone library:** Intl API is built-in and handles edge cases better than date-fns-tz or moment-timezone
- **Filter state in URL params:** Overkill for single-dimension filter — useState is simpler and sufficient
- **Inheritance for BaseAdapter:** Prefer composition (BaseAdapter as utility) over inheritance (extends BaseAdapter) if adapters have different needs

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timezone conversion | Custom UTC offset calculator | Intl.DateTimeFormat | DST transitions are complex (dates vary by year/location), Intl handles via IANA timezone database |
| 12h vs 24h detection | User preference setting | Intl auto-detection via locale | Browser knows user's system preference, no configuration needed |
| Parallel API fetching | Sequential fetch with manual error catching | Promise.allSettled() | Native, handles partial failures, returns results + errors in single call |
| League filtering | Complex useReducer with actions | useState + array.filter() | Single-dimension filter doesn't need reducer complexity |
| Adapter factory | Manual if/else ladder | Object lookup with Record<League, Adapter> | Type-safe, no runtime branching, easy to extend |

**Key insight:** Timezone handling is deceptively complex — DST rules change by region and year (some countries don't observe DST, others change dates unpredictably). Manual calculation requires maintaining IANA timezone database. Intl.DateTimeFormat delegates to browser's built-in database, which is updated with OS updates. This is why every major library (date-fns, moment, luxon) recommends Intl for timezone operations.

## Common Pitfalls

### Pitfall 1: Using Promise.all() for Multi-Source Fetching
**What goes wrong:** One slow or failing API blocks all results. If NCAA API times out, user sees no games from any league despite NBA and EuroLeague working fine.

**Why it happens:** Promise.all() rejects immediately when any promise rejects (fail-fast behavior). Developers choose it for simplicity without considering partial failure scenarios.

**How to avoid:** Use Promise.allSettled() which waits for all promises to complete (fulfilled or rejected) and returns results for each. This allows showing games from working APIs while displaying error banners for failing ones.

**Warning signs:**
- All leagues fail to load when only one API is down
- User sees "No games available" despite some APIs working
- Network tab shows one failed request blocks others

**Example:**
```typescript
// BAD: Promise.all() fails fast
const results = await Promise.all([
  getAdapter('NBA').getLiveGames('NBA'),
  getAdapter('NCAA').getLiveGames('NCAA'),  // Times out
  getAdapter('EuroLeague').getLiveGames('EuroLeague'),
])
// If NCAA times out, entire Promise.all() rejects — no games shown

// GOOD: Promise.allSettled() allows partial success
const results = await Promise.allSettled([
  getAdapter('NBA').getLiveGames('NBA'),
  getAdapter('NCAA').getLiveGames('NCAA'),  // Times out
  getAdapter('EuroLeague').getLiveGames('EuroLeague'),
])
// NBA and EuroLeague games shown, NCAA shows error banner
```

**Source:** [MDN Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled), [Master Promise.all: Parallel API Calls](https://kitemetric.com/blogs/harness-the-power-of-promise-all-for-parallel-api-calls)

### Pitfall 2: Hardcoding Timezone Offsets
**What goes wrong:** Scheduled game times display incorrectly after DST transitions. User in New York sees games at wrong times for 2 weeks in March/November when DST changes.

**Why it happens:** Developer calculates offset manually (e.g., "EST is UTC-5") without accounting for DST. During daylight saving time, offset changes to UTC-4, but hardcoded logic shows incorrect time.

**How to avoid:** Never calculate offsets manually. Always use Intl.DateTimeFormat with timeZone option. Browser's timezone database handles DST transitions automatically.

**Warning signs:**
- Game times off by 1 hour during DST transition weeks
- Issue only affects certain users (those in DST regions)
- Bug appears/disappears seasonally (March and November)

**Example:**
```typescript
// BAD: Hardcoded offset
const utcTime = new Date(game.scheduledTime)
const offset = -5 * 60 * 60 * 1000  // EST offset
const localTime = new Date(utcTime.getTime() + offset)
// Breaks during DST — offset should be -4 in summer

// GOOD: Intl handles DST automatically
const formatter = new Intl.DateTimeFormat('default', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York'  // Handles EST/EDT automatically
})
const localTime = formatter.format(game.scheduledTime)
```

**Source:** [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat), [CloudThat: Handling Timezones with Intl](https://www.cloudthat.com/resources/blog/handling-timezones-with-the-intl-class-in-javascript)

### Pitfall 3: Not Handling Per-League Errors
**What goes wrong:** Error boundary catches NCAA API failure and shows "Unable to load games" message for entire page, hiding working NBA and EuroLeague games.

**Why it happens:** Single try/catch or error boundary wraps all adapter calls. First error throws and prevents subsequent adapters from running.

**How to avoid:** Use Promise.allSettled() to isolate errors per league. Track errors in separate state. Show per-league warning banners ("NCAA scores unavailable") while displaying games from working leagues.

**Warning signs:**
- One API failure causes blank page
- No way to distinguish which league is failing
- Error message says "Unable to load games" without specifying league

**Example:**
```typescript
// BAD: Single try/catch
try {
  const nbaGames = await getAdapter('NBA').getLiveGames('NBA')
  const ncaaGames = await getAdapter('NCAA').getLiveGames('NCAA')  // Throws
  const euroGames = await getAdapter('EuroLeague').getLiveGames('EuroLeague')
  // Never reaches here if NCAA fails
} catch (error) {
  return <ErrorMessage>Unable to load games</ErrorMessage>
}

// GOOD: Per-league error tracking
const results = await Promise.allSettled([...])
const games: Game[] = []
const errors: Record<League, string> = {}

results.forEach((result, index) => {
  const league = leagues[index]
  if (result.status === 'fulfilled') {
    games.push(...result.value)
  } else {
    errors[league] = result.reason.message
  }
})

return (
  <>
    {Object.entries(errors).map(([league, error]) => (
      <Banner key={league}>
        {league} scores unavailable: {error}
      </Banner>
    ))}
    <GameList games={games} />
  </>
)
```

**Source:** [GeeksforGeeks: Handling Errors in Promise.all](https://www.geeksforgeeks.org/javascript/how-to-handle-errors-in-promise-all/), [DEV: Managing Multiple Promises with Promise.all](https://dev.to/vaatiesther/how-to-manage-multiple-promises-concurrently-with-promiseall-1i8)

### Pitfall 4: Filter State Causes Full Game List Re-Render
**What goes wrong:** Clicking league filter causes all game cards to unmount and remount, losing scroll position, SSE connections, and causing janky animation.

**Why it happens:** Recreating filtered array without memoization, or using game.id without league prefix causes key collisions (game "123" from NBA and NCAA both have key "123").

**How to avoid:** Use stable keys (`${game.league}-${game.id}`), memoize filtered array with useMemo, keep GameCard components lightweight to minimize re-render cost.

**Warning signs:**
- Scroll jumps to top when changing filter
- SSE connections briefly disconnect on filter change
- DevTools Profiler shows all cards re-rendering

**Example:**
```typescript
// BAD: Keys without league prefix
<GameCard key={game.id} game={game} />
// NBA game "123" and NCAA game "123" collide

// GOOD: Stable keys with league prefix
<GameCard key={`${game.league}-${game.id}`} game={game} />

// GOOD: Memoize filtered array
const filteredGames = useMemo(() => {
  return selectedLeague === 'all'
    ? games
    : games.filter(g => g.league === selectedLeague)
}, [games, selectedLeague])
```

**Source:** [React Docs: Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state), [CodingDeft: React Filter Array](https://www.codingdeft.com/posts/react-filter/)

### Pitfall 5: Adapter Duplicates Caching Logic
**What goes wrong:** Each adapter (NBAAdapter, NCAAAdapter, EuroLeagueAdapter) reimplements identical cache check/set logic. Bug fixes or TTL changes require updating 3 files.

**Why it happens:** Implementing adapters independently without identifying shared patterns. "DRY" principle ignored in favor of quick implementation.

**How to avoid:** Extract shared logic into BaseAdapter class or utility module. Adapters call `this.fetchWithCache()` instead of reimplementing cache layer.

**Warning signs:**
- Copy-pasted cache logic in multiple adapter files
- Cache behavior inconsistent across adapters
- Bug fix requires identical changes to 3 files

**Example:**
```typescript
// BAD: Duplicated in each adapter
class NBAAdapter {
  async getLiveGames() {
    const cached = await redis.get('nba:live')
    if (cached) return JSON.parse(cached)
    const data = await this.fetchFromAPI()
    await redis.set('nba:live', JSON.stringify(data), 'EX', 10)
    return data
  }
}
// NCAAAdapter has identical code (duplication)

// GOOD: Shared in BaseAdapter
class BaseAdapter {
  protected async fetchWithCache<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)
    const data = await fetchFn()
    await redis.set(key, JSON.stringify(data), 'EX', ttl)
    return data
  }
}

class NBAAdapter extends BaseAdapter {
  async getLiveGames() {
    return this.fetchWithCache('nba:live', 10, () => this.fetchFromAPI())
  }
}
```

**Source:** [Refactoring Guru: Adapter Pattern](https://refactoring.guru/design-patterns/adapter/typescript), [Medium: TypeScript Adapter Pattern](https://medium.com/@ibrahimsengun/typescript-adapter-design-pattern-0baa9ed9b0fb)

### Pitfall 6: Not Respecting 12h vs 24h User Preference
**What goes wrong:** All users see times in 12-hour format ("7:30 PM") regardless of locale. European users expect 24-hour format ("19:30") per their system settings.

**Why it happens:** Hardcoding `hour12: true` in Intl.DateTimeFormat options, assuming all users prefer 12-hour format.

**How to avoid:** Omit `hour12` option entirely — Intl.DateTimeFormat auto-detects from user's locale/system settings.

**Warning signs:**
- European users report times in "wrong format"
- All times show AM/PM regardless of user's location
- Issue only reported by non-US users

**Example:**
```typescript
// BAD: Forces 12-hour format
const formatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true  // Ignores user preference
})

// GOOD: Auto-detects from locale
const formatter = new Intl.DateTimeFormat('default', {
  hour: 'numeric',
  minute: '2-digit',
  // hour12 omitted — uses locale default
})
// US locale → "7:30 PM"
// EU locale → "19:30"
```

**Source:** [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat), [Hoverify: Intl.DateTimeFormat for Localization](https://tryhoverify.com/blog/intldatetimeformat-for-localization/)

### Pitfall 7: League Filter Without Loading State
**What goes wrong:** Filter pills show "NBA (0) NCAA (0) EuroLeague (0)" during initial fetch, making it appear no games are available. User might leave before games load.

**Why it happens:** Rendering filter with empty games array before first API response arrives. No loading indicator to signal data is fetching.

**How to avoid:** Show loading skeleton for filter pills, or display pills without counts until data loads. Alternatively, disable filter during initial fetch.

**Warning signs:**
- Users report "no games showing" despite games loading seconds later
- Confusion about whether games are available
- High bounce rate during initial page load

**Example:**
```typescript
// BAD: Shows (0) counts during loading
{isLoading && <LeagueFilter games={[]} />}
// Renders "NBA (0) NCAA (0) EuroLeague (0)"

// GOOD: Loading state for filter
{isLoading ? (
  <div className="flex gap-2 mb-6">
    {['All', 'NBA', 'NCAA', 'EuroLeague'].map(label => (
      <div key={label} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
    ))}
  </div>
) : (
  <LeagueFilter games={games} selectedLeague={selectedLeague} />
)}

// ALTERNATIVE: Show pills without counts during loading
<button>
  NBA {isLoading ? '...' : `(${count})`}
</button>
```

**Source:** [React Docs: Conditional Rendering](https://react.dev/learn/conditional-rendering), [Medium: React Filter Using Hooks](https://medium.com/@marklasagne/using-react-hooks-to-create-a-pill-chip-filter-7f83c3b52139)

## Code Examples

Verified patterns from official sources:

### League Type and Game Extension
```typescript
// src/types/sports-data.ts
// Source: TypeScript handbook - Literal Types

export type League = 'NBA' | 'NCAA' | 'EuroLeague'

export interface Game {
  id: string
  league: League  // NEW: League identification
  homeTeam: Team
  awayTeam: Team
  score: Score
  state: GameState
  scheduledTime: Date  // Always UTC, convert for display
  period?: number
  timeRemaining?: string
  possession?: 'home' | 'away'
  teamFouls?: TeamFouls
}
```

### Parallel League Fetching with Error Handling
```typescript
// src/app/api/scores/live/route.ts
// Source: MDN Promise.allSettled()

import { getAdapter } from '@/lib/adapters'
import type { League, Game } from '@/types/sports-data'

async function fetchAllLeagues() {
  const leagues: League[] = ['NBA', 'NCAA', 'EuroLeague']

  const results = await Promise.allSettled(
    leagues.map(async (league) => {
      const adapter = getAdapter(league)
      return adapter.getLiveGames(league)
    })
  )

  const games: Game[] = []
  const errors: Partial<Record<League, string>> = {}

  results.forEach((result, index) => {
    const league = leagues[index]
    if (result.status === 'fulfilled') {
      games.push(...result.value)
    } else {
      errors[league] = result.reason.message
    }
  })

  return { games, errors }
}
```

### Timezone Formatting Component
```typescript
// src/components/game-time.tsx
// Source: MDN Intl.DateTimeFormat

interface GameTimeProps {
  scheduledTime: Date  // UTC timestamp
}

export function GameTime({ scheduledTime }: GameTimeProps) {
  // Auto-detect user timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Format with locale-aware 12h/24h preference
  const formatter = new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: userTimeZone,
    // hour12 omitted — browser auto-detects from locale
  })

  return (
    <time dateTime={scheduledTime.toISOString()}>
      {formatter.format(scheduledTime)}
    </time>
  )
}
```

### League Filter Component
```typescript
// src/components/league-filter.tsx
// Source: React docs, Medium filter pill pattern

import { League, Game } from '@/types/sports-data'

interface LeagueFilterProps {
  games: Game[]
  selectedLeague: League | 'all'
  onSelectLeague: (league: League | 'all') => void
}

export function LeagueFilter({ games, selectedLeague, onSelectLeague }: LeagueFilterProps) {
  const counts = games.reduce((acc, game) => {
    acc[game.league] = (acc[game.league] || 0) + 1
    return acc
  }, {} as Record<League, number>)

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'NBA' as const, label: 'NBA' },
    { id: 'NCAA' as const, label: 'NCAA' },
    { id: 'EuroLeague' as const, label: 'EuroLeague' },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6" role="tablist">
      {filters.map((filter) => {
        const count = filter.id === 'all'
          ? games.length
          : counts[filter.id as League] || 0
        const isActive = selectedLeague === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onSelectLeague(filter.id)}
            role="tab"
            aria-selected={isActive}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {filter.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
```

### Adapter Factory Function
```typescript
// src/lib/adapters/index.ts
// Source: Factory pattern best practices

import { League } from '@/types/sports-data'
import { SportsDataAdapter } from './sports-api-adapter'
import { BalldontlieAdapter } from './balldontlie-adapter'
import { NcaaAdapter } from './ncaa-adapter'
import { EuroLeagueAdapter } from './euroleague-adapter'

const adapters: Record<League, SportsDataAdapter> = {
  NBA: new BalldontlieAdapter(),
  NCAA: new NcaaAdapter(),
  EuroLeague: new EuroLeagueAdapter(),
}

export function getAdapter(league: League): SportsDataAdapter {
  const adapter = adapters[league]
  if (!adapter) {
    throw new Error(`No adapter configured for league: ${league}`)
  }
  return adapter
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment-timezone | Intl.DateTimeFormat | 2020+ | 40KB → 0KB (native), better DST handling via browser database |
| Manual Promise.all() error handling | Promise.allSettled() | ES2020 (2020) | Native partial failure handling, cleaner code |
| Adapter without base class | BaseAdapter with shared logic | Always recommended | DRY principle, single source of truth for cache/error logic |
| if/else adapter selection | Factory pattern with Record lookup | Design patterns standard | Type-safe, O(1) lookup, easier to extend |
| date-fns-tz for timezone | Intl API | 2020+ | 10KB library → native API, better DST accuracy |
| Sequential API fetching | Parallel with Promise.allSettled() | Always recommended | Faster page load, better UX with partial failures |

**Deprecated/outdated:**
- **moment-timezone**: Deprecated, use Intl.DateTimeFormat or date-fns
- **Manual timezone offset calculations**: Error-prone, use Intl API
- **Promise.all() for multi-source**: Fail-fast behavior bad for partial results, use allSettled()
- **Global filter state in URL**: Overkill for simple filtering, useState sufficient

## Open Questions

1. **NCAA API rate limit handling**
   - What we know: henrygd/ncaa-api limits to 5 req/sec, ESPN unofficial has no documented limit
   - What's unclear: Should we implement rate limiting in adapter, or rely on cache layer?
   - Recommendation: Start without rate limiting (cache layer should prevent hitting limits), add token bucket pattern if needed during implementation

2. **EuroLeague API authentication requirements**
   - What we know: api-live.euroleague.net has swagger docs, shows Authorization header in interface
   - What's unclear: Is API key required for public data? How to obtain key?
   - Recommendation: Test API during Wave 0; if auth required, register for API key or use unofficial wrapper (euroleaguer R package reverse-engineered endpoints)

3. **Should scheduled games show different UI from live games?**
   - What we know: GameState.SCHEDULED exists, requirements say "scheduled matchups before games start"
   - What's unclear: Same card layout, or different design for future games?
   - Recommendation: Same card layout, different badge color (blue vs red) — consistent with CONTEXT.md locked decisions

4. **How to handle leagues with no games?**
   - What we know: Empty state needed per CONTEXT.md Claude's discretion
   - What's unclear: Show empty state for specific league, or hide league from filter?
   - Recommendation: Show league in filter with "(0)" count, display empty state message when selected

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + React Testing Library 16.3.2 |
| Config file | jest.config.js (already exists from Phase 2) |
| Quick run command | `npm test -- --testPathPattern="league-filter\|game-time" -x` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAGUE-02 | NCAA games displayed | integration | `npm test -- tests/lib/adapters/ncaa-adapter.test.ts -x` | ❌ Wave 0 |
| LEAGUE-03 | EuroLeague games displayed | integration | `npm test -- tests/lib/adapters/euroleague-adapter.test.ts -x` | ❌ Wave 0 |
| LEAGUE-04 | League filter UI functional | unit | `npm test -- tests/components/league-filter.test.tsx -x` | ❌ Wave 0 |
| SCHED-01 | Scheduled games displayed | integration | `npm test -- tests/components/game-list.test.tsx::scheduled -x` | Extend existing |
| SCHED-02 | Times shown in user timezone | unit | `npm test -- tests/components/game-time.test.tsx -x` | ❌ Wave 0 |
| SCHED-03 | Scheduled matchups before start | unit | `npm test -- tests/components/game-card.test.tsx::scheduled -x` | Extend existing |
| SCHED-04 | DST transitions handled | unit | `npm test -- tests/lib/timezone.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="{changed_component}" -x` (< 10s)
- **Per wave merge:** `npm test -- --onlyChanged --coverage` (< 30s)
- **Phase gate:** `npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'` (before /gsd:verify-work)

### Wave 0 Gaps
- [ ] `tests/lib/adapters/ncaa-adapter.test.ts` — Unit tests for NCAA adapter mapping, error handling
- [ ] `tests/lib/adapters/euroleague-adapter.test.ts` — Unit tests for EuroLeague adapter mapping
- [ ] `tests/lib/adapters/base-adapter.test.ts` — Unit tests for shared cache/error logic
- [ ] `tests/lib/adapters/index.test.ts` — Unit tests for getAdapter() factory function
- [ ] `tests/components/league-filter.test.tsx` — Unit tests for filter pills, click handling, counts
- [ ] `tests/components/game-time.test.tsx` — Unit tests for timezone formatting, 12h/24h detection
- [ ] `tests/lib/timezone.test.ts` — Unit tests for DST edge cases (spring forward, fall back)
- [ ] `tests/integration/multi-league.test.tsx` — Integration test for parallel fetching, partial failures
- [ ] Extend `tests/components/game-list.test.tsx` — Add tests for league filtering behavior
- [ ] Extend `tests/components/game-card.test.tsx` — Add tests for scheduled game display

## Sources

### Primary (HIGH confidence)
- [MDN Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) - Timezone handling, DST, locale formatting
- [MDN Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) - Parallel fetching with partial failures
- [TypeScript Handbook: Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) - League enum pattern
- [React Docs: Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) - Filtering patterns

### Secondary (MEDIUM confidence)
- [henrygd/ncaa-api GitHub](https://github.com/henrygd/ncaa-api) - Free NCAA API, 5 req/sec limit, scoreboard/stats/schedule endpoints
- [ESPN Hidden API Gist](https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b) - Unofficial ESPN API endpoints for NBA/NCAA
- [EuroLeague API Swagger](https://api-live.euroleague.net/swagger/index.html) - Official EuroLeague API documentation
- [Refactoring Guru: Adapter Pattern](https://refactoring.guru/design-patterns/adapter/typescript) - TypeScript adapter implementation
- [Refactoring Guru: Factory Pattern](https://refactoring.guru/design-patterns/factory-method) - Factory pattern for adapter selection
- [CloudThat: Timezone Handling with Intl](https://www.cloudthat.com/resources/blog/handling-timezones-with-the-intl-class-in-javascript) - Intl API best practices
- [Kite Metric: Promise.all Parallel API Calls](https://kitemetric.com/blogs/harness-the-power-of-promise-all-for-parallel-api-calls) - Parallel fetching patterns
- [Medium: React Filter Pills Pattern](https://medium.com/@marklasagne/using-react-hooks-to-create-a-pill-chip-filter-7f83c3b52139) - Filter component implementation

### Tertiary (LOW confidence - needs verification)
- [API-Basketball pricing](https://www.api-basketball.com/pricing) - Claims 100 req/day free tier, but timeout during fetch
- [euroleaguer R package](https://flavioleccese92.github.io/euroleaguer/) - Unofficial EuroLeague API wrapper, unclear JS equivalent
- Multiple WebSearch results on filter patterns - common patterns but not authoritative sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native APIs (Intl, Promise.allSettled) with official MDN documentation
- NCAA API: MEDIUM - henrygd/ncaa-api actively maintained (Jan 2026 release), but not official NCAA source
- EuroLeague API: MEDIUM - Official API exists but authentication requirements unclear without testing
- Architecture patterns: HIGH - Adapter/Factory patterns well-documented, TypeScript handbook confirms type patterns
- Timezone handling: HIGH - Intl API official standard, handles DST via browser database
- React filtering: HIGH - Official React docs confirm useState + filter pattern

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (30 days - relatively stable patterns, Intl API is standard, but free API availability may change)
