# Mailala Pipeline — Audited & Verified (2026-09-16)

Target: Make Mailala the best fucking thing we have done.
Aesthetic: warm island (forest green, gold, cream). NO dark/neon/purple/cyan.

## Audit (All ✅)
- [x] 1. Audit current site performance and UX
- [x] 2. Audit Mailala1 vs Mailala2 incarnations
- [x] 3. Check Cloudflare deployment state
- [x] 4. Identify gaps vs "best we have done" bar

## Foundation (All ✅)
- [x] 5. Add `<title>` and canonical meta
- [x] 6. Add Open Graph image and Twitter card image
- [x] 7. Add JSON-LD structured data (Hotel/LodgingBusiness)
- [x] 8. Add `hreflang` tags (en, vi, x-default)
- [x] 9. Add `sitemap.xml` + `robots.txt`
- [x] 10. Add `_headers` security and cache hardening

## Visual Design (Mostly ✅)
- [x] 11. Refine hero typography and spacing
- [x] 12. Hero entrance animation (fadeSlideUp)
- [x] 13. Redesign CTA buttons (stronger contrast, hover lift)
- [x] 14. Gold shimmer effect on `.highlight`
- [x] 15. Card styles with warm shadows
- [x] 16. Section dividers (organic wave shapes)
- [x] 17. Testimonial cards with quote marks
- [x] 18. Ken Burns slow zoom hero
- [x] 19. Big Up badge in hero corner
- [ ] 20. Loading shimmer for images

## UX Improvements (Mostly ✅)
- [x] 21. Smooth scroll offset for fixed nav
- [x] 22. Active nav state on scroll (IntersectionObserver)
- [x] 23. Room quick-select pills above booking form
- [x] 24. Price match/guarantee trust badge
- [x] 25. WhatsApp quick-book floating button (pulse)
- [x] 26. Form validation + inline error states
- [x] 27. Success toast on booking submit
- [x] 28. Back-to-top button
- [x] 29. Lazy-load fade-in for images
- [x] 30. Sticky mobile book bar

## Performance (Partial)
- [ ] 31. fetchpriority="high" on hero (CSS bg-image, not <img>)
- [x] 32. preconnect for WhatsApp, Google Maps, fonts, social
- [ ] 33. Inline critical CSS above-the-fold
- [x] 34. loading="lazy" on gallery images + iframe
- [x] 35. Service worker (sw.js exists + registered)
- [x] 36. PWA manifest (manifest.json with icons)
- [x] 37. WebP/AVIF images (WebP files alongside JPGs)
- [x] 38. Resource hints (preconnect links)
- [ ] 39. Minify CSS/JS for production
- [ ] 40. Lighthouse CI config + budgets

## Content & Copy (Partial)
- [x] 41. Hero headline rewrite (stronger emotional hook)
- [x] 42. Micro-storytelling in room cards
- [ ] 43. "Perfect For" badges on rooms (solo/couple/group)
- [ ] 44. Rooftop event calendar snippet
- [x] 45. FAQ accordion section
- [ ] 46. Urgency strip ("Only 2 beds left")
- [ ] 47. "Last Booked X min ago" widget
- [ ] 48. Saigon sunset/weather widget
- [x] 49. Confirmation page (confirmation.html)
- [ ] 50. Final visual QA pass

## Deployment (Partial)
- [x] Cloudflare Pages project `mailala` — CREATED ✅
- [x] Initial deploy to `mailala.pages.dev` — DONE ✅
- [ ] Redeploy latest canon (Mailala3 commits NOT deployed yet)
- [ ] GitHub Actions workflow `.github/workflows/deploy-mailala.yml`
- [ ] Connect custom domain `mailala.com`
- [ ] Preview deployments for branches
- [ ] Rollback/health-check script
- [ ] Update CLOUDFLARE-MANIFEST.md
- [ ] Verify DNS: mailala.com CNAME → mailala.pages.dev
- [ ] Remove verify.txt from deployment root

## What Incarnate-Mailala2 has that WEBSITE/mailala/ is MISSING:
- `wrangler.toml` — Cloudflare Pages project config
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `lighthouserc.json` — Lighthouse CI config
- `scripts/rollback.sh` — deployment rollback script
- `scripts/convert-webp.js` — image conversion utility
- `assets/gallery/` — gallery subdirectory
- `assets/icons/` — PWA icon directory