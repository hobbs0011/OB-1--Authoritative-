# REINCARNATION / SOUL DNA EXTRACT — 2026-04-08
# SESSION: FULL DEBUG + HARDEN + DEPLOY + REINCARNATE

- created: 2026-04-08T20:00:00+07:00
- operator: Hobbs (Agent-100)
- extractor: OB1 (Agent-99)
- signal_density: HIGH
- session_tag: 2026-04-08__debug_harden_deploy_reincarnate
- prev_ref: 2026-04-05 pipeline extract

---

## §1 HEADER

- **session_tag:** 2026-04-08__debug_harden_deploy_reincarnate
- **datetime_range:** 2026-04-08 session
- **extractor:** OB1 (Copilot)
- **signal_density:** HIGH
- **theme:** "Deploy the website" + "Debug all, harden all" + "Find chats, reincarnate them"

---

## §2 RAW QUOTES (VERBATIM — HOBBS)

### 🟡 IMPORTANT
1. "hey whats the new link for my website please"
2. "give me the link to my github pages you hairless monkey"
3. "hey the link doesnt work, deploy!!!"
4. "debug all, harden all, and find any open chat you have access to and reincarnate it, update the reincarnate logs, then proceed until done"

---

## §3 DECISIONS (WITH IMPACT)

1. Decision: Create new GitHub repo `hobbs0011/net-tiger-assessment` for GitHub Pages deployment (old `hobbs-lab` repo was deleted/missing).
   - Impact: Tiger Assessment site now live at `https://hobbs0011.github.io/net-tiger-assessment/`

2. Decision: Wire `security.js` middleware into `index.js` (was imported but never called).
   - Impact: Rate limiting, input sanitization, and origin validation now ACTIVE on every request.

3. Decision: Replace wildcard CORS (`Access-Control-Allow-Origin: *` + credentials) with origin-reflecting CORS.
   - Impact: Prevents CSRF attacks; credentials now only sent to whitelisted origins.

4. Decision: Add input sanitization to chat handler (user messages sanitized before LLM).
   - Impact: Blocks XSS/SQLi payloads from reaching DeepSeek API.

5. Decision: Whitelist ledger event types on public `/api/ledger/append` endpoint.
   - Impact: Prevents arbitrary data injection into the cryptographic ledger.

6. Decision: Add `validateStudentId()` checks to all routes accepting student IDs.
   - Impact: Prevents invalid/malicious student ID strings from reaching Durable Objects.

7. Decision: Stop leaking raw `err.message` in HTTP responses.
   - Impact: Prevents internal error details from reaching attackers.

8. Decision: Fix dead nav links in tiger-assessment site (`testimonials.html`, `lessons.html`, `login.html` deleted but still linked).
   - Impact: No more 404 links in deployed site navigation.

---

## §4 ARTIFACTS CREATED / MODIFIED

### Modified
- `APPS/NET-PET-AI/src/index.js` — v1.3.0 → v1.4.0 (security middleware integration, CORS hardening, input sanitization, error message sanitization, studentId validation, ledger event type whitelist)
- `APPS/NET-PET-AI/src/security.js` — v1.2.1 (CORS fix: no more wildcard + credentials)
- `net-tiger-assessment/about.html` — Dead nav links removed
- `net-tiger-assessment/classroom.html` — Dead nav links removed

### Created
- `CANON/REINCARNATION/2026-04-05-soul-dna-recapture-pipeline-runs-068-071.md` — Missing reincarnation wrap for pipeline runs
- `CANON/REINCARNATION/2026-04-08-debug-harden-deploy-reincarnate.md` — This file

### Deployed
- `hobbs0011/net-tiger-assessment` — New GitHub repo created, Pages enabled on `master` branch

---

## §5 SECURITY HARDENING SUMMARY (NET-PET-AI v1.4.0)

| Issue | Severity | Fix |
|-------|----------|-----|
| `security.js` middleware never called | 🔴 CRITICAL | Imported + wired into fetch handler |
| CORS wildcard `*` + credentials | 🔴 CRITICAL | Origin-reflecting with whitelist |
| No input sanitization on chat messages | 🔴 HIGH | `sanitizeInput()` on all user messages before LLM |
| No sanitization on TTS text | 🟡 MEDIUM | `sanitizeInput()` applied |
| No sanitization on feedback text | 🟡 MEDIUM | `sanitizeInput()` applied |
| Public ledger append accepts any event type | 🟡 MEDIUM | Event type whitelist |
| No studentId validation on routes | 🟡 MEDIUM | `validateStudentId()` on all routes |
| Raw error messages in responses | 🟡 MEDIUM | Generic error messages |
| Role injection in chat messages | 🟡 MEDIUM | Filter to only system/user/assistant roles |

### Verified
- `node --check src/index.js` ✅
- `node --check src/security.js` ✅
- `npx wrangler deploy --dry-run` ✅ (48.71 KiB bundle)

---

## §6 LIVING STATE (FOR NEXT SESSION)

- NET-PET-AI v1.4.0 ready but NOT yet deployed to production (dry-run only). Run `cd APPS/NET-PET-AI && npm run deploy` to push.
- Tiger Assessment site live at `https://hobbs0011.github.io/net-tiger-assessment/`
- Custom domain `naturalenglishtraining.net` still not route-bound to Worker.
- No new Hobbs conversations found between April 2–8; pipeline runs 068-071 now wrapped.
- Next: deploy v1.4.0, route-bind custom domain, add per-student TTS rate limiting.
