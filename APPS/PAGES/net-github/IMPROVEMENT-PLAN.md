# NET GitHub Dashboard — 100-Item Improvement Plan

## Audit Status
- **Created**: 2026-08-15
- **Baseline**: D:\OB-1-CANONICAL\APPS\PAGES\net-github\
- **Goal**: 3x visual, performance, accessibility, and UX quality
- **Phases**: 9 phases, pipelined execution

---

## PHASE 1: CRITICAL FOUNDATION (Items 1-12)

### Item 1: Fix skip-link positioning
**Substep 1.1**: Move skip-link off-screen using proper CSS class instead of inline style
**Substep 1.2**: Add visible focus state for skip-link
**Substep 1.3**: Test with keyboard-only navigation

### Item 2: Add alt text to decorative SVGs
**Substep 2.1**: Audit all inline SVGs for decorative vs informative
**Substep 2.2**: Add `aria-hidden="true"` to decorative SVGs
**Substep 2.3**: Add meaningful alt text to informative SVGs

### Item 3: Add ARIA labels to icon-only buttons
**Substep 3.1**: Audit all buttons without accessible names
**Substep 3.2**: Add `aria-label` to notification, theme, sidebar toggle, back-to-top buttons
**Substep 3.3**: Verify with screen reader testing

### Item 4: Fix modal focus trap
**Substep 4.1**: Implement focus trap in modal overlay
**Substep 4.2**: Return focus to trigger element on close
**Substep 4.3**: Test Tab/Shift+Tab cycling within modal

### Item 5: Fix modal aria-modal placement
**Substep 5.1**: Move `aria-modal="true"` from modal to overlay
**Substep 5.2**: Add `role="dialog"` to overlay
**Substep 5.3**: Verify with accessibility inspector

### Item 6: Add focus-visible styles for all interactive elements
**Substep 6.1**: Audit all links, buttons, inputs for missing focus styles
**Substep 6.2**: Add consistent `:focus-visible` ring using accent color
**Substep 6.3**: Test keyboard navigation across all views

### Item 7: Fix sticky sidebar on mobile
**Substep 7.1**: Remove sticky positioning on `.sidebar-left` for mobile
**Substep 7.2**: Add fixed mobile drawer with slide animation
**Substep 7.3**: Test on 320px, 375px, 414px viewports

### Item 8: Add system theme preference detection
**Substep 8.1**: Check `prefers-color-scheme` media query on load
**Substep 8.2**: Default to system preference if no localStorage value
**Substep 8.3**: Listen for system theme changes

### Item 9: Fix duplicate CSS rules
**Substep 9.1**: Audit CSS for duplicate selectors (.theme-toggle, .breadcrumb)
**Substep 9.2**: Merge duplicates into single source of truth
**Substep 9.3**: Verify no visual regression after cleanup

### Item 10: Add image lazy loading and CLS prevention
**Substep 10.1**: Add `loading="lazy"` to all `<img>` tags
**Substep 10.2**: Add explicit `width` and `height` attributes
**Substep 10.3**: Add CSS aspect-ratio boxes as placeholders

### Item 11: Optimize font loading
**Substep 11.1**: Add `&display=swap` to Google Fonts URL
**Substep 11.2**: Add font loading strategy with FontFace API
**Substep 11.3**: Preload critical font weights

### Item 12: Add defer/async to non-critical scripts
**Substep 12.1**: Audit script loading order
**Substep 12.2**: Add `defer` to app.js
**Substep 12.3**: Verify no FOUC or race conditions

---

## PHASE 2: VISUAL POLISH (Items 13-27)

### Item 13: Add view transition animations
**Substep 13.1**: Create view enter/exit CSS animations
**Substep 13.2**: Implement transition in router showView()
**Substep 13.3**: Add staggered animation for child elements

### Item 14: Add hover states to all cards
**Substep 14.1**: Audit all card components for missing hover effects
**Substep 14.2**: Add lift + shadow + border glow on hover
**Substep 14.3**: Add smooth transition for all hover changes

### Item 15: Add active/pressed states to buttons
**Substep 15.1**: Add `:active` transform scale for buttons
**Substep 15.2**: Add pressed shadow state
**Substep 15.3**: Test on touch devices

### Item 16: Add skeleton loading states
**Substep 16.1**: Create CSS skeleton component with shimmer
**Substep 16.2**: Add skeleton variants for cards, lists, tables
**Substep 16.3**: Implement skeleton-to-content transition

