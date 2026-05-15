# Notion Vault Hardening SOP
# Pipeline Phase 8 — Run 310 — 2026-04-19

## Stage 71 — Notion Role: Control-Plane Mirror

Notion is a **non-blocking mirror and operator control plane only**.
- Durable Objects (LEDGER DO) = canonical source of truth for all runtime events
- Notion = searchable human-readable index, ops dashboards, approval queues
- If Notion is unavailable: Worker continues operating, Ledger remains intact
- Architecture enforced in `APPS/NET-PET-AI/src/index.js` — all Notion writes wrapped in `.catch(() => {})` (fire-and-forget)

## Stage 72 — Ledger as Canonical Source

LEDGER DurableObject (`APPS/NET-PET-AI/src/index.js`) is the primary event store.
- All chat exchanges → Ledger first (line ~912: `appendToLedger`)
- Notion receives mirror copy only when `NOTION_CHAT_MIRROR=1` (opt-in)
- Notion is never queried for decision-critical runtime data
- Soul DNA → Ledger + Notion mirror (writeSoulDNA), content truncated at 2000 chars

## Stage 73 — Summary-Plus-Pointer Mirror Policy

Apply for high-volume surfaces:
- `writeChatExchange`: stores 800-char truncated User + OBI summary — NOT full session transcripts
- `writeSoulDNA`: stores pointer hash + 2000-char content excerpt; full raw archive lives in Ledger
- `writeProgress`: stores summary metrics (score, XP, level) — not raw event stream
- Full data retrieval path: query LEDGER DO `/history`, not Notion

## Stage 74 — Full Transcript Mirror Disabled by Default ✅ IMPLEMENTED

`writeChatExchange` now guarded by `NOTION_CHAT_MIRROR=1` opt-in env var.

**Default state**: OFF (no per-message Notion writes)
**Activation**: Set `NOTION_CHAT_MIRROR=1` wrangler secret to enable
**Rationale**: At 6 active students × avg 30 messages/session × 3 sessions/week = 540 Notion writes/week. Free tier at 1000 blocks limit degrades quickly.

## Stage 75 — Batch Write Policy

Current single-write architecture is acceptable for current student volume (6 students).
Batching upgrade required when sustained writes exceed 100/day:
- Coalesce progress updates per student per session (1 write per session end, not per event)
- Use `syncStudentProgress` (already slices to 10 entries) for bulk sync runs
- Add CF Queue binding when daily write volume consistently exceeds 100 (paid tier trigger)

## Stage 76 — Retry and Dead-Letter Policy ✅ IMPLEMENTED

`notionFetch` in `src/notion.js` now retries 5xx errors up to 2 times with 600ms/1200ms delays.
- 4xx errors (auth/schema): fail immediately — no retry (prevents token lockout accumulation)
- 5xx errors (transient): retry 2× with exponential backoff
- Dead-letter: all Notion write failures are `.catch(() => {})` — they do NOT surface to user
- Monitoring: check Notion API status at https://status.notion.so if write anomalies detected

## Stage 77 — Token Rotation Calendar

| Token | Location | Rotation Frequency | Next Due |
|---|---|---|---|
| NOTION_API_KEY | Wrangler secret | No expiry (internal integration) | On permission change |
| CLOUDFLARE_API_TOKEN | Repo secret + Wrangler | Review annually | 2027-04-19 |
| CLOUDFLARE_API_KEY (cfk_) | Wrangler env | No expiry (Global API Key) | Never auto-rotates |
| PAT_HOBBS0011 | Repo secret | Review when GitHub prompts | Check GitHub settings |

**Token rotation action**: Set a calendar reminder for 2027-04-01 to audit all tokens.
**Notion integration page**: https://www.notion.so/profile/integrations

## Stage 78 — Legacy/Invalid Notion Token Audit

| Token Slot | Status | Action |
|---|---|---|
| NOTION_API_KEY | ✅ Active — primary integration token | Keep |
| NOTION_LESSONS_DB | ✅ DB ID — valid if Notion workspace is connected | Keep |
| NOTION_PROGRESS_DB | ✅ DB ID — valid if Notion workspace is connected | Keep |
| NOTION_SOUL_DNA_DB | ✅ DB ID — valid if Notion workspace is connected | Keep |
| NOTION_TOKEN_2..6 | ❌ Not found in wrangler.toml or .dev.vars | Non-existent |

No legacy token slots found. Token inventory is clean.

## Stage 79 — Notion Workspace Ownership Matrix

| Resource | Owner | Access Level |
|---|---|---|
| Notion Workspace | mrmichaelhobbs123@gmail.com | Admin |
| Internal Integration (NOTION_API_KEY) | Above account | Full DB access |
| Lessons DB | Above workspace | Read/write |
| Progress DB | Above workspace | Write (progress mirror) |
| Soul DNA DB | Above workspace | Write (DNA archive pointer) |

Workspace: naturalenglishtraining.net (or personal workspace if free plan)
Integration page: https://www.notion.so/profile/integrations
No shared/team members on Notion accounts (single operator).

## Stage 80 — SOP Summary

**This document is the Notion Hardening SOP for Run 310.**

Runbook summary:
1. Notion = mirror ONLY. Never let Notion become source of truth.
2. `NOTION_CHAT_MIRROR=1` must be explicitly set to enable per-message writes (off by default).
3. Retry logic active for transient 5xx in `notionFetch`. Check status.notion.so on anomalies.
4. Token rotation review due 2027-04-01.
5. Batch upgrade threshold: 100 writes/day sustained → evaluate CF Queue integration.
6. Ledger DO is the always-on event store. Notion is the always-optional mirror.

**Status: HARDENED** ✅ — 2026-04-19, Run 310
