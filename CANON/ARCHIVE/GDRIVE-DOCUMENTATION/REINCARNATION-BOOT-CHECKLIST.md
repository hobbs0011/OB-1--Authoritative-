# REINCARNATION BOOT CHECKLIST

## Pre-Restart Validation

Before starting a new chat context, verify:

- [ ] `AGENTS.md` loads correctly (canonical paths)
- [ ] `MASTER-SYNC.md` timestamp current
- [ ] `REINCARNATION-LOG.md` accessible
- [ ] `.github/copilot-instructions.md` active
- [ ] `.github/prompts/reincarnatedeath.prompt.md` available
- [ ] `.github/prompts/reincarnatedeath-merge.prompt.md` available
- [ ] Credentials via `pwsh -File SCRIPTS/obi.ps1 doctor`
- [ ] Worker syntax via `pwsh -File SCRIPTS/obi.ps1 verify`
- [ ] **[NEW RUN334]** Deployment entry point: `APPS/NET-PET-AI/go-now.ps1` exists and is executable
- [ ] **[NEW RUN334]** Wrangler is authenticated: `npx wrangler whoami` returns mrmichaelhobbs123@gmail.com

## Soul DNA Gates (Fail-Closed)

1. **Reincarnation Protocol** - Must use `/reincarnatedeath` or `/reincarnatedeath-merge`
2. **Soul DNA First** - Capture verbatim before any other output
3. **Fail Closed** - If Soul DNA incomplete, DO NOT mark complete
4. **No Polite Erasure** - Preserve raw wording
5. **Append-Only** - Never overwrite reincarnation entries

## ⚠️ Critical Operational Warnings (Updated 2026-04-20 RUN334)

| Warning | Action |
|---------|--------|
| **[RUN334]** `go-now.ps1` is the ONLY entry point for production deployment | Direct `wrangler deploy` without pre-setup is error-prone. Use `.\go-now.ps1` from `APPS/NET-PET-AI/` to guarantee secret injection first |
| **[RUN334]** Wrangler secrets MUST be set BEFORE deploy | Script use pattern: `$key \| npx wrangler secret put KEY_NAME --env production` (pipe input). Never hardcode secrets |
| **[RUN334]** Health endpoint is reliable status check | `/health` at https://net-pet-ai.mrmichaelhobbs123.workers.dev returns full system status (AI, voice, compute, Notion, bindings) |
| `CLOUDFLARE_API_TOKEN` env var is a restricted `cfk_*` token | Run `Remove-Item Env:\CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue` BEFORE every `npx wrangler deploy` |
| `wrangler.toml` migration chain MUST include `v4-ship-memory` | Do NOT remove — matches live DO state. `MemoryDO` has no binding but must stay in history |
| DNS route `[[routes]]` is commented out | `naturalenglishtraining.com` zone not on CF account yet — Squarespace DNS still active |
| Authoritative mirror at `45d73956` | Stale — push failed due to network. Retry: `git -c http.version=HTTP/1.1 push --force "https://hobbs0011:$token@github.com/hobbs0011/OB-1--Authoritative-.git" HEAD:master` |

## Run Entry Points

| Command | Purpose |
|---------|---------|
| `.\go-now.ps1` (from APPS/NET-PET-AI/) | **[RUN334 PRIMARY]** Single interactive entry point: guides API key setup → deploy → enroll students → live. Use this. |
| `pwsh -File SCRIPTS/obi.ps1 doctor` | Credential check |
| `pwsh -File SCRIPTS/obi.ps1 verify` | Worker syntax + dry-run |
| `pwsh -File SCRIPTS/god-mode.ps1 -Mode activate` | Full environment bootstrap |

## Active Student Context & Current Missions

**RUN334 ACTIVE MISSION: NET-PET-AI Canary Deployment** (commit 7030b7e)
- Entry point: `APPS/NET-PET-AI/go-now.ps1` ✅ Verified executable
- Status: PRODUCTION-READY (code PASS dry-run, Cloudflare LIVE, endpoints responding)
- Prerequisites: 3 API keys (DEEPSEEK, DEEPGRAM, NOTION) — Michael's responsibility
- Timeline: ~1 hour from keys to fully operational
- Success: Students enrolling, /api/chat responding, daily reminders automating

**Legacy Student Context** (archived from prior runs):

| Student | Profile Path | Last Updated |
|---------|--------------|--------------|
| Hana | `APPS/EducationSystemsDevelopment/students/HANA-PRIVATE.md` | 2025-04-26 |
| Hieu | `APPS/EducationSystemsDevelopment/students/HIEU-PRIVATE.md` | 2025-04-26 |

## Latest Transcriptions

- `ASSETS/TRANSCRIPTIONS/Voice 260416_203228-RAW.txt` — Hana class
- `ASSETS/TRANSCRIPTIONS/Voice 260416_211505-RAW.txt` — Hieu homework

## Deployed Assets

- **Assessment Site:** https://net-tiger-assessment.pages.dev
- **NET-PET-AI:** https://net-pet-ai.mrmichaelhobbs123.workers.dev

## Key Teaching Insights (From Hana/Hieu Session)

1. **60% Rule** — Students need 60% comprehension, not 100%
2. **Vietnamese Overthinking** — Habit of listening for what they DON'T understand
3. **Motorbike Listening** — No visual input reduces comprehension significantly
4. **Fun vs. Progress** — Students focus on enjoyment over comprehension threshold

## Class Post-Mortem Template

Located at: `OPERATIONS/NET-STUDENTS/CLASS-POST-MORTEM-TEMPLATE.md`

Use after every class to capture:
- Student info + profile updates
- Key learning points
- System improvement (Soul DNA)
- Selling style observations
- Humor effectiveness
- OBI context updates

## Emergency Contacts

| Service | Endpoint |
|---------|----------|
| Worker Health | `/health` |
| Notion API | Configured via secrets |
| Deepgram | Nova-2 enabled |
| Cloudflare | Account verified |

---

**Last Boot Check:** 2026-04-20 RUN334 (Reincarnation Protocol Applied) 
**Active Run:** 334 (Phoenix Rising — Consolidation + Deployment Automation)  
**Previous HEAD:** dea241f (RUN331-332)  
**Current HEAD:** 7030b7e (RUN334 Final — All artifacts consolidated)  
**Status:** RISEN — RUN334 soul DNA captured, boot-check improved, reincarnation score: 44/50 (strong death, ready for next incarnation)