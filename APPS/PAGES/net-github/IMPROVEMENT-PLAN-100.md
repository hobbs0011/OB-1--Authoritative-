# NET GitHub Dashboard — 100x Improvement Plan

**Goal:** Make the deployed `net-github-dashboard` visually, functionally, and technically 3x better than the current v1.
**Live URL:** https://canon.net-github-dashboard.pages.dev
**App path:** `APPS/PAGES/net-github/`

---

## HOW TO USE THIS PLAN

Each item has **3 sub-steps**. Execute them in order. After each batch of 10 items, run a local preview + Playwright audit before pushing.

**Phase convention:**
- **Phase 1 — Visual Polish (1–20)**
- **Phase 2 — Structure & Layout (21–35)**
- **Phase 3 — Navigation & Routing (36–45)**
- **Phase 4 — Interactivity (46–60)**
- **Phase 5 — Content & Branding (61–70)**
- **Phase 6 — Performance (71–80)**
- **Phase 7 — Accessibility (81–90)**
- **Phase 8 — SEO/Meta/Responsive (91–95)**
- **Phase 9 — Code Quality (96–100)**

---

## PHASE 1 — VISUAL POLISH (Items 1–20)

### 1. Add brand gradient to the sticky header background
- Sub 1.1: Add `background: linear-gradient(90deg, rgba(168,85,247,.12), rgba(245,158,11,.08))` to `.global-header`
- Sub 1.2: Add a bottom border glow with `box-shadow: 0 1px 0 rgba(168,85,247,.35)`
- Sub 1.3: Verify header stays readable on scroll with Playwright screenshot

### 2. Add NET purple glow to the logo text
- Sub 2.1: Replace gradient text on `.header-logo-text` with NET-specific purple-to-gold gradient
- Sub 2.2: Add `filter: drop-shadow(0 0 6px rgba(168,85,247,.4))` to logo SVG
- Sub 2.3: Ensure contrast passes WCAG AA on both dark and light sections

### 3. Add hover micro-animations to all sidebar items
- Sub 3.1: Add `transition: transform .15s ease, background .15s ease` to `.sidebar-item`
- Sub 3.2: On hover, apply `transform: translateX(3px)` and `background: rgba(168,85,247,.08)`
- Sub 3.3: Add `@media (prefers-reduced-motion: reduce)` override

### 4. Add active-state left border accent to sidebar
- Sub 4.1: Add `border-left: 3px solid transparent` to `.sidebar-item`
- Sub 4.2: For `.sidebar-item.active`, set `border-left-color: var(--accent-primary)`
- Sub 4.3: Add smooth transition so the accent slides when switching views

### 5. Add subtle noise/grain texture to the body background
- Sub 5.1: Create a 4×4px SVG noise data URI
- Sub 5.2: Apply `background-image: url(...)` with `opacity: .03` on `body::before`
- Sub 5.3: Confirm it does not affect text contrast or performance

### 6. Improve button hover states with NET-branded shadows
- Sub 6.1: Add `box-shadow: 0 0 18px rgba(168,85,247,.45)` to `.btn-primary:hover`
- Sub 6.2: Add matching gold secondary hover shadow to `.btn-secondary:hover`
- Sub 6.3: Add `transform: translateY(-1px)` for tactile feel

### 7. Add pulsing live indicator dot in the header
- Sub 7.1: Insert a `.live-dot` span next to the repo title
- Sub 7.2: Animate with `@keyframes livePulse` using NET purple
- Sub 7.3: Add `aria-label="Live"` for accessibility

### 8. Add file-row hover highlight with left accent bar
- Sub 8.1: Add `border-left: 2px solid transparent` to `.file-row`
- Sub 8.2: On hover, set `border-left-color: var(--accent-primary)` and lighten background
- Sub 8.3: Keep header row unaffected with `:not(.file-row-header)`

### 9. Improve markdown typography and spacing
- Sub 9.1: Increase `.markdown-body` line-height to `1.7` and add `letter-spacing: .01em`
- Sub 9.2: Style `h1/h2/h3` with tighter NET-brand color hierarchy
- Sub 9.3: Add subtle bottom separators under `h2` elements

### 10. Add NET-branded scrollbar styling
- Sub 10.1: Add `::-webkit-scrollbar-thumb` with NET purple gradient
- Sub 10.2: Add `scrollbar-color` for Firefox
- Sub 10.3: Verify scrollbar is visible but not overpowering

