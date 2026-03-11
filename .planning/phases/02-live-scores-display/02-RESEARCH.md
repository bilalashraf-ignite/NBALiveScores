# Phase 2: Live Scores Display - Research

**Researched:** 2026-03-11
**Domain:** Real-time web applications with Server-Sent Events, React state management, and responsive UI
**Confidence:** HIGH

## Summary

Phase 2 requires implementing a live scores display with automatic updates via Server-Sent Events (SSE), card-based UI with Tailwind CSS, and robust error handling. The technical stack is well-established: Next.js 16 App Router provides native streaming support via ReadableStream API, React 19 offers modern state management patterns, and Tailwind CSS 4 delivers performance-optimized animations and responsive utilities.

**Key insight:** SSE is the correct choice over WebSockets for unidirectional score updates. Next.js streaming requires specific route config (`runtime: 'nodejs'`, `dynamic: 'force-dynamic'`) to prevent buffering. EventSource on the client automatically handles reconnection, but proper cleanup in useEffect is critical to prevent memory leaks.

**Primary recommendation:** Use Next.js App Router streaming with ReadableStream for SSE endpoint, implement custom React hook (useSSE) for connection management, leverage Tailwind's animate-pulse for live badges, and wrap risky components in error boundaries for graceful degradation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Game Card Layout:**
- Card-based layout with shadows/borders (not list or grid)
- Each card displays: team names/logos, current score, game status badge, quarter/period, time remaining, possession indicator, team season records (W-L), team fouls count
- Ordering: Live games first, then scheduled games (not chronological)
- Spacing: Comfortable whitespace for mobile usability, 4-5 games visible on desktop without scroll

**Real-time Updates:**
- Update mechanism: Server-sent events (SSE) for pushing updates to browser
- Polling interval: 10-15 seconds for fetching fresh scores from API
- Visual feedback: Subtle pulse animation on cards when data refreshes, "Last updated" timestamp displayed on page
- Failure handling: Show cached data from Redis with warning banner when API fails

**Game Status Display:**
- Badge style: Color-coded with icons
  - LIVE/HALFTIME: Red badge with pulse animation (grouped together)
  - FINAL: Gray badge, no animation
  - SCHEDULED: Blue badge, no animation
  - POSTPONED/CANCELLED: Yellow warning badge (grouped together)
- Badge position: Top-right corner of each game card
- Animation: Subtle pulse on live game badges (CSS-based, no JS)

**Empty & Error States:**
- No live games: Show upcoming scheduled games with countdown timers
- Stale data warning: Yellow/orange banner at top of page ("Showing cached data from X minutes ago")
- Complete API failure: Friendly error message with "Try Again" button (UX-03 requirement: no blank screens)
- Manual refresh: Refresh icon button in page header (LIVE-08 requirement)

