---
description: "PCCloud — serverless mission runner via phoenix-architecti /api/mission. Uses CF-Qwen on Cloudflare servers. No laptop needed once fired. Chunk large tasks into steps of max 300 lines output each to avoid 30s CF timeout."
---

# /PCCloud — Phoenix-Centurion_Cloud

**AGENT:** phoenix-architecti CF Worker → CF-Qwen (native, no timeout from Dialagram)
**ROUTE:** POST /api/mission → GitHub read → CF-Qwen generate → GitHub commit
**USE FOR:** Large builds, student portals, multi-file pipelines, background runs

---

## KEY RULE — CHUNKING

CF-Qwen has a 30s execution window. Large outputs (>300 lines) will timeout.

**ALWAYS break large tasks into steps of max 300 lines each.**

- Full HTML page → split into: head+tab1, tab2, tab3, tab4+tab5+close
- Multi-file builds → one file per step
- Never ask CF-Qwen to generate a full portal in one step

---

## EXECUTION

```powershell
$headers = @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="}
$steps = @(
  @{ read="<github/path/to/context>"; task="<focused task — max 300 lines output>"; write="<github/path/to/write>" }
  @{ read="<github/path>"; task="<next chunk>"; write="<github/path>" }
)
$body = @{ steps=$steps; commit_message="<message>" } | ConvertTo-Json -Depth 10 -Compress
$result = Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/mission" -Method POST -ContentType "application/json" -Headers $headers -Body $body
$result.steps | ForEach-Object { Write-Output "$($_.path) $($_.status) $($_.chars)chars $($_.error)" }
```

**Repo:** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`
**Generation:** CF-Qwen (`@cf/qwen/qwen2.5-coder-32b-instruct`) — runs on CF, no laptop needed

---

## CHUNKING PATTERNS

**Student portal (5 tabs):**
- Step 1: HTML head + scaffold + tab 1 (Vocabulary)
- Step 2: Tab 2 (Listening) + Tab 3 (Speaking)
- Step 3: Tab 4 (Reading) + Tab 5 (Progress) + closing JS

**Multi-file build:**
- One step per file

**Large refactor:**
- One step per function group

---

## REPORT FORMAT

```
PCCLOUD ✅ — CF-Qwen serverless
MISSION: <id>
STEPS: <n> total | <n> ok | <n> failed
COMMITTED: <paths>
RETRIES NEEDED: <paths that errored>
```

On timeout error → reduce task scope and retry that step only.

---

## RULES

- Always chunk — never one step for a full portal
- write=null for read-only analysis steps
- Missions run on CF servers — laptop can go offline after firing
- Check results via git pull when back online
- On error: retry the failed step with a smaller task scope