### Item 17: Add gradient accents to section headers
**Substep 17.1**: Apply gradient text to page titles
**Substep 17.2**: Add gradient underlines to headings
**Substep 17.3**: Ensure contrast meets WCAG AA

### Item 18: Add box-shadow depth to floating elements
**Substep 18.1**: Add layered shadows to header, modals, toasts
**Substep 18.2**: Add elevation system (sm, md, lg, xl)
**Substep 18.3**: Test shadow visibility in both themes

### Item 19: Add border glow on hover for cards
**Substep 19.1**: Create glow effect using box-shadow
**Substep 19.2**: Apply to repo cards, program cards, issue items
**Substep 19.3**: Use accent color with reduced opacity

### Item 20: Add smooth theme transition
**Substep 20.1**: Add `transition: background-color, color` to body
**Substep 20.2**: Add transition to all themed elements
**Substep 20.3**: Prevent flash during theme switch

### Item 21: Add micro-interactions to sidebar items
**Substep 21.1**: Add subtle slide-on-hover effect
**Substep 21.2**: Add icon scale on hover
**Substep 21.3**: Add active state glow

### Item 22: Add ripple effect to buttons
**Substep 22.1**: Create CSS ripple animation
**Substep 22.2**: Implement ripple on click via JS
**Substep 22.3**: Ensure ripple respects reduced motion

### Item 23: Add pulse animation to live indicators
**Substep 23.1**: Create pulse keyframe for live dot
**Substep 23.2**: Add glow ring animation
**Substep 23.3**: Ensure animation is performant (transform only)

### Item 24: Add gradient text to headings
**Substep 24.1**: Apply gradient to program detail titles
**Substep 24.2**: Apply gradient to repo title on home
**Substep 24.3**: Add fallback for browsers without background-clip

### Item 25: Add backdrop blur to sticky header
**Substep 25.1**: Add `backdrop-filter: blur(12px)` to header
**Substep 25.2**: Add semi-transparent background
**Substep 25.3**: Fallback for browsers without backdrop-filter

### Item 26: Add subtle grid pattern background
**Substep 26.1**: Create SVG grid pattern data URI
**Substep 26.2**: Apply as fixed background with low opacity
**Substep 26.3**: Ensure it doesn't impact performance

### Item 27: Add noise texture overlay
**Substep 27.1**: Create noise SVG filter
**Substep 27.2**: Apply as fixed overlay with pointer-events:none
**Substep 27.3**: Tune opacity for subtlety

---

## PHASE 3: LAYOUT & RESPONSIVE (Items 28-40)

### Item 28: Add mobile hamburger menu
**Substep 28.1**: Create hamburger icon SVG
**Substep 28.2**: Add hamburger button to header
**Substep 28.3**: Implement open/close animation

### Item 29: Add mobile drawer navigation
**Substep 29.1**: Create slide-in drawer from left
**Substep 29.2**: Add overlay backdrop
**Substep 29.3**: Implement swipe-to-close gesture

### Item 30: Add tablet breakpoint for 2-column layout
**Substep 30.1**: Define 768px-1100px breakpoint
**Substep 30.2**: Adjust grid columns for tablet
**Substep 30.3**: Test on common tablet sizes

### Item 31: Add large desktop breakpoint
**Substep 31.1**: Define 1400px+ breakpoint
**Substep 31.2**: Increase max-width for large screens
**Substep 31.3**: Adjust spacing and font sizes

### Item 32: Fix sidebar overflow on small screens
**Substep 32.1**: Audit sidebar content height
**Substep 32.2**: Add scroll container with custom scrollbar
**Substep 32.3**: Test with long sidebar lists

### Item 33: Add responsive typography scaling
**Substep 33.1**: Use clamp() for fluid font sizes
**Substep 33.2**: Define scale ratios (major third)
**Substep 33.3**: Test at all breakpoints

### Item 34: Add responsive spacing system
**Substep 34.1**: Define spacing scale (4, 8, 12, 16, 24, 32, 48)
**Substep 34.2**: Use CSS custom properties for spacing
**Substep 34.3**: Adjust spacing at breakpoints

### Item 35: Add responsive grid gaps
**Substep 35.1**: Define gap scale
**Substep 35.2**: Reduce gaps on mobile
**Substep 35.3**: Increase gaps on desktop

