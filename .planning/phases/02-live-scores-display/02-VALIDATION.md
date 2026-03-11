---
phase: 02
slug: live-scores-display
status: draft
nyquist_compliant: false
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
| 02-01-01 | 01 | 0 | Testing infra | setup | `npm test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | LIVE-01 | integration | `npm test -- tests/components/game-card.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | LIVE-02 | integration | `npm test -- tests/hooks/useSSE.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | LIVE-06 | unit | `npm test -- tests/components/status-badge.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | LIVE-07 | unit | `npm test -- tests/components/game-list.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | LIVE-08 | integration | `npm test -- tests/hooks/useGameUpdates.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-07 | 01 | 1 | UX-03 | integration | `npm test -- tests/components/error-fallback.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-08 | 01 | 1 | UX-04 | integration | `npm test -- tests/components/stale-data-banner.test.tsx -x` | ❌ W0 | ⬜ pending |
| 02-01-09 | 01 | 1 | UX-05 | unit | `npm test -- tests/components/game-card-skeleton.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `jest.config.js` — Configure Jest with TypeScript, React Testing Library, module aliases (@/)
- [ ] `tests/setup.ts` — Setup file for React Testing Library matchers, global mocks
- [ ] `tests/mocks/handlers.ts` — MSW handlers for API mocking (SSE, fetch)
- [ ] `tests/components/game-card.test.tsx` — Unit tests for GameCard component rendering, props
- [ ] `tests/components/status-badge.test.tsx` — Unit tests for badge colors, animations per state
- [ ] `tests/hooks/useSSE.test.tsx` — Integration tests for SSE connection, cleanup, error handling
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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
