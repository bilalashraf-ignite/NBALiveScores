---
phase: 04-game-details-statistics
status: context-captured
created: 2026-03-12
discussion_rounds: 4
areas_discussed:
  - Game detail page structure
  - Team statistics display
  - Player statistics display
  - Historical matchup data
---

# Phase 04: Game Details & Statistics - Context

**Phase Goal:** Users can access comprehensive team and player statistics for live games plus historical matchup context

**Requirements:** HIST-03, HIST-04, STAT-01, STAT-02, STAT-03, STAT-04, STAT-05

**Prior Phase Context:**
- Phase 1: API adapter pattern with BaseAdapter, Redis caching infrastructure
- Phase 2: SSE streaming, GameCard component, home page with real-time updates
- Phase 3: Multi-league support (NBA, NCAA, EuroLeague), league filtering, timezone handling

## Locked Decisions

### 1. Game Detail Page Structure

**Navigation Pattern: Modal/Overlay Popup**
- URL does not change when opening game details
- Modal overlays on top of home page
- Maintains SSE connection to home page in background
- User stays on home page context

**Modal Dismissal Methods:**
- X button in top-right corner (primary method)
- Click outside modal on backdrop area
- ESC key press
- Browser back button (requires history.pushState)

**Content Layout:**
- Single scrollable modal container (no tabs)
- All information visible in scroll order:
  1. Current score + game status (top)
  2. Team statistics comparison table
  3. Top performers highlight
  4. Full player statistics table
  5. Historical matchup data (bottom)

**Modal Animation:**
- Fade in + scale up from center
- Smooth, modern feel
- No slide/sheet animations

**SSE Connection Behavior:**
- Keep SSE active while modal open
- Home page updates in background
- When modal closes, home page reflects latest data
- No need to re-fetch or resume connection

**Code Context:**
```typescript
// Existing patterns from prior phases
src/components/game-card.tsx          // Card click handler will open modal
src/hooks/use-live-scores.ts          // SSE connection stays active
src/app/page.tsx                      // Modal state management here
```

**Rationale:**
- Modal keeps user on home page, maintains SSE connection without reconnection logic
- Multiple dismissal methods improve accessibility (keyboard, mouse, touch)
- Single scroll container is simplest for mobile, avoids tab complexity with so much data
- Background updates prevent stale data when modal closes

---

### 2. Team Statistics Display

**Statistics to Display:**
- Shooting stats: FG%, 3P%, FT%
- Rebounds: Offensive, Defensive, Total (all three breakdowns)
- Assists and turnovers
- Steals and blocks

**Data Scope:**
- Current game only (no season averages)
- Game totals only (no quarter-by-quarter breakdown)

**Format:**
- Side-by-side comparison table (3 columns: Home | Stat Name | Away)
- Shooting stats: Made-Attempted + Percentage format (e.g., "33/68, 48.5%")
- Rebound labels: Full words (Offensive/Defensive/Total), not abbreviations
- Bold the better stat value (no color coding)

**Stat Order:**
1. FG% (Field Goal Percentage)
2. 3P% (Three-Point Percentage)
3. FT% (Free Throw Percentage)
4. Assists
5. Turnovers
6. Offensive Rebounds
7. Defensive Rebounds
8. Total Rebounds
9. Steals
10. Blocks

**Scroll Behavior:**
- Team stats table scrolls away naturally
- Not sticky/fixed while viewing player stats below

**Code Context:**
```typescript
// Existing patterns from prior phases
src/types/sports-data.ts              // Extend with TeamStats interface
src/lib/adapters/base-adapter.ts      // getGameDetails() method needed

// New structure needed:
interface TeamStats {
  fieldGoals: { made: number; attempted: number; percentage: number }
  threePointers: { made: number; attempted: number; percentage: number }
  freeThrows: { made: number; attempted: number; percentage: number }
  assists: number
  turnovers: number
  reboundsOffensive: number
  reboundsDefensive: number
  reboundsTotal: number
  steals: number
  blocks: number
}
```

