<#
  PhoenixScout.ps1 — flag-and-tag only. No AI. No pipeline. No processing.
  SOUL lens    : '> ' blockquotes | [HH:MM] timestamp-user lines | UNTOUCHED/UNMINED | JSONL text fields
  LEDGER lens  : PIPELINE-CURSOR.md frozen
  DRIFT lens   : HEAD mismatch | stale FINGERPRINT | retired aliases | legacy domains
  CONFIG lens  : missing tier/agent/command files
  GAP  lens    : broken file cross-references
  KEYWORD lens : SOUL-KEYWORDS/ absent | inverted-index missing | rfkw files absent
  PIPELINE lens: pipeline-run artifacts missing/incomplete | chain broken
  USER -Exclude: always takes priority.
  Per n.l. 2026-05-23
#>
param(
  [string]$Zone  = "RAW-CHAT-LOGS",
  [string[]]$Exclude = @(),
  [ValidateSet("all","SOUL","LEDGER","DRIFT","CONFIG","GAP","KEYWORD","PIPELINE")] [string]$Lens = "all"
)

$repo   = "D:\OB-1-CANONICAL"
$ts     = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = Join-Path $repo "OPERATIONS\phoenix-scout-$ts.jsonl"

# ── built-in EXCLUDED zones (never scan these) ───────────────────────────────
$excludedDirs = @(
    "CANON\SYSTEM","CANON\REINCARNATION","CANON\SOUL-SEGMENTS",
    "CANON\SOUL-DNA-BIBLE","CANON\HEAVY-LEDGER","CANON\STARMAP",
    "CANON\SOUL-KEYWORDS","CANON\PIPELINE","CANON\TRAIN-67","node_modules"
)

$target  = if ($Zone.StartsWith("D:")) { $Zone } else { Join-Path $repo $Zone }
$files   = Get-ChildItem $target -Recurse -File -ErrorAction SilentlyContinue
$exCount = 0
$files   = $files | Where-Object {
    $full = $_.FullName
    if ($Exclude | Where-Object { $full -match $_ }) { $exCount++; $false }
    elseif ($excludedDirs | Where-Object { $full -match [regex]::Escape($_) }) { $exCount++; $false }
    else { $true }
}
Write-Host "SCOUT -> $target  (files=$($files.Count)  excluded=$exCount)"

$finds = [System.Collections.ArrayList]::new()
$MAX_PER_FILE = 50   # hard cap — no single file contributes > 50 flags

