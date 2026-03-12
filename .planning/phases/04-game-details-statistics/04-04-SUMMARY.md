---
phase: 04-game-details-statistics
plan: 04
subsystem: game-details
tags: [historical-matchup, rivalry-data, ui-component, tdd]
dependencies:
  requires: [04-00, 04-01, 04-02]
  provides: [historical-matchup-data, last-5-meetings, season-series, all-time-record]
  affects: [game-detail-modal, sports-data-types]
tech_stack:
  added: []
  patterns: [optional-fields-graceful-degradation, date-fns-formatting, rivalry-mock-data]
key_files:
  created:
    - src/components/historical-matchup.tsx
  modified:
    - src/types/sports-data.ts
    - src/lib/adapters/balldontlie-adapter.ts
    - src/lib/adapters/ncaa-adapter.ts
    - src/lib/adapters/euroleague-adapter.ts
    - src/components/game-detail-modal.tsx
    - tests/types/sports-data.test.ts
    - tests/components/historical-matchup.test.tsx
    - tests/integration/game-detail-modal.test.tsx
decisions:
  - title: All fields optional for graceful degradation
    rationale: Free APIs may not have historical data; optional fields allow component to degrade gracefully with fallback message
  - title: Bold winner indication instead of color
    rationale: Subtle visual indicator, avoids color accessibility issues, matches team stats table pattern
  - title: Realistic rivalry data for each league
    rationale: Lakers vs Celtics (NBA), Duke vs UNC (NCAA), Real Madrid vs Barcelona (EuroLeague) provide recognizable matchups for UI testing
  - title: Season series can be tied
    rationale: Handles edge case where teams have equal wins in current season (e.g., 1-1)
  - title: Historical section always present
    rationale: Honest about data limitations - show "unavailable" message rather than hiding feature entirely
metrics:
  duration: 959
  completed_date: 2026-03-12
  tasks_completed: 3
  files_modified: 9
  tests_added: 20
  commits: 6
---

# Phase 04 Plan 04: Historical Matchup Display Summary

**One-liner:** Historical head-to-head matchup display with last 5 meetings, season series record, and all-time record using date-fns formatting and optional fields for graceful degradation.

## What Was Built

Created complete historical matchup data display system showing users historical context for current matchups:

1. **HistoricalMatchup Interface** (Task 1):
   - Defined interface with 4 optional fields: lastFiveMeetings, seasonSeries, allTimeRecord, averageCombinedPoints
   - Last 5 meetings structure: date (ISO), team names, scores, winner indicator
   - Season series with wins/losses and leader ('home' | 'away' | 'tied')
   - All-time record with wins/losses and leader ('home' | 'away')
   - All fields optional to support graceful degradation when data unavailable

2. **Mock Rivalry Data in Adapters** (Task 1):
   - BalldontlieAdapter: Lakers vs Celtics rivalry (Celtics lead 163-127 all-time, Lakers lead 2-1 this season)
   - NcaaAdapter: Duke vs UNC rivalry (UNC leads 145-115 all-time, tied 1-1 this season)
   - EuroLeagueAdapter: Real Madrid vs Barcelona rivalry (Real Madrid leads 98-85 all-time, Barcelona leads 2-0 this season)
   - 5 recent meetings per rivalry with realistic dates and scores
   - Average combined points: 208 (NBA), 150 (NCAA), 165 (EuroLeague)

3. **HistoricalMatchup Component** (Task 2):
   - Displays last 5 meetings in list format (date, teams, scores, winner)
   - Date formatting using date-fns: format(new Date(date), 'MMM d, yyyy')
   - Bold winning team name for each meeting
   - Season series summary: "Team leads X-Y" or "Tied X-X"
   - All-time record summary: "Team leads X-Y all-time"
   - Average combined points display
   - Fallback message "Historical data unavailable" when data is null/undefined or empty
   - 115 lines of implementation

4. **Integration into GameDetailModal** (Task 3):
   - Added "Historical Matchup" section heading after team stats
   - Always renders HistoricalMatchup component (shows fallback if data unavailable)
   - Removed placeholder text for historical data
   - Section placed at bottom of modal after player stats
   - Maintains SSE connection while modal open

## Requirements Met

- **HIST-03**: User can access historical head-to-head data showing last 5 meetings between two teams
- **HIST-04**: User can view last 5 meetings with dates, scores, and winners

## Tests Added