### 11. Add loading shimmer to repo cards on route change
- Sub 11.1: Create `@keyframes shimmer` with a moving gradient
- Sub 11.2: Apply `.shimmer` class to `.repo-card` during view switch
- Sub 11.3: Remove shimmer after `showView()` completes

### 12. Add subtle gradient border to readme container
- Sub 12.1: Replace solid `border: 1px solid var(--border-default)` with gradient border using `border-image`
- Sub 12.2: Fallback to solid border for older browsers
- Sub 12.3: Verify border remains subtle and not visually noisy

### 13. Improve avatar ring with NET gradient
- Sub 13.1: Add `border: 2px solid transparent` and `background-clip: padding-box` trick
- Sub 13.2: Apply NET purple-to-gold gradient to `.header-avatar` wrapper
- Sub 13.3: Verify rounded avatar shows gradient ring correctly

### 14. Add hover tooltips to icon-only buttons
- Sub 14.1: Add `title` attributes to notification, search, and action buttons
- Sub 14.2: Build custom `.tooltip` component for richer content if needed
- Sub 14.3: Ensure tooltips do not clip on mobile viewports

### 15. Add animated route transition
- Sub 15.1: Add `transition: opacity .2s ease, transform .2s ease` to `.view`
- Sub 15.2: In `showView()`, briefly set `opacity: 0; transform: translateY(6px)` before activating new view
- Sub 15.3: Use `requestAnimationFrame` to avoid flicker

### 16. Add NET-branded focus rings
- Sub 16.1: Define `--focus-ring: 0 0 0 3px rgba(168,85,247,.35)` in `:root`
- Sub 16.2: Apply `box-shadow: var(--focus-ring)` on `:focus-visible` for interactive elements
- Sub 16.3: Ensure focus ring is visible on all controls including sidebar and tabs

### 17. Improve issue row hover with slide indicator
- Sub 17.1: Add `transition: transform .15s ease, background .15s ease` to `.issue-item`
- Sub 17.2: On hover, apply `transform: translateX(4px)` and subtle background shift
- Sub 17.3: Add reduced-motion media query fallback

### 18. Add subtle NET glow to the contribution graph container
- Sub 18.1: Add `box-shadow: inset 0 0 24px rgba(168,85,247,.08)` to `.contribution-graph`
- Sub 18.2: Add inner border glow with `border-color: rgba(168,85,247,.2)` on hover
- Sub 18.3: Verify it does not reduce text readability in right sidebar

### 19. Add status indicator colors to student rows
- Sub 19.1: Add `.status-badge.active` with green glow and `.status-badge.pending` with amber glow
- Sub 19.2: Add `box-shadow` to badges for depth
- Sub 19.3: Verify status text remains readable on dark backgrounds

### 20. Add brand color to selection highlight
- Sub 20.1: Update `::selection` to `background: rgba(168,85,247,.3)`
- Sub 20.2: Add `color: #fff` for selected text
- Sub 20.3: Verify selection looks good on both dark and light text

---

## PHASE 2 — STRUCTURE & LAYOUT (Items 21–35)

### 21. Add breadcrumb navigation to program detail views
- Sub 21.1: Add `.breadcrumb` component above `.program-detail-header`
- Sub 21.2: Populate with `Home > Programs > NET-Tigers`
- Sub 21.3: Add separator styling with NET purple chevrons

### 22. Add repository stats row under repo header
- Sub 22.1: Add `.repo-stats` with items: stars, forks, watchers, open issues
- Sub 22.2: Style each stat with icon + number + label
- Sub 22.3: Make stats responsive and collapsible on mobile

### 23. Add commit graph mini-sparkline in file explorer header
- Sub 23.1: Generate a small SVG sparkline from fake commit history data
- Sub 23.2: Place it in `.file-explorer-header` next to file count
- Sub 23.3: Ensure sparkline is purely decorative with `aria-hidden="true"`

### 24. Add “Recently pushed” branch indicator under repo title
- Sub 24.1: Add `.branch-indicator` below `.repo-title`
- Sub 24.2: Show branch name with dropdown arrow icon
- Sub 24.3: Add hover tooltip with last commit message

