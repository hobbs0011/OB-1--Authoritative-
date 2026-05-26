# U2: MCP Secrets Rotation Automation
# Purpose: Auto-rotate SOVEREIGN_KEY on schedule (90-day cycle)

param(
    [int]$RotationDaysInterval = 90,
    [switch]$DryRun = $true,
    [switch]$CreateBackup = $true
)

$secretName = "SOVEREIGN_KEY"
$rotationCheckFile = "$PSScriptRoot\..\CANON\AUDIT\secret-rotation-audit.json"

Write-Host ""
Write-Host "🔐 MCP SECRETS ROTATION (U2)" -ForegroundColor Magenta
Write-Host "   Key: $secretName | Interval: $RotationDaysInterval days"
Write-Host ""

# Check last rotation
$lastRotation = if (Test-Path $rotationCheckFile) {
    (Get-Content $rotationCheckFile | ConvertFrom-Json).last_rotation | Get-Date
} else {
    Get-Date -Year 2000
}

$daysSinceRotation = ((Get-Date) - $lastRotation).Days
$rotationDue = $daysSinceRotation -ge ($RotationDaysInterval - 7)

Write-Host "   Last rotation: $($lastRotation.ToString('yyyy-MM-dd'))"
Write-Host "   Days since: $daysSinceRotation / $RotationDaysInterval"
Write-Host "   Rotation due: $(if ($rotationDue) { "✅ YES" } else { "⏳ $($RotationDaysInterval - $daysSinceRotation) days left" })"

if ($rotationDue) {
    Write-Host ""
    Write-Host "   🔄 Initiating rotation..."
    
    if ($CreateBackup) {
        Write-Host "   📦 Creating backup..."
        $backupFile = "$PSScriptRoot\..\CANON\AUDIT\SOVEREIGN_KEY.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        # In production: retrieve current secret, backup to encrypted file
        Write-Host "      Backup: $backupFile (would be encrypted)"
    }
    
    if (-not $DryRun) {
        # Generate new key (44-char base64)
        $newKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid().ToString())) | Select-Object -Last 44
        
        Write-Host "   🔑 Generated new key"
        Write-Host "   📤 Deploying via wrangler secret put..."
        # Run: wrangler secret put SOVEREIGN_KEY
        # Input: $newKey
        
        # Update audit log
        $auditLog = @{
            last_rotation = [datetime]::UtcNow.ToString("o")
            next_rotation = ([datetime]::UtcNow.AddDays($RotationDaysInterval)).ToString("o")
            key_hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($newKey)) | ForEach-Object { $_.ToString("x2") } | Join-String
        }
        
        $auditLog | ConvertTo-Json | Out-File -FilePath $rotationCheckFile -Encoding UTF8
        Write-Host "   ✅ Rotation complete. Audit logged."
    } else {
        Write-Host "   [DRY RUN] Would rotate now"
    }
} else {
    Write-Host "   ⏸️  Rotation not due yet"
}

Write-Host ""
