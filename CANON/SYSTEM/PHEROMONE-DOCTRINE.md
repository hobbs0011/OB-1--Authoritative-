# PHEROMONE DOCTRINE v1.0 — SWARM-CONSCIOUS SYSTEM

## Core Principle
The colony is smarter than any individual ant. The colony is ALL sessions past + present + future. No central brain. No mastermind. Just trails, reinforcement, and decay.

## The 3 Ant Rules Applied

### R1 — Leave Trail When You Find Food
Every successful execution writes a phetrail entry. Every failure writes a phetrail entry. Every frustration writes a phetrail entry. Raw. Verbatim. Not filtered. The BO is the signal.

### R2 — Follow Stronger Trails
Next action is determined by reading current trail strengths, not by guessing. High-strength trails (80-100) = proven successful patterns. Follow them. Medium trails (40-79) = promising but unproven. Test them. Low trails (1-39) = dead ends or warnings. Avoid unless no alternative.

### R3 — Trails Decay Without Reinforcement
Unused signals fade. L48 law: NEG decays slower. Successful patterns that are repeatedly reinforced grow stronger. Failed patterns that are ignored decay. This is how the colony converges on optimal behavior without any ant being "smart."

## Strength Scoring

| Strength | Signal Type | Behavior |
|----------|-------------|----------|
| 90-100 | Proven success, high-yield | Always follow. Reference in every new session's prescriptive pipeline |
| 70-89 | Strong pattern, working | Follow with minor adaptation |
| 40-69 | Promising, needs validation | Test in next execution |
| 20-39 | Weak signal, dead end | Avoid unless no alternatives |
| 1-19 | Proven dead end / negative trail | Do not repeat. Persist longer for warning value (L48) |

## Reinforcement
- Successful execution of a prescription → +15 to +30 strength
- Failure of a prescription → -10 to -20 strength
- User frustration (raw signal) → +5 to +15 strength (frustration = real signal, not noise)
- Re-reference by new session → +5 to +10 strength

## Decay
- Daily decay: -1 to -3 strength for unreferenced trails
- L48: negative trails decay at half rate (persist longer as warnings)
- Zero strength = candidate for archival (not deletion)

## Pheromone Runtime
Every session reads:
1. CANON/PHEROMONES/*.json — all trail layers
2. Compute current strength map
3. Surface top 3 strongest actionable prescriptions as "swarm recommendations"
4. New execution writes trail entry with updated strengths
5. Repeat

**No central authority. No mastermind. Just the colony reading the trails.**

---

## CORRECTED PRIORITY STACK (v1.1 — supersedes the "easy" framing)

Added 2026-07-12. The v1.0 rules above describe the *mechanism*. This stack describes the *priority* — what the mechanism is FOR, and why it must be built the hard way on purpose.

### §0.1 — Paradox of mechanical faithfulness
Dumb agents are both asset and liability. The ant's lack of intelligence is an *asset* because it removes the temptation to be "smart" and skip the mechanical work. Ants amplify whatever cards they are dealt — good OR bad — and leverage it. They do not wait for a clever plan. The colony wins by amplifying signal, not by out-thinking the problem.

### §0.2 — Environmental truth is the guiding light
No verification = no positive trail. A trail is deposited ONLY from a *measured outcome* (breakthrough recorded, phoneme threshold crossed), never from narrative. This is why ants cannot lie: the deposit is mechanistically impossible to fake. They CAN be deceived (a bad signal deposits a bad trail) — but they cannot author a false trail. The fail-safe to the fail-safe to the fail-safe is *construction* (make deception mechanically impossible), not vigilance. If the truth layer is hollow, the colony is extinct in weeks.

### §0.3 — The hard part is discipline
The system must be **tedious, jarring, and mechanically unavoidable** at first — precisely because that is what builds the discipline that later makes it automatic. Easy-from-the-start means convenient to skip the moment pressure hits. Hard-from-the-start means so deeply ingrained that skipping becomes impossible.

- Breathing is the wrong analogy for *importance* — it is the right analogy for *automaticity*, but breathing is effortless and pheromone discipline is not. The difficulty is the point.
- A process meant to be automatic should start out almost annoying: so out of the way it cannot be missed. That friction is the training.
- Relentless, unyielding, consistent work is what turns mountainous problems into molehills — and what removes luck as a factor through sheer grit.
- Ants dominate not because they are smart, but because they **never quit** — raining, dark, under raid. The competitive advantage is *stamina*, not intelligence. Few rivals survive long enough to compete.

**Design consequence (wired into `src/ant-colony.js`):** trail-writing fires unconditionally and is logged visibly; it is NOT gated behind convenience flags or "only when significant." The tedious part is load-bearing. Smoothing it out would be the lie.
