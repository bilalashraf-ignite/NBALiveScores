---
phase: 05
slug: performance-polish
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-12
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.3.0 + React Testing Library 16.3.2 + Lighthouse CI |
| **Config file** | jest.config.js + lighthouserc.json |
| **Quick run command** | `npm test -- --testPathPattern="performance\|mobile"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~8-12 seconds (quick), ~20-25 seconds (full suite with 270+ tests) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="<feature>"` (unit tests for that feature, fail-fast)
- **After every plan wave:** Run `npm test` (full suite, all 270+ tests)
- **Before `/gsd:verify-work`:** Full test suite + Lighthouse CI (desktop + mobile performance audits)
- **Max feedback latency:** 12 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PERF-01, PERF-02 | integration | Lighthouse CI workflow | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | PERF-01, PERF-02 | unit | `npm test -- --testPathPattern="lazy"` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | PERF-01, PERF-02 | integration | Lighthouse CI bundle check | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | MOB-01, MOB-02, MOB-03 | unit | `npm test tests/accessibility/touch-targets.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | MOB-01, MOB-02 | unit | `npm test tests/components/pull-to-refresh.test.tsx` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | MOB-02 | unit | `npm test tests/hooks/useHapticFeedback.test.tsx` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | PERF-05 | unit | `npm test -- --testPathPattern="skeleton"` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | PERF-05 | unit | `npm test -- --testPathPattern="badge"` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 2 | PERF-05 | integration | Lighthouse CI CLS measurement | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | 2 | MOB-04 | unit | `npm test tests/hooks/useNetworkType.test.tsx` | ❌ W0 | ⬜ pending |
| 05-04-02 | 04 | 2 | MOB-04 | unit | `npm test tests/hooks/useSSE.test.tsx` | ✅ (extend) | ⬜ pending |
| 05-04-03 | 04 | 2 | MOB-04 | integration | `npm test -- --testPathPattern="network"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.github/workflows/lighthouse-ci.yml` — GitHub Actions workflow for automated performance testing (PERF-01, PERF-02, PERF-05 measurement)
- [ ] `lighthouserc.json` — Lighthouse CI config with performance budgets (LCP < 2.5s, CLS < 0.1, bundle < 100KB)
- [ ] `tests/accessibility/touch-targets.test.tsx` — Unit tests verifying 48x48px minimum for all interactive elements
- [ ] `tests/accessibility/text-sizes.test.tsx` — Unit tests verifying 16px base text, no problematic mobile scaling
- [ ] `tests/hooks/useNetworkType.test.tsx` — Unit tests for Network Information API wrapper (cellular detection)
- [ ] `tests/hooks/useHapticFeedback.test.tsx` — Unit tests for Vibration API wrapper (haptic feedback)
- [ ] `tests/components/pull-to-refresh.test.tsx` — Unit tests for pull-to-refresh gesture implementation
- [ ] `tests/components/skeleton-dimensions.test.tsx` — Unit tests verifying skeletons match real content dimensions
- [ ] Extend `tests/components/game-card.test.tsx` — Add responsive breakpoint tests (MOB-01)
- [ ] Extend `tests/hooks/useSSE.test.tsx` — Add frequency adjustment tests (MOB-04)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Ad-free interface maintained | UX-02 | Visual assessment, subjective "clean" evaluation | 1. Open home page<br>2. Verify no ads, pop-ups, banners<br>3. Verify clean, scannable layout<br>4. Expected: Minimal visual clutter, focus on game scores |
| Pull-to-refresh feel | MOB-01 | Subjective gesture smoothness | 1. On mobile/touch device, swipe down on home page<br>2. Verify smooth pull animation<br>3. Verify refresh completes with haptic feedback<br>4. Expected: Native app-like feel, no lag |
| Swipe-to-close modal feel | MOB-02 | Subjective gesture smoothness | 1. Open game detail modal<br>2. Swipe down from top to close<br>3. Verify smooth dismissal animation<br>4. Expected: Responsive swipe, smooth animation |
| Haptic feedback appropriateness | MOB-02 | Subjective vibration intensity | 1. Enable haptics in settings<br>2. Tap game card, pull-to-refresh, close modal<br>3. Verify vibration feels appropriate (not too strong/weak)<br>4. Expected: Subtle nudge, success feedback |
| Desktop load speed perception | PERF-01 | Real-world network conditions | 1. Open home page on desktop (throttled 4G)<br>2. Measure time until content visible<br>3. Expected: Skeleton appears instantly, data swaps in < 1s |
| Mobile load speed perception | PERF-02 | Real-world network conditions | 1. Open home page on mobile (throttled 3G)<br>2. Measure time until content visible<br>3. Expected: Skeleton appears instantly, data swaps in < 2s |

*Automated tests (Lighthouse CI) provide objective measurements. Manual tests validate subjective quality.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 12s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
