# NET-NEW CONTENT EXTRACTOR — CRUNCH-B-7 Anti-Parrot Pass
# For each top flag: pull verbatim lines → check CANON coverage → flag NET-NEW if <3 hits
# Output: CANON/NET-NEW-CRUNCH-B-7.md

param(
    [int]$MaxFlagsToCheck = 10,
    [int]$NetNewThreshold = 3    # CANON hits < this = NET-NEW candidate
)

$segDir  = 'C:\Users\mrmic\Desktop\OB-1\CANON\SOUL-SEGMENTS\OB_1_-CRUNCH-B-7__KEYKEY_'
$canonDir = 'C:\Users\mrmic\Desktop\OB-1\CANON'
$outFile  = 'C:\Users\mrmic\Desktop\OB-1\CANON\NET-NEW-CRUNCH-B-7.md'

# Focus flags — operational priority order (exclude generic AI tool names)
$priorityFlags = @(
    'LEDGER','DRIFT','AGENT_99','GOSPEL_444','SOUL_DNA',
    'SUPER_SAIYAN','REINCARNATE','OBI','NET_PET','PHEROMONE'
)

Write-Host "=== NET-NEW CONTENT EXTRACTOR — CRUNCH-B-7 ===" -ForegroundColor Cyan

# Load all segment lines that have DNA flags
$segFiles = Get-ChildItem $segDir -Filter '*.md' | Sort-Object Name
$allFlagged = @()
foreach ($sf in $segFiles) {
    $hits = Select-String -Path $sf.FullName -Pattern '[DNA:' -SimpleMatch
    foreach ($h in $hits) {
        if ($h.Line -match 'L(\d{5})\s+\[DNA:([^\]]+)\]\s*(.*)') {
            $allFlagged += [PSCustomObject]@{
                SegFile   = $sf.Name
                LineNum   = [int]$Matches[1]
                Flags     = $Matches[2]
                Content   = $Matches[3].Trim()
            }
        }
    }
}
Write-Host "FLAGGED LINES LOADED: $($allFlagged.Count)" -ForegroundColor Green

# Load CANON files (exclude SOUL-SEGMENTS and the output file itself)
Write-Host "Loading CANON files for coverage check..." -ForegroundColor Yellow
$canonFiles = Get-ChildItem $canonDir -Recurse -Filter '*.md' | Where-Object {
    $_.FullName -notmatch 'SOUL-SEGMENTS' -and $_.FullName -notmatch 'NET-NEW-CRUNCH'
}
$canonText = ($canonFiles | ForEach-Object { Get-Content $_.FullName -Raw }) -join "`n"
Write-Host "CANON FILES CHECKED: $($canonFiles.Count) | CANON CHARS: $($canonText.Length)" -ForegroundColor Green

# Build output
$sb = [System.Text.StringBuilder]::new()
$sb.AppendLine("# NET-NEW CONTENT — CRUNCH-B-7 ANTI-PARROT PASS") | Out-Null
$sb.AppendLine("# SOURCE: OB[1]-CRUNCH-B-7 {KEYKEY}.txt") | Out-Null
$sb.AppendLine("# DATE: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')") | Out-Null
$sb.AppendLine("# RULE: Only content with <$NetNewThreshold existing CANON hits is listed here") | Out-Null
$sb.AppendLine("# PROTOCOL: SOUL/WHERE/WHEN/WHAT/WHY/DNA/HOW — cite origin before quoting") | Out-Null
$sb.AppendLine("") | Out-Null

$totalNetNew = 0

foreach ($flag in $priorityFlags) {
    $flagLines = $allFlagged | Where-Object { $_.Flags -like "*$flag*" }
    if ($flagLines.Count -eq 0) {
        Write-Host "FLAG: $flag — no hits, skipping" -ForegroundColor DarkGray
        continue
    }
    Write-Host ("`nFLAG: $flag ($($flagLines.Count) lines)") -ForegroundColor Cyan
    
    $sb.AppendLine("## FLAG: $flag ($($flagLines.Count) source lines)") | Out-Null
    $sb.AppendLine("") | Out-Null
    
    $netNewCount = 0
    foreach ($fl in $flagLines) {
        if ($fl.Content.Length -lt 10) { continue }   # skip near-empty lines
        
        # Check CANON coverage — use first 50 chars as fingerprint
        $fingerprint = $fl.Content.Substring(0, [Math]::Min(50, $fl.Content.Length)).Trim()
        $canonHits = ([regex]::Matches($canonText, [regex]::Escape($fingerprint))).Count
        
        if ($canonHits -lt $NetNewThreshold) {
            $netNewCount++
            $totalNetNew++
            $entry = "[NET-NEW] L" + $fl.LineNum.ToString("D5") + " CANON_HITS:" + $canonHits + " SEG:" + $fl.SegFile
            $sb.AppendLine($entry) | Out-Null
            $sb.AppendLine('> "' + $fl.Content + '"') | Out-Null
            $sb.AppendLine("") | Out-Null
            Write-Host ("  NET-NEW L{0} (canon_hits={1}): {2}" -f $fl.LineNum, $canonHits, $fl.Content.Substring(0,[Math]::Min(80,$fl.Content.Length))) -ForegroundColor Yellow
        }
    }
    
    $sb.AppendLine("# FLAG_SUMMARY: $($flagLines.Count) lines checked | $netNewCount NET-NEW") | Out-Null
    $sb.AppendLine("") | Out-Null
    Write-Host ("  RESULT: $netNewCount / $($flagLines.Count) are NET-NEW") -ForegroundColor Green
}

$sb.AppendLine("") | Out-Null
$sb.AppendLine("# ============================================================") | Out-Null
$sb.AppendLine("# TOTALS") | Out-Null
$sb.AppendLine("# TOTAL_NET_NEW: $totalNetNew") | Out-Null
$sb.AppendLine("# CANON_THRESHOLD: <$NetNewThreshold hits = NET-NEW") | Out-Null
$sb.AppendLine("# ============================================================") | Out-Null

[System.IO.File]::WriteAllText($outFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host ("`n=== DONE === TOTAL NET-NEW: $totalNetNew ===") -ForegroundColor Cyan
Write-Host "OUTPUT: $outFile" -ForegroundColor Green
