---
phase: 02-live-scores-display
plan: 04
subsystem: live-scores-ui
tags: [gap-closure, ui-feature, tdd, fouls-display]
dependency_graph:
  requires: [02-02-SUMMARY.md, 02-03-SUMMARY.md]
  provides: [team-fouls-display, LIVE-05-implementation]
  affects: [game-card-component, sports-data-types, balldontlie-adapter]
tech_stack:
  added: [TeamFouls interface]
  patterns: [optional-field-graceful-degradation, conditional-rendering]
key_files:
  created:
    - tests/types/sports-data.test.ts
    - tests/lib/adapters/balldontlie-adapter.test.ts
  modified:
    - src/types/sports-data.ts
    - src/components/game-card.tsx
    - src/lib/adapters/balldontlie-adapter.ts
    - tests/components/game-card.test.tsx
decisions:
  - title: TeamFouls as separate interface
    rationale: Follows existing pattern (Score interface); enables type reuse; clear separation of concerns
  - title: Optional teamFouls field on Game
    rationale: Free APIs may not provide fouls data; graceful degradation per CONTEXT.md decisions
  - title: Display format "Fouls H-A"
    rationale: Matches period display style (Q1 Q2); clear distinction using hyphen separator per basketball conventions
  - title: Show fouls only for LIVE/HALFTIME
    rationale: Fouls are live game context; not relevant for final or scheduled games
  - title: Mock fouls range 0-6
    rationale: Realistic values before bonus situation (teams enter bonus at 5 fouls per quarter in NBA)
metrics:
  duration: 409s
  tasks_completed: 3
  files_created: 2
  files_modified: 4
  tests_added: 15
  completed: 2026-03-11T15:27:19Z
---

# Phase 02 Plan 04: Team Fouls Display Summary

**One-liner:** Team fouls display integrated into live game cards with optional field pattern and "Fouls: H-A" format.

## Overview

Closed verification gap LIVE-05 ("User sees team fouls displayed for each team") identified during Phase 02 verification. Implemented complete team fouls feature from data model through UI display using TDD methodology.

## What Was Built

### 1. Data Model Extension
- Added `TeamFouls` interface to `sports-data.ts` with `home` and `away` number fields
- Extended `Game` interface with optional `teamFouls?: TeamFouls` field
- Followed existing pattern (Score interface structure)

### 2. UI Component Enhancement
- Updated `GameCard` component to display fouls in game context section
- Conditional rendering: shows only for LIVE/HALFTIME states when `teamFouls` exists
- Format: "Fouls: 3-2" (home-away) matching period display style
- Positioned alongside quarter/time on same line

### 3. Mock Data Generator Update
- Modified `BalldontlieAdapter.getLiveGames()` to populate `teamFouls` field
- Generates random values 0-6 for LIVE/HALFTIME games (realistic pre-bonus range)
- Returns `undefined` for FINAL/SCHEDULED games (graceful degradation)
- Supports UI development before Phase 3 API integration

## Test Coverage

Added 15 tests across 3 test suites following TDD (RED-GREEN) pattern:

**Type Tests (5 tests):**
- TeamFouls interface structure validation
- Game interface accepts optional teamFouls
- TypeScript compilation verification

**Component Tests (5 new tests):**
- Fouls display for LIVE games with teamFouls
- Fouls display for HALFTIME games with teamFouls
- Graceful handling of missing teamFouls
- No fouls display for FINAL games
- Correct format "Fouls: H-A"

**Adapter Tests (5 tests):**
- LIVE games include teamFouls
- HALFTIME games include teamFouls
- FINAL games have undefined teamFouls
- SCHEDULED games have undefined teamFouls
- Realistic fouls values (0-6 range)

**Regression verification:** All 84 tests passing (no regressions).

## Implementation Approach

### TDD Execution Flow
Each task followed strict RED-GREEN pattern:
1. **Task 1:** Type tests → TeamFouls interface implementation
2. **Task 2:** GameCard tests → Fouls display implementation
3. **Task 3:** Adapter tests → Mock data population

### Graceful Degradation Strategy
- `teamFouls` field is optional (not all APIs provide this data)
- Component checks `game.teamFouls` existence before rendering
- Undefined fouls = no visual element (clean UI, no errors)
- Consistent with CONTEXT.md's free API constraints

