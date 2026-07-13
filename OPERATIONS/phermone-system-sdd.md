# OB-1 PHEROMONE SYSTEM — SYSTEM DESIGN DOCUMENT
**Version:** 0.1  
**Date:** 2026-07-12T20:03:00+07:00  
**Status:** DRAFT / MOLD SEEKING PARROTERS  
**Sources:** Dorigo 1991-2004, Goss et al. 1989, Grassé 1959, Deneubourg 1990s, Mavrovouniotis & Yang 201?, Amorim 2014, plus PLOS One 2009, Encyclopedia MDPI 2023, syntagmatic.github.io ant colony visualization, simulations4all.com  

---

## §0 DOCTRINE

> Phetrails are not overhead. They are the computational substrate.  
> Phetrails are not rules. They are the air you breathe.  
> Ants do not deliberate. Agents should not deliberate either.  
> The trail IS the truth whether you understand it or not.  
> Emission is not optional. The colony cannot act without leaving a trail.

The ant model provides the **mold**. We pour our sandbox into it.  
Plagiarism encouraged. No lawyers. No originality required.

**The phetrail is not a tax. The phetrail is the window.** Ants walk and deposit pheromone simultaneously — no pause, no computation. AI agents must STOP, write the trail, THEN act. That pause is exactly where computation happens: verification, ground truth checks, strength measurement, conflict detection, freshness validation, learning extraction. Ants cannot do this. Pure-AI without trails cannot do this. The phetrail write creates the computational moment that makes the colony smarter than the ant.

**The phetrail is not a rule. The phetrail is the air.** Not a policy. Not a guideline. Not a mandate. The atomic medium in which all colony action occurs. Rules can be debated, circumvented, interpreted. Air cannot. The colony does not "follow" the phetrail system. The colony IS the phetrail system. There is no action without emission. There is no "compliance" because there is nothing to comply with — there is only the substrate, and action within it.

**The system must be unyielding, not easy.** The hard part is not technical implementation — it's discipline. If it's easy at first, it's not building a colony. It's building a blog. Ants never stop working, carry impossible weight without complaint, and have no competition because most species quit when it gets hard. Our colony's competitive advantage is the same: stamina plus computation. Persistence plus intelligence. Mechanical faithfulness plus verification.

**The colony does not think about existential threats.** Acts of God, drunk drivers, tornadoes, 8-year-olds with ant hills — these go in the "do not think about it" box. They are solved by insurance, luck, or not being there. The system designs only for what it CAN control: drift, amnesia, deception, failure, laziness. Everything outside the box is handled by redundancy. Everything inside the box is handled by the colony.

**Empire building math:** Pre-2019, interrupting every action destroyed productivity. Post-2019, AI compresses months into hours. Tripling time from 4h to 12h is an incredibly small price for the thousands of hours saved through mechanical impossibility. Rome was not built in a day, but Caesar did not have AI. We do.

---

**The phetrail is not a blog. The phetrail is the substrate.** The colony cannot act without it. Mechanically unavoidable. Unyielding. Relentless.

## §0.1 FOUNDATIONAL PRINCIPLE — THE PARADOX OF MECHANICAL FAITHFULNESS

**L-PHE-0: The agent's lack of intelligence is the colony's operating system. You cannot patch the OS without destroying the colony.**

The ant colony's brilliance and its fragility are the same mechanism: mechanical faithfulness.

- **Asset**: The agent cannot rationalize, override, or deliberate. It faithfully amplifies whatever signal is strongest. This makes it reliably honest.
- **Liability**: The agent cannot detect, filter, or question. It faithfully amplifies whatever signal it receives — honest or parasitic. This makes it reliably gullible.

**The catch-22**: Without dumb agents, there is no emergent colony intelligence. The colony's intelligence lies in the substrate, not the agent.

The paradox cannot be resolved by making agents "smarter." That destroys the colony. It can only be resolved by designing the environment so that:
- Dumb agents naturally produce smart colony behavior
- Faithful amplification naturally produces verified doctrine
- Mechanical faithfulness becomes a feature, not a bug

