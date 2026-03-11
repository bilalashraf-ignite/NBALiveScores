---
phase: 03
slug: multi-league-schedule
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + React Testing Library |
| **Config file** | jest.config.js (already exists from Phase 2) |
| **Quick run command** | `npm test -- --testPathPattern="league\|schedule\|timezone" --maxWorkers=2` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15-20 seconds (quick), ~30-40 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="league|schedule|timezone" --maxWorkers=2`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds per task

---

## Per-Task Verification Map

Will be populated during planning phase based on specific tasks created.

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test files for NCAA adapter (tests/lib/adapters/ncaa-adapter.test.ts)
- [ ] Test files for EuroLeague adapter (tests/lib/adapters/euroleague-adapter.test.ts)
- [ ] Test files for BaseAdapter class (tests/lib/adapters/base-adapter.test.ts)
- [ ] Test files for League filter component (tests/components/league-filter.test.tsx)
- [ ] Test files for timezone formatting utilities (tests/utils/timezone.test.ts)
- [ ] Test files for scheduled game display (tests/components/scheduled-game-card.test.tsx)
- [ ] Mock data generators for NCAA and EuroLeague APIs
- [ ] Integration tests for multi-league fetching (tests/integration/multi-league.test.tsx)
- [ ] DST transition test cases (tests/utils/dst-transitions.test.ts)

*Wave 0 ensures all test infrastructure exists before implementation begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| League filter pill interaction | LEAGUE-03 | Visual state transitions, touch target sizing | 1. Click each league pill, verify active state styling; 2. Check mobile tap targets are ≥44px; 3. Verify smooth transitions |
| Timezone display matches user locale | SCHED-02 | Browser-dependent locale formatting | 1. Check system locale (Settings → Language); 2. Verify times match expected format (12h vs 24h); 3. Compare with system clock format |
| DST boundary behavior | SCHED-04 | Requires testing during actual DST transition or time manipulation | 1. Set system clock to DST boundary (2 AM on transition day); 2. Verify game times adjust correctly; 3. Check no duplicate/missing hour issues |
| NCAA/EuroLeague API integration | LEAGUE-02, LEAGUE-04 | Real API behavior, rate limits, error states | 1. Monitor Network tab for API calls; 2. Verify correct endpoints hit; 3. Check rate limit handling; 4. Simulate API failures (DevTools offline) |

*Manual verification after automated tests pass ensures real-world behavior matches expectations.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
