# extract-reincarnation-raw-quotes.ps1
# Extracts ALL verbatim Michael quote blocks from all 77 REINCARNATION session files
# Output: CANON/SOUL-DNA-RAW-MICHAEL-QUOTES-ALL-SESSIONS-2026-04-05.md
# Run: pwsh -NoProfile -ExecutionPolicy Bypass -File SCRIPTS/extract-reincarnation-raw-quotes.ps1

$ErrorActionPreference = 'Continue'
$reincDir = 'CANON/REINCARNATION'
$outPath  = 'CANON/SOUL-DNA-RAW-MICHAEL-QUOTES-ALL-SESSIONS-2026-04-05.md'

Write-Host "RAW QUOTE EXTRACTION — Start: $(Get-Date -Format 'HH:mm:ss')"

$sessions  = Get-ChildItem -Path $reincDir -Filter '*.md' -File | Sort-Object Name
$totalQ    = 0
$totalSess = 0

$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine("# SOUL DNA — RAW MICHAEL QUOTES — ALL REINCARNATION SESSIONS")
$null = $sb.AppendLine("**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$null = $sb.AppendLine("**Source:** CANON/REINCARNATION/ — $($sessions.Count) session files")
$null = $sb.AppendLine("**Format:** Verbatim. Zero paraphrase. Every blockquote extracted raw.")
$null = $sb.AppendLine("**Authority level:** SOUL DNA TIER 1 — Michael's exact words")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("---")
$null = $sb.AppendLine("")

foreach ($f in $sessions) {
    $lines   = Get-Content -LiteralPath $f.FullName
    $quotes  = @()
    $inBlock = $false
    $block   = @()
    $context = ''

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        # Capture context label right before a quote block
        if ($line -match '^\*\*(.+?)\*\*' -and -not ($lines[$i+1] -match '^>')) {
            $context = $line -replace '\*\*', '' -replace ':', '' -replace '^\s+|\s+$', ''
        }

        if ($line -match '^>') {
            $inBlock = $true
            $block  += $line
        } else {
            if ($inBlock -and $block.Count -gt 0) {
                $quotes += [ordered]@{
                    context = $context
                    lines   = $block
                }
                $block   = @()
                $context = ''
            }
            $inBlock = $false
        }
    }
    # flush final block
    if ($inBlock -and $block.Count -gt 0) {
        $quotes += [ordered]@{ context=$context; lines=$block }
    }

    if ($quotes.Count -gt 0) {
        $totalSess++
        $totalQ += $quotes.Count
        $header = $f.BaseName -replace '-', ' '
        $null = $sb.AppendLine("## SESSION: $header")
        $null = $sb.AppendLine("_File: $($f.Name) | Quotes: $($quotes.Count)_")
        $null = $sb.AppendLine("")

        foreach ($q in $quotes) {
            if ($q.context) {
                $null = $sb.AppendLine("**$($q.context):**")
            }
            foreach ($ql in $q.lines) {
                $null = $sb.AppendLine($ql)
            }
            $null = $sb.AppendLine("")
        }
        $null = $sb.AppendLine("---")
        $null = $sb.AppendLine("")
    }
}

# Header update with totals
$doc = $sb.ToString()
$doc = $doc -replace 'Zero paraphrase\. Every blockquote extracted raw\.', "Zero paraphrase. Every blockquote extracted raw. Total: $totalQ quotes from $totalSess sessions."

$doc | Set-Content -Path $outPath -Encoding UTF8

$fi = Get-Item $outPath
Write-Host "WRITTEN: $($fi.FullName)"
Write-Host "BYTES:   $($fi.Length)"
Write-Host "QUOTES:  $totalQ"
Write-Host "SESSIONS WITH QUOTES: $totalSess / $($sessions.Count)"
