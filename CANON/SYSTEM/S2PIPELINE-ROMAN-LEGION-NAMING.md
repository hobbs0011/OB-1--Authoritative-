# S2PIPELINE — ROMAN LEGION 5-STAGE NAMING DOCTRINE
## Ratified: 2026-05-23 Run 396 | Operator: SOV100 Michael Hobbs | HEAD: 599d705

---

## THE 5 FORCES — Roman Military Doctrine → S2Pipeline Architecture

The Roman army on the march was an engineering marvel. "It moved like a moving city, where every block—from the vanguard scouts to the rear guard—had an exact, non-negotiable station to prevent chaos during a surprise attack." — Josephus

Our S2Pipeline operates identically. Each stage has a non-negotiable station. No stage may be skipped. The order is the architecture.

---

## STAGE I — EXPLORATORES (The Scouts)
**Latin:** *Exploratores* — tactical mounted scouts riding days ahead of the legion
**Mission:** Find. Map. Detect. Return with intel. Fight if necessary.
**Doctrine:** "The eyes and ears meant to ensure the army didn't march blindly into an ambush."

| Pipeline Stage | Function |
|---------------|----------|
| **RRL** | Raw Reconnaissance Ledger — inventory all files, detect all surface-level flags |
| **RRL-SOUL** | Soul Discovery — identify Michael verbatim text across all zones, flag unmined quotes |

**Speculatores Sub-Unit:** Deep-clandestine intelligence. Every legion had ~10 *speculatores* attached to the general's staff. Operated undercover, captured HVTs, ran courier networks. In our pipeline: the targeted deep-audit sweeps (DeepSeek alias verification, fabrication detection, phantom stamp hunting).

**Rule:** Never march the main body until the *exploratores* have returned with terrain maps. Never process a pipeline stage until the scout zone is swept.

---

## STAGE II — ANTECORES (The Vanguard)
**Latin:** *Antecores* / *Prima Acies* — the vanguard core, elite cohorts clearing the path
**Mission:** Clear. Validate. Buffer. Deploy into battle line on contact.
**Doctrine:** "Their main job was to secure the route opened by the scouts, handle immediate skirmishes, and immediately deploy into a battle line if the scouts reported an ambush. They acted as a heavy buffer."

| Pipeline Stage | Function |
|---------------|----------|
| **DNA** | Fingerprint every asset — hash, timestamp, source. Verify identity. |
| **LEDGER** | Record into Heavy Ledger DO. Every transaction. Every soul event. Immutable entry. |

**Auxilia Sub-Unit:** Specialized non-citizen forces — archers, slingers, cavalry. Provided capabilities the heavy legions lacked. In our pipeline: `soul-capture-direct.js`, `hl-extract.js`, `phoenix-scout.ps1` — specialized tools that handle edge cases the main pipeline stages can't.

**Rule:** The *antecores* absorb first contact so the *agmen* can form up. DNA and LEDGER validate the raw intel before heavy processing begins. A bad fingerprint here poisons everything downstream.

---

## STAGE III — AGMEN (The Main Body)
**Latin:** *Agmen* — the main column, the heavy punch, the heart of the war machine
**Mission:** Process. Transform. Build. Deliver the architecture.
**Doctrine:** "The heart of the Roman war machine—the main blocks of heavy infantry legionaries, followed immediately by the army's massive mule train carrying heavy siege equipment, tents, and tools."

| Pipeline Stage | Function |
|---------------|----------|
| **SSM** | Soul State Machine — track word progression, level transitions, stagnation detection |
| **SOULKEYWORDS** | Extract keywords, themes, patterns from soul corpus |
| **PHEROMONE** | Broadcast signals — trigger downstream systems, notify dependent services |

**Mensores Sub-Unit:** Military engineers and surveyors riding ahead of the infantry to architect the night camp. By the time the heavy infantry arrived, the blueprint was staked. In our pipeline: schema designers, D1 table architects, KV namespace planners — the infrastructure that must be laid before heavy data moves.