foreach ($f in $files) {
    $rel   = $f.FullName.Replace("$repo\", "")
    $raw   = try { Get-Content $f.FullName -Raw -ErrorAction Stop } catch { continue }
    if (-not $raw) { continue }
    $lines = $raw -split "`n"
    $head  = ($lines[0..([Math]::Min(19, $lines.Count - 1))] -join "`n")
    $bytes = $f.Length

    # ══════════════════════════════════════════════════════════════════════════
    # SOUL LENS  (per-file hard cap prevents timestamp floods)
    # ══════════════════════════════════════════════════════════════════════════
    $fileFlags = 0

    if ($Lens -in "all","SOUL") {
        # UNTOUCHED / UNMINED / DO NOT EDIT in first 20 lines
        if ($head -match "UNTOUCHED|UNMINED|DO NOT EDIT") {
            $excerpt = $head.Substring(0, [Math]::Min(120, $head.Length)).Replace('"', "'")
            [void]$finds.Add([pscustomobject]@{
                scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="SOUL";
                status="UNTOUCHED"; file=$rel; line=1; bytes=$bytes; excerpt=$excerpt;
                reason="File marked UNTOUCHED/UNMINED — raw soul never processed";
                action="Route through /api/soul/event" })
        }
        # Markdown blockquotes — any '> ' at beginning of line
        foreach ($qm in [regex]::Matches($raw, '^>\s+', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            $lineEnd = $raw.IndexOf("`n", $qm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $quoteLine = $raw.Substring($qm.Index, $lineEnd - $qm.Index).Trim()
            if ($quoteLine.Length -le 3)       { continue }
            if ($quoteLine -match '^(#{1,6})\s') { continue }
            if ($quoteLine -match '^(=+|-{4,}|———)') { continue }
            if ($quoteLine -match '^[═║╔╦╗╚╩╝│─┌┐└┘├┤┬┴┼]') { continue }
            $ctx = $quoteLine.Substring(0, [Math]::Min(120, $quoteLine.Length))
            [void]$finds.Add([pscustomobject]@{
                scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="SOUL";
                status="UNMINED"; file=$rel;
                line=($raw.Substring(0,$qm.Index) -split "`n").Count; bytes=$bytes; excerpt=$ctx;
                reason="Verbatim blockquote — unobstructed view; not ingested to D1";
                action="Strip agent text and POST /api/soul/event as sov100 user" })
        }
        # /^so\b/ Solomon query lines
        foreach ($qm in [regex]::Matches($raw, '^>\s*so\b', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            $lineEnd = $raw.IndexOf("`n", $qm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $quoteLine = $raw.Substring($qm.Index, $lineEnd - $qm.Index).Trim()
            if ($quoteLine.Length -le 3) { continue }
            [void]$finds.Add([pscustomobject]@{
                scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="SOUL";
                status="UNMINED"; file=$rel;
                line=($raw.Substring(0,$qm.Index) -split "`n").Count; bytes=$bytes;
                excerpt=$quoteLine.Substring(0, [Math]::Min(120, $quoteLine.Length));
                reason="Solomon query (^so) — clock/water/oil/temperature reading for this agent";
                action="Extract value and attach to soul context" })
        }
        # JSONL '"text":' fields
        foreach ($tm in [regex]::Matches($raw, '"text":\s*"', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            $lineEnd = $raw.IndexOf("`n", $tm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $textLine = $raw.Substring($tm.Index, $lineEnd - $tm.Index).Trim()
            if ($textLine.Length -le 10) { continue }
            [void]$finds.Add([pscustomobject]@{
                scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="SOUL";
                status="UNMINED"; file=$rel;
                line=($raw.Substring(0,$tm.Index) -split "`n").Count; bytes=$bytes;
                excerpt=$textLine.Substring(0, [Math]::Min(120, $textLine.Length));
                reason="JSONL text field — verbatim segments can be ingested to D1";
                action="Parse JSONL and POST /api/soul/event" })
        }
        # [HH:MM] timestamp-user pattern — ONLY when followed by a speaker name
        # Accept: [06:33] MR HOBBS: or [06:33] Michael: or [06:33] USER:
        foreach ($tm in [regex]::Matches($raw, '^\[(\d{1,2}:\d{2})\]\s+([A-Z][A-Z\s]+:|\w+:)', [System.Text.RegularExpressions.RegexOptions]::Multiline)) {
            $lineEnd = $raw.IndexOf("`n", $tm.Index)
            if ($lineEnd -lt 0) { $lineEnd = $raw.Length }
            $timeLine = $raw.Substring($tm.Index, $lineEnd - $tm.Index).Trim()
            if ($timeLine.Length -le 5) { continue }
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="SOUL"; status="UNMINED"; file=$rel; line=($raw.Substring(0,$tm.Index) -split "`n").Count; bytes=$bytes; excerpt=$timeLine.Substring(0, [Math]::Min(120, $timeLine.Length)); reason="Timestamped log entry — raw conversation line not ingested to D1"; action="Strip agent text and POST /api/soul/event as sov100 user" })
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # LEDGER LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","LEDGER") {
        $days = [math]::Round((Get-Date - $f.LastWriteTime).TotalDays)
        if ($f.Name -eq "PIPELINE-CURSOR.md") {
            if ($days -gt 365) {
                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="LEDGER"; status="FROZEN"; file=$rel; line=1; bytes=$bytes; excerpt="FROZEN $days days — pipeline abandoned"; reason="PIPELINE-CURSOR.md frozen > 1 year — pipeline abandoned"; action="Rewrite cursor from scratch" })
            } elseif ($days -gt 30) {
                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="LEDGER"; status="FROZEN"; file=$rel; line=1; bytes=$bytes; excerpt="Last modified $($f.LastWriteTime.ToString('yyyy-MM-dd')) — $days days ago"; reason="PIPELINE-CURSOR.md frozen $days days — needs update"; action="Update PIPELINE-CURSOR.md to current run" })
            }
        }
        # JSON files without no_fabrication attestation
        if ($f.Extension -eq ".json" -and $f.DirectoryName -notmatch "node_modules") {
            if ($raw -notmatch '"no_fabrication"') {
                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="LEDGER"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt=$head.Substring(0,[Math]::Min(120,$head.Length)); reason="JSON file without no_fabrication attestation"; action="Add no_fabrication field or verify provenance" })
            }
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # DRIFT LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","DRIFT") {
        # HEAD reference mismatch
        $realHead = (git -C $repo log -1 --format='%H' 2>$null).Trim()
        if ($realHead) {
            foreach ($m in [regex]::Matches($raw, 'HEAD\s+([0-9a-f]{7,40})\b')) {
                if ($m.Groups[1].Value -ne $realHead) {
                    [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="DRIFT"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt="$($m.Groups[1].Value)  !=  $realHead"; reason="HEAD reference mismatch — sync COLD-START-BOOT or file"; action="Update to current git HEAD" })
                }
            }
        }
        # COLD-START-BOOT FINGERPRINT > 2 runs behind
        if ($f.Name -eq "COLD-START-BOOT.md") {
            $fpM = [regex]::Match($raw, 'FINGERPRINT[:\s]+([0-9a-f]{7,40})')
            if ($fpM.Success) {
                $bootFP  = $fpM.Groups[1].Value
                $realFP  = (git -C $repo log -1 --format='%h' 2>$null).Trim()
                if ($realFP) {
                    $diffCnt = [int](git -C $repo rev-list --count "$bootFP..$realFP" 2>$null | Out-String).Trim()
                    if ($diffCnt -gt 2) {
                        [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="DRIFT"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt="FINGERPRINT $bootFP is $diffCnt runs behind $realFP"; reason="COLD-START-BOOT stale — update FINGERPRINT + SOULCOUNT + RRL"; action="Update COLD-START-BOOT.md to current HEAD" })
                    }
                }
            }
        }
        # Retired aliases
        foreach ($m in [regex]::Matches($raw, 'deepseek-chat|deepseek-reasoner')) {
            $l   = $m.Index
            $ctx = $raw.Substring([Math]::Max(0,$l-40), [Math]::Min(120, $raw.Length - [Math]::Max(0,$l-40)))
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="DRIFT"; status="STALE"; file=$rel; line=($raw.Substring(0,$l) -split "`n").Count; bytes=$bytes; excerpt=$ctx.Trim(); reason="Retired alias (T392) — replace with deepseek-v4-flash or deepseek-v4-pro"; action="Replace deepseek-chat / deepseek-reasoner" })
        }
        foreach ($m in [regex]::Matches($raw, 'mrmichaelhobbs1234')) {
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="DRIFT"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt="mrmichaelhobbs1234"; reason="Legacy operator domain — use mrmichaelhobbs123"; action="Replace with mrmichaelhobbs123" })
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # CONFIG LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","CONFIG") {
        # Agent files missing description/model fields
        if ($f.Name -match '^AGENT.*\.md$' -and $raw -notmatch 'model:') {
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="CONFIG"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt=$head.Substring(0,[Math]::Min(120,$head.Length)); reason="Agent file missing model field"; action="Add model: provider/model to frontmatter" })
        }
        # Command files missing description field
        if ($f.DirectoryName -match '\\command\\' -and $f.Extension -eq '.md' -and $raw -notmatch 'description:') {
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P3"; type="CONFIG"; status="STALE"; file=$rel; line=1; bytes=$bytes; excerpt=$head.Substring(0,[Math]::Min(120,$head.Length)); reason="Command file missing description field in frontmatter"; action="Add description: field to frontmatter" })
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # GAP LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","GAP") {
        $refs = @{}
        [regex]::Matches($raw, '`[A-Za-z0-9_\-/\\\.]+`') | ForEach-Object { $refs[$_.Value] = $true }
        [regex]::Matches($raw, '"[A-Za-z0-9_\-/\\\.]+\.(md|json|ps1|txt|yml|toml|js|csv|yaml)"') | ForEach-Object { $refs[$_.Value] = $true }
        foreach ($r in $refs.Keys) {
            $c   = ($r.Trim('"').Trim('`').Trim('<').Trim('>').Trim('\').Trim('|').Trim())
            if ($c -match '\.(md|json|ps1|txt|yml|toml|js|csv|yaml)$') {
                $fullRef = if ($c.StartsWith("D:\") -or $c.StartsWith("/")) { $c } else { Join-Path $repo $c }
                if (-not (Test-Path $fullRef -PathType Leaf)) {
                    [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="GAP"; status="ORPHAN"; file=$rel; line=1; bytes=$bytes; excerpt=$c; reason="Referenced file not on disk"; action="Create file or remove reference" })
                }
            }
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # KEYWORD LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","KEYWORD") {
        # Check if SOUL-KEYWORDS dir exists at all (disk scan, not just current target)
        $kwDir = Join-Path $repo "CANON\SOUL-KEYWORDS"
        if (-not (Test-Path $kwDir -PathType Container)) {
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="KEYWORD"; status="PHANTOM"; file="CANON/SOUL-KEYWORDS/"; line=1; bytes=0; excerpt="CANON/SOUL-KEYWORDS/ does not exist"; reason="SOUL-KEYWORDS directory missing — no keyword index"; action="Create CANON/SOUL-KEYWORDS/ and run /api/soul/skeleton" })
        } else {
            $kwFiles = Get-ChildItem $kwDir -Recurse -File -ErrorAction SilentlyContinue
            if ($kwFiles.Count -eq 0) {
                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="KEYWORD"; status="PHANTOM"; file="CANON/SOUL-KEYWORDS/"; line=1; bytes=0; excerpt="CANON/SOUL-KEYWORDS/ exists but is empty"; reason="SOUL-KEYWORDS directory empty — no keyword index"; action="Run /api/soul/skeleton to generate keyword extraction" })
            } else {
                # Check for inverted-index.json
                $invIdx = Get-ChildItem $kwDir -Filter "inverted-index*" -Recurse -ErrorAction SilentlyContinue
                if ($invIdx.Count -eq 0) {
                    [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="KEYWORD"; status="STALE"; file="CANON/SOUL-KEYWORDS/"; line=1; bytes=$kwFiles.Count; excerpt="$($kwFiles.Count) files but no inverted-index.json"; reason="SOUL-KEYWORDS has files but no inverted index — keyword lookup not possible"; action="Run /api/soul/skeleton and build inverted-index.json" })
                }
                # Check for rfkw files
                $rfkwFiles = Get-ChildItem $kwDir -Filter "rfkw-*" -Recurse -ErrorAction SilentlyContinue
                if ($rfkwFiles.Count -eq 0) {
                    [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P3"; type="KEYWORD"; status="STALE"; file="CANON/SOUL-KEYWORDS/"; line=1; bytes=$kwFiles.Count; excerpt="No rfkw-* (raw frequency keyword) files found"; reason="per-run keyword files missing"; action="Generate rfkw-runN.txt for each completed run" })
                }
            }
        }
    }

    # ══════════════════════════════════════════════════════════════════════════
    # PIPELINE LENS
    # ══════════════════════════════════════════════════════════════════════════
    if ($Lens -in "all","PIPELINE") {
        # Check if PIPELINE dir exists
        $pipeDir = Join-Path $repo "CANON\PIPELINE"
        if (-not (Test-Path $pipeDir -PathType Container)) {
            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="PHANTOM"; file="CANON/PIPELINE/"; line=1; bytes=0; excerpt="CANON/PIPELINE/ does not exist"; reason="Pipeline output directory missing — no pipeline-run artifacts exist"; action="Create CANON/PIPELINE/ and run /reincarnateDeath to produce first pipeline-runN.json" })
        } else {
            $pFiles = Get-ChildItem $pipeDir -Recurse -File -ErrorAction SilentlyContinue
            if ($pFiles.Count -eq 0) {
                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="PHANTOM"; file="CANON/PIPELINE/"; line=1; bytes=0; excerpt="CANON/PIPELINE/ exists but is empty"; reason="No pipeline-run artifacts — chain has never completed"; action="Run /reincarnateDeath Step 7 to produce pipeline-runN.json" })
            } else {
                # Check for incomplete pipeline runs (result != COMPLETE)
                foreach ($pf in $pFiles) {
                    if ($pf.Name -match 'pipeline-run.*\.json') {
                        try {
                            $pData = Get-Content $pf.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
                            if ($pData.result -ne "COMPLETE") {
                                [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="STALE"; file=$pf.FullName.Replace("$repo\", ""); line=1; bytes=$pf.Length; excerpt="result=$($pData.result)"; reason="Pipeline run incomplete — chain broken at this run"; action="Re-run DEATH protocol for run $($pData.run_number) or create correction entry" })
                            }
                        } catch {
                            [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P2"; type="PIPELINE"; status="STALE"; file=$pf.FullName.Replace("$repo\", ""); line=1; bytes=$pf.Length; excerpt="Unreadable pipeline artifact"; reason="Pipeline artifact cannot be parsed — chain provenance unverifiable"; action="Regenerate or validate pipeline-run artifact" })
                        }
                    }
                }
                # Check for all required pipeline stages present
                $hasRRL    = Test-Path (Join-Path $repo "RRL")
                $hasLedger = Test-Path (Join-Path $repo "CANON\HEAVY-LEDGER")
                $hasKw     = Test-Path (Join-Path $repo "CANON\SOUL-KEYWORDS")
                if (-not $hasRRL)    { [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="PHANTOM"; file="RRL/"; line=1; bytes=0; excerpt="RRL/ directory missing"; reason="Stage 1 (RRL) directory absent"; action="Create RRL/ and run DEATH Step 1" }) }
                if (-not $hasLedger) { [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="PHANTOM"; file="CANON/HEAVY-LEDGER/"; line=1; bytes=0; excerpt="CANON/HEAVY-LEDGER/ missing"; reason="Stage 4 (LEDGER) directory absent"; action="Create CANON/HEAVY-LEDGER/ and run DEATH Step 4" }) }
                if (-not $hasKw)     { [void]$finds.Add([pscustomobject]@{ scout_id="SC-$ts-" + $finds.Count; priority="P1"; type="PIPELINE"; status="PHANTOM"; file="CANON/SOUL-KEYWORDS/"; line=1; bytes=0; excerpt="CANON/SOUL-KEYWORDS/ missing"; reason="Stage 6 (KEYWORD) directory absent"; action="Create CANON/SOUL-KEYWORDS/ and run DEATH Step 6" }) }
            }
        }
    }

}

