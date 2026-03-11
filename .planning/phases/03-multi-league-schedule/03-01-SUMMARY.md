---
phase: 03-multi-league-schedule
plan: 01
subsystem: data-layer
tags: [adapters, multi-league, parallel-fetching, BaseAdapter, SSE]
dependency_graph:
  requires: [phase-01-PLAN-03, phase-02-PLAN-01]
  provides: [multi-league-adapter-architecture, parallel-fetch-pattern]
  affects: [SSE-endpoint, adapter-pattern]
tech_stack:
  added: [NcaaAdapter, EuroLeagueAdapter, BaseAdapter]
  patterns: [adapter-inheritance, Promise.allSettled, singleton-factory]
key_files:
  created:
    - src/lib/adapters/base-adapter.ts
    - src/lib/adapters/ncaa-adapter.ts
    - src/lib/adapters/euroleague-adapter.ts
    - tests/lib/adapters/base-adapter.test.ts
    - tests/lib/adapters/ncaa-adapter.test.ts
    - tests/lib/adapters/euroleague-adapter.test.ts
    - tests/lib/adapters/index.test.ts
  modified:
    - src/types/sports-data.ts
    - src/lib/adapters/balldontlie-adapter.ts
    - src/lib/adapters/index.ts
    - src/app/api/scores/live/route.ts
    - tests/types/sports-data.test.ts
    - tests/api/scores-live.test.ts
decisions:
  - title: BaseAdapter abstract class for shared logic
    rationale: Avoids code duplication across league adapters; ensures consistent caching and error handling
  - title: Promise.allSettled for parallel fetching
    rationale: Fault tolerance - one failing API doesn't block others from loading
  - title: Singleton factory pattern for adapters
    rationale: Ensures consistent caching across application; prevents multiple adapter instances
  - title: League field as union type not enum
    rationale: Type union ('NBA' | 'NCAA' | 'EuroLeague') provides better type safety than string enum
  - title: Mock data for Phase 3 adapters
    rationale: Real API integration deferred until auth keys configured; enables UI development
metrics:
  duration: 1903s
  tasks_completed: 3
  files_created: 7
  files_modified: 6
  tests_added: 43
  tests_passing: 116
  commits: 6
  completed_date: "2026-03-11"
---

# Phase 03 Plan 01: Multi-League Adapter Architecture Summary

Multi-league adapter architecture with BaseAdapter inheritance, NCAA and EuroLeague adapters, parallel SSE fetching using Promise.allSettled for fault-tolerant multi-API data aggregation.

## What Was Built

Implemented complete multi-league support infrastructure enabling NBA, NCAA, and EuroLeague games to be fetched in parallel with fault tolerance:

1. **League Type & Game Extension**
   - Added `League` type as union: `'NBA' | 'NCAA' | 'EuroLeague'`
   - Extended `Game` interface with required `league: League` field
   - Ensures type-safe league identification across codebase

2. **BaseAdapter Abstract Class**
   - Created shared infrastructure for all league adapters
   - Implements `fetchWithCache<T>()` method for cache-first strategy
   - Provides `handleError()` with league-prefixed error messages
   - Reduces code duplication from ~60 lines to ~10 lines per adapter

3. **League-Specific Adapters**
   - **NcaaAdapter**: Extends BaseAdapter, returns mock NCAA games with league='NCAA'
   - **EuroLeagueAdapter**: Extends BaseAdapter, returns mock EuroLeague games with league='EuroLeague'
   - **BalldontlieAdapter**: Refactored to extend BaseAdapter, adds league='NBA' to games
   - All adapters implement `SportsDataAdapter` interface for consistency

4. **Adapter Factory Function**
   - Implemented `getAdapter(league: League): SportsDataAdapter`
   - Singleton pattern ensures single adapter instance per league
   - Type-safe factory with compile-time league validation
   - Backward compatibility maintained with `export const adapter` for existing code

5. **Multi-League SSE Endpoint**
   - Implemented `fetchAllLeagues()` with parallel Promise.allSettled calls
   - Fetches from NBA, NCAA, and EuroLeague simultaneously
   - Per-league error tracking with separate SSE error events
   - One league failure doesn't prevent others from loading
   - Combined games array from all successful fetches

## Test Coverage

### Task 1: League Type & BaseAdapter
- **Tests Added**: 18 tests
- **Files**: `tests/lib/adapters/base-adapter.test.ts`, `tests/types/sports-data.test.ts`
- **Coverage**:
  - League type validates 'NBA', 'NCAA', 'EuroLeague'
  - Game.league field requirement enforced
  - BaseAdapter.fetchWithCache() cache-first strategy
  - Cache hit/miss behavior verified
  - Error handling with league prefixes

