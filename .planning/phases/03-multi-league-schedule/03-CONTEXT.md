# Phase 3: Multi-League & Schedule - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Display live and scheduled games across NBA, NCAA, and EuroLeague leagues with accurate timezone-aware scheduling. Users can:
- View games from all three leagues on a unified home page
- Filter games by specific league to focus on preferred competition
- See upcoming game fixtures with dates and times in their local timezone
- Experience correct game times that adjust automatically during DST transitions

This phase extends the Phase 2 foundation (NBA-only live scores) to support multiple leagues and scheduled games. Team/player statistics and detailed game views are separate phases.

</domain>

<decisions>
## Implementation Decisions

### League Data Sources
- **Supported leagues**: NBA, NCAA, EuroLeague from the start (all three simultaneously)
- **Adapter architecture**: One adapter per league (NBAAdapter, NCAAAdapter, EuroLeagueAdapter)
  - Each implements the existing SportsDataAdapter interface
  - Shared BaseAdapter class for common logic (cache, error handling, rate limiting)
  - getAdapter(league: League) function returns appropriate adapter instance
- **API selection**: Research free APIs for NCAA and EuroLeague during planning phase
  - balldontlie.io provides NBA data (already integrated)
  - NCAA and EuroLeague need free API sources to be identified
  - Evaluate: rate limits, data quality, reliability, update frequency
- **Game type extension**: Add `league: League` enum field to Game interface
  - `League = 'NBA' | 'NCAA' | 'EuroLeague'` type-safe enum
  - Explicit league identification in data model
- **Fetch strategy**: Parallel fetches for all leagues simultaneously
  - Don't wait for slow APIs — show games as they load
  - Three concurrent API calls on page load
- **Cache strategy**: Same TTL for all leagues
  - Live games: 10 seconds
  - Scheduled games: 2 minutes
  - Final games: 15 minutes
  - Consistent behavior across leagues, simpler implementation
- **Error handling**: Show cached data with per-league warning banners
  - "NCAA scores may be outdated" banner when NCAA API fails
  - Other leagues continue working normally
  - Matches Phase 2 stale data banner pattern

### League Filtering UI
- **Filter component**: Pills/chips above game list
  - Horizontal row: "All" | "NBA (5)" | "NCAA (12)" | "EuroLeague (3)"
  - Positioned directly above GameList component
  - Compact, mobile-friendly, reuses card-based visual language
- **Game counts**: Show real-time counts per league
  - Format: "NBA (5)" shows 5 NBA games currently available
  - Updates dynamically as game states change
  - Helps users know what's available before filtering
- **Default state**: "All leagues" selected on page load
  - Unified view showing all games mixed together
  - Matches Phase 2 "all live games on one page" philosophy
  - User can filter to specific league if desired
- **Filtering behavior**: Keep same sorting logic when filtered
  - Live/halftime games first, then scheduled games
  - Sorting doesn't change — just filters which games display
  - Consistent, predictable behavior

### Timezone Handling
- **Detection**: Auto-detect via browser Intl.DateTimeFormat API
  - `Intl.DateTimeFormat().resolvedOptions().timeZone` provides user timezone
  - Automatic, no user configuration needed
  - Works for 99% of users without manual setup
- **Time format**: Auto-detect 12h vs 24h from browser locale
  - US users see "7:30 PM" (12-hour)
  - European users see "19:30" (24-hour)
  - Respects user's system preferences via Intl.DateTimeFormat
- **DST transitions**: Automatic via JavaScript Date APIs
  - Browser Date object and Intl.DateTimeFormat handle DST automatically
  - No special logic or warnings needed
  - Just works across timezone changes
- **Display format**: No timezone abbreviation shown
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **GameCard component** (src/components/game-card.tsx): Already displays team names, logos, scores, status badges, game context. Needs no changes for multi-league — league badge can be added.
- **StatusBadge component** (src/components/status-badge.tsx): Color-coded badges with pulse animation. Reusable for any league.
- **GameList component** (src/components/game-list.tsx): Sorts and displays games. Already has sorting logic (live first). Needs filter prop.
- **useSSE hook** (src/hooks/useSSE.ts): Real-time connection management. Can be extended for multi-league SSE streams.
- **Game, Team, Score types** (src/types/sports-data.ts): Core domain model. Add League enum and Game.league field.
- **SportsDataAdapter interface** (src/lib/adapters/sports-api-adapter.ts): getLiveGames(), getScheduledGames(). Each league adapter implements this.
- **balldontlie-adapter.ts**: Existing NBA adapter. Serves as reference for NCAA/EuroLeague adapters.

### Established Patterns
- **Adapter pattern** (Phase 1): API abstraction prevents vendor lock-in. New league = new adapter implementing SportsDataAdapter.
- **Redis caching** (Phase 1): TTL-based caching with differentiated strategies. Already configured and working.
- **Card-based layout** (Phase 2): Visual language for game display. League filter pills should match this aesthetic.
- **SSE for real-time** (Phase 2): Server-sent events push updates. Can support multiple league streams.
- **Error resilience** (Phase 2): StaleDataBanner component shows cached data warnings. Reuse for per-league failures.

### Integration Points
- **GameList component**: Add `selectedLeague` prop to filter displayed games
- **Home page** (src/app/page.tsx): Add LeagueFilter component above GameList
- **SSE endpoint** (src/app/api/scores/live/route.ts): Extend to stream from multiple adapters
- **Game type**: Add `league: League` field, update all adapters to populate it
- **Adapter factory**: Create getAdapter(league) function to return correct adapter instance

</code_context>

<specifics>
## Specific Ideas

- **BaseAdapter pattern**: Common class handles caching, rate limiting, error handling. Subclasses (NBAAdapter, etc.) only implement API-specific mapping logic. Reduces duplication, ensures consistent behavior.
- **Parallel fetch strategy**: Three concurrent Promise.all() calls to adapters. Don't block fast APIs waiting for slow ones. Progressive loading feels faster.
- **League filter as state**: React useState for selected league. Filter games array before passing to GameList. Simple, explicit state management.
- **Intl API for everything**: Timezone detection, time formatting, DST handling all via browser Intl APIs. No external libraries needed. Standard web platform features.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-multi-league-schedule*
*Context gathered: 2026-03-11*
