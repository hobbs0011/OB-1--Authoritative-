# NET Growth Pipeline — Stages 251–500
# Generated: 2026-05-21 | Run 367

---

## PHASE A — Personalization Engine (251–280)

251 PROFILE-INTAKE — Add profession + hobby + goal fields to student onboarding form
252 THEME-ARCHETYPES — Define 15 theme archetypes (tech/music/sport/business/health/art/law/education/food/travel/fashion/finance/science/social/other)
253 ARCHETYPE-MAPPER — Map profile fields to archetype at signup, store in ProfileDO
254 THEME-SCHEMA — Define theme config JSON: primary color, accent, bg motif, OBI greeting tone, leaderboard label, streak label
255 THEME-GENERATE — On signup, generate theme config from archetype, write to ProfileDO
256 THEME-API — GET /api/student/theme/:studentId — serve cached theme config, <10ms
257 CSS-VARIABLES — Portal CSS consumes theme config via injected :root variables on load
258 OBI-VOICE-CALIBRATION — OBI system prompt includes archetype context (engineer OBI vs artist OBI)
259 GREETING-VARIANTS — 15 archetype-specific OBI first-message templates
260 LEADERBOARD-LABELS — Leaderboard tier names vary by archetype (engineer: "kernel/compile/deploy", music: "practice/gig/headliner")
261 STREAK-MOTIF — Streak UI visual adapts to archetype (fretboard for music, circuit for tech)
262 ACHIEVEMENT-LABELS — Achievement names localized to archetype where applicable
263 HOBBY-VOCAB-INJECTION — Seed 10 hobby-domain vocab terms into student SRS deck at signup
264 THEME-UPDATE-ENDPOINT — PATCH /api/student/theme/:studentId — allow theme refresh after 10 sessions
265 SESSION-SIGNAL-DETECTOR — After 10 sessions, OBI scans for emerging interest keywords
266 AUTO-THEME-REFRESH — If signal detected, update theme config once and cache
267 PROFILE-PAGE-UPDATE — Profile page shows current archetype, allows manual override
268 ARCHETYPE-ANALYTICS — Admin dashboard: archetype distribution chart
269 OBI-MEMORY-HOOK — OBI references student's profession/hobby in encouragement messages
270 DAILY-CHALLENGE-THEMED — Daily challenge topics rotate through student's hobby domain monthly
271 CAREER-NAV-THEMED — Career section framing adapts to profession archetype
272 ONBOARDING-FLOW-THEMED — Onboarding step copy matches archetype (engineer gets logic-framed pitch)
273 BUDDY-MATCH-ARCHETYPE — Buddy system prefers same-archetype pairing
274 GROUP-CLASS-TRACKS — Group classes offer 2 tracks per session: general + profession-specific breakout
275 THEME-PREVIEW — On signup, student sees theme preview before confirming
276 THEME-CACHE-INVALIDATION — Theme regenerates if student updates profession or hobby in profile
277 INTEREST-GRAPH — ProfileDO stores interest graph (keyword frequency from OBI sessions)
278 INTEREST-EXPORT — GET /api/student/interests/:studentId — returns top 5 keywords for external use
279 ARCHETYPE-COLD-START — If no archetype data, default to "general" theme, prompt to complete profile
280 PERSONALIZATION-AUDIT — Admin can view per-student theme config and interest graph

---

## PHASE B — Sales Funnel (281–320)

