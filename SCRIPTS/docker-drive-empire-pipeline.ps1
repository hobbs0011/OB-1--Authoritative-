param(
  [string]$RepoRoot = "D:\OB-1",
  [string]$StageRoot = "D:\OB-1\OPERATIONS\DRIVE-PIPELINE\staged-docs",
  [string]$OutRoot = "D:\OB-1\OPERATIONS\DRIVE-PIPELINE",
  [switch]$EnableDriveSync,
  [string]$RemoteName = "gdrive",
  [string]$RemoteFolder = "OB1-Empire-Docs",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-Section {
  param([string]$Title)
  Write-Host ""
  Write-Host "==== $Title ====" -ForegroundColor Cyan
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Is-ExcludedPath {
  param([string]$PathLower)

  $excludedMarkers = @(
    "\\.git\\",
    "\\node_modules\\",
    "\\.venv\\",
    "\\ob-1.worktrees\\",
    "\\raw-chat-logs\\",
    "\\temp-phoenix-ultimate\\",
    "\\agengt99-post-github\\"
  )

  foreach ($marker in $excludedMarkers) {
    if ($PathLower.Contains($marker)) { return $true }
  }

  return $false
}

function Is-ExcludedName {
  param([string]$NameLower)

  $blockedNames = @(
    "api-shhhh.txt",
    "api-shhhh-2.txt",
    "api-master.txt",
    ".dev.vars",
    ".env",
    ".env.legacy"
  )

  return $blockedNames -contains $NameLower
}

Write-Section "Roman Protocol: Docker + Drive Empire Pipeline"
Write-Host "RepoRoot: $RepoRoot"
Write-Host "DryRun: $DryRun"
Write-Host "DriveSync: $EnableDriveSync"

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  throw "Repo root not found: $RepoRoot"
}

Ensure-Dir -Path $OutRoot
if (-not $DryRun) {
  Ensure-Dir -Path $StageRoot
}

Write-Section "Phase 1: Docker Compose Validation"
$composePath = Join-Path $RepoRoot "docker-compose.ob1.yml"
$dockerReady = $false
if (Test-Path -LiteralPath $composePath) {
  try {
    $null = & docker compose -f $composePath config 2>$null
    if ($LASTEXITCODE -eq 0) {
      $dockerReady = $true
      Write-Host "Compose validation: PASS"
    } else {
      Write-Host "Compose validation: FAIL (non-blocking)"
    }
  } catch {
    Write-Host "Docker unavailable for validation (non-blocking)."
  }
} else {
  Write-Host "Compose file missing: $composePath"
}

Write-Section "Phase 2: Document Inventory + Staging"
$extensions = @(".md", ".txt", ".json", ".csv", ".pdf", ".doc", ".docx", ".ppt", ".pptx")
$files = Get-ChildItem -LiteralPath $RepoRoot -File -Recurse -Force | Where-Object {
  $ext = $_.Extension.ToLowerInvariant()
  if ($extensions -notcontains $ext) { return $false }

  $fullLower = $_.FullName.ToLowerInvariant()
  if (Is-ExcludedPath -PathLower $fullLower) { return $false }

  $nameLower = $_.Name.ToLowerInvariant()
  if (Is-ExcludedName -NameLower $nameLower) { return $false }

  return $true
}

$manifest = New-Object System.Collections.Generic.List[object]
$totalBytes = 0L

foreach ($file in $files) {
  $relative = $file.FullName.Substring($RepoRoot.Length).TrimStart('\\')
  $record = [PSCustomObject]@{
    relativePath = $relative
    extension    = $file.Extension.ToLowerInvariant()
    sizeBytes    = $file.Length
    lastWriteUtc = $file.LastWriteTimeUtc.ToString("o")
  }

  $manifest.Add($record)
  $totalBytes += $file.Length

  if (-not $DryRun) {
    $target = Join-Path $StageRoot $relative
    $targetDir = Split-Path -Parent $target
    Ensure-Dir -Path $targetDir
    Copy-Item -LiteralPath $file.FullName -Destination $target -Force
  }
}

$manifestPath = Join-Path $OutRoot "manifest.json"
$manifestCsvPath = Join-Path $OutRoot "manifest.csv"
$receiptPath = Join-Path $OutRoot "run-receipt.json"
$summaryPath = Join-Path $RepoRoot "OPERATIONS\DRIVE-PIPELINE-SUMMARY.txt"

$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
$manifest | Export-Csv -LiteralPath $manifestCsvPath -NoTypeInformation -Encoding UTF8

Write-Host "Document count: $($manifest.Count)"
Write-Host "Total bytes: $totalBytes"
Write-Host "Manifest: $manifestPath"

Write-Section "Phase 3: Optional Drive Sync"
$driveSync = [PSCustomObject]@{
  attempted = [bool]$EnableDriveSync
  success   = $false
  remote    = "$RemoteName`:$RemoteFolder"
  message   = "Skipped"
}

if ($EnableDriveSync) {
  try {
    $remoteList = & rclone listremotes
    if (-not ($remoteList -match "^${RemoteName}:`$")) {
      throw "rclone remote '$RemoteName' is not configured. Run: rclone config"
    }

    $source = if ($DryRun) { $RepoRoot } else { $StageRoot }
    $target = "$RemoteName`:$RemoteFolder"

    & rclone sync $source $target --checksum --progress --include "*.md" --include "*.txt" --include "*.json" --include "*.csv" --exclude "*.env*" --exclude "*API-*" --exclude ".git/**"
    if ($LASTEXITCODE -eq 0) {
      $driveSync.success = $true
      $driveSync.message = "Sync complete"
    } else {
      $driveSync.message = "Sync failed with exit code $LASTEXITCODE"
    }
  } catch {
    $driveSync.message = $_.Exception.Message
  }
}

Write-Section "Phase 4: Operator Broadcast"
$receipt = [PSCustomObject]@{
  timestampUtc     = (Get-Date).ToUniversalTime().ToString("o")
  repoRoot         = $RepoRoot
  dryRun           = [bool]$DryRun
  dockerValidated  = $dockerReady
  documentsIndexed = $manifest.Count
  totalBytes       = $totalBytes
  driveSync        = $driveSync
  outputs          = [PSCustomObject]@{
    manifestJson = $manifestPath
    manifestCsv  = $manifestCsvPath
    receiptJson  = $receiptPath
    summaryTxt   = $summaryPath
  }
}

$receipt | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $receiptPath -Encoding UTF8

$summaryLines = @(
  "OB1 + Agent 99 Docker/Drive Pipeline Summary",
  "Timestamp (UTC): $($receipt.timestampUtc)",
  "Docker compose valid: $dockerReady",
  "Docs indexed: $($manifest.Count)",
  "Total bytes: $totalBytes",
  "Drive sync attempted: $($driveSync.attempted)",
  "Drive sync success: $($driveSync.success)",
  "Drive message: $($driveSync.message)",
  "Manifest JSON: $manifestPath",
  "Manifest CSV: $manifestCsvPath",
  "Receipt JSON: $receiptPath"
)

$summaryLines | Set-Content -LiteralPath $summaryPath -Encoding UTF8
$summaryLines | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }

Write-Host ""
Write-Host "Pipeline complete." -ForegroundColor Green
