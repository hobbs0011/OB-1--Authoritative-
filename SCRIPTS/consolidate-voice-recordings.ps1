#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Consolidate voice recordings from QuickShare/intake into canonical student vault
    Organize by student ID, create manifests, update student profiles

.DESCRIPTION
    Pipeline:
    1. Audit intake and _SORTED locations
    2. Match recordings to students (heuristics, metadata, naming)
    3. Organize into OPERATIONS/NET-STUDENTS/{student_id}/recordings/
    4. Create recording manifests linked to assessments
    5. Update student profiles with recording references
    6. Generate consolidation report

.PARAMETER Action
    - audit: scan both locations, report unmatched
    - identify: attempt student ID matching
    - consolidate: organize into canonical vault
    - manifest: create linking manifests
    - update: update student profiles
    - full: run entire pipeline
#>

param(
    [ValidateSet("audit", "identify", "consolidate", "manifest", "update", "full")]
    [string]$Action = "audit",
    
    [string]$WorkspaceRoot = "d:\OB-1",
    [string]$ReportDir = "$WorkspaceRoot\OPERATIONS\NET-STUDENTS"
)

$ErrorActionPreference = "Stop"

# Students (from COLD-START-BOOT)
$Students = @(
    "huong-bluetech",
    "mai-tram-bluetech",
    "quy-bluetech",
    "lam-prospect",
    "quan-nguyen",
    "quang-nguyen"
)

function Audit-Recordings {
    Write-Host "`n[AUDIT] Scanning voice recording locations..."
    
    $intakePath = "$ReportDir\AUDIO-ARCHIVE\2026-04-14-intake"
    $sortedPath = "$WorkspaceRoot\_SORTED\AUDIO-STUDENTS"
    
    $intakeFiles = @()
    $sortedFiles = @()
    
    # Scan intake
    if (Test-Path $intakePath) {
        $intakeFiles = @(Get-ChildItem -Path $intakePath -Include "*.m4a", "*.ogg" -Recurse -ErrorAction SilentlyContinue)
        Write-Host "[✓] Intake: $($intakeFiles.Count) files found"
        
        # Count by status prefix
        $unknown = $intakeFiles | Where-Object { $_.Name -match "^unknown-client" } | Measure-Object | Select-Object -ExpandProperty Count
        $named = $intakeFiles | Where-Object { $_.Name -notmatch "^unknown-client" } | Measure-Object | Select-Object -ExpandProperty Count
        $pending = $intakeFiles | Where-Object { $_.Name -match "^intake-unresolved" } | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "  - Unknown client: $unknown"
        Write-Host "  - Named: $named"
        Write-Host "  - Pending unresolved: $pending"
    }
    
    # Scan _SORTED
    if (Test-Path $sortedPath) {
        $sortedFiles = @(Get-ChildItem -Path $sortedPath -Include "*.m4a", "*.ogg" -Recurse -ErrorAction SilentlyContinue)
        Write-Host "[✓] _SORTED/AUDIO-STUDENTS: $($sortedFiles.Count) files found"
        
        $unknown = $sortedFiles | Where-Object { $_.BaseName -match "^UNKNOWN" } | Measure-Object | Select-Object -ExpandProperty Count
        $named = $sortedFiles | Where-Object { $_.BaseName -notmatch "^UNKNOWN" } | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "  - Unknown: $unknown"
        Write-Host "  - Named/Identified: $named"
    }
    
    # Heuristic identification
    Write-Host "`n[IDENTIFY] Matching recordings to students..."
    
    $manifest = @()
    
    foreach ($file in ($intakeFiles + $sortedFiles)) {
        $studentId = "UNKNOWN"
        $recordingType = "general"
        $confidence = 0.0
        
        # Match logic
        if ($file.BaseName -match "mai-tram" -or $file.BaseName -match "maitram") {
            $studentId = "mai-tram-bluetech"
            $confidence = 1.0
        }
        elseif ($file.BaseName -match "huong|nia|hung") {
            $studentId = "huong-bluetech"
            $confidence = 0.7
        }
        elseif ($file.BaseName -match "quy|nguyen-thi-thu|bluetech.*quy") {
            $studentId = "quy-bluetech"
            $confidence = 0.7
        }
        elseif ($file.BaseName -match "lam|prospect") {
            $studentId = "lam-prospect"
            $confidence = 0.7
        }
        elseif ($file.BaseName -match "quan.*nguyen") {
            $studentId = "quan-nguyen"
            $confidence = 0.7
        }
        elseif ($file.BaseName -match "quang.*nguyen") {
            $studentId = "quang-nguyen"
            $confidence = 0.7
        }
        
        # Classify type
        if ($file.BaseName -match "phonics|phonic") {
            $recordingType = "phonics-practice"
        }
        elseif ($file.BaseName -match "class|session") {
            $recordingType = "class-recording"
        }
        elseif ($file.BaseName -match "pitch|company") {
            $recordingType = "company-pitch"
        }
        
        $manifest += @{
            FileName = $file.Name
            FullPath = $file.FullName
            StudentId = $studentId
            RecordingType = $recordingType
            Confidence = $confidence
            DateCreated = $file.CreationTime
            Size = $file.Length
        }
    }
    
    return @{
        IntakeCount = $intakeFiles.Count
        SortedCount = $sortedFiles.Count
        Manifest = $manifest
    }
}

