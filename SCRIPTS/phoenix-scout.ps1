<#
  PhoenixScout.ps1 — flag-and-tag only. No AI. No pipeline. No processing.
  Lenses: SOUL | LEDGER | DRIFT | CONFIG | GAP | VAULT | KEYWORD | PIPELINE | all
  Per canonical /PhoenixScout spec.
#>
param(
  [string]$Zone = "",
  [string[]]$Exclude = @(),
  [ValidateSet("all","SOUL","LEDGER","DRIFT","CONFIG","GAP","VAULT","KEYWORD","PIPELINE")] [string]$Lens = "all"
)

$repo   = "D:\OB-1-CANONICAL"
$ts     = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = Join-Path $repo "OPERATIONS\phoenix-scout-$ts.jsonl"
$learnedPath = Join-Path $repo "OPERATIONS\phetrail-scout-learned-$ts.md"

# ── Phase 0 — Zone Select ─────────────────────────────────────────────────────
if (-not $Zone) {
    Write-Host "Which zone? CANON/ | HEAVY-LEDGER/ | REINCARNATION/ | SOUL-SEGMENTS/ | OPERATIONS/ | APPS/ | .kilo/"
    exit 1
}
Write-Host "SCOUT -> $Zone — scanning"

# ── Helpers ──────────────────────────────────────────────────────────────────
$MAX_PER_FILE = 500
$finds = [System.Collections.ArrayList]::new()
$learnedRules = [System.Collections.ArrayList]::new()

function Add-Flag {
    param([string]$Priority,[string]$Type,[string]$Status,[string]$File,[int]$Line,[string]$Excerpt,[long]$Bytes,[string]$Reason,[string]$Learned,[string]$Next)
    [void]$finds.Add([pscustomobject]@{
        scout_id = "SC-$ts-" + $finds.Count
        priority = $Priority; type = $Type; status = $Status
        file = $File; line = $Line; bytes = $Bytes
        excerpt = $Excerpt.Substring(0, [Math]::Min(120, $Excerpt.Length))
        reason = $Reason
        learned = $Learned
        next = $Next })
}

function Add-Learned {
    param([string]$Context,[string]$Rule)
    [void]$learnedRules.Add([pscustomobject]@{ context=$Context; rule=$Rule; timestamp=$ts })
}

function Out-Learned {
    param([string]$Path)
    if ($learnedRules.Count -eq 0) { return }
    $lines = @("# Phetrail Scout Learned — $ts", "")
    foreach ($r in $learnedRules) {
        $lines += "- [$($r.context)] $($r.rule)"
    }
    $lines += ""
    $lines | Out-File $Path -Encoding UTF8
}

# ── PULSE CHECK ──────────────────────────────────────────────────────────────
$pulseFlags = @()
$realHead = git -C $repo log -1 --format='%H' 2>$null | Out-String
$realHead = $realHead.Trim()
$bootPath = Join-Path $repo "CANON\SYSTEM\COLD-START-BOOT.md"
if (-not $realHead) {
    $pulseFlags += "GIT_UNREACHABLE"
} else {
    $gitStatus = git -C $repo status --porcelain 2>$null | Out-String
    if ($gitStatus.Trim()) { $pulseFlags += "GIT_DIRTY" }
    if (Test-Path $bootPath) {
        $bootRaw = Get-Content $bootPath -Raw -ErrorAction SilentlyContinue
        if ($bootRaw -match 'HEAD\s+([0-9a-f]{7,40})\b') {
            $bootHead = $matches[1]
            if ($bootHead -ne $realHead) {
                Add-Flag -Priority P1 -Type DRIFT -Status STALE -File "CANON/SYSTEM/COLD-START-BOOT.md" -Line 1 -Bytes $bootRaw.Length -Excerpt "$bootHead != $realHead" -Reason "HEAD mismatch: BOOT references stale SHA" -Learned "Scout pulses BOOT HEAD on every scan — drift is a pheromone, not cleanup." -Next "Update COLD-START-BOOT HEAD to current git SHA"
                Add-Learned "PHOENIX-SCOUT" "Always pulse BOOT HEAD against git HEAD; mismatch = P1 drift."
            }
        }
    }
}

