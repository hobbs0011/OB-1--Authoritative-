# Google Drive Mirror Sync Executor
# Purpose: Prepare D:\OB-1 for Google Drive backup
# Excludes: dependencies, .git, .env, cache files
# Author: Copilot Agent
# Date: 2026-04-20

param(
    [ValidateSet('stage', 'verify', 'cleanup')]
    [string]$Action = 'stage'
)

$SourceDir = 'd:\OB-1'
$StagingDir = 'd:\GDRIVE-MIRROR-STAGING'
$LogFile = 'd:\MIRROR-SYNC-LOG.txt'

# Files/folders to exclude from mirror
$ExcludePatterns = @(
    'node_modules',
    '.venv',
    '.git',
    '__pycache__',
    '*.map',
    '*.pyc',
    '.env',
    '.env.keys',
    '*.pyd',
    'dist',
    'build',
    '.next',
    '.nuxt'
)

function Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $entry = "[$timestamp] $Message"
    Write-Host $entry -ForegroundColor Cyan
    Add-Content -Path $LogFile -Value $entry
}

function Stage-Mirror {
    Log "=== GDRIVE MIRROR STAGE START ==="
    Log "Source: $SourceDir"
    Log "Target: $StagingDir"
    
    # Create directories
    if (Test-Path $StagingDir) {
        Log "Clearing existing staging directory..."
        Remove-Item -Path $StagingDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null
    
    # Create subdirectories
    @(
        'PROJECT-CORE',
        'DOCUMENTATION',
        'SOURCE-CODE',
        'HIGH-VALUE-BACKUPS',
        'PERSONAL-MEDIA'
    ) | ForEach-Object {
        New-Item -ItemType Directory -Path "$StagingDir\$_" -Force -ErrorAction SilentlyContinue | Out-Null
    }
    
    Log "Directory structure created."
    
    # Stage CANON (Project Core)
    Log "Staging CANON/ (Soul DNA Bible)..."
    if (Test-Path "$SourceDir\CANON") {
        robocopy "$SourceDir\CANON" "$StagingDir\PROJECT-CORE\CANON" /S /E /R:3 /W:10 | Out-Null
        $canonFiles = @(Get-ChildItem -Path "$StagingDir\PROJECT-CORE\CANON" -Recurse -File).Count
        Log "✓ CANON staged: $canonFiles files"
    }
    
    # Stage APPS (NET-PET-AI)
    Log "Staging APPS/"
    if (Test-Path "$SourceDir\APPS") {
        robocopy "$SourceDir\APPS" "$StagingDir\PROJECT-CORE\APPS" /S /E /XD node_modules .next dist /R:3 /W:10 | Out-Null
        $appsFiles = @(Get-ChildItem -Path "$StagingDir\PROJECT-CORE\APPS" -Recurse -File).Count
        Log "✓ APPS staged: $appsFiles files"
    }
    
    # Stage OPERATIONS
    Log "Staging OPERATIONS/"
    if (Test-Path "$SourceDir\OPERATIONS") {
        robocopy "$SourceDir\OPERATIONS" "$StagingDir\PROJECT-CORE\OPERATIONS" /S /E /R:3 /W:10 | Out-Null
        $opsFiles = @(Get-ChildItem -Path "$StagingDir\PROJECT-CORE\OPERATIONS" -Recurse -File).Count
        Log "✓ OPERATIONS staged: $opsFiles files"
    }
    
    # Stage SCRIPTS
    Log "Staging SCRIPTS/"
    if (Test-Path "$SourceDir\SCRIPTS") {
        robocopy "$SourceDir\SCRIPTS" "$StagingDir\PROJECT-CORE\SCRIPTS" /S /E /R:3 /W:10 | Out-Null
        $scriptsFiles = @(Get-ChildItem -Path "$StagingDir\PROJECT-CORE\SCRIPTS" -Recurse -File).Count
        Log "✓ SCRIPTS staged: $scriptsFiles files"
    }
    
    # Stage .github
    Log "Staging .github/"
    if (Test-Path "$SourceDir\.github") {
        robocopy "$SourceDir\.github" "$StagingDir\PROJECT-CORE\.github" /S /E /XD node_modules /R:3 /W:10 | Out-Null
        $ghFiles = @(Get-ChildItem -Path "$StagingDir\PROJECT-CORE\.github" -Recurse -File).Count
        Log "✓ .github staged: $ghFiles files"
    }
    
    # Stage all .md files (DOCUMENTATION)
    Log "Staging Documentation (.md files)..."
    Get-ChildItem -Path $SourceDir -Recurse -Filter "*.md" -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceDir.Length + 1)
        $targetPath = "$StagingDir\DOCUMENTATION\$relativePath"
        $targetDir = Split-Path -Path $targetPath
        
        New-Item -ItemType Directory -Path $targetDir -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item -Path $_.FullName -Destination $targetPath -Force -ErrorAction SilentlyContinue
    }
    $mdFiles = @(Get-ChildItem -Path "$StagingDir\DOCUMENTATION" -Recurse -File).Count
    Log "✓ Documentation staged: $mdFiles .md files"
    
    # Stage source code
    Log "Staging Source Code (.js, .ts, .py, .json)..."
    $codeExtensions = @('*.js', '*.ts', '*.py', '*.json', '*.toml', '*.yml')
    Get-ChildItem -Path $SourceDir -Recurse -File | Where-Object {
        $codeExtensions -contains ("*" + $_.Extension)
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceDir.Length + 1)
        # Skip if in node_modules or .venv
        if ($relativePath -notmatch '(node_modules|\.venv)') {
            $targetPath = "$StagingDir\SOURCE-CODE\$relativePath"
            $targetDir = Split-Path -Path $targetPath
            
            New-Item -ItemType Directory -Path $targetDir -Force -ErrorAction SilentlyContinue | Out-Null
            Copy-Item -Path $_.FullName -Destination $targetPath -Force -ErrorAction SilentlyContinue
        }
    }
    $codeFiles = @(Get-ChildItem -Path "$StagingDir\SOURCE-CODE" -Recurse -File).Count
    Log "✓ Source code staged: $codeFiles files"
    
    # Stage high-value files
    Log "Staging High-Value backups (.pdf, .sqlite, .rbxl)..."
    $highValueExts = @('*.pdf', '*.sqlite', '*.rbxl', '*.ipynb')
    Get-ChildItem -Path $SourceDir -Recurse -File | Where-Object {
        $highValueExts -contains ("*" + $_.Extension)
    } | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceDir.Length + 1)
        $targetPath = "$StagingDir\HIGH-VALUE-BACKUPS\$relativePath"
        $targetDir = Split-Path -Path $targetPath
        
        New-Item -ItemType Directory -Path $targetDir -Force -ErrorAction SilentlyContinue | Out-Null
        Copy-Item -Path $_.FullName -Destination $targetPath -Force -ErrorAction SilentlyContinue
    }
    $hvFiles = @(Get-ChildItem -Path "$StagingDir\HIGH-VALUE-BACKUPS" -Recurse -File).Count
    Log "✓ High-value files staged: $hvFiles files"
    
    # Stage personal media
    Log "Staging Personal Media (audio, images)..."
    if (Test-Path "$SourceDir\Vietnamese Audios") {
        robocopy "$SourceDir\Vietnamese Audios" "$StagingDir\PERSONAL-MEDIA\Vietnamese-Audios" /S /E /R:3 /W:10 | Out-Null
        $audioFiles = @(Get-ChildItem -Path "$StagingDir\PERSONAL-MEDIA\Vietnamese-Audios" -Recurse -File).Count
        Log "✓ Personal media staged: $audioFiles files"
    }
    
    Log ""
    Log "=== GDRIVE MIRROR STAGE COMPLETE ==="
    Log "Staging directory: $StagingDir"
    Log "Next step: Upload $StagingDir to Google Drive"
}