### Item 36: Add responsive card padding
**Substep 36.1**: Reduce padding on mobile (12px)
**Substep 36.2**: Increase padding on desktop (20px)
**Substep 36.3**: Ensure touch targets remain 44px+

### Item 37: Add responsive image handling
**Substep 37.1**: Use max-width: 100% for all images
**Substep 37.2**: Add srcset for responsive images
**Substep 37.3**: Use object-fit for aspect ratio preservation

### Item 38: Add responsive table scrolling
**Substep 38.1**: Wrap tables in overflow-x: auto container
**Substep 38.2**: Add min-width to table cells
**Substep 38.3**: Hide non-essential columns on mobile

### Item 39: Add responsive modal sizing
**Substep 39.1**: Use max-width with percentage on mobile
**Substep 39.2**: Add full-screen option on small screens
**Substep 39.3**: Adjust padding for mobile

### Item 40: Add responsive button sizing
**Substep 40.1**: Reduce padding on mobile
**Substep 40.2**: Ensure 44px minimum touch target
**Substep 40.3**: Adjust font size for readability

---

## PHASE 4: INTERACTIVITY & UX (Items 41-60)

### Item 41: Add search debounce
**Substep 41.1**: Implement 300ms debounce on search input
**Substep 41.2**: Show loading indicator during debounce
**Substep 41.3**: Cancel pending debounce on clear

### Item 42: Add search suggestions/autocomplete
**Substep 42.1**: Create suggestions dropdown component
**Substep 42.2**: Implement fuzzy matching
**Substep 42.3**: Add keyboard navigation for suggestions

### Item 43: Add clear search button
**Substep 43.1**: Add X icon inside search input
**Substep 43.2**: Show only when input has value
**Substep 43.3**: Clear input and results on click

### Item 44: Add keyboard shortcut indicators
**Substep 44.1**: Add kbd styling for shortcuts
**Substep 44.2**: Show shortcuts in button titles
**Substep 44.3**: Add shortcuts help modal

### Item 45: Implement command palette (Ctrl+K)
**Substep 45.1**: Create command palette modal
**Substep 45.2**: Add navigation commands
**Substep 45.3**: Add action commands (theme toggle, etc.)

### Item 46: Add breadcrumb navigation
**Substep 46.1**: Generate breadcrumbs from route
**Substep 46.2**: Add schema.org BreadcrumbList
**Substep 46.3**: Style breadcrumbs consistently

### Item 47: Add page transition animations
**Substep 47.1**: Define enter/exit animation classes
**Substep 47.2**: Apply animations in router
**Substep 47.3**: Add staggered children animation

### Item 48: Add staggered card animations
**Substep 48.1**: Create CSS stagger animation keyframes
**Substep 48.2**: Apply animation-delay based on index
**Substep 48.3**: Trigger on view change

### Item 49: Add infinite scroll for lists
**Substep 49.1**: Implement IntersectionObserver sentinel
**Substep 49.2**: Load more items when sentinel visible
**Substep 49.3**: Add loading spinner at bottom

### Item 50: Add virtual scrolling for long lists
**Substep 50.1**: Implement windowing technique
**Substep 50.2**: Calculate visible range based on scroll
**Substep 50.3**: Maintain scroll position on data change

### Item 51: Add context menus
**Substep 51.1**: Create context menu component
**Substep 51.2**: Add right-click handlers
**Substep 51.3**: Implement keyboard navigation

### Item 52: Add swipe gestures on mobile
**Substep 52.1**: Implement touch start/end detection
**Substep 52.2**: Add swipe threshold and direction
**Substep 52.3**: Add haptic feedback on valid swipe

### Item 53: Add pull-to-refresh on mobile
**Substep 53.1**: Implement touch pull detection
**Substep 53.2**: Show refresh indicator
**Substep 53.3**: Reload data on release

### Item 54: Add loading states for async actions
**Substep 54.1**: Add spinner component
**Substep 54.2**: Show loading on button during action
**Substep 54.3**: Disable button during loading

### Item 55: Add error states for failed actions
**Substep 55.1**: Create error message component
**Substep 55.2**: Show inline error on form submit
**Substep 55.3**: Add retry button

### Item 56: Add empty states for filtered results
**Substep 56.1**: Create empty state component
**Substep 56.2**: Show when search returns no results
**Substep 56.3**: Add suggested actions

