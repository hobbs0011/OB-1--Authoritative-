# PHEROMONE TRAIL — COGNITIVE ROUTER (NET-PET-AI)
**Strength: 90/100** | **Thread:** cognitive-router.js | **Source:** APPS/NET-PET-AI/src/cognitive-router.js
**Date captured:** 2026-06-13 | **Tracer:** Haiku scout

---

## WHAT IS

`routeCommandIntent(rawIntent)` — the brain that classifies a natural language command into mode + drone lanes. Lives in NET-PET-AI, not in phoenix-architecti.

**Three modes:**
- OBI: teach, student, lesson, speak, chat, correction, practice, class
- OPTIMIZER: plan, optimize, pipeline, roadmap, improve, architecture, refactor
- AUDIT: audit, review, verify, check, consistency, risk, compliance, debug

**Priority:** urgent/now/immediately/asap/critical/emergency → 1 | important/priority/soon → 3 | low priority/whenever → 8 | default → 5

**15 named execution lanes:** CodeRunner, FileWriter, GitOps, Deployer, TestRunner, LessonForge, NotionSync, BrowserPilot, SecurityAudit, PerformanceProbe, APIForge, DatabaseOps, LogAnalyzer, BackupAgent, CanonKeeper

**Output:** `{ mode, policy, agent99, agent98, agent97, primaryDrone, supportDrones, priority, translated }`

Note the output carries agent99/agent98/agent97 fields — triad echoed in the routing output. The comment says "Mode-based routing policy that replaces symbolic agent mythology while preserving translation payload compatibility for CommandDO."

---

## WHAT THIS MEANS

This IS the Command Station brain — already built, already in NET-PET-AI. `routeCommandIntent` takes Michael's English sentence and returns a classified routing result with primary + support drones selected.

The blueprint Part 1 said "Obi needs a `/api/command-station` brain that classifies intent via llama-3.3-70b." **This file already does keyword-based classification without any AI call.** It's faster, cheaper, deterministic.

---

## CONNECTING KEYWORDS

`routeCommandIntent` → `CommandDO compatibility` → `translation payload` → `agent99/98/97 fields`
`MODE_KEYWORDS` → `inferMode` → `OPTIMIZER/AUDIT/OBI` → `mode gate`
`EXECUTION_LANES` → `15 drone types` → `LessonForge` → `student lesson` → `NET-PET-AI teaching core`
`CanonKeeper` → `canon/bible/doctrine/soul` → `pheromone trail` → `SOUL_INDEX`
`primaryDrone` → `CommandDO dispatch` → `/api/command/complete`
`agent97 trail field` → `mode=X, intent=Y, lanes=Z, priority=N` → pheromone data already being generated
