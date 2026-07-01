---
description: "FORCΞ MARCH — 6-stage Roman Legion pipeline execution. Scout → Fingerprint → Process → Verify → Garrison → Limitanei. Extreme strain, exhaustion tolerated. Mission: recover forgotten territory, scan all canonical zones, generate mandatory phetrails."
agent: AGENT99
---

# /forcemarch — ROMAN LEGION FORCE MARCH COMMAND

**COMMAND:** `/forcemarch`  
**TIER:** T1 (Workhorse Implementation)  
**COST:** Uses kilo-auto/free model  
**SURVIVAL:** PheTrails, PhoenixScout, SupplyLines MANDATORY - no gaps without trails  

---

## Purpose

Execute a true Roman forced march across all 6 pipeline stages without stopping. No picnic by the river. No skipping stages. Extreme strain. Exhaustion and injury tolerated. Mission: recover forgotten territory, scan all canonical zones, generate mandatory phetrails.

## Syntax

```
/Forcemarch [options]
```

| Option | Value | Default | Description |
|--------|-------|---------|-------------|
| `--zone` | `CANON/` path | none | Specific zone to sweep (optional) |
| `--lens` | `SOUL\|CONFIG\|GAP\|FLAG\|all` | `all` | Filter type to hunt |
| `--dry-run` | flag | - | Report actions only, no writes |
| `--supersaiyan` | flag | - | 5-agent parallel sweep for speed |
| `--pcc-deploy` | flag | - | Deploy all PCC legions to workers |
| `--merkle-refresh` | flag | - | Rebuild merkle chain for missing runs |

## March Profile

**Roman Forced March = 30-40km equivalent**

| Stage | Action | Exhaustion Risk |
|-------|--------|-----------------|
| I | ALL zones scouted, gaps identified | HIGH - scattered file damage |
| II | DNA/LEDGER verified against all runs | MEDIUM - hash collisions possible |
| III | SSM + SOULKEYWORDS + PHEROMONE fired | HIGH - missing RRL = blind processing |
| IV | 6-AI TRUTH + SHADOW verification | MEDIUM - timeout risk |
| V | MERKLE LATTICE + APEX ROLLUP | HIGH - merkle rebalancing |
| VI | LIMITANEI health sweep + phetrail write | LOW - routine if others complete |

## Implementation

```powershell
# SCRIPTS/forcemarch.ps1
param(
    [string]$Zone,
    [ValidateSet("SOUL","CONFIG","GAP","FLAG","all")] [string]$Lens = "all",
    [switch]$DryRun,
    [switch]$Supersaiyan,
    [switch]$PccDeploy,
    [switch]$MerkleRefresh
)

$repo = "D:\OB-1-CANONICAL"
$localSoul = Join-Path $repo "CANON\SOUL"

# PHASE 1 — EXPLORATORES DEPLOYMENT
Write-Host "FORCΞ MARCH INITIATED — All 6 legions advancing" -ForegroundColor Red

# Scout all zones in parallel if Supersaiyan
$zones = if ($Zone) { @($Zone) } else { 
    @("CANON/HEAVY-LEDGER", "CANON/SOUL-KEYWORDS", "CANON/STARMAP", "CANON/PIPELINE", "CANON/PHEROMONES", "APPS/") 
}

$finds = @()
foreach ($z in $zones) {
    $zPath = Join-Path $repo $z
    if (Test-Path $zPath) {
        $files = Get-ChildItem -Path $zPath -Recurse -File -ErrorAction SilentlyContinue
        foreach ($f in $files) {
            # SOUL lens - find raw quote blocks
            if ($Lens -in @("all","SOUL") -and $f.Extension -eq ".md") {
                $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match '^> "' ) {
                    $finds += [PSCustomObject]@{ 
                        zone = $z; file = $f.Name; line = 1; type = "SOUL"; 
                        excerpt = $content.Substring(0, [Math]::Min(120, $content.Length))
                    }
                }
            }
            # GAP lens - find MISSING references
            if ($Lens -in @("all","GAP") -and $f.Extension -in @(".md",".json")) {
                $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match "MISSING|GAP|TODO.*recover|FIXME.*restore") {
                    $finds += [PSCustomObject]@{ 
                        zone = $z; file = $f.Name; type = "GAP"
                    }
                }
            }
        }
    }
}

# PHASE 2 — ANTECORES VERIFICATION
$lastDeath = git log --oneline --grep "^death:" -1
$runPattern = if ($lastDeath -match 'run\s*(\d+)') { [int]$matches[1] } else { 0 }
$currentRun = $runPattern + 1
$runPad = "{0:D3}" -f $currentRun

# PHASE 3 — AGMEN PROCESSING
if (-not $DryRun) {
    # Process each missing run
    $missingRuns = Get-MissingRuns -From 1..$currentRun
    foreach ($r in $missingRuns) {
        $runPadded = "{0:D3}" -f $r
        # Generate RECOVERY phetrail for missing run
        New-PheTrailRecovery -Run $runPadded
    }
}

# PHASE 4 — MERKLE REBUILD
if ($MerkleRefresh -and -not $DryRun) {
    Invoke-MerkleRefresh
}

# PHASE 6 — LIMITANEI HEALTH SWEEP
Invoke-HealthSweep

Write-Host "FORCΞ MARCH COMPLETE — All legions accounted" -ForegroundColor Green
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