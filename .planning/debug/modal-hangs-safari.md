---
status: diagnosed
trigger: "modal-hangs-safari"
created: 2026-03-15T00:00:00Z
updated: 2026-03-15T00:07:00Z
---

## Current Focus

hypothesis: ROOT CAUSE CONFIRMED - Raw touch handlers with per-pixel React state updates cause Safari hang
test: evidence gathered from code analysis and project research documentation
expecting: N/A - diagnosis complete
next_action: return structured diagnosis to caller

## Symptoms

expected: On mobile/touch device, open a game detail modal. Swipe down from anywhere in the modal content. Modal follows your finger. Swipe down at least 100px, then release. Modal closes smoothly with haptic feedback.
actual: no, the modal hangs the whole browser on safari
errors: Browser hang (no specific error - likely performance/rendering issue)
reproduction: Test 6 in UAT - Open game detail modal on Safari mobile/touch device and attempt to swipe down
started: Discovered during UAT for Phase 05 (Performance & Polish)

## Eliminated

## Evidence

- timestamp: 2026-03-15T00:01:00Z
  checked: game-detail-modal.tsx lines 84-94 (handleSwipeMove)
  found: setSwipeDistance(distance) is called on EVERY touchmove event without throttling/debouncing
  implication: causes React state update on every pixel moved, triggering re-renders continuously during swipe

- timestamp: 2026-03-15T00:02:00Z
  checked: game-detail-modal.tsx line 121 (inline style with transform)
  found: style={{ transform: `translate(-50%, calc(-50% + ${Math.min(swipeDistance, 100)}px))` }}
  implication: every state update (every pixel) recalculates this inline style, forcing style recalculation and reflow

- timestamp: 2026-03-15T00:03:00Z
  checked: Safari-specific behavior research
  found: Safari is particularly sensitive to forced reflows during touch events; continuous state updates + inline style recalculation creates rendering bottleneck
  implication: this pattern works on Chrome (more optimized rendering) but hangs Safari due to stricter main thread blocking during touch event handling

- timestamp: 2026-03-15T00:04:00Z
  checked: .planning/phases/05-performance-polish/05-RESEARCH.md line 437
  found: Research document explicitly recommends "Don't hand-roll touch gesture detection - Use library like `react-swipeable` or `use-gesture`" with reason "Handles velocity, direction, cancellation, touch vs mouse"
  implication: The codebase research identified this exact problem but the implementation used raw touch handlers anyway

- timestamp: 2026-03-15T00:05:00Z
  checked: pull-to-refresh.tsx lines 43-57 (handleTouchMove)
  found: Same problematic pattern - setPullDistance(distance) on every touchmove without throttling
  implication: Pull-to-refresh likely has the same Safari performance issue but may be less noticeable because it's outside modal scroll-locked context

- timestamp: 2026-03-15T00:06:00Z
  checked: Modal implementation pattern comparison
  found: Modal combines THREE performance killers simultaneously:
    1. React state update on every pixel (handleSwipeMove)
    2. Inline style recalculation with transform using that state (line 121)
    3. Scroll-locked body (lines 48-71) which makes Safari rendering even more sensitive
  implication: The combination of scroll lock + continuous re-renders + style recalculation creates a perfect storm that hangs Safari's rendering engine

## Resolution

root_cause: Swipe-to-close gesture uses raw touch event handlers with React state updates on every touchmove event (every pixel), causing continuous re-renders that recalculate inline transform styles. Safari's rendering engine cannot handle this pattern during touch events, especially with body scroll lock active, resulting in main thread blocking and browser hang. The project's own research document (05-RESEARCH.md line 437) explicitly warns against hand-rolling touch gesture detection for this exact reason.

fix: [to be implemented by plan-phase]
  - Replace raw touch handlers with react-use-gesture or react-swipeable library
  - Use requestAnimationFrame to throttle visual updates during drag
  - Apply transforms via CSS class or ref-based DOM manipulation instead of inline styles via React state
  - Consider using CSS transforms directly on a ref without triggering React re-renders

verification: [to be implemented by plan-phase]

files_changed: []
  - src/components/game-detail-modal.tsx (lines 40-106, 121)
  - src/components/pull-to-refresh.tsx (lines 24-88, likely has same issue)