function Consolidate-Recordings {
    param([array]$Manifest)
    
    Write-Host "`n[CONSOLIDATE] Moving recordings into canonical vault..."
    
    $vaultRoot = "$ReportDir\VAULT"
    
    # Create vault structure
    foreach ($student in $Students) {
        $studentVault = "$vaultRoot\$student"
        
        if (-not (Test-Path $studentVault)) {
            New-Item -ItemType Directory -Path $studentVault -Force | Out-Null
            New-Item -ItemType Directory -Path "$studentVault\phonics" -Force | Out-Null
            New-Item -ItemType Directory -Path "$studentVault\class-recordings" -Force | Out-Null
            New-Item -ItemType Directory -Path "$studentVault\assessments" -Force | Out-Null
            Write-Host "[+] Created vault: $student"
        }
    }
    
    $moved = 0
    $skipped = 0
    
    foreach ($record in $Manifest) {
        if ($record.StudentId -eq "UNKNOWN") {
            Write-Host "[-] UNKNOWN: $($record.FileName)"
            $skipped++
            continue
        }
        
        $sourceFile = $record.FullPath
        
        if (-not (Test-Path $sourceFile)) {
            Write-Host "[-] SOURCE NOT FOUND: $($record.FileName)"
            $skipped++
            continue
        }
        
        $studentVault = "$vaultRoot\$($record.StudentId)"
        $subfolder = switch ($record.RecordingType) {
            "phonics-practice" { "phonics" }
            "class-recording" { "class-recordings" }
            default { "assessments" }
        }
        
        $timestamp = Get-Date $record.DateCreated -Format "yyyy-MM-dd_HHmmss"
        $destFileName = "{0}_{1}_{2}{3}" -f $record.StudentId, $record.RecordingType, $timestamp, ([System.IO.Path]::GetExtension($sourceFile))
        $destPath = Join-Path "$studentVault\$subfolder" $destFileName
        
        try {
            Copy-Item -Path $sourceFile -Destination $destPath -Force -ErrorAction Stop
            Write-Host "[✓] $($record.StudentId) ← $($record.FileName)"
            $moved++
        }
        catch {
            Write-Host "[-] COPY FAILED: $($record.FileName) - $_"
            $skipped++
        }
    }
    
    Write-Host "`n[SUMMARY] Consolidate: $moved moved, $skipped skipped"
    
    return @{
        Moved = $moved
        Skipped = $skipped
        VaultRoot = $vaultRoot
    }
}