**Agmen Quadratum Formation:** In hostile territory, the Romans formed a hollow square with the baggage train in the center, surrounded on all four sides by legionaries. In our pipeline: when processing unverified soul data, SSM wraps around the entire payload, validating every edge before it moves to SOULKEYWORDS.

**Rule:** The *agmen* delivers the heavy punch. No data exits this stage without SSM validation. The baggage train (D1 storage, KV state) is always sandwiched between processing layers.

---

## STAGE IV — AGMEN NOVISSIMUM (The Rear Guard)
**Latin:** *Agmen Novissimum* — "the newest/last part of the army"
**Mission:** Secure. Verify. Seal. Prevent tail-gate ambush.
**Doctrine:** "Engineered entirely for endurance, security, and holding the line under pressure. Not a dumping ground for tired soldiers — a highly strategic, heavily armed tactical block."

| Pipeline Stage | Function |
|---------------|----------|
| **6-AI TRUTH** | Multi-model verification — cross-validate output across 6 AI models. No single-model trust. |
| **SHADOW REALM** | Cold backup — mirror all state to secondary storage. Air-gapped fallback. |

**Three Critical Missions:**
1. **Prevent Tail-Gate Ambush:** If an error bypasses Stages I-III, the *agmen novissimum* absorbs it. The 6-AI TRUTH catches hallucinations, fabrications, and drift before they enter permanent storage.
2. **Manage Stragglers (*Calones*):** Track orphaned data, partial writes, failed transactions. SHADOW REALM ensures nothing is left behind.
3. **Tactical Denial:** In retreat (rollback), this stage burns bridges behind the withdrawal — ensures no corrupted state propagates backward.

**Rule:** The *agmen novissimum* locks the door. No artifact enters the permanent record without 6-AI TRUTH verification. No state exists without a SHADOW REALM mirror.

---

## STAGE V — PRAESIDIA (The Garrison)
**Latin:** *Praesidia* — permanent occupation forces, the anchor of Romanization
**Mission:** Anchor. Maintain. Grow. Convert conquered territory into permanent province.
**Doctrine:** "Rome's true power wasn't just winning battles; it was the ability to permanently anchor themselves into a conquered landscape."

| Pipeline Stage | Function |
|---------------|----------|
| **MERKLE LATTICE** | Cryptographic proof chain — every state transition verifiable, every mutation traceable |
| **DO-SQLITE** | Durable Object SQLite — permanent, queryable storage. The *castra hiberna* (stone fort). |
| **APEX ROLLUP** | Consolidation — aggregate all pipeline output into unified canonical state. The *Principia* (headquarters). |

**Three Steps of Romanization:**
1. **Castra Hiberna (Permanent Forts):** Replace temporary tents with stone. DO-SQLITE replaces ephemeral KV state with permanent, queryable Durable Object storage.
2. **Infrastructure Enforcement:** Roads, bridges, aqueducts. MERKLE LATTICE builds the cryptographic highways between pipeline stages. Every byte traceable to source.
3. **Administrative Control:** Census, tax, courts. APEX ROLLUP consolidates all pipeline output into the single canonical state — the authoritative record.

**Vici (Civilization Spillover):** Just as Londinium, Eboracum, and Colonia grew from civilian settlements outside Roman forts, the PRAESIDIA stage enables downstream applications and dashboards to grow around the permanent canonical state. The pipeline doesn't just process data — it builds the infrastructure that others build upon.

**Rule:** Nothing is conquered until it's garrisoned. No pipeline run is complete until APEX ROLLUP consolidates into the permanent canonical record.

---

## FULL MARCHING ORDER

