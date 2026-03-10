---
phase: 01-foundation-infrastructure
plan: 02
subsystem: api-abstraction
tags: [adapter-pattern, polling-strategy, domain-types, typescript]
dependency_graph:
  requires: [project-scaffold]
  provides: [sports-data-types, adapter-interface, game-state-machine]
  affects: [phase-02-live-scores]
tech_stack:
  added: [balldontlie-api]
  patterns: [adapter-pattern, state-machine, dependency-injection]
key_files:
  created:
    - src/types/sports-data.ts
    - src/lib/adapters/sports-api-adapter.ts
    - src/lib/adapters/balldontlie-adapter.ts
    - src/lib/adapters/index.ts
    - src/lib/game-state-machine.ts
  modified:
    - tsconfig.json
decisions:
  - title: Use adapter pattern for API abstraction
    rationale: Prevents vendor lock-in (Pitfall 7), enables <4hr provider swap
    alternatives: [direct-api-calls, graphql-gateway]
  - title: Adaptive polling by game state
    rationale: Reduces API calls 70-80%, prevents rate limit exhaustion (Pitfall 1)
    alternatives: [fixed-interval, websockets]
  - title: UTC-only internal storage
    rationale: Prevents timezone chaos (Pitfall 3), convert to local only for display
    alternatives: [store-local-time, mixed-timezones]
  - title: Record<GameState, number|null> for polling intervals
    rationale: Type-safe mapping ensures all states have defined intervals
    alternatives: [object-literal, switch-statement]
metrics:
  duration_seconds: 979
  tasks_completed: 3
  files_created: 5
  files_modified: 1
  commits: 4
  tests_added: 0
  completed_date: 2026-03-10
---

# Phase 1 Plan 2: API Abstraction Layer Summary

API abstraction with adapter pattern and intelligent polling - balldontlie.io adapter with state machine controlling poll frequency by game state

## What Was Built

Created a complete API abstraction layer that prevents vendor lock-in and implements adaptive polling to prevent rate limit exhaustion on free APIs.

**Core Components:**

1. **Normalized Domain Types** (`src/types/sports-data.ts`)
   - GameState enum with 6 states (SCHEDULED, LIVE, HALFTIME, FINAL, POSTPONED, CANCELLED)
   - Team, Score, and Game interfaces representing our domain model
   - UTC-first timezone approach documented in JSDoc comments

2. **Adapter Pattern** (`src/lib/adapters/`)
   - SportsDataAdapter interface with 3 methods (getLiveGames, getGame, getScheduledGames)
   - BalldontlieAdapter implementation with API response normalization
   - Barrel export with DefaultAdapter for easy provider swapping

3. **Game State Machine** (`src/lib/game-state-machine.ts`)
   - Adaptive polling intervals: 15s for live, 5min for scheduled, 2min for halftime
   - State transition validation to prevent invalid flows
   - Polling decision logic based on state and last poll time

**Phase 1 Note:** Network calls are stubbed (return empty arrays/throw errors). Actual HTTP implementation deferred to Phase 2 per plan specification.

## Implementation Details

### Type System
- All types are API-agnostic - no external API specifics leak into domain model
- GameState enum uses uppercase keys with lowercase values for consistency
- Record<GameState, number|null> ensures all states have defined polling intervals

### Adapter Architecture
- SportsDataAdapter interface defines contract for all providers
- BalldontlieAdapter includes mapping methods (mapToGame, mapStatus)
- Graceful degradation with empty arrays on errors
- Target: Developer can swap providers in under 4 hours

### State Machine Logic
- POLLING_INTERVALS constant defines intervals per state
- getPollingInterval returns null for terminal states (FINAL, CANCELLED)
- GameStateMachine class with:
  - determineState: Infer state from game data
  - validateTransition: Enforce logical state transitions
  - shouldPoll: Decide if polling needed based on interval

