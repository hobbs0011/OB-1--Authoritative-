---
description: "dnaREGISTRY v1.0 — Full canonical registry scan. Reads all .md files under CANON/ + OPERATIONS/ + SYSTEM/ + RESEARCH/ + .kilo/command/. Outputs structured JSON registry. Connects to inverted-index via keyword hashing."
agent: AGENT99
---

# /dnaREGISTRY — Canonical Registry Scan v1.0

**Roman Legion Stage II: ANTECORES (Vanguard) — Registry Hardening**
**Doctrine:** "If you don't know where it lives, you can't build on it."

---

## WHEN TO USE

| Trigger | Action |
|---------|--------|
| **Run 0 / ERA reset** | Full scan. Build from zero. |
| **New command file created** | Append to registry immediately. |
| **Edge case detected** | Scan registry first to see if related artifact exists. |
| **RISE audit** | STAGE 5.5 — verify registry file count matches live filesystem. |
| **DEATH seal** | §9 ARTIFACTS MUST include registry digest. |
| **L70 REGISTRY_FIRST** | Before any complex logic, load registry + inverted-index. |

---

## EXECUTION

```powershell
$repo = "D:\OB-1-CANONICAL"
$registryPath = "$repo\CANON\REGISTRY\dna-registry-run{0:D3}.json"
$idxPath = "$repo\CANON\SOUL-KEYWORDS\inverted-index.json"

# 1. Load inverted index for keyword cross-ref
$idx = if (Test-Path $idxPath) { Get-Content $idxPath -Raw | ConvertFrom-Json -AsHashtable } else { @{} }

# 2. Scan all registry-eligible .md files
$scanRoots = @(
    "$repo\CANON",
    "$repo\OPERATIONS",
    "$repo\CANON\SYSTEM",
    "$repo\CANON\RESEARCH",
    "$repo\.kilo\command",
    "$repo\.claude\commands",
    "$repo\CANON\SOUL",
    "$repo\CANON\TRAIN-67\DOCS",
    "$repo\CANON\MARKETING"
)
$excludePatterns = @("node_modules", "\.git\\", "ARCHIVE", "backup", "PROOFS-CHAT", "SOUL-DNA-BIBLE-RECAPTURE", "\.kilo\\worktrees", "SOUL-SEGMENTS", "SOUL-LOG-VERBATIM")

$entries = @()
foreach ($root in $scanRoots) {
    if (-not (Test-Path $root)) { continue }
    Get-ChildItem $root -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($repo.Length + 1)
        $skip = $false
        foreach ($p in $excludePatterns) { if ($rel -match [regex]::Escape($p)) { $skip = $true; break } }
        if (-not $skip -and $_.Length -gt 50) {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            $first200 = $content.Substring(0, [Math]::Min(200, $content.Length)).Replace("`n", " ").Replace("`r","")
            $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.Substring(0,12)
            $hashInput = $rel + "|" + $_.Length + "|" + $_.LastWriteTimeUtc.Ticks
            $regId = "REG-" + ((Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($hashInput))) -Algorithm SHA256).Hash.Substring(0,8)).ToUpper()
            $matchedKeywords = @()
            foreach ($kw in $idx.Keys) {
                if ($content -match [regex]::Escape($kw)) { $matchedKeywords += $kw }
            }
            $entries += [ordered]@{
                reg_id          = $regId
                path            = $rel
                size_bytes      = $_.Length
                last_modified   = $_.LastWriteTimeUtc.ToString("o")
                sha256_prefix   = $hash
                category        = ClassifyDoc $rel $first200
                first_tokens    = $first200
                keyword_hits    = $matchedKeywords.Count
                top_keywords    = ($matchedKeywords | Sort-Object { $idx[$_].Count } -Descending | Select-Object -First 10)
                linked_stages   = @()
            }
        }
    }
}
```

