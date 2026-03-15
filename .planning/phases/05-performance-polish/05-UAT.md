---
status: diagnosed
phase: 05-performance-polish
source:
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
  - 05-03-SUMMARY.md
  - 05-04-SUMMARY.md
started: 2026-03-13T17:45:00Z
updated: 2026-03-13T18:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Initial Page Load Speed
expected: Open the home page in a fresh browser tab. Page should show loading skeletons instantly (< 100ms), then swap to real game cards within 1-2 seconds. Text should be immediately readable (system fonts, no font flash).
result: issue
reported: "The ui was not clear, the whole color scheme was bad for presentation."
severity: cosmetic

### 2. Modal Lazy Loading
expected: Click on a LIVE or FINAL game card to open the detail modal. First click may have 200-300ms delay (lazy loading chunk), but modal opens with game details, team stats, and player stats displayed.
result: pass

### 3. Team Logo Images
expected: Team logos on game cards should appear with blur-up effect (placeholder → sharp image). Above-fold cards (first 3) load immediately, below-fold cards load as you scroll.
result: pass

### 4. Touch Target Size (Mobile)
expected: On mobile device or narrow browser window, tap game cards easily. Cards should be tall enough (min 120px height) and all interactive elements (refresh button, filter pills, modal close) should be comfortably tappable (48x48px minimum).
result: pass

### 5. Pull-to-Refresh Gesture (Mobile)
expected: On mobile/touch device, swipe down from the top of the home page. A pull indicator appears. Pull down at least 80px, then release. Page refreshes with haptic feedback (if device supports vibration).
result: pass

### 6. Swipe-to-Close Modal (Mobile)
expected: On mobile/touch device, open a game detail modal. Swipe down from anywhere in the modal content. Modal follows your finger. Swipe down at least 100px, then release. Modal closes smoothly with haptic feedback.
result: issue
reported: "no, the modal hangs the whole browser on safari"
severity: blocker

### 7. Layout Stability During Load
expected: Watch the page during initial load (skeleton → real content transition). Cards should NOT jump or shift position. Skeletons should be exactly the same size as real game cards.
result: pass

### 8. Layout Stability During Score Updates
expected: Watch a LIVE game card as scores update via SSE (wait 10-20 seconds for updates). Score numbers should change in place without causing the card to jump or resize. Status badge changes (SCHEDULED → LIVE → FINAL) should not cause layout shift.
result: pass

### 9. Layout Stability When Opening Modal
expected: Open a game detail modal. Page content behind modal should NOT shift horizontally (no scrollbar jump). Modal should appear centered on screen without page jumping.
result: pass

### 10. Network Adaptation (Simulated Cellular)
expected: Open DevTools Network tab. Set throttling to "Slow 3G" or "Fast 3G". Reload the page. Look for "📶 Data saver active" indicator near the top. Check Network tab SSE requests - URL should include frequency=20000 (20 second intervals) instead of frequency=10000.
result: pass

### 11. Network Adaptation (Simulated WiFi)
expected: Open DevTools Network tab. Set throttling to "No throttling" (simulates WiFi/desktop). Reload the page. "Data saver" indicator should NOT appear. Check Network tab SSE requests - URL should include frequency=10000 (10 second intervals).
result: pass

### 12. Text Readability and Contrast
expected: On both light and dark mode (check system preferences), all text on game cards should be clearly readable. Team names, scores, and game info (Q4, Fouls) should have high contrast against card background. No light gray text on white background.
result: issue
reported: "There is no button that changes the theme"
severity: major

### 13. Dark Mode Support
expected: Change system to dark mode (macOS: System Settings → Appearance → Dark, Windows: Settings → Colors → Dark). Page background should turn dark, cards should have dark backgrounds, all text should adapt to light colors, status badges should have dark-mode colors.
result: pass

## Summary