# ── Zone Resolution ──────────────────────────────────────────────────────────
$target = if ($Zone.StartsWith("D:")) { $Zone } else { Join-Path $repo $Zone }
$excludedDirs = @("node_modules",".git","CANON\REINCARNATION","CANON\SOUL-SEGMENTS","CANON\SOUL-DNA-BIBLE","CANON\HEAVY-LEDGER","CANON\STARMAP","CANON\SOUL-KEYWORDS","CANON\PIPELINE","CANON\TRAIN-67")
$files = Get-ChildItem $target -Recurse -File -ErrorAction SilentlyContinue
$exCount = 0
if ($files) {
    $files = @($files | Where-Object {
        $full = $_.FullName
        if ($Exclude | Where-Object { $full -match $_ }) { $exCount++; $false }
        elseif ($excludedDirs | Where-Object { $full -match [regex]::Escape($_) }) { $exCount++; $false }
        else { $true }
    })
} else { $files = @() }
Write-Host "SCOUT -> $target  (files=$($files.Count)  excluded=$exCount)"

# ── Phase 1 — Scan ───────────────────────────────────────────────────────────
foreach ($f in $files) {
    $rel   = $f.FullName.Replace("$repo\", "")
    $raw   = try { Get-Content $f.FullName -Raw -ErrorAction Stop } catch { continue }
    if (-not $raw) { continue }
    $lines = $raw -split "`n"
    $head  = ($lines[0..([Math]::Min(19, $lines.Count - 1))] -join "`n")
    $bytes = $f.Length
    $fileFlags = 0

    # SOUL
    if ($Lens -in "all","SOUL") {
        if ($fileFlags -ge $MAX_PER_FILE) { continue }
        if ($head -match "UNTOUCHED|UNMINED|DO NOT EDIT") {
            $excerpt = $head.Substring(0, [Math]::Min(120, $head.Length)).Replace('"', "'")
            Add-Flag -Priority P2 -Type SOUL -Status UNTOUCHED -File $rel -Line 1 -Bytes $bytes -Excerpt $excerpt -Reason "File marked UNTOUCHED/UNMINED — raw soul never processed" -Learned "Zone contains untouched source material — route to /api/soul/event extraction." -Next "Strip agent text and POST /api/soul/event as sov100 user"
            $fileFlags++
        }
        foreach ($qm in [regex]::Matches($raw, '^>\s+', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            if ($fileFlags -ge $MAX_PER_FILE) { break }
            $lineEnd = $raw.IndexOf("`n", $qm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $quoteLine = $raw.Substring($qm.Index, $lineEnd - $qm.Index).Trim()
            if ($quoteLine.Length -le 3) { continue }
            if ($quoteLine -match '^(#{1,6})\s') { continue }
            if ($quoteLine -match '^(=+|-{4,}|———)') { continue }
            $ctx = $quoteLine.Substring(0, [Math]::Min(120, $quoteLine.Length))
            Add-Flag -Priority P2 -Type SOUL -Status UNMINED -File $rel -Line (($raw.Substring(0,$qm.Index) -split "`n").Count) -Bytes $bytes -Excerpt $ctx -Reason "Verbatim blockquote — unobstructed view; not ingested to D1" -Learned "Blockquote detected outside tracked extraction pipeline." -Next "Route through /api/soul/extract"
            $fileFlags++
        }
        foreach ($tm in [regex]::Matches($raw, '"text":\s*"', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            if ($fileFlags -ge $MAX_PER_FILE) { break }
            $lineEnd = $raw.IndexOf("`n", $tm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $textLine = $raw.Substring($tm.Index, $lineEnd - $tm.Index).Trim()
            if ($textLine.Length -le 10) { continue }
            Add-Flag -Priority P2 -Type SOUL -Status UNMINED -File $rel -Line (($raw.Substring(0,$tm.Index) -split "`n").Count) -Bytes $bytes -Excerpt $textLine.Substring(0, [Math]::Min(120, $textLine.Length)) -Reason "JSONL text field — verbatim segments can be ingested to D1" -Learned "JSONL contains raw text that bypasses normal blockquote ingestion." -Next "Parse JSONL and POST /api/soul/event"
            $fileFlags++
        }
        foreach ($tm in [regex]::Matches($raw, '^\[(\d{1,2}:\d{2})\]\s+([A-Z][A-Z\s]+:|\w+:)', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            if ($fileFlags -ge $MAX_PER_FILE) { break }
            $lineEnd = $raw.IndexOf("`n", $tm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $timeLine = $raw.Substring($tm.Index, $lineEnd - $tm.Index).Trim()
            if ($timeLine.Length -le 5) { continue }
            Add-Flag -Priority P2 -Type SOUL -Status UNMINED -File $rel -Line (($raw.Substring(0,$tm.Index) -split "`n").Count) -Bytes $bytes -Excerpt $timeLine.Substring(0, [Math]::Min(120, $timeLine.Length)) -Reason "Timestamped log entry — raw conversation line not ingested to D1" -Learned "Timestamped transcript lines require speaker stripping before ingestion." -Next "Strip agent text and POST /api/soul/event as sov100 user"
            $fileFlags++
        }
    }

    # LEDGER
    if ($Lens -in "all","LEDGER") {
        if ($f.Name -eq "PIPELINE-CURSOR.md") {
            $days = [math]::Round(((Get-Date) - $f.LastWriteTime).TotalDays)
            if ($days -gt 365) {
                Add-Flag -Priority P1 -Type LEDGER -Status FROZEN -File $rel -Line 1 -Bytes $bytes -Excerpt "FROZEN $days days — pipeline abandoned" -Reason "PIPELINE-CURSOR.md frozen > 1 year — pipeline abandoned" -Learned "Cursor frozen beyond recovery — full pipeline reset required." -Next "Rewrite cursor from scratch"
            } elseif ($days -gt 30) {
                Add-Flag -Priority P2 -Type LEDGER -Status FROZEN -File $rel -Line 1 -Bytes $bytes -Excerpt "Last modified $($f.LastWriteTime.ToString('yyyy-MM-dd')) — $days days ago" -Reason "PIPELINE-CURSOR.md frozen $days days — needs update" -Learned "Cursor stale but recoverable — update run pointer." -Next "Update PIPELINE-CURSOR.md to current run"
            }
        }
        if ($f.Extension -eq ".json" -and $raw -notmatch '"no_fabrication"') {
            Add-Flag -Priority P2 -Type LEDGER -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt $head.Substring(0,[Math]::Min(120,$head.Length)) -Reason "JSON file without no_fabrication attestation" -Learned "Attestation missing — provenance unverifiable." -Next "Add no_fabrication field or verify provenance"
        }
        if ($rel -match 'HEAVY-LEDGER') {
            $present = @()
            foreach ($m in [regex]::Matches($raw, 'HL-(\d+)')) { $present += [int]$matches[1] }
            if ($present.Count -gt 0) {
                $max = $present | Measure-Object -Maximum | Select-Object -ExpandProperty Maximum
                $expected = 1..$max
                $missing = $expected | Where-Object { $_ -notin $present }
                foreach ($miss in $missing) {
                    Add-Flag -Priority P1 -Type LEDGER -Status PHANTOM -File $rel -Line 1 -Bytes $bytes -Excerpt "HL-$miss missing" -Reason "Phantom HL-ID gap in ledger" -Learned "Ledger IDs must be contiguous — gaps indicate missing runs or corruption." -Next "Create HL-$miss.json or rerun pipeline"
                }
            }
        }
    }

    # DRIFT
    if ($Lens -in "all","DRIFT") {
        if ($realHead) {
            foreach ($m in [regex]::Matches($raw, 'HEAD\s+([0-9a-f]{7,40})\b')) {
                $candidate = $m.Groups[1].Value
                if ($candidate -eq $realHead) { continue }
                $ctxStart = [Math]::Max(0, $m.Index - 120)
                $ctxEnd   = [Math]::Min($raw.Length, $m.Index + 120)
                $ctx = $raw.Substring($ctxStart, $ctxEnd - $ctxStart).ToLower()
                $isDocumentation = $ctx -match 'verified against|verified at|as of|timestamp|blueprint|run\d{3}|historical|audit|no bullshit|does not replace|augments'
                if ($isDocumentation) { continue }
                Add-Flag -Priority P1 -Type DRIFT -Status STALE -File $rel -Line (($raw.Substring(0,$m.Index) -split "`n").Count) -Bytes $bytes -Excerpt "$candidate != $realHead" -Reason "HEAD reference mismatch" -Learned "HEAD references rot quickly — always cross-check git HEAD." -Next "Update to current git HEAD"
            }
        }
        if ($f.Name -eq "COLD-START-BOOT.md") {
            $fpM = [regex]::Match($raw, 'FINGERPRINT[:\s]+([0-9a-f]{7,40})')
            if ($fpM.Success -and $realHead) {
                $bootFP = $fpM.Groups[1].Value
                $diffCnt = [int](git -C $repo rev-list --count "$bootFP..$realHead" 2>$null | Out-String).Trim()
                if ($diffCnt -gt 2) {
                    Add-Flag -Priority P1 -Type DRIFT -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt "FINGERPRINT $bootFP is $diffCnt runs behind $realHead" -Reason "COLD-START-BOOT stale" -Learned "Boot fingerprint >2 behind = hard drift." -Next "Update COLD-START-BOOT.md to current HEAD"
                }
            }
        }
        foreach ($m in [regex]::Matches($raw, 'deepseek-chat|deepseek-reasoner')) {
            $ctxStart = [Math]::Max(0, $m.Index - 120)
            $ctxEnd   = [Math]::Min($raw.Length, $m.Index + 120)
            $ctx = $raw.Substring($ctxStart, $ctxEnd - $ctxStart).ToLower()
            if ($ctx -match 'retired|audit|status report|t392|canonical model ids|no longer|spec|patterns|lens|flag') { continue }
            $l = $m.Index; $ctx = $raw.Substring([Math]::Max(0,$l-40), [Math]::Min(120, $raw.Length - [Math]::Max(0,$l-40)))
            Add-Flag -Priority P1 -Type DRIFT -Status STALE -File $rel -Line (($raw.Substring(0,$l) -split "`n").Count) -Bytes $bytes -Excerpt $ctx.Trim() -Reason "Retired alias (T392)" -Learned "Retired aliases in code break downstream routing." -Next "Replace with deepseek-v4-flash or deepseek-v4-pro"
        }
        foreach ($m in [regex]::Matches($raw, 'mrmichaelhobbs1234')) {
            $ctxStart = [Math]::Max(0, $m.Index - 120)
            $ctxEnd   = [Math]::Min($raw.Length, $m.Index + 120)
            $ctx = $raw.Substring($ctxStart, $ctxEnd - $ctxStart)
            if ($ctx -match 'legacy|historical|former|old|previous') { continue }
            Add-Flag -Priority P2 -Type DRIFT -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt "mrmichaelhobbs1234" -Reason "Legacy operator domain" -Learned "Legacy domain affects auth endpoints and exposed links." -Next "Replace with mrmichaelhobbs123"
        }
    }

    # CONFIG
    if ($Lens -in "all","CONFIG") {
        if ($f.Name -match '^AGENT.*\.md$' -and $raw -notmatch 'model:') {
            Add-Flag -Priority P2 -Type CONFIG -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt $head.Substring(0,[Math]::Min(120,$head.Length)) -Reason "Agent file missing model field" -Learned "Agent without model binding silently falls back to defaults — dangerous for tier routing." -Next "Add model: provider/model to frontmatter"
        }
        if ($f.DirectoryName -match '\\command\\' -and $f.Extension -eq '.md' -and $raw -notmatch 'description:') {
            Add-Flag -Priority P3 -Type CONFIG -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt $head.Substring(0,[Math]::Min(120,$head.Length)) -Reason "Command file missing description field in frontmatter" -Learned "Command without description is invisible to fieldguide and routing." -Next "Add description: field to frontmatter"
        }
    }

    # GAP
    if ($Lens -in "all","GAP") {
        $refs = @{}
        [regex]::Matches($raw, '`[A-Za-z0-9_\-/\\\.*?]+`') | ForEach-Object { $refs[$_.Value] = $true }
        [regex]::Matches($raw, '"[A-Za-z0-9_\-/\\\.*?]+\.(md|json|ps1|txt|yml|toml|js|csv|yaml)"') | ForEach-Object { $refs[$_.Value] = $true }
        foreach ($r in $refs.Keys) {
            $c = ($r.Trim('"').Trim('`').Trim('<').Trim('>').Trim('\').Trim('|').Trim())
            if ($c -match '[\*?]') { continue }
            if ($c -match '\.(md|json|ps1|txt|yml|toml|js|csv|yaml)$') {
                $fullRef = if ($c.StartsWith("D:\") -or $c.StartsWith("/")) { $c } else { Join-Path $repo $c }
                try {
                    if (-not (Test-Path $fullRef -PathType Leaf)) {
                        Add-Flag -Priority P2 -Type GAP -Status ORPHAN -File $rel -Line 1 -Bytes $bytes -Excerpt $c -Reason "Referenced file not on disk" -Learned "Cross-reference broken — path may have moved or been renamed." -Next "Create file or remove reference"
                    }
                } catch {
                    # Skip references outside repo base; they are not actionable GAPs
                }
            }
        }
    }

    # VAULT
    if ($Lens -in "all","VAULT") {
        if ($f.PSIsContainer -and $f.Name -match 'VAULT-') {
            $vaultFiles = Get-ChildItem $f.FullName -Recurse -File -ErrorAction SilentlyContinue
            if ($vaultFiles.Count -eq 0) {
                Add-Flag -Priority P1 -Type VAULT -Status UNMINED -File $rel -Line 1 -Bytes $bytes -Excerpt "VAULT directory empty" -Reason "Vault present but contains no mined data" -Learned "Vault created but never populated — immortality workflow incomplete." -Next "Run Phoenix-Rise-Immortalize to fill vault"
            } else {
                $unmined = @($vaultFiles | Where-Object { $_.Extension -match '\.(md|txt|json)$' -and $_.Length -gt 0 })
                if ($unmined.Count -gt 0) {
                    Add-Flag -Priority P2 -Type VAULT -Status UNMINED -File $rel -Line 1 -Bytes $bytes -Excerpt "$($unmined.Count) files" -Reason "Vault contains raw unprocessed data" -Learned "Vault data exists but not indexed into SOUL-DNA-BIBLE or keyword map." -Next "Run /api/soul/skeleton and build inverted-index.json"
                }
            }
        }
    }

    # KEYWORD
    if ($Lens -in "all","KEYWORD") {
        if ($rel -match '^CANON\\SOUL-KEYWORDS\\') {
            if ($f.Name -eq 'inverted-index.json' -and $raw -notmatch '"terms"') {
                Add-Flag -Priority P2 -Type KEYWORD -Status STALE -File $rel -Line 1 -Bytes $bytes -Excerpt "inverted-index present but missing terms" -Reason "Keyword index incomplete or corrupt" -Learned "Inverted index without terms cannot route blueprints." -Next "Rebuild inverted-index.json from rfkw-run*.txt"
            }
        }
    }
}

# PIPELINE
if ($Lens -in "all","PIPELINE") {
    $pipeDir = Join-Path $repo "CANON\PIPELINE"
    if (-not (Test-Path $pipeDir)) {
        Add-Flag -Priority P1 -Type PIPELINE -Status PHANTOM -File "CANON/PIPELINE/" -Line 1 -Bytes 0 -Excerpt "CANON/PIPELINE missing" -Reason "Pipeline directory missing — chain has never completed" -Learned "No pipeline artifacts means DEATH Stage 7 never ran." -Next "Create CANON/PIPELINE and run /reincarnateDeath Step 7"
    } else {
        $pFiles = Get-ChildItem $pipeDir -Recurse -File -ErrorAction SilentlyContinue
        if ($pFiles.Count -eq 0) {
            Add-Flag -Priority P1 -Type PIPELINE -Status PHANTOM -File "CANON/PIPELINE/" -Line 1 -Bytes 0 -Excerpt "CANON/PIPELINE empty" -Reason "No pipeline-run artifacts" -Learned "Empty pipeline dir = chain dead." -Next "Run /reincarnateDeath Step 7"
        } else {
            foreach ($pf in $pFiles) {
                if ($pf.Name -match 'pipeline-run.*\.json') {
                    try {
                        $pData = Get-Content $pf.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
                        if ($pData.result -ne "COMPLETE") {
                            Add-Flag -Priority P1 -Type PIPELINE -Status STALE -File $pf.FullName.Replace("$repo\", "") -Line 1 -Bytes $pf.Length -Excerpt "result=$($pData.result)" -Reason "Pipeline run incomplete — chain broken" -Learned "Incomplete pipeline run indicates stage failure mid-chain." -Next "Re-run DEATH for run $($pData.run_number)"
                        }
                    } catch {
                        Add-Flag -Priority P2 -Type PIPELINE -Status STALE -File $pf.FullName.Replace("$repo\", "") -Line 1 -Bytes $pf.Length -Excerpt "Unreadable pipeline artifact" -Reason "Chain provenance unverifiable" -Learned "Corrupt pipeline JSON cannot be ingested by RISE." -Next "Regenerate or validate pipeline artifact"
                    }
                }
            }
        }
    }
}

# ══════════════════════════════════════════════════════════════════════════════
# Phase 3 — Write JSONL + learned phetrails
# ══════════════════════════════════════════════════════════════════════════════
if ($finds.Count -gt 0) {
    foreach ($rec in $finds) { ($rec | ConvertTo-Json -Compress -Depth 3) | Out-File $report -Append -Encoding UTF8 }
} else { '[ ]' | Out-File $report -Encoding UTF8 }

Out-Learned $learnedPath

# ══════════════════════════════════════════════════════════════════════════════
# Phase 4 — Summary
# ══════════════════════════════════════════════════════════════════════════════
$p1=0; $p2=0; $p3=0; $soul=0; $led=0; $drft=0; $cfg=0; $gap=0; $vault=0; $kw=0; $pipe=0
foreach ($rec in $finds) {
    if ($rec.priority -eq "P1") { $p1++ } elseif ($rec.priority -eq "P2") { $p2++ } else { $p3++ }
    switch ($rec.type) {
        "SOUL"    { $soul++ }
        "LEDGER"  { $led++ }
        "DRIFT"   { $drft++ }
        "CONFIG"  { $cfg++ }
        "GAP"     { $gap++ }
        "VAULT"   { $vault++ }
        "KEYWORD" { $kw++ }
        "PIPELINE"{ $pipe++ }
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "PHOENIX SCOUT — $target   (lens=$Lens)"
Write-Host "============================================"
Write-Host "ZONE:          $target"
Write-Host "FILES:         $($files.Count)"
Write-Host "FINDS:         $($finds.Count)"
Write-Host "  P1 CRITICAL: $p1"
Write-Host "  P2 HIGH:     $p2"
Write-Host "  P3 MEDIUM:   $p3"
Write-Host "BREAKDOWN:"
Write-Host "  SOUL:     $soul"
Write-Host "  LEDGER:   $led"
Write-Host "  DRIFT:    $drft"
Write-Host "  CONFIG:   $cfg"
Write-Host "  GAP:      $gap"
Write-Host "  VAULT:    $vault"
Write-Host "  KEYWORD:  $kw"
Write-Host "  PIPELINE: $pipe"
Write-Host "REPORT: $report"
if ($learnedRules.Count -gt 0) { Write-Host "LEARNED: $learnedPath" }
Write-Host "============================================"
Write-Host "SCOUT COMPLETE. Flagged items ready for tier dispatch."
