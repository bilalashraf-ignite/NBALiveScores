---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
last_updated: "2026-03-12T16:15:00.000Z"
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 19
  completed_plans: 14
  percent: 93
---

# Project State: Basketball Live Scores

**Last Updated:** 2026-03-12
**Milestone:** v1.0 Live Scores

## Project Reference

**Core Value:** Users can quickly check live basketball game scores and context without ads, clutter, or slow page loads

**Current Focus:** Phase 2 in progress - Building live scores display UI components

**Key Constraint:** Free APIs only - requires aggressive caching and rate limit management

---

## Current Position

**Phase:** 05 - Performance & Polish
**Plan:** Ready for execution
**Status:** Planning complete

**Progress:**
[█████████░] 93%
[██████████] 100% Phase 1: Foundation & Infrastructure (3/3 plans)
[██████████] 100% Phase 2: Live Scores Display (4/4 plans)
[██████████] 100% Phase 3: Multi-League Schedule (2/2 plans)
[██████████] 100% Phase 4: Game Details & Statistics (5/5 plans)
[░░░░░░░░░░] 0% Phase 5: Performance & Polish (0/5 plans)
```

---

## Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Requirements mapped | 45/45 | 45/45 | ✓ Complete |
| Phases planned | 5 | 5 | ✓ Complete |
| Plans created | 19 | 19 | ✓ Complete |
| Plans executed | 19 | 13 | In Progress |
| Implementation started | - | Yes | ✓ Active |

**Plan Execution Metrics:**

| Phase-Plan | Duration | Tasks | Files | Status |
|------------|----------|-------|-------|--------|
| Phase 01 P01 | 1020s | 2 | 16 | ✓ Complete |
| Phase 01 P03 | 756s | 3 | 9 | ✓ Complete |
| Phase 02 P02 | 369s | 3 | 8 | ✓ Complete |
| Phase 02 P01 | 621s | 3 | 14 | ✓ Complete |
| Phase 02 P03 | 283s | 3 | 9 | ✓ Complete |
| Phase 02 P04 | 409s | 3 | 6 | ✓ Complete |
| Phase 03 P01 | 1903s | 3 | 13 | ✓ Complete |
| Phase 03 P02 | 1393s | 3 | 10 | ✓ Complete |
| Phase 04 P00 | 841s | 3 | 9 | ✓ Complete |
| Phase 04 P01 | 1271s | 3 | 16 | ✓ Complete |
| Phase 04 P02 | 586s | 3 | 7 | ✓ Complete |
| Phase 04 P03 | 1303s | 3 | 7 | ✓ Complete |
| Phase 04 P04 | 959s | 3 | 9 | ✓ Complete |

## Accumulated Context

### Recent Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| System fonts only for Phase 5 | -apple-system, Segoe UI stack provides zero network cost, instant rendering, native feel | 2026-03-12 |
| 48x48px touch targets (Material Design) | More generous than Apple's 44px, better for users with larger fingers | 2026-03-12 |
| Pull-to-refresh and swipe gestures | Full mobile-native experience users expect from native sports apps | 2026-03-12 |
| 50% SSE reduction on cellular | 20-second updates (vs 10s WiFi) still feel real-time, saves significant data | 2026-03-12 |
| Network Information API for detection | Detects 'slow-2g', '2g', '3g', '4g' connection types with good browser support | 2026-03-12 |
| Lazy load modal on click | Modal + stats components load when user clicks game card, accepts 200-300ms delay | 2026-03-12 |
| Perceived speed over true load time | Show skeleton instantly, swap to real data - users perceive this as faster than spinner | 2026-03-12 |
| Reserve space for dynamic content | Prevents layout shift without complex animation orchestration (scores, badges, modal) | 2026-03-12 |
| TanStack Table for player stats sorting | Built-in sortUndefined handling for DNP players; getSortedRowModel provides efficient sorting | 2026-03-12 |
| Unified player table with visual divider | Single table maintains sort consistency across teams; divider separates home from away | 2026-03-12 |
| Made-attempted format without percentage | Display as "8-15" string matches basketball scoreboard conventions; avoids precision issues | 2026-03-12 |
| Player name format #jerseyNumber lastName | Compact format "#23 James" matches live broadcast graphics conventions | 2026-03-12 |
| Custom table component for team stats | Side-by-side comparison is fixed layout with 10 rows; TanStack Table adds unnecessary complexity | 2026-03-12 |
| Full word labels for rebounds | Avoid abbreviations (OREB/DREB/TREB) for better accessibility; users unfamiliar with basketball can understand | 2026-03-12 |
| Turnovers use reverse comparison | Lower turnover count is better performance; reversed comparison logic for proper bold highlighting | 2026-03-12 |
| Modal overlay pattern maintains SSE connection | Modal renders as overlay (not new page) to avoid unmounting home page and breaking SSE connection | 2026-03-12 |
| GameDetails as separate interface from Game | On-demand fetch requires distinct type with extended data (team stats, player stats, historical matchup) | 2026-03-12 |
| Radix UI Dialog for modal accessibility | Built-in focus trap, ARIA compliance, keyboard navigation, and controlled state management | 2026-03-12 |
| Only LIVE/FINAL games clickable | SCHEDULED games have no stats to display; click behavior restricted to games with available details | 2026-03-12 |
| Placeholder types for future plans | TeamStats, PlayerStats, HistoricalMatchup defined as empty interfaces to enable type checking while deferring implementation | 2026-03-12 |
| Created Wave 0 test scaffold for Phase 04 | 9 RED test files document expected behaviors for all components, enabling automated verification in Plans 01-04 | 2026-03-12 |
| Intl.DateTimeFormat for timezone handling | Browser-native API handles DST transitions automatically, no external library needed | 2026-03-11 |
| Filter pills instead of dropdown | Pills show game counts inline, better UX for 4 leagues, mobile-friendly | 2026-03-11 |
| Composite keys (league-id) for React rendering | Prevents key collisions when same game ID exists across leagues | 2026-03-11 |
| Client-side filtering instead of API filtering | SSE already fetches all leagues, client filtering is instant with no network delay | 2026-03-11 |
| 5-phase coarse granularity structure | Config specifies "coarse" granularity; 45 requirements cluster naturally into foundation → core features → extensions → polish | 2026-03-10 |
| Phase 1 focuses on API abstraction | Research (PITFALLS.md) emphasizes vendor lock-in risk; adapter pattern must be established early | 2026-03-10 |
| Phase 2 starts with NBA only | Reduce initial complexity; validate core polling and caching before multi-league | 2026-03-10 |
| Performance split across Phase 1 & 5 | Infrastructure (caching, CDN) in Phase 1; client optimization (load time, mobile) in Phase 5 | 2026-03-10 |
| Used Tailwind CSS v4 instead of v3 | create-next-app defaults to v4; provides improved performance and DX with PostCSS-only architecture | 2026-03-10 |
| Configured cache headers in next.config.ts for all environments | Ensures consistent caching behavior; Plan 03 will add vercel.json for Vercel edge network optimization | 2026-03-10 |
| Prisma client singleton pattern | Prevents connection exhaustion in serverless environments where new instances are created per request | 2026-03-10 |
| Differentiated TTL strategy (10s/2min/15min/24h) | Optimizes cache efficiency based on data volatility; research shows live games update frequently while scheduled games rarely change | 2026-03-10 |
| Graceful cache degradation | Redis failures should not break the application; cache operations return null on error | 2026-03-10 |
| Two-layer cache headers (next.config.ts + vercel.json) | next.config.ts provides baseline for all environments; vercel.json optimizes production CDN edge network | 2026-03-10 |
| Installed Jest and React Testing Library | Plan required tests but project had no test infrastructure; essential for TDD workflow and verification | 2026-03-11 |
| Used POST for refresh endpoint | Cache invalidation is a side effect; POST correctly signals non-idempotent action per HTTP semantics | 2026-03-11 |
| Chose SSE over WebSockets | Unidirectional updates don't need full-duplex communication; SSE has built-in reconnection | 2026-03-11 |
| Pulse animation only on badges | Animating entire cards causes mobile jank; limit animation to small elements (RESEARCH.md Pitfall 6) | 2026-03-11 |
| Logo fallback to abbreviation circles | When logoUrl missing, show team abbreviation in gray circle (TEAM-02 requirement) | 2026-03-11 |
| Game context visibility logic | Show period/time only for LIVE/HALFTIME states per CONTEXT.md locked decisions | 2026-03-11 |
| Jest + React Testing Library | Industry standard for TDD workflow; configured for Next.js App Router | 2026-03-11 |
| Live/halftime games sorted first | User's primary intent is checking live games; scheduled games are secondary per CONTEXT.md | 2026-03-11 |
| 6 loading skeletons on home page | Matches typical desktop viewport (3 cols × 2 rows); prevents layout shift | 2026-03-11 |
| Stale data banner when disconnected | Better UX to show cached data with warning than blank screen during temporary API failures | 2026-03-11 |
| ErrorBoundary at page level | Component-level boundaries prevent full app crash; enable graceful degradation per RESEARCH.md | 2026-03-11 |
| TeamFouls as optional field | Free APIs may not provide fouls data; graceful degradation per CONTEXT.md decisions | 2026-03-11 |
| Fouls display format "Fouls: H-A" | Matches period display style (Q1 Q2); clear distinction using hyphen separator per basketball conventions | 2026-03-11 |
| Show fouls only for LIVE/HALFTIME | Fouls are live game context; not relevant for final or scheduled games | 2026-03-11 |
| BaseAdapter abstract class for shared logic | Avoids code duplication across league adapters; ensures consistent caching and error handling | 2026-03-11 |
| Promise.allSettled for parallel fetching | Fault tolerance - one failing API doesn't block others from loading | 2026-03-11 |
| Singleton factory pattern for adapters | Ensures consistent caching across application; prevents multiple adapter instances | 2026-03-11 |
| League field as union type not enum | Type union provides better type safety than string enum | 2026-03-11 |
| Mock data for Phase 3 adapters | Real API integration deferred until auth keys configured; enables UI development | 2026-03-11 |

### Open Questions

- [ ] Which free NBA API to start with? (balldontlie.io vs API-Basketball vs ESPN unofficial)
- [ ] What polling intervals by game state? (Research suggests: scheduled=5-10min, live=10-15s, final=stop)
- [x] Redis vs in-memory cache for MVP? - RESOLVED: Redis selected for multi-instance scaling (Plan 03)
- [ ] WebSocket vs polling for real-time updates? (Polling acceptable for MVP with free APIs)

### Active Todos

- [x] Begin Phase 1 planning with `/gsd:plan-phase 1` - Complete
- [x] Execute Plan 01: Next.js scaffold - Complete
- [x] Execute Plan 02: Database schema and API abstraction - Complete (skipped - see Plan 03)
- [x] Execute Plan 03: Data persistence and deployment - Complete
- [ ] Set up Vercel Postgres database (user action required)
- [ ] Set up Upstash Redis cache (user action required)
- [ ] Research free NBA API options before Phase 2 implementation
- [ ] Plan Phase 2: Live Scores Display

### Known Blockers

None currently - roadmap approved and ready for planning.

---

## Session Continuity

### What Just Happened

Completed Phase 5 Planning: Performance & Polish
- Captured implementation decisions through interactive discussion (05-CONTEXT.md)
- Selected approaches: Load time optimization, mobile touch targets, layout shift prevention, cellular data conservation
- Created research document with 15+ sources (05-RESEARCH.md)
- Defined validation strategy with Nyquist compliance (05-VALIDATION.md)
- Created 5 plans: Wave 0 (test infrastructure) + 4 implementation plans
- Wave structure: Wave 0 → Wave 1 (load + mobile) → Wave 2 (layout shifts + data)
- All plans verified with proper dependencies and automated verification
- Requirements covered: PERF-01, PERF-02, PERF-05, MOB-01, MOB-02, MOB-03, MOB-04, UX-02

**Key Implementation Decisions:**
- Code splitting: Lazy load modal on click (200-300ms acceptable)
- Images: Next.js Image with blur placeholder
- Fonts: System font stack only (-apple-system, Segoe UI)
- Touch targets: 48x48px minimum (Material Design)
- Mobile gestures: Pull-to-refresh (80px), swipe-to-close (100px), haptic feedback
- Layout shifts: Reserved space for scores/badges, dimension-matched skeletons
- Network detection: Network Information API for cellular detection
- SSE frequency: 10s WiFi, 20s cellular (50% data reduction)

### Next Actions

1. Phase 5 planning complete (5/5 plans created and verified)
2. Ready for execution: `/gsd:execute-phase 05`
3. Wave 0 must complete first (test infrastructure)
4. Then Wave 1 can execute in parallel (05-01, 05-02)
5. Then Wave 2 can execute in parallel (05-03, 05-04)

### Context for Next Session

**If starting fresh:**
- Read `.planning/STATE.md` (this file) for current position
- Read `.planning/ROADMAP.md` for phase structure
- Read `.planning/phases/05-performance-polish/05-CONTEXT.md` for Phase 5 decisions
- Current phase: Phase 5 planning complete, ready for execution
- Next step: Run `/gsd:execute-phase 05` to implement performance & polish

**Critical context:**
- Phase 1 complete: Database schema, Redis caching, Vercel deployment, GitHub Actions CI
- Phase 2 complete: SSE streaming, UI components, home page with real-time updates, team fouls display
- Phase 3 complete: Multi-league adapter architecture, league filtering UI, timezone-aware scheduling
- Phase 4 complete: Game detail modals, team/player stats tables, historical matchup display
- Phase 5 planned: Performance optimization and mobile polish ready for implementation
- Multi-league support: NBA, NCAA, EuroLeague with parallel fetching and client-side filtering
- BaseAdapter pattern: Shared infrastructure for all league adapters
- GameDetails interface: On-demand fetch for team stats, player stats, historical matchup
- Modal overlay pattern: Maintains SSE connection during detail view
- Test infrastructure: Jest + React Testing Library, Lighthouse CI for performance
- TDD workflow: RED-GREEN pattern with automated verification
- Error handling: ErrorBoundary, StaleDataBanner for graceful degradation
- Mobile-first responsive design: 1/2/3 column grid with card-based layout
- Performance targets: Sub-1s desktop load, sub-2s mobile load, CLS < 0.1
- 45 requirements mapped across 5 phases with 19 total plans

---

*State tracking for milestone: v1.0 Live Scores*
*This file is updated after each phase/plan completion*