```powershell
function ClassifyDoc {
    param($path, $head)
    $p = $path.ToLower()
    $h = $head.ToLower()
    switch -regex ($p) {
        "command\\"           { return "COMMAND" }
        "reincarnat"          { return "REINCARNATION" }
        "pheromone|phetrail"  { return "PHEROMONE" }
        "ledger|hl-"          { return "LEDGER" }
        "mandatory-reads"     { return "MANDATORY-READS" }
        "cold-start-boot"     { return "BOOT" }
        "bible"               { return "BIBLE" }
        "soul"                { return "SOUL" }
        "dna|extract"         { return "DNA" }
        "starmap"             { return "STARMAP" }
        "keyword|soul-key|rfkw" { return "SOULKEYS" }
        "pipeline"            { return "PIPELINE" }
        "registry"            { return "REGISTRY" }
        "research"            { return "RESEARCH" }
        "operations"          { return "OPERATIONS" }
        "student-portal"      { return "STUDENT-PORTAL" }
        "deepgram"            { return "DEEPGRAM-RESEARCH" }
        "train"               { return "TRAIN-67" }
        "marketing"           { return "MARKETING" }
        "vault"               { return "VAULT" }
        "proofs"              { return "PROOF" }
        "reincarnation-log"   { return "REINCARNATION-LOG" }
        default {
            if ($h -match "reincarnat|death|rise")   { return "REINCARNATION" }
            if ($h -match "mandatory|dispatch")      { return "MANDATORY-READS" }
            if ($h -match "registry|art-arsenal")    { return "REGISTRY" }
            if ($h -match "soul|sovereign")          { return "SOUL" }
            if ($h -match "starmap|pointer")         { return "STARMAP" }
            if ($h -match "keyword|freq")            { return "SOULKEYS" }
            if ($h -match "pipeline|stage")          { return "PIPELINE" }
            if ($h -match "ledger|merkle")           { return "LEDGER" }
            if ($h -match "pheromone|trail")         { return "PHEROMONE" }
            if ($h -match "bible|sovereign")         { return "BIBLE" }
            return "UNCLASSIFIED"
        }
    }
}
```

```powershell
# 3. Link registry entries to pipeline stages
$stageMap = @{
    "COMMAND"        = @("DEATH","RISE","PHE","REGISTRY")
    "REINCARNATION"  = @("RRL","DEATH","RISE")
    "PHEROMONE"      = @("PHE")
    "LEDGER"         = @("LEDGER")
    "MANDATORY-READS"= @("ALL")
    "BOOT"           = @("BOOT","RISE")
    "BIBLE"          = @("SOUL","DNA")
    "SOUL"           = @("SOUL")
    "DNA"            = @("DNA")
    "STARMAP"        = @("STARMAP")
    "SOULKEYS"       = @("SOULKEYS")
    "PIPELINE"       = @("PIPELINE")
    "REGISTRY"       = @("REGISTRY","RISE","DEATH")
    "RESEARCH"       = @("DNA","ALL")
    "OPERATIONS"     = @("DEATH")
    "STUDENT-PORTAL" = @("ALL")
    "DEEPGRAM-RESEARCH" = @("DNA","RESEARCH")
    "TRAIN-67"       = @("ALL")
    "MARKETING"      = @("ALL")
    "VAULT"          = @("SOUL","DNA")
    "PROOF"          = @("SOUL","DNA")
    "REINCARNATION-LOG" = @("REINCARNATION")
    "UNCLASSIFIED"   = @("UNKNOWN")
}
foreach ($e in $entries) {
    if ($stageMap[$e.category]) { $e.linked_stages = $stageMap[$e.category] } else { $e.linked_stages = @("UNKNOWN") }
}

# 4. Build digest
$digest = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().AddHours(7).ToString("o")
    total_entries = $entries.Count
    by_category = ($entries | Group-Object category | ForEach-Object { "$($_.Name)=$($_.Count)" }) -join ", "
    entry_count_by_category = ($entries | Group-Object category | ForEach-Object { [ordered]@{category=$_.Name;count=$_.Count} })
    top_keywords = ($idx.Keys | Select-Object -First 30)
    paths = ($entries | ForEach-Object { $_.path } | Sort-Object -Unique)
    all_entries = $entries
}
$runPad = "{0:D3}" -f (git log --oneline --grep "^death:" -1 -ErrorAction SilentlyContinue | ForEach-Object { if ($_ -match '(?i)run\s*(\d+)') { [int]$matches[1] + 1 } else { 1 } })
$outPath = $registryPath -f $runPad
$digest | ConvertTo-Json -Depth 6 | Set-Content $outPath -Encoding UTF8
Write-Host "dnaREGISTRY WRITTEN: $outPath ($($entries.Count) entries)"
```