### 25. Add file type filter chips above file explorer
- Sub 25.1: Add `.filter-chips` row with `All`, `Code`, `Docs`, `Media`
- Sub 25.2: Wire up click handlers to filter file rows by type
- Sub 25.3: Persist active filter in URL hash

### 26. Add quick-add dropdown for repository actions
- Sub 26.1: Add `.quick-actions` dropdown with options: New file, Upload, Clone, Download ZIP
- Sub 26.2: Style dropdown with NET dark theme and purple accent
- Sub 26.3: Close dropdown on outside click and Escape key

### 27. Add pinned section separator in home view
- Sub 27.1: Add `.section-divider` between file explorer and readme
- Sub 27.2: Style with subtle gradient and “README.md” label
- Sub 27.3: Ensure divider collapses gracefully on narrow viewports

### 28. Add right sidebar collapse toggle on mobile/tablet
- Sub 28.1: Add `.sidebar-toggle` button visible only on `<1100px`
- Sub 28.2: Toggle `.sidebar-right` visibility with `transform: translateX`
- Sub 28.3: Persist state in `localStorage`

### 29. Add sticky table of contents for long READMEs
- Sub 29.1: Parse `markdown-body` headings and build `.toc` list
- Sub 29.2: Position `.toc` in right sidebar below About card
- Sub 29.3: Highlight active heading on scroll with IntersectionObserver

### 30. Add empty state placeholders for all lists
- Sub 30.1: Design `.empty-state` component with icon, title, description, and CTA
- Sub 30.2: Apply to Issues, Marketplace, Students, and Explore views
- Sub 30.3: Ensure empty states match NET dark theme

### 31. Add footer with copyright and NET branding
- Sub 31.1: Add `<footer class="site-footer">` below `.main-container`
- Sub 31.2: Include copyright, email link, and “Mouse to Tiger” tagline
- Sub 31.3: Style footer to match GitHub’s minimal dark footer

### 32. Add branch switcher dropdown simulation
- Sub 32.1: Add `.branch-switcher` component next to repo title
- Sub 32.2: Populate with fake branches: `main`, `dev`, `feature/assessment-v2`
- Sub 32.3: Add search/filter inside dropdown with keyboard nav

### 33. Add pull request status indicators in file list
- Sub 33.1: Add `.pr-status` badge to file rows with merging/open/closed states
- Sub 33.2: Style badges with green/amber/red NET-themed colors
- Sub 33.3: Add tooltip with PR title and author on hover

### 34. Add language filter tabs on repository cards
- Sub 34.1: Add `.language-filter` chips: All, TypeScript, Python, CSS, JavaScript, Rust
- Sub 34.2: Wire filter to show/hide repo cards by language
- Sub 34.3: Animate card show/hide with fade transition

### 35. Add “Jump to” quick links panel on top of sidebar
- Sub 35.1: Add `.jump-panel` with anchors: Home, Repos, Programs, Students, Issues
- Sub 35.2: Style with compact pills and NET purple active state
- Sub 35.3: Ensure jump panel does not overlap content on small screens

---

## PHASE 3 — NAVIGATION & ROUTING (Items 36–45)

### 36. Add route transition animation
- Sub 36.1: Create `@keyframes viewEnter` with fade + slide up
- Sub 36.2: Apply animation in `showView()` after activating target view
- Sub 36.3: Cancel previous animation frames to avoid conflicts

### 37. Add browser history support beyond hash
- Sub 37.1: Replace hash-based routing with `pushState` + `popstate` listener
- Sub 37.2: Update `getViewFromHash()` to parse `window.location.pathname`
- Sub 37.3: Add fallback for browsers without History API

### 38. Add loading skeleton for async content
- Sub 38.1: Create `.skeleton` shimmer blocks for repo cards and lists
- Sub 38.2: Show skeleton for 300ms before revealing content on route change
- Sub 38.3: Ensure skeleton does not flash on cached navigations

### 39. Add “Back to top” button
- Sub 39.1: Add `.back-to-top` fixed button that appears after scrolling 600px
- Sub 39.2: Style with NET purple and circular shape
- Sub 39.3: Animate scroll with `scroll-behavior: smooth`