### Claude's Discretion
- Exact card shadow/border styling
- Loading skeleton design during initial page load
- Pulse animation timing and easing
- Toast notification styling for update confirmations
- Error retry logic (exponential backoff, max retries)
- SSE connection management and reconnection strategy

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIVE-01 | User can view real-time score updates for ongoing basketball games | SSE streaming pattern, ReadableStream API |
| LIVE-02 | User sees scores update automatically without page refresh (polling with API rate limits) | EventSource client hook, 10-15s polling interval |
| LIVE-03 | User sees current game context (quarter/period, time remaining) | Game domain types already defined in Phase 1 |
| LIVE-04 | User sees possession indicator showing which team has the ball | Card layout patterns, conditional rendering |
| LIVE-05 | User sees team fouls displayed for each team | Card layout patterns, data display |
| LIVE-06 | User sees game status badges (LIVE, FINAL, SCHEDULED) with clear visual distinction | Tailwind badge components, GameState enum mapping |
| LIVE-07 | User sees "Last updated" timestamp to understand data freshness | React state management, timestamp formatting |
| LIVE-08 | User can manually refresh scores if data appears stale | Manual refresh handler, SSE reconnection |
| HIST-01 | User can view final scores for completed games | GameState.FINAL filtering, cache layer |
| HIST-02 | User can access game results with date and time of completion | Timestamp display, timezone handling |
| LEAGUE-01 | User can view games from NBA league | SportsDataAdapter.getLiveGames('nba') |
| TEAM-01 | User sees team names displayed for each game | Team domain type, card layout |
| TEAM-02 | User sees team logos displayed for visual recognition | Image loading patterns, fallback handling |
| TEAM-03 | User sees season records (W-L) for each team | Data display, API integration |
| NAV-01 | User sees all live games across all leagues on unified home page | Array mapping, game list component |
| NAV-02 | User can view all live games at a glance without excessive scrolling | Responsive grid layout, 4-5 cards visible |
| NAV-03 | User can distinguish between live, scheduled, and completed games visually | Badge styling, color coding, pulse animation |
| NAV-04 | User can navigate to detailed game view from home page | Next.js Link, dynamic routes (Phase 4) |
| UX-01 | User sees clean, scannable layout with minimal visual clutter | Card-based design, whitespace management |
| UX-03 | User sees graceful error messages (not blank screens) when API fails | Error boundaries, fallback UI |
| UX-04 | User sees cached data with timestamp when live updates are unavailable | Redis cache fallback, stale data banner |
| UX-05 | User sees loading indicators during data fetches | Skeleton loaders, animate-pulse |
| UX-06 | User experiences smooth transitions when scores update | CSS transitions, optimistic updates |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 | Server-side streaming, API routes | Official React framework, native ReadableStream support for SSE |
| React | 19.2.3 | UI component library, state management | Latest stable, Suspense and Server Components built-in |
| Tailwind CSS | 4.x | Utility-first styling, animations | Already configured in Phase 1, v4 provides PostCSS-only architecture |
| TypeScript | 5.x | Type safety | Already configured in Phase 1 with strict mode |
| EventSource API | Native | SSE client connection | Browser built-in, automatic reconnection, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-error-boundary | 4.x+ | Error boundary utilities | Production-ready boundaries with reset/retry logic |
| date-fns | 3.x | Timestamp formatting | Lightweight alternative to moment.js for "X minutes ago" display |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SSE | WebSockets | WebSockets require bidirectional communication (overkill), harder to scale, no automatic reconnection |
| EventSource | fetch() with streams | EventSource provides free reconnection logic, simpler API, but fetch() allows custom headers |
| Custom polling | TanStack Query | TanStack Query adds 40KB bundle size, SSE is more appropriate for real-time push |
| Native error boundaries | react-error-boundary | react-error-boundary adds retry/reset utilities, but native boundaries work for simple cases |

**Installation:**
```bash
npm install react-error-boundary date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Home page with game list
│   ├── api/
│   │   └── scores/
│   │       ├── live/route.ts       # SSE endpoint for live updates
│   │       └── refresh/route.ts    # Manual refresh endpoint
│   ├── error.tsx                   # Error boundary for app-level errors
│   └── loading.tsx                 # Loading skeleton for home page
├── components/
│   ├── game-card.tsx               # Individual game card component
│   ├── game-card-skeleton.tsx     # Loading state for game cards
│   ├── game-list.tsx               # List container for game cards
│   ├── status-badge.tsx            # Game status badge component
│   ├── stale-data-banner.tsx      # Warning banner for cached data
│   └── error-fallback.tsx          # Error fallback UI component
├── hooks/
│   ├── useSSE.ts                   # Custom hook for SSE connection
│   ├── usePolling.ts               # Custom hook for polling logic (fallback)
│   └── useGameUpdates.ts           # High-level hook combining SSE + cache
└── lib/
    ├── adapters/                   # Already exists from Phase 1
    ├── cache.ts                    # Already exists from Phase 1
    └── game-state-machine.ts       # Already exists from Phase 1
```

### Pattern 1: SSE Streaming Endpoint (Next.js App Router)
**What:** API route that streams game updates via Server-Sent Events
**When to use:** Real-time push updates, unidirectional data flow