**Rationale:**
- Comprehensive stats cover all major basketball performance dimensions
- Current game only simplifies API requirements (many free APIs don't have season averages)
- Made/Attempted + Percentage provides both context (shot volume) and efficiency
- Full words for rebounds improves accessibility for casual fans
- Bold highlighting is subtle but effective, avoids color accessibility issues
- Offense-first order follows natural basketball storytelling (scoring → playmaking → defense)

---

### 3. Player Statistics Display

**Statistics to Display:**
- Basic scoring: Points, FG, 3P, FT
- Rebounds and assists
- Defensive stats: Steals, Blocks
- Minutes played

**Table Organization:**
- Both teams in one table, separated by visual divider
- Home team players first, divider line, then away team players
- Single scrollable container

**Default Sort Order:**
- By points scored (highest first)
- Leading scorers from both teams appear at top

**Interactive Features:**
- Sortable columns (click header to re-sort)
- User can sort by any stat column (PTS, REB, AST, etc.)

**Format:**
- Shooting stats: Made-Attempted format (e.g., "8-15 FG, 2-5 3P, 4-4 FT")
- Player names: Jersey number + last name (e.g., "#23 James")
- DNP players: Show with 0:00 minutes (include in table with zero stats)

**Mobile Handling:**
- Horizontal scroll for wide table
- All columns remain visible (no responsive hiding)

**Code Context:**
```typescript
// Existing patterns from prior phases
src/components/game-card.tsx          // Click handler opens modal with game.id

// New structure needed:
interface PlayerStats {
  jerseyNumber: string
  lastName: string
  firstName: string  // For full name on hover/accessibility
  minutes: string    // Format: "32:15"
  points: number
  fieldGoals: { made: number; attempted: number }
  threePointers: { made: number; attempted: number }
  freeThrows: { made: number; attempted: number }
  rebounds: number
  assists: number
  steals: number
  blocks: number
}
```

**Rationale:**
- Comprehensive stats match traditional basketball box score
- Single table with divider is easier to scan than tabs, enables cross-team comparison
- Points-first sort highlights game's top performers immediately
- Sortable columns allow users to explore (find rebound leader, assist leader, etc.)
- Made-Attempted format is compact, standard for box scores
- Jersey number + last name is most compact while remaining recognizable
- Including DNP players shows full roster (transparency, completeness)
- Horizontal scroll is standard mobile pattern for wide tables, preserves all data

---

### 4. Historical Matchup Data

**Data to Display:**
- Last 5 meetings results (date, score, winner) — HIST-04
- Season series record (e.g., "Team A leads 2-1 this season")
- Head-to-head all-time record (e.g., "Team A leads 45-32 all-time")
- Average combined points per matchup

**Display Format:**
- Simple list for last 5 meetings (Date, Score, Winner)
- Text summary for season series and all-time record
- Placement: At the bottom of modal after all stats

**Fallback Strategy:**
- If historical data unavailable: Show "Historical data unavailable" message
- Section always present, but with placeholder text if no data
- Honest about data limitations

**Code Context:**
```typescript
// New structure needed:
interface HistoricalMatchup {
  lastFiveMeetings: Array<{
    date: string          // ISO date
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    winner: 'home' | 'away'
  }>
  seasonSeries?: {
    wins: number
    losses: number
    leader: 'home' | 'away' | 'tied'
  }
  allTimeRecord?: {
    wins: number
    losses: number
    leader: 'home' | 'away'
  }
  averageCombinedPoints?: number
}
```

**Rationale:**
- Last 5 meetings provides recent context without overwhelming (HIST-04 requirement)
- Season series is most relevant for ongoing rivalry storyline
- All-time record adds depth for long-standing matchups
- Average points gives scoring trend context (high/low scoring matchups)
- Bottom placement treats history as supplemental context, not primary info
- Simple list format is scannable, doesn't compete visually with current game stats
- Honest "unavailable" message better than hiding feature or showing nothing

---

### 5. Implementation Strategy

**Data Strategy:**
- Use mock data for Phase 4 UI implementation
- Defer real API integration (similar to Phase 3 NCAA/EuroLeague approach)
- Document expected API endpoints and data contracts
- Real API integration can happen after UI is built and tested

**Game State Support:**
- LIVE games: Full stats available (team + player + historical)
- FINAL games: Full stats available (team + player + historical)
- SCHEDULED games: Modal not available (no stats yet)
- Click handler on GameCard should check game.status before opening modal

**Data Model:**
- Create separate `GameDetails` interface (does not extend `Game`)
- `Game` interface remains lightweight for list view
- `GameDetails` includes full team stats, player stats, historical data
- Fetch GameDetails on-demand when modal opens

**Code Structure:**
```typescript
// src/types/sports-data.ts
export interface Game {
  // Existing fields (unchanged)
  id: string
  league: League
  homeTeam: Team
  awayTeam: Team
  status: GameStatus
  // ... etc
}

export interface GameDetails {
  gameId: string
  league: League
  homeTeam: Team
  awayTeam: Team
  status: GameStatus
  score: Score
  gameContext?: GameContext
  teamFouls?: TeamFouls
  teamStats: {
    home: TeamStats
    away: TeamStats
  }
  playerStats: {
    home: PlayerStats[]
    away: PlayerStats[]
  }
  historicalMatchup: HistoricalMatchup
}

// src/lib/adapters/base-adapter.ts
abstract class BaseAdapter {
  abstract getLiveGames(league: League): Promise<Game[]>
  abstract getScheduledGames(league: League): Promise<Game[]>
  abstract getGameDetails(gameId: string, league: League): Promise<GameDetails>  // NEW
}
```

**Rationale:**
- Mock data approach de-risks API availability concerns, lets us build complete UI
- LIVE + FINAL only makes sense (scheduled games have no stats)
- Separate GameDetails interface keeps Game lightweight, avoids fetching unnecessary data for list view
- On-demand fetch means we only load detailed stats when user opens modal
- Maintains adapter pattern from Phase 1, consistent with prior architecture

---

## Gray Areas for Planning Phase

**Minimal gray areas remain:**

1. **Modal Component Library:** Use Radix UI Dialog (already in use for accessibility) or build custom modal?
   - Radix UI Dialog recommended (accessibility built-in, focus trap, ESC/outside click handling)
   - Custom modal requires reimplementing all accessibility features

2. **Stat Abbreviations:** Use standard basketball abbreviations (FG, 3P, FT, REB, AST, STL, BLK) or spell out?
   - Decision: Use abbreviations in table headers (space-constrained)
   - Provide aria-label for accessibility (e.g., aria-label="Field Goals")

3. **Empty State:** What if a game has no player stats data (free API limitation)?
   - Show team stats + "Player statistics unavailable" message
   - Historical data section functions independently

4. **Loading State:** How to handle delay fetching GameDetails when modal opens?
   - Show skeleton loader inside modal while fetching
   - Reuse existing SkeletonCard pattern from Phase 2

---

## Integration Points

**From Phase 2:**
- `src/components/game-card.tsx` — Add onClick handler to open modal
- `src/hooks/use-live-scores.ts` — SSE continues running while modal open
- `src/components/game-list.tsx` — No changes needed (modal is separate)

**From Phase 3:**
- Multi-league support already in place (NBA, NCAA, EuroLeague)
- getGameDetails() will accept league parameter
- Historical matchup data fetched per-league

**New Components Needed:**
- `src/components/game-detail-modal.tsx` — Main modal component
- `src/components/team-stats-table.tsx` — Team comparison table
- `src/components/player-stats-table.tsx` — Player stats with sorting
- `src/components/historical-matchup.tsx` — Last 5 games display
- `src/hooks/use-game-details.ts` — Fetch hook for GameDetails data

**Testing Strategy:**
- TDD approach continues (RED-GREEN pattern)
- Mock GameDetails data in tests
- Test modal open/close interactions
- Test column sorting logic
- Test empty/unavailable states

---

## Open Questions for Planner

1. **Task Breakdown:** Should Phase 4 be 3 plans (modal + team stats, player stats, historical data) or 4 plans?
2. **Radix UI Installation:** Need to install @radix-ui/react-dialog if not already present
3. **Test Coverage:** Aim for similar coverage as Phase 2/3 (20-40 tests per plan)?
4. **Commit Strategy:** Continue TDD RED-GREEN pattern or switch to task-based commits?

---

## Success Criteria (from ROADMAP.md)

1. User can expand live game to view team statistics (field goal %, rebounds, assists, turnovers)
2. User can view individual player statistics (points, rebounds, assists) during live games
3. User can access historical head-to-head data showing last 5 meetings between two teams
4. User navigates from home page game card to detailed game view with full statistics

**Verification Plan:**
- Success criteria 1: Team stats table visible in modal with all specified stats
- Success criteria 2: Player stats table visible with points, rebounds, assists (sortable)
- Success criteria 3: Historical section shows last 5 meetings with dates and scores
- Success criteria 4: Click game card → modal opens with details

---

*Context captured: 2026-03-12*
*Discussion rounds: 4 areas (Game detail structure, Team stats, Player stats, Historical data)*
*Ready for planning phase*