### Research Integration
- Adaptive polling reduces API calls by 70-80% (PITFALLS.md #1)
- Free APIs typically allow 10-30 req/min - fixed polling would exhaust quickly
- UTC-only storage prevents timezone chaos (PITFALLS.md #3)
- Adapter pattern prevents vendor lock-in (PITFALLS.md #7)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing baseUrl in tsconfig.json**
- **Found during:** Overall verification (build step)
- **Issue:** TypeScript couldn't resolve `@/*` path aliases without baseUrl
- **Fix:** Added `"baseUrl": "."` to tsconfig.json compilerOptions
- **Files modified:** tsconfig.json
- **Commit:** 6a6d75a

**2. [Rule 3 - Blocking] Type re-export violation in adapters/index.ts**
- **Found during:** Overall verification (build step)
- **Issue:** TypeScript error: "Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'"
- **Fix:** Changed `export { SportsDataAdapter }` to `export type { SportsDataAdapter }`
- **Files modified:** src/lib/adapters/index.ts
- **Commit:** 6a6d75a

**3. [Rule 1 - Bug] POLLING_INTERVALS type mismatch**
- **Found during:** Overall verification (build step)
- **Issue:** TypeScript couldn't index POLLING_INTERVALS with GameState enum values
- **Fix:** Changed from `as const` to `Record<GameState, number | null>` with computed property keys
- **Files modified:** src/lib/game-state-machine.ts
- **Commit:** 6a6d75a

All fixes were blocking compilation errors discovered during the final build verification. These are standard TypeScript configuration issues that must be resolved before code can be used.

## Verification Results

All success criteria met:

- [x] Domain types (Game, Team, Score, GameState) defined and exported
- [x] SportsDataAdapter interface abstracts external API providers
- [x] BalldontlieAdapter implements interface with normalization logic
- [x] Game state machine defines states and transition rules
- [x] Polling intervals configured by game state (adaptive polling)
- [x] UTC timezone handling documented in types
- [x] Code structured to swap API providers in <4 hours (adapter pattern)
- [x] Build passes with no TypeScript errors (`npm run build`)

## Key Files Reference

### Created
- **src/types/sports-data.ts** - Domain model types (GameState, Team, Score, Game)
- **src/lib/adapters/sports-api-adapter.ts** - Abstract adapter interface
- **src/lib/adapters/balldontlie-adapter.ts** - balldontlie.io implementation
- **src/lib/adapters/index.ts** - Barrel exports with DefaultAdapter
- **src/lib/game-state-machine.ts** - State machine and polling logic

### Modified
- **tsconfig.json** - Added baseUrl for path alias resolution

## Task Breakdown

| Task | Name | Status | Commit | Files |
|------|------|--------|--------|-------|
| 1 | Define normalized domain types | ✓ Complete | eaa6137 | src/types/sports-data.ts |
| 2 | Create adapter interface and balldontlie.io implementation | ✓ Complete | b70662c | src/lib/adapters/* (3 files) |
| 3 | Implement game state machine with adaptive polling logic | ✓ Complete | b56d9a8 | src/lib/game-state-machine.ts |
| - | Fix TypeScript compilation errors | ✓ Complete | 6a6d75a | tsconfig.json, adapters/index.ts, game-state-machine.ts |

## Dependencies

### Provides for Downstream
- **sports-data-types**: GameState enum, Team/Score/Game interfaces
- **adapter-interface**: SportsDataAdapter contract for API implementations
- **game-state-machine**: State management and polling interval logic

### Consumed By
- Phase 2: Live scores display will use these types and adapters
- Phase 3: Multi-league support will implement additional adapters
- Phase 4: Statistics will extend Game interface with detailed stats

## Next Steps

**Immediate (Phase 1 Plan 3):**
- Database schema for games, teams, scores
- Redis caching infrastructure with TTL support
- CI/CD pipeline with GitHub Actions → Vercel

**Future (Phase 2):**
- Implement actual HTTP calls in BalldontlieAdapter
- Add error handling and retry logic
- Create unit tests for state machine transitions
- Add integration tests for adapter implementations

## Self-Check

Verifying all created files exist on disk:

- ✓ FOUND: src/types/sports-data.ts
- ✓ FOUND: src/lib/adapters/sports-api-adapter.ts
- ✓ FOUND: src/lib/adapters/balldontlie-adapter.ts
- ✓ FOUND: src/lib/adapters/index.ts
- ✓ FOUND: src/lib/game-state-machine.ts

Verifying all commits exist in git history:

- ✓ FOUND: eaa6137 (Task 1: domain types)
- ✓ FOUND: b70662c (Task 2: adapters)
- ✓ FOUND: b56d9a8 (Task 3: state machine)
- ✓ FOUND: 6a6d75a (Fix: TypeScript errors)

## Self-Check: PASSED

All claimed files exist on disk and all commits exist in git history.
