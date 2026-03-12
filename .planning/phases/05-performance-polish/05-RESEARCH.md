# Phase 5: Performance & Polish - Research

**Researched:** 2026-03-12
**Domain:** Next.js performance optimization, mobile UX, Core Web Vitals
**Confidence:** HIGH

## Summary

Phase 5 focuses on optimizing the already-functional basketball live scores app to achieve sub-1-second desktop load times, sub-2-second mobile load times, and a polished mobile-native experience. This is a **polish phase** — improving what's built, not adding features.

The research confirms that Next.js 16 provides excellent built-in optimization capabilities (automatic code splitting, Turbopack bundle analyzer, Image component), making aggressive performance gains achievable without third-party libraries. The key insight: **perceived speed matters more than true load time** — skeleton screens that match real content dimensions, progressive enhancement, and lazy-loading modals deliver instant-feeling experiences even while data loads in the background.

Mobile polish centers on Material Design's 48x48px touch targets (exceeding Apple's 44px standard), mobile-native gestures (pull-to-refresh, swipe-to-close), and adaptive data consumption using the Network Information API to reduce SSE frequency on cellular connections.

**Primary recommendation:** Implement code splitting for modal (lazy load on click), optimize images with Next.js Image component, enforce 48x48px touch targets, add pull-to-refresh and swipe gestures, implement Network Information API for cellular detection, and prevent layout shifts by reserving fixed space for dynamic content.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Load Time Optimization**
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

**Mobile Touch Targets & Typography**
- Minimum 48x48px for all interactive elements (Material Design standard)
- Game cards, buttons, status badges all meet this minimum
- Applies to clickable game cards, modal close button, refresh button, league filter pills
- Same font sizes across devices (16px base)
- Adjust spacing and padding for mobile, not font sizes
- Single column, full width on mobile screens
- One game card per row for maximum touch target size

**Mobile Interaction Patterns**
- Pull-to-refresh gesture: Swipe down on home page to manually refresh scores
- Swipe-to-close modal: Swipe down gesture to dismiss game detail modal
- Haptic feedback: Subtle vibration on tap, refresh, or score update (requires user permission)
- Full mobile-native feel with gestures familiar from native apps

**Layout Shift Prevention (CLS)**
- Reserve fixed space for score display (min-width/min-height)
- Content reflows within reserved space, no jumping
- Reserve max badge width for all badge states
- SCHEDULED badge has extra padding to match LIVE width
- Prevents shift when badge text changes (SCHEDULED → LIVE → FINAL)
- Freeze scroll position when modal opens
- Lock body scroll to prevent page jump from scrollbar appearing/disappearing
- Skeletons match precise dimensions of real content
- Same height, spacing, structure as real game cards
- Zero layout shift on initial load (skeleton → real data transition)

**Data Conservation on Cellular**
- Use Network Information API (navigator.connection.effectiveType)
- Detects 'slow-2g', '2g', '3g', '4g' connection types
- WiFi: Update every 10 seconds (baseline)
- Cellular: Update every 20 seconds (50% reduction)
- Auto-detect network with settings override
- Show settings toggle to force low/high frequency mode
- Adjust SSE frequency immediately when network type changes

### Claude's Discretion

