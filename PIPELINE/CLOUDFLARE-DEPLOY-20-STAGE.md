# Cloudflare Deploy Pipeline — 20 Stages

**Project:** Natural English Training  
**Domain:** naturalenglishtraining.com  
**Stack:** Cloudflare Pages + Workers + KV  
**Started:** 2026-03-28  
**Last updated:** 2026-03-28 22:50 ICT

## Status Summary

| Range | Status | Notes |
|-------|--------|-------|
| Stages 01-04 | ✅ SHIPPED | commit `9354ef81` |
| Stages 05-07 | ✅ DONE | MX/SPF/DMARC via API script — ALL GREEN |
| Stages 08-12 | ⏳ BLOCKED | Waiting on domain transfer (Squarespace → Cloudflare) |
| Stages 13-15 | ✅ SHIPPED | commit `a60a8669` |
| Stages 16-20 | ✅ SHIPPED | KV, widget, SEO, waitlist, QA |

## Pipeline Detail

### Phase 1: Foundation (COMPLETE)

- [x] **Stage 01** — Build landing page (index.html) ✅ `9354ef81`
- [x] **Stage 02** — Build 404 error page ✅
- [x] **Stage 03** — Create robots.txt + sitemap.xml ✅
- [x] **Stage 04** — Push pipeline tracker ✅

### Phase 2: DNS & Email (COMPLETE)

- [x] **Stage 05** — Configure MX records (5x Google Workspace) ✅ API script
- [x] **Stage 06** — Add SPF TXT record ✅
- [x] **Stage 07** — Add DMARC TXT record + SSL Full + HTTPS ✅

### Phase 3: Deployment (BLOCKED — DOMAIN TRANSFER)

- [ ] **Stage 08** — Create Cloudflare Pages project (connect `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`)
- [ ] **Stage 09** — Configure build: blank command, output directory `SITE/`
- [ ] **Stage 10** — First deployment, verify at *.pages.dev URL
- [ ] **Stage 11** — Wire custom domain naturalenglishtraining.com
- [ ] **Stage 12** — Verify SSL + HTTPS redirect

**BLOCKER:** Squarespace won't allow nameserver change (Google Workspace management lock). Domain transfer to Cloudflare Registrar initiated. Waiting for auth/EPP code from Squarespace support.

### Phase 4: Backend (COMPLETE)

- [x] **Stage 13** — Workers API scaffold (api.js with health/waitlist/chat/stats) ✅ `a60a8669`
- [x] **Stage 14** — Chrome Extension v0 (manifest, popup, content script) ✅
- [x] **Stage 15** — Wrangler config ✅

### Phase 5: Product (COMPLETE)

- [x] **Stage 16** — KV namespace setup script (kv-setup.sh) ✅
- [x] **Stage 17** — OBI chat widget (obi-widget.js + obi-widget.css) ✅
- [x] **Stage 18** — Widget wired to landing page + inline waitlist form (replaces mailto) ✅
- [x] **Stage 19** — SEO: JSON-LD structured data, Open Graph, Twitter cards, canonical, keywords ✅
- [x] **Stage 20** — QA launch checklist ✅

## Architecture

```
naturalenglistraining.com
├── Cloudflare Pages (static site from SITE/)
├── Cloudflare Workers (API at /api/*)
│   ├── KV: WAITLIST (email signups)
│   └── KV: SESSIONS (chat history)
├── Chrome Extension (CHROME-EXT/)
└── DNS: Cloudflare
    ├── MX → Google Workspace (5 records)
    ├── SPF → _spf.google.com
    ├── DMARC → quarantine policy
    ├── DKIM → Google key
    └── SSL: Full + HTTPS redirect
```

## Remaining Work (After Domain Transfer)

1. Connect Cloudflare Pages to GitHub repo
2. Deploy to *.pages.dev and verify
3. Wire custom domain
4. Run KV setup script (kv-setup.sh)
5. Deploy Workers (`wrangler deploy`)
6. Run full QA checklist
7. Submit sitemap to Google Search Console
8. Delete exposed API token

## Commits

| Commit | Contents |
|--------|----------|
| `9354ef81` | SITE/index.html, SITE/404.html, SITE/robots.txt, SITE/sitemap.xml, PIPELINE/ |
| `a60a8669` | WORKERS/api.js, WORKERS/wrangler.toml, CHROME-EXT/* |
| `TBD` | Stages 16-20: KV setup, OBI widget, SEO upgrade, waitlist form, QA checklist |

## Account Map

| Service | Account |
|---------|--------|
| Cloudflare (paid) | mrmichaelhobbs1234@gmail.com |
| GitHub (hobbs-lab) | hobbs@naturalenglishtraining.com |
| Google Workspace | hobbs@naturalenglishtraining.com |
| Domain registrar | Squarespace → transferring to Cloudflare |
