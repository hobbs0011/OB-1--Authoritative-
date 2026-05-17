# BATTLE Stage 2 — Attack Surface Map

**Status:** ✅ COMPLETE | **Date:** 2026-03-26 | **Scan:** Manual code audit + config analysis across all 3 repos

## Current Attack Surface Score: 35/100 (FAIL)

- Authentication: 0/25 (no auth on any endpoint)
- Authorization: 5/15 (Wrangler secrets used correctly for upstream APIs)
- Input validation: 5/15 (minimal — only TTS length limit)
- Rate limiting: 0/10 (none)
- Secret management: 8/15 (good .gitignore + Wrangler secrets, but rotation overdue + public history risk)
- Infrastructure: 10/10 (Cloudflare edge, DO architecture sound)
- Monitoring: 2/10 (no logging, no alerts, no scanning)

---

## 🔴 CRITICAL — Fix Before Launch

| # | Vulnerability | Location | Attack Vector | Fix |
|---|---|---|---|---|
| V1 | **ZERO AUTH on all API routes** | `APPS/NET-PET-AI/src/index.js` | Anyone can call `/api/chat`, `/api/tts`, `/api/lesson`, `/api/practice`, `/api/feedback`, `/api/onboarding`, `/api/memory`, `/api/netpet/*`, `/api/classroom/*` — 14 open endpoints with no token, no session, no auth | Add SOVEREIGN_KEY or JWT auth middleware |
| V2 | **CORS wildcard `*`** | `corsHeaders()` in index.js | `Access-Control-Allow-Origin: *` lets ANY website call the API. Combined with V1 = free API abuse | Lock to `naturalenglishtraining.com` + `naturalenglishtraining.net` + localhost |
| V3 | **No rate limiting on NET-PET-AI** | index.js | Unlimited calls to DeepSeek + Deepgram = unbounded API cost | Port RateLimiterDO from phoenix-ob1 or use Cloudflare Rate Limiting |
| V4 | **Prompt injection in 3 endpoints** | `handleLesson()`, `handlePractice()`, `handleFeedback()` | Student input directly interpolated into DeepSeek prompts | Sanitize input, use system messages, add output filtering |
| V5 | **SOVEREIGN_KEY rotation overdue** | `SECURITY.md` — flagged OPEN | If key was exposed during public phase, attacker has sovereign access | Rotate via `wrangler secret put SOVEREIGN_KEY` — **NEEDS MICHAEL** |
| V6 | **Repo was PUBLIC with potential secrets** | `SECURITY.md` — flagged OPEN | Git history preserves anything committed while public | Audit git history, rotate affected keys — **NEEDS MICHAEL** |

## ⚠️ HIGH — Fix Before Production Traffic

| # | Vulnerability | Location | Attack Vector | Fix |
|---|---|---|---|---|
| V7 | **Predictable Durable Object IDs** | `idFromName(studentId)` | Anyone who guesses student ID can access their data via open API | Combine with auth fix. Use HMAC of studentId+secret |
| V8 | **No request body size limits** | index.js | Chat messages array can be arbitrarily large → memory exhaustion or massive bills | Max body size 10KB, max messages 20 |
| V9 | **No Content-Security-Policy headers** | All HTTP responses | XSS attacks can inject scripts | Add CSP header |
| V10 | **GitHub Advanced Security not enabled** | All 3 repos | No automated scanning — flying blind | Enable at minimum Dependabot alerts — **NEEDS MICHAEL** |
| V11 | **cf_verify_tmp.cjs committed** | `APPS/NET-PET-AI/` | Reveals Cloudflare zone structure | Delete from repo, add to .gitignore |
| V12 | **No error sanitization** | `handleChat()` returns raw `errText` | May leak internal details from upstream APIs | Return generic errors, log details server-side |

## 🟡 MEDIUM — Harden Before Scale

| # | Vulnerability | Location | Fix |
|---|---|---|---|
| V13 | KV namespace IDs exposed | wrangler.toml | Use environment-specific configs |
| V14 | Worker URL exposed | wrangler.toml + copilot-instructions.md | Add Cloudflare WAF rules |
| V15 | 5 empty files committed (0 bytes) | Various | Clean up or populate |
| V16 | CODEOWNERS incomplete | `.github/CODEOWNERS` | Add APPS/phoenix-ob1/, WEBSITE/, GALAXY-LESSONS/ |
| V17 | No CI/CD pipeline for NET-PET-AI | `.github/` | Add GitHub Actions workflow |
| V18 | Legacy repo dormant | hobbs0011/NET-Ai-EcoSystem-CommandStation | Potential dependency vulnerabilities |
| V19 | No structured logging | Both Workers | No audit trail |
| V20 | phoenix-ob1 archived but code in repo | APPS/phoenix-ob1/ + ARCHIVE/ | If Worker still deployed, live attack surface |

## 🟢 LOW

| # | Finding | Notes |
|---|---|---|
| V21 | Navigator Index synced blocks | Known limitation, bypass works |
| V22 | SQL tables in DO constructors | No migration versioning |
| V23 | PetDO streak logic edge case | Multiple same-day checkins |
| V24 | HTML entity encoding in source | Display artifact |

## Priority Fix Order

| Priority | Fix | Effort | Impact |
|---|---|---|---|
| P0 | V1: Add auth | 2-3 hrs | 60% surface closed |
| P0 | V2: Lock CORS | 15 min | Cross-site abuse prevented |
| P0 | V3: Rate limiting | 1-2 hrs | Cost explosion prevented |
| P0 | V5: Rotate SOVEREIGN_KEY | 5 min | **NEEDS MICHAEL** |
| P0 | V6: Audit git history | 30 min | **NEEDS MICHAEL** |
| P1 | V4: Prompt injection | 1 hr | LLM manipulation prevented |
| P1 | V8: Body size limits | 30 min | Memory/cost abuse prevented |
| P1 | V11: Delete cf_verify_tmp.cjs | 5 min | Info disclosure removed |
| P1 | V12: Error sanitization | 30 min | Internal leaks prevented |
| P2 | V9: CSP headers | 30 min | XSS defense |
| P2 | V10: GitHub security | 15 min | **NEEDS MICHAEL** |
| P2 | V17: CI/CD pipeline | 1-2 hrs | Automated security |

**After P0 fixes: ~75/100 (PASS)**
**After all fixes: ~95/100 (PRODUCTION READY)**