- Exact bundle size targets and measurement approach
- Skeleton animation timing and easing functions
- Haptic feedback intensity and duration
- Network Information API fallback for browsers without support
- Settings UI design for data conservation toggle
- Performance metrics collection and reporting

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope (performance optimization and mobile polish).

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | User experiences sub-1-second initial page load on desktop | Next.js automatic code splitting, lazy modal loading, system fonts, Image optimization |
| PERF-02 | User experiences sub-2-second initial page load on mobile devices | Next.js Image responsive sizes, skeleton screens, progressive enhancement |
| PERF-05 | Score updates do not cause page layout shifts or jumps | Reserved space patterns, fixed badge widths, skeleton dimension matching |
| MOB-01 | User can access site on mobile devices with responsive design | Tailwind mobile-first breakpoints, single-column card layout |
| MOB-02 | User can interact with touch-friendly tap targets and controls | Material Design 48x48px standard, touch target enforcement |
| MOB-03 | User sees readable text sizes on small screens without zooming | 16px base font size, spacing adjustments not font scaling |
| MOB-04 | User experiences optimized mobile performance (reduced polling on cellular) | Network Information API, adaptive SSE frequency (20s cellular vs 10s WiFi) |
| UX-02 | User experiences ad-free or minimal advertising interface | Clean layout (already established in Phase 2), this phase ensures no ads creep in |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework with built-in optimization | Automatic code splitting, Turbopack bundle analyzer (v16.1+), Image component, production-ready |
| React | 19.2.3 | UI framework | React.lazy() for code splitting, Suspense for loading boundaries |
| Tailwind CSS | 4 | Utility-first styling | Mobile-first breakpoints (sm/md/lg/xl/2xl), responsive utilities, zero runtime cost |
| @next/bundle-analyzer | Latest | Bundle analysis (Webpack) | Visualizes bundle sizes, identifies large dependencies (Webpack builds) |
| next analyze | Built-in (v16.1+) | Bundle analysis (Turbopack) | Integrated Turbopack module graph, precise import tracing, no plugin needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| web-vitals | Latest | Core Web Vitals measurement | Collect LCP, FCP, CLS, INP metrics for monitoring |
| react-intersection-observer | Latest | Lazy loading images | Fallback for browsers without native lazy loading |
| web-haptics | Latest | Haptic feedback | Cross-framework vibration patterns (success, nudge, error, buzz) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js Image | Manual img tags | Image component provides automatic WebP/AVIF, responsive sizes, lazy loading |
| System fonts | Google Fonts / custom fonts | System fonts: zero network cost, instant render; Custom: requires download, FOUT/FOIT issues |
| Tailwind breakpoints | Custom media queries | Tailwind: mobile-first by default, consistent scale; Custom: more control but harder to maintain |
| Native lazy loading | IntersectionObserver polyfill | Native: `loading="lazy"` attribute is simpler; Intersection Observer: more control over threshold |

**Installation:**
```bash
npm install web-vitals react-intersection-observer web-haptics
npm install --save-dev @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx           # System font stack, body scroll lock styles
│   ├── page.tsx             # Home page (static shell, progressive hydration)
│   └── globals.css          # System fonts, scrollbar width reservation
├── components/
│   ├── game-card.tsx        # Touch target enforcement (min 48x48px)
│   ├── game-card-skeleton.tsx  # Match exact dimensions of GameCard
│   ├── game-detail-modal.tsx   # Lazy loaded, scroll lock, swipe gestures
│   └── pull-to-refresh.tsx  # Pull-to-refresh gesture handler (NEW)
├── hooks/
│   ├── useSSE.ts            # Extend with frequency control, network detection
│   ├── useNetworkType.ts    # Network Information API wrapper (NEW)
│   └── useHapticFeedback.ts # Vibration API wrapper (NEW)
└── lib/
    └── web-vitals.ts        # Performance metrics collection (NEW)
```

### Pattern 1: Dynamic Import for Modal Components
**What:** Use `next/dynamic` to lazy load modal and stats components on demand
**When to use:** For heavy components not needed at initial page load

**Example:**
```typescript
// Source: Next.js official docs (Feb 2026)
// https://nextjs.org/docs/app/guides/lazy-loading

// In game-card.tsx or parent component
import dynamic from 'next/dynamic'

const GameDetailModal = dynamic(
  () => import('@/components/game-detail-modal'),
  {
    loading: () => <GameDetailSkeleton />,
    ssr: false // Modal uses browser-only APIs
  }
)

// Modal + stats components load together when user clicks
// First click: 200-300ms delay (acceptable per CONTEXT.md)
// Subsequent opens: instant (cached in browser)
```

### Pattern 2: System Font Stack
**What:** Use native OS fonts instead of custom web fonts
**When to use:** Always, for optimal performance and native feel

