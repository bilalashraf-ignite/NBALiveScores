---
phase: 02
slug: live-scores-display
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-11
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + React Testing Library 14.x |
| **Config file** | jest.config.js (none — Wave 0 installs) |
| **Quick run command** | `npm test -- --testPathPattern="game-card\|status-badge" --maxWorkers=2` |
| **Full suite command** | `npm test -- --coverage` |
| **Estimated runtime** | ~10 seconds (quick), ~30 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="{changed_file}" --maxWorkers=2`
- **After every plan wave:** Run `npm test -- --onlyChanged`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | LIVE-02 | integration | `npm test -- tests/api/scores-live.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-T2 | 01 | 1 | LIVE-02 | integration | `npm test -- tests/hooks/useSSE.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-T3 | 01 | 1 | LIVE-08 | integration | `npm test -- tests/api/scores-refresh.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-02-T1 | 02 | 1 | LIVE-06 | unit | `npm test -- tests/components/status-badge.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-02-T2 | 02 | 1 | LIVE-01, TEAM-01 | integration | `npm test -- tests/components/game-card.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-02-T3 | 02 | 1 | UX-05 | unit | `npm test -- tests/components/game-card-skeleton.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-03-T1 | 03 | 2 | LIVE-07, NAV-02 | integration | `npm test -- tests/components/game-list.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-03-T2 | 03 | 2 | UX-03, UX-04 | integration | `npm test -- tests/components/error-fallback.test.tsx tests/components/stale-data-banner.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-03-T3 | 03 | 2 | NAV-01, UX-01 | integration | `npm test -- tests/integration/home-page.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Configure Jest with TypeScript, React Testing Library, module aliases (@/)
- [ ] `tests/setup.ts` — Setup file for React Testing Library matchers, global mocks
- [ ] `tests/mocks/handlers.ts` — MSW handlers for API mocking (SSE, fetch)
- [ ] `tests/components/game-card.test.tsx` — Unit tests for GameCard component rendering, props
- [ ] `tests/components/status-badge.test.tsx` — Unit tests for badge colors, animations per state
- [ ] `tests/hooks/useSSE.test.tsx` — Integration tests for SSE connection, cleanup, error handling
- [ ] `tests/components/error-fallback.test.tsx` — Unit tests for error fallback rendering, retry button
- [ ] `tests/components/stale-data-banner.test.tsx` — Unit tests for stale data banner, timestamp formatting
- [ ] `npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom msw @types/jest`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 4-5 games visible without scrolling | NAV-02 | Viewport-dependent layout | 1. Open home page on 1920x1080 desktop<br>2. Count visible cards without scrolling<br>3. Verify 4-5 cards visible<br>4. Repeat on mobile (375x667) |
| Subtle pulse animation on live badges | LIVE-06, NAV-03 | Visual animation quality | 1. View page with live game<br>2. Observe red badge pulse<br>3. Verify smooth, non-distracting animation<br>4. Check prefers-reduced-motion disables it |
| SSE reconnection after network drop | LIVE-02 | Network simulation complexity | 1. Open DevTools Network tab<br>2. Simulate offline<br>3. Wait 5s, go online<br>4. Verify EventSource reconnects within 3s |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
