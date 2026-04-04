# 🚀 NET Launch QA Checklist

**Domain:** naturalenglishtraining.com  
**Stack:** Cloudflare Pages + Workers + KV  
**Last updated:** 2026-03-28

## Pre-Launch (Before Domain Goes Live)

- [x] **Stage 01** — Landing page (index.html) built and pushed
- [x] **Stage 02** — 404 page built
- [x] **Stage 03** — robots.txt + sitemap.xml
- [x] **Stage 04** — Pipeline tracker created
- [x] **Stage 05** — MX records (5x Google Workspace) ✅
- [x] **Stage 06** — SPF record ✅
- [x] **Stage 07** — DMARC record ✅
- [ ] **Stage 08** — Cloudflare Pages project created (connect GitHub repo)
- [ ] **Stage 09** — Pages build config (blank build command, output: `SITE/`)
- [ ] **Stage 10** — First deployment + verify at *.pages.dev
- [ ] **Stage 11** — Custom domain wired to Pages project
- [ ] **Stage 12** — SSL Full + HTTPS redirect verified
- [x] **Stage 13** — Workers API scaffold (api.js)
- [x] **Stage 14** — Chrome Extension v0
- [x] **Stage 15** — Workers wrangler.toml configured
- [x] **Stage 16** — KV namespace setup script
- [x] **Stage 17** — OBI chat widget (JS + CSS)
- [x] **Stage 18** — Widget wired to landing page + waitlist form
- [x] **Stage 19** — SEO (JSON-LD, OG, Twitter, canonical, keywords)
- [x] **Stage 20** — QA checklist (this file)

## Domain Transfer

- [ ] Domain lock OFF at Squarespace ✅
- [ ] Auth/EPP code obtained from Squarespace
- [ ] Transfer initiated at Cloudflare Registrar
- [ ] Transfer approval email confirmed
- [ ] Nameservers auto-switched to Cloudflare
- [ ] Cloudflare zone shows green checkmark

## Post-Launch Verification

- [ ] https://naturalenglishtraining.com loads correctly
- [ ] https://www.naturalenglishtraining.com redirects properly
- [ ] 404 page works for invalid URLs
- [ ] Email delivery: send test to hobbs@naturalenglishtraining.com
- [ ] SPF check passes (use mail-tester.com)
- [ ] DKIM check passes
- [ ] DMARC check passes
- [ ] SSL certificate valid (check in browser)
- [ ] Mobile responsive (test on phone)
- [ ] OBI widget opens and responds
- [ ] Waitlist form submits (or falls back to mailto)
- [ ] Page speed: Lighthouse score > 90
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] Google Search Console: submit sitemap
- [ ] Chrome Extension loads in developer mode

## Workers Deployment

- [ ] KV namespaces created (WAITLIST + SESSIONS)
- [ ] wrangler.toml updated with KV IDs
- [ ] `wrangler deploy` successful
- [ ] /api/health returns 200
- [ ] /api/waitlist accepts POST
- [ ] /api/chat responds
- [ ] /api/stats returns feature flags
- [ ] CORS working from naturalenglishtraining.com

## Security

- [ ] API token deleted from Cloudflare dashboard
- [ ] No secrets in GitHub repo
- [ ] WHOIS privacy ON
- [ ] SSL Full (not Flexible)
- [ ] HTTPS redirect ON

## Performance

- [ ] Images optimized (currently SVG favicon only)
- [ ] CSS/JS minified for production
- [ ] Cloudflare caching rules set
- [ ] Browser caching headers correct