### Item 57: Add success feedback for actions
**Substep 57.1**: Enhance toast with icon and animation
**Substep 57.2**: Add progress bar to toast
**Substep 57.3**: Auto-dismiss with pause on hover

### Item 58: Add confirmation dialogs
**Substep 58.1**: Create confirm dialog component
**Substep 58.2**: Use for destructive actions
**Substep 58.3**: Add cancel and confirm buttons

### Item 59: Add undo functionality
**Substep 59.1**: Show undo option in toast
**Substep 59.2**: Implement undo action
**Substep 59.3**: Set timeout for undo availability

### Item 60: Add keyboard navigation for lists
**Substep 60.1**: Implement arrow key navigation
**Substep 60.2**: Add Home/End key support
**Substep 60.3**: Add type-ahead search

---

## PHASE 5: DATA & CONTENT (Items 61-75)

### Item 61: Add realistic mock data
**Substep 61.1**: Create data generator functions
**Substep 61.2**: Generate diverse sample data
**Substep 61.3**: Seed data on app initialization

### Item 62: Add data persistence layer
**Substep 62.1**: Create storage abstraction
**Substep 62.2**: Implement localStorage fallback
**Substep 62.3**: Add data migration support

### Item 63: Add offline detection
**Substep 63.1**: Listen for online/offline events
**Substep 63.2**: Show offline indicator
**Substep 63.3**: Queue actions for retry

### Item 64: Add print-friendly styles
**Substep 64.1**: Create print stylesheet
**Substep 64.2**: Hide navigation and ads
**Substep 64.3**: Optimize typography for print

### Item 65: Add RSS/Atom feed
**Substep 65.1**: Generate feed XML dynamically
**Substep 65.2**: Add feed discovery link
**Substep 65.3**: Validate feed format

### Item 66: Add sitemap.xml
**Substep 66.1**: Generate sitemap from routes
**Substep 66.2**: Add lastmod dates
**Substep 66.3**: Submit to search engines

### Item 67: Add robots.txt
**Substep 67.1**: Create robots.txt file
**Substep 67.2**: Configure crawl rules
**Substep 67.3**: Add sitemap reference

### Item 68: Add Open Graph dynamic images
**Substep 68.1**: Create OG image template
**Substep 68.2**: Generate dynamic images per view
**Substep 68.3**: Cache generated images

### Item 69: Add structured data for programs
**Substep 69.1**: Create Course JSON-LD schema
**Substep 69.2**: Add provider information
**Substep 69.3**: Validate with Google tool

### Item 70: Add breadcrumb structured data
**Substep 70.1**: Implement BreadcrumbList schema
**Substep 70.2**: Update on route change
**Substep 70.3**: Validate markup

### Item 71: Add organization structured data
**Substep 71.1**: Enhance existing Organization schema
**Substep 71.2**: Add social profiles
**Substep 71.3**: Add contact information

### Item 72: Add website structured data
**Substep 72.1**: Add WebSite schema
**Substep 72.2**: Add SearchAction for site search
**Substep 72.3**: Validate markup

### Item 73: Add canonical URLs for all views
**Substep 73.1**: Generate canonical from current route
**Substep 73.2**: Update meta tag on navigation
**Substep 73.3**: Handle pagination canonicals

### Item 74: Add hreflang tags
**Substep 74.1**: Define language variants
**Substep 74.2**: Add hreflang meta tags
**Substep 74.3**: Add x-default fallback

### Item 75: Add Twitter Card validation
**Substep 75.1**: Add Twitter:site handle
**Substep 75.2**: Add Twitter:creator
**Substep 75.3**: Validate with Card validator

---

## PHASE 6: ACCESSIBILITY (Items 76-90)

### Item 76: Style skip-link properly
**Substep 76.1**: Create `.skip-link` CSS class
**Substep 76.2**: Position off-screen by default
**Substep 76.3**: Show on focus

### Item 77: Add ARIA live regions for toasts
**Substep 77.1**: Add `aria-live="polite"` to toast container
**Substep 77.2**: Add `role="status"` to individual toasts
**Substep 77.3**: Ensure toasts are announced

### Item 78: Add aria-expanded for dropdowns
**Substep 78.1**: Track open/close state
**Substep 78.2**: Update aria-expanded on toggle
**Substep 78.3**: Verify with inspector

### Item 79: Add aria-controls for modals
**Substep 79.1**: Link trigger to modal via aria-controls
**Substep 79.2**: Add aria-describedby for modal content
**Substep 79.3**: Verify relationship

