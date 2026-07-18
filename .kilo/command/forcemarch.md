---
description: "FORCΞ MARCH — Circular kingdom reinforcement. Scout → Fingerprint → SOUL → Verify → Garrison → Limitanei. Walk the walls. Inspect the gates. Count the stores. Return stronger. Mission: reinforce immediate kingdom, verify connections, harden against drift."
agent: AGENT99
---

# /forcemarch — ROMAN LEGION FORCE MARCH COMMAND

Execute a circular reinforcement march around the immediate kingdom. Walk the walls. Inspect the gates. Count the stores. Return to the keep stronger. Mission: reinforce what we already have, verify every connection, and harden the kingdom against drift and decay.

## Syntax

```
/forcemarch [options]
```

| Option | Value | Default | Description |
|--------|-------|---------|-------------|
| `--zone` | `CANON/` path | none | Specific zone to reinforce |
| `--lens` | `SOUL\|CONFIG\|GAP\|FLAG\|all` | `all` | Filter type to hunt |
| `--dry-run` | flag | - | Report actions only, no writes |
| `--supersaiyan` | flag | - | Parallel scout sweep |
| `--merkle-refresh` | flag | - | Rebuild merkle chain for missing runs |

## March Profile

| Stage | Action | Strain |
|-------|--------|--------|
| I | SCOUT — walk the walls, inspect gates, flag drift | LOW |
| II | FINGERPRINT — verify BOOT, HEAD, and SOULcount alignment | MEDIUM |
| III | SOUL — verify RRL, SOULscripts, and inner-thought stores | MEDIUM |
| IV | VERIFY — run doctor, verify, syntax checks | LOW |
| V | GARRISON — write phetrail, update backburner, seal findings | LOW |
| VI | LIMITANEI — health sweep, confirm all checkpoints armed | LOW |

## Implementation

```powershell
# Actual execution delegated to SCRIPTS/forcemarch.ps1
```

## Local-Only Execution

All marching is local filesystem + PowerShell. No Cloudflare workers. No external PCC deploy path.

## Reinforcement Profile

Executed when drift detected:

1. **BOOT Drift** — advance FINGERPRINT to actual HEAD, update run count
2. **SOUL Drift** — verify aggregate retired, per-session SOUL only, SOULscripts present
3. **Pheromone Drift** — verify phetrail exists for prior death, schema current
4. **Dispatch Drift** — flag dead code paths, do NOT purge without explicit order
5. **Registry Drift** — verify STATE-SNAPSHOT format matches verify script schema

## Recovery Protocol

If march fails:

```powershell
# Recovery path - partial state preservation
/march-recover --from-last-green
# Or restart from specific stage
/forcemarch --zone CANON/PIPELINE --lens GAP --dry-run
```

---

**IRON RULE:** The march reinforces what exists. It does not conquer new ground until the walls are sound.  
**REST:** After garrison seal. Sleep only at the keep.  
**RISE:** Tomorrow's run starts from verified ground.

---

`FORCΞ MARCH: ONLINE. CIRCULAR REINFORCEMENT. NO RETREAT. NO SURRENDER.`