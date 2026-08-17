# SPARK-CHECKLIST

This checklist defines the minimum "spark" requirements for the NET GitHub-branded landing page. Every session that touches the landing page MUST verify ALL items before considering the work complete.

## Versions
- **landing.html / landing.css** — NET-branded with purple/gold accents
- **github-mirror.html / github-mirror.css** — Pure GitHub dark-dimmed color scheme clone, no NET branding

## Visual Spark
- [ ] **Animated hero blobs** — at least 3 blurred gradient blobs with `blobDrift` keyframes, different durations/delays
- [ ] **Hero Octocat silhouette** — low-opacity SVG in hero background, hidden on mobile
- [ ] **Noise/grain texture** — optional SVG background pattern on hero for depth
- [ ] **Scroll-triggered reveals** — `.reveal` + `.visible` classes with IntersectionObserver/scroll listener

## Layout Fidelity
- [ ] **GitHub dark-dimmed palette** — `#0d1117`, `#161b22`, `#21262d`, `#1c2128`, `#c9d1d9`, `#8b949e`
- [ ] **NET brand accents (landing only)** — purple `#a855f7` and gold `#f59e0b` used consistently
- [ ] **GitHub brand accents (github-mirror only)** — blue `#58a6ff` and green `#238636` used consistently
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
- [ ] **Logo cloud** — "Trusted by" section with institution/company names
- [ ] **Stats row** — 4-column metric strip
- [ ] **Program/Product grid** — 5 cards with SVG icons
- [ ] **Testimonials** — 3 cards with avatar initials, quote, name, role
- [ ] **Pricing** — 3 tiers (Free / $29 / Custom, or GitHub Free/Team/Enterprise), featured card highlighted

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
- [ ] **index.html** — is a copy of the latest landing.html OR github-mirror.html
- [ ] **Cloudflare Pages** — deployed and live
- [ ] **No console errors** — test in browser DevTools
- [ ] **No duplicate <main> tags** — run `rg "<main" index.html` and confirm single match

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

# Check reveal classes exist in landing version
rg "class=\"[^\"]*reveal" APPS\PAGES\net-github\landing.html

# Check reveal classes exist in github-mirror version
rg "class=\"[^\"]*reveal" APPS\PAGES\net-github\github-mirror.html

# Check blob classes exist in landing version
rg "hero-blob" APPS\PAGES\net-github\landing.css

# Check blob classes exist in github-mirror version
rg "hero-blob" APPS\PAGES\net-github\github-mirror.css

# Check octocat exists in landing version
rg "hero-octocat" APPS\PAGES\net-github\landing.html

# Check octocat exists in github-mirror version
rg "hero-octocat" APPS\PAGES\net-github\github-mirror.html

# Check mobile toggle exists
rg "mobile-toggle" APPS\PAGES\net-github\landing.html
rg "mobile-toggle" APPS\PAGES\net-github\github-mirror.html

# Check search modal exists
rg "search-modal" APPS\PAGES\net-github\landing.html
rg "search-modal" APPS\PAGES\net-github\github-mirror.html

# Check testimonials exist
rg "testimonial-card" APPS\PAGES\net-github\landing.html
rg "testimonial-card" APPS\PAGES\net-github\github-mirror.html

# Check pricing exists
rg "pricing-card" APPS\PAGES\net-github\landing.html
rg "pricing-card" APPS\PAGES\net-github\github-mirror.html

# Verify github-mirror uses GitHub colors (no purple/gold branding)
rg "#a855f7|#f59e0b" APPS\PAGES\net-github\github-mirror.css
# Should return no matches
```