### 40. Add keyboard shortcuts help modal
- Sub 40.1: Add `?` key listener to open `.shortcuts-modal`
- Sub 40.2: List shortcuts: `Ctrl+K` search, `G+H` home, `G+I` issues, `G+P` profile
- Sub 40.3: Add close on Escape and outside click

### 41. Add active tab scroll-into-view for repo tabs
- Sub 41.1: In `updateActiveNav()`, call `element.scrollIntoView({ block: "nearest" })`
- Sub 41.2: Apply only when tab is outside visible scroll area
- Sub 41.3: Verify smooth behavior with reduced-motion disabled

### 42. Add breadcrumb click-to-copy URL
- Sub 42.1: Add click handlers to breadcrumb links
- Sub 42.2: On click, copy full URL to clipboard using `navigator.clipboard`
- Sub 42.3: Show toast notification “Link copied”

### 43. Add search results placeholder routing
- Sub 43.1: Add `#/search?q=` route parsing
- Sub 43.2: Show search results view with mock results
- Sub 43.3: Highlight matching text in result titles

### 44. Add 404/unknown route fallback with suggestions
- Sub 44.1: Enhance `view-default` with helpful suggestions
- Sub 44.2: Add links: Home, Repositories, Programs
- Sub 44.3: Style 404 with NET-themed illustration or icon

### 45. Add route preloading for faster perceived navigation
- Sub 45.1: Add `<link rel="prefetch">` for likely next views on hover
- Sub 45.2: Preload program detail pages when hovering sidebar links
- Sub 45.3: Measure and log time-to-interactive after prefetch

---

## PHASE 4 — INTERACTIVITY (Items 46–60)

### 46. Add functional search filtering in repositories view
- Sub 46.1: Wire `input` event on search box to filter `.repo-card` elements
- Sub 46.2: Show “No repositories found” empty state when filter returns zero
- Sub 46.3: Highlight matched text in repo titles

### 47. Add functional search filtering in issues view
- Sub 47.1: Wire search input to filter by issue title and number
- Sub 47.2: Add status filter chips: All, Open, Closed
- Sub 47.3: Animate filtered items with staggered fade

### 48. Add functional search filtering in students view
- Sub 48.1: Wire search input to filter by student name or program
- Sub 48.2: Add program filter dropdown
- Sub 48.3: Add status filter: All, Active, Pending

### 49. Add “New issue” modal with form fields
- Sub 49.1: Create `.modal-overlay` with title, body, and label inputs
- Sub 49.2: Style modal with NET dark theme and purple accent border
- Sub 49.3: Add close on Escape, overlay click, and form reset

### 50. Add “Invite student” modal with form fields
- Sub 50.1: Create `.modal-overlay` with email, program select, and message fields
- Sub 50.2: Validate email format before allowing submit
- Sub 50.3: Show success toast after submit

### 51. Add toast notification system
- Sub 51.1: Create `.toast-container` fixed at bottom-right
- Sub 51.2: Add `showToast(message, type)` helper with success/error/info variants
- Sub 51.3: Auto-dismiss after 4 seconds with slide-out animation

### 52. Add interactive contribution graph tooltips
- Sub 52.1: Add `title` attribute to each `.contribution-day` with contribution count
- Sub 52.2: Add custom tooltip on hover showing exact date and count
- Sub 52.3: Ensure tooltip does not overflow viewport

### 53. Add program card hover depth effect
- Sub 53.1: Add `transform: translateY(-4px)` and stronger shadow on hover
- Sub 53.2: Add subtle scale effect to `.program-card-bg`
- Sub 53.3: Ensure touch devices get active state instead of hover

### 54. Add file row click-to-expand detail panel
- Sub 54.1: Add click handler to file rows to show file detail panel
- Sub 54.2: Create `.file-detail-panel` with mock content
- Sub 54.3: Add close button and Escape-to-close behavior

### 55. Add program stat counter animation
- Sub 55.1: Create `animateCounter(element, target)` function
- Sub 55.2: Trigger on program detail view entry with IntersectionObserver
- Sub 55.3: Add easing function for smooth counting effect

### 56. Add issue status toggle interaction
- Sub 56.1: Add click handler to issue status badges
- Sub 56.2: Toggle between Open/Closed with confirmation modal
- Sub 56.3: Update UI with smooth color transition

### 57. Add Star/Fork button counters with animation
- Sub 57.1: Add count display next to Star and Fork buttons
- Sub 57.2: Animate count increment on click with scale pop
- Sub 57.3: Persist state in localStorage