281 TRIAL-SCHEMA — Add trial_start, trial_end, trial_status, conversion_date to ProfileDO
282 TRIAL-GATE — GET /api/student/trial/:studentId — returns trial status + days remaining
283 TRIAL-BANNER — Portal header shows days remaining on trial, non-intrusive
284 FOUNDING-MEMBER-FLAG — ProfileDO field: is_founding_member (boolean, set at signup)
285 FOUNDING-MEMBER-BADGE — Founding member badge on leaderboard, profile, and dashboard
286 FOUNDING-MEMBER-PRICE-LOCK — ProfileDO stores locked_price, never changes post-founding cohort
287 TRIAL-INACTIVITY-GATE — If no session in 7 days during trial, send OBI re-engagement message
288 TRIAL-REVOKE-POLICY — Trial auto-expires if <3 sessions/week for 2 consecutive weeks, triggers waitlist slot release
289 TRIAL-REVOKE-EMAIL — Automated email on revoke: "Your spot has been released to the waitlist"
290 WAITLIST-SCHEMA — KV: waitlist queue with name/email/signup_date
291 WAITLIST-PAGE — /waitlist.html — collect name + email + 1 sentence why
292 WAITLIST-API — POST /api/waitlist — add to KV queue, return position number
293 WAITLIST-COUNTER — Homepage shows live waitlist count (psychological scarcity)
294 OBI-CONVERSION-AWARENESS — OBI system prompt includes trial_days_remaining, speaks to it naturally at session 7/14/21
295 OBI-VALUE-ANCHORING — OBI delivers one unprompted value statement per week ("You've done X this week. That's more than most centers do in a month.")
296 GRADUATION-PROMISE-MODAL — After session 5, modal appears: "Your graduation date: [calculated]. We're committed."
297 PROGRESS-CONTRACT — PDF-style contract generated at session 5: student name, start date, target level, graduation date
298 PROGRESS-CONTRACT-API — POST /api/student/contract — generate and store contract, return PDF link
299 CONVERSION-TRIGGER-7 — At trial day 7: OBI says "You're in the zone. Don't lose momentum — lock in your rate before cohort closes."
300 CONVERSION-TRIGGER-14 — At trial day 14: OBI shows progress summary + cost comparison widget (center vs NET)
301 CONVERSION-TRIGGER-21 — At trial day 21: final nudge + founding member price expires in X days
302 COST-COMPARISON-WIDGET — /components/cost-compare.js — animated breakdown: center cost vs NET cost vs NET value
303 PAYMENT-CONFIRM-FLOW — Upgrade CTA links to existing payment flow (MoMo/bank), pre-fills student data
304 CONVERSION-WEBHOOK — POST /api/payment/converted — sets trial_status=converted, logs conversion_date
305 CONVERSION-CELEBRATION — Post-payment OBI message: custom congratulations referencing archetype
306 REFERRAL-CONVERSION-BONUS — If student was referred, referrer gets bonus credit on referral convert
307 TRIAL-ANALYTICS — Admin: conversion rate, avg days to convert, top dropout reasons (session gap analysis)
308 DROPOUT-SIGNAL — If session gap >5 days, flag in admin dashboard, optional TA outreach trigger
309 TA-OUTREACH-QUEUE — Admin can push at-risk students to TA outreach queue with one click
310 FOUNDING-COHORT-CLOSE — Admin toggle: close founding cohort, redirect /signup to /waitlist
311 COHORT-CLOSE-BANNER — Homepage banner: "Founding cohort closed — join waitlist for next opening"
312 WAITLIST-NOTIFY — When cohort reopens, email top N waitlist applicants automatically
313 SOCIAL-PROOF-FEED — Homepage: live feed of anonymized student wins ("A software engineer in HCMC completed Week 3")
314 TESTIMONIAL-CAPTURE — After session 20, OBI asks for a 1-sentence win to display (with permission)
315 TESTIMONIAL-API — POST /api/testimonial — store, admin-approve, display on homepage
316 EMPLOYER-PITCH-PAGE — /employers.html — pitch to companies: sponsor employee English upgrades
317 EMPLOYER-BULK-TRIAL — Admin: create N trial accounts linked to employer code (BlueTech model)
318 EMPLOYER-DASHBOARD — Employer login: see aggregate progress of their sponsored students (no PII)
319 B2B-INQUIRY-FORM — /employers.html contact form → POST /api/employer/inquiry → admin notification
320 FUNNEL-DASHBOARD — Admin: full funnel view (signup → trial active → at-risk → converted → churned)

---

## PHASE C — Premium UX (321–360)

