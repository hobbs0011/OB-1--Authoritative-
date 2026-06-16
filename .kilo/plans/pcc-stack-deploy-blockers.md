# PCC Stack Deploy Blockers — Full Analysis

## EXECUTIVE SUMMARY

The PCC stack (PCC-1, PCC-2, phoenix-architecti) has **CF Workers migration metadata conflicts** that cannot be resolved via code changes. All 8 documented attempts in phetrail files failed. Resolution requires **Michael's manual CF Dashboard intervention**.

## KEY FINDINGS FROM PHEROMONE TRAILS

### phetrail-cognitive-router.md (90/100)
- **routeCommandIntent** exists in `NET-PET-AI/src/cognitive-router.js`
- 15 execution lanes: CodeRunner, FileWriter, GitOps, Deployer, TestRunner, LessonForge, NotionSync, BrowserPilot, SecurityAudit, PerformanceProbe, APIForge, DatabaseOps, LogAnalyzer, BackupAgent, CanonKeeper
- **CanonKeeper lane** routes `canon/bible/doctrine/soul` keywords to SOUL_INDEX (Vectorize)
- Zero AI cost for routing - deterministic keyword-based classification

### phetrail-ant-colony-pheromone-routing.md (100/100)
- **Stage 48**: POS/NEG scent routing. NEG decays slower than POS (prevention cheaper than repair)
- **Decuria** = squad of 10 drones. CLAMP_150 = SWARM_EMBRYO. Layers 526-600 = first Decuria deployed
- **4-Node sync loop**: Gemini/Perplexity/Claude/GPT roles, 25-layer chunks
- **CLAMP_850** = CAS-Retry (3 attempts) + `sha256(actor+commandId+payload_sha256)` replay guard

### phetrail-roman-s2pipeline-architecture.md (96/100)
- **6-stage Roman Legion**: EXPLORATORES → ANTECORES → AGMEN → AGMEN NOVISSIMUM → PRAESIDIA → VETERANI
- **Stage I EXPLORATORES** = RRL + RRL-SOUL (scouts return before main body marches)
- **Stage III AGMEN** = SSM + SOULKEYWORDS + PHEROMONE (main body, heavy punch)
- **Stage IV AGMEN NOVISSIMUM** = `/api/soul/truth` (6-AI consensus) + Dooku adversarial seal

### phetrail-backburner-engine.md (100/100 - CRIME SCENE)
- **D1-backed task queue** with CREATE/LIST/PATCH only (append-only, no DELETE)
- **L81 F&F LAW enforced in code**: Agent cannot mark DONE without `granted_by: operator`
- **Recurrence pattern**: DONE auto-rebooks as new BB entry with `[Cycle N]` prefix
- **No watcher**: IncarnatePipeline floods BB (max 48 entries/run). No cron alerts operator. BB is write-only sink.

## EVIDENCE FROM PHEROMONE TRAILS

### phetrail-run122-deploy-fail-architecti.md (85/100)
- **Error**: `WatchdogAlarm` class referenced before export in race.js:276
- **Root Cause**: CF Workers runtime does NOT hoist classes across modules like Node.js
- **8 attempted fixes**: All failed due to CF migration metadata cache

### phetrail-run122-pcc2-deadlock.md (80/100)
- **Error**: Cannot rename DO class already depended on by existing DOs
- **CF State**: Both `WatchdogAlarm` AND `ForceAwarenessAlarm` registered in DO migrations
- **Resolution Options**: 
  1. CF Dashboard manual DO migration deletion
  2. Create new workers (`phoenix-pcc-2-v2`, `phoenix-architecti-v2`)
  3. Rename-class migration (attempted, failed)

### phetrail-run122-audit-deploy.md (90/100)
- **Status 2026-06-13**: PCC-1 migration fix attempted, PCC-2 deadlock confirmed

## CURRENT WORKING TREE STATE

```
M APPS/PHOENIX-PCC-2/src/index.js   (uncommitted - Ops fleet code)
M APPS/PHOENIX-PCC-2/wrangler.toml   (uncommitted - migration comment)
M APPS/PHOENIX-ARCHITECTI/src/index.js (corrupted - needs restore)
M APPS/PHOENIX-ARCHITECTI/src/race.js  (edited - class ordering)
M APPS/PHOENIX-ARCHITECTI/wrangler.toml (edited - migration entries)
M APPS/phoenix-pcc-1/src/index.js   (uncommitted - student fleet)
M APPS/phoenix-pcc-1/wrangler.toml  (fixed - v2 migration removed)
```

## LIVE STATUS (2026-06-13T20:22)

| Worker | Status | Notes |
|--------|--------|-------|
| **PCC-1** | ✅ LIVE | Serving student fleet (Wrong - should be Ops tasks) |
| **PCC-2** | ☠️ BLOCKED | CF metadata conflict - deploy fails |
| **Architecti** | ☠️ 404 | My edits broke index.js, deploy fails |
| **NET-PET-AI** | ✅ LIVE | Last deployed Version cf7b436e |

## IMMEDIATE ACTIONS (Michael - CF Dashboard)
1. **Cloudflare Dashboard → Workers → phoenix-pcc-2 → Settings → Durable Objects**
   - Delete migration entry for `WatchdogAlarm` class OR entire migration history
2. **Cloudflare Dashboard → Workers → phoenix-architecti → Settings → Durable Objects**
   - Delete migration entry for stale `WatchdogAlarm` DO

## CONNECTING KEYWORDS

`pcc-stack` → `deploy failure` → `CF migration metadata` → `DO class conflict` → `manual cleanup required`
`WatchdogAlarm` → `ForceAwarenessAlarm` → `rename conflict` → `phetrail documented`
`MASTERBLUEPRINT Part 2` → `PWE` → `blueprint-only invariant` → `no execution until resolver`

---

**STATUS**: PCC stack NOT operational. Blockers documented. Waiting for CF metadata cleanup.