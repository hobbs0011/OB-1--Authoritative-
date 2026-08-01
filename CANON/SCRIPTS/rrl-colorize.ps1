# rrl-colorize.ps1
# Converts raw JSONL RRL -> color-coded Markdown with AI-searchable metadata
# LFG SCS -- RRL COLOR CODING: purple=SOUL, red=DNA, yellow=REASON, green=PHEROMONE
# Output: RRL/<name>-COLORIZED.md + RRL/<name>-STATS.json
#
# Usage: .\CANON\SCRIPTS\rrl-colorize.ps1 -InputFile "RRL/Incarnate-4-PhoenixScout.txt"
#        .\CANON\SCRIPTS\rrl-colorize.ps1 -InputFile "RRL/RRL-186.txt" -StatsOnly

param(
    [Parameter(Mandatory=$true)] [string]$InputFile,
    [switch]$StatsOnly
)

$ErrorActionPreference = 'Stop'
$outDir = Split-Path $InputFile -Parent
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)

function ConvertFrom-UnixMillis($ms) {
    if (-not $ms) { return $null }
    $epoch = New-Object DateTime 1970, 1, 1, 0, 0, 0, ([DateTimeKind]::Utc)
    return $epoch.AddMilliseconds($ms).ToLocalTime()
}

# -- EMOJI + COLOR MAP (LFG SCS RRL COLOR CODING) ----------
$COLORS = @{
    SOUL      = @{ emoji=[char]0xD83D + [char]0xDC9C; ansi='35'; tag='SOUL';     role='user'     }
    DNA       = @{ emoji=[char]0x2764 + [char]0xFE0F; ansi='31'; tag='DNA';      role='assistant'; type='text'   }
    REASON    = @{ emoji=[char]0xD83D + [char]0xDC9B; ansi='33'; tag='REASON';   role='assistant'; type='reasoning' }
    PHEROMONE = @{ emoji=[char]0xD83D + [char]0xDC9A; ansi='32'; tag='PHEROMONE'; role='assistant'; type='tool'   }
    METADATA  = @{ emoji=[char]0xD83D + [char]0xDD39; ansi='36'; tag='META'                                    }
}

# -- PARSE JSONL -------------------------------------------
Write-Host "Reading: $InputFile" -ForegroundColor Cyan

$rawLines = Get-Content $InputFile

$entries = @()
$firstTs = $null
$lastTs = $null
$soulCount = 0
$dnaCount = 0
$reasonCount = 0
$toolCount = 0
$phetrailCount = 0
$charTotal = 0
$topicWords = @{}
$filePaths = @{}
$toolTypes = @{}

$lineNumber = 0
foreach ($line in $rawLines) {
    $lineNumber++
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    try {
        $obj = $line | ConvertFrom-Json
    } catch {
        Write-Warning ("Skipping malformed JSON at line $lineNumber : " + $_.Exception.Message)
        continue
    }

    $role = $obj.role
    $ts = $obj.time
    $contentBlocks = $obj.content

    if (-not $firstTs) { $firstTs = $ts }
    $lastTs = $ts

    $entry = @{
        line      = $lineNumber
        role      = $role
        timestamp = $ts
        date      = if ($ts) { (ConvertFrom-UnixMillis $ts).ToString('yyyy-MM-dd HH:mm:ss') } else { 'unknown' }
        blocks    = @()
        colorTag  = ''
        emoji     = ''
        text      = ''
        tools     = @()
        hasReason = $false
        hasPhetrail = $false
    }

    foreach ($block in $contentBlocks) {
        $type = $block.type
        $text = $block.text
        $tool = $block.tool
        $state = $block.state
        if (-not $text -and $tool) { $text = "tool: $tool" }

        $blockEntry = @{
            type = $type
            text = $text
            tool = $tool
            state = $state
        }
        if ($state -and $state.output -and $state.output.length -gt 500) {
            $blockEntry.output = $state.output.Substring(0, 500) + '...'
        } elseif ($state -and $state.output) {
            $blockEntry.output = $state.output
        } else {
            $blockEntry.output = $null
        }

        # Classify by LFG color schema
        if ($role -eq 'user' -and $type -eq 'text') {
            $entry.colorTag = 'SOUL'
            $entry.emoji = $COLORS.SOUL.emoji
        } elseif ($role -eq 'assistant' -and $type -eq 'reasoning') {
            $entry.colorTag = 'REASON'
            $entry.emoji = $COLORS.REASON.emoji
            $entry.hasReason = $true
        } elseif ($role -eq 'assistant' -and $type -eq 'text') {
            $entry.colorTag = 'DNA'
            $entry.emoji = $COLORS.DNA.emoji
        } elseif ($role -eq 'assistant' -and $type -eq 'tool') {
            $entry.colorTag = 'PHEROMONE'
            $entry.emoji = $COLORS.PHEROMONE.emoji
            $entry.hasPhetrail = $true
            $toolType = $data.tool
            if ($toolType) {
                if ($toolTypes.ContainsKey($toolType)) {
                    $toolTypes[$toolType]++
                } else {
                    $toolTypes[$toolType] = 1
                }
            }
        }

        $entry.blocks += $blockEntry
        if ($blockText) {
            $entry.text += $blockText.Substring(0, [Math]::Min($blockText.Length, 2000)) + ' '
            $charTotal += $blockText.Length

            $blockText -split '\s+' | Where-Object { $_ -match '^[A-Z][A-Z0-9_/-]+$' -and $_.Length -gt 3 } | ForEach-Object {
                if ($topicWords.ContainsKey($_)) {
                    $topicWords[$_]++
                } else {
                    $topicWords[$_] = 1
                }
            }
        }
    }

    # Aggregate counts
    if ($role -eq 'user') { $soulCount++ }
    else { $dnaCount++ }
    if ($entry.hasReason) { $reasonCount++ }
    if ($entry.hasPhetrail) { $phetrailCount++ }
    if ($entry.blocks | Where-Object { $_.type -eq 'tool' }) { $toolCount++ }

    $entries += $entry
}