321 DESIGN-TOKENS — Centralize all colors, fonts, spacing into a single design-tokens.css loaded globally
322 ANIMATION-LIBRARY — /assets/animations.css — entrance, fade, slide transitions used consistently
323 STREAK-ANIMATION — Streak increment triggers particle burst animation
324 LEVEL-UP-ANIMATION — CUB→FOX→WOLF level transition full-screen celebration moment
325 LOADING-SKELETON — All API-loaded sections show skeleton loader instead of blank flash
326 TOAST-SYSTEM — /components/toast.js — unified toast notifications (success/warning/error)
327 MODAL-SYSTEM — /components/modal.js — reusable modal with backdrop, escape-close, focus-trap
328 BUTTON-STATES — All CTAs have hover/active/disabled/loading states defined in CSS
329 MOBILE-AUDIT — Full mobile pass: all portals tested at 375px, 390px, 430px breakpoints
330 FONT-UPGRADE — Load a premium Vietnamese-compatible font (Inter or Plus Jakarta Sans via Google Fonts)
331 ICON-SYSTEM — Consistent icon set (Lucide or Heroicons) replacing ad-hoc emoji where appropriate
332 OBI-AVATAR — Animated OBI avatar (SVG, 3 states: idle/speaking/celebrating) in chat UI
333 CHAT-BUBBLE-POLISH — Chat UI: timestamps, read receipts, OBI typing indicator
334 VOICE-UI-POLISH — Voice recording button with animated waveform during recording
335 PROGRESS-RING — Dashboard: circular progress ring showing weekly goal completion %
336 STREAK-CALENDAR — Dashboard: GitHub-style streak calendar heatmap (last 90 days)
337 LEADERBOARD-PODIUM — Top 3 leaderboard slots rendered as podium visual, not list
338 BADGE-GALLERY — Achievements page: gallery grid with earned/locked states, hover reveals criteria
339 DARK-MODE — System-preference-aware dark mode via CSS media query + token overrides
340 PRINT-STYLESHEET — /progress-report.html printable version with clean print CSS
341 ERROR-PAGES — Custom 404 and 500 pages with OBI message and navigation back
342 EMPTY-STATES — All empty list states have illustrated OBI message (no blank boxes)
343 ONBOARDING-ANIMATION — Onboarding flow step transitions animated (slide, not flash)
344 CONFETTI — Confetti burst on: day 1 completion, first streak week, first level up
345 SOUND-DESIGN — Optional audio: streak chime, level up fanfare, correct answer tone (respects mute)
346 HAPTIC-HOOK — Mobile: vibration API on streak increment and level up
347 SCROLL-REVEAL — Dashboard sections animate in on scroll (IntersectionObserver)
348 STICKY-NAV — Portal nav becomes sticky on scroll with shadow + compact state
349 BACK-TO-TOP — Smooth scroll-to-top button on long pages
350 RESPONSIVE-TABLE — Leaderboard and analytics tables collapse gracefully on mobile
351 SKELETON-CHAT — Chat history loads with skeleton, not spinner
352 FOCUS-STATES — All interactive elements have visible keyboard focus states (accessibility)
353 ARIA-AUDIT — ARIA labels and roles added to interactive components
354 CONTRAST-AUDIT — All text meets WCAG AA contrast ratios
355 PERFORMANCE-AUDIT — Lighthouse pass: target 90+ performance, 100 accessibility
356 ASSET-OPTIMIZATION — Images compressed, SVGs inlined, CSS/JS minified in deploy
357 PRELOAD-HINTS — Critical fonts and CSS preloaded via <link rel="preload">
358 SERVICE-WORKER — Basic service worker for offline shell + asset caching
359 PWA-MANIFEST — /manifest.json + icons for Add to Home Screen on mobile
360 UX-SMOKE-TEST — Full end-to-end manual test pass: signup → trial → OBI chat → streak → leaderboard → upgrade

---

## PHASE D — Live Experience Layer (361–390)

