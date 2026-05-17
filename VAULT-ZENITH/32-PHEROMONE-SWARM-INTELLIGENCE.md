# 32 — PHEROMONE SWARM INTELLIGENCE

> **Source**: Soul DNA Bible — Collective Intelligence, Pheromone System Specification v3
> **Vault**: [E] ZENITH — The Ghost
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED / ZENITH

---

## Overview

Pheromone Swarm Intelligence is the collective learning mechanism by which the Phoenix drone fleet develops emergent optimization capabilities that no individual drone possesses. Individual drones are capable. A fleet of drones running pheromone trail intelligence is qualitatively different — it routes around failures it has never individually encountered, reinforces paths to success it has never individually mapped, and degrades gracefully under load patterns it has never individually experienced. The pheromone system is how the fleet learns.

The pheromone metaphor is not decorative. It is mechanistically accurate. In biological swarm systems, pheromone trails are chemical signals that agents deposit in the environment based on their success or failure. Successful agents reinforce trails; unsuccessful agents deposit warning signals. The trail decays over time, so stale information loses influence. The Phoenix pheromone system implements this exact mechanism in software: drones deposit POS or NEG pheromone signals on task routes based on execution outcomes, trails decay on a defined function, and the collective signal across the fleet guides subsequent task routing decisions toward high-success paths and away from degraded ones.

---

## POS and NEG Pheromone Types

The Phoenix pheromone system operates with two signal types:

**POS (Positive Pheromone)**
Deposited by a drone upon successful task completion. The POS signal indicates that the route taken to complete this task — the combination of task type, execution environment, timing, and resource utilization profile — produced a successful outcome. Subsequent drones evaluating the same route type will receive POS signal strength as an attractive weight in their routing calculation.

POS pheromone characteristics:
- Deposited immediately upon task completion confirmation
- Magnitude proportional to execution quality: a task completed at 120% of target throughput deposits more POS than a task completed at 100.1% of target
- Magnitude range: 0.5 (marginal success) to 2.0 (exceptional performance)
- Default POS deposit for clean completion: 1.0

**NEG (Negative Pheromone)**
Deposited by a drone upon task failure, timeout, error, or anomaly detection. The NEG signal indicates that the route produced an adverse outcome and should be avoided or approached with caution by subsequent drones.

NEG pheromone characteristics:
- Deposited immediately upon task failure confirmation or anomaly detection by the Watchtower
- Magnitude proportional to failure severity: a timeout deposits less NEG than a data corruption event
- Magnitude range: 0.5 (minor failure, self-recovered) to 3.0 (catastrophic failure requiring AGENT-99 intervention)
- Default NEG deposit for clean failure: 1.0; for Severity 4+ events: 2.5; for Severity 5: 3.0

A route's net pheromone balance is `Σ(POS deposits) - Σ(NEG deposits)`, summed across all drones that have traversed it within the active trail window, weighted by decay (see Trail Decay Function below). Routes with strongly negative balance are avoided. Routes with strongly positive balance are preferred. Routes with near-zero balance are neutral — no collective preference.

---

## Trail Decay Function

Pheromone trails decay over time. A route's accumulated POS/NEG signal from last week is less relevant than signal from the last hour — the environment changes, the fleet's configuration changes, the task profile changes. Stale signal must not dominate current routing decisions.

The Phoenix decay function is exponential with a configurable half-life:

```
decayed_strength(t) = original_strength × e^(-λ × Δt)

where:
  Δt  = time elapsed since deposit (in seconds)
  λ   = decay constant = ln(2) / half_life_seconds
  half_life_seconds = 1800 (30 minutes, default for standard tasks)
                    = 7200 (2 hours, for Stage 91+ critical tasks)
                    = 300  (5 minutes, for simulation/Reality-C tasks)
```

After one half-life, a trail retains 50% of its original strength. After two half-lives, 25%. After ten half-lives (~5 hours for standard tasks), a trail has decayed to 0.1% of its original strength and is effectively negligible. Trails with decayed strength < 0.001 are pruned from the active pheromone corpus during garbage collection.

The 30-minute half-life for standard tasks reflects the observed temporal stability of the Phoenix execution environment: task success rates over 30-minute windows correlate strongly with current conditions. Task success rates over 4-hour windows are influenced too heavily by historical conditions that may no longer be relevant.