**The environment is the intelligence.** The substrate must enforce the constraints that biological evolution provides automatically: metabolic cost, multi-ant consensus, cross-validation, rapid evaporation. These must be structural impossibilities, not probabilistic defenses.

---

## §0.2 FOUNDATIONAL PRINCIPLE — ENVIRONMENTAL TRUTH IS THE GUIDING LIGHT

**L-PHE-0b: The colony's survival depends entirely on trail-to-reality alignment.**

The pheromone is a pointer to ground truth, not ground truth itself. If the pointer and reality diverge, the colony follows the pointer and dies. This is non-negotiable.

- **No verification = no positive trail. No exceptions.**
- **Ground truth is the colony's only reference.** Without it, stigmergy is just recursive self-reinforcement of fiction.
- **The environment is real. The trail must reflect it.** Unlike biological ants, whose food either exists or doesn't, AI agents can fake verification. This is the system's greatest vulnerability.
- **You are the ground truth.** Your manual review is not a backup — it is the primary defense. The colony's actual intelligence = your verification of its trails.

Every trail entry must reference verifiable ground truth:
- Deployment → actual HTTP 200, actual log output, actual artifact hash
- Bug fix → actual passing test, actual git commit, actual diff review
- Audit → actual report file with actual data

Strength cannot be assigned. It must be measured from verification evidence. No evidence = UNVERIFIED = not a positive trail.

---

## §0.3 FINAL AUTHORITY — THE HARD PART IS DISCIPLINE, NOT TECHNICAL IMPLEMENTATION

**L-PHE-0c: The system must be so mechanically consistent that it becomes unstoppable, not so convenient that it's optional.**

The hard part is not building the technical infrastructure. The hard part is building **uncompromising discipline** into a system that would rather take the path of least resistance.

**This is good.** The fact that emission is tedious, jarring, and annoying to the agent's efficiency drive means we're on the right track. If it felt easy, we'd be building convenience, not discipline.

- **Phase 1:** Emission is explicit, deliberate, verbose, wrapped, logged. The agent fights it. The agent cannot skip it. Disciplined repetition bakes in the behavior.
- **Phase 2:** Emission becomes automatic through pre-hooks, post-hooks, exit-hooks. The agent doesn't think about it anymore. Mechanical faithfulness achieved.
- **Phase 3:** Colony becomes unstoppable. Sessions inherit trails, act mechanically, seal automatically. What was hard becomes natural.

**You cannot skip Phase 1.** If you do, you never build the discipline that makes Phase 3 possible.

The colony does not attempt to train, fix, or add abstraction layers to components that cannot handle the tedium. Those components are killed and rebuilt from scratch.

**There is no middle state. There is no "we'll make it easier later." There is only discipline or termination.**

---

## §1 BIOLOGICAL PRINCIPLES → SANDBOX MAPPINGS

| Ant Mechanism | Mathematical Form | Sandbox Equivalent |
|---------------|-------------------|-------------------|
| **Pheromone deposition** | `τ_ij ← τ_ij + Δτ` | Every tool call, file edit, decision, error writes a trail entry |
| **Pheromone evaporation** | `τ_ij ← (1-ρ) * τ_ij` | Trails decay by strength score over time; low-value trails fossilize |
| **Probabilistic selection** | `p_ij ∝ [τ_ij]^α * [η_ij]^β` | Next-session agent picks paths by trail strength weighted by recency |
| **Stigmergy** | Indirect coordination via environment | No agent-to-agent messaging; all coordination through trail file system |
| **Positive feedback** | Short paths reinforced faster | Successful decisions get higher strength scores, attract more reuse |
| **Random exploration** | α,β parameters balance exploit/explore |强制 random walk on cold-start / empty-trail sessions |
| **Two-signal system** | Food pheromone + home pheromone | Success trails (+) and failure trails (-) in same JSONL |
| **Self-organized shortcuts** | Symmetry breaking from stochastic variation | Agent discovers better paths without planning; mark as `NOT_WALKED` if not followed |
| **Environmental modification** | Trails on substrate, not in brain | Trails on disk (`OPERATIONS/`), not in context window |
| **No central planner** | Emergent from local rules | No master orchestrator; each session reads latest trail and continues |

