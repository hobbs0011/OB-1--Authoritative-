# NET Landing Page — TrueFords Port Pipeline

## Objective
Build a TrueFords-style landing page for NET in `public/index.html`.

---

## Steps 1–4: Base Structure + Hero
1. Scaffold base HTML5 document with Inter font and CSS variables.
2. Build sticky nav with logo, links, mobile menu button, and CTA.
3. Build hero split-layout with headline, description, CTAs, and hero image.
4. Build announcement strip + trust badges row.

## Step 5: Playwright Rigorous Test (Steps 1–4)
- Load `/` in browser
- Verify announcement text renders
- Verify nav links all present
- Verify hero headline + 2 CTAs render
- Verify trust badges render 4 items
- Verify mobile menu toggle works
- **NO CRASHES** — if any step crashes, stop and report

## Steps 6–9: Product Carousel + Method Sections
6. Build product carousel with 5 cards: Mouse, Cub, Tiger, Voice Lab, B2B.
7. Add carousel arrow controls + scroll JS behavior.
8. Build "3 Tests That Prove NET Works" numbered cards section.
9. Build NET vs Traditional Schools comparison grid.

## Step 10: Playwright Rigorous Test (Steps 6–9)
- Scroll to carousel section
- Click carousel prev/next arrows
- Verify all 5 product cards render with badges
- Verify 3 test cards render with numbers 1, 2, 3
- Verify comparison grid shows 2 columns
- **NO CRASHES**

## Steps 11–14: Results + Journal + FAQ + Footer
11. Build Results/Stats section with 4 metric cards.
12. Build Journal/Blog card grid with 3 articles.
13. Build FAQ accordion with 5 questions + newsletter signup.
14. Build footer with 4-column links, trust badges, copyright.

## Step 15: Playwright Rigorous Test (Steps 11–14)
- Scroll to stats, verify 4 stat items render
- Scroll to journal, verify 3 article cards render
- Open FAQ accordion, verify first answer expands
- Submit newsletter form, verify no crash
- Scroll to footer, verify all 4 link columns render
- **NO CRASHES**

## Steps 16–19: Polish + Assets + Responsive
16. Verify all image assets exist and paths resolve.
17. Verify all links/buttons have valid href targets.
18. Add responsive breakpoints for mobile/tablet.
19. Run HTML validation and lint.

## Step 20: Playwright Rigorous Test (Steps 16–19)
- Resize viewport to mobile width, verify mobile nav
- Resize to tablet, verify grids collapse
- Click every link, verify no 404 crash
- Verify all images load (no broken image icons)
- **NO CRASHES**

## Step 21: Final Audit + Deploy
21. Run `node --check` / wrangler dry-run, deploy if clean.