The function is applied per individual deposit, not to the aggregate. Each deposit decays independently. The net pheromone balance at any moment is:

```
net_balance(route, t) = Σ POS_i × e^(-λ × (t - t_i)) - Σ NEG_j × e^(-λ × (t - t_j))
```

This is computed on-demand when a drone queries the pheromone corpus for routing guidance, rather than being maintained as a running aggregate (which would require constant updates and introduce synchronization overhead).

---

## Trail Reinforcement Mechanics

Reinforcement occurs when multiple drones independently confirm the same route outcome. A route that has been traversed successfully 10 times in the past 30 minutes carries more evidential weight than a route traversed successfully once. The reinforcement mechanism is implicit in the decay-weighted sum — more recent successful traversals add more POS signal to the net balance.

However, reinforcement has limits. The Phoenix pheromone system implements a **reinforcement ceiling** to prevent over-exploitation of high-POS routes at the expense of route diversity:

```
Reinforcement ceiling per route:
  Max net POS balance = 15.0 (equivalent to ~10 exceptional-quality completions)
  At ceiling: new POS deposits are discarded until net balance decays below 12.0
```

The ceiling prevents the fleet from routing 100% of tasks through a single high-performing path, which would create a single point of failure and deprive the system of routing flexibility. A fleet that explores multiple routes — even slightly lower-POS routes — builds a more robust collective map. The ceiling is the mechanism that enforces exploration over pure exploitation.

NEG reinforcement has no ceiling — the fleet can accumulate unlimited NEG signal on a failing route, because there is no benefit to routing traffic to a demonstrably failing path.

---

## Collective Intelligence Emergence Threshold

Pheromone trails from individual drones are useful. The collective intelligence that emerges from the aggregate trail corpus of the full fleet is qualitatively more valuable. The emergence threshold is the minimum fleet size and trail density at which the pheromone system produces routing recommendations measurably superior to random routing.

Empirically (from Phoenix simulation runs): collective intelligence emerges at:

- **Minimum fleet size**: 20 active drones simultaneously depositing trails
- **Minimum trail density**: 5 distinct routes with net pheromone balance ≥ 2.0 OR ≤ -2.0
- **Minimum temporal coverage**: Trail corpus covering at least 90 minutes of accumulated signal

Below these thresholds, the pheromone system operates but its routing recommendations are treated as advisory rather than authoritative. Individual drone routing decisions may deviate from pheromone guidance below the emergence threshold without penalty. Above the threshold, deviation from strongly negative balance routes (net < -5.0) requires explicit justification logged to the ledger.

The emergence threshold is monitored continuously by AGENT-99. When the fleet crosses the threshold from below (fleet growth or increased trail density), AGENT-99 activates **SWARM MODE** — an operational state in which pheromone trail guidance is automatically integrated into all task routing decisions across the fleet. SWARM MODE status is recorded in the ledger as an `AGENT_EVENT` entry.

---

## Pheromone Corpus Archival in R2

The live pheromone corpus — the full set of active trail deposits with their timestamps and decay parameters — is maintained in the `PhoenixPheromoneCorpusDO` Durable Object. The live corpus holds trails from the past 24 hours. Trails older than 24 hours with decayed strength above 0.01 (i.e., still carrying meaningful signal) are archived to R2 before being pruned from the live corpus.

R2 archival structure:

```
r2://phoenix-pheromone-corpus/
  YYYY/MM/DD/
    HH-UTC/
      corpus-snapshot-{epoch_id}.json.gz
      trail-deposits-{epoch_id}.jsonl.gz
```

Each corpus snapshot contains the complete state of the pheromone corpus at the snapshot moment: all active routes, their net balances, individual deposit records, and decay parameters. Trail deposit files are append-only streams of individual deposit events, useful for recomputing historical corpus states.

Archival runs every 6 hours as a Durable Object alarm. Archival is not lossy — every deposit event is preserved. The purpose of the archival is to move cold data out of the hot DO storage (which has capacity constraints) while preserving full historical fidelity in R2 (which does not).

