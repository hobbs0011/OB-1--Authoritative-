# Mailala Site — Handoff Brief for Finalizer Session

## Current State
- Canonical source: `D:\OB-1-CANONICAL\WEBSITE\mailala\`
- Alternate copy: `D:\OB-1-CANONICAL\Incarnate-Mailala2\` (identical core files, no legacy bloat)
- Live deployment: **NOT FOUND** in Cloudflare manifest (`CLOUDFLARE-MANIFEST.md`)
- CI/CD: **NONE** specific to Mailala. Existing `deploy-pages.yml` only deploys `SITE/` → `naturalenglishtraining` Pages project.
- Recent commits on `canon`:
  - `1c90d5b4d0` Add direct booking engine to Mailala website
  - `c30f4e886c` feat(mailala): initial Mailala Hostel & Bar website

## Audit Results

### Mailala1 vs Mailala2
- Core HTML/CSS/JS/manifest/_redirects/_headers: **byte-for-byte identical**
- Mailala1 extra files: `verify.txt` (481-line legacy HTML, different address `185/28`), `assets/video-frames/`
- **Winner:** Use `WEBSITE/mailala/` as canonical, but remove legacy `verify.txt` from deployment root

### Cloudflare Deployment State
- No `mailala` Pages project in manifest
- No `wrangler.toml` in mailala directory
- No GitHub Actions workflow for Mailala
- `_redirects` references `mailala.com/* → mailala.pages.dev/:splat 301` (planned but not confirmed live)
- Domain `mailala.com` DNS status: **UNKNOWN** from repo alone

### SEO/Accessibility Gaps Found
- Missing `<title>` tag (now added in current session)
- Missing JSON-LD structured data (now added)
- Missing `og:image`, `twitter:image`
- Missing `hreflang` tags (now added)
- Missing `sitemap.xml` and updated `robots.txt`
- No `:focus-visible` styles for keyboard nav
- Background images use `role="img"` + `aria-label` — acceptable but could be `<img>` with `alt` for critical hero
- No service worker / offline PWA support
- `verify.txt` in root is a legacy snapshot with different address — remove or move out of web root

## What Has Been Done This Session
1. Added booking form to `#book` section with date pickers, room type selector, guest count, WhatsApp submit
2. Added floating WhatsApp quick-book button
3. Added "Big Up — Say No to Drugs" banner in hero
4. Added Rasta badge in footer
5. Styled booking form to match warm island aesthetic
6. Committed changes to `canon` branch (`1c90d5b4d0`)
7. Added SEO: `<title>`, canonical URL, OG image, Twitter card, hreflang, JSON-LD Hotel schema
8. Added `preconnect` for fonts, WhatsApp, Google Maps
9. Added hero entrance animations (`fadeSlideUp`)
10. Added gold shimmer effect to `h1 .highlight`
11. Enhanced button styles with stronger gradients and hover lift
12. Added `scroll-padding-top` for fixed nav offset
13. Created `CANON/MAILALA-UPGRADE-PIPELINE.md` with 50-stage plan

## Remaining Work (50-Stage Pipeline)

### Foundation
- [ ] 5. Add `sitemap.xml`
- [ ] 6. Update `robots.txt` with sitemap reference
- [ ] 7. Add `:focus-visible` CSS for keyboard navigation
- [ ] 8. Audit all external links for `rel="noopener"` consistency
- [ ] 9. Add `loading="lazy"` to below-fold background-image divs where appropriate
- [ ] 10. Add `fetchpriority="high"` to hero if converted to `<img>`

### Visual Design
- [ ] 11. Refine hero typography spacing and scale
- [ ] 12. Add Ken Burns / slow zoom to hero background
- [ ] 13. Add gold shimmer to section headings or CTA accents
- [ ] 14. Refresh card hover states with warm shadow depth
- [ ] 15. Add organic wave/curve section dividers between sections
- [ ] 16. Upgrade testimonial cards with decorative quote marks
- [ ] 17. Add section reveal animations on scroll
- [ ] 18. Add back-to-top button with scroll progress indicator
- [ ] 19. Add image fade-in on load for gallery/room images
- [ ] 20. Add skeleton shimmer for images during load

### UX Improvements
- [ ] 21. Add room type quick-select pills above booking form
- [ ] 22. Add trust badges near booking form (Best Rate, Free Cancellation, Instant Confirm)
- [ ] 23. Add form validation with inline error/success states
- [ ] 24. Add success modal/toast after WhatsApp booking submit
- [ ] 25. Add sticky mobile "Book Now" bar on scroll
- [ ] 26. Add active nav link highlighting based on scroll position
- [ ] 27. Add smooth scroll offset for fixed nav (partially done via CSS)
- [ ] 28. Add "Last booked X min ago" social proof widget
- [ ] 29. Add Saigon sunset / weather widget or static time-based greeting
- [ ] 30. Add FAQ section with collapse/expand accordion

### Performance
- [ ] 31. Convert JPGs to WebP/AVIF with fallbacks
- [ ] 32. Add service worker for offline caching
- [ ] 33. Add PWA manifest with app shortcuts
- [ ] 34. Inline critical CSS above the fold
- [ ] 35. Minify CSS/JS for production
- [ ] 36. Add Lighthouse CI config and performance budgets
- [ ] 37. Add `prefetch`/`preload` for critical assets
- [ ] 38. Lazy-load iframe map
- [ ] 39. Add resource hints for third-party origins
- [ ] 40. Audit and reduce unused CSS

### Content & Copy
- [ ] 41. Rewrite hero headline for stronger emotional hook
- [ ] 42. Add micro-storytelling copy to room cards
- [ ] 43. Add "Perfect For" labels to rooms (Solo, Couple, Group)
- [ ] 44. Expand rooftop section with event calendar snippet
- [ ] 45. Add urgency strip near booking form ("Only 2 beds left tonight")
- [ ] 46. Add printable booking confirmation page
- [ ] 47. Add blog/posts section for SEO content
- [ ] 48. Add multilingual copy fragments (`vi` + `en`)
- [ ] 49. Add cookie consent banner
- [ ] 50. Final visual QA pass, responsive testing, and commit

### Deployment
- [ ] Create Cloudflare Pages project `mailala`
- [ ] Add GitHub Actions workflow `.github/workflows/deploy-mailala.yml`
- [ ] Connect custom domain `mailala.com` in Pages project
- [ ] Update `CLOUDFLARE-MANIFEST.md` with live project
- [ ] Add preview deployments for branches
- [ ] Add rollback/health-check script
- [ ] Verify DNS: `mailala.com` CNAME → `mailala.pages.dev`
- [ ] Remove `verify.txt` from deployment root
- [ ] Add `sitemap.xml` to root
- [ ] Final deploy to `canon` and verify live

## Key Files to Touch
- `D:\OB-1-CANONICAL\WEBSITE\mailala\index.html`
- `D:\OB-1-CANONICAL\WEBSITE\mailala\style.css`
- `D:\OB-1-CANONICAL\WEBSITE\mailala\main.js`
- `D:\OB-1-CANONICAL\WEBSITE\mailala\_headers`
- `D:\OB-1-CANONICAL\WEBSITE\mailala\_redirects`
- `D:\OB-1-CANONICAL\WEBSITE\mailala\manifest.json`
- `D:\OB-1-CANONICAL\WEBSITE\sitemap.xml` (new)
- `D:\OB-1-CANONICAL\WEBSITE\robots.txt` (update)
- `D:\OB-1-CANONICAL\.github\workflows\deploy-mailala.yml` (new)
- `D:\OB-1-CANONICAL\CLOUDFLARE-MANIFEST.md` (update)

## Design Constraints
- Warm island aesthetic ONLY: forest green, gold, cream
- NO dark backgrounds
- NO neon colors
- Keep it premium, memorable, "WOW!" not just "solid"
- Maintain existing brand: Love Up · Bless Up · Irie Up · Big Up · Say No to Drugs

## Quick Context
- Client: Mailala Hostel & Bar, Saigon
- Address: 175/16 Pham Ngu Lao, District 1
- Phone/WhatsApp: +84 768 701 106
- Current price point: dorms from $6.65, private balcony $18
- Brand voice: reggae, island, warm, anti-drug, community

## How to Resume
1. Read this file
2. Read `CANON\MAILALA-UPGRADE-PIPELINE.md` for the full 50-stage checklist
3. Open `D:\OB-1-CANONICAL\WEBSITE\mailala\index.html` and `style.css`
4. Work through stages 5–50
5. Commit to `canon` branch
6. Deploy via Cloudflare Pages when ready
