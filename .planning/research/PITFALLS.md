# Pitfalls Research

**Domain:** Live Basketball Scores Website
**Researched:** 2026-03-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Naive API Polling Leading to Rate Limit Death Spiral

**What goes wrong:**
App requests live score updates every second for all games regardless of state (scheduled/live/finished), hitting API rate limits within minutes. Once rate-limited with HTTP 429 errors, the app shows stale data or blank screens, users lose trust, and the site becomes unusable during peak game times.

**Why it happens:**
Developers treat all games equally, polling scheduled games at the same frequency as live games. Free APIs typically allow only 10-30 requests/minute, which is exhausted quickly when tracking multiple games simultaneously.

**How to avoid:**
- Implement adaptive polling based on game state:
  - Scheduled games: poll every 5-10 minutes
  - Live games: poll every 10-30 seconds
  - Halftime: poll every 2 minutes
  - Finished games: stop polling entirely
- Monitor `X-RateLimit-Remaining` header in API responses
- Implement exponential backoff when approaching quota limits (e.g., slow down when remaining < 20% of limit)
- Use WebSockets or Server-Sent Events (SSE) if API supports push notifications
- Cache responses with appropriate TTL (30-120 seconds for live data)

**Warning signs:**
- Seeing HTTP 429 errors in logs
- `X-RateLimit-Remaining` header consistently drops to zero
- Users reporting "data not loading" during popular game times (NBA primetime, March Madness)
- API costs scaling linearly with number of simultaneous games

**Phase to address:**
Phase 1 (Core live scores) — Must be architected correctly from start. Refactoring polling logic after launch is expensive and causes downtime.

---

### Pitfall 2: Missing Graceful Degradation for API Failures

**What goes wrong:**
When the sports data API goes down, times out, or returns errors (which happens regularly during high-traffic events), the app displays blank screens, error messages, or crashes entirely. Users abandon the site and don't return.

**Why it happens:**
Developers focus only on the "happy path" where API calls succeed. They don't plan for network timeouts, server delays, quota exhaustion, malformed responses, or unexpected empty data.

**How to avoid:**
- Implement multiple fallback layers:
  1. **Primary**: Live API data
  2. **Secondary**: Cached data from last successful fetch (with visible timestamp like "Updated 2 minutes ago")
  3. **Tertiary**: Show "Data temporarily unavailable — Retrying..." with manual refresh button
- Never show blank screens — always display last-known state
- Log failures silently but show user-friendly messages
- Implement retry logic with exponential backoff (wait 1s, 2s, 4s, 8s between retries)
- Set reasonable timeouts (3-5 seconds for API calls)
- Validate API responses before updating UI (check for required fields)

**Warning signs:**
- Users reporting "nothing loads" during games
- Error logs showing unhandled exceptions from API calls
- No monitoring/alerting for API failure rates
- UI flashes between states when API is slow

**Phase to address:**
Phase 1 (Core live scores) — Critical for launch. Poor error handling kills user trust immediately.

---

### Pitfall 3: Timezone Chaos in Game Schedules

**What goes wrong:**
Game times display incorrectly for users in different timezones. East Coast users see games scheduled for 4:00 AM when they're actually 7:00 PM local time. Users miss games or arrive late because the schedule was wrong.

**Why it happens:**
Developers store times in local timezone instead of UTC, hardcode timezone offsets (breaking during Daylight Saving Time), or assume all users are in one timezone. JavaScript's Date object makes it easy to mess this up.

**How to avoid:**
- **Storage**: Always store ALL timestamps in UTC in your database
- **API handling**: Convert API timestamps to UTC immediately on receipt (most sports APIs return UTC)
- **Display**: Convert to user's local timezone only in the frontend using browser APIs
- **Implementation**:
  ```javascript
  // Store/transmit as ISO 8601 UTC
  const gameTime = "2026-03-15T23:00:00Z"

  // Display to user in their timezone
  const userLocalTime = new Date(gameTime).toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  ```
- Use `Intl.DateTimeFormat()` API to detect user's timezone automatically
- Never hardcode timezone offsets like "EST = UTC-5" (breaks during DST)
- Show explicit timezone labels in UI: "7:00 PM EST" or "7:00 PM Your Local Time"
- Test with users in multiple timezones (especially Hawaii, Alaska, international)

**Warning signs:**
- Bug reports about "wrong game times" around DST changes (March/November)
- Users asking "what timezone is this?"
- Hardcoded timezone offset values in code (`-5`, `+8`, etc.)
- Time display breaking when user travels or changes system timezone