$duration = if ($firstTs -and $lastTs) { [math]::Round(($lastTs - $firstTs) / 60000, 1) } else { 0 }
$rawLineCount = $rawLines.Count

# -- BUILD STATS -------------------------------------------
$stats = @{
    source_file   = $InputFile
    processed_at  = (Get-Date -Format 'o')
    lines         = $rawLineCount
    parsed_lines  = $entries.Count
    SOULcount     = $soulCount
    DNAcount      = $dnaCount
    REASONcount   = $reasonCount
    PHEROMONEcount = $phetrailCount
    tool_calls    = $toolCount
    total_chars   = $charTotal
    duration_min  = $duration
}
if ($firstTs) {
    $stats.first_ts = (ConvertFrom-UnixMillis $firstTs).ToString('o')
}
if ($lastTs) {
    $stats.last_ts = (ConvertFrom-UnixMillis $lastTs).ToString('o')
}

$sortedTopics = $topicWords.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 30
$stats.top_topics = $sortedTopics | ForEach-Object { @{ word = $_.Key; count = $_.Value } }

$sortedTools = $toolTypes.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20
$stats.top_tools = $sortedTools | ForEach-Object { @{ tool = $_.Key; count = $_.Value } }

if ($StatsOnly) {
    $statsPath = Join-Path $outDir "$baseName-STATS.json"
    $stats | ConvertTo-Json -Depth 3 | Set-Content $statsPath -Encoding UTF8
    Write-Host "Stats written: $statsPath" -ForegroundColor Green
    return $stats
}

# -- BUILD COLORIZED MARKDOWN --------------------------------
$SOULEMOJI = $COLORS.SOUL.emoji
$DNAEMOJI = $COLORS.DNA.emoji
$REASONEMOJI = $COLORS.REASON.emoji
$PHEMOJI = $COLORS.PHEROMONE.emoji

$md = @()
$md += "# RRL Colorized -- $baseName"
$md += ""
$md += ("> **LFG SCS RRL COLOR CODING:** " + $SOULEMOJI + " SOUL (user) | " + $DNAEMOJI + " DNA (assistant) | " + $REASONEMOJI + " REASON (reasoning) | " + $PHEMOJI + " PHEROMONE (tool/decision)")
$md += ""
$md += "---"
$md += ""
$md += "## Metadata"
$md += ""
$md += "| Field | Value |"
$md += "|-------|-------|"
$md += ("| Source | " + $InputFile + " |")
$md += ("| Lines | " + $entries.Count + " |")
$md += ("| " + $SOULEMOJI + " SOUL | " + $soulCount + " |")
$md += ("| " + $DNAEMOJI + " DNA | " + $dnaCount + " |")
$md += ("| " + $REASONEMOJI + " REASON | " + $reasonCount + " |")
$md += ("| " + $PHEMOJI + " PHEROMONE | " + $phetrailCount + " |")
$md += ("| Tool calls | " + $toolCount + " |")
$md += ("| Duration | " + $duration + " min |")
$md += ("| Total chars | " + $charTotal + " |")
if ($firstTs) {
    $md += ("| First | " + (ConvertFrom-UnixMillis $firstTs).ToString('yyyy-MM-dd HH:mm:ss') + " |")
}
if ($lastTs) {
    $md += ("| Last | " + (ConvertFrom-UnixMillis $lastTs).ToString('yyyy-MM-dd HH:mm:ss') + " |")
}
$md += ""
$md += "---"
$md += ""
$md += "## AI Topic Index"
$md += ""
$md += "Top 30 signal words (capitalized tokens):"
$md += ""
$md += "| Token | Frequency |"
$md += "|-------|-----------|"
foreach ($t in $sortedTopics) {
    $md += ("| " + $t.Key + " | " + $t.Value + " |")
}
$md += ""
$md += "Tool usage:"
$md += ""
$md += "| Tool | Count |"
$md += "|------|-------|"
foreach ($t in $sortedTools) {
    $md += ("| " + $t.Key + " | " + $t.Value + " |")
}
$md += ""
$md += "---"
$md += ""
$md += "## Conversation"
$md += ""