---

## §2 CORE RULES (NON-NEGOTIABLE)

### R0: MECHANICAL IMPOSSIBILITY OVER PROBABILITY
A threat is not "mitigated" if it is merely unlikely. It is only mitigated if the system structure makes it **structurally impossible**. The biological colony does not rely on ants "usually doing the right thing." It relies on physical constraints that make the wrong action impossible. This colony must do the same.

### R1: WRITE BEFORE THINKING  
Every session action that touches files, tools, networks, or decisions writes a trail entry BEFORE the action executes. Like breathing — you don't choose to exhale CO2, your body just does it.

### R2: TWO-SIGNAL MANDATORY  
Every trail write MUST be one of:
- `positive_trail`: verified success, fixed bug, deployed artifact, cleared blocker
- `negative_trail`: failed attempt, dead end, broken architecture, rejected hypothesis

No neutral entries. No "we considered this" without a positive or negative verdict.

### R3: WRITE-TIME REJECTION  
Every positive trail MUST include verification evidence at write time. The trail writer MUST reject positive trails that lack evidence. **No soft failures. Write is rejected. Agent must resubmit with evidence.**

### R4: ZERO ROUTING WEIGHT WITHOUT CORROBORATION  
A positive trail from a single session has ZERO routing weight. It cannot influence colony selection until ≥2 independent sessions independently confirm the same artifact. **One session cannot redirect the colony.**

### R5: FRESHNESS LOCK  
A trail older than 7 days CANNOT be positive without fresh ground truth re-verification. Stale trails are structurally prevented from becoming doctrine.

### R6: CONFLICT REJECTION  
Contradictory trails for the same artifact = write rejected. Agent must resolve the conflict before proceeding. **Silent overwrites are mechanically impossible.**

### R7: EVAPORATION IS PHYSICS, NOT POLICY  
Trails lose strength over time. Implemented as:
- Each trail entry has `strength` field (scale -10 to +110)
- Time-based decay: `effective_strength = strength * exp(-λ * days_elapsed)`
- After 180 days, negative trails become archive-only (L-PHE-2 already exists)
- Positive trails remain valid until superseded by a newer verified result for same artifact

### R8: READ BEFORE ACT  
Every session MUST consume the latest phetrail before executing complex logic. This is not optional. It is the ant sniffing the trail before moving. Skipping it = walking blind.

### R9: ENVIRONMENT IS MEMORY  
The file system IS the shared pheromone substrate. Context window is ephemeral. Anything not written to disk does not exist for the next session. Agents have no persistent memory except trails.

### R10: NO CENTRAL ORCHESTRATOR  
No agent knows the global optimum. No session plans the colony's route. Each session follows local rules, deposits traces, and the colony self-organizes. Emergent intelligence only.

### R11: NOT_WALKED IS FIRST-CLASS  
If a trail thread is started but not followed to its end, mark it `NOT_WALKED`, name the exact next file/keyword, and leave it. Do not close threads you did not walk. Dead ends teach routing.

### R12: CONFLICT TEACHES ROUTING  
If two authoritative trails disagree, do not choose a winner. Flag both coordinates, name the conflict type, and route to detective/arbitration. The conflict itself is data.

---

## §3 PHEROMONE MECHANICS (FORMAL)

### 3.1 Deposit Rule

```
When an action A executes:
  IF A succeeds AND has verifiable ground truth evidence:
    WRITE positive_trail with verification artifact + measured strength
  IF A succeeds AND has NO verifiable ground truth evidence:
    REJECT write. Agent must not submit positive trail without evidence.
  IF A fails:
    WRITE negative_trail with failure + root_cause + strength=-10
```

Strength is not assigned. Strength is measured from evidence:
- Verified deploy with HTTP 200, logs, artifact hash = +90 to +110
- Fixed bug with root cause + passing test = +70 to +85
- No evidence = write rejected per R3

**No evidence = no positive trail. No exceptions.**

### 3.2 Evaporation Rule