**Phase to address:**
Phase 1 (Core live scores) — Must be correct from day one. Timezone bugs erode trust and are painful to fix retroactively.

---

### Pitfall 4: Game State Machine Mismanagement

**What goes wrong:**
App doesn't properly track game state transitions (scheduled → live → halftime → overtime → finished). Finished games keep polling for updates, halftime games update too frequently, or overtime games show wrong quarter information. Users see "Quarter 4" when the game is in overtime, or worse, live updates stop during overtime.

**Why it happens:**
Developers don't model basketball game states explicitly. They rely on fragile conditionals like `if (quarter === 4 && timeRemaining === 0)` which breaks for overtime, double-overtime, forfeits, postponements, and suspended games.

**How to avoid:**
- Define explicit game states:
  ```javascript
  const GameState = {
    SCHEDULED: 'scheduled',
    PRE_GAME: 'pre_game',      // Warmups started
    QUARTER_1: 'q1',
    QUARTER_2: 'q2',
    HALFTIME: 'halftime',
    QUARTER_3: 'q3',
    QUARTER_4: 'q4',
    OVERTIME: 'overtime',       // Can have multiple OT periods
    FINAL: 'final',
    POSTPONED: 'postponed',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled'
  }
  ```
- Map API status fields to your state machine (normalize across different API providers)
- Adjust polling frequency based on state (halftime = slower, overtime = faster)
- Handle edge cases: triple-overtime, games postponed mid-play, technical forfeits
- Store state history for debugging: "Why did this game go from Q2 to Final?"
- Test state transitions with historical game data including unusual games

**Warning signs:**
- Overtime games display "Quarter 5" instead of "OT"
- Finished games still making API calls hours later
- Halftime shows same update frequency as live play
- Can't distinguish between "scheduled" and "warmups in progress"
- No handling for postponed/suspended games (March Madness weather delays, etc.)

**Phase to address:**
Phase 1 (Core live scores) — State machine architecture must be solid from start. Adding states later requires refactoring entire update logic.

---

### Pitfall 5: Over-Fetching Data Payloads

**What goes wrong:**
Every poll fetches complete game data including full rosters, detailed player stats, season averages, team info, and historical matchups — even when only the score changed. This causes slow responses (500ms-2s), excessive API costs, bandwidth waste on mobile, and terrible performance on slow connections.

**Why it happens:**
Developers use convenient "get everything" API endpoints instead of targeted endpoints. They don't leverage API filtering features or separate static data from live data.

**How to avoid:**
- **Separate data into update frequencies**:
  - Static (fetch once): Team names, logos, season schedules, arena info
  - Slow-changing (fetch hourly): Player rosters, season standings, team records
  - Fast-changing (fetch by game state): Scores, time remaining, possession
  - Event-driven (fetch on change): Play-by-play updates, significant events
- **Use API filters** to request only needed fields:
  ```
  // Bad: Get everything
  /api/games/12345

  // Good: Get only live data
  /api/games/12345?fields=score,quarter,time_remaining,possession
  ```
- **Implement incremental updates**: Request "events since last poll" instead of full game state
- **Cache aggressively**: Store team info, player data locally with long TTL (24 hours)
- **Lazy load details**: Fetch full player stats only when user clicks to expand

**Warning signs:**
- API responses consistently over 50KB for simple score updates
- Mobile users complaining about slow loading or data usage
- Same data fetched repeatedly (team logos downloaded 100x per game)
- Network tab shows massive JSON payloads every 30 seconds
- API costs scale with number of polls rather than actual data changes

**Phase to address:**
Phase 1 (Core live scores) — Critical for mobile performance and staying within free API limits.

---

### Pitfall 6: Stale Data Without User Awareness

**What goes wrong:**
API fails, cache serves old data, but users don't know they're seeing stale information. They make decisions (checking if game started, seeing final score) based on data that's 10 minutes old. When they compare with friends or other sites, your site is "wrong."

**Why it happens:**
Developers implement caching for resilience but forget to communicate data freshness to users. There's no visual indication of when data was last updated or whether updates are currently working.

**How to avoid:**
- **Always show last update timestamp**: "Updated 23 seconds ago" or "Last update: 7:32 PM"
- **Visual indicators for update status**:
  - Green dot: "Live" (updating successfully)
  - Yellow dot: "Delayed" (using cache, retrying)
  - Red dot: "Offline" (no updates, manual refresh needed)