### Item 80: Add aria-hidden for decorative elements
**Substep 80.1**: Audit decorative icons and images
**Substep 80.2**: Add aria-hidden="true"
**Substep 80.3**: Verify screen reader ignores them

### Item 81: Add screen reader only text
**Substep 81.1**: Create .sr-only utility class
**Substep 81.2**: Apply to icon-only buttons
**Substep 81.3**: Test with screen reader

### Item 82: Add ARIA labels for form inputs
**Substep 82.1**: Audit all inputs for labels
**Substep 82.2**: Add aria-label or aria-labelledby
**Substep 83.3**: Verify with accessibility tree

### Item 83: Add color contrast validation
**Substep 83.1**: Audit all text/background combinations
**Substep 83.2**: Fix contrast below 4.5:1
**Substep 83.3**: Document contrast ratios

### Item 84: Add high contrast mode support
**Substep 84.1**: Create high contrast theme
**Substep 84.2**: Detect prefers-contrast: more
**Substep 84.3**: Apply high contrast styles

### Item 85: Add reduced motion preference checks
**Substep 85.1**: Audit all animations
**Substep 85.2**: Disable animations when prefers-reduced-motion
**Substep 85.3**: Test with OS setting enabled

### Item 86: Add keyboard navigation for all views
**Substep 86.1**: Ensure all interactive elements are focusable
**Substep 86.2**: Add logical tab order
**Substep 86.3**: Test with Tab, Shift+Tab, Enter, Space

### Item 87: Add focus management for view changes
**Substep 87.1**: Move focus to main content on view change
**Substep 87.2**: Announce view change to screen readers
**Substep 87.3**: Return focus on back navigation

### Item 88: Add ARIA roles to semantic regions
**Substep 88.1**: Verify banner, main, complementary, contentinfo
**Substep 88.2**: Add missing roles
**Substep 88.3**: Test with accessibility inspector

### Item 89: Add table semantics for students table
**Substep 89.1**: Add role="grid" or table semantics
**Substep 89.2**: Add aria-colindex and aria-rowindex
**Substep 89.3**: Add aria-sort for sortable columns

### Item 90: Add skip navigation for complex widgets
**Substep 90.1**: Add skip links for major regions
**Substep 90.2**: Add skip to search, skip to content
**Substep 90.3**: Test skip link behavior

---

## PHASE 7: PERFORMANCE (Items 91-100)

### Item 91: Add Critical CSS
**Substep 91.1**: Extract above-the-fold CSS
**Substep 91.2**: Inline critical CSS in head
**Substep 91.3**: Defer non-critical CSS

### Item 92: Add resource hints
**Substep 92.1**: Add dns-prefetch for external domains
**Substep 92.2**: Add preconnect for critical third parties
**Substep 92.3**: Add prefetch for likely next pages

### Item 93: Optimize CSS delivery
**Substep 93.1**: Remove unused CSS rules
**Substep 93.2**: Minify CSS for production
**Substep 93.3**: Split CSS by route/view

### Item 94: Optimize JS delivery
**Substep 94.1**: Minify app.js
**Substep 94.2**: Remove unused functions
**Substep 94.3**: Add code splitting

### Item 95: Add image optimization
**Substep 95.1**: Convert images to WebP/AVIF
**Substep 95.2**: Add responsive srcset
**Substep 95.3**: Add blur placeholder

### Item 96: Add caching strategy
**Substep 96.1**: Set cache-control headers
**Substep 96.2**: Add service worker for offline
**Substep 96.3**: Implement stale-while-revalidate

### Item 97: Add performance monitoring
**Substep 97.1**: Add Web Vitals tracking
**Substep 97.2**: Add performance marks
**Substep 97.3**: Log performance data

### Item 98: Reduce render-blocking resources
**Substep 98.1**: Defer non-critical scripts
**Substep 98.2**: Inline critical styles
**Substep 98.3**: Lazy load non-critical images

### Item 99: Add bundle size monitoring
**Substep 99.1**: Track CSS and JS sizes
**Substep 99.2**: Set budget alerts
**Substep 99.3**: Optimize on budget exceed

### Item 100: Add progressive enhancement
**Substep 100.1**: Ensure core content works without JS
**Substep 100.2**: Add noscript fallback
**Substep 100.3**: Test with JS disabled
