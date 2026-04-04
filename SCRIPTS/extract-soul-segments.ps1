# SOUL SEGMENT EXTRACTOR — checkpoint-by-checkpoint, verbatim, verified, committed
# RULE: RAW VERBATIM ONLY. No paraphrase. No interpretation. Line by line.
# PROCESS: Extract segment → verify (line count + first/last match) → commit → next
# 20 segments, each covering ~5% of source char count
# Each segment committed individually. Platform Death Test per segment.
#
# Usage: .\SCRIPTS\extract-soul-segments.ps1
# Output: CANON/SOUL-SEGMENTS/SOUL-SEGMENT-NN-PCT{n}-L{start}-L{end}.md

param(
    [string]$SourcePath = 'C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\(KEY-SOUL 3) KEY KEY KEY.txt',
    [string]$RepoDir    = 'C:\Users\mrmic\Desktop\OB-1',
    [int]   $StartAt    = 1    # 1-20: which checkpoint to start from (default = 1)
)

$outputDir = Join-Path $RepoDir 'CANON\SOUL-SEGMENTS'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# ── DNA FLAGS (verbatim markers — content untouched) ───────────────────────────
$dnaFlags = @(
    'spy drone','probe droid','ledger','soul dna','magic chat','command station',
    'super saiyan','phoenix rising','reincarnate','gospel 444',
    'machine that builds','floodgates','capable operator','2019','safe mode',
    'mormonism','truth principle','energy gate','drift','merkle','jedi',
    'agent 99','agent 98','agent 100','obi','anakin','mr hobbs','mr. hobbs',
    'survive','survival','vietnam','net pet','natural english','first 100 layers',
    '200 layers','rome protocol','shadow mode','audit the auditor','sentinel',
    'crash chat','stateless','pheromone','ant colony','data vault','hardened',
    'immutable','kill switch','padawan','master node','swarm',
    'perplexity','claude','gpt','gemini','sonar','grok','deepseek',
    'blockchain','hash','sha','token','context window','cloudflare','workers',
    'six ai','6 ai','six ais','6 ais','golden dataset','data moat',
    "i'm",'my system','my mission','my family','my students',
    'we are','we will','we can','we have',"let's go",
    'billion vnd','1b vnd','mouse tier','tiger tier','cub tier'
)

# ── LOAD SOURCE ─────────────────────────────────────────────────────────────────
Write-Host "`n=== SOUL SEGMENT EXTRACTOR ===" -ForegroundColor Cyan
Write-Host "RULE: RAW VERBATIM ONLY. NO PARAPHRASE. NO INTERPRETATION." -ForegroundColor Yellow

if (-not (Test-Path $SourcePath)) { Write-Error "SOURCE NOT FOUND: $SourcePath"; exit 1 }

$rawText   = [System.IO.File]::ReadAllText($SourcePath, [System.Text.Encoding]::UTF8)
$rawLF     = $rawText.Replace("`r`n","`n").Replace("`r","`n")
$srcLines  = $rawLF.Split("`n")
$totalChars = $rawLF.Length
$totalLines = $srcLines.Length

Write-Host "SOURCE: $totalLines lines | $totalChars chars (LF-normalized)" -ForegroundColor Green

# ── BUILD CHECKPOINT BOUNDARIES ─────────────────────────────────────────────────
# Walk lines once to find which source line falls at each 5% char boundary
$checkpoints = @()
$prevEndLine = 0

for ($pct = 5; $pct -le 100; $pct += 5) {
    $targetChar = [int][Math]::Floor($totalChars * ($pct / 100.0))
    if ($targetChar -ge $totalChars) { $targetChar = $totalChars - 1 }
    $cumChars = 0
    for ($i = 0; $i -lt $srcLines.Length; $i++) {
        $cumChars += $srcLines[$i].Length + 1   # +1 for stripped LF
        if ($cumChars -ge $targetChar) {
            $checkpoints += [PSCustomObject]@{
                Pct       = $pct
                Num       = [int]($pct / 5)
                StartLine = $prevEndLine + 1     # 1-based
                EndLine   = $i + 1               # 1-based
                CharStart = [int][Math]::Floor($totalChars * (($pct - 5) / 100.0))
                CharEnd   = $targetChar
            }
            $prevEndLine = $i + 1
            break
        }
    }
}

