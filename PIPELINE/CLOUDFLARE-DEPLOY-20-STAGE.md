# 🚀 Cloudflare Deploy Pipeline — 20 Stages

**Mission:** Deploy naturalenglishtraining.com on Cloudflare from zero to production  
**Mode:** SUPER SAIYAN — Maximum output, governance intact  
**Created:** 2026-03-28  
**Repo:** hobbs-lab/Phoenix-Rising-Protocol-Ultimate  

---

## Phase 1: Foundation (Stages 1–5)

| # | Stage | Owner | Status | Artifact |
|---|-------|-------|--------|----------|
| 01 | Build OBI landing page (index.html) | AGENT | ✅ DONE | `SITE/index.html` |
| 02 | Build 404 + error pages | AGENT | ✅ DONE | `SITE/404.html` |
| 03 | Build robots.txt + sitemap.xml | AGENT | ✅ DONE | `SITE/robots.txt`, `SITE/sitemap.xml` |
| 04 | Push all site assets to GitHub | AGENT | ✅ DONE | this commit |
| 05 | Verify MX records in Cloudflare DNS | MICHAEL | ⏳ WAITING | Cloudflare DNS panel |

## Phase 2: Deploy (Stages 6–10)

| # | Stage | Owner | Status | Artifact |
|---|-------|-------|--------|----------|
| 06 | Add SPF/DKIM/DMARC email security records | MICHAEL | 🔲 TODO | Cloudflare DNS panel |
| 07 | Wait for DNS propagation → green check | SYSTEM | ⏳ PROPAGATING | auto |
| 08 | Create Cloudflare Pages project | MICHAEL | 🔲 TODO | Dashboard → Pages → Create |
| 09 | Connect GitHub repo + set output dir (`SITE/`) | MICHAEL | 🔲 TODO | Pages settings |
| 10 | Verify deployment + test live URL | AGENT+MICHAEL | 🔲 TODO | live URL check |

## Phase 3: Content + Infrastructure (Stages 11–15)

| # | Stage | Owner | Status | Artifact |
|---|-------|-------|--------|----------|
| 11 | Wire custom domain to Pages project | MICHAEL | 🔲 TODO | Pages → Custom domains |
| 12 | Verify SSL/TLS + force HTTPS redirect | AGENT+MICHAEL | 🔲 TODO | SSL/TLS panel |
| 13 | Build Workers API endpoint scaffold | AGENT | 🔲 TODO | `WORKERS/api.js` |
| 14 | Build Chrome Extension v0 scaffold | AGENT | 🔲 TODO | `CHROME-EXT/` |
| 15 | Build contact/waitlist form (Workers) | AGENT | 🔲 TODO | `WORKERS/waitlist.js` |

## Phase 4: Enhancement (Stages 16–20)

| # | Stage | Owner | Status | Artifact |
|---|-------|-------|--------|----------|
| 16 | Configure Cloudflare KV namespace | MICHAEL | 🔲 TODO | Dashboard → KV |
| 17 | Build OBI chat widget (Workers + AI) | AGENT | 🔲 TODO | `WORKERS/obi-chat.js` |
| 18 | Wire OBI widget to landing page | AGENT | 🔲 TODO | `SITE/index.html` update |
| 19 | SEO optimization + Cloudflare Web Analytics | AGENT | 🔲 TODO | meta tags + analytics |
| 20 | Final QA + go-live sign-off | AGENT+MICHAEL | 🔲 TODO | checklist |

---

## Quick Reference

| Key | Value |
|-----|-------|
| Cloudflare Account | mrmichaelhobbs1234@gmail.com |
| Zone ID | `9abf74bec775219720170fec5a1f7656` |
| Account ID | `8717160562faa73b9eebb0a51f988785` |
| Domain | naturalenglishtraining.com |
| GitHub Repo | hobbs-lab/Phoenix-Rising-Protocol-Ultimate |
| Site Directory | `SITE/` |
| Workers Directory | `WORKERS/` |
| Chrome Extension | `CHROME-EXT/` |

## Michael's Action Queue

When you're ready, work top-to-bottom:

1. **Check DNS Records tab** — verify Google Workspace MX records exist:
   - `ASPMX.L.GOOGLE.COM` (priority 1)
   - `ALT1.ASPMX.L.GOOGLE.COM` (priority 5)
   - `ALT2.ASPMX.L.GOOGLE.COM` (priority 5)
   - `ALT3.ASPMX.L.GOOGLE.COM` (priority 10)
   - `ALT4.ASPMX.L.GOOGLE.COM` (priority 10)
2. **Add SPF record** — TXT record on `@`: `v=spf1 include:_spf.google.com ~all`
3. **Wait for green checkmark** on domain overview
4. **Pages → Create a project** → Connect to `hobbs-lab/Phoenix-Rising-Protocol-Ultimate` → Build output directory: `SITE/`
5. **Custom domains** → add `naturalenglishtraining.com` and `www.naturalenglishtraining.com`
6. **SSL/TLS** → verify Full mode is active

## Account Policy (LOCKED)

- `mrmichaelhobbs1234@gmail.com` = **Cloudflare ONLY**
- `hobbs@naturalenglishtraining.com` = **EVERYTHING ELSE**
- Future: transfer Cloudflare to hobbs@ when ready

## Architecture

```
naturalenglishtraining.com
  ├── Cloudflare DNS (nameservers active)
  ├── Cloudflare Pages (static site from SITE/)
  ├── Cloudflare Workers (API + OBI chat)
  ├── Cloudflare KV (student data)
  └── Chrome Extension (OBI client, $0 deploy)
```

## Cost

| Item | Monthly Cost |
|------|-------------|
| Cloudflare (existing paid plan) | $5 |
| Cloudflare Pages (free tier) | $0 |
| Cloudflare Workers (free tier) | $0 |
| Cloudflare KV (free tier) | $0 |
| Chrome Extension (Chrome Web Store) | $0 |
| Gemini Nano (on-device AI) | $0 |
| **TOTAL** | **$5/mo** |
