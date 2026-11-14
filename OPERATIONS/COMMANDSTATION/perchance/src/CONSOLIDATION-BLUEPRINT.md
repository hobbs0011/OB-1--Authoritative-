# CONSOLIDATION BLUEPRINT — repos, workers, vault (prepare, not yet execute)

Date: 2026-11-11. Goal: one live map before any merge/move. READ-ONLY prep:
no pushes, no deploys, no key moves, no spend. Consolidation executes only on
explicit sovereign order per lane.

## 1. REPOS — live vs copies (do not confuse them)
LIVE (measured in src/gitcanon.js):
- AUTH `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-@canon` — the ONE authority
  (GOSPEL-999, Field Guide, REINCARNATION-CONTRACT, VAULT mirrors, station chain).
  Locked without PAT; 401 = locked, never absent.
- MAIN `Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate@main` — public monorepo,
  ~4746 files (CANON, APPS, OPERATIONS/NET-STUDENTS, HARVESTED archive).
- WORKER `net-pet-ai-worker@main` — live bundle source + wrangler bindings.
- OPEN scaffolds: FullStackMarketing, net-marketing-landing, ImageGen.
- ARCHIVE `hobbs0011/NET-Ai-EcoSystem-CommandStation` — raw soul-DNA logs (~100 chats).
- TIGER `hobbs0011/net-tiger-assessment` — CANON/SYSTEM + PRTech mirror.
COPIES (scratch only, never authority): scratch/generators/* downloads,
scratch/recovery/* backups, message-attachments. Census, quarantine, then delete —
never merge FROM a copy without byte-compare to live first.
LANE R1: census every repo (files, bytes, HEAD) → mark LIVE / MIRROR / COPY / RETIRE.

## 2. WORKERS — live 3, rest are paper
LIVE tree (shipped here): src/cloudflare/worker.js (glue/front door) +
src/mcp-server/worker.js (STAGED, not deployed — DEPLOY.md needs /cf token, BLOCKED) +
src/sites/naturalenglishtraining/backend/worker.js (NET backend). Each has wrangler.toml.
PAPER: ~30+ worker.js/wrangler copies under scratch/recovery + scratch/generators —
backup exhaust, not a fleet. "Dozens of workers" = 3 live + backup copies until proven otherwise.
LANE W1: table each worker (live/staged/backup) with entrypoint, bindings, cron, deploy
state, last proof. LANE W2: single deploy board — what deploys where, on whose order.

## 3. VAULT — extensive records, strict handling
- BROWSER (this origin only): obi_keys slots — names last seen: cf, cfAcct, deepgram, gh +
  vault keypair + sealed-vault pointers. No kilo slot. Values NEVER in chat/source/ILOG.
- SEALED: vault keypair + escrow pointers (ciphertext-only in the open, VAULT-RECOVERY).
- FILES: src/vault.js (gate logic), src/soul-vault/* (harvests, 8-principles session),
  src/SESSIONS/stage-00-key-vault-handoff (pointer history).
- RULES: Fail-closed store (write + read-back or NOT STORED). Two-step forget lives in
  page memory only. No mass-wipe path exists (DESTRUCTIVE-ORDER PROTOCOL). Rename =
  new origin = stranded store (rename back restores view).
LANE V1: names-only census per record home (browser/kv/sealed/files) with counts, no values.
LANE V2: pointer repair first (addresses before secrets), rotation only on named order.

## 4. PHEROMONE TRAILS — the consolidation tracking layer (456 live)
Ground = key/kind/signal, decay at read, negatives remembered 180d. Convention for lanes:
- mission:consolidate-repo-<name> / mission:consolidate-worker-<name> / mission:consolidate-vault-<slot>
- route:<lane> for proven roads, canon:<path> for verified coordinates, flag:<id> for blocks.
- Writers tag (session/run/keeper); keeper (Agent 97 audit) evaporates + merges idempotently.
Every lane step deposits its proof trail; redo reads trails first (stigmergy, not meetings).

## 5. SCOUTING CAMPAIGNS — the measurement rhythm
- EDTECH (src/EDTECH-CAMPAIGN.md): exterior read-only targets, table-or-MISS per target.
- TRAIN67 (src/CAMPAIGNS/train67.md): 3-leg sweep (terrain ObiScout + code measure + soul hunt),
  6 done-gates, code-complete-not-live. MARKET (src/CAMPAIGNS/market-research.md + evidence):
  seats/comparables/slang/retention. SWEEPS: campaign-sweep-20261031 + VERIFY.
- During consolidation each lane gets a campaign pass first (measure), move second,
  verify pass third. No lane moves on an unmeasured claim.

## 6. EXECUTION ORDER (proposed, needs sovereign Go per lane)
1. Census (R1/W1/V1) + trail seeding. 2. Pointer repair (V2). 3. Copies quarantine.
4. Workers board (W2). 5. Repos merge plan (R1). 6. Server-stage handoff (runner + box + durable state).

## OWED (do not invent)
- PAT-gated reads (AUTH canon branch, 401 standing). Fresh kilo JWT. CF token for deploys.
- NLM box login + fgagent99 ID. Gmail harden → Git → CF → LinkedIn → Meta. Viettel 2nd number.
