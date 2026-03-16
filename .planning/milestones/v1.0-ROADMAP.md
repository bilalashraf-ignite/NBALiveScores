# Roadmap: Basketball Live Scores

**Milestone:** v1.0 Live Scores
**Created:** 2026-03-10
**Granularity:** Coarse (3-5 phases)

## Phases

- [x] **Phase 1: Foundation & Infrastructure** - Project scaffold, API abstraction layer, caching, deployment (completed 2026-03-10)
- [x] **Phase 2: Live Scores Display** - Real-time NBA scores, home page, automatic updates (completed 2026-03-11)
- [ ] **Phase 3: Multi-League & Schedule** - NCAA/EuroLeague support, scheduling, timezone handling
- [ ] **Phase 4: Game Details & Statistics** - Team/player stats, historical matchups, detailed views
- [ ] **Phase 5: Performance & Polish** - Mobile optimization, sub-1s load, UX refinements

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: Establish technical foundation that enables fast, reliable score delivery with API flexibility

**Depends on**: Nothing (first phase)

**Requirements**: PERF-03, PERF-04

**Success Criteria** (what must be TRUE):
1. Developer can integrate new API provider in under 4 hours using adapter pattern
2. Static assets load from CDN with 1-year cache headers and serve in under 200ms
3. API responses cache with appropriate TTL and serve from Redis without origin hits
4. Deployment pipeline builds and deploys changes to production in under 5 minutes

**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Next.js project scaffold with TypeScript, Tailwind CSS, and CDN-optimized configuration
- [x] 01-02-PLAN.md — API abstraction layer with adapter pattern and game state machine for intelligent polling
- [x] 01-03-PLAN.md — Database schema, Redis caching infrastructure, and CI/CD deployment pipeline

---

### Phase 2: Live Scores Display
**Goal**: Users can view real-time NBA game scores with automatic updates and clear game context

**Depends on**: Phase 1

**Requirements**: LIVE-01, LIVE-02, LIVE-03, LIVE-04, LIVE-05, LIVE-06, LIVE-07, LIVE-08, HIST-01, HIST-02, LEAGUE-01, TEAM-01, TEAM-02, TEAM-03, NAV-01, NAV-02, NAV-03, NAV-04, UX-01, UX-03, UX-04, UX-05, UX-06

**Success Criteria** (what must be TRUE):
1. User sees live NBA game scores update automatically every 10-15 seconds without page refresh
2. User sees game context (quarter, time remaining, possession, team fouls) for all live games
3. User sees visual status badges distinguishing LIVE, FINAL, and SCHEDULED games at a glance
4. User sees "Last updated" timestamp and cached scores with clear staleness warnings when API fails
5. User sees all live NBA games on unified home page without excessive scrolling

**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — SSE streaming endpoint, React hook for connection management, and manual refresh capability (621s, 3 tasks, 14 files)
- [x] 02-02-PLAN.md — Game card component, status badges with animations, and loading skeletons (369s, 3 tasks, 8 files)
- [x] 02-03-PLAN.md — Home page integration with error boundaries and real-time updates (283s, 3 tasks, 9 files)
- [x] 02-04-PLAN.md — Team fouls display (gap closure from verification) (409s, 3 tasks, 6 files)

---

### Phase 3: Multi-League & Schedule
**Goal**: Users can view games across NBA, NCAA, and EuroLeague with accurate scheduling in their local timezone

**Depends on**: Phase 2

**Requirements**: LEAGUE-02, LEAGUE-03, LEAGUE-04, SCHED-01, SCHED-02, SCHED-03, SCHED-04

**Success Criteria** (what must be TRUE):
1. User can view live scores from NBA, NCAA, and EuroLeague on the same home page
2. User can filter games by specific league to focus on their preferred competition
3. User sees upcoming game fixtures with date and time displayed in their local timezone
4. User sees correct game times that adjust automatically during DST transitions

**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Multi-league adapter infrastructure with BaseAdapter, NCAA/EuroLeague adapters, and parallel SSE fetching
- [ ] 03-02-PLAN.md — League filtering UI, timezone-aware scheduling display, and home page integration

---

### Phase 4: Game Details & Statistics
**Goal**: Users can access comprehensive team and player statistics for live games plus historical matchup context

**Depends on**: Phase 2

**Requirements**: HIST-03, HIST-04, STAT-01, STAT-02, STAT-03, STAT-04, STAT-05

**Success Criteria** (what must be TRUE):
1. User can expand live game to view team statistics (field goal %, rebounds, assists, turnovers)
2. User can view individual player statistics (points, rebounds, assists) during live games
3. User can access historical head-to-head data showing last 5 meetings between two teams
4. User navigates from home page game card to detailed game view with full statistics

**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Modal infrastructure with Radix Dialog, GameCard integration, browser history support, on-demand GameDetails fetching
- [ ] 04-02-PLAN.md — Team statistics display with side-by-side comparison table, bold highlighting, made-attempted + percentage format
- [ ] 04-03-PLAN.md — Player statistics with TanStack Table sortable columns, both teams in single table, DNP handling, horizontal scroll
- [ ] 04-04-PLAN.md — Historical matchup data with last 5 meetings, season series, all-time record, fallback messaging

---

### Phase 5: Performance & Polish
**Goal**: Users experience sub-1-second load times on desktop, optimized mobile experience, and polished UX

**Depends on**: Phase 1, Phase 2

**Requirements**: PERF-01, PERF-02, PERF-05, MOB-01, MOB-02, MOB-03, MOB-04, UX-02

**Success Criteria** (what must be TRUE):
1. User experiences sub-1-second initial page load on desktop and sub-2-second on mobile devices
2. User interacts with touch-friendly tap targets and readable text on mobile without zooming
3. User sees score updates without page layout shifts or visual jumps
4. User experiences ad-free or minimal advertising interface with clean, scannable layout
5. User experiences reduced polling frequency on cellular connections to conserve data

**Plans**: 9 plans

Plans:
- [x] 05-00-PLAN.md — Test infrastructure with Lighthouse CI and accessibility tests (Wave 0)
- [x] 05-01-PLAN.md — Load time optimization with code splitting, Next.js Image, system fonts
- [x] 05-02-PLAN.md — Mobile touch targets, pull-to-refresh, haptic feedback, swipe gestures
- [x] 05-03-PLAN.md — Layout shift prevention with dimension-matched skeletons, fixed-width badges, scroll lock
- [x] 05-04-PLAN.md — Cellular data conservation with network detection and adaptive SSE frequency
- [x] 05-05-PLAN.md — Fix player stats table color scheme (gap closure - cosmetic)
- [x] 05-06-PLAN.md — Fix Safari gesture hang with @use-gesture/react (gap closure - blocker)
- [x] 05-07-PLAN.md — Theme toggle decision (gap closure - requirements clarification)
- [ ] 05-08-PLAN.md — Theme toggle implementation with next-themes (gap closure - user decision)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 3/3 | Complete   | 2026-03-10 |
| 2. Live Scores Display | 4/4 | Complete | 2026-03-11 |
| 3. Multi-League & Schedule | 0/2 | Not started | - |
| 4. Game Details & Statistics | 0/4 | Not started | - |
| 5. Performance & Polish | 8/9 | Gap closure | 2026-03-13 |

---

## Coverage Summary

**Total v1.0 Requirements:** 45
**Mapped to Phases:** 45
**Coverage:** 100%

---

*Created: 2026-03-10*
*Last updated: 2026-03-15*
