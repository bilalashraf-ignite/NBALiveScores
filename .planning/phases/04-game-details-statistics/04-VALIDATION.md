---
phase: 04
slug: game-details-statistics
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.3.0 + React Testing Library 16.3.2 |
| **Config file** | jest.config.js (Next.js integration via next/jest) |
| **Quick run command** | `npm test -- --testPathPattern="<component>" -x` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5-10 seconds (quick), ~15-20 seconds (full suite with 141+ tests) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="<component-under-test>" -x` (single component, fail-fast)
- **After every plan wave:** Run `npm test` (full suite, all 141+ tests)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STAT-05, NAV-04 | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | NAV-04 | unit | `npm test -- tests/components/game-detail-modal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | NAV-04 | unit | `npm test -- tests/hooks/use-game-details.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | STAT-01, STAT-02 | unit | `npm test -- tests/components/team-stats-table.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | STAT-01, STAT-02 | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | STAT-03, STAT-04 | unit | `npm test -- tests/components/player-stats-table.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | STAT-03, STAT-04 | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | HIST-03, HIST-04 | unit | `npm test -- tests/components/historical-matchup.test.tsx -x` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | HIST-03, HIST-04 | integration | `npm test -- tests/integration/game-detail-modal.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/components/game-detail-modal.test.tsx` — covers modal open/close, dismissal methods (X, ESC, outside click, back button), SSE connection maintained, loading states
- [ ] `tests/components/team-stats-table.test.tsx` — covers all 10 stats displayed, side-by-side format, bold highlighting, shooting percentage calculations
- [ ] `tests/components/player-stats-table.test.tsx` — covers sorting by all columns (PTS, REB, AST), DNP players shown, made-attempted format, horizontal scroll wrapper
- [ ] `tests/components/historical-matchup.test.tsx` — covers last 5 meetings display, "unavailable" fallback message, date formatting
- [ ] `tests/integration/game-detail-modal.test.tsx` — covers full user flow (click game card → modal opens → view stats → close modal → SSE still active)
- [ ] `tests/hooks/use-game-details.test.tsx` — covers on-demand fetch, loading state, error handling
- [ ] `tests/hooks/use-modal-history.test.tsx` — covers pushState on open, popstate listener, cleanup on unmount

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Modal fade + scale animation smoothness | UX-06 | Visual aesthetics, subjective smoothness | 1. Click game card<br>2. Observe modal fade-in with scale-up effect<br>3. Close modal with X button<br>4. Verify smooth fade-out with scale-down<br>5. Expected: 200-300ms duration, no jarring transitions |
| Horizontal scroll UX on mobile | MOB-02 | Touch interaction, device-specific behavior | 1. Open modal on mobile device or narrow viewport<br>2. Navigate to player stats table<br>3. Swipe left/right to scroll<br>4. Expected: Smooth horizontal scroll, all columns accessible, no vertical scroll interference |
| Bold highlighting visibility | UX-01 | Visual design assessment | 1. Open modal for live game<br>2. Compare team stats table values<br>3. Verify better stat value is bolded<br>4. Expected: Clear visual distinction, readable on light/dark backgrounds |

*All core behaviors have automated verification. Manual tests are for UX polish validation.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