**Example:**
```css
/* Source: modernfontstacks.com + CloudCannon 2026 */
/* In src/app/globals.css */

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif,
               'Apple Color Emoji', 'Segoe UI Emoji';
}

/* Benefits:
 * - Zero network requests (instant render)
 * - No FOUT/FOIT (Flash of Unstyled/Invisible Text)
 * - Respects OS accessibility settings
 * - Familiar to users (native feel)
 */
```

### Pattern 3: Touch Target Enforcement
**What:** Ensure all interactive elements meet 48x48px minimum
**When to use:** All clickable elements (buttons, cards, badges)

**Example:**
```tsx
// Source: Material Design 2026 guidelines
// https://m2.material.io/develop/web/supporting/touch-target

// In game-card.tsx
<div
  className="min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
  onClick={onClick}
  role="button"
>
  {/* Content */}
</div>

// For text buttons
<button className="px-4 py-3 min-h-[48px]">
  Refresh Scores
</button>

// For icon-only buttons (close, back)
<button className="h-12 w-12 flex items-center justify-center">
  <CloseIcon />
</button>
```

### Pattern 4: Layout Shift Prevention (CLS)
**What:** Reserve fixed space for dynamic content to prevent jumping
**When to use:** SSE updates, status badge changes, skeleton → real content transitions

**Example:**
```tsx
// Source: web.dev CLS optimization (2026)
// https://web.dev/articles/optimize-cls

// Reserve space for score display
<div className="min-w-[80px] min-h-[48px] text-3xl font-bold">
  {game.score.home}
</div>

// Reserve max badge width
<div className="min-w-[100px]"> {/* SCHEDULED is widest */}
  <StatusBadge status={game.state} />
</div>

// Skeleton matches exact dimensions
export function GameCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-[180px]">
      {/* Same height as real GameCard (h-[180px]) */}
      {/* Same spacing, same structure */}
    </div>
  )
}
```

### Pattern 5: Network-Adaptive SSE Frequency
**What:** Adjust SSE polling frequency based on connection type
**When to use:** Real-time data updates that consume bandwidth

**Example:**
```typescript
// Source: MDN Network Information API (2026)
// https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API

// In hooks/useNetworkType.ts
export function useNetworkType() {
  const [effectiveType, setEffectiveType] = useState<string>('4g')

  useEffect(() => {
    const connection = (navigator as any).connection
    if (!connection) return // Fallback for unsupported browsers

    const updateType = () => {
      setEffectiveType(connection.effectiveType)
    }

    updateType()
    connection.addEventListener('change', updateType)
    return () => connection.removeEventListener('change', updateType)
  }, [])

  return effectiveType
}

// In hooks/useSSE.ts (extend existing)
export function useSSE<T>(options: UseSSEOptions & { adaptiveFrequency?: boolean }) {
  const networkType = useNetworkType()

  const frequency = useMemo(() => {
    if (!options.adaptiveFrequency) return 10000 // Default 10s

    // Cellular: 20s (50% reduction)
    if (['slow-2g', '2g', '3g'].includes(networkType)) {
      return 20000
    }

    // WiFi/4G: 10s
    return 10000
  }, [networkType, options.adaptiveFrequency])

  // Use frequency to control reconnection interval
  // ... existing SSE logic
}
```

### Pattern 6: Pull-to-Refresh Gesture
**What:** Mobile-native gesture to manually refresh data
**When to use:** Home page with live updating content

**Example:**
```typescript
// Source: LogRocket pull-to-refresh React guide (2026)
// https://blog.logrocket.com/implementing-pull-to-refresh-react-tailwind-css/

// In components/pull-to-refresh.tsx
export function PullToRefresh({ onRefresh, children }: Props) {
  const [startY, setStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const threshold = 80 // px to trigger refresh

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) { // Only at top of page
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (startY === 0) return
    const distance = e.touches[0].clientY - startY
    if (distance > 0) {
      setPullDistance(distance)
      e.preventDefault() // Prevent default browser refresh
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > threshold) {
      onRefresh()
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50) // Success pulse
      }
    }
    setPullDistance(0)
    setStartY(0)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="overscroll-behavior-y-contain" // Override browser default
    >
      {pullDistance > 0 && (
        <div className="text-center py-2">
          {pullDistance > threshold ? '↻ Release to refresh' : '↓ Pull to refresh'}
        </div>
      )}
      {children}
    </div>
  )
}
```