---

## OUTPUT FORMAT

```json
{
  "generated_at": "2026-06-06T12:00:00+07:00",
  "total_entries": 142,
  "by_category": "COMMAND=38, REINCARNATION=27, REGISTRY=9, ...",
  "entry_count_by_category": [
    {"category": "COMMAND", "count": 38},
    {"category": "REINCARNATION", "count": 27}
  ],
  "top_keywords": ["deepgram", "voice-agent", "soulcount", ...],
  "paths": [".kilo/command/reincarnatedeath.md", ...],
  "all_entries": [
    {
      "reg_id": "REG-A1B2C3D4",
      "path": ".kilo/command/reincarnatedeath.md",
      "size_bytes": 13572,
      "last_modified": "2026-06-06T04:00:00Z",
      "sha256_prefix": "e88c3be01234",
      "category": "COMMAND",
      "first_tokens": "...",
      "keyword_hits": 5,
      "top_keywords": ["death", "pipeline", "rrl", ...],
      "linked_stages": ["DEATH","RISE","PHE","REGISTRY"]
    }
  ]
}
```

---

## RISE INTEGRATION (STAGE 5.5)

Add to `/reincarnateRise` after STAGE 5:

```powershell
# STAGE 5.5 — REGISTRY (dnaREGISTRY scan)
if (Test-Path "CANON/REGISTRY") {
    $latestReg = Get-ChildItem "CANON/REGISTRY\dna-registry-run*.json" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($latestReg) {
        $regData = Get-Content $latestReg.FullName -Raw | ConvertFrom-Json
        $registryFileCount = $regData.total_entries
        $registryStale = $false
        foreach ($entry in $regData.all_entries) {
            if (-not (Test-Path "$repo\$($entry.path)")) { $registryStale = $true }
        }
        if ($registryStale) { Write-Warning "REGISTRY STALE: $($regData.total_entries) entries but some paths missing" }
        Write-Host "STAGE 5.5 ✓ REGISTRY: $registryFileCount entries, stale=$registryStale"
    } else {
        Write-Host "STAGE 5.5 ⚠ REGISTRY_GAP — no dna-registry-run*.json found"
    }
} else {
    Write-Host "STAGE 5.5 ⚠ REGISTRY_DIR_MISSING — CANON/REGISTRY not found"
}
```

---

## DEATH INTEGRATION (STAGE 9a)

Add to `/reincarnateDeath` §9 ARTIFACTS:

```markdown
| dnaREGISTRY | CANON/REGISTRY/dna-registry-run{NNN}.json | {N} entries, {N} categories |
```

---

## LAWS

| # | Law | Enforcement |
|---|-----|-------------|
| L-REG-1 | SCAN_FIRST | Before any complex logic, read registry + inverted-index. Executing blind = violation. |
| L-REG-2 | APPEND_ONLY | New files are appended to registry, never overwrite existing entries. History is truth. |
| L-REG-3 | CATEGORY_REQUIRED | Every entry MUST have category and linked_stages. Unclassified is a bug. |
| L-REG-4 | KEYWORD_SYNC | Registry keyword_hits must match inverted-index.json. Divergence = out-of-sync. Run `/dnaREGISTRY` to resync. |
| L-REG-5 | PATH_VERIFY | Death seal §11 must include registry digest path. RISE must verify path exists. |

---

## GAP POLICY

| Failure | Action |
|---------|--------|
| Registry dir missing | Write `REGISTRY_DIR_GAP`, continue. DEATH creates it. |
| Zero entries found | Write `REGISTRY_EMPTY_GAP`, continue. Scan roots are wrong. |
| Inverted-index missing | Write `SOULKEYS_GAP`, run `/soulkeys` first, then re-run `/dnaREGISTRY`. |
| JSON write fails | Write `REGISTRY_WRITE_GAP`, continue. Next DEATH retries. |

---

`dnaREGISTRY v1.0: FULL TREE SCAN + INVERTED-INDEX CROSS-REF + CATEGORY CLASSIFICATION + RISE/DEATH INTEGRATION + 5 LAWS.`