### Task 2: Multi-League Adapters
- **Tests Added**: 18 tests
- **Files**: `tests/lib/adapters/ncaa-adapter.test.ts`, `tests/lib/adapters/euroleague-adapter.test.ts`, `tests/lib/adapters/index.test.ts`
- **Coverage**:
  - NCAA adapter returns games with league='NCAA'
  - EuroLeague adapter returns games with league='EuroLeague'
  - Factory function returns correct adapter per league
  - Singleton pattern verified
  - Backward compatibility maintained

### Task 3: Parallel SSE Fetching
- **Tests Added**: 6 tests (replaced 5 legacy tests)
- **Files**: `tests/api/scores-live.test.ts`
- **Coverage**:
  - Parallel fetching from all three leagues
  - Promise.allSettled fault tolerance
  - Partial failures (one league fails, others succeed)
  - Combined games array with correct league fields
  - Graceful degradation when all leagues fail

### Overall Test Results
- **Total Tests**: 116/116 passing (43 new, 73 existing)
- **No Regressions**: All existing tests continue to pass
- **TDD Compliance**: All tasks followed RED-GREEN-REFACTOR pattern

## Commits

1. `a566af9` - test(03-01): add failing tests for League type and BaseAdapter (RED)
2. `a1cd5b1` - feat(03-01): implement League type and BaseAdapter with shared logic (GREEN)
3. `8e23925` - test(03-01): add failing tests for NCAA, EuroLeague adapters and factory (RED)
4. `73160a5` - feat(03-01): implement NCAA, EuroLeague adapters and factory function (GREEN)
5. `9570186` - test(03-01): add failing tests for multi-league SSE endpoint (RED)
6. `9fd6594` - feat(03-01): implement parallel multi-league SSE streaming (GREEN)

## Deviations from Plan

None - plan executed exactly as written. All must-have truths, artifacts, and key links delivered.

## Key Technical Decisions

### 1. BaseAdapter Inheritance Pattern
**Decision**: Created abstract `BaseAdapter` class with shared cache and error handling logic.

**Why**:
- Eliminates code duplication (each adapter would otherwise need ~60 lines of cache logic)
- Ensures consistent behavior across all league adapters
- Single source of truth for infrastructure concerns

**Implementation**:
```typescript
export abstract class BaseAdapter {
  protected abstract league: League;
  protected abstract baseUrl: string;

  protected async fetchWithCache<T>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Cache-first strategy
  }
}
```

### 2. Promise.allSettled for Parallel Fetching
**Decision**: Used `Promise.allSettled()` instead of `Promise.all()` for multi-league fetching.

**Why**:
- Fault tolerance: one failing API doesn't block others
- Shows available games even if some leagues are down
- Better UX: partial data > no data

**Impact**: Users see NBA games even if NCAA API is temporarily down.

### 3. Singleton Factory Pattern
**Decision**: `getAdapter()` returns singleton instances stored in module-level `adapters` object.

**Why**:
- Consistent caching: same adapter instance = same cache behavior
- Memory efficiency: one instance per league, not per call
- Simplified testing: can replace singleton for mocking

**Pattern**:
```typescript
const adapters: Record<League, SportsDataAdapter> = {
  NBA: new BalldontlieAdapter(),
  NCAA: new NcaaAdapter(),
  EuroLeague: new EuroLeagueAdapter(),
};

export function getAdapter(league: League): SportsDataAdapter {
  return adapters[league];
}
```

### 4. Mock Data for Phase 3
**Decision**: NCAA and EuroLeague adapters return mock data, not real API calls.

**Why**:
- Real API integration requires authentication setup
- Enables immediate UI development without blocking on API keys
- Follows established Phase 2 pattern (BalldontlieAdapter also uses mocks)

**Future**: Replace mock data with real API calls in Phase 4 (API integration).

## Architecture Improvements

### Before (Phase 2)
- Single adapter: BalldontlieAdapter
- Hardcoded NBA-only logic in SSE endpoint
- No shared adapter infrastructure
- Cache logic duplicated if more adapters added

### After (Phase 3)
- Three adapters: BalldontlieAdapter, NcaaAdapter, EuroLeagueAdapter
- Parallel multi-league fetching in SSE endpoint
- BaseAdapter provides shared infrastructure
- Factory pattern for type-safe adapter access
- Fault-tolerant with Promise.allSettled

