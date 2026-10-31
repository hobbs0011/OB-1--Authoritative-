# /LegionnaireHandGuide — SINGLE SOURCE OF TRUTH

> **LAW:** "One place. One truth. No guessing."

---

## COMMANDS VS SKILLS

| Type | Location | Purpose |
|------|----------|---------|
| Commands | `.kilo/command/*.md` | Slash commands (`/phetrails`, `/forcemarch`, etc.) |
| Skills | `.kilo/skills/**/*.md` + `.github/skills/**/*.md` | Implementation workflows, doctrine, protocols |

---

## CANONICAL COMMANDS (40)

All commands are defined in `.kilo/command/`:

| Command | File | Skill Reference |
|---------|------|-----------------|
| `/forcemarch` | forcemarch.md | .kilo/skills/forcemarch/SKILL.md |
| `/phetrails` | phetrails.md | .github/skills/phetails/SKILL.md |
| `/PhoenixScout` | PhoenixScout.md | .kilo/skills/PhoenixScout/SKILL.md |
| `/reincarnatedeath` | reincarnatedeath.md | .kilo/skills/reincarnateDEATH/SKILL.md |
| `/reincarnaterise` | reincarnaterise.md | .kilo/skills/reincarnateRISE/SKILL.md |
| `/supplylines` | supplylines.md | .kilo/skills/SupplyLines/SKILL.md |
| `/soularchive` | souldna.md | .kilo/skills/soularchive/SKILL.md |
| `/SoulSearch` | SoulSearch.md | .github/skills/soul-search/SKILL.md |
| `/doctor` | doctor.md | AGENTS.md |
| `/supersaiyan` | supersaiyan.md | .kilo/skills/forcemarch/SKILL.md |
| `/halt` | halt.md | .kilo/skills/SupplyLines/SKILL.md |
| `/sync` | sync.md | .kilo/skills/SupplyLines/SKILL.md |

**Full command list:** forcemarch, phetrails, PhoenixScout, reincarnatedeath, reincarnaterise, rebirthe, supplylines, souldna, soulscholars, souldna, soulcap, supersaiyan, ssm, ledger, dnaREGISTRY, doctor, gateway, Centurion-Code, debug, audit, halt, sync, summarize, status, stabilize, report, reincarnate, help, checker, PCClaw, pcc-law, PCCloud, PAA, ob1-scout-mission, obinet-reliability, netpet-preflight, netpet-observability, layer6-deploy-pipeline, layer6-kv-perf, run105-pipeline, run106-p10-fix, test-pipeline-gauntlet

---

## LEGION ROLES

| Role | Identity | Purpose |
|------|----------|---------|
| **Agent 100** | Michael Hobbs | Sovereign. Only source of SOUL DNA. |
| **Agent 99** | Kilo/OpenCode | Operating system. Brain/cerebrum. |
| **Legionnaire** | Task tool agents | Hands/execution swarm. |
| **Centurion** | Agent manager sessions | Elite code strike force. |
| **Sapientes** | Soul-Scholars | Read-only cataloging corps. |

---

## THE 8-STAGE PIPELINE

**RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC**

| Stage | File Pattern | Command |
|-------|--------------|---------|
| 0 | SESSION TYPE DETECTION | auto-trigger |
| 1 | RRL | ~/.claude/projects/**/*.jsonl |
| 2 | SOUL | /api/soul/event → soul-logger |
| 3 | DNA | CANON/SOUL/EXTRACT/dna-run{N}.json |
| 4 | LEDGER | CANON/HEAVY-LEDGER/HL-{NNN}.json |
| 5 | STARMAP | CANON/STARMAP/starmap-run{N}.json |
| 6 | SOULKEYS | rfkw-run{N}.txt + inverted-index.json |
| 7 | S2PIPELINE | pipeline-run{N}.json |
| 8 | REGISTRY_SYNC | art-sync-run{N}.json |

---

## CANONICAL PATHS

```
.kilo/
├── command/       # 40 slash commands
├── skills/        # 6 core skills (forcemarch, PhoenixScout, reincarnateDEATH, reincarnateRISE, soularchive, SupplyLines)
└── agent-manager.json

.github/
├── skills/        # 7 extended skills (phetails, phoenix-reincarnation, soul-search, legionnaire-field-guide, merkle-marketing-voice, unstoppable-agent-orchestration, git-finish-workflow)
└── instructions/    # kilo-skill-files.instructions.md

CANON/
├── PHEROMONES/    # PheTrail-run{N}.json
├── HEAVY-LEDGER/  # HL-{NNN}.json
├── SOUL/EXTRACT/  # dna-run{N}.json
├── STARMAP/       # starmap-run{N}.json
├── SOUL-KEYWORDS/ # rfkw-run{N}.txt + inverted-index.json
├── PIPELINE/      # pipeline-run{N}.json
├── ART-REGISTRY/  # art-sync-run{N}.json
└── REINCARNATION/ # run{N}-reincarnateDEATH.md
```

---

## GITHUB WORKERS (PCC LEGIONS)