### 58. Add expandable README sections
- Sub 58.1: Add toggle buttons next to `h2` headings in README
- Sub 58.2: Collapse/expand content below heading with smooth height animation
- Sub 58.3: Remember collapsed state in sessionStorage

### 59. Add program comparison feature
- Sub 59.1: Add checkboxes to program cards for comparison selection
- Sub 59.2: Add floating “Compare” button when 2+ programs selected
- Sub 59.3: Show comparison modal with side-by-side stats

### 60. Add dark/light theme toggle
- Sub 60.1: Add `.theme-toggle` button in header
- Sub 60.2: Toggle `data-theme` attribute on `<html>` and persist in localStorage
- Sub 60.3: Define CSS custom properties for both themes

---

## PHASE 5 — CONTENT & BRANDING (Items 61–70)

### 61. Replace all placeholder NET repo names with real project names
- Sub 61.1: Audit all `href` and text nodes for placeholder repo names
- Sub 61.2: Replace with actual NET projects: `net-tiger-assessment`, `net-pet-ai`, `soul-logger`
- Sub 61.3: Verify all links resolve to valid views or external URLs

### 62. Add real Vietnamese translations to all UI strings
- Sub 62.1: Audit visible text for missing VI translations
- Sub 62.2: Add `data-vi` attributes or separate VI text nodes
- Sub 62.3: Build simple language toggle switch

### 63. Add NET brand taglines and copy throughout
- Sub 63.1: Replace generic GitHub copy with NET-specific messaging
- Sub 63.2: Add “From Mouse to Tiger” tagline in strategic locations
- Sub 63.3: Ensure tone is premium, bilingual, and confidence-focused

### 64. Add realistic commit messages and author names
- Sub 64.1: Replace fake commits with NET-relevant messages
- Sub 64.2: Use real author names: Michael Hobbs, OBI, etc.
- Sub 64.3: Add author avatars next to commit messages

### 65. Add program-specific imagery and icons
- Sub 65.1: Add unique SVG icons for each program in sidebar and cards
- Sub 65.2: Use tiger, cub, briefcase, graduation cap, and career icons
- Sub 65.3: Ensure icons are consistent size and color

### 66. Add NET color system tokens to CSS
- Sub 66.1: Audit hardcoded colors and replace with CSS custom properties
- Sub 66.2: Add tokens for success, warning, danger, info using NET palette
- Sub 66.3: Document token names in `:root` comment block

### 67. Add loading states with NET branding
- Sub 67.1: Create `.loading-spinner` with NET purple color
- Sub 67.2: Add loading text “Loading NET dashboard...”
- Sub 67.3: Add pulsing placeholder blocks for async content

### 68. Add empty state illustrations using NET brand style
- Sub 68.1: Design SVG empty states with NET tiger/logo motifs
- Sub 68.2: Apply to Issues, Marketplace, Students empty views
- Sub 68.3: Keep illustrations minimal and dark-themed

### 69. Add OBI widget branding integration
- Sub 69.1: Add OBI avatar and name to right sidebar
- Sub 69.2: Style OBI chat widget to match NET dark theme
- Sub 69.3: Add NET-branded quick reply chips

### 70. Add footer links to live NET properties
- Sub 70.1: Link to `naturalenglishtraining.pages.dev`
- Sub 70.2: Link to `net-marketing-landing.pages.dev`
- Sub 70.3: Add social/contact links: email, WhatsApp, etc.

---

## PHASE 6 — PERFORMANCE (Items 71–80)

### 71. Inline critical CSS above the fold
- Sub 71.1: Extract above-the-fold CSS into a `<style>` block in `<head>`
- Sub 71.2: Keep full `style.css` as async load
- Sub 71.3: Measure FCP improvement with Lighthouse

### 72. Add font display swap for Google Fonts
- Sub 72.1: Append `&display=swap` to Google Fonts URL
- Sub 72.2: Add `font-display: swap` in `@font-face` if self-hosting
- Sub 72.3: Verify text remains readable during font load

### 73. Preload critical assets
- Sub 73.1: Add `<link rel="preload">` for NET logo and key hero images
- Sub 73.2: Add `as="image"` and `fetchpriority="high"` attributes
- Sub 73.3: Verify no duplicate preloads in HTML

