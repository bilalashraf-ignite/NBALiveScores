# Phase 2: Live Scores Display - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Display live NBA game scores with automatic updates and comprehensive game context on a unified home page. Users see:
- Real-time score updates every 10-15 seconds
- Game context (quarter, time remaining, possession, fouls)
- Visual status badges (LIVE, FINAL, SCHEDULED)
- All live NBA games in a single view without excessive scrolling

This phase delivers the core viewing experience. Interactions (favoriting, notifications), multi-league support, and detailed statistics are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Game Card Layout
- **Card-based layout** with shadows/borders (not list or grid)
- Each card displays:
  - Team names and logos
  - Current score
  - Game status badge
  - Quarter/period and time remaining
  - Possession indicator
  - Team season records (W-L)
  - Team fouls count
- **Ordering**: Live games first, then scheduled games (not chronological)
- **Spacing**: Comfortable whitespace for mobile usability, 4-5 games visible on desktop without scroll

### Real-time Updates
- **Update mechanism**: Server-sent events (SSE) for pushing updates to browser
- **Polling interval**: 10-15 seconds for fetching fresh scores from API
- **Visual feedback**:
  - Subtle pulse animation on cards when data refreshes
  - "Last updated" timestamp displayed on page (LIVE-07 requirement)
- **Failure handling**: Show cached data from Redis with warning banner when API fails

### Game Status Display
- **Badge style**: Color-coded with icons
  - LIVE/HALFTIME: Red badge with pulse animation (grouped together)
  - FINAL: Gray badge, no animation
  - SCHEDULED: Blue badge, no animation
  - POSTPONED/CANCELLED: Yellow warning badge (grouped together)
- **Badge position**: Top-right corner of each game card
- **Animation**: Subtle pulse on live game badges (CSS-based, no JS)

### Empty & Error States
- **No live games**: Show upcoming scheduled games with countdown timers
- **Stale data warning**: Yellow/orange banner at top of page ("Showing cached data from X minutes ago")
- **Complete API failure**: Friendly error message with "Try Again" button (UX-03 requirement: no blank screens)
- **Manual refresh**: Refresh icon button in page header (LIVE-08 requirement)

### Claude's Discretion
- Exact card shadow/border styling
- Loading skeleton design during initial page load
- Pulse animation timing and easing
- Toast notification styling for update confirmations
- Error retry logic (exponential backoff, max retries)
- SSE connection management and reconnection strategy

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Game domain types** (src/types/sports-data.ts): Game, Team, Score, GameState enum with 6 states
- **SportsDataAdapter interface** (src/lib/adapters/sports-api-adapter.ts): getLiveGames(), getGame(), getScheduledGames() methods
- **Redis cache layer** (src/lib/cache.ts): Configured with TTL strategies (10s for live, 2min for scheduled, 15min for final)
- **Tailwind CSS**: Utility-first styling configured and ready

### Established Patterns
- **Next.js App Router**: src/app/ directory structure with page.tsx and layout.tsx
- **TypeScript strict mode**: Type safety enforced across codebase
- **API abstraction**: Adapter pattern prevents vendor lock-in (Phase 1 decision)

### Integration Points
- Home page at src/app/page.tsx (currently placeholder)
- API routes will be created under src/app/api/ for SSE endpoints
- Redis cache provides fallback data during API failures
- GameState enum drives badge display logic and polling behavior

</code_context>

<specifics>
## Specific Ideas

- SSE chosen over polling: Server pushes updates to browser rather than client repeatedly requesting
- Status badge grouping: LIVE+HALFTIME together (both active), POSTPONED+CANCELLED together (both disrupted)
- Empty state focuses on value: Show upcoming games rather than just a message
- Mobile-first spacing: Comfortable tap targets prioritized over information density

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-live-scores-display*
*Context gathered: 2026-03-11*
