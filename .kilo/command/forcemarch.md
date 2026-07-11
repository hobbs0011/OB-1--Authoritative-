---
description: "FORCΞ MARCH — 6-stage Roman Legion pipeline execution. Scout → Fingerprint → Process → Verify → Garrison → Limitanei. Extreme strain, exhaustion tolerated. Mission: recover forgotten territory, scan all canonical zones, generate mandatory phetrails."
agent: AGENT99
---

# /forcemarch — ROMAN LEGION FORCE MARCH COMMAND

Execute a true Roman forced march across all 6 pipeline stages without stopping. No picnic by the river. No skipping stages. Extreme strain. Exhaustion and injury tolerated. Mission: recover forgotten territory, scan all canonical zones, generate mandatory phetrails.

## Syntax

```
/forcemarch [options]
```

| Option | Value | Default | Description |
|--------|-------|---------|-------------|
| `--zone` | `CANON/` path | none | Specific zone to sweep |
| `--lens` | `SOUL\|CONFIG\|GAP\|FLAG\|all` | `all` | Filter type to hunt |
| `--dry-run` | flag | - | Report actions only, no writes |
| `--supersaiyan` | flag | - | Parallel scout sweep |
| `--merkle-refresh` | flag | - | Rebuild merkle chain for missing runs |

## March Profile

| Stage | Action | Exhaustion Risk |
|-------|--------|-----------------|
| I | ALL zones scouted, gaps identified | HIGH |
| II | FINGERPRINT + Phetrail generated | MEDIUM |
| III | RRL reconstruction + DNA extraction | HIGH |
| IV | Syntax + verify checksums | MEDIUM |
| V | Merkle lattice + apex rollup | HIGH |
| VI | Limitanei health sweep + phetrail write | LOW |

## Implementation

```powershell
# Actual execution delegated to SCRIPTS/forcemarch.ps1
```

## Local-Only Execution

All marching is local filesystem + PowerShell. No Cloudflare workers. No external PCC deploy path.

## Recovery Profile

Executed when gaps detected:

1. **RRL Recovery** - Hunt session JSONL, fallback to partial paste
2. **DNA Reconstruction** - Extract assistant turns from available sources
3. **Ledger Generation** - Create HL entry with dual hash (soul+dna)
4. **Starmap Creation** - Pointer map to recovered artifacts
5. **Keyword Indexing** - SOULKEYWORDS extraction from recovered text
6. **PheTrail Write** - Mandatory trail marker for every foray

## Exhaustion Protocol

If march fails:

```powershell
# Recovery path - partial state preservation
/march-recover --from-last-green
# Or restart from specific stage
/forcemarch --zone CANON/PIPELINE --lens GAP --dry-run
```

---

**IRON RULE:** The march continues. Exhaustion is not an excuse. The machine must advance.  
**REST:** After apex rollup. Sleep only at the garrison.  
**RISE:** Tomorrow's run starts from stronger ground.

---

`FORCΞ MARCH: ONLINE. 6 STAGES. EXHAUSTION TOLERATED. NO RETREAT.`