361 TA-SCHEMA — D1 table: trainers (id, name, email, calendly_url, languages, speciality, active)
362 TA-ADMIN — Admin: add/edit/deactivate trainers
363 TA-PORTAL — /trainer.html — TA view: their assigned students, session notes, upcoming calls
364 TA-STUDENT-LINK — ProfileDO: assigned_trainer_id field
365 TA-ASSIGN — Admin: assign trainer to student (bulk or individual)
366 BUDDY-SCHEMA — D1 table: buddy_pairs (student_a, student_b, paired_date, active)
367 BUDDY-MATCH-API — POST /api/buddy/match — admin triggers matching algo (same level + compatible schedule)
368 BUDDY-PORTAL — Dashboard widget: your buddy, last contact, weekly call status
369 BUDDY-CHECKIN — POST /api/buddy/checkin — both students confirm weekly call happened, grants XP
370 BUDDY-MISS-FLAG — If buddy checkin not confirmed by Sunday, OBI flags it Monday
371 GROUP-CLASS-SCHEMA — D1 table: group_classes (id, date, time, topic, zoom_url, max_seats, enrolled)
372 GROUP-CLASS-API — CRUD /api/classes — admin creates, students enroll
373 GROUP-CLASS-CALENDAR — Student portal: upcoming classes calendar widget
374 GROUP-CLASS-ENROLL — POST /api/classes/:id/enroll — student enrolls, seat decrements
375 GROUP-CLASS-REMINDER — Automated reminder 24h and 1h before class (email or OBI message)
376 GROUP-CLASS-RECORDING — Class record URL stored post-session, available to enrolled students
377 ATTENDANCE-LOG — POST /api/classes/:id/attend — TA marks attendance, student gets XP
378 NETWORKING-EVENT-SCHEMA — D1 table: networking_events (id, date, format, topic, rsvp_deadline)
379 NETWORKING-RSVP — POST /api/events/:id/rsvp — student RSVPs, gets calendar invite
380 NETWORKING-PREP — OBI delivers event-specific conversation prep 3 days before event
381 SESSION-NOTES — TA can add session notes to student profile after each call
382 SESSION-NOTES-STUDENT — Student can view their own session notes (read-only)
383 ESCALATION-PROTOCOL — TA flags student as at-risk → admin alert → Michael notification
384 LIVE-CHAT-QUEUE — Admin/TA: real-time view of which students are in OBI session right now
385 WEEKLY-REPORT-STUDENT — Automated weekly email to student: streak, XP, buddy status, upcoming class
386 WEEKLY-REPORT-TA — Automated weekly email to TA: all assigned students' metrics
387 MONTHLY-REPORT-EMPLOYER — Automated monthly PDF report for employer-sponsored cohorts
388 OBI-HANDOFF — If student asks for human help, OBI offers to flag for TA — POST /api/ta/handoff
389 HANDOFF-QUEUE — TA dashboard: handoff queue from OBI, with context snippet
390 LIVE-LAYER-SMOKE-TEST — Full test: class creation → enroll → attend → TA note → buddy checkin

---

## PHASE E — Growth Engine (391–430)

391 REFERRAL-LINK — Student gets unique referral URL at signup: /join?ref=:code
392 REFERRAL-TRACK — GET /api/referral/track — logs referral click with UTM + student_id
393 REFERRAL-CONVERT — On trial activation via referral link, credit referrer
394 REFERRAL-REWARD-TIERS — 1 referral = 1 week free, 3 = 1 month free, 5 = permanent discount
395 REFERRAL-DASHBOARD — Student portal: referral count, pending, converted, reward balance
396 REFERRAL-LEADERBOARD — Admin: top referrers by month
397 SHARE-WIDGET — After every level up: one-click share card (pre-made image + caption for Facebook/Zalo)
398 SHARE-IMAGE-API — GET /api/share/:studentId — generates OG share card with student name + level
399 WIN-SHARE — After graduation milestone, shareable certificate image generated
400 VIRAL-LOOP — Referred student's first OBI message mentions referrer: "Your friend X believed in you"
401 NATIONAL-LEADERBOARD — Top 50 leaderboard visible to all logged-in students (anonymized by default)
402 LEADERBOARD-OPT-IN — Student can choose to show real name on national leaderboard
403 CITY-LEADERBOARD — Leaderboard filterable by city (HCMC, Hanoi, Da Nang, etc.)
404 EMPLOYER-LEADERBOARD — Employer dashboard shows internal company leaderboard
405 STREAK-CHALLENGE — Monthly 30-day streak challenge: top streak holders win recognition
406 CHALLENGE-ANNOUNCE — OBI announces monthly challenge at session start on 1st of month
407 ALUMNI-FLAG — ProfileDO: graduated (boolean) + graduation_date
408 ALUMNI-PORTAL — /alumni.html — graduates-only portal: networking, job board, advanced sessions
409 ALUMNI-BADGE — Graduated badge visible on all leaderboards
410 ALUMNI-TESTIMONIAL-PROMPT — Post-graduation: OBI requests video/text testimonial
411 TA-PIPELINE — Alumni invited to apply as Assistant Trainer (form → admin review → TA account)
412 TA-APPLICATION — /become-ta.html — application form + eligibility criteria
413 COMMUNITY-FEED — /community.html — student wins feed (opt-in posts, curated by admin)
414 WIN-SUBMISSION — POST /api/community/win — student submits win, admin approves, shows in feed
415 OBI-PROACTIVE-OUTREACH — If student misses 3 days, OBI sends unprompted check-in message
416 STREAK-FREEZE — Student earns 1 streak freeze per 30-day streak (protects against illness/travel)
417 STREAK-FREEZE-API — POST /api/streak/freeze — apply freeze, deduct from balance
418 DOUBLE-XP-EVENT — Admin triggers 2x XP weekend, OBI announces at session start
419 MILESTONE-EMAIL — Automated email at: day 7, day 30, day 90, graduation
420 NPS-SURVEY — After session 20 and session 60: OBI asks 1 NPS question in chat
421 NPS-API — POST /api/nps — store score + comment
422 NPS-DASHBOARD — Admin: NPS trend chart, low-score alert
423 SEO-BLOG — /blog/ static pages: 5 articles targeting "học tiếng Anh online", "ESL Vietnam", etc.
424 SOCIAL-PROOF-NUMBERS — Homepage live counters: students enrolled, sessions completed, avg streak
425 AFFILIATE-SCHEMA — D1 table: affiliates (id, name, commission_rate, link_code)
426 AFFILIATE-TRACK — Referral tracking extended to external affiliates (influencers, blogs)
427 AFFILIATE-DASHBOARD — Affiliate login: clicks, trials started, conversions, earnings
428 PARTNER-API — GET /api/partner/stats/:code — secure stats endpoint for affiliate partners
429 PRODUCT-HUNT-PREP — /product-hunt.html landing page variant optimized for PH launch
430 GROWTH-DASHBOARD — Admin: full growth metrics (CAC, LTV, referral rate, NPS, churn)