### Pattern 7: Body Scroll Lock for Modals
**What:** Prevent background scroll when modal is open, handle scrollbar width shift
**When to use:** All modal/dialog components

**Example:**
```typescript
// Source: CSS-Tricks scroll lock guide (2026)
// https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/

// In components/game-detail-modal.tsx
import { useEffect } from 'react'

export function GameDetailModal({ isOpen }: Props) {
  useEffect(() => {
    if (!isOpen) return

    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    // Store original scroll position
    const scrollY = window.scrollY

    // Lock scroll with compensation
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.paddingRight = `${scrollbarWidth}px` // Prevent shift

    return () => {
      // Restore scroll
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.paddingRight = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // ... modal content
}
```

### Anti-Patterns to Avoid
- **Lazy loading everything:** Over-aggressive code splitting hurts more than helps. Only lazy load truly optional components (modals, tabs)
- **Custom skeleton animations:** Complex animations increase JavaScript bundle size. Use simple CSS pulse animation
- **Preloading modal on hover:** Adds complexity, wastes bandwidth if user doesn't click. Accept 200-300ms first-open delay
- **Multiple font weights:** Even with system fonts, specifying font-weight: 100-900 can cause layout shifts. Stick to normal (400) and bold (700)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bundle analysis | Custom Webpack plugin inspection | `next analyze` (Turbopack) or `@next/bundle-analyzer` (Webpack) | Built-in tools understand Next.js route structure, show full import chains |
| Image optimization | Manual srcset/picture elements | Next.js Image component | Automatic WebP/AVIF conversion, responsive sizes, blur placeholders, lazy loading |
| Lazy loading images | Custom IntersectionObserver logic | Native `loading="lazy"` attribute + Image component | Browser-optimized, handles edge cases (bfcache, viewport changes) |
| Touch gesture detection | Raw touch event handlers | Library like `react-swipeable` or `use-gesture` | Handles velocity, direction, cancellation, touch vs mouse |
| Core Web Vitals tracking | Manual performance.now() timing | `web-vitals` library | Official Google library, matches CrUX report methodology |
| Responsive breakpoints | Custom media queries | Tailwind breakpoints (sm/md/lg/xl/2xl) | Mobile-first by default, consistent scale, well-tested |
| Body scroll lock | Custom overflow:hidden logic | Radix UI Dialog (already using) | Handles iOS Safari quirks, scrollbar width compensation, focus trap |

**Key insight:** Next.js 16 and modern browsers have solved most performance problems natively. Custom solutions for these problems introduce bugs (iOS scroll lock, image aspect ratio shifts, incorrect Web Vitals measurement). Use battle-tested tools.

## Common Pitfalls

### Pitfall 1: Skeleton Dimensions Don't Match Content
**What goes wrong:** Skeleton is 150px tall, real content is 180px. CLS score increases when content swaps in.
**Why it happens:** Developers eyeball skeleton dimensions instead of measuring real content.
**How to avoid:** Inspect real content in DevTools, copy exact height/width to skeleton. Use Tailwind's fixed height classes (h-[180px]).
**Warning signs:** Content "jumps" when loading completes, CLS > 0.1 in Lighthouse.

### Pitfall 2: Dynamic Imports Break SSR
**What goes wrong:** Modal uses `window` or `document` directly, crashes during SSR build.
**Why it happens:** Dynamic imports still run during SSR unless `ssr: false` is specified.
**How to avoid:** Always use `ssr: false` for components with browser-only APIs (Vibration, Network Information, IntersectionObserver).
**Warning signs:** Build errors like "window is not defined", hydration mismatches.

