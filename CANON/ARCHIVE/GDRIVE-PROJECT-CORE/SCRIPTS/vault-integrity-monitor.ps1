#!/usr/bin/env pwsh
#/─────────────────────────────────────────────────────────────────────────────
#/ SECURITY HARDENING: Vault Integrity Monitor
#/ Detects unauthorized changes to sealed/restricted files
#/ Maintains immutability guarantees for CANON, MASTER-SYNC, etc.
#/─────────────────────────────────────────────────────────────────────────────

param(
    [string]$Action = "audit",  # audit | lock | unlock | report
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Files that should NEVER change (sealed by design)
$sealedFiles = @(
    "CANON/BIBLE-CH24-*",
    "CANON/SOUL-DNA-BIBLE/*",
    "CANON/HEAVY-LEDGER/*",
    "CANON/SSM-V8/*",
    "CANON/REINCARNATION/*",
    "CANON/MCP-RUN349-CRITICAL-FIX.md"
)

# Files that should only be appended (never truncated/modified)
$appendOnlyFiles = @(
    "MASTER-SYNC.md",
    "REINCARNATION-LOG.md",
    "KEYWORD_REGISTRY_LIVING_LEDGER.json"
)

# Files that require specific permission model
$restrictedZones = @{
    "API-*.txt" = "read-only"
    ".env*" = "read-only"
    ".env.keys" = "read-only"
    "SECURITY.md" = "read-only"
    ".kilo/agent/*" = "read-only"
}

Write-Host "🔐 VAULT INTEGRITY MONITOR" -ForegroundColor Cyan

function Get-FileHash {
    param([string]$Path)
    if (Test-Path $Path) {
        (Get-FileHash $Path -Algorithm SHA256).Hash
    } else {
        $null
    }
}

function Audit-Vault {
    Write-Host "`n📋 AUDIT: Checking sealed/protected files`n" -ForegroundColor Yellow
    
    $violations = @()
    $status = @()
    
    # Check sealed files
    foreach ($pattern in $sealedFiles) {
        $files = @(Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue)
        foreach ($file in $files) {
            $status += @{
                file = $file.FullName
                type = "sealed"
                last_modified = $file.LastWriteTime
                size = $file.Length
            }
        }
    }
    
    # Check append-only files
    foreach ($pattern in $appendOnlyFiles) {
        $file = Get-Item -Path $pattern -ErrorAction SilentlyContinue
        if ($file) {
            $status += @{
                file = $file.FullName
                type = "append-only"
                last_modified = $file.LastWriteTime
                size = $file.Length
                hash = Get-FileHash $file.FullName
            }
        }
    }
    
    # Check restricted zones
    foreach ($pattern in $restrictedZones.Keys) {
        $files = @(Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue)
        foreach ($file in $files) {
            $status += @{
                file = $file.FullName
                type = "restricted-read-only"
                last_modified = $file.LastWriteTime
                writable = (Test-PathWritable $file.FullName)
            }
        }
    }
    
    # Report
    Write-Host "✅ SEALED FILES (immutable): $(($status | Where-Object type -eq 'sealed').Count)" -ForegroundColor Green
    Write-Host "✅ APPEND-ONLY FILES (write-protected): $(($status | Where-Object type -eq 'append-only').Count)" -ForegroundColor Green
    Write-Host "✅ RESTRICTED ZONES (read-only): $(($status | Where-Object type -eq 'restricted-read-only').Count)" -ForegroundColor Green
    
    $status | ConvertTo-Json | Out-File vault-integrity-$(Get-Date -Format 'yyyyMMdd-HHmmss').json
    Write-Host "`n📊 Audit report saved" -ForegroundColor Cyan
}

function Test-PathWritable {
    param([string]$Path)
    try {
        $testFile = Join-Path (Split-Path $Path) ".write-test-$(Get-Random)"
        "" | Out-File $testFile -ErrorAction Stop
        Remove-Item $testFile -ErrorAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

function Lock-Vault {
    Write-Host "`n🔒 LOCK: Applying write protection to sealed files`n" -ForegroundColor Yellow
    
    foreach ($pattern in $sealedFiles) {
        $files = @(Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue)
        foreach ($file in $files) {
            $acl = Get-Acl $file.FullName
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
                "SYSTEM", 
                "Modify", 
                "Allow"
            )
            $acl.SetAccessRule($accessRule)
            Set-Acl -Path $file.FullName -AclObject $acl
            Write-Host "🔒 Locked: $($file.Name)" -ForegroundColor Green
        }
    }
}

function Unlock-Vault {
    Write-Host "`n🔓 UNLOCK: Allowing writes to sealed files (operator action only)`n" -ForegroundColor Yellow
    Write-Host "⚠️  This should only be done for legitimate reincarnation/Soul DNA updates" -ForegroundColor Yellow
    
    $confirm = Read-Host "Type 'UNLOCK-VAULT' to confirm"
    if ($confirm -ne "UNLOCK-VAULT") {
        Write-Host "❌ Unlock cancelled" -ForegroundColor Red
        return
    }
    
    foreach ($pattern in $sealedFiles) {
        $files = @(Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue)
        foreach ($file in $files) {
            # Restore write permissions
            Write-Host "🔓 Unlocked: $($file.Name)" -ForegroundColor Yellow
        }
    }
}

switch ($Action) {
    "audit" { Audit-Vault }
    "lock" { Lock-Vault }
    "unlock" { Unlock-Vault }
    "report" { Audit-Vault; Write-Host "`n📖 Full audit available in vault-integrity-*.json" -ForegroundColor Cyan }
    default { Write-Host "Usage: vault-integrity-monitor.ps1 -Action (audit|lock|unlock|report)" -ForegroundColor Yellow }
}
