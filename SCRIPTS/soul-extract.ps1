# ============================================================
# SOUL EXTRACTION PIPELINE — Phoenix-Centurion Corps
# Scans enemy territory for unmined Michael verbatim -> posts to D1
# ============================================================
param(
  [Parameter(Mandatory=$true)]
  [string]$Source,
  [string]$SessionId = "sov100-run0-extraction",
  [switch]$DryRun,
  [double]$MinConfidence = 0.55
)

$worker   = "https://soul-logger.mrmichaelhobbs123.workers.dev"
$outDir   = "D:\OB-1-CANONICAL\OPERATIONS"
$report   = Join-Path $outDir "soul-extraction-$(Get-Date -Format 'yyyy-MM-ddTHHmmss').jsonl"
$logFile  = Join-Path $outDir "soul-extraction.log"
$captured = 0
$skipped  = 0

function Write-Log($msg) {
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  "$stamp | $msg" | Out-File $logFile -Append
  Write-Host "$stamp | $msg"
}

function Post-Soul($text, $sourceFile, $lineRange) {
  if ($DryRun) {
    Write-Log "DRYRUN: Would post $($text.Length) chars from $sourceFile ($lineRange)"
    return $true
  }
  try {
    $body = @{
      student_id = "sov100-michael"
      session_id = $SessionId
      role       = "user"
      text       = $text
    } | ConvertTo-Json -Depth 2 -Compress

    $result = Invoke-RestMethod -Uri "$worker/api/soul/event" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    $rEvent = $result.event_id
    $rBytes = $result.byte_count
    Write-Log "POSTED: event_id=$rEvent bytes=$rBytes source=$sourceFile"
    return $true
  } catch {
    Write-Log "POST FAILED: $sourceFile - $($_.Exception.Message)"
    return $false
  }
}

function Extract-MichaelLines($filePath) {
  $lines = Get-Content $filePath -ErrorAction SilentlyContinue
  if (-not $lines) { return @() }

  $michaelSegments = @()
  $buffer = @()
  $inMichael = $false
  $lineNum  = 0
  $threshold = [int]($MinConfidence * 10)

  foreach ($line in $lines) {
    $lineNum++

    # Skip empty/whitespace lines between blocks
    if ($line.Trim() -eq '' -and -not $inMichael) { continue }

    # AI response markers — end Michael block
    $isAi = $line -match '^(Mar|Thought|Here is|That is|Understood|System|The Audit|The Mechanism|Your|This is|COMPONENT|PHASE|STAGE|# |##)'
    $isMeta = $line -match '^\s*(> |---|\|\|)'

    if ($isAi -and $inMichael) {
      if ($buffer.Count -gt 3) {
        $text = ($buffer -join "`n").Trim()
        if ($text.Length -gt 40) {
          $michaelSegments += @{ text = $text; lineRange = "$($lineNum - $buffer.Count)-$($lineNum - 1)" }
        }
      }
      $buffer = @()
      $inMichael = $false
      continue
    }

    if ($isMeta) { continue }

    # Michael speech markers
    $isMichael = $line -match '\b(um|uh|you know|like|right\?|I mean|okay|alright)\b' -or
                 $line -match '^\s*(I |we |my |the thing is|here.s the thing|let me|can you|tell me|what about)' -or
                 $line -match '\[.*\]'

    if ($isMichael) {
      $inMichael = $true
      $buffer += $line
    } elseif ($inMichael -and $line.Trim() -ne '') {
      $buffer += $line
    } elseif ($inMichael -and $buffer.Count -gt 0) {
      $text = ($buffer -join "`n").Trim()
      if ($text.Length -gt 40) {
        $michaelSegments += @{ text = $text; lineRange = "$($lineNum - $buffer.Count + 1)-$lineNum" }
      }
      $buffer = @()
      $inMichael = $false
    }
  }

  # Final buffer
  if ($buffer.Count -gt 3) {
    $text = ($buffer -join "`n").Trim()
    if ($text.Length -gt 40) {
      $michaelSegments += @{ text = $text; lineRange = "$($lineNum - $buffer.Count + 1)-$lineNum" }
    }
  }

  return $michaelSegments
}

# ============================================================
# MAIN EXTRACTION
# ============================================================
Write-Log "=== SOUL EXTRACTION - Phoenix-Centurion Corps ==="
Write-Log "Source: $Source"
Write-Log "Session: $SessionId"
Write-Log "Mode: $(if ($DryRun) { 'DRYRUN' } else { 'LIVE POST' })"

if (-not (Test-Path $Source)) {
  Write-Log "FATAL: Source not found: $Source"
  exit 1
}

$files = @(Get-ChildItem $Source -Recurse -File -Include *.txt,*.md,*.jsonl,*.json |
         Where-Object { $_.Length -gt 100 -and $_.Length -lt 10MB })

Write-Log "Files found: $($files.Count)"

foreach ($file in $files) {
  $sizeKB = [math]::Round($file.Length/1024,1)
  Write-Log ('READING: ' + $file.Name + ' (' + $sizeKB + ' KB)')

  $segments = Extract-MichaelLines $file.FullName

  foreach ($seg in $segments) {
    $success = Post-Soul $seg.text $file.Name $seg.lineRange
    if ($success) { $captured++ } else { $skipped++ }

    # Write to report
    $entry = @{
      source     = $file.Name
      lineRange  = $seg.lineRange
      textLength = $seg.text.Length
      captured   = $success
      timestamp  = (Get-Date -Format 'o')
    } | ConvertTo-Json -Compress
    $entry | Out-File $report -Append
  }
}

Write-Log "=== EXTRACTION COMPLETE ==="
Write-Log "Captured: $captured segments | Skipped: $skipped"
Write-Log "Report: $report"
