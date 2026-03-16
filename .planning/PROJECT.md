# Basketball Live Scores

## What This Is

A clean, fast website that displays live basketball scores across major leagues (NBA, NCAA, EuroLeague) with comprehensive game details, team/player statistics, and historical matchup data. Built for basketball fans frustrated with cluttered, ad-heavy, slow existing sports sites.

## Core Value

Users can quickly check live basketball game scores and context without ads, clutter, or slow page loads.

## Current State (v1.0 Shipped)

**Shipped:** 2026-03-16
**Codebase:** 4,913 lines TypeScript, Next.js 16 + Tailwind v4

**What's Live:**
- Real-time scores via SSE streaming (15-second auto-refresh)
- Multi-league support: NBA, NCAA, EuroLeague with filter pills
- Game details modal with team stats, player stats, head-to-head history
- Sub-1-second desktop load, sub-2-second mobile
- Mobile-optimized: pull-to-refresh, swipe gestures, haptic feedback
- Manual theme toggle (light/dark mode)
- Timezone-aware scheduling with DST handling

## Requirements

### Validated (v1.0)

- ✓ Live scores for ongoing basketball games across NBA, NCAA, EuroLeague — v1.0
- ✓ Game context (quarter, time remaining, possession, team fouls) — v1.0
- ✓ Player statistics during live games — v1.0
- ✓ Team statistics during live games — v1.0
- ✓ Historical head-to-head matchups (last 5 meetings) — v1.0
- ✓ Sub-1-second desktop load, sub-2-second mobile — v1.0
- ✓ Mobile-first responsive design with touch-friendly interface — v1.0
- ✓ Ad-free interface — v1.0
- ✓ Unified home page showing all live games — v1.0

### Active (v2.0 Candidates)

- [ ] AI/ML-powered game predictions with win probabilities
- [ ] Play-by-play real-time event feed
- [ ] User accounts with favorite teams sync
- [ ] Browser push notifications for game events
- [ ] Multiple view modes (list, card, compact)

### Out of Scope

- Video highlights or streaming — Licensing costs, bandwidth
- Real-time chat or comments — Moderation burden, not core value
- Fantasy basketball integration — Not core to live scores
- Betting odds or gambling features — Regulatory complexity
- Advanced metrics (expected FG%, Gravity) — Requires paid APIs

## Context

v1.0 successfully shipped with all core features validated. The clean, fast experience differentiates from ESPN/Bleacher Report clutter. Free API constraint was manageable — NBA, NCAA, EuroLeague coverage achieved.

User feedback to collect:
- Is 15-second update frequency fast enough?
- Which additional leagues are most requested?
- Is manual theme toggle valuable or was system preference sufficient?

## Constraints

- **Budget**: Free APIs only — No paid data subscriptions (maintained in v2.0)
- **Performance**: Sub-1-second load achieved — Maintain or improve
- **Mobile**: Mobile-first achieved — Continue prioritizing
- **Data availability**: Free APIs cover major leagues — Expansion requires paid options

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Start with leagues available via free APIs | Pragmatic approach - launch with NBA/NCAA/major leagues | ✓ Good — covered 3 major leagues |
| Home page shows all live games across leagues | Simple, unified view - users see everything happening now | ✓ Good — clean UX |
| Defer ML predictions to v2.0 | Focus v1.0 on validating core live scores experience | ✓ Good — shipped faster |
| Defer play-by-play to v2.0 | Prioritize comprehensive game context over real-time play feeds | ✓ Good — game details sufficient |
| No user accounts in v1 | Reduce complexity, provide immediate value without signup | ✓ Good — localStorage works |
| Sub-1-second load time target | Aggressive but achievable with Next.js optimizations | ✓ Good — achieved |
| System dark mode + manual toggle | User requested manual toggle during UAT | ✓ Good — both options available |
| @use-gesture/react for touch | Safari hung with raw touch handlers | ✓ Good — smooth 60fps |

---
*Last updated: 2026-03-16 after v1.0 milestone completion*