### 74. Lazy load offscreen images
- Sub 74.1: Add `loading="lazy"` to all `<img>` tags below the fold
- Sub 74.2: Add `decoding="async"` for better parallel decoding
- Sub 74.3: Verify lazy load does not break layout

### 75. Reduce CSS specificity and unused rules
- Sub 75.1: Run CSS coverage audit in DevTools
- Sub 75.2: Remove unused selectors and consolidate duplicates
- Sub 75.3: Keep specificity flat to avoid override chains

### 76. Add `will-change` hints for animated elements
- Sub 76.1: Add `will-change: transform, opacity` to `.view` during transition
- Sub 76.2: Remove `will-change` after animation ends
- Sub 76.3: Avoid overusing to prevent memory bloat

### 77. Optimize SVG icons with sprite sheet
- Sub 77.1: Inline all SVG icons into a single `<svg style="display:none">` sprite
- Sub 77.2: Replace inline SVG paths with `<use href="#icon-name">`
- Sub 77.3: Verify all icons render correctly after sprite migration

### 78. Add resource hints for external fonts
- Sub 78.1: Add `dns-prefetch` for `fonts.googleapis.com` and `fonts.gstatic.com`
- Sub 78.2: Add `preconnect` with `crossorigin` for Google Fonts
- Sub 78.3: Verify no duplicate resource hints

### 79. Minimize layout shifts with aspect-ratio boxes
- Sub 79.1: Add `aspect-ratio` to image containers where missing
- Sub 79.2: Reserve space for dynamic content cards
- Sub 79.3: Verify CLS stays under 0.1 in Lighthouse

### 80. Add `fetchpriority` to above-the-fold images
- Sub 80.1: Add `fetchpriority="high"` to NET logo and hero images
- Sub 80.2: Add `fetchpriority="low"` to decorative images
- Sub 80.3: Verify image loading order in Network panel

---

## PHASE 7 — ACCESSIBILITY (Items 81–90)

### 81. Add skip navigation links
- Sub 81.1: Add `.skip-link` before header pointing to `#main-content`
- Sub 81.2: Style skip link to be visible on focus only
- Sub 81.3: Verify keyboard-only navigation works end-to-end

### 82. Add ARIA labels to all icon-only buttons
- Sub 82.1: Audit all `<button>` elements with only SVG children
- Sub 82.2: Add descriptive `aria-label` to each
- Sub 82.3: Verify with screen reader or axe DevTools

### 83. Add landmark roles to major regions
- Sub 83.1: Ensure `<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>` are present
- Sub 83.2: Add `aria-label` to each landmark
- Sub 83.3: Verify landmark hierarchy in DevTools Accessibility pane

### 84. Ensure all interactive elements have focus styles
- Sub 84.1: Audit all interactive elements for `:focus-visible` styles
- Sub 84.2: Add custom focus ring with NET purple where missing
- Sub 84.3: Verify focus indicator is at least 2px and high contrast

### 85. Add ARIA live regions for dynamic content
- Sub 85.1: Add `aria-live="polite"` to toast container
- Sub 85.2: Add `aria-live="polite"` to view content area for route changes
- Sub 85.3: Ensure live regions do not announce on every route change

### 86. Ensure color contrast meets WCAG AA
- Sub 86.1: Run axe DevTools or Lighthouse contrast audit
- Sub 86.2: Fix any text/background pairs below 4.5:1
- Sub 86.3: Document approved color pairs in design tokens

### 87. Add alt text to all meaningful images
- Sub 87.1: Audit all `<img>` tags for missing or empty `alt`
- Sub 87.2: Add descriptive alt text or empty alt for decorative images
- Sub 87.3: Verify alt text is concise and contextually relevant

### 88. Add keyboard navigation for tabs and dropdowns
- Sub 88.1: Implement Arrow key navigation for repo tabs
- Sub 88.2: Implement Enter/Space to activate tab
- Sub 88.3: Add `role="tablist"`, `role="tab"`, `role="tabpanel"` ARIA

### 89. Add screen reader text for status indicators
- Sub 89.1: Add `aria-label` or visually hidden text for color-only status badges
- Sub 89.2: Example: `<span class="sr-only">Open</span>` inside status badge
- Sub 89.3: Verify with screen reader simulation