### Impact
- **Scalability**: Adding new league = create new adapter extending BaseAdapter
- **Maintainability**: Cache logic in one place (BaseAdapter)
- **Reliability**: One failing API doesn't block entire app
- **Type Safety**: League type prevents invalid league strings at compile time

## Performance Characteristics

### Parallel Fetching
- **Before**: Sequential (only NBA)
- **After**: Parallel (NBA + NCAA + EuroLeague simultaneously)
- **Benefit**: Fastest API determines latency, not sum of all APIs

### Cache Behavior
- **Strategy**: Cache-first with 10s TTL for live games
- **Shared**: All adapters use same BaseAdapter.fetchWithCache logic
- **Consistent**: Same cache keys format across leagues (`games:live:{league}`)

### Error Handling
- **Graceful Degradation**: Failed league omitted from results, not error thrown
- **Logging**: Per-league error tracking with `[League]` prefixes
- **SSE Events**: Optional error events sent to client for per-league warnings

## Verification Results

### Automated Tests
```bash
npm test
# Result: 116/116 tests passing
# New tests: 43
# Existing tests: 73 (no regressions)
```

### Adapter Inheritance
```bash
grep "extends BaseAdapter" src/lib/adapters/*.ts
# Result:
# balldontlie-adapter.ts: BalldontlieAdapter extends BaseAdapter
# ncaa-adapter.ts: NcaaAdapter extends BaseAdapter
# euroleague-adapter.ts: EuroLeagueAdapter extends BaseAdapter
```

### TypeScript Compilation
- All new code compiles successfully
- Type safety enforced for League union type
- No type errors in adapter code

## Must-Have Verification

### Truths Verified ✓
- [x] Developer can fetch live games from NBA, NCAA, and EuroLeague using unified adapter interface
- [x] SSE endpoint streams games from all three leagues simultaneously
- [x] Each game object includes league field identifying its source
- [x] Failed API calls for one league don't prevent other leagues from loading

### Artifacts Verified ✓
- [x] `src/types/sports-data.ts` contains `League = 'NBA' | 'NCAA' | 'EuroLeague'`
- [x] `src/lib/adapters/base-adapter.ts` has 65 lines (>50 min_lines requirement)
- [x] `src/lib/adapters/ncaa-adapter.ts` exports `NcaaAdapter`
- [x] `src/lib/adapters/euroleague-adapter.ts` exports `EuroLeagueAdapter`
- [x] `src/lib/adapters/index.ts` exports `getAdapter()` function

### Key Links Verified ✓
- [x] `src/app/api/scores/live/route.ts` uses `getAdapter()` via Promise.allSettled parallel fetch
  - Pattern found: `await Promise.allSettled(leagues.map(async (league) => { const adapter = getAdapter(league); ... }))`
- [x] `NcaaAdapter` extends `BaseAdapter`
  - Pattern found: `class NcaaAdapter extends BaseAdapter`
- [x] `Game` interface has `league: League` field
  - Pattern found: `league: League` in Game interface

## Next Steps

1. **Phase 3 Plan 02**: League filtering UI
   - Add LeagueFilter component with pills/chips
   - Implement client-side filtering by selected league
   - Show real-time game counts per league

2. **Future Enhancements** (out of Phase 3 scope):
   - Replace mock data with real API calls (requires auth setup)
   - Add scheduled games fetching (currently returns empty arrays)
   - Implement getGame() for individual game details
   - Add rate limiting per adapter (NCAA has 5 req/sec limit)

## Self-Check: PASSED

### Created Files Verification
```bash
[ -f "src/lib/adapters/base-adapter.ts" ] && echo "FOUND"
# FOUND
[ -f "src/lib/adapters/ncaa-adapter.ts" ] && echo "FOUND"
# FOUND
[ -f "src/lib/adapters/euroleague-adapter.ts" ] && echo "FOUND"
# FOUND
```

### Commits Verification
```bash
git log --oneline | grep -E "(a566af9|a1cd5b1|8e23925|73160a5|9570186|9fd6594)"
# 9fd6594 feat(03-01): implement parallel multi-league SSE streaming
# 9570186 test(03-01): add failing tests for multi-league SSE endpoint
# 73160a5 feat(03-01): implement NCAA, EuroLeague adapters and factory function
# 8e23925 test(03-01): add failing tests for NCAA, EuroLeague adapters and factory
# a1cd5b1 feat(03-01): implement League type and BaseAdapter with shared logic
# a566af9 test(03-01): add failing tests for League type and BaseAdapter
```

All files exist, all commits present, all tests passing. Plan 03-01 successfully completed.