**Example:**
```typescript
// src/app/api/scores/live/route.ts
// Source: Next.js official docs - https://nextjs.org/docs/app/api-reference/file-conventions/route

export const runtime = 'nodejs'  // CRITICAL: Prevents buffering
export const dynamic = 'force-dynamic'  // CRITICAL: Disables caching

function iteratorToStream(iterator: AsyncGenerator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

async function* scoreUpdates() {
  const encoder = new TextEncoder()

  while (true) {
    const games = await getLiveGames('nba')
    const data = `data: ${JSON.stringify(games)}\n\n`
    yield encoder.encode(data)

    await new Promise(resolve => setTimeout(resolve, 15000)) // 15s interval
  }
}

export async function GET() {
  const iterator = scoreUpdates()
  const stream = iteratorToStream(iterator)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Pattern 2: SSE Client Hook (React)
**What:** Custom hook encapsulating EventSource connection lifecycle
**When to use:** Managing SSE connections with automatic cleanup

**Example:**
```typescript
// src/hooks/useSSE.ts
// Source: OneUptime blog - https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view

interface UseSSEOptions {
  url: string
  enabled?: boolean
}

interface UseSSEReturn<T> {
  data: T | null
  isConnected: boolean
  error: Error | null
  reconnect: () => void
}

export function useSSE<T>(options: UseSSEOptions): UseSSEReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!options.enabled) return

    const eventSource = new EventSource(options.url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setData(parsed)
      } catch (err) {
        console.error('Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setError(new Error('SSE connection failed'))
      // EventSource automatically attempts reconnection
    }
  }, [options.url, options.enabled])

  useEffect(() => {
    connect()

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
    }
  }, [connect])

  const reconnect = useCallback(() => {
    eventSourceRef.current?.close()
    connect()
  }, [connect])

  return { data, isConnected, error, reconnect }
}
```

### Pattern 3: Skeleton Loader with Tailwind
**What:** Loading state that mimics card layout structure
**When to use:** Initial page load, component-level Suspense boundaries

**Example:**
```typescript
// src/components/game-card-skeleton.tsx
// Source: Tailwind CSS docs - https://tailwindcss.com/docs/animation

export function GameCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        {/* Badge skeleton */}
        <div className="h-6 w-16 rounded bg-gray-200"></div>

        {/* Team names skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200"></div>
          <div className="h-5 w-28 rounded bg-gray-200"></div>
        </div>

        {/* Score skeleton */}
        <div className="flex justify-center space-x-4">
          <div className="h-10 w-12 rounded bg-gray-200"></div>
          <div className="h-10 w-12 rounded bg-gray-200"></div>
        </div>

        {/* Game context skeleton */}
        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}
```

### Pattern 4: Error Boundary with Retry
**What:** Component-level error catching with user recovery options
**When to use:** Wrapping API-dependent components, risky operations

**Example:**
```typescript
// src/app/page.tsx
// Source: OneUptime blog - https://oneuptime.com/blog/post/2026-01-15-react-error-boundaries/view

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-800">Unable to load games</h2>
      <p className="mt-2 text-sm text-red-600">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GameList />
    </ErrorBoundary>
  )
}
```

### Pattern 5: Responsive Card Grid (Mobile-First)
**What:** Grid layout that adapts from 1 column (mobile) to 2-3 columns (desktop)
**When to use:** Displaying multiple game cards

**Example:**
```typescript
// src/components/game-list.tsx
// Source: Tailwind responsive design docs - https://tailwindcss.com/docs/responsive-design

