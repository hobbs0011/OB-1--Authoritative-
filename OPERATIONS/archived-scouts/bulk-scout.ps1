# BULK PHOENIX SCOUT — grep-only, no file reads. Maximum throughput.
param([string[]]$Zones)

$repo = "D:\OB-1-CANONICAL"
$ts = Get-Date -Format "yyyy-MM-ddTHHmmss"
$report = Join-Path $repo "OPERATIONS\phoenix-scout-bulk-$ts.jsonl"
$seq = 0

foreach ($zone in $Zones) {
  $path = if ($zone.StartsWith("D:")) { $zone } else { Join-Path $repo $zone }
  if (-not (Test-Path $path)) { continue }
  
  $files = Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }
  $total = $files.Count
  $relPath = $path.Replace("$repo\", "")
  Write-Host "$relPath`: $total files"
  
  # DRIFT scan — grep for legacy aliases
  $driftFiles = $files | ForEach-Object { if ((Get-Content $_.FullName -Raw -EA SilentlyContinue) -match 'deepseek-chat|deepseek-reasoner|mrmichaelhobbs1234') { $_ } }
  foreach ($df in $driftFiles) {
    $rel = $df.FullName.Replace("$repo\", "")
    $kind = if ((Get-Content $df.FullName -Raw -EA 0) -match 'deepseek-chat') { "model alias deepseek-chat" } else { "legacy domain mrmichaelhobbs1234" }
    Write-Host "  DRIFT $kind`: $rel"
    $seq++
    $rec = @{scout_id="SC-BULK-$ts-$seq";priority="P2";type="DRIFT";status="STALE";file=$rel;reason=$kind;action="Replace reference"} | ConvertTo-Json -Compress
    Add-Content $report $rec
  }
  
  # SOUL scan — count blockquote files
  $soulCount = 0
  $files | ForEach-Object { 
    $raw = Get-Content $_.FullName -Raw -EA SilentlyContinue
    if ($raw -match '> "' -or $raw -match 'UNMINED|UNTOUCHED') { $soulCount++ }
  }
  if ($soulCount -gt 0) { Write-Host "  SOUL: $soulCount files with quotes/markers" }
}

Write-Host "BULK SCOUT COMPLETE — $report"
