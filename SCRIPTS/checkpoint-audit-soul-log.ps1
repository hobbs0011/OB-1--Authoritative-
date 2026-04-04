# CHECKPOINT AUDIT — SOUL LOG VERBATIM VERIFICATION
# Rule: Every 5% of total source character count → verify verbatim content in output soul log
# Drift detection: PASS = content found verbatim | FAIL = content missing from output
# Completion gate: ALL 20 checkpoints PASS → AUDIT CLEAN | any FAIL → DRIFT DETECTED
#
# Usage: .\SCRIPTS\checkpoint-audit-soul-log.ps1
# Output: CANON/SOUL-LOG-AUDIT-KEY-SOUL-3-{date}.md

param(
    [string]$SourcePath = 'C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\(KEY-SOUL 3) KEY KEY KEY.txt',
    [string]$SoulLogPath = 'C:\Users\mrmic\Desktop\OB-1\CANON\SOUL-LOG-VERBATIM-KEY-SOUL-3-2026-04-05.md',
    [string]$OutputDir  = 'C:\Users\mrmic\Desktop\OB-1\CANON'
)

$date      = (Get-Date -Format 'yyyy-MM-dd-HHmmss')
$ReportOut = Join-Path $OutputDir "SOUL-LOG-AUDIT-KEY-SOUL-3-$date.md"

Write-Host "`n=== SOUL LOG CHECKPOINT AUDIT ===" -ForegroundColor Cyan

# ── LOAD SOURCE ────────────────────────────────────────────────────────────────
if (-not (Test-Path $SourcePath)) { Write-Error "SOURCE NOT FOUND: $SourcePath"; exit 1 }
if (-not (Test-Path $SoulLogPath)) { Write-Error "SOUL LOG NOT FOUND: $SoulLogPath"; exit 1 }

Write-Host "Loading source..." -ForegroundColor Yellow
$rawBytes  = [System.IO.File]::ReadAllText($SourcePath, [System.Text.Encoding]::UTF8)
$rawLF     = $rawBytes.Replace("`r`n", "`n").Replace("`r", "`n")
$totalChars = $rawLF.Length
$srcLines  = $rawLF.Split("`n")          # array of lines (LF stripped)
$totalLines = $srcLines.Length

Write-Host "SOURCE: $totalLines lines | $totalChars chars (LF-normalized)" -ForegroundColor Green

Write-Host "Loading soul log output..." -ForegroundColor Yellow
$soulLogText = [System.IO.File]::ReadAllText($SoulLogPath, [System.Text.Encoding]::UTF8)
Write-Host "SOUL LOG: $($soulLogText.Length) chars loaded" -ForegroundColor Green

# ── BUILD CHECKPOINT TARGETS ───────────────────────────────────────────────────
# 20 checkpoints: 5%, 10%, ..., 100% of total char count
$checkpoints = @()
for ($pct = 5; $pct -le 100; $pct += 5) {
    $targetChar = [int][Math]::Floor($totalChars * ($pct / 100.0))
    if ($targetChar -ge $totalChars) { $targetChar = $totalChars - 1 }
    $checkpoints += [PSCustomObject]@{
        Pct        = $pct
        TargetChar = $targetChar
    }
}

# ── WALK SOURCE LINES — MAP CHAR OFFSET TO LINE ───────────────────────────────
Write-Host "`nMapping checkpoints to source lines..." -ForegroundColor Yellow

$results      = @()
$cumChars     = 0
$cpQueue      = [System.Collections.Queue]::new()
$checkpoints  | ForEach-Object { $cpQueue.Enqueue($_) }

