$ErrorActionPreference = 'Stop'

$repoPath = 'D:\OB-1-CANONICAL'
$bfgJarPath = 'C:\tools\bfg.jar'
$bfgDownloadUrl = 'https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar'
$targetFile = '.kilo/kilo.json'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Ensure script is saved in expected location
if ($scriptDir -ne 'D:\OB-1-CANONICAL\SCRIPTS') {
    Write-Warning "Script is not running from D:\OB-1-CANONICAL\SCRIPTS. Proceeding anyway."
}

# Step 1: Check for BFG jar, download if missing
if (-not (Test-Path $bfgJarPath)) {
    Write-Host "BFG jar not found at $bfgJarPath. Downloading..." -ForegroundColor Yellow
    $toolsDir = Split-Path -Parent $bfgJarPath
    if (-not (Test-Path $toolsDir)) {
        New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    }
    try {
        Invoke-WebRequest -Uri $bfgDownloadUrl -OutFile $bfgJarPath -UseBasicParsing
        Write-Host "BFG jar downloaded successfully to $bfgJarPath" -ForegroundColor Green
    } catch {
        Write-Error "Failed to download BFG jar: $_"
        exit 1
    }
} else {
    Write-Host "BFG jar found at $bfgJarPath" -ForegroundColor Green
}

# Validate repository exists
if (-not (Test-Path "$repoPath\.git")) {
    Write-Error "Git repository not found at $repoPath"
    exit 1
}

# Step 2: Run BFG to delete .kilo/kilo.json from all history
Write-Host "`nRunning BFG Repo Cleaner to purge '$targetFile' from git history..." -ForegroundColor Cyan
Push-Location $repoPath
try {
    $bfgArgs = @(
        '-jar', $bfgJarPath,
        '--delete-files', $targetFile,
        '--no-blob-protection',
        $repoPath
    )
    & java @bfgArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "BFG execution failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    Write-Host "BFG completed successfully." -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 3: Expire reflog and aggressive GC
Write-Host "`nExpiring reflog and running aggressive garbage collection..." -ForegroundColor Cyan
Push-Location $repoPath
try {
    git reflog expire --expire=now --all
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git reflog expire failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }

    git gc --prune=now --aggressive
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git gc failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    Write-Host "Reflog expired and garbage collection completed." -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 4: Print next step instructions
Write-Host @"

========================================
  PURGE COMPLETE - NEXT STEPS
========================================

The file '$targetFile' has been removed from ALL git history.
Local repository has been cleaned and repacked.

!! CRITICAL: FORCE PUSH REQUIRED !!

You MUST force push ALL branches and tags to overwrite remote history:

  cd $repoPath
  git push --force --all
  git push --force --tags

WARNING: Force pushing rewrites public history. This will:
  - Break clones/forks held by other contributors
  - Require ALL collaborators to re-clone or run:
      git fetch origin
      git reset --hard origin/<branch>
  - Invalidate any open pull requests referencing old commits

ADDITIONAL REQUIRED ACTIONS:
  1. ROTATE ALL API KEYS that were in '$targetFile' immediately.
     History rewriting does NOT invalidate leaked credentials.
  2. Notify all team members that they must re-clone the repository.
  3. Verify the purge by searching history:
       git log --all --full-history -- '$targetFile'
     This should return NO results.
  4. Consider adding '$targetFile' to .gitignore to prevent future commits.

========================================
"@ -ForegroundColor Yellow
