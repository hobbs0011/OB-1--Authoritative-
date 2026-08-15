# SPARK-CHECKLIST

This checklist defines the minimum "spark" requirements for the NET GitHub-branded landing page. Every session that touches the landing page MUST verify ALL items before considering the work complete.

## Visual Spark
- [ ] **Animated hero blobs** — at least 3 blurred gradient blobs with `blobDrift` keyframes, different durations/delays
- [ ] **Hero Octocat silhouette** — low-opacity SVG in hero background, hidden on mobile
- [ ] **Noise/grain texture** — optional SVG background pattern on hero for depth
- [ ] **Scroll-triggered reveals** — `.reveal` + `.visible` classes with IntersectionObserver/scroll listener

## Layout Fidelity
- [ ] **GitHub dark-dimmed palette** — `#0d1117`, `#161b22`, `#21262d`, `#c9d1d9`, `#8b949e`
- [ ] **NET brand accents** — purple `#a855f7` and gold `#f59e0b` used consistently
- [ ] **Exact header structure** — logo, nav dropdowns, search, sign in/sign up
- [ ] **Exact footer structure** — 5-column grid + bottom legal bar
- [ ] **Responsive breakpoints** — 768px and 480px tested

## Interactive Spark
- [ ] **Dropdown megamenus** — hover + click toggle, `aria-expanded` updates
- [ ] **Mobile hamburger menu** — slide-in overlay, `aria-expanded` on toggle
- [ ] **Search modal** — `Ctrl/Cmd+K` open, `ESC` close, click-outside close
- [ ] **CTA hover states** — buttons lift/glow on hover
- [ ] **Card hover states** — feature/program/testimonial/pricing cards lift on hover

## Content Spark
- [ ] **Logo cloud** — "Trusted by" section with institution names
- [ ] **Stats row** — 4-column metric strip
- [ ] **Program grid** — 5 cards with emoji icons
- [ ] **Testimonials** — 3 cards with avatar initials, quote, name, role
- [ ] **Pricing** — 3 tiers (Free / $29 / Custom), featured card highlighted

## Accessibility
- [ ] **Skip link** — visible on focus, jumps to `#start-of-content`
- [ ] **ARIA labels** — nav, buttons, inputs, modals
- [ ] **Keyboard navigation** — all interactive elements reachable, dropdowns operable

## Performance
- [ ] **No external JS frameworks** — vanilla JS only
- [ ] **No external CSS frameworks** — custom CSS only
- [ ] **Font preload** — Inter from Google Fonts with `preconnect`
- [ ] **SVG icons inline** — no icon font requests

## Deployment
- [ ] **index.html** — is a copy of the latest landing.html
- [ ] **Cloudflare Pages** — deployed and live
- [ ] **No console errors** — test in browser DevTools

---

## How to use this checklist

1. Before marking any task complete, open the deployed page and visually verify the item.
2. If you add a new section or feature, add the corresponding checkbox here.
3. Never remove items from this list without explicit user approval.
4. This file lives at `APPS/PAGES/net-github/SPARK-CHECKLIST.md`.

## Quick verification commands

```powershell
# Check for duplicate main tags (common regression)
rg "<main" APPS\PAGES\net-github\index.html

# Check reveal classes exist
rg "class=\"[^\"]*reveal" APPS\PAGES\net-github\landing.html

# Check blob classes exist
rg "hero-blob" APPS\PAGES\net-github\landing.css

# Check octocat exists
rg "hero-octocat" APPS\PAGES\net-github\landing.html

# Check mobile toggle exists
rg "mobile-toggle" APPS\PAGES\net-github\landing.html

# Check search modal exists
rg "search-modal" APPS\PAGES\net-github\landing.html

# Check testimonials exist
rg "testimonial-card" APPS\PAGES\net-github\landing.html

# Check pricing exists
rg "pricing-card" APPS\PAGES\net-github\landing.html
```
