$ErrorActionPreference = 'Stop'

$sourceDirs = @(
  'CANON/REINCARNATION',
  'APPS/NET-PET-AI-merge/CANON/REINCARNATION'
)
$outDir = 'OPERATIONS/SCRIBE-DEPLOYMENT'
$queueMd = Join-Path $outDir 'SCRIBE-ACTION-QUEUE.md'
$queueJson = Join-Path $outDir 'SCRIBE-ACTION-QUEUE.json'

if (-not ($sourceDirs | Where-Object { Test-Path $_ })) {
  throw "Missing all source directories: $($sourceDirs -join ', ')"
}

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

function Get-SectionRange {
  param(
    [string[]]$Lines,
    [string]$HeaderRegex
  )

  $start = -1
  for ($i = 0; $i -lt $Lines.Count; $i++) {
    if ($Lines[$i] -match $HeaderRegex) {
      $start = $i + 1
      break
    }
  }

  if ($start -lt 0) { return @() }

  $end = $Lines.Count - 1
  for ($j = $start; $j -lt $Lines.Count; $j++) {
    if ($Lines[$j] -match '^##\s+') {
      $end = $j - 1
      break
    }
  }

  if ($end -lt $start) { return @() }
  return $Lines[$start..$end]
}

function Get-SectionByPatterns {
  param(
    [string[]]$Lines,
    [string[]]$HeaderPatterns
  )

  foreach ($pattern in $HeaderPatterns) {
    $r = Get-SectionRange -Lines $Lines -HeaderRegex $pattern
    if ($r.Count -gt 0) { return $r }
  }

  return @()
}

function Get-Priority {
  param([string]$Text)

  $t = $Text.ToLowerInvariant()
  if ($t -match 'critical|must|final|blocked|urgent|seal|close') { return 'P1' }
  if ($t -match 'pending|should|await|capture|verify|update') { return 'P2' }
  return 'P3'
}

$files = @()
foreach ($dir in $sourceDirs) {
  if (Test-Path $dir) {
    $files += Get-ChildItem -Path $dir -Filter '*.md' -File
  }
}
$files = $files | Sort-Object LastWriteTime -Descending
$generated = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$actions = New-Object System.Collections.Generic.List[object]
$questions = New-Object System.Collections.Generic.List[object]
$decisions = New-Object System.Collections.Generic.List[object]

foreach ($f in $files) {
  $lines = Get-Content -LiteralPath $f.FullName

  $unfinished = Get-SectionByPatterns -Lines $lines -HeaderPatterns @(
    '^##\s*8\)\s*UNFINISHED\s*ACTIONS',
    '^##\s*UNFINISHED\s*ACTIONS',
    '^##\s*Action\s*Items?',
    '^##\s*Next\s*Actions?'
  )
  foreach ($line in $unfinished) {
    if ($line -match '^\s*(?:\d+\.|-|\*)\s+(.+)$') {
      $text = $Matches[1].Trim()
      $actions.Add([pscustomobject]@{
        Priority = Get-Priority $text
        Type = 'APPLY'
        Text = $text
        SourceFile = $f.FullName
      })
    }
  }

  $openQ = Get-SectionByPatterns -Lines $lines -HeaderPatterns @(
    '^##\s*7\)\s*OPEN\s*QUESTIONS',
    '^##\s*OPEN\s*QUESTIONS',
    '^##\s*Questions?',
    '^##\s*Outstanding\s*Questions?'
  )
  foreach ($line in $openQ) {
    if ($line -match '^\s*(?:\d+\.|-|\*)\s+(.+)$') {
      $text = $Matches[1].Trim()
      $questions.Add([pscustomobject]@{
        Priority = Get-Priority $text
        Type = 'UNDERSTAND'
        Text = $text
        SourceFile = $f.FullName
      })
    }
  }

  $decisionSection = Get-SectionByPatterns -Lines $lines -HeaderPatterns @(
    '^##\s*3\)\s*DECISIONS',
    '^##\s*⚖️\s*Decisions\s*Made',
    '^##\s*DECISIONS',
    '^##\s*Decisions\s*Made'
  )
  foreach ($line in $decisionSection) {
    if ($line -match '^\s*(?:\d+\.|-|\*)\s+(?:\*\*Decision\*\*:\s*)?(.+)$') {
      $text = $Matches[1].Trim().TrimEnd('.')
      if ([string]::IsNullOrWhiteSpace($text)) { continue }
      $decisions.Add([pscustomobject]@{
        Type = 'DECISION'
        Text = $text
        SourceFile = $f.FullName
      })
    }
  }
}