total: 13
passed: 10
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Text should be immediately readable with clear color scheme suitable for presentation"
  status: failed
  reason: "User reported: The ui was not clear, the whole color scheme was bad for presentation."
  severity: cosmetic
  test: 1
  root_cause: "Player stats table (player-stats-table.tsx) has inverted light/dark mode styling that creates severe contrast issues. The table uses bg-gray-700 (dark background) unconditionally in both light and dark modes, combined with text-gray-500 dark:text-gray-400 (light text). This creates a dark gray table with light gray text appearing on a white modal background in light mode - making it nearly unreadable and visually jarring for presentations."
  artifacts:
    - path: "src/components/player-stats-table.tsx"
      issue: "Line 164: Team divider uses bg-gray-700 (should adapt to mode)"
    - path: "src/components/player-stats-table.tsx"
      issue: "Line 171: Table rows use bg-gray-700 dark:bg-gray-800 (should be bg-white dark:bg-gray-800)"
    - path: "src/components/player-stats-table.tsx"
      issue: "Line 178: Text uses text-gray-500 dark:text-gray-400 (should be text-gray-900 dark:text-gray-100)"
  missing:
    - "Change table rows from bg-gray-700 dark:bg-gray-800 to bg-white dark:bg-gray-800"
    - "Change text from text-gray-500 dark:text-gray-400 to text-gray-900 dark:text-gray-100"
    - "Change team divider from bg-gray-700 to bg-gray-100 dark:bg-gray-700"
    - "Adjust hover state to work with new light background"
  debug_session: ".planning/debug/color-scheme-unclear.md"

- truth: "Modal closes smoothly with haptic feedback when swiped down at least 100px on mobile/touch device"
  status: failed
  reason: "User reported: no, the modal hangs the whole browser on safari"
  severity: blocker
  test: 6
  root_cause: "The swipe-to-close modal gesture uses raw touch event handlers that trigger React state updates on every single pixel of movement (handleSwipeMove calls setSwipeDistance(distance) on every touchmove event). Each state update forces React to re-render and recalculate the inline transform style, creating a continuous rendering bottleneck. Safari's rendering engine is particularly sensitive to forced reflows during touch events, and when combined with the active body scroll lock, this pattern completely hangs the browser's main thread."
  artifacts:
    - path: "src/components/game-detail-modal.tsx"
      issue: "Lines 84-94: handleSwipeMove updates React state on every touchmove event without throttling"
    - path: "src/components/game-detail-modal.tsx"
      issue: "Line 121: Inline style with transform calculation recalculates on every render"
    - path: "src/components/game-detail-modal.tsx"
      issue: "Lines 48-71: Active scroll lock makes Safari even more sensitive to rendering performance"
    - path: "src/components/pull-to-refresh.tsx"
      issue: "Lines 24-88: Same problematic pattern exists here too"
  missing:
    - "Replace raw touch handlers with battle-tested library (react-use-gesture or react-swipeable)"
    - "Use requestAnimationFrame to throttle visual updates during drag to ~60fps"
    - "Apply transforms via ref-based direct DOM manipulation or CSS classes instead of inline styles"
    - "Apply same fix pattern to pull-to-refresh.tsx to prevent similar issues"
  debug_session: ".planning/debug/modal-hangs-safari.md"

- truth: "All text on game cards should be clearly readable in both light and dark mode with high contrast"
  status: failed
  reason: "User reported: There is no button that changes the theme"
  severity: major
  test: 12
  root_cause: "Manual theme toggle button was never part of project requirements or implementation plans. Dark mode was intentionally implemented using CSS media queries to follow system preferences automatically (Phase 5 design decision). UAT Test 12 introduced an expectation for manual theme switching that conflicts with the system-preference-based approach that was actually implemented and validated in Test 13."
  artifacts:
    - path: "src/app/globals.css"
      issue: "Lines 13-18 implement automatic dark mode via media query (system preference)"
    - path: "src/components/game-card.tsx"
      issue: "Uses dark: Tailwind classes for system-based dark mode (no manual toggle)"
  missing:
    - "Implement theme toggle using next-themes library with localStorage persistence"
    - "Add toggle button to header/navbar"
    - "Update all components to use theme provider"
    - "OR: Update UAT Test 12 to validate system preference detection instead of manual toggle"
  debug_session: ".planning/debug/no-theme-toggle.md"