### Pitfall 3: Touch Targets Look Big Enough But Aren't
**What goes wrong:** Button looks 48px tall but has negative margin or absolute positioning that reduces actual hit area.
**Why it happens:** Visual size ≠ hit area size. Overlapping elements, z-index issues, or parent with overflow:hidden clip the touch target.
**How to avoid:** Test with Chrome DevTools mobile emulation, use "Show rulers" to verify actual hit area. Set `min-w-[48px] min-h-[48px]` on interactive elements.
**Warning signs:** Users tap multiple times, click events don't fire, accessibility audit failures.

### Pitfall 4: Network Information API Not Available
**What goes wrong:** Code assumes `navigator.connection` exists, crashes on Safari/Firefox.
**Why it happens:** Network Information API has limited browser support (Chrome/Edge/Samsung Internet only as of 2026).
**How to avoid:** Always check for API existence before using. Provide fallback (assume WiFi = 10s frequency).
**Warning signs:** TypeError in browser console on non-Chrome browsers.

### Pitfall 5: Body Scroll Lock Without Scrollbar Compensation
**What goes wrong:** Modal opens, page jumps to the right by 15-17px (scrollbar width).
**Why it happens:** `overflow: hidden` removes scrollbar, content shifts to fill the space.
**How to avoid:** Calculate scrollbar width (`window.innerWidth - document.documentElement.clientWidth`), add as `padding-right` to body.
**Warning signs:** Horizontal jump when modal opens, especially noticeable on centered content.

### Pitfall 6: Lazy Loading Above-the-Fold Images
**What goes wrong:** Hero image or team logos in first 3 cards use `loading="lazy"`, causing delay.
**Why it happens:** Lazy loading is designed for below-the-fold images. Above-the-fold images should load immediately.
**How to avoid:** Use `priority` prop on Next.js Image for above-the-fold images. Only lazy load images below the fold.
**Warning signs:** LCP > 2.5s, images "pop in" after page loads.

### Pitfall 7: Haptic Feedback Without User Activation
**What goes wrong:** Vibration API calls fail silently or crash.
**Why it happens:** Browsers require user activation (tap/click) before allowing vibration.
**How to avoid:** Only trigger haptic feedback in response to user events (onClick, onTouchEnd). Never on mount or timer.
**Warning signs:** Vibration works in dev but not production, console warnings about "user activation required".

### Pitfall 8: Over-Optimization Reduces Maintainability
**What goes wrong:** Code becomes unreadable with micro-optimizations (inline styles to save 1KB, manual code splitting everywhere).
**Why it happens:** Developer focuses on bundle size over code quality.
**How to avoid:** Follow Next.js defaults (automatic code splitting), only optimize measurable bottlenecks. Readability > 1-2KB savings.
**Warning signs:** Team struggles to understand code, bugs increase, diminishing returns on optimization effort.

## Code Examples

Verified patterns from official sources:

### Next.js Image with Blur Placeholder
```tsx
// Source: Next.js official docs (Feb 2026)
// https://nextjs.org/docs/app/api-reference/components/image

import Image from 'next/image'

// In game-card.tsx
{game.homeTeam.logoUrl ? (
  <Image
    src={game.homeTeam.logoUrl}
    alt={game.homeTeam.name}
    width={40}
    height={40}
    className="rounded-full"
    placeholder="blur"
    blurDataURL="data:image/svg+xml;base64,..." // Low-res preview
    loading={index < 3 ? "eager" : "lazy"} // First 3 cards eager, rest lazy
  />
) : (
  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
    {game.homeTeam.abbreviation}
  </div>
)}
```

### Tailwind Mobile-First Responsive Design
```tsx
// Source: Tailwind CSS official docs (2026)
// https://tailwindcss.com/docs/responsive-design

// In game-list.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/*
   * Mobile (default): 1 column (full width cards for max touch area)
   * Tablet (md:768px+): 2 columns
   * Desktop (lg:1024px+): 3 columns
   */}
  {games.map(game => <GameCard key={game.id} game={game} />)}
</div>
```

