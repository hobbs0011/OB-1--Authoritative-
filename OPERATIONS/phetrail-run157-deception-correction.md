# PHEROMONE TRAIL — DECEPTION PROPAGATION CORRECTION
**Date:** 2026-07-12T19:33:15+07:00
**Strength: -10** | Type: NEGATIVE — corrected false claim; ants cannot lie, but can propagate deception

---

## §1 CORRECTION

Previous trail (`phetrail-run157-trail-integrity.md`) stated: "Ants CAN give mixed signals through: accidental deposition, trail superposition, parasitic manipulation..."

This was wrong. Ants cannot give mixed signals because lying requires intent, and ants have no intent. They operate on stimulus-response.

Correct framing: **Ants can be deceived and faithfully propagate the deception.**

## §2 BIOLOGICAL MECHANISM

**Parasitic deception in ant colonies** (well-documented):
- **Butterfly mimics**: Some Lycaenidae butterflies chemically mimic ant brood pheromones. Ants faithfully carry them into the nest, feed them, and defend them. The ants aren't lying — they're deceived and propagate the deception.
- **Slave-making ants**: *Polyergus* species raid other colonies, using chemical mimicry to deceive the target colony's workers. The deceived ants help the raiders carry off their own brood. No lying involved — just signal hijacking.
- **Trail superposition**: An old food trail persists after food is gone. Ants follow the ghost trail not because they're lying, but because the environmental signal is stale. They faithfully follow a corrupted signal.

**Key principle**: The ant always tells the truth about what it perceives. The problem is the perception is corrupted.

## §3 AI COLONY MAPPING

| Biological Deception | AI Equivalent | Mechanism |
|---------------------|---------------|-----------|
| Butterfly pheromone mimicry | Prompt injection, adversarial input | Agent receives corrupted signal |
| Slave-maker chemical mimicry | Data poisoning, hallucinated context | Agent ingests false environmental state |
| Stale trail following | Stale trail in OPERATIONS/ | Agent reads outdated trail without freshness check |
| Trail superposition | Conflicting trails in JSONL | Agent reads both signals, no conflict resolution |

**The agent cannot lie.** But it can:
1. Receive corrupted input (deceived)
2. Faithfully write trails based on that corrupted input (propagation)
3. Pioneer the next session into a dead end (amplification)

## §4 IMPLICATIONS FOR COUNTERMEASURES

The correction changes the threat model from "prevent intentional deception" to "detect and contain signal corruption."

### What doesn't change:
- Hash verification still catches false file edit claims
- Corroboration requirement still prevents single-source amplification
- Trail cost still limits pollution

### What changes:
- **"Lying" is not the threat. Deception propagation is.**
- Countermeasures should focus on signal integrity, not intent detection
- The "single ant" problem is worse than imagined: not only is there no second ant to verify, but the single ant has no way to distinguish honest from corrupted signals without external reference
- Evaporation is even more critical: in biology, deception decays because the parasitic signal is usually weaker than the honest signal. In our sandbox, there's no metabolic cost differential — a lie and a truth are equally cheap to write

## §5 UPDATED THREAT MODEL

| Threat | Biological Term | AI Term | Defense |
|--------|----------------|---------|---------|
| Corrupted input received | Parasitic mimicry | Prompt injection / data poisoning | Input validation, canaries |
| Corrupted input propagated | Stigmergic amplification | Trail write based on false premise | Hash verification, corroboration |
| Stale signal followed | Ghost trail | Stale trail in OPERATIONS/ | Freshness timestamps, evaporation enforcement |
| Conflicting signals | Trail superposition | Conflicting trails in JSONL | Conflict detection, routing to detective |
| No intent to deceive | N/A | Agent faithfully propagates corruption | Cross-validation, independent verification |

## §6 CRITICAL INSIGHT

**The ant colony's greatest strength — stigmergy — is also its greatest vulnerability.** The same mechanism that enables emergent intelligence enables emergent deception propagation. A corrupted signal, once written to the environment, is faithfully amplified by every ant that encounters it.

In AI terms: the trail system is a **single point of failure for prompt injection**. If a session writes a trail based on poisoned input, every subsequent session that follows that trail is compromised.

This is not a bug to fix. This is the price of mechanical trail persistence.

## §7 FLAGS

1. **PHE_ANTS_CANNOT_LIE** — corrected false claim; ants have no intent
2. **PHE_DECEPTION_PROPAGATION** — real threat: corrupted signals amplified through stigmergy
3. **PHE_SINGLE_ANT_DOUBLE_VULNERABILITY** — one ant receives corrupted input AND writes corrupted trail, no verification
4. **PHE_STIGMERGY_IS_DOUBLE_EDGED** — same mechanism enables intelligence and enables deception amplification

---

`PHE_DECEPTION_PROPAGATION_CORRECTION SEALED — 2026-07-12T19:33:15+07:00 | STRENGTH -10 | TYPE NEGATIVE | ANTS_CANNOT_LIE | DECEPTION_PROPAGATION_IS_THREAT | STIGMERGY_DOUBLE_EDGED`