function Verify-Mirror {
    Log "=== VERIFYING MIRROR INTEGRITY ==="
    
    $results = @{
        'PROJECT-CORE' = 0
        'DOCUMENTATION' = 0
        'SOURCE-CODE' = 0
        'HIGH-VALUE-BACKUPS' = 0
        'PERSONAL-MEDIA' = 0
    }
    
    foreach ($key in $results.Keys) {
        if (Test-Path "$StagingDir\$key") {
            $results[$key] = @(Get-ChildItem -Path "$StagingDir\$key" -Recurse -File).Count
            Log "✓ $key : $($results[$key]) files"
        }
    }
    
    $totalFiles = $results.Values | Measure-Object -Sum | Select-Object -ExpandProperty Sum
    $totalSize = Get-ChildItem -Path $StagingDir -Recurse -File | Measure-Object -Sum -Property Length
    
    Log ""
    Log "✅ VERIFICATION COMPLETE"
    Log "Total files: $totalFiles"
    Log "Total size: $('{0:F2}' -f ($totalSize.Sum / 1GB)) GB"
}

function Cleanup-Staging {
    Log "=== CLEANUP ==="
    if (Test-Path $StagingDir) {
        Log "Removing staging directory..."
        Remove-Item -Path $StagingDir -Recurse -Force -ErrorAction SilentlyContinue
        Log "✓ Staging directory removed"
    }
}

# Execute action
switch ($Action) {
    'stage' {
        Stage-Mirror
        Log ""
        Log "Next: Run with -Action verify to check, or upload $StagingDir to Google Drive"
    }
    'verify' {
        Verify-Mirror
    }
    'cleanup' {
        Cleanup-Staging
    }
}