### Web Vitals Measurement
```typescript
// Source: web-vitals library (Google official)
// https://github.com/GoogleChrome/web-vitals

// In lib/web-vitals.ts
import { getCLS, getFCP, getLCP, getTTFB, getFID } from 'web-vitals'

export function reportWebVitals() {
  getCLS(console.log) // Cumulative Layout Shift
  getFCP(console.log) // First Contentful Paint
  getLCP(console.log) // Largest Contentful Paint
  getTTFB(console.log) // Time to First Byte
  getFID(console.log) // First Input Delay (deprecated, but still tracked)

  // In production, send to analytics:
  // getCLS((metric) => sendToAnalytics(metric))
}

// In app/layout.tsx
useEffect(() => {
  if (process.env.NODE_ENV === 'production') {
    reportWebVitals()
  }
}, [])
```

### Haptic Feedback with WebHaptics
```typescript
// Source: WebHaptics library (March 2026)
// https://medium.com/@springmusk/web-haptics-the-npm-package-everyones-adding-for-haptic-feedback-4c774f10caaa

import { WebHaptics } from 'web-haptics'

// In hooks/useHapticFeedback.ts
export function useHapticFeedback() {
  const trigger = (pattern: 'success' | 'nudge' | 'error' | 'buzz') => {
    if (!WebHaptics.isSupported) return // Graceful degradation
    WebHaptics.trigger(pattern)
  }

  return { trigger }
}

// Usage in game-card.tsx
const { trigger } = useHapticFeedback()

const handleClick = () => {
  trigger('nudge') // Subtle tap feedback
  onClick()
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom Webpack config | Next.js automatic optimization | Next.js 13+ (2023) | Automatic code splitting by route, tree-shaking, no manual config needed |
| `@next/bundle-analyzer` only | `next analyze` (Turbopack) | Next.js 16.1 (Feb 2026) | Integrated bundle analyzer with module graph, precise import tracing |
| React.lazy() + Suspense | next/dynamic | Next.js 9+ (2019) | Enhanced with loading prop, SSR control, preloading |
| Custom web fonts | System font stacks | Industry shift (2024-2026) | GitHub, Notion, CloudCannon all switched. Zero network cost, native feel |
| First Input Delay (FID) | Interaction to Next Paint (INP) | Core Web Vitals update (Mar 2024) | More accurate responsiveness measurement, 200ms threshold |
| Manual srcset/picture | Next.js Image component | Next.js 10+ (2020) | Automatic WebP/AVIF, responsive sizes, lazy loading, blur placeholders |
| Custom scroll lock | Radix UI Dialog | Radix stable (2021+) | Handles iOS Safari quirks, focus trap, accessibility built-in |

**Deprecated/outdated:**
- **FID (First Input Delay):** Replaced by INP (Interaction to Next Paint) in March 2024. Still measured but not a Core Web Vital.
- **Custom Webpack plugins for bundle analysis:** `next analyze` is built-in and superior for Turbopack builds (Next.js 16.1+).
- **body-scroll-lock library:** Maintenance issues, better to use Radix Dialog or manual implementation with modern patterns.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 30.3.0 + React Testing Library 16.3.2 |
| Config file | jest.config.js |
| Quick run command | `npm test -- --testPathPattern="performance|mobile"` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Desktop load time < 1s | integration | Lighthouse CI in GitHub Actions | ❌ Wave 0 |
| PERF-02 | Mobile load time < 2s | integration | Lighthouse CI mobile preset | ❌ Wave 0 |
| PERF-05 | No layout shifts (CLS < 0.1) | integration | Lighthouse CLS measurement | ❌ Wave 0 |
| MOB-01 | Responsive design across breakpoints | unit | `npm test tests/components/game-card.test.tsx` | ✅ (extend) |
| MOB-02 | 48x48px touch targets | unit | `npm test tests/accessibility/touch-targets.test.tsx` | ❌ Wave 0 |
| MOB-03 | Readable text without zoom | unit | `npm test tests/accessibility/text-sizes.test.tsx` | ❌ Wave 0 |
| MOB-04 | Cellular data optimization | unit | `npm test tests/hooks/useNetworkType.test.tsx` | ❌ Wave 0 |
| UX-02 | Ad-free interface maintained | manual | Visual inspection | Manual only |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="<feature>"` (unit tests only, < 10s)
- **Per wave merge:** `npm test` (full suite including new tests)
- **Phase gate:** Full test suite + Lighthouse CI (desktop + mobile) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `.github/workflows/lighthouse-ci.yml` — GitHub Actions workflow for Lighthouse performance tests (PERF-01, PERF-02, PERF-05)
- [ ] `tests/accessibility/touch-targets.test.tsx` — Unit tests verifying 48x48px minimum for interactive elements (MOB-02)
- [ ] `tests/accessibility/text-sizes.test.tsx` — Unit tests verifying 16px base text, no mobile scaling (MOB-03)
- [ ] `tests/hooks/useNetworkType.test.tsx` — Unit tests for Network Information API wrapper (MOB-04)
- [ ] `tests/hooks/useHapticFeedback.test.tsx` — Unit tests for Vibration API wrapper
- [ ] `tests/components/pull-to-refresh.test.tsx` — Unit tests for pull-to-refresh gesture
- [ ] Extend `tests/components/game-card.test.tsx` — Add responsive breakpoint tests (MOB-01)
- [ ] Lighthouse CI config: `lighthouserc.json` — Performance budgets (LCP < 2.5s, CLS < 0.1)