for ($i = 0; $i -lt $srcLines.Length; $i++) {
    $line      = $srcLines[$i]
    $lineChars = $line.Length + 1   # +1 for the LF we stripped
    $cumChars += $lineChars

    while ($cpQueue.Count -gt 0 -and $cumChars -ge $cpQueue.Peek().TargetChar) {
        $cp = $cpQueue.Dequeue()

        # If line is blank/whitespace-only, scan ahead for nearest non-blank
        $checkLine    = $line
        $checkLineNum = $i + 1   # 1-based
        if ($checkLine.Trim().Length -lt 5) {
            for ($j = $i + 1; $j -lt [Math]::Min($i + 20, $srcLines.Length); $j++) {
                if ($srcLines[$j].Trim().Length -ge 5) {
                    $checkLine    = $srcLines[$j]
                    $checkLineNum = $j + 1
                    break
                }
            }
        }

        # Strip \n literal artifacts in content (source has embedded \n notation)
        $verbatim = $checkLine.Trim()

        # Determine status
        $status = "UNKNOWN"
        $note   = ""
        if ($verbatim.Length -lt 5) {
            $status = "SKIP"
            $note   = "No non-blank line in lookahead range"
        } else {
            # Search for first 60 chars of verbatim content in soul log
            # (full line could be very long — 60 chars is unique enough to prove presence)
            $searchStr = $verbatim.Substring(0, [Math]::Min(60, $verbatim.Length))
            if ($soulLogText.IndexOf($searchStr, [System.StringComparison]::Ordinal) -ge 0) {
                $status = "PASS"
            } else {
                $status = "FAIL"
                $note   = "Content not found in soul log output"
            }
        }

        $preview = $verbatim.Substring(0, [Math]::Min(80, $verbatim.Length))
        $results += [PSCustomObject]@{
            CP         = "$($cp.Pct)%"
            CharOffset = $cp.TargetChar
            SrcLine    = $checkLineNum
            Status     = $status
            Preview    = $preview
            Note       = $note
        }

        Write-Host ("  [{0,4}%] L{1,5} CHAR:{2,7}  [{3}]  {4}" -f `
            $cp.Pct, $checkLineNum, $cp.TargetChar, $status, $preview.Substring(0,[Math]::Min(50,$preview.Length))) `
            -ForegroundColor $(if ($status -eq "PASS") {"Green"} elseif ($status -eq "FAIL") {"Red"} else {"DarkYellow"})
    }
}

# ── VERDICT ────────────────────────────────────────────────────────────────────
$failList   = $results | Where-Object { $_.Status -eq "FAIL" }
$passCount  = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$skipCount  = ($results | Where-Object { $_.Status -eq "SKIP" }).Count
$failCount  = $failList.Count
$totalCPs   = $results.Count

$verdict = if ($failCount -eq 0) { "AUDIT CLEAN — NO DRIFT DETECTED" } else { "DRIFT DETECTED — $failCount CHECKPOINT(S) FAILED" }
$verdictColor = if ($failCount -eq 0) { "Green" } else { "Red" }

Write-Host "`n--- VERDICT ---" -ForegroundColor Cyan
Write-Host "$verdict" -ForegroundColor $verdictColor
Write-Host "CHECKPOINTS: $totalCPs total | $passCount PASS | $skipCount SKIP | $failCount FAIL" -ForegroundColor Cyan
Write-Host "COVERAGE: $([int]($passCount / [Math]::Max(1,$totalCPs - $skipCount) * 100))% of non-skip checkpoints passed" -ForegroundColor Cyan

# ── WRITE REPORT ───────────────────────────────────────────────────────────────
$reportLines = @()
$reportLines += "# SOUL LOG CHECKPOINT AUDIT REPORT"
$reportLines += "# SOURCE: $(Split-Path $SourcePath -Leaf)"
$reportLines += "# SOUL_LOG: $(Split-Path $SoulLogPath -Leaf)"
$reportLines += "# DATE: $date"
$reportLines += "# TOTAL_SOURCE_CHARS: $totalChars (LF-normalized)"
$reportLines += "# TOTAL_SOURCE_LINES: $totalLines"
$reportLines += "# CHECKPOINTS: every 5% of total char count (20 total)"
$reportLines += "# VERDICT: $verdict"
$reportLines += "# PASS: $passCount | SKIP: $skipCount | FAIL: $failCount"
$reportLines += "#"
$reportLines += "# CHECKPOINT TABLE"
$reportLines += "# Format: [CP%] CHAR_OFFSET SRC_LINE STATUS | preview"
$reportLines += ""

foreach ($r in $results) {
    $line = "[{0}] CHAR:{1} L{2} [{3}]" -f $r.CP, $r.CharOffset, $r.SrcLine, $r.Status
    if ($r.Note) { $line += " NOTE:{$($r.Note)}" }
    $line += "`n  PREVIEW: $($r.Preview)"
    $reportLines += $line
    $reportLines += ""
}

$reportLines += "---"
$reportLines += "## FAILED CHECKPOINTS"
if ($failList.Count -eq 0) {
    $reportLines += "NONE — soul log is drift-free across all $passCount verified checkpoints."
} else {
    foreach ($f in $failList) {
        $reportLines += "- [{0}] L{1} CHAR:{2} — MISSING: {3}" -f $f.CP, $f.SrcLine, $f.CharOffset, $f.Preview
    }
}

$reportLines += ""
$reportLines += "---"
$reportLines += "## COMPLETION GATE"
if ($failCount -eq 0) {
    $reportLines += "STATUS: COMPLETE"
    $reportLines += "All verbatim checkpoint content verified present in soul log output."
    $reportLines += "Platform Death Test eligibility: PASS"
} else {
    $reportLines += "STATUS: INCOMPLETE"
    $reportLines += "SOUL LOG HAS DRIFT — $failCount checkpoint(s) failed."
    $reportLines += "Platform Death Test eligibility: FAIL — do not consider this run done."
}

[System.IO.File]::WriteAllLines($ReportOut, $reportLines, [System.Text.Encoding]::UTF8)
Write-Host "`nAUDIT REPORT WRITTEN: $ReportOut" -ForegroundColor Cyan

# Return exit code reflecting verdict
exit $failCount
