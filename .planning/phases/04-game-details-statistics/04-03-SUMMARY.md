---
phase: 04-game-details-statistics
plan: 03
subsystem: ui
tags: [tanstack-table, react, player-stats, sorting, typescript]

# Dependency graph
requires:
  - phase: 04-00
    provides: Wave 0 test scaffold with RED tests for player stats table
  - phase: 04-01
    provides: GameDetailModal infrastructure with on-demand fetch
  - phase: 04-02
    provides: TeamStats interface and TeamStatsTable component
provides:
  - PlayerStats interface with all specified stats (points, rebounds, assists, shooting, minutes)
  - Realistic mock player data for all 3 league adapters (NBA, NCAA, EuroLeague)
  - PlayerStatsTable component with TanStack Table for sorting
  - Integrated player statistics display in GameDetailModal
affects: [04-04-historical-matchup, future-api-integration]

# Tech tracking
tech-stack:
  added: ["@tanstack/react-table"]
  patterns: ["made-attempted format for shooting stats", "#jerseyNumber lastName player name format", "DNP handling with 0:00 minutes", "visual team divider in unified table", "horizontal scroll wrapper for mobile"]

key-files:
  created:
    - src/components/player-stats-table.tsx
  modified:
    - src/types/sports-data.ts
    - src/lib/adapters/balldontlie-adapter.ts
    - src/lib/adapters/ncaa-adapter.ts
    - src/lib/adapters/euroleague-adapter.ts
    - src/components/game-detail-modal.tsx
    - tests/types/sports-data.test.ts
    - tests/components/player-stats-table.test.tsx

key-decisions:
  - "TanStack Table for sorting with built-in sortUndefined handling for DNP players"
  - "Unified table for both teams with visual divider (not separate tables)"
  - "Default sort by points descending to highlight top performers"
  - "Made-attempted format for shooting stats without percentage calculation"
  - "#jerseyNumber lastName format for player names (compact display)"
  - "Horizontal scroll wrapper for mobile to preserve all columns"

patterns-established:
  - "TanStack Table usage: useReactTable with getSortedRowModel for sortable columns"
  - "Made-attempted format: '8-15' displayed as string (not percentage)"
  - "Player name format: '#23 James' for compact display"
  - "Visual divider row: border-t-2 with team name centered"
  - "DNP handling: sortUndefined: 'last' to push 0:00 players to end when sorting"

requirements-completed: [STAT-03, STAT-04]

# Metrics
duration: 22min
completed: 2026-03-12
---

# Phase 04 Plan 03: Player Statistics Display Summary

**Sortable player statistics table with TanStack Table showing points, rebounds, assists, and shooting stats for both teams with made-attempted format**

## Performance

- **Duration:** 22 minutes (1303 seconds)
- **Started:** 2026-03-12T15:28:52Z
- **Completed:** 2026-03-12T15:50:35Z
- **Tasks:** 3
- **Files modified:** 7
- **Tests:** 51 passing (28 type tests + 10 component tests + 13 integration tests)

## Accomplishments
- Defined PlayerStats interface with all 12 required fields (jersey, name, minutes, stats)
- Populated realistic mock player rosters for all 3 leagues (10-12 players per team with DNP players)
- Built PlayerStatsTable component with TanStack Table for sortable columns
- Integrated player statistics display into GameDetailModal
- All columns sortable with default sort by points descending (highest scorers first)

## Task Commits

Each task was committed atomically following TDD RED-GREEN pattern:

1. **Task 1: Define PlayerStats interface and populate mock data** - `ac48acc` (feat)
2. **Task 2: Create PlayerStatsTable component with TanStack Table sorting** - `ceb9c8a` (feat)
3. **Task 3: Integrate PlayerStatsTable into GameDetailModal** - `84e333e` (feat)

## Files Created/Modified

### Created
- `src/components/player-stats-table.tsx` - Sortable table component using TanStack Table with 10 stat columns

### Modified
- `src/types/sports-data.ts` - Added PlayerStats interface with made-attempted shooting stat structure
- `src/lib/adapters/balldontlie-adapter.ts` - Added realistic NBA mock data (Lakers vs Celtics with 11 players per team)
- `src/lib/adapters/ncaa-adapter.ts` - Added realistic NCAA mock data (Duke vs UNC with 10 players per team)
- `src/lib/adapters/euroleague-adapter.ts` - Added realistic EuroLeague mock data (Real Madrid vs Barcelona with 10 players per team)
- `src/components/game-detail-modal.tsx` - Integrated PlayerStatsTable below team stats section
- `tests/types/sports-data.test.ts` - Added adapter tests for player stats verification
- `tests/components/player-stats-table.test.tsx` - Updated tests with homeTeam/awayTeam props

## Decisions Made

**TanStack Table for sorting**
- Built-in support for sortUndefined: 'last' handles DNP players elegantly
- getSortedRowModel provides efficient sorting without manual implementation
- sortDescFirst: true for stats where higher is better (points, rebounds, etc.)

**Unified table with visual divider**
- Single table for both teams maintains sort consistency across teams
- Visual divider row (border-t-2) clearly separates home from away
- Alternative of two separate tables would break cross-team sorting

**Made-attempted format without percentage**
- Display as "8-15" string (not calculated percentage)
- Matches basketball scoreboard conventions
- Avoids precision issues with percentage calculations

**Player name format: #jerseyNumber lastName**
- Compact format: "#23 James" instead of "LeBron James (#23)"
- Matches live broadcast graphics conventions
- Full firstName available in data for future enhancements

**Horizontal scroll wrapper**
- Preserves all 10 columns on mobile (no column hiding)
- Better UX than truncating stats or using accordion pattern
- overflow-x-auto class enables horizontal swipe on touch devices

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Test matcher issue with sort indicators**
- **Problem:** getByText('PTS') failed because header contains "PTS ▼" (sort indicator)
- **Resolution:** Updated tests to use regex pattern: getByText(/PTS/) instead of exact string match
- **Impact:** No functional change, tests now robust to sort indicators

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Player statistics display complete
- Historical matchup component ready for Plan 04 (already implemented in previous session)
- All 3 core sections of game detail modal now functional (team stats, player stats, historical)
- Ready for Phase 5 polish and performance optimization

---
*Phase: 04-game-details-statistics*
*Completed: 2026-03-12*