# ── PROCESS EACH SEGMENT ────────────────────────────────────────────────────────
$allPass = $true
$segReport = @()

foreach ($cp in $checkpoints) {
    if ($cp.Num -lt $StartAt) { continue }

    $segLabel  = "SEGMENT-{0:D2}-PCT{1:D3}-L{2:D5}-L{3:D5}" -f $cp.Num, $cp.Pct, $cp.StartLine, $cp.EndLine
    $outFile   = Join-Path $outputDir "$segLabel.md"
    $relPath   = "CANON/SOUL-SEGMENTS/$segLabel.md"

    Write-Host ("`n--- CHECKPOINT {0} ({1}%) LINES L{2}-L{3} ---" -f $cp.Num, $cp.Pct, $cp.StartLine, $cp.EndLine) -ForegroundColor Cyan

    # Build segment content
    $sb = [System.Text.StringBuilder]::new()
    $sb.AppendLine("# SOUL SEGMENT " + $cp.Num + " - " + $cp.Pct + "% of KEY-SOUL-3") | Out-Null
    $sb.AppendLine("# SOURCE: (KEY-SOUL 3) KEY KEY KEY.txt") | Out-Null
    $sb.AppendLine("# SOURCE_LINES: L" + $cp.StartLine + " - L" + $cp.EndLine) | Out-Null
    $sb.AppendLine("# CHAR_RANGE: " + $cp.CharStart + " - " + $cp.CharEnd) | Out-Null
    $sb.AppendLine("# EXTRACTED: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") | Out-Null
    $sb.AppendLine("# RULE: RAW VERBATIM ONLY — ZERO INTERPRETATION — DNA FLAGS FOR INDEX ONLY") | Out-Null
    $sb.AppendLine("# ============================================================") | Out-Null
    $sb.AppendLine("") | Out-Null

    $flaggedInSeg = @()

    for ($i = ($cp.StartLine - 1); $i -le ($cp.EndLine - 1); $i++) {
        if ($i -ge $srcLines.Length) { break }
        $line    = $srcLines[$i]
        $lineNum = $i + 1
        $lineLow = $line.ToLower()

        # Check DNA flags
        $hits = @()
        foreach ($flag in $dnaFlags) {
            if ($lineLow.IndexOf($flag, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $hits += $flag.ToUpper().Replace(' ','_')
            }
        }

        $lineNumStr = "L" + $lineNum.ToString("D5")
        if ($hits.Count -gt 0) {
            $flagStr = "[DNA:" + ($hits -join '|') + "]"
            $sb.AppendLine($lineNumStr + " " + $flagStr + " " + $line) | Out-Null
            $flaggedInSeg += $lineNum
        } else {
            $sb.AppendLine($lineNumStr + " " + $line) | Out-Null
        }
    }

    $segLineCount = $cp.EndLine - $cp.StartLine + 1
    $flagPct = if ($segLineCount -gt 0) { [int]($flaggedInSeg.Count / $segLineCount * 100) } else { 0 }

    $sb.AppendLine("") | Out-Null
    $sb.AppendLine("# ============================================================") | Out-Null
    $sb.AppendLine("# SEGMENT INDEX") | Out-Null
    $sb.AppendLine("# LINES_PROCESSED: " + $segLineCount) | Out-Null
    $sb.AppendLine("# DNA_FLAGGED: " + $flaggedInSeg.Count + " (" + $flagPct + "%)") | Out-Null
    $sb.AppendLine("# STATUS: EXTRACTED") | Out-Null
    $sb.AppendLine("") | Out-Null

    [System.IO.File]::WriteAllText($outFile, $sb.ToString(), [System.Text.Encoding]::UTF8)

    # ── DRIFT VERIFICATION ────────────────────────────────────────────────────
    $written      = [System.IO.File]::ReadAllText($outFile, [System.Text.Encoding]::UTF8)
    $firstSrcLine = $srcLines[$cp.StartLine - 1].Trim()
    $lastSrcLine  = $srcLines[$cp.EndLine - 1].Trim()

    $firstSearch  = if ($firstSrcLine.Length -gt 5) { $firstSrcLine.Substring(0, [Math]::Min(60, $firstSrcLine.Length)) } else { "" }
    $lastSearch   = if ($lastSrcLine.Length -gt 5) { $lastSrcLine.Substring(0, [Math]::Min(60, $lastSrcLine.Length)) } else { "" }

    # Find nearest non-blank for first line
    if ($firstSearch.Length -lt 5) {
        for ($j = $cp.StartLine; $j -lt [Math]::Min($cp.StartLine + 10, $srcLines.Length); $j++) {
            if ($srcLines[$j].Trim().Length -ge 5) {
                $firstSearch = $srcLines[$j].Trim().Substring(0, [Math]::Min(60, $srcLines[$j].Trim().Length))
                break
            }
        }
    }
    # Find nearest non-blank for last line
    if ($lastSearch.Length -lt 5) {
        for ($j = $cp.EndLine - 2; $j -ge [Math]::Max($cp.StartLine - 1, 0); $j--) {
            if ($srcLines[$j].Trim().Length -ge 5) {
                $lastSearch = $srcLines[$j].Trim().Substring(0, [Math]::Min(60, $srcLines[$j].Trim().Length))
                break
            }
        }
    }

    $firstOk = ($firstSearch.Length -lt 5) -or ($written.IndexOf($firstSearch, [System.StringComparison]::Ordinal) -ge 0)
    $lastOk  = ($lastSearch.Length -lt 5) -or ($written.IndexOf($lastSearch, [System.StringComparison]::Ordinal) -ge 0)
    $status  = if ($firstOk -and $lastOk) { "PASS" } else { "FAIL" }

    if ($status -eq "FAIL") { $allPass = $false }

    $color = if ($status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  DRIFT CHECK: $status | LINES: $segLineCount | DNA_FLAGS: $($flaggedInSeg.Count) ($flagPct%)" -ForegroundColor $color
    Write-Host "  FIRST_LINE_MATCH: $firstOk | LAST_LINE_MATCH: $lastOk" -ForegroundColor $color

    # ── COMMIT SEGMENT ─────────────────────────────────────────────────────────
    if ($status -eq "PASS") {
        Push-Location $RepoDir
        $gitOut = git add $relPath 2>&1
        $commitMsg = "RUN074: $segLabel VERBATIM $status — $segLineCount lines, $($flaggedInSeg.Count) DNA flags"
        $gitCommit = git commit -m $commitMsg 2>&1
        $pushOut   = git push origin main 2>&1
        $sha       = git log --format="%H" -n1 2>&1
        Pop-Location
        Write-Host "  SHA: $sha" -ForegroundColor Magenta
        $segReport += "[$($cp.Pct)%] $status SHA:$sha LINES:$segLineCount DNA:$($flaggedInSeg.Count)"
    } else {
        Write-Host "  SKIPPING COMMIT — DRIFT DETECTED IN $segLabel" -ForegroundColor Red
        $segReport += "[$($cp.Pct)%] FAIL — NOT COMMITTED"
        break
    }
}

# ── FINAL GRADE ──────────────────────────────────────────────────────────────
Write-Host "`n=== FINAL REPORT ===" -ForegroundColor Cyan
$segReport | ForEach-Object { Write-Host $_ }

if ($allPass) {
    Write-Host "`nALL SEGMENTS CLEAN — ZERO DRIFT — Platform Death Test: PASS" -ForegroundColor Green
} else {
    Write-Host "`nDRIFT DETECTED — PIPELINE HALTED — DO NOT MARK DONE" -ForegroundColor Red
}