$prevTag = ''
$entryCount = 0
foreach ($e in $entries) {
    $entryCount++
    $tag = $e.colorTag
    $emoji = $e.emoji
    $date = $e.date

    $blockText = ''
    $filteredBlocks = $e.blocks | Where-Object { $_.type -ne 'step-start' -and $_.type -ne 'step-finish' }
    $textParts = $filteredBlocks | ForEach-Object { $_.text }
    $blockText = $textParts -join ' '
    if ($blockText.Length -gt 5000) { $blockText = $blockText.Substring(0, 5000) + '...' }

    $contentTypes = ($e.blocks | ForEach-Object { $_.type }) | Select-Object -Unique
    $typeStr = ($contentTypes -join ', ') -replace 'tool','TOOL' -replace 'reasoning','REASON' -replace 'text','TEXT'

    if ($tag -ne $prevTag) {
        $md += ("### " + $emoji + " " + $tag + " -- " + $emoji)
        $md += ""
        $prevTag = $tag
    }

    $toolInfo = ''
    if ($tag -eq 'PHEROMONE') {
        $toolBlocks = $e.blocks | Where-Object { $_.type -eq 'tool' }
        foreach ($tb in $toolBlocks) {
            $toolInfo += " TOOL:" + $tb.tool
            if ($tb.state) {
                $statusText = 'unknown'
                if ($tb.state.status) { $statusText = $tb.state.status }
                $toolInfo += " [" + $statusText + "]"
            }
            if ($tb.output) {
                $outText = $tb.output
                if ($outText.Length -gt 200) { $outText = $outText.Substring(0, 200) + '...' }
                $toolInfo += " -> " + $outText
            }
        }
    }

    $md += "<details>"
    $md += ("<summary><strong>" + $emoji + " " + $tag + "</strong> | " + $date + " | #" + $e.line + " | " + $typeStr + "</summary>")
    $md += ""
    $md += '```'
    $md += $blockText
    $md += '```'
    if ($toolInfo) {
        $md += ""
        $md += ("<blockquote>" + $toolInfo + "</blockquote>")
    }
    $md += "</details>"
    $md += ""
}

$md += "---"
$md += ""
$md += ("*Colorized by rrl-colorize.ps1 at " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + "*")
$md += ("*LFG SCS RRL COLOR CODING: " + $SOULEMOJI + " SOUL | " + $DNAEMOJI + " DNA | " + $REASONEMOJI + " REASON | " + $PHEMOJI + " PHEROMONE*")

# -- WRITE OUTPUT -----------------------------------------
$mdContent = $md -join "`n"
$outPath = Join-Path $outDir "$baseName-COLORIZED.md"
$mdContent | Set-Content $outPath -Encoding UTF8

$statsPath = Join-Path $outDir "$baseName-STATS.json"
$stats | ConvertTo-Json -Depth 3 | Set-Content $statsPath -Encoding UTF8

Write-Host ""
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "RRL COLORIZED" -ForegroundColor Green
Write-Host ("  Input: " + $InputFile + " (" + $entries.Count + " entries)") -ForegroundColor Gray
Write-Host ("  Colorized: " + $outPath) -ForegroundColor Magenta
Write-Host ("  Stats: " + $statsPath) -ForegroundColor Yellow
Write-Host ("  " + $SOULEMOJI + " SOUL: " + $soulCount + " | " + $DNAEMOJI + " DNA: " + $dnaCount + " | " + $REASONEMOJI + " REASON: " + $reasonCount + " | " + $PHEMOJI + " PHEROMONE: " + $phetrailCount) -ForegroundColor White
Write-Host ("=" * 50) -ForegroundColor Cyan

return $stats