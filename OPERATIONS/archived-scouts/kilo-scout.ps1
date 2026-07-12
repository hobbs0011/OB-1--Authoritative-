# .kilo targeted scout â€” excludes node_modules
$repo = "D:\OB-1-CANONICAL"
$zone = Join-Path $repo ".kilo"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = Join-Path $repo "OPERATIONS\phoenix-scout-$ts.jsonl"

# Only scan .kilo subdirs that are NOT node_modules
$dirs = Get-ChildItem $zone -Directory | Where-Object { $_.Name -notmatch 'node_modules' }
$allFiles = foreach ($d in $dirs) { Get-ChildItem $d.FullName -Recurse -File -ErrorAction SilentlyContinue }
Write-Host "SCOUT -> .kilo â€” $($allFiles.Count) files (excluded node_modules)"

foreach ($f in $allFiles) {
  $rel = $f.FullName.Replace("$repo\", "")
  $raw = try { Get-Content $f.FullName -Raw -ErrorAction Stop } catch { continue }
  if (-not $raw) { continue }
  
  # DRIFT: legacy model alias
  if ($raw -match "deepseek-v4-flash|deepseek-v4-pro|mrmichaelhobbs1234") {
    $kind = if ($raw -match "deepseek-v4-flash|deepseek-v4-pro") { "model alias" } else { "legacy domain" }
    Write-Host "  DRIFT $kind : $rel"
  }
  
  # CONFIG: missing tier definition
  if ($rel -match "agent|command" -and $raw -notmatch "T3 DEEPSEEK PRO|deepseek-v4-pro") {
    Write-Host "  CONFIG stale tier: $rel"
  }
}

Write-Host "SCOUT -> .kilo COMPLETE"