## Key Design Decisions

### 1. Why "Fouls: H-A" format?
- **Simple and clear:** Matches quarter display (Q1, Q2)
- **Basketball convention:** Hyphen separator standard for dual stats
- **Compact:** Fits game context section without crowding
- **Readable:** Home-away order matches score display

### 2. Why show only for LIVE/HALFTIME?
- **Relevance:** Fouls matter during active gameplay
- **Context:** Final/scheduled games don't need live context stats
- **Consistency:** Matches period/time visibility logic

### 3. Why optional field pattern?
- **API constraints:** Free APIs (balldontlie.io) may not provide fouls
- **Fail gracefully:** Missing data shouldn't break UI
- **Future-proof:** Easy to add when real API supports it

## Gap Closure Details

**Original Issue (VERIFICATION.md truth #24):**
> "User sees team fouls displayed for each team during live games"

**Resolution:**
- TeamFouls interface: ✓ Complete
- Game.teamFouls field: ✓ Complete
- GameCard fouls display: ✓ Complete
- Adapter mock data: ✓ Complete
- Test coverage: ✓ Complete (15 tests)
- LIVE-05 requirement: ✓ Satisfied

## Integration with Existing System

### Touched Components
- **sports-data.ts:** Added TeamFouls interface, extended Game interface
- **game-card.tsx:** Added conditional fouls display in game context section
- **balldontlie-adapter.ts:** Extended mock data generator with teamFouls

### No Breaking Changes
- All existing tests pass (84/84)
- Optional field pattern ensures backward compatibility
- Graceful degradation when teamFouls missing

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

| File | Changes | Lines Modified |
|------|---------|----------------|
| src/types/sports-data.ts | Added TeamFouls interface, extended Game | +13 |
| src/components/game-card.tsx | Added fouls conditional rendering | +4 |
| src/lib/adapters/balldontlie-adapter.ts | Added teamFouls to mock data generator | +44/-10 |
| tests/types/sports-data.test.ts | Created type validation tests | +86 (new) |
| tests/components/game-card.test.tsx | Added 5 fouls display tests | +79 |
| tests/lib/adapters/balldontlie-adapter.test.ts | Created adapter fouls tests | +87 (new) |

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 61738c8 | test | Add failing test for TeamFouls interface |
| e507095 | test | Add failing tests for team fouls display in GameCard |
| 60eeec3 | feat | Implement team fouls display in GameCard |
| 021e8de | test | Add tests for teamFouls in adapter mock data |
| cd610e2 | feat | Populate teamFouls in adapter mock data |

## What's Next

**Phase 3 Integration:**
When real API integration happens (Phase 3):
1. Verify API provides fouls data in response
2. Update `mapToGame()` to extract fouls from API response
3. If API doesn't provide fouls, keep `teamFouls: undefined` (graceful degradation)
4. Tests already validate both cases (with/without fouls)

**No further work needed for this feature** - gap closed, requirement satisfied, tests passing.

## Verification Status

- [x] TeamFouls interface exists in sports-data.ts
- [x] Game.teamFouls field is optional
- [x] GameCard displays "Fouls: H-A" for LIVE/HALFTIME games
- [x] GameCard gracefully handles missing teamFouls
- [x] Adapter populates teamFouls for LIVE/HALFTIME mock games
- [x] All existing tests passing (no regressions)
- [x] 15 new tests validate fouls behavior
- [x] TypeScript build succeeds (no new errors)
- [x] LIVE-05 requirement satisfied

## Self-Check: PASSED

**Created files verified:**
- FOUND: tests/types/sports-data.test.ts
- FOUND: tests/lib/adapters/balldontlie-adapter.test.ts

**Commits verified:**
- FOUND: 61738c8 (test - TeamFouls interface)
- FOUND: e507095 (test - GameCard fouls tests)
- FOUND: 60eeec3 (feat - GameCard fouls display)
- FOUND: 021e8de (test - Adapter fouls tests)
- FOUND: cd610e2 (feat - Adapter fouls mock data)

**Modified files verified:**
- src/types/sports-data.ts (TeamFouls interface added)
- src/components/game-card.tsx (fouls display added)
- src/lib/adapters/balldontlie-adapter.ts (mock data updated)
- tests/components/game-card.test.tsx (5 tests added)

All files, commits, and modifications present and correct.