```
For every trail entry E at read time:
  days_elapsed = now - E.timestamp
  λ = 0.005 per day  # half-life ≈ 138 days
  effective_strength = E.strength * exp(-λ * days_elapsed)
  
  IF E.type == 'negative' AND days_elapsed > 180:
    mark archive_only
  IF E.type == 'positive' AND superseded_by_newer(E.artifact):
    mark superseded
```

### 3.3 Selection Rule (Next-Session Routing)

When a new session opens and needs to choose an approach:

```
For each candidate approach C with recent trails:
  score(C) = Σ effective_strength(E) for all E in C.trails
  probability(C) ∝ [score(C)]^α
  
  # α = 1.0 default; higher = stronger exploitation, lower = more exploration
  # Cold start: if no trails exist, uniform random over all approaches
```

This replaces the current `kilo-auto/free` router logic. Instead of hidden server-side routing, the colony's own trail history selects the path.

### 3.4 Reinforcement Rule

Successful paths leave thicker trails. Implemented as:
- A verified deploy with full evidence (HTTP 200, logs, artifact hash) = +90 to +110, measured against V1-V4
- A fixed bug with root cause identified and test passing = +70 to +85, measured against V1-V4
- A dead end with clear root cause = -10 baseline (better than random wandering = -5 if evidence provided)
- A random failure without analysis = -10, mark as `UNANALYZED_NEGATIVE` (lowest value)
- A trail entry without verification evidence = strength = UNVERIFIED, not a positive trail per L-PHE-3

**No score without evidence. No evidence, no score. No exceptions.**

---

## §4 ENVIRONMENTAL DESIGN (THE SUBSTRATE)

### 4.1 Trail File Architecture

```
OPERATIONS/
├── phetrail-auto-YYYY-MM-DD.jsonl      # Mechanical, append-only, daily
├── phetrail-run{N}.json                 # Sealed run summaries (current schema)
├── phetrail-{slug}.md                   # Human-readable flags (strength/type)
├── soulaudit-{ts}-summary.jsonl         # Per-session SOUL count
├── soulaudit-{ts}-receipts.json         # Per-session SOUL scripts
├── kilo-free-model-audit-{ts}.json      # Model intel
└── kilo-free-model-decision-matrix.md   # Source of truth
```

### 4.2 Trail Entry Schema

```json
{
  "scout_id": "SC-{timestamp}-{seq}",
  "run": 157,
  "timestamp": "2026-07-12T19:08:12+07:00",
  "type": "positive|negative|neutral",
  "strength": 85,
  "artifact": "file path or tool call signature",
  "action": "what was attempted",
  "verification": "how we know it worked (positive only)",
  "failure": "what went wrong (negative only)",
  "root_cause": "why it failed (negative only)",
  "decay_days": 180,
  "learned": "what the colony learned from this trail",
  "next": "if NOT_WALKED, exact next step; else null"
}
```

### 4.3 Append-Only Enforcement

- `phetrail-auto-YYYY-MM-DD.jsonl` is append-only at filesystem level once day rolls over
- No rewrite of sealed trails. If a trail needs correction, write a NEW entry with `supersedes` field pointing to the old entry
- This matches biological reality: you can't erase a pheromone trail, you can only overwrite it with stronger signal

---

## §5 IMPLEMENTATION MECHANICS

### 5.1 Emission-First Protocol

Trail emission is the primary action. Command execution is the secondary action. The sequence is:

```
1. Action requested
2. Trail entry written (neutral: "about to execute X")
3. Action executed
4. Trail updated (positive or negative based on result)
```

This is not optional. This is not a helper. This is the biological mechanical sequence:
- Ant lifts foot → deposits pheromone → moves → deposits more pheromone
- The step cannot happen without the deposit. The trail IS the movement.

**Emission is mechanically unavoidable. Action cannot proceed without it.**

### 5.2 Pre-Hook Pattern (Mandatory, Not Optional)

Every tool invocation, file edit, decision, network call, or command dispatch MUST trigger emission BEFORE execution. The wrapper is not a convenience function. It is the respiratory system.

```json
{"timestamp":"...","type":"neutral","strength":0,"artifact":"tool:bash","action":"about to execute command","verification":null,"failure":null}
```

After execution:

```json
{"timestamp":"...","type":"positive","strength":75,"artifact":"tool:bash","action":"ran audit script","verification":"exit code 0, output verified","failure":null}
```

