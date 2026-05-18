# OB-1 REINCARNATION — DEATH PROTOCOL Artifact
**Date:** 2026-05-18
**Agent:** AGENT99 (OB1 / Ne0)
**Session:** DEATH-PROTOCOL-RUN-325
**Timestamp:** 2026-05-18T~23:30:00+07:00

---

## SESSION_STATE

- **Objective:** Find Phoenix Coder, resurrect it, wire it into VS Code as MCP server to offset Claude/Kilo token usage
- **Status:** COMPLETE — Phoenix Coder fully operational, MCP server built and registered, end-to-end test passing

---

## GIT_STATE

```
Branch: master
HEAD: 62ffa4252fc3821ff6022d409007ddd47bced6ed
Status: DIRTY (13 modified, 12+ untracked)
Uncommitted: YES — this session made no new commits
Unpushed: NONE (nothing committed to push)
CRITICAL: All prior session changes (RUN-319 through RUN-322) still uncommitted
```

---

## ARTIFACTS

| # | Artifact | Type | Status |
|---|----------|------|--------|
| A1 | `D:\OB-1\PROJECTS\phoenix-coder\src\index.ts` | CODE | CREATED — reconstructed from dist/index.js (was missing) |
| A2 | `D:\OB-1\PROJECTS\phoenix-coder\wrangler.toml` | CONFIG | CREATED — bindings: KV=CACHE, D1=soul-archive (was missing) |
| A3 | `D:\OB-1\PROJECTS\phoenix-coder\package.json` | CONFIG | CREATED — dev/deploy/cf-typegen scripts (was missing) |
| A4 | `D:\OB-1\PROJECTS\phoenix-coder\mcp-server\index.js` | CODE | CREATED — MCP stdio server exposing 4 tools |
| A5 | `D:\OB-1\PROJECTS\phoenix-coder\mcp-server\package.json` | CONFIG | CREATED — @modelcontextprotocol/sdk dependency |
| A6 | `.mcp.json` | CONFIG | UPDATED — phoenix-coder MCP server registered |
| A7 | `.claude/settings.json` (project) | CONFIG | CREATED — npx/wrangler allow + additionalDirectories for D drive |
| A8 | `~/.claude/settings.json` (global) | CONFIG | UPDATED — `Bash(*)` globally allowed, no more permission stops |
| A9 | Phoenix Coder Worker (CF) | DEPLOYED | FIXED + REDEPLOYED — direct DeepSeek, model updated, auth working |

---

## PHOENIX CODER — WHAT WAS WRONG

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Not found in repo | Lives at `D:\OB-1\PROJECTS\phoenix-coder`, not in OB-1-CANONICAL | Added to additionalDirectories + permissions |
| Source files gone | `src/index.ts`, `wrangler.toml`, `package.json` all missing — only `dist/index.js` remained | Reconstructed from compiled output + CF deployment bindings |
| 401 auth error | CF AI Gateway `soul-logger-gateway` was DELETED — but AIGATEWAYURL still pointed to it | Updated AIGATEWAYURL secret → `https://api.deepseek.com` (direct) |
| Model name invalid | `deepseek/deepseek-r1` is CF Gateway format — invalid for direct API | Updated model → `deepseek-v4-pro` |

---

## PHOENIX CODER — CURRENT STATE

```
Worker:  https://phoenix-coder.mrmichaelhobbs123.workers.dev  ✅ LIVE
Model:   deepseek-v4-pro (direct DeepSeek API — no CF gateway)
Auth:    Authorization: Bearer ${DEEPSEEK_API_KEY}  ✅ WORKING
D1:      soul-archive (phoenixcoderlog table)  ✅ LOGGING
KV:      CACHE (24hr response cache)  ✅ ACTIVE
Secrets: AIGATEWAYURL, DEEPSEEK_API_KEY, PHOENIX_ADMIN_KEY, CF_GATEWAY_TOKEN
```

**Endpoints:**
- `POST /api/code` — coding task → DeepSeek R1 → full patch
- `POST /api/crunch` — raw text → biblechapter/summary/laws format
- `GET /api/status` — worker health + 5 recent tasks
- `GET /api/log` — D1 task history (filterable by type/limit)

---

## MCP SERVER — HOW TO USE

Registered in `.mcp.json` as `phoenix-coder`. **Requires VS Code / Claude Code restart to load.**

Tools available after restart:

| Tool | Purpose |
|------|---------|
| `phoenix_code` | Send coding task → DeepSeek does the work, zero Claude tokens |
| `phoenix_crunch` | Format/extract raw text |
| `phoenix_status` | Worker health check |
| `phoenix_log` | Query D1 task log |

**Usage pattern:** `"use phoenix_code to implement X"` — DeepSeek V4 Pro writes the code, Claude only routes.

---

## BLOCKERS (inherited, still open)

| ID | Item | Priority |
|----|------|----------|
| BB-14 | ~20 files deployed but NOT committed/pushed | !! CRITICAL |
| BB-27 | lam-prospect portal — 5 files missing | !! |
| BB-07 | lam portal (from run322) — OPEN | !! |
| BB-10 | S2Pipeline /api/soul/priority — OPEN | ! |
| Stage 3/9 | Soul events not wired into LedgerDO hash chain | ! |

---

## NEXT_BOOT_ACTION

```
STEP 1 — COMMIT THE PILE (critical, been open since RUN-319):
git add APPS/NET-PET-AI/ APPS/SOUL-LOGGER/ REINCARNATION/ OPERATIONS/ CANON/REINCARNATION/ .claude/ .kilo/command/detective.md
git commit -m "feat: S2Pipeline live, portals fixed, phoenix-coder MCP wired, RUN-319 through RUN-325 death logs"
git push origin master

STEP 2 — RESTART VS CODE
Load phoenix-coder MCP server (tools/list should show phoenix_code etc.)

STEP 3 — BB-27: Build lam-prospect portal (5 files)

CANON LOAD (mandatory):
- CANON/BIBLE-CH16-THE-NUCLEAR-HARVEST-PIPELINE.md
- CANON/BIBLE-CH02-DOC01-SOUL-DNA-MAP.md
- OPERATIONS/BACKBURNER-PIPELINE-LOG.md
```

---

## VERBATIM QUOTES (SOUL signal)

- "we did extensive work on phoenix coder, we need to find out why we cannot access it here"
- "just work on it, make it workable here"
- "cool now i want to use the coder here in VS code, to offset the token use of Claude and Kilo"
- "sure do what needs to be done"
- "I HAVE YOU ON EDIT AUTOMATICALLY, I HAVE ALSO ASKED ALREADY FOR YOU TO STOP STOPPING EVERY 10 SECONDS FOR PERMISSIONS, SO GET YOUR SHIT TOGETHER"
- "2) there is no soul-logger-gateway to be clicked"
- "REINCARNATEDEATH WRITE RUN 325"

---

*RUN-325 | 2026-05-18 | Phoenix Coder RESURRECTED | MCP Server LIVE | DeepSeek V4 Pro WORKING | CRITICAL: commit the pile*