---

## PHASE F — Scale and Reliability (431–460)

431 RATE-LIMIT-AUDIT — Review all endpoints for rate limiting, tighten OBI chat to 60 req/min/student
432 D1-INDEXES — Add indexes on frequent query columns: student_id, session_date, streak_date
433 DO-EVICTION — ProfileDO: purge inactive sessions >90 days to reduce DO hibernation cost
434 KV-TTL-SWEEP — Audit all KV writes for appropriate TTL (theme config = 30d, session = 24h)
435 COST-MONITOR — Cloudflare Analytics Engine: track DO CPU ms, KV reads, D1 queries per day
436 COST-ALERT — If daily cost exceeds threshold, Slack/email alert to admin
437 ERROR-MONITORING — Wire Cloudflare logpush to external log store (Axiom or similar)
438 HEALTH-ENDPOINT — GET /api/health — returns worker version, D1 ping, DO ping, timestamp
439 HEARTBEAT-CRON — Cron job: every 5 min ping /api/health, alert if down
440 DEPLOYMENT-CHECKLIST — DEPLOYMENT.md: step-by-step wrangler deploy checklist with env var verification
441 STAGING-WORKER — Deploy staging worker at net-pet-ai-staging.mrmichaelhobbs123.workers.dev
442 STAGING-ENV — Separate D1 + KV bindings for staging environment
443 SMOKE-TEST-SCRIPT — /scripts/smoke-test.js — automated endpoint tests run post-deploy
444 ROLLBACK-PLAN — Document: how to rollback worker version via Cloudflare dashboard in <2 min
445 SECRET-ROTATION-DOCS — Document all secrets, rotation schedule, and who holds each key
446 BACKUP-STRATEGY — D1 export cron: weekly full export to R2 bucket
447 R2-EXPORT-CRON — Scheduled worker: exports D1 tables to R2 as JSON every Sunday 02:00 ICT
448 GDPR-LITE — Privacy policy page + data deletion endpoint: DELETE /api/student/:id/data
449 DATA-RETENTION — ProfileDO and D1: auto-delete inactive student data after 12 months no login
450 LOAD-TEST — Simulate 100 concurrent OBI sessions, measure latency, identify bottleneck
451 CDN-ASSETS — Static assets (CSS/JS/images) served from R2 + Cloudflare CDN, not worker
452 RESPONSE-COMPRESSION — Ensure all text responses use gzip/brotli (Cloudflare handles, verify)
453 WRANGLER-TOML-AUDIT — Clean wrangler.toml: remove dead bindings, verify all env mappings
454 ENV-VALIDATION — On worker startup, validate all required env vars present, throw if missing
455 LOGGING-STANDARD — All console.log replaced with structured JSON logs (level/message/studentId/ts)
456 DEPLOY-NOTIFICATION — Post-deploy webhook: notify admin Slack/email with SHA + timestamp
457 UPTIME-PAGE — /status.html — public status page showing last 30 days uptime
458 INCIDENT-RUNBOOK — RUNBOOK.md: step-by-step for common incidents (DO stuck, D1 timeout, key expired)
459 DEPENDENCY-AUDIT — Review all external dependencies (Deepgram, DeepSeek, Resend): SLA, fallback plan
460 SCALE-READINESS-REVIEW — Architecture review: can system handle 1000 concurrent students? Document answer.