### 90. Add reduced motion media query support
- Sub 90.1: Add `@media (prefers-reduced-motion: reduce)` block at end of CSS
- Sub 90.2: Disable all transitions and animations inside this block
- Sub 90.3: Verify reduced motion is respected on OS level

---

## PHASE 8 — SEO/META/RESPONSIVE (Items 91–95)

### 91. Add Open Graph and Twitter Card meta tags
- Sub 91.1: Add `og:title`, `og:description`, `og:image`, `og:url`
- Sub 91.2: Add `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Sub 91.3: Verify tags with Facebook and Twitter debug tools

### 92. Add canonical URL and language attributes
- Sub 92.1: Add `<link rel="canonical" href="https://canon.net-github-dashboard.pages.dev/">`
- Sub 92.2: Add `lang="en"` and `dir="ltr"` to `<html>`
- Sub 92.3: Verify canonical URL is accessible without trailing slash

### 93. Add structured data JSON-LD for organization
- Sub 93.1: Add `application/ld+json` with `Organization` schema
- Sub 93.2: Include name, description, URL, logo, and sameAs links
- Sub 93.3: Validate with Google Rich Results Test

### 94. Add responsive touch targets for mobile
- Sub 94.1: Ensure all interactive elements are at least 48×48px
- Sub 94.2: Add padding to small icon buttons on touch devices
- Sub 94.3: Verify with Chrome Devices Mode

### 95. Add viewport-fit=cover for notched mobile screens
- Sub 95.1: Update viewport meta to include `viewport-fit=cover`
- Sub 95.2: Add `env(safe-area-inset-*)` padding to fixed elements
- Sub 95.3: Verify on iPhone and Android simulators

---

## PHASE 9 — CODE QUALITY (Items 96–100)

### 96. Extract repeated SVG icons into reusable functions/components
- Sub 96.1: Create `icons.js` or inline SVG sprite
- Sub 96.2: Replace all inline SVG paths with references
- Sub 96.3: Verify icon sizes and colors remain consistent

### 97. Add input sanitization for search fields
- Sub 97.1: Escape HTML entities before rendering search results
- Sub 97.2: Trim whitespace and limit input length
- Sub 97.3: Add `maxlength` attributes to text inputs

### 98. Add error boundaries for view rendering
- Sub 98.1: Wrap `showView()` in try/catch with fallback to `view-default`
- Sub 98.2: Log errors to console with view name and timestamp
- Sub 98.3: Show user-friendly error message in UI

### 99. Add feature flags for experimental views
- Sub 99.1: Create `features.js` with toggle flags
- Sub 99.2: Gate new views behind `features.marketplace` flag
- Sub 99.3: Add devtools panel to toggle flags

### 100. Add automated visual regression test setup
- Sub 100.1: Install Playwright with screenshot comparison config
- Sub 100.2: Capture baseline screenshots of all 9 views
- Sub 100.3: Add CI step to fail on visual diffs

---

## PIPELINE EXECUTION ORDER

**Week 1 — Foundation**
- Days 1-2: Items 1-20 (Visual Polish)
- Days 3-4: Items 21-35 (Structure & Layout)
- Day 5: Playwright audit + git commit

**Week 2 — Functionality**
- Days 1-2: Items 36-45 (Navigation & Routing)
- Days 3-4: Items 46-60 (Interactivity)
- Day 5: Playwright audit + git commit

**Week 3 — Content & Polish**
- Days 1-2: Items 61-70 (Content & Branding)
- Days 3-4: Items 71-80 (Performance)
- Day 5: Lighthouse audit + git commit

**Week 4 — Polish & Ship**
- Days 1-2: Items 81-90 (Accessibility)
- Days 3-4: Items 91-100 (SEO, Responsive, Code Quality)
- Day 5: Final audit, deploy, and handoff

---

## AUDIT CHECKLIST (Run After Each Phase)

- [ ] Zero console errors in Playwright
- [ ] Zero accessibility violations in axe DevTools
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] All views render correctly on mobile (375px), tablet (768px), desktop (1440px)
- [ ] All navigation links work without page reload
- [ ] NET branding is consistent across all views
- [ ] Git commit with descriptive message
- [ ] Updated `CLOUDFLARE-MANIFEST.md` if new assets added
