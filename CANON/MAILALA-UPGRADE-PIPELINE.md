# Mailala Site — 50-Stage Upgrade Pipeline

Target: Make the Mailala site the best fucking thing we have done.
Aesthetic: warm island (forest green, gold, cream). No dark backgrounds, no neon.

## Audit
- [x] 1. Audit current site performance and UX
- [x] 2. Audit Mailala1 vs Mailala2 incarnations
- [x] 3. Check Cloudflare deployment state
- [x] 4. Identify gaps vs "best we have done" bar

## Foundation
- [ ] 5. Add `<title>` and canonical meta
- [ ] 6. Add Open Graph image and Twitter card image
- [ ] 7. Add JSON-LD structured data (Hotel / LodgingBusiness)
- [ ] 8. Add `hreflang` and language meta
- [ ] 9. Add `sitemap.xml` and `robots.txt`
- [ ] 10. Add `_headers` security and cache hardening

## Visual Design
- [ ] 11. Refine hero typography and spacing for maximum impact
- [ ] 12. Add hero entrance animation (fade + slide)
- [ ] 13. Redesign CTA buttons with stronger contrast and hover lift
- [ ] 14. Add gold shimmer effect to `.highlight`
- [ ] 15. Refresh card styles with subtle depth and warm shadows
- [ ] 16. Add section dividers with wave/organic shapes
- [ ] 17. Upgrade testimonial cards with quote marks and accent border
- [ ] 18. Add parallax/ken-burns effect to hero background
- [ ] 19. Add floating "Big Up" badge in hero corner
- [ ] 20. Add loading shimmer for images

## UX Improvements
- [ ] 21. Add smooth scroll offset for fixed nav
- [ ] 22. Add active nav state on scroll
- [ ] 23. Add room type quick-select pills above booking form
- [ ] 24. Add price match/guarantee trust badge near form
- [ ] 25. Add WhatsApp quick-book floating button with pulse
- [ ] 26. Add form validation with inline error states
- [ ] 27. Add success toast/modal after booking submit
- [ ] 28. Add back-to-top button
- [ ] 29. Add lazy-loading fade-in for section images
- [ ] 30. Add mobile bottom nav or sticky book bar

## Performance
- [ ] 31. Add `fetchpriority="high"` to hero image if converted
- [ ] 32. Add `preconnect` for WhatsApp and Google Maps
- [ ] 33. Inline critical CSS above-the-fold
- [ ] 34. Add `loading="lazy"` to below-fold images
- [ ] 35. Add service worker for PWA offline caching
- [ ] 36. Add PWA manifest with icons and splash screens
- [ ] 37. Optimize image file sizes and formats (WebP/AVIF)
- [ ] 38. Add resource hints (`prefetch`, `preload`)
- [ ] 39. Minify CSS/JS for production
- [ ] 40. Add performance budgets and Lighthouse CI config

## Content & Copy
- [ ] 41. Rewrite hero headline for stronger emotion
- [ ] 42. Add micro-storytelling to room cards
- [ ] 43. Add "Perfect For" badges to rooms (solo, couple, group)
- [ ] 44. Expand rooftop section with event calendar snippet
- [ ] 45. Add FAQ section with collapse/expand
- [ ] 46. Add urgency/social proof strip near booking form
- [ ] 47. Add "Last Booked 2 min ago" live widget
- [ ] 48. Add weather/widget for Saigon sunset time
- [ ] 49. Add printable booking confirmation page
- [ ] 50. Final visual QA pass and commit to canon

## Deployment
- [ ] Create Cloudflare Pages project config
- [ ] Add GitHub Actions deploy workflow
- [ ] Add preview deployment for branches
- [ ] Add rollback/health-check script
- [ ] Update Cloudflare manifest with live project