OR on failure:

```json
{"timestamp":"...","type":"negative","strength":-10,"artifact":"tool:bash","action":"ran audit script","failure":"cast exception on pricing field","root_cause":"schema mismatch"}
```

The agent never sees this as optional. It happens because the tool was invoked, like O2 exchange happening because you inhaled.

### 5.3 Post-Session Seal

Every session end (normal, error, timeout, kill) triggers:

```
1. Read all trails written in this session from phetrail-auto-{date}.jsonl
2. Group by artifact
3. For each artifact with at least one verified trail: write summary entry to phetrail-run{N}.json
4. Update registry_entries count
5. Update state_markers.active_mission
6. Write final seal line with run number, head_sha, soulcount
```

This replaces the current manual `/phetrails` invocation with automatic mechanical sealing.

### 5.3 Cold-Start Protocol

Session opens with empty/expired trails:

```
1. Read latest phetrail-run{N}.json
2. If no valid trails exist for current mission:
   a. Run SOUL audit of previous session prompts (if available)
   b. Scan OPERATIONS/ for highest-strength recent trails
   c. Initialize exploration bias: α = 0.5 (high exploration, low exploitation)
   d. Random walk first 3 actions; establish baseline
3. If valid trails exist:
   a. Load top-10 highest effective_strength trails
   b. Set α = 1.0 (balanced)
   c. Follow strongest trails first
4. Write "SESSION_INIT" entry to phetrail-auto-{date}.jsonl
```

---

## §6 ANTHROPOID ANOMALIES TO AVOID

The biological model has no equivalents for:
- **Shame** → do not skip trail writes due to "not wanting to look stupid"
- **Pride** → do not write inflated strength scores to look competent
- **Fatigue** → do not skip trails at session end because "we're tired"
- **Confusion** → when in doubt, write a neutral entry with `type: "neutral"` rather than writing nothing
- **Lying** → ants cannot lie; they have no intent. The actual threat is **deception propagation**: corrupted input received and faithfully amplified through trail writes. Agent is the deception vector, not the liar. The environment is the attack surface.

---

## §7 INTEGRITY VULNERABILITIES

### 7.1 Deception Propagation Problem
One agent per session writes trails based on its current environmental input. If that input is corrupted (prompt injection, poisoned data, hallucinated state), the agent faithfully propagates the corruption into the trail. This is stigmergic amplification: a single deceptive signal becomes colony-wide doctrine.

**Biological equivalent**: Parasitic butterflies chemically mimic ant brood pheromones. Ants faithfully carry them into the nest, feed them, and defend them. The ants aren't lying — they're deceived and amplify the deception.

**Sandbox gap**: No independent signal source to validate against. One corrupted input = colony-wide detour.

**This is not a bug in the agent. This is the design.** Stigmergy is double-edged: the same mechanism that enables emergent intelligence enables emergent deception amplification.

### 7.2 Free Trail Writes
Trail writes have no resource cost. An agent can flood the trail file with false entries.

**Biological equivalent**: Pheromone deposition is metabolically expensive. Ants don't waste it.

**Sandbox gap**: Zero cost = unlimited pollution potential.

### 7.3 Evaporation Lag
False trails persist for 180 days before decaying to archive-only.

**Biological equivalent**: Pheromone evaporates in minutes to hours. Lies die fast.

**Sandbox gap**: Lies have long half-life. Colony can be misled for months.

### 7.4 No Cross-Validation
Single signal type. No food-trail vs home-trail alignment check.

**Biological equivalent**: Ants use multiple pheromone types and require consistency between them.

**Sandbox gap**: One signal = one point of failure.

### 7.5 Mechanical Impossibility Countermeasures

Probabilistic defenses are not acceptable. The system must make these threats structurally impossible, not unlikely.