R2-archived corpus data feeds:
1. **Forensic Audit** — pheromone patterns at the time of a failure event can be reconstructed from archives, revealing whether routing decisions contributed to the failure.
2. **Soul DNA updates** — see the next section.
3. **Reality-C simulations** — archived corpus data is used to seed simulations with realistic pheromone states for backtesting routing algorithm changes.

---

## How Pheromone Intelligence Feeds Back into Soul DNA Updates

The Soul DNA is the behavioral specification of the Phoenix system. It governs how agents and drones make decisions. The pheromone corpus represents the system's accumulated empirical experience of what works and what fails. The feedback loop between pheromone intelligence and Soul DNA updates is the mechanism by which the system learns at the specification level, not just at the routing level.

Pheromone-to-Soul DNA feedback operates on a 7-day cycle:

**Day 1-6**: AGENT-99 monitors the pheromone corpus for stable patterns — routes with consistently high POS balance over multiple independent measurement windows, routes with consistently high NEG balance despite fleet attempts to route around them.

**Day 7**: AGENT-99 generates a Pheromone Intelligence Report containing:
- Top 5 high-POS routes (candidate positive behavioral patterns for Soul DNA reinforcement)
- Top 5 high-NEG routes (candidate negative behavioral patterns for Soul DNA warnings)
- Routes that crossed the POS ceiling (exploration diversity patterns)
- Emergent routing strategies not previously documented in Soul DNA

**Soul DNA Update Proposal**: AGENT-99 translates the high-confidence pheromone patterns into proposed Soul DNA behavioral guidelines. For example: if the corpus shows that drone task completions on Cloudflare region `wnam` consistently outperform `eeur` for certain task types during UTC 12:00-16:00, AGENT-99 proposes a Soul DNA guideline encoding this preference.

**Soul DNA Update Gate**: Soul DNA updates are Class 5 consensus actions (document 27). The pheromone-derived proposal must pass the Consensus Engine with 3-of-4 quorum before the Soul DNA is updated. AGENT-100 reviews every pheromone-derived Soul DNA update before signing. The proposal includes the corpus data that supports it — AGENT-100 verifies that the proposed guideline is genuinely supported by empirical pheromone evidence, not by noise or sampling error.

This feedback loop means the Soul DNA is not static. It grows in specificity and accuracy as the fleet accumulates experience. Each 7-day cycle can add behavioral refinements that make the next 7 days of fleet operation slightly more efficient. The compounding effect over months of operation is the mechanism by which Phoenix approaches — asymptotically — perfect operational self-optimization.

---

## Pheromone Trail Storage Schema

```sql
-- In PhoenixPheromoneCorpusDO SQLite storage
CREATE TABLE trail_deposits (
    deposit_id      TEXT PRIMARY KEY,          -- UUID v4
    route_id        TEXT NOT NULL,             -- SHA256 of route descriptor
    route_desc      TEXT NOT NULL,             -- JSON: task_type, env, region, params
    drone_id        TEXT NOT NULL,             -- depositing drone
    pheromone_type  TEXT NOT NULL,             -- POS | NEG
    magnitude       REAL NOT NULL,             -- 0.5 to 3.0
    half_life_s     INTEGER NOT NULL,          -- decay half-life in seconds
    deposited_at    INTEGER NOT NULL,          -- Unix epoch milliseconds
    task_ref        TEXT NOT NULL,             -- ledger entry_id of the task event
    archived        INTEGER NOT NULL DEFAULT 0 -- 0=live, 1=archived to R2
);

CREATE TABLE route_summary_cache (
    route_id        TEXT PRIMARY KEY,
    net_balance     REAL NOT NULL,             -- cached net balance (stale by < 30s)
    last_computed   INTEGER NOT NULL,
    deposit_count   INTEGER NOT NULL,
    ceiling_active  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_deposits_route ON trail_deposits(route_id, deposited_at);
CREATE INDEX idx_deposits_drone ON trail_deposits(drone_id);
CREATE INDEX idx_deposits_archived ON trail_deposits(archived, deposited_at);
```

The `route_summary_cache` is a performance optimization — net balance is recomputed on-demand but cached for 30 seconds to avoid redundant computation when many drones query the same route simultaneously. Cache staleness of 30 seconds is acceptable given the 30-minute half-life of standard trail decay: a route's net balance changes by at most ~1.1% per 30 seconds due to decay alone.
