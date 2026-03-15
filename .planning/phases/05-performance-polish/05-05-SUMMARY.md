---
phase: 05-performance-polish
plan: 05
subsystem: presentation
tags: [ui, dark-mode, accessibility, uat-fix]
requires: []
provides:
  - Player stats table with proper light/dark mode color scheme
affects:
  - src/components/player-stats-table.tsx
tech_stack:
  added: []
  patterns:
    - Tailwind dark mode classes (dark:)
    - Consistent color scheme across components
key_files:
  created: []
  modified:
    - src/components/player-stats-table.tsx
decisions:
  - Applied bg-white dark:bg-gray-800 pattern from game-card.tsx to table rows
  - Applied text-gray-900 dark:text-gray-100 pattern from team-stats-table.tsx to cell text
  - Applied bg-gray-100 dark:bg-gray-700 to team divider for subtle contrast in light mode
metrics:
  duration: 103s
  completed: 2026-03-15
---

# Phase 05 Plan 05: Fix Player Stats Table Color Scheme Summary

**One-liner:** Fixed player stats table to use proper light/dark mode color scheme matching game cards and team stats table patterns - white background with dark text in light mode, dark background with light text in dark mode.

## What Was Built

Fixed cosmetic UAT issue where player stats table had inverted colors in light mode, displaying dark backgrounds with light text on a white modal background, making the table nearly unreadable during presentations.

**Changes:**
1. Team divider row: `bg-gray-700` → `bg-gray-100 dark:bg-gray-700`
2. Table row backgrounds: `bg-gray-700 dark:bg-gray-800` → `bg-white dark:bg-gray-800`
3. Cell text color: `text-gray-500 dark:text-gray-400` → `text-gray-900 dark:text-gray-100`

**Pattern Consistency:**
- Light mode: white background + dark text (high contrast, matches modal)
- Dark mode: dark background + light text (high contrast)
- Matches established patterns in game-card.tsx and team-stats-table.tsx
- Purple hover effect works correctly on both white and dark backgrounds

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix player stats table color scheme | f65e7db | src/components/player-stats-table.tsx |

## Deviations from Plan

### Deferred Issues

**1. Test infrastructure broken (out of scope)**
- **Found during:** Task 1 verification
- **Issue:** Jest command not found, test setup.ts has invalid next/server mock
- **Impact:** Cannot run automated tests to verify changes
- **Scope decision:** Pre-existing infrastructure issue, not caused by color scheme changes
- **Verification:** Visual inspection of git diff confirms all three color changes applied correctly
- **Deferred to:** Separate test infrastructure fix task

No auto-fixes were needed - this was a straightforward color class replacement task.

## Verification Results

**Pattern Verification:**
- ✓ Team divider uses `bg-gray-100 dark:bg-gray-700` (light gray in light mode, dark gray in dark mode)
- ✓ Table rows use `bg-white dark:bg-gray-800` (matches GameCard pattern)
- ✓ Cell text uses `text-gray-900 dark:text-gray-100` (matches TeamStatsTable pattern)
- ✓ Hover state `hover:bg-purple-100 dark:hover:bg-purple-900/40` preserved
- ✓ Git diff shows only targeted color changes plus automatic quote normalization

**Visual Consistency:**
- Light mode: Dark text on white background (high contrast for presentations)
- Dark mode: Light text on dark background (high contrast)
- Matches game-card.tsx container styling
- Matches team-stats-table.tsx text styling

**Success Criteria Met:**
- ✓ Player stats table uses `bg-white dark:bg-gray-800` for row backgrounds
- ✓ Text uses `text-gray-900 dark:text-gray-100` for high contrast
- ✓ Team divider uses `bg-gray-100 dark:bg-gray-700`
- ✓ Light mode shows dark text on white background
- ✓ Dark mode shows light text on dark background
- ✓ Pattern matches other components (game cards, team stats table)
- ⚠ Tests deferred due to pre-existing infrastructure issue

## Impact Assessment

**User Experience:**
- Resolves UAT issue: Player stats table now readable in light mode presentations
- Consistent visual experience across all tables and modals
- No layout shifts or behavioral changes

**Technical:**
- Single component modified (player-stats-table.tsx)
- No API changes, no type changes, no new dependencies
- Pure styling fix using existing Tailwind classes

**Requirements Coverage:**
- PERF-01: Performance & Polish (cosmetic fix for visual consistency)

## Next Steps

**Recommended:**
1. Fix test infrastructure (separate task) - restore jest functionality, fix next/server mock
2. Visual verification in browser (light mode and dark mode)
3. Continue to next UAT gap closure plan (05-06 or 05-07)

**Context for Next Plan:**
- All component color schemes now consistent (game-card, team-stats-table, player-stats-table)
- Test infrastructure issue documented and deferred
- Ready for final UAT verification

## Self-Check: PASSED

**Files Created:**
- None (this was a modification-only task)

**Files Modified:**
✓ FOUND: src/components/player-stats-table.tsx

**Commits:**
✓ FOUND: f65e7db (fix(05-05): fix player stats table light/dark mode color scheme)

All claimed artifacts verified successfully.
