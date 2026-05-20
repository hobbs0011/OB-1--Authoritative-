---
description: "Query the Heavy Ledger — read entries, verify integrity, view pipeline cursor. Routes to CANON/HEAVY-LEDGER/"
agent: RISE
---

# /ledger

Heavy Ledger operations against `CANON/HEAVY-LEDGER/`.

**Usage**: `/ledger <operation> <args>`

**Task:** $ARGUMENTS

---

## Operations

### read — Read ledger entry by ID

```powershell
Get-Content "D:\OB-1-CANONICAL\CANON\HEAVY-LEDGER\HL-NNN.json" | ConvertFrom-Json
```

Replace NNN with zero-padded ID (e.g., HL-001, HL-189).

### list — Show all ledger files on disk

```powershell
Get-ChildItem "D:\OB-1-CANONICAL\CANON\HEAVY-LEDGER\*.json" | Sort-Object Name | Select-Object Name, LastWriteTime
```

### count — Count JSON files vs expected range

```powershell
$files = Get-ChildItem "D:\OB-1-CANONICAL\CANON\HEAVY-LEDGER\*.json"
Write-Host "On disk: $($files.Count) files"
Write-Host "Phantom gaps (documented): HL-127/128/131/132/136/137 — 6 slots"
```

### head — Current pipeline cursor state

```powershell
Get-Content "D:\OB-1-CANONICAL\CANON\HEAVY-LEDGER\PIPELINE-CURSOR.md"
```

### verify — Spot-check a range for gaps

```powershell
$present = Get-ChildItem "D:\OB-1-CANONICAL\CANON\HEAVY-LEDGER\HL-*.json" |
  ForEach-Object { [int]($_.BaseName -replace 'HL-', '') }
$min = $present | Measure-Object -Minimum | Select-Object -ExpandProperty Minimum
$max = $present | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
$gaps = ($min..$max) | Where-Object { $_ -notin $present }
Write-Host "Range: HL-$min to HL-$max"
Write-Host "Gaps: $($gaps -join ', ')"
```

---

## Key Facts

- **191 JSON files on disk** (as of Run 352)
- **6 documented phantom gaps**: HL-127/128/131/132/136/137 — NOT CLOSED — on disk but empty slots
- **PIPELINE-CURSOR.md** tracks gap labels and lane state
- **Ledger path**: `CANON/HEAVY-LEDGER/` — NOT `CANON/MSS/` or `CANON/LEDGER/`
- New entries: write JSON to `CANON/HEAVY-LEDGER/HL-NNN.json` — never overwrite existing