- **Automatic staleness detection**: If data age > 2 minutes for live game, show warning
- **Manual refresh option**: Always provide a refresh button for users who suspect stale data
- **Log timestamps with cached data**: Store `fetched_at`, `cached_at`, `displayed_at`
- **Progressive staleness warnings**:
  - < 1 minute old: No warning
  - 1-3 minutes old: "Updates may be delayed"
  - > 3 minutes old: "Data is stale — Tap to refresh"

**Warning signs:**
- Users reporting "your score is wrong" (it was just delayed)
- No visible indication of when data was fetched
- Users constantly refreshing page manually
- Support tickets: "Is the game actually over?"
- Social media complaints about accuracy

**Phase to address:**
Phase 1 (Core live scores) — Trust is everything for live scores. Users must know data freshness.

---

### Pitfall 7: Free API Vendor Lock-in Without Escape Plan

**What goes wrong:**
App is tightly coupled to one free API provider's specific data format, field names, and quirks. When that API changes pricing, shuts down, degrades quality, or gets acquired, migration requires rewriting the entire application. Your MVP is held hostage.

**Why it happens:**
Developers call API endpoints directly from UI components, spreading API-specific logic throughout the codebase. Thinking "it's just a side project" or "we'll refactor later" (you won't). Free APIs change frequently — they're not enterprise-grade.

**How to avoid:**
- **Abstract API layer from day one**: Create an adapter interface between your app and external APIs
  ```javascript
  // BAD: Direct coupling
  fetch('https://specific-api.com/games')

  // GOOD: Adapter pattern
  interface SportsDataProvider {
    getGames(): Promise<Game[]>
    getLiveScore(gameId): Promise<Score>
  }

  class BalldontlieAdapter implements SportsDataProvider {
    // Maps balldontlie.io format to your internal format
  }

  class EspnAdapter implements SportsDataProvider {
    // Maps ESPN format to your internal format
  }
  ```
- **Normalize data immediately**: Convert external API format to your internal schema at the boundary
- **Document provider-specific quirks**: Keep a migration guide for when you need to switch
- **Test with multiple providers early**: Validate your abstraction works with 2+ APIs
- **Budget for migration**: Assume you'll switch APIs within 12 months (very common)

**Warning signs:**
- API provider field names scattered throughout codebase (`data.api_sports_io_status`)
- Direct `fetch()` calls to API URLs in multiple files
- Business logic depends on API-specific field structures
- No documentation of which API fields map to which app concepts
- Only tested with one API provider

**Phase to address:**
Phase 1 (Core live scores) — Abstraction is cheap upfront, expensive later. Design for portability from start.

---

### Pitfall 8: Real-time Update Lag Destroying UX

**What goes wrong:**
Your app shows a score update 15-30 seconds after the event happens. Users watching on TV see a three-pointer go in, check your app, still shows the old score. They lose trust and switch to competitors. Even worse: Users get push notifications BEFORE seeing the play happen on their TV stream (spoiler effect).

**Why it happens:**
Long polling intervals (60+ seconds), network latency not accounted for, sequential processing of multiple game updates, using inefficient protocols, API provider itself has delays, or "second screen" desync with TV broadcasts (TV has 10-45 second delay from live action).

**How to avoid:**
- **Target latency budget**: 5-10 seconds from event to display (realistic for free APIs)
  - Live action → API provider: 2-5 seconds (you don't control this)
  - API poll interval: 10-15 seconds (you control this)
  - Network + processing: 1-2 seconds (optimize this)
  - **Total**: ~15-20 seconds realistic for polling free APIs
- **Use efficient protocols**: WebSockets > SSE > Long polling > Short polling
- **Parallel processing**: Update all live games concurrently, not sequentially
- **Optimize payload size**: Smaller responses = faster transfers (see Pitfall 5)
- **Monitor end-to-end latency**: Log `event_timestamp`, `api_fetch_timestamp`, `ui_update_timestamp`
- **Progressive enhancement**: Show partial updates immediately (score changed) before full details load
- **"Second screen sync" awareness**: TV broadcasts are 10-45s delayed, so being "too fast" can spoil the experience
  - Option: Let users adjust update delay to match their TV stream
  - Show "Live" vs "TV Delay" mode toggle

**Warning signs:**
- User complaints: "Your site is slow to update"
- Metrics show >30 second gap between actual event and display
- Sequential processing causing delays to cascade
- No monitoring of update latency
- Users prefer competitors' sites for "faster updates"

**Phase to address:**
Phase 1 (Core live scores) — Speed is the primary value proposition. If you're slow, users leave immediately.

---

### Pitfall 9: Mobile Battery Drain from Background Updates

**What goes wrong:**
Mobile app keeps polling for score updates in the background, draining user's battery by 20-40% during a game. Users uninstall the app after noticing battery drain, or disable notifications, defeating the purpose of the app.

**Why it happens:**
Aggressive polling continues when app is backgrounded, WebSocket connections stay open indefinitely, no awareness of battery level or network type (cellular vs WiFi), and mobile platforms penalize apps that drain battery.

**How to avoid:**
- **Respect platform background limits**:
  - iOS: Max 30 seconds of background execution unless using Background Fetch
  - Android: More flexible but still penalizes battery hogs
- **Reduce frequency when backgrounded**:
  - Active/foreground: Poll every 10-15 seconds
  - Background: Poll every 60-120 seconds or use push notifications
  - Screen off: Stop polling, rely on scheduled system fetches
- **Batch network requests**: Group multiple game updates into single API call
- **Use push notifications instead of polling** when available (requires backend)
- **Network-aware polling**:
  - On WiFi: Normal polling frequency
  - On cellular: Reduce frequency by 50%
  - Low battery mode: Reduce frequency by 75%
- **Close connections when idle**: Don't keep WebSockets open when app backgrounded
- **Leverage platform-specific APIs**:
  - iOS: Background Fetch, Background App Refresh
  - Android: WorkManager, JobScheduler for batched updates

**Warning signs:**
- User reviews mentioning "battery drain"
- App continues polling at same rate when backgrounded
- No detection of battery level or power mode
- WebSocket connections never close
- Network requests occur when screen is off
- No difference in update frequency between WiFi and cellular

**Phase to address:**
Phase 2 (Mobile web optimizations) — Not critical for desktop, but essential if targeting mobile users (which basketball fans are).

---

### Pitfall 10: Inconsistent or Missing Play-by-Play Data

**What goes wrong:**
Play-by-play feed has missing events, events out of chronological order, duplicate events, wrong player attributions, or inconsistent event types across games/APIs. Users see "Player X made 3PT" but the score didn't change, or events appear in wrong order, destroying trust in your data.

**Why it happens:**
Different APIs have different event schemas, play-by-play data often has errors from official scorekeepers, events arrive out-of-order due to network issues, no deduplication logic, and free APIs have lower quality control than paid feeds.

**How to avoid:**
- **Normalize event types immediately**: Map API-specific events to your standard schema
  ```javascript
  // Different APIs call it different things
  const normalizeEvent = (apiEvent) => {
    switch (apiEvent.type) {
      case 'shot_made':
      case 'field_goal_made':
      case 'basket':
        return { type: 'SCORE', subtype: 'FIELD_GOAL' }
      // ... etc
    }
  }
  ```
- **Event deduplication**: Use unique event IDs or hash(timestamp + player + event type)
- **Chronological ordering**: Sort by event timestamp, not arrival order
- **Validate event sequences**:
  - Score change events must match score deltas
  - Player substitutions must alternate in/out
  - Shot attempts + makes + misses should sum correctly
- **Handle missing data gracefully**: Don't break UI if player name is null
- **Detect and flag anomalies**: Log when events don't make sense for manual review
- **Reconcile with authoritative score**: If play-by-play doesn't match official score, trust the official score
- **Test with historical games** that have known quirks (triple-overtime, forfeits, etc.)

**Warning signs:**
- Events displayed out of chronological order
- Score increments don't match the event type (shows +2 for a 3-pointer)
- Duplicate events appearing multiple times
- Player substitution errors (6 players on court)
- Null/undefined player names in events
- Events from wrong quarter appearing in timeline

**Phase to address:**
Phase 2 (Play-by-play feature) — Not needed for basic scores, but critical when adding play-by-play detail.

---

### Pitfall 11: Advanced Statistics Calculation Errors

**What goes wrong:**
Advanced metrics like True Shooting %, Player Efficiency Rating (PER), or Plus/Minus are calculated incorrectly, use wrong formulas, don't handle edge cases, or are compared inappropriately across eras. Users who understand basketball analytics lose trust, and your predictions based on these stats are wrong.

**Why it happens:**
Formulas look simple but have subtle nuances (like the 0.44 coefficient in TS%), formulas change over time (different NBA eras use different calculations), missing data causes division by zero, or developers don't understand statistical context (small sample sizes, garbage time stats).

**How to avoid:**
- **Use authoritative formula sources**: Basketball Reference, NBA.com official definitions
- **True Shooting % formula**:
  ```javascript
  // TS% = Points / (2 * (FGA + 0.44 * FTA))
  // The 0.44 is a weighted average, not arbitrary
  const trueShootingPct = (points, fga, fta) => {
    const tsa = 2 * (fga + 0.44 * fta)
    return tsa > 0 ? points / tsa : 0
  }
  ```
- **Handle edge cases**:
  - Division by zero (player with 0 shot attempts)
  - Negative values (shouldn't happen but validate input)
  - Null/undefined stats (incomplete data)
  - Small sample sizes (label stats from <5 games as "insufficient data")
- **Filter garbage time stats**: Don't include stats when game is decided (>20 point margin in 4th quarter)
- **Era-aware comparisons**: Don't directly compare 1980s PER to 2020s PER without context
- **Validate against known sources**: Test calculations against Basketball Reference for same players/games
- **Document formula sources and versions**: Link to official definitions, note when formulas changed
- **Handle missing defensive stats**: PER heavily weights offense, note this limitation

**Warning signs:**
- Advanced stats don't match Basketball Reference for same player/game
- Seeing impossible values (TS% > 1.0, negative PER)
- No handling of division by zero
- Formulas in comments don't match code
- No source attribution for formula definitions
- Stats fluctuate wildly game-to-game (small sample issue)

**Phase to address:**
Phase 3 (Advanced statistics/predictions) — Not needed for basic scores, critical when adding prediction features.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Polling instead of WebSockets | Simpler to implement, works with any API | Higher latency (15-30s), more API calls, potential rate limits | MVP with free APIs that don't offer WebSockets (most free APIs) — migrate to WebSockets when switching to paid tier |
| Hardcoded API credentials in code | Faster development setup | Security vulnerability if repo is public, can't rotate keys easily | Never acceptable — use `.env` files from day one (5 minute setup) |
| Fetching all games instead of filtering | Simpler API calls (no query params) | Wasted bandwidth, slower responses, higher API costs | Never acceptable — filtering is trivial and saves 80%+ of bandwidth |
| Client-side only (no backend) | Zero hosting costs, simpler deployment | Can't implement push notifications, exposes API keys, no caching layer | Acceptable for MVP to validate concept — add backend when adding push notifications |
| SQLite instead of Postgres | Zero configuration, local file | Can't scale horizontally, no built-in replication, limited concurrent writes | Acceptable for MVP with <1000 users — migrate before scale |
| Manual API response typing | Faster than generating types | Type errors, breaking changes go undetected | Acceptable for MVP — generate types from API schemas in Phase 2 |
| Single API provider | Faster to build, no abstraction complexity | Vendor lock-in, risky if API shuts down | Acceptable for MVP IF you use adapter pattern (see Pitfall 7) — test second provider by Phase 2 |
| No monitoring/logging | Faster development | Debugging in production is nightmare, no visibility into issues | Never acceptable — basic logging takes 1 hour, saves weeks of debugging |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Free NBA APIs (balldontlie.io, ESPN unofficial) | Assuming 100% uptime and consistency | Implement fallback to secondary API, cache aggressively, show stale data with timestamp rather than errors |
| Rate-limited APIs | Polling all endpoints at maximum allowed rate | Monitor `X-RateLimit-Remaining` header, implement adaptive throttling, reserve 20% of quota for burst traffic |
| WebSocket connections | Opening one connection per game being tracked | Open single connection, subscribe to multiple games, implement reconnection logic with exponential backoff |
| Time data from APIs | Trusting API times are in stated timezone | Always convert to UTC immediately on receipt, store in UTC, convert to user timezone only for display |
| Player/team IDs | Assuming IDs are consistent across APIs | Map external IDs to internal IDs at API boundary, store mappings for cross-API correlation |
| Game status fields | Taking string status values at face value ("Final", "F", "Finished", "FINAL") | Normalize to your enum/state machine immediately, don't propagate inconsistent formats through app |
| Historical data | Assuming historical data never changes | Scores can be adjusted post-game (stat corrections), re-fetch final scores 24 hours after game ends |
| Pagination | Fetching first page and assuming that's all | Always check `meta.total_pages` or `next_page` fields, implement loop to fetch all pages |
| Error responses | Only checking HTTP status code (200 vs 4xx/5xx) | Also validate response body structure, check for API-specific error fields, handle partial successes |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Polling all games at same frequency regardless of state | High API costs, rate limit errors during peak hours (NBA primetime) | Implement adaptive polling based on game state (scheduled=5min, live=15sec, final=never) | Immediately at 10+ simultaneous games with 30sec polling |
| Sequential game updates | Page takes 5-10 seconds to load all scores during busy nights | Parallel API calls using `Promise.all()`, update UI incrementally as each response arrives | At 5+ simultaneous games |
| No caching layer | Every page load hits API, slow perceived performance, burns through rate limits | Cache scores with 30-60 second TTL, serve cached data while fetching fresh data in background | Immediately with any significant traffic (100+ users/hour) |
| Loading full game details for list view | Home page with 10 games loads 500KB+ data, slow on mobile | Lazy load details (stats, play-by-play) only when user expands game card | At 5+ games on homepage |
| Downloading team logos/assets repeatedly | Same 50KB logo downloaded 100x per game day | Cache static assets locally with long TTL (24 hours), use CDN for images | Immediately — wasting bandwidth and slowing loads |
| Real-time updates blocking UI thread | UI freezes for 100-200ms every update | Move data processing to Web Worker, use requestIdleCallback for non-critical updates | At 10+ simultaneous live games with play-by-play |
| Storing full game history in browser memory | Browser tab uses 500MB+ RAM, crashes on mobile | Implement virtual scrolling, paginate history, clear old data from memory | After viewing 20+ games |
| No database indexing | Game lookup queries take 500ms+ as history grows | Index on `game_id`, `game_date`, `status`, `team_id` from day one | At 1000+ games in database |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API keys in frontend JavaScript | API key abuse, quota exhaustion, unexpected bills when switching to paid tier | Use backend proxy for API calls, rotate keys if exposed, implement rate limiting on your API |
| No input validation on game/team IDs | SQL injection (if using database), crashes from malformed IDs | Validate ID format (UUID, integer, etc.), use parameterized queries, sanitize inputs |
| Trusting API data without validation | XSS attacks if API returns malicious content (unlikely but possible) | Sanitize text content before rendering, use framework's built-in escaping (React, Vue), validate data types |
| CORS misconfiguration | Site vulnerable to cross-origin attacks, or legitimate requests blocked | Use specific origins in CORS headers, not `Access-Control-Allow-Origin: *` in production |
| No rate limiting on your own API | DDoS vulnerability, resource exhaustion | Implement rate limiting (100 requests/minute per IP), use CDN with DDoS protection |
| Storing user preferences without authentication | Privacy issues if adding user accounts later | Even for anonymous users, use session tokens, don't store PII without consent |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing scores without game state context | Users don't know if game is live, final, or scheduled — "Is 98-95 the final score or current score?" | Always show game status badge: "LIVE Q3 5:32", "FINAL", "Today 7:00 PM" |
| No visual feedback during updates | Users don't know if data is loading, stale, or broken — tap refresh repeatedly | Show update spinner, "Last updated X seconds ago", connection status indicator |
| Overcrowded game card UI | Trying to show score + stats + play-by-play + predictions all at once — overwhelming | Progressive disclosure: minimal card view, expand for details, separate page for full stats |
| Auto-refreshing causing UI jumps | Score updates while user is reading stats → layout shifts, loses place | Pin user's scroll position, animate changes smoothly, don't refresh when user is actively interacting |
| Not showing which team has possession | Critical context missing in close games | Show possession indicator (arrow, color highlight, ball icon) next to score |
| Blinking/flashing content for updates | Annoying, distracting, triggers accessibility issues | Use smooth CSS transitions, subtle color pulse, or badge indicator for new events |
| Timestamps without timezone | "7:00 PM" — which timezone? Users miss games | Always show timezone: "7:00 PM EST" or "7:00 PM Your Time", make it obvious |
| No offline indicator | App silently shows stale data when offline, users think scores are live | Clear offline banner: "You're offline — Showing last known scores from X minutes ago" |
| Spoiler notifications before TV stream | Push notification "Lakers scored!" arrives 30 seconds before user sees it on TV — ruins experience | Offer "TV Sync Mode" with 30-45 second notification delay, or disable notifications during game |
| No loading states for slow connections | Blank screen for 5 seconds on slow 3G, users think app is broken | Show skeleton screens, progressive loading, "Loading scores..." message |

---

## "Looks Done But Isn't" Checklist

- [ ] **Live scores:** Often missing graceful degradation for API failures — verify app shows cached scores with timestamp when API is down
- [ ] **Game times:** Often missing timezone handling — verify displays correctly for users in different timezones, especially during DST transitions
- [ ] **State management:** Often missing edge cases — verify handles overtime, postponed, suspended, and cancelled games correctly
- [ ] **Rate limiting:** Often missing monitoring — verify tracks `X-RateLimit-Remaining` and throttles before hitting limit
- [ ] **Mobile performance:** Often missing battery optimization — verify reduces polling frequency when backgrounded and on cellular
- [ ] **Error handling:** Often missing user-facing messages — verify shows helpful error messages, not blank screens or console errors
- [ ] **Data freshness:** Often missing staleness indicators — verify shows "Last updated" timestamp and warns when data is old
- [ ] **Caching strategy:** Often missing invalidation logic — verify clears cache when game ends, doesn't show yesterday's live scores
- [ ] **Play-by-play:** Often missing deduplication — verify doesn't show duplicate events or events out of order
- [ ] **Advanced stats:** Often missing edge case handling — verify gracefully handles division by zero, null values, insufficient data
- [ ] **API abstraction:** Often missing provider-agnostic design — verify switching API providers doesn't require rewriting entire app
- [ ] **Accessibility:** Often missing ARIA labels, keyboard navigation — verify screen readers can announce scores, color isn't only indicator

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| No API abstraction layer (vendor lock-in) | HIGH (2-4 weeks) | 1. Create adapter interface defining your domain model. 2. Implement adapter for current API. 3. Refactor all API calls to go through adapter. 4. Test extensively. 5. Implement second provider adapter to validate abstraction. |
| Poor timezone handling (hardcoded offsets) | MEDIUM (3-5 days) | 1. Audit all date/time storage — convert to UTC. 2. Replace hardcoded offsets with `Intl.DateTimeFormat()`. 3. Add timezone to all timestamps in database. 4. Test with users in multiple zones, especially during DST. |
| No game state machine | MEDIUM (1 week) | 1. Define state enum for all possible states. 2. Add `state` field to game schema. 3. Implement state transition logic. 4. Refactor polling logic to use states. 5. Test with edge cases (OT, postponed, etc.). |
| Naive polling (constant rate) | LOW (1-2 days) | 1. Implement state-based polling intervals. 2. Monitor rate limit headers. 3. Add exponential backoff. 4. Test during high-traffic games. |
| No error handling/fallbacks | MEDIUM (3-4 days) | 1. Implement try-catch around all API calls. 2. Add caching layer for fallback data. 3. Create error UI components. 4. Add logging and monitoring. 5. Test with API mocked to fail. |
| Missing graceful degradation | LOW (2-3 days) | 1. Add timestamp to cached data. 2. Show "Last updated" in UI. 3. Add offline detection. 4. Display stale data with clear indicators. 5. Add manual refresh button. |
| Overcrowded UI | LOW (2-3 days) | 1. Create minimal card component. 2. Move details to expandable sections or separate pages. 3. Test with real users for clarity. |
| Mobile battery drain | MEDIUM (4-5 days) | 1. Detect app foreground/background state. 2. Implement reduced polling when backgrounded. 3. Add battery level detection. 4. Test battery usage over 2-hour game. |
| Advanced stats calculation errors | LOW (1-2 days per metric) | 1. Find authoritative formula source. 2. Implement with edge case handling. 3. Unit test against known values from Basketball Reference. 4. Document formula source. |
| Stale data without indicators | LOW (1 day) | 1. Add "Last updated" timestamp to UI. 2. Implement staleness warnings. 3. Add manual refresh button. 4. Show connection status indicator. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Naive API polling | Phase 1 — Core live scores | Monitor rate limit headers during NBA game night, verify no 429 errors |
| Missing graceful degradation | Phase 1 — Core live scores | Kill API server, verify app shows cached scores with timestamp |
| Timezone chaos | Phase 1 — Core live scores | Test with system timezone set to Hawaii, Tokyo, London during DST transition |
| Game state mismanagement | Phase 1 — Core live scores | Load historical triple-overtime game, verify displays "3OT" not "Q7" |
| Over-fetching data | Phase 1 — Core live scores | Check network tab during score updates, verify payload < 10KB per game |
| Stale data without awareness | Phase 1 — Core live scores | Disconnect from network mid-game, verify shows "Data may be delayed" |
| Free API vendor lock-in | Phase 1 — Core live scores | Attempt to swap in test API provider, verify requires < 4 hours of work |
| Real-time update lag | Phase 1 — Core live scores | Measure event timestamp to UI display, verify < 20 seconds average |
| Mobile battery drain | Phase 2 — Mobile optimizations | Background app during live game on real device, measure battery usage |
| Play-by-play data inconsistency | Phase 2 — Play-by-play feature | Load game with known data quirks, verify events in order without duplicates |
| Advanced stats errors | Phase 3 — Predictions/analytics | Calculate TS% for known player, compare to Basketball Reference, verify match |

---

## Sources

**API Integration Best Practices:**
- [5 Common Mistakes Developers Make with Football APIs - Sportmonks](https://www.sportmonks.com/blogs/5-common-mistakes-developers-make-with-football-apis-and-how-to-avoid-them/)
- [Building a real-time Livescore app with a Football API - Sportmonks](https://www.sportmonks.com/blogs/building-a-real-time-livescore-app-with-a-football-api-best-practices/)
- [Best Practices for Integrating Sportradar's Sports Data APIs](https://sportradar.com/content-hub/blog/best-practices-for-integrating-sportradars-sports-data-apis/)
- [API Rate Limit - Sportmonks](https://www.sportmonks.com/glossary/api-rate-limit/)
- [How RateLimit Works - API-Football](https://www.api-football.com/news/post/how-ratelimit-works)

**Real-Time Technologies:**
- [WebSockets vs Server-Sent Events vs Polling - RxDB](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html)
- [Polling vs Long Polling vs SSE vs WebSockets - Medium](https://medium.com/@niteshthakur498/polling-vs-long-polling-vs-sse-vs-websockets-the-deep-dive-behind-real-time-cricket-scores-51939ae6349a)

**UX and Performance:**
- [Are you losing sports customers through poor UX? - Ably](https://ably.com/blog/are-you-losing-sports-and-betting-customers-through-poor-ux)
- [7 Web Design Tricks Every Sports Website Should Use](https://customerthink.com/7-web-design-tricks-every-sports-website-should-use/)
- [What is a Scorebug? - KeepTheScore](https://keepthescore.com/blog/posts/score-bugs-in-live-sports-broadcasts/)
- [The Latency Debate in Live Sports - Dolby OptiView](https://optiview.dolby.com/resources/blog/sports/the-latency-debate-in-live-sports-consistency-vs-speed/)

**Caching and Data Strategies:**
- [Caching Strategies for APIs - Medium](https://medium.com/@vinaybilla2021/caching-strategies-for-apis-when-to-ttl-and-when-to-evict-8ce8dfcb3356)
- [Caching Best Practices - AWS](https://aws.amazon.com/caching/best-practices/)

**Free API Limitations:**
- [Top 6 Free Sports Data API Providers 2026](https://www.isportsapi.com/en/blog/others-2155-top-6-free-sports-data-api-providers:-a-curated-developer-guide-for-2026.html)
- [12 Best Free Sports API Options for Developers in 2025](https://www.sportsjobs.online/blogposts/43)
- [ESPN API - SportsAPIs.dev](https://sportsapis.dev/espn-api)

**Mobile Performance:**
- [Best Practices for Reducing App Battery Drain](https://www.sidekickinteractive.com/uncategorized/best-practices-for-reducing-app-battery-drain/)
- [How Background Apps Affect Device Performance](https://norwoodlight.com/how-background-apps-affect-your-device-performance/)
- [iPhone Background App Refresh Optimization](https://casebx.com/blogs/settings/iphone-background-app-refresh)

**Graceful Degradation:**
- [Graceful Degradation in Web Development - LogRocket](https://blog.logrocket.com/guide-graceful-degradation-web-development/)
- [Static Fallback Architecture - Medium](https://medium.com/@bhargava.akki/the-static-fallback-architecture-a-blueprint-for-graceful-degradation-e114263a7b10)

**Basketball Analytics:**
- [Introduction to Advanced Basketball Statistics - Northwestern](https://sites.northwestern.edu/nusportsanalytics/2020/12/22/an-introduction-to-advanced-basketball-statistics-individual-statistics/)
- [Advanced Basketball Statistics Formula Sheet](https://www.fromtherumbleseat.com/pages/advanced-basketball-statistics-formula-sheet)
- [Using AI to Correct Play-by-play Substitution Errors - SFU](https://summit.sfu.ca/item/17405)
- [NBA Play-by-Play Data - NBASstuffer](https://www.nbastuffer.com/analytics101/playbyplay-data/)

**Timezone Handling:**
- [How Should We Manage Time Zones - Medium](https://medium.com/insiderengineering/how-should-we-manage-time-zones-f62d4c49c3ad)
- [Dealing with Timezones in Web Development - DEV](https://dev.to/jesusantguerrero/dealing-with-timezones-in-web-development-2dgg)

**Vendor Lock-in:**
- [The Developer's Guide to API Vendor Lock-In - DEV](https://dev.to/apiverve/the-developers-guide-to-api-vendor-lock-in-139f)
- [Six Common Vendor Lock-in Traps in Data Platforms](https://www.5x.co/blogs/data-platforms-vendor-lock-in)

---

*Pitfalls research for: Basketball Live Scores Website*
*Researched: 2026-03-10*
*Confidence: HIGH - Based on official API provider documentation, real-time systems best practices, and domain-specific research*
