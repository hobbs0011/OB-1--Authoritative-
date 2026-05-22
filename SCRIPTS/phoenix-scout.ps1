param(
  [string]$Zone = "D:\OB-1-CANONICAL\CANON\SOUL-SEGMENTS"
)

$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = "D:\OB-1-CANONICAL\OPERATIONS\phoenix-scout-$ts.jsonl"
$finds = @()

$files = Get-ChildItem $Zone -Recurse -File -ErrorAction SilentlyContinue
Write-Host "SCOUT -> $Zone — scanning $($files.Count) files"

foreach ($f in $files) {
  $rel = $f.FullName.Replace("D:\OB-1-CANONICAL\", "")
  $raw = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $raw) { continue }
  $header = ($raw -split "`n")[0..19] -join "`n"
  $bytes = $f.Length

  # SOUL: UNTOUCHED/UNMINED markers
  if ($header -match "UNTOUCHED|UNMINED|DO NOT EDIT") {
    $finds += [pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count; priority = "P2"; type = "SOUL"; status = "UNTOUCHED"
      file = $rel; line = 1; bytes = $bytes
      excerpt = $header.Substring(0, [Math]::Min(120, $header.Length)).Replace('"',"'")
      reason = "File marked UNTOUCHED/UNMINED — raw soul never processed"
      action = "Route through /api/soul/extract"
    }
  }

  # SOUL: raw blockquotes
  $quoteCount = ([regex]::Matches($raw, '^> "')).Count
  if ($quoteCount -gt 5) {
    $finds += [pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count; priority = "P1"; type = "SOUL"; status = "UNMINED"
      file = $rel; line = 1; bytes = $bytes
      excerpt = "$quoteCount raw blockquote lines found"
      reason = "$quoteCount verbatim quote lines — never ingested into D1"
      action = "Route all through /api/soul/extract as single session"
    }
  }

  # SOUL: JSONL text fields
  $textMatches = ([regex]::Matches($raw, '"text":\s*"')).Count
  if ($textMatches -gt 0) {
    $finds += [pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count; priority = "P2"; type = "SOUL"; status = "UNMINED"
      file = $rel; line = 1; bytes = $bytes
      excerpt = "$textMatches JSONL text fields found"
      reason = "$textMatches verbatim text segments in JSONL — can be ingested"
      action = "Parse JSONL → POST /api/soul/extract"
    }
  }

  # DRIFT: legacy model alias
  if ($raw -match "deepseek-chat|deepseek-reasoner") {
    $hit = ($raw -split "`n" | Select-String "deepseek-chat|deepseek-reasoner" | Select-Object -First 1)
    $finds += [pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count; priority = "P1"; type = "DRIFT"; status = "STALE"
      file = $rel; line = $hit.LineNumber; bytes = $bytes
      excerpt = "Legacy model alias: $($hit.Line.Trim().Substring(0, [Math]::Min(80, $hit.Line.Trim().Length)))"
      reason = "deepseek-chat or deepseek-reasoner alias — retired in Audit T392"
      action = "Replace with deepseek-v4-flash or deepseek-v4-pro"
    }
  }

  # DRIFT: legacy domain
  if ($raw -match "mrmichaelhobbs1234") {
    $finds += [pscustomobject]@{
      scout_id = "SC-$ts-" + $finds.Count; priority = "P2"; type = "DRIFT"; status = "STALE"
      file = $rel; line = 1; bytes = $bytes
      excerpt = "Legacy domain mrmichaelhobbs1234"
      reason = "Legacy operator identity — should use mrmichaelhobbs123"
      action = "Replace domain references"
    }
  }
}

# Write report
if ($finds.Count -gt 0) {
  $finds | ConvertTo-Json -Depth 3 | Out-File $report -Encoding UTF8
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
Write-Host "PHOENIX SCOUT — $Zone"
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
