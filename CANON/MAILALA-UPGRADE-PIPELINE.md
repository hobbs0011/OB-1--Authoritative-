# Mailala Site — 50-Stage Upgrade Pipeline (AUDITED)

Target: Make the Mailala site the best fucking thing we have done.
Aesthetic: warm island (forest green, gold, cream). No dark backgrounds, no neon.

## Audit
- [x] 1. Audit current site performance and UX
- [x] 2. Audit Mailala1 vs Mailala2 incarnations
- [x] 3. Check Cloudflare deployment state
- [x] 4. Identify gaps vs "best we have done" bar

## Foundation
- [x] 5. Add `<title>` and canonical meta — ✅ in index.html head
- [x] 6. Add Open Graph image and Twitter card image — ✅ og:image, twitter:image
- [x] 7. Add JSON-LD structured data (Hotel / LodgingBusiness) — ✅ in head
- [x] 8. Add `hreflang` and language meta — ✅ en, vi, x-default
- [x] 9. Add `sitemap.xml` and `robots.txt` — ✅ both present
- [x] 10. Add `_headers` security and cache hardening — ✅ present

## Visual Design
- [x] 11. Refine hero typography and spacing for maximum impact — ✅ DM Serif Display, cream bg
- [x] 12. Add hero entrance animation (fade + slide) — ✅ in main.js IntersectionObserver
- [x] 13. Redesign CTA buttons with stronger contrast and hover lift — ✅ in style.css
- [x] 14. Add gold shimmer effect to `.highlight` — ❌ NOT IMPLEMENTED
- [x] 15. Refresh card styles with subtle depth and warm shadows — ✅ in style.css
- [x] 16. Add section dividers with wave/organic shapes — ❌ NOT IMPLEMENTED
- [x] 17. Upgrade testimonial cards with quote marks and accent border — ❌ NOT IMPLEMENTED
- [x] 18. Add parallax/ken-burns effect to hero background — ❌ NOT IMPLEMENTED (static bg-image)
- [x] 19. Add floating "Big Up" badge in hero corner — ✅ `.hero-bigup` in HTML
- [x] 20. Add loading shimmer for images — ❌ NOT IMPLEMENTED

## UX Improvements
- [x] 21. Add smooth scroll offset for fixed nav — ✅ scroll-padding-top in CSS
- [x] 22. Add active nav state on scroll — ✅ in main.js
- [x] 23. Add room type quick-select pills above booking form — ❌ NOT IMPLEMENTED
- [x] 24. Add price match/guarantee trust badge near form — ✅ Best Rate Guaranteed badge
- [x] 25. Add WhatsApp quick-book floating button with pulse — ✅ `.whatsapp-float`
- [x] 26. Add form validation with inline error states — ✅ in main.js
- [x] 27. Add success toast/modal after booking submit — ✅ toast in main.js
- [x] 28. Add back-to-top button — ✅ `.back-to-top` in HTML + JS
- [x] 29. Add lazy-loading fade-in for section images — ✅ loading="lazy" on gallery
- [x] 30. Add mobile bottom nav or sticky book bar — ❌ NOT IMPLEMENTED

## Performance
- [x] 31. Add `fetchpriority="high"` to hero image if converted — ❌ NOT IMPLEMENTED (bg-image, not <img>)
- [x] 32. Add `preconnect` for WhatsApp and Google Maps — ✅ 7 preconnect hints
- [x] 33. Inline critical CSS above-the-fold — ❌ NOT IMPLEMENTED
- [x] 34. Add `loading="lazy"` to below-fold images — ✅ on gallery + map iframe
- [x] 35. Add service worker for PWA offline caching — ✅ sw.js + registration
- [x] 36. Add PWA manifest with icons and splash screens — ✅ manifest.json
- [x] 37. Optimize image file sizes and formats (WebP/AVIF) — ✅ WebP + JPG fallbacks
- [x] 38. Add resource hints (`prefetch`, `preload`) — ❌ NOT IMPLEMENTED
- [x] 39. Minify CSS/JS for production — ❌ NOT IMPLEMENTED
- [x] 40. Add performance budgets and Lighthouse CI config — ❌ NOT IMPLEMENTED

## Content & Copy
- [x] 41. Rewrite hero headline for stronger emotion — ✅ "Your Island Escape in the Heart of Saigon"
- [x] 42. Add micro-storytelling to room cards — ✅ feature lists with personality
- [x] 43. Add "Perfect For" badges to rooms (solo, couple, group) — ❌ NOT IMPLEMENTED
- [x] 44. Expand rooftop section with event calendar snippet — ✅ events-section with MON/WED/FRI/SAT
- [x] 45. Add FAQ section with collapse/expand — ✅ `<details>` accordion
- [x] 46. Add urgency/social proof strip near booking form — ❌ NOT IMPLEMENTED
- [x] 47. Add "Last Booked 2 min ago" live widget — ❌ NOT IMPLEMENTED
- [x] 48. Add weather/widget for Saigon sunset time — ❌ NOT IMPLEMENTED
- [x] 49. Add printable booking confirmation page — ✅ confirmation.html
- [x] 50. Final visual QA pass and commit to canon — ✅ committed

## Deployment
- [x] Create Cloudflare Pages project config — ✅ _headers, _redirects, wrangler.toml (in Incarnate-Mailala2)
- [x] Add GitHub Actions deploy workflow — ✅ in Incarnate-Mailala2/.github/workflows/deploy.yml
- [ ] Add preview deployment for branches — ❌ NOT IMPLEMENTED
- [x] Add rollback/health-check script — ✅ scripts/rollback.sh (in Incarnate-Mailala2)
- [ ] Update Cloudflare manifest with live project — ❌ NOT IMPLEMENTED (project not yet deployed)

## Summary
- **DONE:** 32/50 stages
- **NOT DONE:** 18 stages (mostly: gold shimmer, wave dividers, quote marks, ken-burns, loading shimmer, quick-select pills, sticky mobile bar, fetchpriority, inline CSS, prefetch/preload, minify, Lighthouse CI, perfect-for badges, urgency strip, live widget, weather widget, preview deploys, manifest update)
- **BLOCKED:** Cloudflare Pages project `mailala` not created — requires API token

## Critical Blocker
- No `CLOUDFLARE_API_TOKEN` in environment or repo (only truncated reference `cfk_Y1Lh80L9zJ87...` in RUN312 report, cleared post-deploy)
- `mailala` not in CLOUDFLARE-MANIFEST.md (not a live Pages project)
- Deployment requires token from user or GitHub Actions secret