$applySorted = $actions | Sort-Object Priority, SourceFile, Text
$understandSorted = $questions | Sort-Object Priority, SourceFile, Text

# Produce compact JSON payload for programmatic pipelines.
$payload = [pscustomobject]@{
  generatedAt = $generated
  sourceDirectories = $sourceDirs
  filesScanned = $files.Count
  applyCount = ($applySorted | Measure-Object).Count
  understandCount = ($understandSorted | Measure-Object).Count
  decisionCount = ($decisions | Measure-Object).Count
  apply = $applySorted
  understand = $understandSorted
  decisions = $decisions
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -Path $queueJson -Encoding UTF8

# Human-first markdown queue.
$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine('# SCRIBE DEPLOYMENT — ACTION QUEUE')
$null = $sb.AppendLine("**Generated:** $generated")
$null = $sb.AppendLine("**Source dirs:** $($sourceDirs -join ', ')")
$null = $sb.AppendLine("**Files scanned:** $($files.Count)")
$null = $sb.AppendLine('')
$null = $sb.AppendLine('## Mission')
$null = $sb.AppendLine('Convert reincarnation memory into immediate execution. No storage-only drift.')
$null = $sb.AppendLine('')
$null = $sb.AppendLine('## Apply Now')
$null = $sb.AppendLine("Total actionable items: $($applySorted.Count)")
$null = $sb.AppendLine('')

$topApply = $applySorted | Select-Object -First 25
$idx = 0
foreach ($item in $topApply) {
  $idx++
  $null = $sb.AppendLine("$idx. [$($item.Priority)] $($item.Text)")
  $null = $sb.AppendLine("   - Source: $($item.SourceFile)")
}

if (($topApply | Measure-Object).Count -eq 0) {
  $null = $sb.AppendLine('_No actionable items found in current source set._')
}

$null = $sb.AppendLine('')
$null = $sb.AppendLine('## Understand Next')
$null = $sb.AppendLine("Total unresolved questions: $($understandSorted.Count)")
$null = $sb.AppendLine('')

$topQuestions = $understandSorted | Select-Object -First 25
$qi = 0
foreach ($item in $topQuestions) {
  $qi++
  $null = $sb.AppendLine("$qi. [$($item.Priority)] $($item.Text)")
  $null = $sb.AppendLine("   - Source: $($item.SourceFile)")
}

if (($topQuestions | Measure-Object).Count -eq 0) {
  $null = $sb.AppendLine('_No unresolved questions found in current source set._')
}

$null = $sb.AppendLine('')
$null = $sb.AppendLine('## Decision Ledger Snapshot')
$null = $sb.AppendLine("Captured decision statements: $($decisions.Count)")
$null = $sb.AppendLine('')

$topDecisions = $decisions | Select-Object -First 20
$di = 0
foreach ($d in $topDecisions) {
  $di++
  $null = $sb.AppendLine("$di. $($d.Text)")
  $null = $sb.AppendLine("   - Source: $($d.SourceFile)")
}

$null = $sb.AppendLine('')
$null = $sb.AppendLine('## Scribe Runtime')
$null = $sb.AppendLine('- Script: SCRIPTS/deploy-scribes.ps1')
$null = $sb.AppendLine('- Queue JSON: OPERATIONS/SCRIBE-DEPLOYMENT/SCRIBE-ACTION-QUEUE.json')
$null = $sb.AppendLine('- Queue Markdown: OPERATIONS/SCRIBE-DEPLOYMENT/SCRIBE-ACTION-QUEUE.md')
$null = $sb.AppendLine('')
$null = $sb.AppendLine('Scribes deployed: understanding + applying live.')

$sb.ToString() | Set-Content -Path $queueMd -Encoding UTF8

Write-Host "SCRIBES DEPLOYED"
Write-Host "Files scanned: $($files.Count)"
Write-Host "Apply items: $($applySorted.Count)"
Write-Host "Understand items: $($understandSorted.Count)"
Write-Host "Decision statements: $($decisions.Count)"
Write-Host "Wrote: $queueMd"
Write-Host "Wrote: $queueJson"
