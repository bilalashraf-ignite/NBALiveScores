---
status: diagnosed
trigger: "Investigate issue: color-scheme-unclear"
created: 2026-03-15T00:00:00Z
updated: 2026-03-15T00:10:00Z
---

## Current Focus

hypothesis: CONFIRMED - Player stats table has inverted light/dark mode color scheme causing poor contrast and unclear presentation
test: Analyzed all UI components for color consistency
expecting: Root cause identified - player-stats-table.tsx uses dark backgrounds in light mode
next_action: Document root cause and return diagnosis

## Symptoms

expected: Page should show loading skeletons instantly (< 100ms), then swap to real game cards within 1-2 seconds. Text should be immediately readable (system fonts, no font flash).
actual: The ui was not clear, the whole color scheme was bad for presentation.
errors: None reported
reproduction: Test 1 in UAT - Open the home page in a fresh browser tab and observe initial page load
started: Discovered during UAT for Phase 05 (Performance & Polish)

## Eliminated

## Evidence

- timestamp: 2026-03-15T00:05:00Z
  checked: UI component files (game-card.tsx, game-detail-modal.tsx, team-stats-table.tsx, player-stats-table.tsx)
  found: Multiple severe color contrast and styling issues found
  implication: Color scheme is objectively problematic for presentations and general use

### Specific Issues Found:

1. **Player Stats Table (player-stats-table.tsx, line 171-172):**
   - Row background: `bg-gray-700 dark:bg-gray-800`
   - Text color: `text-gray-500 dark:text-gray-400` (line 178)
   - ISSUE: Using DARK backgrounds (gray-700) in light mode, combined with LIGHT text (gray-500), creates poor contrast

2. **Player Stats Table (line 164):**
   - Team divider: `border-gray-400 bg-gray-700`
   - ISSUE: Dark gray-700 background on divider in both light and dark mode

3. **Player Stats Header (line 136):**
   - Text: `text-gray-900 dark:text-gray-100`
   - Background: `bg-gray-200 dark:bg-gray-700`
   - ISSUE: While header is correct, body rows contradict this pattern

4. **Player Stats Hover (line 171):**
   - Hover state: `hover:bg-purple-100 dark:hover:bg-purple-900/40`
   - ISSUE: Purple hover on gray-700 background creates confusing color scheme

5. **Game Cards:**
   - Uses proper light/dark mode pattern: `bg-white dark:bg-gray-800`
   - Text properly adapts: `text-gray-900 dark:text-gray-100`
   - This is CORRECT implementation

6. **Team Stats Table:**
   - Uses proper pattern: `bg-gray-200 dark:bg-gray-700` for headers
   - Text: `text-gray-900 dark:text-gray-100`
   - This is CORRECT implementation

- timestamp: 2026-03-15T00:08:00Z
  checked: Compared player-stats-table.tsx against other components for pattern consistency
  found: All other components use proper light/dark mode adaptation pattern
  implication: Player stats table is the ONLY component with inverted styling - isolated bug

### Pattern Analysis:

**CORRECT Pattern (used everywhere except player-stats-table):**
- Light mode: `bg-white` or `bg-gray-100/200` + `text-gray-900`
- Dark mode: `dark:bg-gray-800/700` + `dark:text-gray-100`
- Example: `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`

**BROKEN Pattern (player-stats-table.tsx only):**
- Line 171: `bg-gray-700 dark:bg-gray-800` ← Always dark background
- Line 178: `text-gray-500 dark:text-gray-400` ← Always light text
- Result: Dark table on light modal = terrible contrast

### Verification:
- ✓ game-card.tsx: Proper pattern
- ✓ game-detail-modal.tsx: Proper pattern
- ✓ team-stats-table.tsx: Proper pattern
- ✓ historical-matchup.tsx: Proper pattern
- ✓ game-detail-skeleton.tsx: Proper pattern
- ✓ status-badge.tsx: Proper pattern
- ✗ player-stats-table.tsx: BROKEN pattern

### Why This Breaks Presentation Mode:
1. When presenting with projector/screen share, light mode is typical
2. Dark gray-700 table rows on white modal background create jarring visual
3. Light gray-500 text on dark gray-700 background is hard to read from distance
4. Purple hover (`hover:bg-purple-100`) on dark background creates color chaos
5. Team divider using `bg-gray-700` looks like error/glitch in light mode

- timestamp: 2026-03-15T00:10:00Z
  checked: Specific problematic lines in player-stats-table.tsx
  found: Lines 164, 171-172, 178 contain the broken color scheme
  implication: Targeted fix needed in single file - simple correction

## Resolution

root_cause: Player stats table (player-stats-table.tsx) has inverted light/dark mode styling. Table rows use `bg-gray-700` (dark background) unconditionally in both light and dark modes, combined with `text-gray-500 dark:text-gray-400` (light text). This creates severely poor contrast in light mode where dark backgrounds with light gray text appear on white modal backgrounds. The team divider row also uses `bg-gray-700` in all modes. This is inconsistent with all other components (game-card, team-stats-table, game-detail-modal) which properly use `bg-white dark:bg-gray-800` pattern for light/dark mode adaptation.
fix: [diagnose-only mode - no fix applied]
verification: [diagnose-only mode - no verification]
files_changed: []