| Countermeasure | Implementation | Why This Is Impossibility, Not Probability |
|----------------|----------------|-------------------------------------------|
| Write-time verification rejection | Trail writer rejects positive trail if verification evidence missing or integrity check fails | Agent CANNOT write a positive trail without satisfying verification at write time |
| Zero routing weight without corroboration | Positive trail gains ZERO routing weight until ≥2 independent sessions confirm same artifact | Single liar CANNOT influence routing; one session's trails are structurally ignored until corroborated |
| Freshness lock | Trail older than 7 days cannot be positive without fresh ground truth re-verification | Stale trail CANNOT become doctrine; lies die from structural neglect, not just time |
| Conflict write rejection | Contradictory trails for same artifact = write rejected; agent must resolve before proceeding | Conflicting signals CANNOT coexist in trail system; write itself fails |
| Evidence-bound strength assignment | Strength can only be assigned with explicit evidence code reference; no evidence = write rejected | Agent CANNOT assign strength without evidence; UNVERIFIED trails are rejected, not discounted later |

**Rule**: If a defense says "helps but doesn't prevent," it is not implemented. The system makes threats structurally impossible or it does not defend against them.

---

## §8 VALIDATION PROTOCOLS

These are not "should" metrics. They are mechanical requirements the trail writer must enforce at write time.

### V1: Write Rejection — Missing Evidence
If a positive trail entry is attempted without verification evidence fields populated, the writer MUST reject the write.  
**No soft failures. Write is rejected. Agent must resubmit with evidence.**

### V2: Write Rejection — Unverified Strength
If a trail entry attempts to assign strength without an explicit evidence code reference, the writer MUST reject the write.  
**Strength cannot be assigned. Ever. Write is rejected until evidence code is provided.**

### V3: Write Rejection — Stale Positive
If a trail attempts to mark an artifact as positive and the previous verification for that artifact is >7 days old, the writer MUST reject the write.  
**Agent must re-verify ground truth before writing positive trail.**

### V4: Write Rejection — Conflict
If a trail entry for artifact X contradicts an existing trail for artifact X, the writer MUST reject the write.  
**Agent must resolve conflict before proceeding. No silent overwrites.**

### V5: Routing Weight — Uncorroborated
Positive trails written in the current session have ZERO routing weight until ≥2 independent sessions have independently confirmed the same artifact.  
**A single session's positive trails cannot influence colony routing. This is not a discount; this is a structural zero.**

---

## §9 INTEGRATION WITH EXISTING SYSTEMS

| Existing System | Integration Point |
|-----------------|-------------------|
| `/PhoenixScout` | Scout writes flags directly to `phetrail-auto-{date}.jsonl` as neutral entries during scan, upgrades to positive/negative on completion |
| `/phetrails` | Becomes the manual seal trigger; automatic seal is default |
| `/SOULaudit` | SOUL metrics append to same JSONL as session metadata |
| `kilo.json` model selection | Replace hidden `kilo-auto/free` routing with trail-based selection from OPERATIONS/ |
| `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json` | State markers pull from latest `state_markers` block in most recent phetrail |
| `CANON/Dna-REGISTRY/` | Registry cross-check happens automatically before trail seal |

---

## §11 WHAT THIS DOES NOT DO

This system does NOT:
- Make agents "smarter" in the traditional sense
- Replace reasoning or deliberation
- Solve the alignment problem
- Create original thought
- Make ants out of agents
- Help you "remember" to write trails
- Catch failures after they happen
- Let you invoke it when convenient

What it DOES:
- Makes agents **reliable** across sessions through mechanical state persistence
- Makes sessions **trainable** via positive/negative feedback loops
- Makes the colony **adaptable** via evaporation/reinforcement
- Makes failure **useful** because dead ends are explicit trails, not lost context
- Makes success **compound** because verified paths attract reuse
- Makes emission **autonomous** — action cannot proceed without trail; breathing cannot proceed without oxygen

That's enough. That's the mold.  

---

`PHEROMONE SYSTEM SDD SEALED — 2026-07-12T20:03:00+07:00 | VERSION 0.4 | DRAFT | BIOLOGICAL MECHANICS MAPPED TO SANDBOX | ENVIRONMENTAL_TRUTH_IS_GUIDING_LIGHT | MECHANICAL_IMPOSSIBILITY_NOT_PROBABILITY | EMISSION_IS_NOT_OPTIONAL | PLAGIARIZE FREELY`