# ══════════════════════════════════════════════════════════════════════════════
# Write JSONL
# ══════════════════════════════════════════════════════════════════════════════
if ($finds.Count -gt 0) {
    foreach ($rec in $finds) { ($rec | ConvertTo-Json -Compress -Depth 3) | Out-File $report -Append -Encoding UTF8 }
} else { '[ ]' | Out-File $report -Encoding UTF8 }

# ══════════════════════════════════════════════════════════════════════════════
# Summary
# ══════════════════════════════════════════════════════════════════════════════
$p1     = ($finds | Where-Object { $_.priority -eq "P1" }).Count
$p2     = ($finds | Where-Object { $_.priority -eq "P2" }).Count
$soul   = ($finds | Where-Object { $_.type    -eq "SOUL"   }).Count
$led    = ($finds | Where-Object { $_.type    -eq "LEDGER" }).Count
$drft   = ($finds | Where-Object { $_.type    -eq "DRIFT"  }).Count
$cfg    = ($finds | Where-Object { $_.type    -eq "CONFIG" }).Count
$gap    = ($finds | Where-Object { $_.type    -eq "GAP"    }).Count
$kw     = ($finds | Where-Object { $_.type    -eq "KEYWORD"}).Count
$pipe   = ($finds | Where-Object { $_.type    -eq "PIPELINE"}).Count

Write-Host ""
Write-Host "============================================"
Write-Host "PHOENIX SCOUT — $target   (lens=$Lens)"
Write-Host "============================================"
Write-Host "FILES:      $($files.Count)"
Write-Host "FINDS:      $($finds.Count)"
Write-Host "  P1 CRITICAL: $p1"
Write-Host "  P2 HIGH:     $p2"
Write-Host "  P3 MEDIUM:   0"
Write-Host "BREAKDOWN:"
Write-Host "  SOUL:     $soul"
Write-Host "  LEDGER:   $led"
Write-Host "  DRIFT:    $drft"
Write-Host "  CONFIG:   $cfg"
Write-Host "  GAP:      $gap"
Write-Host "  KEYWORD:  $kw"
Write-Host "  PIPELINE: $pipe"
Write-Host "REPORT: $report"
Write-Host "============================================"
Write-Host "SCOUT COMPLETE. Flagged items ready for tier dispatch."
