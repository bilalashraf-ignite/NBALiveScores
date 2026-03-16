---
phase: 05-performance-polish
plan: 07
type: checkpoint:decision
tags: [decision, ux, dark-mode, theme-toggle]
decision: add-toggle
decided_by: user
decided_at: 2026-03-16
metrics:
  duration: 0s
  completed: 2026-03-16
---

# Phase 05 Plan 07: Theme Toggle Decision Summary

**One-liner:** User decided to add manual theme toggle button (light/dark) rather than keeping system-preference-only dark mode.

## Decision

**Selected:** `add-toggle` — Implement manual theme toggle button

## Context

- UAT Test 12 failed: "There is no button that changes the theme"
- UAT Test 13 passed: Dark mode works via system preference detection
- Original REQUIREMENTS.md had no requirement for manual theme toggle
- Current implementation uses CSS `@media (prefers-color-scheme: dark)` with Tailwind `dark:` classes

## Options Considered

| Option | Description | Chosen |
|--------|-------------|--------|
| keep-system | No manual toggle, update UAT to test system preference | No |
| **add-toggle** | Implement manual toggle button (light/dark) | **Yes** |
| hybrid | Three-way toggle (system/light/dark) | No |
| defer | Keep system-based, defer toggle to v2.0 | No |

## Rationale

User chose to implement a manual theme toggle to give users direct control over the theme regardless of their OS settings. This addresses UAT Test 12's expectation and provides a better user experience for users who want to override their system preference within the app.

## Trade-offs Accepted

**Pros of chosen approach:**
- Gives users control independent of OS settings
- Meets UAT Test 12 expectation
- Common pattern in content-heavy apps
- Allows testing both modes without changing OS settings

**Cons accepted:**
- +8-12KB bundle size (next-themes library)
- Requires creating header/navbar component for toggle button
- Adds UI complexity
- More code to maintain

## Next Steps

Implementation plan created: `05-08-PLAN.md`

Tasks:
1. Install next-themes library
2. Create ThemeProvider wrapper in app layout
3. Create ThemeToggle component
4. Add toggle to page header
5. Update UAT Test 12 to validate manual toggle

## Requirements Addressed

- **UX-02**: User experiences ad-free or minimal advertising interface (dark mode contributes to clean UX)

## Self-Check: PASSED

Decision documented, implementation plan created.