export function GameList({ games }: { games: Game[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Creating multiple SSE connections:** Always use a single connection and distribute data via React Context or props
- **SSE without cleanup:** Missing cleanup in useEffect causes connection leaks and memory issues
- **Polling inside SSE:** Don't combine polling and SSE — choose one based on use case
- **Global error boundary only:** Isolate errors to components/sections to prevent full page crashes
- **Inline skeleton markup:** Extract skeletons into reusable components for consistency
- **Buffering SSE responses:** Forgetting `runtime: 'nodejs'` and `dynamic: 'force-dynamic'` causes Next.js to buffer entire stream

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error boundaries | Custom componentDidCatch wrappers | react-error-boundary | Provides resetErrorBoundary, onError callbacks, and retry logic out of the box |
| SSE reconnection logic | Manual retry with exponential backoff | EventSource native API | Browser handles reconnection automatically, tracks last event ID |
| Relative timestamps | Custom "X minutes ago" formatter | date-fns formatDistanceToNow() | Handles edge cases (pluralization, localization, timezone) |
| Animation keyframes | Custom @keyframes definitions | Tailwind animate-pulse | Built-in, optimized, respects prefers-reduced-motion |
| Responsive breakpoints | Media query hooks | Tailwind breakpoint prefixes | Declarative, SSR-safe, consistent across components |

**Key insight:** SSE reconnection is deceptively complex — connection drops, event ID tracking, exponential backoff, browser tab visibility, memory management. EventSource handles all of this natively. Custom implementations often miss edge cases like "what if user switches tabs?" or "what if server sends malformed data?"

## Common Pitfalls

### Pitfall 1: SSE Memory Leaks from Missing Cleanup
**What goes wrong:** EventSource connections remain open after component unmounts, consuming memory and bandwidth. Multiple reconnections accumulate, causing browser slowdown and server resource exhaustion.

**Why it happens:** useEffect without return cleanup function. Developers forget that EventSource is a persistent connection, not a one-time fetch.

**How to avoid:** Always return cleanup function in useEffect that calls `eventSource.close()`. Store EventSource in useRef to ensure same instance is closed.

**Warning signs:**
- Browser DevTools Network tab shows multiple active EventSource connections
- Memory usage grows over time during navigation
- "MaxListenersExceededWarning" errors in console

**Example:**
```typescript
// BAD: No cleanup
useEffect(() => {
  const es = new EventSource('/api/scores/live')
  es.onmessage = (e) => setData(e.data)
}, [])

// GOOD: Proper cleanup
useEffect(() => {
  const es = new EventSource('/api/scores/live')
  es.onmessage = (e) => setData(e.data)
  return () => es.close()  // CRITICAL
}, [])
```

**Source:** [OneUptime SSE guide](https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view), [Medium article on SSE risks](https://medium.com/@2957607810/the-hidden-risks-of-sse-server-sent-events-what-developers-often-overlook-14221a4b3bfe)

### Pitfall 2: Next.js Buffering SSE Streams
**What goes wrong:** SSE endpoint sends data incrementally, but client receives all chunks at once after stream completes. Real-time updates don't work — appears like a slow regular request.

**Why it happens:** Next.js default behavior optimizes for static/cached responses. Without `runtime: 'nodejs'` and `dynamic: 'force-dynamic'`, Next.js waits for async function to complete before sending Response, buffering all stream chunks.

**How to avoid:** Add two exports to API route file:
```typescript
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
```

**Warning signs:**
- SSE works locally but fails in production/Vercel
- All updates arrive simultaneously after long delay
- Network tab shows single response after 30+ seconds

**Source:** [Medium article on fixing slow SSE in Next.js](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996), [Next.js discussions on SSE](https://github.com/vercel/next.js/discussions/48427)

### Pitfall 3: State Updates After Component Unmount
**What goes wrong:** Async operations (fetch, setTimeout, EventSource) complete after component unmounts, attempting to call setState on unmounted component. React warns: "Can't perform a React state update on an unmounted component."

**Why it happens:** Race condition between async operation and component lifecycle. SSE message arrives or polling interval fires after user navigates away.

**How to avoid:** Use "cancelled" flag pattern:
```typescript
useEffect(() => {
  let cancelled = false
  const es = new EventSource('/api/scores/live')

  es.onmessage = (e) => {
    if (!cancelled) {  // Check before setState
      setData(JSON.parse(e.data))
    }
  }

  return () => {
    cancelled = true
    es.close()
  }
}, [])
```

**Warning signs:**
- React warnings in console during navigation
- Intermittent "Cannot read property 'setState' of undefined" errors
- Error occurs only when navigating quickly between pages

**Source:** [React useEffect cleanup guide](https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/), [Avoiding race conditions in useEffect](https://www.wisdomgeek.com/development/web-development/react/avoiding-race-conditions-memory-leaks-react-useeffect/)

### Pitfall 4: Polling Interval Not Cleared
**What goes wrong:** setInterval continues running after component unmounts. Multiple intervals accumulate, causing performance degradation and unexpected behavior.

**Why it happens:** Similar to SSE cleanup issue — forgetting that setInterval returns an ID that must be cleared.

**How to avoid:** Always clear interval in cleanup:
```typescript
useEffect(() => {
  const intervalId = setInterval(() => {
    fetchScores()
  }, 15000)

  return () => clearInterval(intervalId)  // CRITICAL
}, [])
```

**Warning signs:**
- Fetch requests continue after leaving page
- Network tab shows duplicate requests at same interval
- Performance degrades over time during app usage

**Source:** [React useEffect cleanup guide](https://refine.dev/blog/useeffect-cleanup/), [Polling in React best practices](https://dev.to/tangoindiamango/polling-in-react-3h8a)

### Pitfall 5: Global Error Boundary Catches Everything
**What goes wrong:** Single error boundary at app root causes entire page to crash when any component fails. User sees blank screen or "Something went wrong" for minor errors like single card failing to load.

**Why it happens:** Misunderstanding error boundary purpose — they're for graceful degradation, not preventing errors. Boundary placement matters.

**How to avoid:** Place boundaries strategically around isolated features:
```typescript
// BAD: Only root boundary
<ErrorBoundary>
  <HomePage />
</ErrorBoundary>

// GOOD: Component-level boundaries
<div>
  <Header />  {/* Errors here don't crash game list */}
  <ErrorBoundary FallbackComponent={GameListError}>
    <GameList />
  </ErrorBoundary>
  <ErrorBoundary FallbackComponent={SidebarError}>
    <Sidebar />  {/* Errors here don't crash game list */}
  </ErrorBoundary>
</div>
```

**Warning signs:**
- Entire page crashes when single component fails
- No way to recover without full page refresh
- Error in sidebar takes down main content

**Source:** [OneUptime error boundaries guide](https://oneuptime.com/blog/post/2026-01-15-react-error-boundaries/view), [React error boundaries building resilient apps](https://dev.to/blamsa0mine/react-error-boundaries-building-resilient-applications-that-dont-crash-4kc5)

### Pitfall 6: Animate-Pulse on Too Many Elements
**What goes wrong:** Applying animate-pulse to large lists or deeply nested elements causes jank, frame drops, and poor scrolling performance on mobile devices.

**Why it happens:** CSS animations trigger repaints. While opacity animations are GPU-accelerated, animating many elements simultaneously overwhelms rendering pipeline.

**How to avoid:** Limit pulse animation to small, isolated elements (badges, icons). Use skeletons during initial load only, not during live updates. Respect prefers-reduced-motion.

**Warning signs:**
- Janky scrolling when skeleton loaders visible
- Mobile performance worse than desktop
- DevTools Performance tab shows high paint times

**Best practice:**
```typescript
// GOOD: Pulse on small badge only
<span className="animate-pulse h-3 w-3 rounded-full bg-red-500" />

// BAD: Pulse on entire card with many children
<div className="animate-pulse">
  <GameCard /> {/* Animates all nested elements */}
</div>
```

**Source:** [Tailwind animations guide](https://refine.dev/blog/tailwind-animations/), [Tailwind animation best practices](https://tailkits.com/blog/tailwind-animation-utilities/)

### Pitfall 7: Not Handling Stale SSE Connections
**What goes wrong:** SSE connection appears active (isConnected: true) but server stopped sending updates. User sees stale data without warning.

**Why it happens:** Server errors, deployments, or network issues silently break connection without triggering onerror. EventSource shows "connected" but receives no messages.

**How to avoid:** Implement heartbeat mechanism — track last message timestamp, warn user if no updates for N seconds:
```typescript
const [lastUpdate, setLastUpdate] = useState(Date.now())

useEffect(() => {
  const checkStale = setInterval(() => {
    if (Date.now() - lastUpdate > 60000) {  // 1 minute stale
      setIsStale(true)
    }
  }, 10000)

  return () => clearInterval(checkStale)
}, [lastUpdate])
```

**Warning signs:**
- Users report "scores not updating" despite connection showing green
- Scores update after manual refresh but not automatically
- Issue resolves after page reload

**Source:** [SSE comprehensive guide](https://medium.com/@moali314/server-sent-events-a-comprehensive-guide-e4b15d147576), [Hidden risks of SSE](https://medium.com/@2957607810/the-hidden-risks-of-sse-server-sent-events-what-developers-often-overlook-14221a4b3bfe)

## Code Examples

Verified patterns from official sources:

### Server-Sent Events Endpoint (Next.js App Router)
```typescript
// src/app/api/scores/live/route.ts
// Source: Next.js official docs - https://nextjs.org/docs/app/api-reference/file-conventions/route

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function iteratorToStream(iterator: AsyncGenerator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

const encoder = new TextEncoder()

async function* scoreUpdates() {
  while (true) {
    // Fetch live games from adapter
    const games = await adapter.getLiveGames('nba')

    // SSE format: "data: <json>\n\n"
    const data = `data: ${JSON.stringify(games)}\n\n`
    yield encoder.encode(data)

    // Wait 15 seconds before next update
    await new Promise(resolve => setTimeout(resolve, 15000))
  }
}

export async function GET() {
  const iterator = scoreUpdates()
  const stream = iteratorToStream(iterator)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Client SSE Hook with Cleanup
```typescript
// src/hooks/useSSE.ts
// Source: OneUptime blog - https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => setIsConnected(true)

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        setData(parsed)
      } catch (err) {
        console.error('Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      // EventSource automatically attempts reconnection
    }

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [url])

  return { data, isConnected }
}
```

### Status Badge with Pulse Animation
```typescript
// src/components/status-badge.tsx
// Source: Tailwind CSS docs - https://tailwindcss.com/docs/animation

interface StatusBadgeProps {
  status: GameState
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    [GameState.LIVE]: {
      color: 'bg-red-100 text-red-800 border-red-200',
      animate: 'animate-pulse',
      label: 'LIVE'
    },
    [GameState.HALFTIME]: {
      color: 'bg-red-100 text-red-800 border-red-200',
      animate: 'animate-pulse',
      label: 'HALFTIME'
    },
    [GameState.FINAL]: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      animate: '',
      label: 'FINAL'
    },
    [GameState.SCHEDULED]: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      animate: '',
      label: 'SCHEDULED'
    },
    [GameState.POSTPONED]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      animate: '',
      label: 'POSTPONED'
    },
    [GameState.CANCELLED]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      animate: '',
      label: 'CANCELLED'
    },
  }

  const { color, animate, label } = config[status]

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color} ${animate}`}>
      {label}
    </span>
  )
}
```

### Responsive Game Card Grid
```typescript
// src/components/game-list.tsx
// Source: Tailwind responsive design docs - https://tailwindcss.com/docs/responsive-design

export function GameList({ games }: { games: Game[] }) {
  // Sort: live games first, then scheduled
  const sortedGames = [...games].sort((a, b) => {
    const liveStates = [GameState.LIVE, GameState.HALFTIME]
    const aIsLive = liveStates.includes(a.state)
    const bIsLive = liveStates.includes(b.state)

    if (aIsLive && !bIsLive) return -1
    if (!aIsLive && bIsLive) return 1
    return 0
  })

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedGames.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
```

### Skeleton Loader
```typescript
// src/components/game-card-skeleton.tsx
// Source: Flowbite skeleton component - https://flowbite.com/docs/components/skeleton/

export function GameCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-4">
        {/* Status badge skeleton */}
        <div className="h-6 w-16 rounded-full bg-gray-200"></div>

        {/* Team names skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200"></div>
          <div className="h-5 w-28 rounded bg-gray-200"></div>
        </div>

        {/* Score skeleton */}
        <div className="flex justify-center space-x-4">
          <div className="h-10 w-12 rounded bg-gray-200"></div>
          <div className="h-10 w-12 rounded bg-gray-200"></div>
        </div>

        {/* Game context skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="h-4 w-20 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling with setInterval | Server-Sent Events (SSE) | 2015+ | Reduces client overhead, server pushes updates only when data changes |
| Custom SSE reconnection | EventSource native API | Always available | Browser handles reconnection automatically, no custom logic needed |
| componentDidCatch | react-error-boundary library | 2019+ | Declarative error handling with reset/retry utilities |
| Moment.js | date-fns | 2019+ | 97% smaller bundle size (2KB vs 67KB), tree-shakeable |
| CSS custom animations | Tailwind animate-* utilities | Tailwind 3.0+ (2021) | Built-in animations respect prefers-reduced-motion, no custom keyframes |
| Pages Router API routes | App Router Route Handlers | Next.js 13+ (2022) | Native streaming support with ReadableStream, simpler API |
| Class component error boundaries | Function component with useErrorBoundary | React 19 (2024) | Hooks-based error handling, but class boundaries still standard |

**Deprecated/outdated:**
- **WebSockets for unidirectional updates**: SSE is simpler, scales better with HTTP/2, automatic reconnection built-in
- **moment.js**: Deprecated by maintainers, use date-fns or Intl.DateTimeFormat
- **Global try/catch for React errors**: Use error boundaries for component errors, try/catch for async operations only
- **Custom polling hooks**: TanStack Query provides robust polling with caching, but SSE is preferred for real-time push

## Open Questions

1. **Which free NBA API provides team logos?**
   - What we know: balldontlie.io provides game data but team logos not confirmed
   - What's unclear: Logo URL format, CDN availability, fallback strategy
   - Recommendation: Test balldontlie.io during implementation; use placeholder logos if unavailable; store logo URLs in database for custom mapping

2. **How to handle possession indicator data?**
   - What we know: Game domain type includes possession field (home/away)
   - What's unclear: Do free APIs provide real-time possession data?
   - Recommendation: Verify API capability during Wave 0; if unavailable, hide possession indicator for v1.0

3. **SSE vs polling fallback strategy?**
   - What we know: SSE preferred but may not work in all environments (corporate proxies, old browsers)
   - What's unclear: Should we implement automatic fallback to polling?
   - Recommendation: Start with SSE only; add polling fallback in Phase 5 (Performance) if user feedback indicates issues

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.x + React Testing Library 14.x |
| Config file | jest.config.js (none — see Wave 0) |
| Quick run command | `npm test -- --testPathPattern="game-card\|status-badge" --maxWorkers=2` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIVE-01 | Real-time score updates displayed | integration | `npm test -- tests/components/game-card.test.tsx -x` | ❌ Wave 0 |
| LIVE-02 | Automatic updates without refresh | integration | `npm test -- tests/hooks/useSSE.test.tsx -x` | ❌ Wave 0 |
| LIVE-06 | Status badges displayed with distinction | unit | `npm test -- tests/components/status-badge.test.tsx -x` | ❌ Wave 0 |
| LIVE-07 | Last updated timestamp displayed | unit | `npm test -- tests/components/game-list.test.tsx -x` | ❌ Wave 0 |
| LIVE-08 | Manual refresh triggers update | integration | `npm test -- tests/hooks/useGameUpdates.test.tsx -x` | ❌ Wave 0 |
| UX-03 | Error boundaries show graceful fallbacks | integration | `npm test -- tests/components/error-fallback.test.tsx -x` | ❌ Wave 0 |
| UX-04 | Cached data shown with timestamp | integration | `npm test -- tests/components/stale-data-banner.test.tsx -x` | ❌ Wave 0 |
| UX-05 | Loading indicators during fetches | unit | `npm test -- tests/components/game-card-skeleton.test.tsx -x` | ❌ Wave 0 |
| NAV-02 | 4-5 games visible without scrolling | e2e | Playwright: `npx playwright test tests/e2e/home-page.spec.ts` | ❌ Wave 0 |
| NAV-03 | Visual distinction between game states | unit | `npm test -- tests/components/status-badge.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="{changed_file}" --maxWorkers=2` (< 10s)
- **Per wave merge:** `npm test -- --onlyChanged` (< 30s)
- **Phase gate:** `npm test -- --coverage --coverageThreshold='{"global":{"statements":80}}'` (before /gsd:verify-work)

### Wave 0 Gaps
- [ ] `jest.config.js` — Configure Jest with TypeScript, React Testing Library, module aliases (@/)
- [ ] `tests/setup.ts` — Setup file for React Testing Library matchers, global mocks
- [ ] `tests/mocks/handlers.ts` — MSW handlers for API mocking (SSE, fetch)
- [ ] `tests/components/game-card.test.tsx` — Unit tests for GameCard component rendering, props
- [ ] `tests/components/status-badge.test.tsx` — Unit tests for badge colors, animations per state
- [ ] `tests/hooks/useSSE.test.tsx` — Integration tests for SSE connection, cleanup, error handling
- [ ] Framework install: `npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw @types/jest`
- [ ] Playwright setup (for e2e): `npm init playwright@latest` (optional for Phase 2, recommended for Phase 5)

## Sources

### Primary (HIGH confidence)
- [Next.js Route Handlers (v16.1.6)](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Streaming, ReadableStream, SSE implementation
- [Next.js Streaming Tutorial](https://nextjs.org/learn/dashboard-app/streaming) - Suspense, loading states, best practices
- [Tailwind CSS Animation Docs](https://tailwindcss.com/docs/animation) - animate-pulse, custom animations, v4 patterns
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoints, grid layouts

### Secondary (MEDIUM confidence)
- [OneUptime SSE in React Guide (Jan 2026)](https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view) - Custom hook implementation, best practices
- [OneUptime React Error Boundaries (Feb 2026)](https://oneuptime.com/blog/post/2026-02-20-react-error-boundaries/view) - Error boundary patterns, graceful degradation
- [Medium: Fixing Slow SSE in Next.js (Jan 2026)](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) - runtime and dynamic config
- [GitHub: Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) - Community solutions for SSE in Next.js
- [Medium: Hidden Risks of SSE](https://medium.com/@2957607810/the-hidden-risks-of-sse-server-sent-events-what-developers-often-overlook-14221a4b3bfe) - Common pitfalls, memory leaks
- [LogRocket: React useEffect Cleanup](https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/) - Memory leak prevention
- [DEV: Polling in React](https://dev.to/tangoindiamango/polling-in-react-3h8a) - Polling patterns with useEffect
- [Flowbite Skeleton Component](https://flowbite.com/docs/components/skeleton/) - Tailwind skeleton patterns
- [Refine: Tailwind Animations](https://refine.dev/blog/tailwind-animations/) - Animation best practices
- [TheLinuxCode: Tailwind Grid 2026 Patterns](https://thelinuxcode.com/tailwind-css-grid-template-columns-practical-patterns-for-2026-layouts/) - Responsive grid layouts

### Tertiary (LOW confidence)
- Multiple Medium articles on React SSE implementations - patterns are consistent but not official sources
- GitHub libraries (react-sse-hooks, react-hooks-sse) - useful for reference but not adopted as dependencies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries officially documented, versions verified in package.json
- Architecture: HIGH - Patterns from official Next.js and React docs, verified with recent 2026 sources
- Pitfalls: MEDIUM-HIGH - Documented in multiple sources, cross-verified with official docs where possible
- SSE implementation: HIGH - Official Next.js docs + multiple 2026 tutorials confirm patterns
- Error handling: HIGH - Official React docs + production-ready libraries (react-error-boundary)
- Tailwind patterns: HIGH - Official Tailwind docs for v4, verified with Flowbite component library

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (30 days - stable tech stack, Next.js 16 is current stable)
