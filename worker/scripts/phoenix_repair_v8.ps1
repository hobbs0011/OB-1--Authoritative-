Param(
  [string]$Root = "/mnt/c/Users/mrmic/phoenix-empire/worker",
  [string]$OutDir = "/mnt/c/Users/mrmic/phoenix-empire/worker/.phoenix_repair"
)

$ErrorActionPreference = "Stop"

Write-Host "[Stage 11] Phoenix Repair v8" -ForegroundColor Cyan

# Basic checks
if (-not (Test-Path $Root)) {
  throw "Root path not found: $Root"
}

$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$runDir = Join-Path $OutDir $ts
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

# Files to backup (fail-closed if missing)
$files = @(
  Join-Path $Root "wrangler.toml",
  Join-Path $Root "src/index.js",
  Join-Path $Root "src/index.ts"
)

$backup = @()
foreach ($f in $files) {
  if (Test-Path $f) {
    $dest = Join-Path $runDir (Split-Path $f -Leaf)
    Copy-Item $f $dest -Force
    $backup += $dest
  }
}

if ($backup.Count -eq 0) {
  throw "No source files found to back up in $Root"
}

# Journal recovery / shard-freeze placeholder checks
$report = [ordered]@{
  timestamp = (Get-Date).ToString("o")
  root = $Root
  backups = $backup
  checks = @{
    wrangler_toml = (Test-Path (Join-Path $Root "wrangler.toml"))
    src_index_js = (Test-Path (Join-Path $Root "src/index.js"))
    src_index_ts = (Test-Path (Join-Path $Root "src/index.ts"))
  }
}

$reportPath = Join-Path $runDir "repair_report.json"
$report | ConvertTo-Json -Depth 5 | Out-File $reportPath -Encoding UTF8

Write-Host "✅ Stage 11 complete. Report: $reportPath" -ForegroundColor Green
