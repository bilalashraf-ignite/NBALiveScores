# Phase 5: Performance & Polish - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize load times to achieve sub-1-second desktop and sub-2-second mobile initial page loads. Polish mobile experience with touch-friendly targets (48x48px minimum), readable typography, and mobile-native gestures. Eliminate layout shifts during SSE score updates and modal interactions. Implement smart data conservation on cellular connections.

This is a **polish phase** — optimizing what's been built in Phases 1-4, not adding new features.

</domain>

<decisions>
## Implementation Decisions

### Load Time Optimization

**Priority: Perceived Speed**
- Show content fast even if background data still loading
- Skeleton → real data swap for instant feel
- Progressive enhancement: static shell loads instantly, then hydrate with real-time data

**Code Splitting Strategy**
- Lazy load modal on click (not preloaded)
- Modal + all stats components (TeamStatsTable, PlayerStatsTable, HistoricalMatchup) load when user clicks game card
- Home page bundle stays small
- Accept 200-300ms delay on first modal open

**Image Optimization**
- Use Next.js Image component with blur placeholder
- Automatic WebP conversion, responsive sizes
- Blur-up effect for team logos
- Lazy load with Intersection Observer as fallback

**Font Strategy**
- System fonts only (no custom fonts)
- Use -apple-system, Segoe UI, Roboto, etc.
- Zero network cost, instant rendering, native feel

### Mobile Touch Targets & Typography

**Touch Target Size**
- Minimum 48x48px for all interactive elements (Material Design standard)
- Game cards, buttons, status badges all meet this minimum
- Applies to clickable game cards, modal close button, refresh button, league filter pills

**Font Scaling**
- Same font sizes across devices (16px base)
- Adjust spacing and padding for mobile, not font sizes
- Simpler to maintain, consistent reading experience

**Card Layout on Mobile**
- Single column, full width on mobile screens
- One game card per row for maximum touch target size
- Easiest to scan and tap accurately
- Maintains card-based design from Phase 2

**Mobile Interaction Patterns**
- **Pull-to-refresh gesture**: Swipe down on home page to manually refresh scores
- **Swipe-to-close modal**: Swipe down gesture to dismiss game detail modal
- **Haptic feedback**: Subtle vibration on tap, refresh, or score update (requires user permission)
- Full mobile-native feel with gestures familiar from native apps

### Layout Shift Prevention (CLS)

**Score Updates via SSE**
- Reserve fixed space for score display (min-width/min-height)
- Content reflows within reserved space, no jumping
- Smooth updates without visual disruption

**Status Badge Changes**
- Reserve max badge width for all badge states
- SCHEDULED badge has extra padding to match LIVE width
- Prevents shift when badge text changes (SCHEDULED → LIVE → FINAL)

**Modal Opening**
- Freeze scroll position when modal opens
- Lock body scroll to prevent page jump from scrollbar appearing/disappearing
- Standard pattern for preventing layout shift

**Skeleton Matching**
- Skeletons match precise dimensions of real content
- Same height, spacing, structure as real game cards
- Zero layout shift on initial load (skeleton → real data transition)

### Data Conservation on Cellular

**Network Detection**
- Use Network Information API (navigator.connection.effectiveType)
- Detects 'slow-2g', '2g', '3g', '4g' connection types
- Good browser support, reliable detection

**SSE Frequency Adjustments**
- **WiFi**: Update every 10 seconds (baseline)
- **Cellular**: Update every 20 seconds (50% reduction)
- Balances data savings with score freshness

**User Control**
- Auto-detect network with settings override
- Show settings toggle to force low/high frequency mode
- Best default behavior + user flexibility

**Network Transitions**
- Adjust SSE frequency immediately when network type changes
- Detect WiFi → cellular or cellular → WiFi transitions
- Apply new frequency instantly, no waiting for reconnect

### Claude's Discretion

- Exact bundle size targets and measurement approach
- Skeleton animation timing and easing functions
- Haptic feedback intensity and duration
- Network Information API fallback for browsers without support
- Settings UI design for data conservation toggle
- Performance metrics collection and reporting

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- **useSSE hook** (src/hooks/useSSE.ts): Manages SSE connection, can be extended for frequency control
- **SkeletonCard components**: Already exist for loading states, need dimension matching
- **GameCard component** (src/components/game-card.tsx): Will need touch target size enforcement
- **GameDetailModal** (src/components/game-detail-modal.tsx): Radix Dialog, needs scroll lock and swipe gestures
- **Next.js Image**: Available but not yet used, ready for team logo optimization

### Established Patterns
- **Next.js 16 App Router**: Built-in code splitting and bundle optimization
- **Tailwind CSS**: Utility-first styling, easy to add responsive touch target classes
- **SSE real-time updates**: Connection management in place, frequency is configurable
- **Redis caching**: TTL strategies already optimized (10s live, 2min scheduled)

### Integration Points
- **package.json**: Can add dynamic imports for lazy-loaded modal components
- **useSSE hook**: Add frequency parameter and network detection logic
- **src/app/globals.css**: Add system font stack, reserve scrollbar space
- **GameCard component**: Wrap in Next.js Image, add min-height for CLS prevention
- **Browser APIs**: Network Information API, Haptic Feedback API (navigator.vibrate)

### Performance Baseline
- **Current stack**: Next.js 16, React 19, Tailwind CSS 4
- **Dependencies**: Radix Dialog (accessible modals), TanStack Table (sortable stats)
- **No images yet**: Team logos not implemented, good opportunity for Image component
- **No custom fonts**: Already using system fonts (unintentional but optimal)

</code_context>

<specifics>
## Specific Ideas

- **Perceived speed over true load time**: Show skeleton instantly, swap to real data. Users perceive this as faster than spinner.
- **Material Design 48px touch targets**: More generous than Apple's 44px, better for users with larger fingers.
- **50% SSE reduction on cellular**: Sweet spot between data savings and freshness. 20-second updates still feel real-time for live sports.
- **Pull-to-refresh and swipe gestures**: Full mobile-native experience. Users expect these patterns from native sports apps.
- **Reserve space for dynamic content**: Prevents layout shift without complex animation orchestration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (performance optimization and mobile polish).

</deferred>

---

*Phase: 05-performance-polish*
*Context gathered: 2026-03-12*