```
                    ROMAN LEGION                    →    S2PIPELINE
                    ════════════                        ═══════════

   I. EXPLORATORES (Scouts)                       I. EXPLORATORES
      ├─ Exploratores (tactical scouts)              ├─ RRL (Raw Recon Ledger)
      └─ Speculatores (clandestine spies)            └─ RRL-SOUL (Soul Discovery)

  II. ANTECORES (Vanguard)                       II. ANTECORES
      ├─ Prima Acies (elite vanguard)                ├─ DNA (Fingerprinting)
      └─ Auxilia (specialized support)               └─ LEDGER (Immutable Recording)

 III. AGMEN (Main Body)                         III. AGMEN
      ├─ Mensores (engineers/surveyors)              ├─ SSM (Soul State Machine)
      ├─ Command Element (Legatus + Guard)            ├─ SOULKEYWORDS (Extraction)
      └─ Heavy Infantry + Baggage Train              └─ PHEROMONE (Broadcast)

  IV. AGMEN NOVISSIMUM (Rear Guard)             IV. AGMEN NOVISSIMUM
      ├─ Veteran Infantry + Cavalry                  ├─ 6-AI TRUTH (Multi-Model Verify)
      └─ Straggler Management                        └─ SHADOW REALM (Cold Backup)

   V. PRAESIDIA (Garrison)                       V. PRAESIDIA
      ├─ Castra Hiberna (permanent forts)            ├─ MERKLE LATTICE (Proof Chain)
      ├─ Infrastructure (roads/bridges)              ├─ DO-SQLITE (Permanent Storage)
      └─ Administration (census/courts)              └─ APEX ROLLUP (Canonical Consolidation)
```

---

## IRON RULES

1. **No stage may be skipped.** The *exploratores* ride before the *antecores* march. RRL runs before DNA. Always.
2. **The order IS the architecture.** Just as a Roman column's stations were "non-negotiable to prevent chaos during a surprise attack," the S2Pipeline stage order prevents data chaos during unexpected input.
3. **Every stage has a defensive posture.** At any point, any stage must be able to pivot into battle formation (*Agmen Quadratum*) — containing bad data within its walls while signaling upstream.
4. **Garrison before moving on.** No territory is conquered until PRAESIDIA anchors it. No pipeline run is sealed until APEX ROLLUP consolidates.
5. **The *speculatores* rule:** Targeted deep audits are authorized to bypass normal marching order. Phantom stamp hunting, alias verification, fabrication detection — these are *speculatores* missions that operate independently of the column.

---

## TIER ALIGNMENT

| Tier | Model | Roman Force | Pipeline Stage |
|------|-------|-------------|----------------|
| **T1** | `stepfun/step-3.5-flash` | *Exploratores* — fast, lightweight, high-volume scouting | RRL, RRL-SOUL |
| **T2** | `deepseek-v4-flash` | *Antecores* — workhorse, clearing, validating | DNA, LEDGER |
| **T3** | `deepseek-v4-pro` | *Agmen* — heavy analysis, surgical precision | SSM, SOULKEYWORDS, PHEROMONE |
| **T4** | `gemini-3.5-flash` | *Agmen Novissimum* — verification, backup, defense | 6-AI TRUTH, SHADOW REALM |
| **T5** | `claude-opus-4-20250514` | *Praesidia* — final rulings, consolidation, anchoring | MERKLE LATTICE, DO-SQLITE, APEX ROLLUP |

---

## STAGE VI — LIMITANEI / COMITATENSES / VETERANI (The Frontier Shield)
**Latin:** *Limitanei* (Border Guard) · *Comitatenses* (Mobile Reserve) · *Veterani* (Veteran Colonies)
**Mission:** Hold. Respond. Settle. Become the new baseline.
**Doctrine:** "The final stage didn't focus on conquering new lands; it was designed to protect the entire Roman world from collapsing."

### The Late-Empire Dual Defense System

In the later stages of the empire, the old legion system was completely overhauled to deal with massive, simultaneous barbarian invasions across thousands of miles of border. The military was permanently split into two distinct forces:

| Force | Latin | Purpose |
|-------|-------|---------|
| **Border Guard** | *Limitanei* | Stationary frontier soldiers living permanently along the *Limes* (rivers and walls). Tripwire defense — handle minor raids, slow down massive invasions while farming the local land. |
| **Central Elite Reserve** | *Comitatenses* | High-speed, heavy mobile strike force stationed deep inside the empire. They didn't guard borders; they waited at central hubs until a major threat broke through, then rushed to the breach to eliminate it. |