---

## PHASE G — Alumni and Network (461–490)

461 ALUMNI-ONBOARD — Graduation triggers auto-email with alumni portal access
462 ALUMNI-DIRECTORY — /alumni/directory.html — searchable alumni list (opt-in only)
463 ALUMNI-PROFILE — Each alumni has public profile: industry, company, graduation date, testimonial
464 JOB-BOARD — /alumni/jobs.html — employer-posted English-required job listings
465 JOB-POST-API — POST /api/jobs — employer submits listing, admin approves
466 JOB-APPLY-TRACK — Student clicks apply → tracked → employer notified
467 MENTOR-MATCH — Alumni can opt-in as mentor to current students in same industry
468 MENTOR-REQUEST — Student can request mentor match via dashboard
469 MENTOR-SESSION-LOG — Both parties log mentor session, student earns XP
470 ALUMNI-NEWSLETTER — Monthly email to alumni: new job posts, upcoming events, community wins
471 ALUMNI-WEBINAR — Monthly alumni-only advanced session: business English, negotiation, presentation
472 ALUMNI-WEBINAR-ENROLL — /alumni/webinars.html — enroll flow same as group classes
473 CORPORATE-ALUMNI-TRACK — Companies that sponsor 3+ alumni get named corporate partner status
474 CORPORATE-PARTNER-PAGE — /partners.html — showcase corporate partners with logo + student count
475 SPEAKER-SERIES — Quarterly event: alumni or partner speaks to current students (Zoom)
476 SPEAKER-APPLY — Alumni can apply to speak via /alumni/speak.html
477 CASE-STUDY-PAGE — /results.html — detailed before/after case studies (3 alumni, with permission)
478 CASE-STUDY-API — Admin: create case study linked to alumni profile
479 PRESS-PAGE — /press.html — media mentions, downloadable press kit
480 AMBASSADOR-PROGRAM — Top alumni offered ambassador role: 10% commission on referrals + co-branding
481 AMBASSADOR-DASHBOARD — Ambassador login: referral stats, content kit, commission balance
482 ALUMNI-SURVEY — Annual alumni survey: employment outcome, salary change, English confidence
483 SURVEY-API — POST /api/alumni/survey — store response
484 OUTCOME-METRICS — Admin: aggregate outcome data (employment rate post-graduation, avg salary delta)
485 NETWORK-EVENTS-ALUMNI — Alumni invited to in-person Lakeview/HCMC networking events
486 EVENT-RSVP-ALUMNI — /alumni/events.html — RSVP same flow as student events
487 ALUMNI-LEADERBOARD — Lifetime XP leaderboard for alumni (separate from current students)
488 ALUMNI-BADGE-TIERS — Alumni badges: 1yr/2yr/5yr anniversary, mentor, ambassador, speaker
489 RE-ENROLLMENT — Alumni can re-enroll for advanced cohort at loyalty price
490 NETWORK-HEALTH-REPORT — Monthly admin report: alumni activity, mentor sessions, job placements

---

## PHASE H — Ship and Polish (491–500)

491 FINAL-CONTENT-PASS — Native English review of all student-facing copy (OBI messages, portal text)
492 VIETNAMESE-TRANSLATION — All UI strings translated to Vietnamese (student can toggle language)
493 LANGUAGE-TOGGLE — Portal header: EN/VI toggle, stores preference in ProfileDO
494 FINAL-MOBILE-PASS — Full manual test on real iOS and Android devices
495 ONBOARDING-VIDEO — 60-second intro video on /join.html: what NET is, who it's for, what happens next
496 DEMO-ACCOUNT — Live demo account (no login required): 3 sample OBI messages, streak/leaderboard preview
497 LAUNCH-CHECKLIST — LAUNCH.md: all systems green checklist before public announcement
498 SOFT-LAUNCH — Open founding cohort to Lakeview community, monitor for 2 weeks
499 FEEDBACK-SPRINT — 2-week rapid iteration on top 5 founding member pain points
500 FULL-LAUNCH — Open waitlist conversions, publish press page, activate social proof feed

---

SOULCOUNT GATE: 76,488 | LOCK | DELTA 0 | Run 367