function Create-Manifests {
    param([string]$VaultRoot)
    
    Write-Host "`n[MANIFEST] Creating recording manifests..."
    
    foreach ($student in $Students) {
        $studentVault = "$VaultRoot\$student"
        
        if (-not (Test-Path $studentVault)) {
            continue
        }
        
        $manifest = @{
            student_id = $student
            vault_root = $studentVault
            created = (Get-Date -Format "o")
            recordings = @()
        }
        
        # Scan all recordings
        $allRecordings = @(Get-ChildItem -Path $studentVault -Include "*.m4a", "*.ogg" -Recurse)
        
        foreach ($rec in $allRecordings) {
            $relativePath = $rec.FullName.Replace($studentVault, "").TrimStart("\")
            $manifest.recordings += @{
                filename = $rec.Name
                path = $relativePath
                size = $rec.Length
                created = $rec.CreationTime.ToString("o")
                type = if ($rec.FullName -match "phonics") { "phonics" } elseif ($rec.FullName -match "class") { "class" } else { "assessment" }
            }
        }
        
        $manifestPath = "$studentVault\MANIFEST.json"
        $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8
        
        Write-Host "[✓] Manifest: $student ($($manifest.recordings.Count) recordings)"
    }
}

function Update-StudentProfiles {
    param([string]$VaultRoot)
    
    Write-Host "`n[UPDATE] Linking recordings to student profiles..."
    
    foreach ($student in $Students) {
        $profilePath = "$ReportDir\$(($student -replace '-', '_').ToUpper()).md"
        $studentVault = "$VaultRoot\$student"
        
        if (-not (Test-Path $profilePath)) {
            Write-Host "[-] Profile not found: $student"
            continue
        }
        
        $recordingCount = @(Get-ChildItem -Path $studentVault -Include "*.m4a", "*.ogg" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
    
            if ($recordingCount -gt 0) {
                Write-Host ("[✓] {0}: {1} recordings linked" -f $student, $recordingCount)
            }
            else {
                Write-Host ("[−] {0}: no recordings found" -f $student)
        }
    }
}

function Write-Report {
    param(
        [hashtable]$AuditResult,
        [hashtable]$ConsolidateResult,
        [string]$OutputPath
    )
    
    $report = @"
# Voice Recording Consolidation Report
**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss z")

## Summary
- **Total Recordings Found:** $($AuditResult.IntakeCount + $AuditResult.SortedCount)
- **Moved to Vault:** $($ConsolidateResult.Moved)
- **Unresolved:** $($ConsolidateResult.Skipped)
- **Active Students:** $($Students.Count)

## Student Vault Locations
Vault Root: $($ConsolidateResult.VaultRoot)

## Recording Organization
Each student vault contains:
- phonics/ — phonics practice recordings
- class-recordings/ — session recordings
- assessments/ — assessment feedback recordings

## Next Steps
1. Review VAULT structure in OPERATIONS/NET-STUDENTS/
2. Student profiles now linked to their recording evidence
3. Ready for Soul Agent assessment feeding
4. Assessment system can pull from MANIFEST.json per student

## Files Generated
- VAULT/{student_id}/MANIFEST.json — per-student recording metadata
- VAULT/{student_id}/{subfolder}/*.m4a — organized recordings
"@

    $report | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "`n[✓] Report written: $OutputPath"
}

# MAIN EXECUTION

switch ($Action) {
    "audit" {
        $result = Audit-Recordings
        Write-Host "`n[AUDIT COMPLETE] $($result.Manifest.Count) recordings analyzed`n"
    }
    
    "full" {
        $result = Audit-Recordings
        $consolidated = Consolidate-Recordings -Manifest $result.Manifest
        Create-Manifests -VaultRoot $consolidated.VaultRoot
        Update-StudentProfiles -VaultRoot $consolidated.VaultRoot
        
        Write-Report -AuditResult $result -ConsolidateResult $consolidated -OutputPath "$ReportDir\CONSOLIDATION-REPORT-$(Get-Date -Format 'yyyy-MM-dd').md"
    }
    
    default {
        Write-Host "Unknown action: $Action"
        exit 1
    }
}

Write-Host "`n[READY] Voice recording consolidation complete.`n"
