# BATTLE Stage 8 — NET Website & Domain Health Audit

**Date:** 2026-03-26  
**Auditor:** Agent-99 (OB1)  
**Scope:** All website assets across 3 repos, 2 domains, Cloudflare Workers  
**Limitation:** No HTTP ping tool available — audit is code/config only, not live endpoint testing

---

## Executive Summary

**GRADE: D+ (Production-Unready)**

The website exists as a polished static landing page with strong branding but critical infrastructure gaps. Two domains are split across unclear hosting, essential pages are missing, and the site leaks internal technology details publicly.

---

## Domain Inventory

| Domain | Purpose | Status |
|---|---|---|
| `naturalenglishtraining.com` | Main brand site (index.html) | UNKNOWN (last known: 502/504 alert) |
| `naturalenglishtraining.net` | OBI AI tutor app | UNKNOWN |
| `phoenix-ob1-system.mrmichaelhobbs1234.workers.dev` | Cloudflare Worker endpoint | UNKNOWN |

**🔴 CRITICAL:** Last known status was **502/504 DOWN** (from ALERT page in Notion). Cannot verify current state without HTTP tools.

---

## Website Asset Audit

### Files Found
| File | Repo | Size | Status |
|---|---|---|---|
| `WEBSITE/index.html` | Ultimate | 29KB | ✅ Present, full single-page site |
| `WEBSITE/gallery.html` | Ultimate | 11KB | ✅ Present |
| `privacy.html` | — | — | 🔴 MISSING (footer links to it) |
| `terms.html` | — | — | 🔴 MISSING (footer links to it) |
| `sitemap.xml` | — | — | 🔴 MISSING |
| `robots.txt` | — | — | 🔴 MISSING |
| `favicon.ico` | — | — | ⚠️ Using inline SVG data URI (works but no browser tab icon file) |
| `404.html` | — | — | 🔴 MISSING |
| `manifest.json` | — | — | 🔴 MISSING (PWA not supported) |

### Missing Pages Count: 5 critical files

---

## index.html Deep Audit

### ✅ What's Good
- **Responsive design** — full mobile breakpoints at 768px and 480px
- **Performance** — pure CSS animations, no heavy JS frameworks
- **SEO basics** — meta description, OG tags present
- **Branding** — Gospel 444 palette (purple/gold/void) perfectly applied
- **Typography** — Orbitron + Rajdhani + Inter loaded correctly
- **Mouse→Tiger methodology** clearly presented
- **OBI chat preview** — effective demo of the AI tutor
- **Scroll animations** — IntersectionObserver for reveal effects
- **Mobile nav** — hamburger menu with toggle

### 🔴 Critical Issues

| # | Issue | Severity | Impact |
|---|---|---|---|
| W-1 | **Tech stack leaked publicly** — "Powered by advanced AI (DeepSeek + Deepgram)" in OBI features list | 🔴 HIGH | Competitors can replicate your exact stack. Remove vendor names from public site. |
| W-2 | **Broken footer links** — `privacy.html` and `terms.html` don't exist | 🔴 HIGH | Legal liability. GDPR/privacy compliance gap. |
| W-3 | **No og:image tag** — OG metadata missing image | 🟡 MEDIUM | Social shares show no preview image (ugly on Facebook/LINE/Zalo) |
| W-4 | **All lesson cards link to gallery.html** — no individual lesson URLs | 🟡 MEDIUM | SEO dead end. Every lesson should have its own shareable URL. |
| W-5 | **No analytics** — no Google Analytics, Plausible, or any tracking | 🔴 HIGH | Flying blind. Zero data on visitors, conversions, or traffic sources. |
| W-6 | **No CSP headers** — Content Security Policy not configured | 🟡 MEDIUM | XSS vulnerability surface (mitigated by static content) |
| W-7 | **No structured data** — no JSON-LD schema markup | 🟡 MEDIUM | Missing rich snippets in Google search results |
| W-8 | **Testimonials may be fabricated** — "Mai T.", "Tram N.", "Linh P." with specific roles | ⚠️ FLAG | If these aren't real students, this is a legal and trust risk. Verify or remove. |
| W-9 | **Hero stats potentially misleading** — "7+ Galaxy Lessons", "24/7 AI Tutor Access" | ⚠️ FLAG | If OBI is down (502/504), "24/7" claim is false. If lessons < 7, "7+" is false. |
| W-10 | **No HTTPS enforcement in code** — no redirect logic | 🟡 MEDIUM | Relies entirely on hosting provider for SSL |

### ⚠️ Branding Leak Risk
The HTML source contains zero references to "Phoenix Rising" — **brand separation is clean**. ✅
But the Worker URL `phoenix-ob1-system.mrmichaelhobbs1234.workers.dev` contains the internal codename. Anyone inspecting network traffic will see it.

---

## Deployment Architecture

### Cloudflare Workers (from Phoenix-Rise-Immortalize- repo)
- `DEPLOY/cloudflare/m0.wrangler.toml` — Worker config exists
- `DEPLOY/cloudflare/src/` — Worker source code exists
- Secrets managed via Wrangler CLI ✅
- Known secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY, SOVEREIGN_KEY, CHAT_KEY, GITHUB_TOKEN, SRCSHA256

### Google Cloud Run (from Phoenix-Rise-Immortalize- repo)
- `DEPLOY/google/m0-cloudrun-service.yaml` — service config exists
- `DEPLOY/google/m0-workflow.yaml` — workflow config exists
- Dual deployment target (Cloudflare + GCP) — may cause confusion on which is live

### Legacy (NET-Ai-EcoSystem-CommandStation)
- Vite + React app (`src/App.jsx`, `src/main.jsx`)
- Has `package.json` and `vite.config.js`
- **Status: ABANDONED** — no recent commits, superseded by other repos

---

## Domain Split Risk

| Issue | Detail |
|---|---|
| `.com` vs `.net` split | Main site on .com, OBI app on .net — confusing for users |
| No redirect between them | Users may land on wrong domain |
| SEO dilution | Two domains splitting authority instead of one strong domain |
| **Recommendation** | Consolidate to `.com` with OBI as a subdomain or path (`naturalenglishtraining.com/obi`) |

---

## Action Items

| Priority | Action | Effort |
|---|---|---|
| 🔴 P0 | Create `privacy.html` and `terms.html` | 2 hours |
| 🔴 P0 | Remove DeepSeek/Deepgram from public-facing text | 5 minutes |
| 🔴 P0 | Add analytics (recommend Plausible for privacy-first) | 30 minutes |
| 🔴 P0 | Verify site is actually UP and serving | 5 minutes (manual) |
| 🟡 P1 | Add `sitemap.xml` and `robots.txt` | 30 minutes |
| 🟡 P1 | Add `og:image` meta tag with branded preview image | 1 hour |
| 🟡 P1 | Add JSON-LD structured data (Organization + Course) | 1 hour |
| 🟡 P1 | Create individual lesson landing pages | 4 hours |
| 🟡 P1 | Add 404 error page | 30 minutes |
| 🟢 P2 | Consolidate .com/.net into single domain | 2 hours |
| 🟢 P2 | Rename Worker URL to hide internal codenames | 1 hour |
| ⚠️ VERIFY | Confirm testimonials are from real students | Michael's call |
| ⚠️ VERIFY | Confirm hero stats are accurate | Michael's call |