### The Veteran Colonies (*Veterani*)

When Roman soldiers completed their 20–25 years of service, they received an honorable discharge (*missio honesta*). Instead of money, Rome handed them plots of land on the absolute edges of the newly conquered frontiers.

- **Human Shields:** By settling thousands of loyal, battle-hardened veterans on the border, Rome created a permanent civilian militia. If an enemy invaded, these retired soldiers picked up their old swords to protect their own families and farms.
- **Cultural Anchors:** These veterans married local women, raised Roman children, and spoke Latin, permanently solidifying the culture of the empire into the soil.

### Pipeline Mapping

| Force | Pipeline Function | Existing System |
|-------|-------------------|-----------------|
| **Limitanei** (Border Guard) | Automated health monitoring, tripwire alerting, stagnation detection, scheduled integrity sweeps | `obi.ps1 doctor` · `obi.ps1 verify` · `obi.ps1 soul-check` · Phoenix Scout scheduled sweeps |
| **Comitatenses** (Mobile Reserve) | Rapid deployment, rollback capability, CI/CD pipeline, emergency hotfix path | `wrangler deploy` · GitHub Actions · `git revert` rollback chain · `npx wrangler deploy --dry-run` pre-flight |
| **Veterani** (Veteran Colonies) | Permanent archival, knowledge crystallization, codebase as self-sustaining entity, reincarnation boot chain | `REINCARNATION-LOG.md` · `COLD-START-BOOT.md` · git history · Heavy Ledger · Death/RISE seals |

### The Three Missions of Stage VI

1. **Border Defense (*Limitanei*):** The health checks run continuously. `obi.ps1 doctor` and `soul-check` are the tripwires. If SOULCOUNT stagnates, if HEAD drifts, if a wrangler deploy fails — the *limitanei* detect it before it becomes a crisis. They slow the breach until the *comitatenses* arrive.

2. **Crisis Response (*Comitatenses*):** When a P0 bug (like the iOS Safari backdrop-filter crash, Run 390) or a security incident (credential rotation) hits, the *comitatenses* deploy. The CI/CD pipeline is the mobile strike force — it doesn't guard borders, it waits at the hub (GitHub Actions) and rushes to the breach when triggered.

3. **Permanent Settlement (*Veterani*):** Every death seal, every reincarnation log entry, every Heavy Ledger commit — these are the veteran colonies. The codebase itself becomes the *colonia*: self-documenting, self-repairing, self-aware. Future runs don't start from scratch; they inherit the land settled by prior runs. The REINCARNATION boot chain is the *missio honesta* — the honorable discharge that converts active runs into permanent infrastructure.

### The Veteran's Oath

> A *veteranus* does not leave the empire undefended. He receives his land on the frontier and becomes its permanent shield. His children speak Latin on soil he conquered. His sword hangs above the hearth — not for decoration, but for the day the *limitanei* signal a breach. On that day, he takes it down and becomes a soldier again.
>
> — Run 396 Doctrine, adapted from Roman military law

---

## THE COMPLETE 6-STAGE ROMAN LIFECYCLE

```
    I. EXPLORATORES       →  FIND the target
   II. ANTECORES          →  CLEAR the road
  III. AGMEN              →  CRUSH the enemy
   IV. AGMEN NOVISSIMUM   →  SECURE the rear
    V. PRAESIDIA          →  BUILD the forts and roads
   VI. LIMITANEI/VETERANI →  SETTLE the land, hold the border

                    ↑                           ↓
                    └——— BECOME THE NEW BASELINE ———┘
```

The machine loops. What was conquered becomes the new frontier. What was built becomes the new infrastructure. What was settled becomes the new baseline. The next campaign launches from stronger ground.

---

*"Looked at from start to finish, the entire Roman machine functioned in a perfect loop." — SOV100 Michael Hobbs, Run 396*

**FINGERPRINT:** `599d705` → `303bb8a` | **SOULCOUNT:** 113,393 ANCHOR | **Doctrine Status:** RATIFIED — 6-STAGE CANON