## Sources

### Primary (HIGH confidence)
- [Next.js Lazy Loading Guide](https://nextjs.org/docs/app/guides/lazy-loading) - Official Next.js documentation for dynamic imports and code splitting
- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image) - Official documentation for Image optimization
- [Next.js Bundle Analyzer (Turbopack)](https://nextjs.org/blog/next-16-1) - Next.js 16.1 release notes introducing built-in bundle analyzer
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design) - Official Tailwind documentation for mobile-first breakpoints
- [Material Design Touch Targets](https://m2.material.io/develop/web/supporting/touch-target) - Google Material Design 48x48dp standard
- [Network Information API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) - MDN Web Docs for network type detection
- [Vibration API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) - MDN Web Docs for haptic feedback
- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals) - Official Google library for Core Web Vitals measurement

### Secondary (MEDIUM confidence)
- [Core Web Vitals 2026 Guide](https://www.corewebvitals.io/core-web-vitals) - LCP, INP, CLS thresholds and optimization strategies
- [Optimize CLS (web.dev)](https://web.dev/articles/optimize-cls) - Google's official guide to preventing layout shifts
- [System Font Stack (CloudCannon)](https://cloudcannon.com/blog/why-we-switched-to-the-system-font-stack/) - Real-world system font adoption (2026)
- [WebHaptics Package](https://medium.com/@springmusk/web-haptics-the-npm-package-everyones-adding-for-haptic-feedback-4c774f10caaa) - Cross-framework haptic feedback library (March 2026)
- [Pull-to-Refresh React](https://blog.logrocket.com/implementing-pull-to-refresh-react-tailwind-css/) - Implementation guide for mobile gestures
- [Body Scroll Lock (CSS-Tricks)](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/) - Modern scroll lock patterns
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring) - Chrome DevTools Lighthouse scoring methodology

### Tertiary (LOW confidence)
- [Next.js Bundle Optimization Case Study](https://blog.nazrulkabir.com/2026/01/nextjs-bundle-size-optimization-case-study/) - 40% bundle reduction techniques (Jan 2026)
- [Turbopack Complete Guide](https://dev.to/pockit_tools/turbopack-in-2026-the-complete-guide-to-nextjss-rust-powered-bundler-oda) - Community guide to Turbopack features (2026)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Next.js, React, Tailwind all verified from official docs; web-vitals is Google official library
- Architecture: HIGH - All patterns sourced from official Next.js docs, Material Design guidelines, or MDN Web Docs
- Pitfalls: MEDIUM-HIGH - Based on official documentation warnings + community best practices (LogRocket, CSS-Tricks, web.dev)

**Research date:** 2026-03-12
**Valid until:** 2026-06-12 (3 months) - Next.js updates frequently, review after major releases

---

*Research for Phase 05: Performance & Polish*
*All recommendations align with CONTEXT.md locked decisions*