**20 tests added (all passing):**
- 4 tests for HistoricalMatchup interface structure (types/sports-data.test.ts)
- 13 tests for HistoricalMatchup component (components/historical-matchup.test.tsx):
  - Last 5 meetings display with formatted dates
  - Team names and scores display
  - Winner indication (bold)
  - Season series summary (including tied scenario)
  - All-time record summary
  - Average combined points display
  - 4 fallback scenarios (null, undefined, empty array, undefined lastFiveMeetings)
- 3 integration tests (integration/game-detail-modal.test.tsx):
  - Historical matchup section appears in modal
  - Season series summary appears
  - All-time record summary appears

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

1. **Optional fields for graceful degradation**: All HistoricalMatchup fields are optional. Component checks `!data || !data.lastFiveMeetings || data.lastFiveMeetings.length === 0` to show fallback message. Ensures honest communication about data availability.

2. **Bold winner indication**: Winner's team name is bolded in each meeting (e.g., `<span className={meeting.homeTeam === winnerName ? 'font-bold' : ''}>`). Subtle visual indicator, avoids color accessibility issues, matches pattern from TeamStatsTable.

3. **Date formatting with date-fns**: Using `format(new Date(meeting.date), 'MMM d, yyyy')` produces readable dates like "Mar 1, 2026". Library already installed in Phase 3 for timezone handling.

4. **Tied season series support**: Leader can be 'home' | 'away' | 'tied'. Component handles tied scenario: "Tied 1-1". Edge case tested explicitly.

5. **Realistic rivalry data**: Lakers vs Celtics, Duke vs UNC, Real Madrid vs Barcelona provide recognizable matchups for UI testing. Mock data follows realistic patterns (alternating wins, realistic scores, proper date ordering).

6. **Section always present**: Historical Matchup section always rendered (not conditionally hidden). Shows "Historical data unavailable" message when data is missing. Honest about limitations per CONTEXT.md decision.

## Files Modified

**Created:**
- `src/components/historical-matchup.tsx` (115 lines) - Component implementation

**Modified:**
- `src/types/sports-data.ts` - HistoricalMatchup interface definition (42 lines added)
- `src/lib/adapters/balldontlie-adapter.ts` - Lakers vs Celtics mock data (48 lines)
- `src/lib/adapters/ncaa-adapter.ts` - Duke vs UNC mock data (48 lines)
- `src/lib/adapters/euroleague-adapter.ts` - Real Madrid vs Barcelona mock data (48 lines)
- `src/components/game-detail-modal.tsx` - Integration (12 lines modified)
- `tests/types/sports-data.test.ts` - Interface tests (75 lines added)
- `tests/components/historical-matchup.test.tsx` - Component tests (75 lines added)
- `tests/integration/game-detail-modal.test.tsx` - Integration tests (49 lines added)

**Total: 512 lines added/modified across 9 files**

## Commits

1. `b84d827` - test(04-04): add failing tests for HistoricalMatchup interface
2. `2c3520f` - feat(04-04): define HistoricalMatchup interface and populate adapters
3. `070ee1f` - test(04-04): add failing tests for HistoricalMatchup component
4. `ea217ea` - feat(04-04): create HistoricalMatchup component
5. `87d4aaf` - test(04-04): add RED tests for historical matchup integration
6. `ca55d8f` - feat(04-04): integrate HistoricalMatchup into GameDetailModal

## What's Next

Phase 04 Plan 04 complete. Next: Phase 05 or return to Plan 03 for player stats implementation.

HistoricalMatchup now displays:
- Last 5 meetings with dates, scores, and winners
- Season series record (e.g., "Lakers leads 2-1" or "Tied 1-1")
- All-time head-to-head record
- Average combined points per matchup
- Honest fallback message when data unavailable

## Self-Check: PASSED

**Files exist:**
```bash
FOUND: src/components/historical-matchup.tsx
FOUND: src/types/sports-data.ts
FOUND: src/lib/adapters/balldontlie-adapter.ts
FOUND: src/lib/adapters/ncaa-adapter.ts
FOUND: src/lib/adapters/euroleague-adapter.ts
FOUND: src/components/game-detail-modal.tsx
```

**Commits exist:**
```bash
FOUND: b84d827
FOUND: 2c3520f
FOUND: 070ee1f
FOUND: ea217ea
FOUND: 87d4aaf
FOUND: ca55d8f
```

**Tests pass:**
```bash
✓ 20 tests passing (HistoricalMatchup interface, component, integration)
✓ All 3 tasks completed with TDD RED-GREEN cycle
✓ Integration tests verify full flow (modal → historical section → data display)
```