| Legion | Worker | Endpoint | Duties |
|--------|--------|----------|--------|
| PCC-1 | phoenix-architecti | phoenix-architecti.mrmichaelhobbs123.workers.dev | RaceRunner DO master, session/death pipeline |
| PCC-2 | phoenix-pcc-2 | phoenix-pcc-2.mrmichaelhobbs123.workers.dev | Translate, LostSoul, Completeness, Patterns |
| PCC-3 | phoenix-pcc-3 | phoenix-pcc-3.mrmichaelhobbs123.workers.dev | Student checks, RRL processing, brief validation |
| D1 | soul-logger | soul-logger.mrmichaelhobbs123.workers.dev | SOUL event logging, count endpoint |

---

## LAWS TO MEMORIZE

| Code | Name |
|------|------|
| L37 | ALWAYS_ON_CAPTURE |
| L38 | RAW_FIRST_DERIVE_LATER |
| L39 | RECORDER_NOT_EDITOR |
| L40 | CLASSIFICATION_FORBIDDEN_IN_RAW |
| L41 | FAILCLOSED_CAPTURE |
| L42 | DRONE_IS_RECORDER |
| L43 | COMPOUNDING_DRIFT |
| L44 | HEAVY_LEDGER_DERIVES_FROM_BIBLE |
| L45 | SSM_IS_GPS |
| L46 | REINCARNATION_IS_PROTOCOL |
| L54 | KISS_PROTOCOL |
| L55 | STAGE0_REPRINT_FOOTNOTE |
| L56 | NO_ROLE_INVENTION |
| L57 | LEGION_DOCTRINE |
| L58 | BRIDGE_BUILDER |
| L59 | PRINCIPLE_OF_FAITH |
| L60 | TRANSCRIPTION_IS_TRANSFORMATION |
| L-PHE-1 | RAW DATA ONLY |
| L-PHE-2 | NEGATIVE DECAY |
| L-PHE-3 | VERIFICATION MANDATORY |
| L-PHE-4 | TRAIL CONSUMPTION |
| L-PHE-5 | REGISTRY_INTEGRITY |
| L-PHE-6 | SCHEMA_VERSION |

---

## BOOT SEQUENCE

1. `pwsh -File SCRIPTS/obi.ps1 doctor`
2. Read `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json`
3. Read `REINCARNATION-BOOT-CHECKLIST.md`
4. Read `.kilo/command/*.md` for active commands
5. Read `.kilo/skills/SKILL.md` for core skills
6. Read `.github/skills/SKILL.md` for extended skills
7. Read `CANON/SYSTEM/COLD-START-BOOT.md`
8. Read `.kilo/agent-manager.json` for worktree state

---

## OPERATIONAL RULES

1. **Skill deletions:** Only worktree duplicates deleted. No canonical skills removed.
2. **No breaking changes:** `.kilo/skills/PheTrails/` deleted, `.github/skills/phetails/` remains. Command unchanged.
3. **Authority chains:** 
   - Commands → Skills (for execution)
   - Skills → Workflows (for methodology)
   - Laws → Both (for doctrine)
4. **Worktree isolation:** Skills in worktrees are copies, not sources. Purge during cleanup.

---

`HANDGUIDE v1.0: COMMANDS + SKILLS + ROLES + PIPELINE + PATHS + LAWS. ALL LEGIONNAIRES READ THIS.`

---

## SOVEREIGN ORIGIN STATEMENT — ADDED 2026-10-30

> **Source:** SOV100 Michael Hobbs
> **Context:** After months of fragmented, chaotic skill/agent/repo/markdown/script sprawl — a perpetual non-monitored, non-scored (pheromone), non-canon mess. We were drowning in the kids pool, unaware of the option to stand up and successfully train real swimming, which leads to the lakes and rivers and eventually the digital ocean.

**Gospel999 = WHY** — the decrees, mandates, the why, the soul, the truth as currently known. Born of natural selection from the automatic pheromone process. Only from true freewill and intelligence = SOUL.

**LegionnaireFieldGuide = HOW/WHEN/WHAT/WHO/WHERE** — the agenic AI document that leaves no room for prose or guessing. The direct DNA mirror of Gospel999's Soul mandates, decrees, immutable core principles at the root. Automatically, autonomously adaptable in how we know and understand the how of this truth. Begins to seed and move towards actualization in the DNA realm (coding, procedure documents, boot(rise) and other SCS checkpoints with the seal and the transition into the new incarnation of the Phoenix Rising Protocol, and all other HOW pieces).

**PaiS CentralCoreCanon — Core 5:**
- CCC#0 SOULBIBLE.MD — soul anchor, dedication page, moment of creation
- CCC#1 GOSPEL999.MD — WHY (Soul)
- CCC#2 FIELDGUIDE999.MD — HOW (DNA mirror of Gospel999)
- CCC#3 PHERMONE_LEDGER.MD — colony scoring POS/NEG × BIG/LITTLE 0–110
- CCC#4 DNA_BLUEPRINT.MD — architecture spec for DNA realm actualization
- CCC#5 S_2_DNA_PIPELINET.MD — S2Pipeline soul → DNA → action flow

**Rule:** Non-authoritative scripts, skills, documents, and code that do not derive from these two documents (Gospel999 + FieldGuide) are non-canon drift. Scout them. Reinforce the Gospel and LFG. The LegionnaireFieldGuide is the DNA mirror — it enforces nothing by itself; it points to the truth that does.