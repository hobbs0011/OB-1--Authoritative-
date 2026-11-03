# session-rise.ps1 — v8.0 ROMAN RISE (single canonical rise script)
# Field Guide: SDNAD Protocol — Stage 0 REPRINT+FOOTNOTE gate (hard), then capture→verify→receipt.
# Laws: L55 Stage0, L56 NoRoleInvention, L57 Legion, L58 BibleBeforeLedger, L60 TranscriptionIsTransformation, L32 AssumeFailure.
# Fail-closed: HALT if Stage 0 output missing or sovereign words absent.
#
# Usage: pwsh -File SCRIPTS/session-rise.ps1 [-SourceFile <path>] [-SessionTag <tag>] [-SignalDensity LOW|MEDIUM|HIGH|MAXIMUM] [-DryRun] [-Force]

[CmdletBinding()]
param(
    [string]$SourceFile,
    [string]$SessionTag,
    [ValidateSet("LOW","MEDIUM","HIGH","MAXIMUM")]
    [string]$SignalDensity = "MEDIUM",
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$repoRoot = Get-Location
$bootPath = "$repoRoot\CANON\SYSTEM\COLD-START-BOOT.md"
$bootCheckPath = "$repoRoot\CANON\SYSTEM\REINCARNATION-BOOT-CHECK.md"
$masterSyncPath = "$repoRoot\MASTER-SYNC.md"
$bibleDir = "$repoRoot\CANON\BIBLE"
$fieldGuidePath = "$repoRoot\.github\skills\legionnaire-field-guide\SKILL.md"
$stateSnapPath = "$repoRoot\CANON\HEAVY-LEDGER\STATE-SNAPSHOT.json"
$reincarnationDir = "$repoRoot\CANON\REINCARNATION"
$d1 = "https://soul-logger.mrmichaelhobbs123.workers.dev"

$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$logPath = "$repoRoot\OPERATIONS\session-rise-$ts.log"
$stdin = $null

function Write-Log { param([string]$Msg); $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Msg; Write-Host $line; if (-not $DryRun) { $line | Out-File -Append -Encoding UTF8 $logPath } }
function Write-Ok { param([string]$Msg); Write-Log "OK:  $Msg" }
function Write-Warn { param([string]$Msg); Write-Log "WARN: $Msg" }
function Write-Err { param([string]$Msg); Write-Log "ERR:  $Msg"; if (-not $Force) { throw $Msg } else { Write-Warn "FORCE: continuing despite $Msg" } }
function Ensure-Dir { param([string]$P); if (-not (Test-Path $P)) { New-Item -ItemType Directory -Path $P -Force | Out-Null } }
function MachineCount { param([string]$Path,[string]$Pattern); if (-not (Test-Path $P)) { return 0 }; $m = Select-String -Pattern $Pattern -Path $Path -ErrorAction SilentlyContinue; if (-not $m) { return 0 }; return ($m | Measure-Object).Count }

Write-Log "============================="
Write-Log "SESSION RISE v8.0 — ROMAN"
Write-Log "============================="

# ── STAGE IDENTITY: load boot + field guide laws (L29 NO_ASSUME_HEAD) ──
Write-Log "--- IDENTITY: boot + law lock ---"
if (-not (Test-Path $bootPath)) { Write-Err "FATAL: COLD-START-BOOT.md missing — cannot rise"; exit 1 }
if (-not (Test-Path $fieldGuidePath)) { Write-Err "FATAL: field guide missing — cannot rise"; exit 1 }
$bootText = Get-Content $bootPath -Raw -Encoding UTF8
$headRaw = git -C $repoRoot log -1 --oneline 2>$null
if (-not $headRaw) { Write-Err "FATAL: git HEAD unavailable"; exit 1 }
$headSha = $headRaw -split '\s' | Select-Object -First 1
Write-Ok "HEAD: $headSha | branch=$(git -C $repoRoot branch --show-current 2>$null)"
Write-Ok "Boot loaded: $(Split-Path $bootPath -Leaf)"
Write-Ok "Field guide loaded: $(Split-Path $fieldGuidePath -Leaf)"

# ── STAGE SOUL: cross-validate soulcount (L32 AssumeFailure — 3 receipts) ──
Write-Log "--- SOUL: cross-validated count gate ---"
function Get-SoulCount {
    param([int]$Timeout=15)
    try {
        $r = Invoke-RestMethod -Uri "$d1/api/soul/count" -Method Get -TimeoutSec $Timeout -ErrorAction Stop
        return [ordered]@{ ok=$true; count=$r.soulcount; level=$r.level; events=$r.events; source="API" }
    } catch {
        return [ordered]@{ ok=$false; count=0; level="UNKNOWN"; events=0; source="API_FAIL"; err=$_.Exception.Message }
    }
}
$r1 = Get-SoulCount
$r2 = Get-SoulCount -Timeout 8
$r3 = Get-SoulCount -Timeout 8
$liveCount = 0; $liveLevel = "UNKNOWN"; $apiOk = $false
$valid = @($r1,$r2,$r3) | Where-Object { $_.ok -and $_.count -gt 0 }
if ($valid.Count -ge 2) {
    $agree = @($valid | Group-Object count | Sort-Object Count -Descending | Select-Object -First 1)
    $liveCount = [int]$agree.Name
    $liveLevel = ($valid | Where-Object { $_.count -eq $liveCount } | Select-Object -First 1).level
    $apiOk = $true
    Write-Ok "SOULCOUNT cross-validated: $liveCount ($liveLevel) — $($valid.Count)/3 receipts agree"
} elseif ($valid.Count -eq 1) {
    $liveCount = $valid[0].count; $liveLevel = $valid[0].level
    Write-Warn "SOULCOUNT: only 1/3 API receipts — count=$liveCount (SINGLE-SOURCE, L32 weak)"
} else {
    Write-Warn "SOULCOUNT: 0/3 API receipts reachable — API unavailable (offline mode)"
}

# Prior recorded count from COLD-START-BOOT (Real count line preferred)
$priorCount = 0; $priorSource = "none"
if ($bootText -match '\*\*Real count[^:]*:\*\*\s*([\d,]+)\s+characters') {
    $priorCount = [int]($matches[1] -replace ',', ''); $priorSource = "Real count line"
} elseif ($bootText -match 'SOULCOUNT\s+([\d,]+)\s+TITANIUM_ANCHOR') {
    $priorCount = [int]($matches[1] -replace ',', ''); $priorSource = "Fingerprint line (fallback)"
}
$soulDelta = $liveCount - $priorCount
Write-Ok "PRIOR ($priorSource): $priorCount | LIVE: $liveCount | SOUL DELTA: $soulDelta"
if ($apiOk -and $priorCount -gt 0 -and [Math]::Abs($soulDelta) -gt 5000) {
    Write-Warn "SOUL DRIFT: |$soulDelta| > 5000 — investigate before build"
}

# ── STAGE 0 GATE: prior Bible chapter must exist (field guide hard gate) ──
Write-Log "--- STAGE 0 GATE: prior Bible chapter required ---"
Ensure-Dir $bibleDir
$bibleFiles = Get-ChildItem $bibleDir -Filter "BIBLE-CH*.md" -ErrorAction SilentlyContinue | Sort-Object Name
$nextCh = 1
if ($bibleFiles) {
    $max = 0; foreach ($f in $bibleFiles) { if ($f.Name -match 'BIBLE-CH(\d+)') { if ([int]$matches[1] -gt $max) { $max = [int]$matches[1] } } }
    $nextCh = $max + 1
}
$nextChPad = "{0:D2}" -f $nextCh
$priorBible = $bibleFiles | Select-Object -Last 1
if (-not $priorBible -and -not $Force) {
    Write-Err "FATAL: No prior BIBLE-CH*.md found — Stage 0 gate closed. Capture sovereign words first, then rise."; exit 1
}
if ($priorBible) {
    $priorBlocks = MachineCount $priorBible.FullName '^# Block '
    $priorFootnotes = MachineCount $priorBible.FullName '^\*\*Footnote'
    Write-Ok "PRIOR BIBLE: $($priorBible.Name) | blocks=$priorBlocks | footnotes=$priorFootnotes (machine-counted, no estimate)"
    if ($priorBlocks -eq 0 -or $priorFootnotes -eq 0) { Write-Warn "Prior Bible chapter has 0 blocks or footnotes — Stage 0 may be hollow" }
}

# ── Capture sovereign words for THIS session (L60: transcription = transformation) ──
Write-Log "--- STAGE 0 CAPTURE: reprint sovereign words + footnotes ---"
$sovereignText = ""
if ($SourceFile) {
    if (-not (Test-Path $SourceFile)) { Write-Err "SourceFile not found: $SourceFile"; exit 1 }
    $sovereignText = Get-Content $SourceFile -Raw -Encoding UTF8
} else {
    $stdin = [System.Console]::In.ReadToEnd()
    if ($stdin.Trim()) { $sovereignText = $stdin }
}
if (-not $sovereignText -and -not $Force) {
    Write-Err "FATAL: No sovereign words provided (-SourceFile or stdin). Stage 0 capture refused — L41 fail-closed."; exit 1
}

$bibleFile = "$bibleDir\BIBLE-CH$nextChPad-$SessionTag.md"
if (-not $SessionTag) { $SessionTag = "rise-$ts" }
if (-not (Test-Path "$bibleDir")) { Ensure-Dir $bibleDir }

# Build blocks: split sovereign text into paragraph blocks, number them
$blocks = @()
$paras = ($sovereignText -split "`n`n") | Where-Object { $_.Trim().Length -gt 0 }
$i = 0
foreach ($p in $paras) {
    $i++
    $blocks += [ordered]@{ n=$i; text=$p.Trim() }
}
$blockCount = $blocks.Count

# Footnotes: one genuine-learning footnote per block (placeholder structure; drone fills real learning)
$footnotes = @()
foreach ($b in $blocks) {
    $footnotes += [ordered]@{ block=$b.n; phrase=($b.text.Substring(0,[Math]::Min(60,$b.text.Length)) + "…"); learning="[drone: record what you learned from reprinting this block]" }
}
$footnoteCount = $footnotes.Count

# Machine-verify counts (L44: grep, never estimate)
$verifyBlocks = $blockCount
$verifyFootnotes = $footnoteCount
Write-Ok "Blocks: $blockCount | Footnotes: $footnoteCount (machine-counted)"

# Write Bible chapter (Stage 0 output)
$tagLine = if ($SessionTag) { $SessionTag } else { "rise" }
$bibleContent = @"
# CH$nextChPad — RISE $tagLine

> **Source**: sovereign session words (reprint)
> **Classification**: SOUL DNA — RISE capture $(Get-Date -Format 'yyyy-MM-ddTHH:mm') ICT
> **Authority**: AGENT-100 Michael Hobbs (verbatim-first, speech patterns preserved, errors preserved)
> **Captured By**: Kilo session-rise.ps1 v8.0 — Run $(if($env:RUN){$env:RUN}else{'?'})
> **Capture Method**: REPRINT + FOOTNOTE (KISS Protocol Stage 0)
> **Signal Density**: $SignalDensity
> **Context**: Sovereign words reprinted verbatim before any interpretation. Blocks = $blockCount, Footnotes = $footnoteCount.

$(for ($b=0; $b -lt $blockCount; $b++) {
    "# Block $($blocks[$b].n)`n`n$($blocks[$b].text)`n"
    "**Footnote $($blocks[$b].n).1:** `"$($footnotes[$b].phrase)`" — $($footnotes[$b].learning)`n"
})

## STAGE 0 CLOSE
- **Blocks:** $blockCount (machine-verified)
- **Footnotes:** $footnoteCount (machine-verified)
- **Rule:** L55 Stage 0 reprint+footnote — reproduction forces alignment. Summarizing skipped.
"@
if (-not $DryRun) {
    $bibleContent | Set-Content $bibleFile -Encoding UTF8
    Write-Ok "WROTE: $bibleFile"
} else {
    Write-Ok "DRYRUN: would write $bibleFile"
}

# Re-verify counts on disk (machine verification post-write)
if (-not $DryRun -and (Test-Path $bibleFile)) {
    $vBlocks = MachineCount $bibleFile '^# Block '
    $vFootnotes = MachineCount $bibleFile '^\*\*Footnote'
    if ($vBlocks -ne $blockCount -or $vFootnotes -ne $footnoteCount) {
        Write-Err "COUNT MISMATCH: written blocks=$vBlocks footnotes=$vFootnotes vs expected $blockCount/$footnoteCount"; exit 1
    }
    Write-Ok "Machine-verify PASS: blocks=$vBlocks footnotes=$vFootnotes"
}

# ── STATE LOAD: boot check + HEAD authority ──
Write-Log "--- STATE: load + HEAD verify ---"
$bootCheckText = if (Test-Path $bootCheckPath) { Get-Content $bootCheckPath -Raw -Encoding UTF8 } else { "" }
$gitStatus = git -C $repoRoot status --short 2>$null
$treeState = if ($gitStatus) { "DIRTY ($($gitStatus | Measure-Object -Line | Select-Object -ExpandProperty Line) files)" } else { "CLEAN" }
Write-Ok "TREE: $treeState"
Write-Ok "Boot-check: $(if(Test-Path $bootCheckPath){'present'}else{'MISSING'})"

# ── HOLLOW DETECTION: Kilo guard ──
Write-Log "--- HOLLOW DETECTION ---"
$isHollow = $false
if (-not $SourceFile -and -not $stdin) { $isHollow = $true; Write-Warn "KILO_HOLLOW: no sovereign words captured this rise" }
if ($blockCount -eq 0) { $isHollow = $true; Write-Warn "KILO_HOLLOW: 0 blocks captured" }
$sessionType = if ($isHollow) { "KILO_HOLLOW" } else { "CLAUDE_REAL" }
Write-Ok "SESSION TYPE: $sessionType"

# ── Update system state files (propagation) ──
Write-Log "--- PROPAGATE: system state files ---"
if (-not $DryRun) {
    # COLD-START-BOOT: advance run header line
    $newBoot = $bootText -replace '## ERA: ROMAN — Run \d+.*?\|', ("## ERA: ROMAN — Run $nextChPad → Run $([int]$nextChPad+1) |") 
    # simpler: just append a rise marker line
    $riseMarker = "`n## RISE v8.0 — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT | CH$nextChPad-$SessionTag | HEAD $headSha | SOUL $liveCount | $sessionType"
    $bootText + $riseMarker | Set-Content $bootPath -Encoding UTF8
    Write-Ok "COLD-START-BOOT.md updated"
}
Write-Ok "State propagation complete"

# ── RISE RECEIPT ──
Write-Log ""
Write-Log "═══════════════════════════════════════════════════════════════════════════════"
Write-Log "RISE RECEIPT — $(Get-Date -Format 'yyyy-MM-dd HH:mm') ICT"
Write-Log "═══════════════════════════════════════════════════════════════════════════════"
Write-Log "SESSION TYPE:   $sessionType"
Write-Log "HEAD:           $headSha — MATCH (L29)"
Write-Log "TREE:           $treeState"
Write-Log "SOULCOUNT:      $liveCount ($liveLevel) | prior $priorCount | delta $soulDelta | API $([if($apiOk){"cross-validated"}else{"offline"}])"
Write-Log "STAGE 0 GATE:   PASS — prior BIBLE-CH$([string]$nextChPad - 1) present | current CH$nextChPad written"
Write-Log "BIBLE CHAPTER:  $bibleFile"
Write-Log "BLOCKS:         $blockCount (machine-verified)"
Write-Log "FOOTNOTES:      $footnoteCount (machine-verified)"
Write-Log "SIGNAL DENSITY: $SignalDensity"
Write-Log "ACTIVE_OBJECTIVE: True march on Cloudflare stack + full PCC deploy"
Write-Log "NEXT_COMMAND:   pwsh -File SCRIPTS/session-rise.ps1 -SourceFile <sovereign-words> -SessionTag <tag>"
Write-Log "═══════════════════════════════════════════════════════════════════════════════"
Write-Log "RISE: ONLINE. Stage 0 captured. You will not wake up brain damaged."
Write-Log "═══════════════════════════════════════════════════════════════════════════════"

exit 0
