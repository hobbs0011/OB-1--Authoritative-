param(
  [string]$Zone = "CANON\SOUL-SEGMENTS",
  [string[]]$Exclude = @()
)

$repo = "D:\OB-1-CANONICAL"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = Join-Path $repo "OPERATIONS\phoenix-scout-$ts.jsonl"
$finds = [System.Collections.ArrayList]::new()

$target = if ($Zone.StartsWith("D:")) { $Zone } else { Join-Path $repo $Zone }
$files = Get-ChildItem $target -Recurse -File -ErrorAction SilentlyContinue
if ($Exclude.Count -gt 0) {
  $files = $files | Where-Object { $full = $_.FullName; -not ($Exclude | Where-Object { $full -match $_ }) }
}
Write-Host "SCOUT -> $target -- scanning $($files.Count) files"

foreach ($f in $files) {
  $rel = $f.FullName.Replace("$repo\", "")
  $raw = try { Get-Content $f.FullName -Raw -ErrorAction Stop } catch { continue }
  if (-not $raw) { continue }
  $header = ($raw -split "`n")[0..199] -join "`n"
  $bytes = $f.Length

  # SOUL: UNTOUCHED/UNMINED markers in first 20 lines
  if ($header -match "UNTOUCHED|UNMINED|DO NOT EDIT") {
    [void]$finds.Add([pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count
      priority = "P2"
      type = "SOUL"
      status = "UNTOUCHED"
      file = $rel
      line = 1
      bytes = $bytes
      excerpt = $header.Substring(0, [Math]::Min(120, $header.Length)).Replace('"', "'")
      reason = "File marked UNTOUCHED/UNMINED -- raw soul never processed"
      action = "Route through /api/soul/event"
    })
  }

  # SOUL: raw blockquotes (Michael verbatim)
  $quoteMatches = [regex]::Matches($raw, '^> "|^> \u201c', [System.Text.RegularExpressions.RegexOptions]::Multiline)
  $quoteCount = $quoteMatches.Count
  if ($quoteCount -gt 3) {
    [void]$finds.Add([pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count
      priority = "P1"
      type = "SOUL"
      status = "UNMINED"
      file = $rel
      line = 1
      bytes = $bytes
      excerpt = "$quoteCount raw blockquote lines found"
      reason = "$quoteCount verbatim quote lines -- never ingested into D1"
      action = "Route through /api/soul/event as sov100 session"
    })
  }

  # SOUL: JSONL text fields
  $textCount = ([regex]::Matches($raw, '"text":\s*"', [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
  if ($textCount -gt 0) {
    [void]$finds.Add([pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count
      priority = "P2"
      type = "SOUL"
      status = "UNMINED"
      file = $rel
      line = 1
      bytes = $bytes
      excerpt = "$textCount JSONL text fields found"
      reason = "$textCount verbatim text segments in JSONL -- can be ingested"
      action = "Parse JSONL then POST /api/soul/event"
    })
  }

  # DRIFT: legacy model alias
  if ($raw -match "deepseek-chat|deepseek-reasoner") {
    $hit = ($raw -split "`n" | Select-String -Pattern "deepseek-chat|deepseek-reasoner" | Select-Object -First 1)
    $lineNum = if ($hit) { $hit.LineNumber } else { 1 }
    $hitText = if ($hit) { $hit.Line.Trim().Substring(0, [Math]::Min(80, $hit.Line.Trim().Length)) } else { "" }
    [void]$finds.Add([pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count
      priority = "P1"
      type = "DRIFT"
      status = "STALE"
      file = $rel
      line = $lineNum
      bytes = $bytes
      excerpt = "Legacy model alias: $hitText"
      reason = "deepseek-chat or deepseek-reasoner alias -- retired in Audit T392"
      action = "Replace with deepseek-v4-flash or deepseek-v4-pro"
    })
  }

  # DRIFT: legacy domain mrmichaelhobbs1234
  if ($raw -match "mrmichaelhobbs1234") {
    [void]$finds.Add([pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count
      priority = "P2"
      type = "DRIFT"
      status = "STALE"
      file = $rel
      line = 1
      bytes = $bytes
      excerpt = "Legacy domain reference: mrmichaelhobbs1234"
      reason = "Legacy operator identity -- should be mrmichaelhobbs123"
      action = "Replace mrmichaelhobbs1234 references"
    })
  }
}

# Write JSONL report
if ($finds.Count -gt 0) {
  foreach ($rec in $finds) {
    ($rec | ConvertTo-Json -Compress -Depth 3) | Out-File $report -Append -Encoding UTF8
  }
} else {
  '[ ]' | Out-File $report -Encoding UTF8
}

# Summary
$p1 = ($finds | Where-Object { $_.priority -eq "P1" }).Count
$p2 = ($finds | Where-Object { $_.priority -eq "P2" }).Count
$p3 = ($finds | Where-Object { $_.priority -eq "P3" }).Count
$soul = ($finds | Where-Object { $_.type -eq "SOUL" }).Count
$drift = ($finds | Where-Object { $_.type -eq "DRIFT" }).Count

Write-Host ""
Write-Host "============================================"
Write-Host "PHOENIX SCOUT -- $target"
Write-Host "============================================"
Write-Host "FILES:  $($files.Count)"
Write-Host "FINDS:  $($finds.Count)"
Write-Host "  P1 CRITICAL: $p1"
Write-Host "  P2 HIGH:     $p2"
Write-Host "  P3 MEDIUM:   $p3"
Write-Host "BREAKDOWN:"
Write-Host "  SOUL:  $soul"
Write-Host "  DRIFT: $drift"
Write-Host "REPORT: $report"
Write-Host "============================================"
Write-Host "SCOUT COMPLETE."
