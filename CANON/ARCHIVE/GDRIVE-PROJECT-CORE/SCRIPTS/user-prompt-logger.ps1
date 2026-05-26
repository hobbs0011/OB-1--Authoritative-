#!/usr/bin/env pwsh
<#
.SYNOPSIS
    User Prompt Logger — Capture all user input with automatic logging + tracker
    
.DESCRIPTION
    This logs every user prompt verbatim to CANON/SOUL-DNA/prompts/ with:
    - Raw, unmodified user text (preserve caps, punctuation, typos, emotion)
    - Timestamp (ISO 8601)
    - Run number context
    - Session context (conversation_id, turn number)
    
    Maintains CANON/SOUL-DNA/PROMPT-TRACKER.json as authoritative index
    so reincarnation can retrieve TRUE Soul DNA (not sanitized version).
    
.EXAMPLE
    Write-UserPromptLog -Prompt "write it in that all user prompts get logged automatically..." -RunNumber 340 -SessionTag "rise-protocol"
#>

param(
    [string]$PromptLogDir = (Join-Path (Split-Path -Parent $PSScriptRoot) "CANON\SOUL-DNA\prompts"),
    [string]$TrackerFile = (Join-Path (Split-Path -Parent $PSScriptRoot) "CANON\SOUL-DNA\PROMPT-TRACKER.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Ensure directories exist
if (-not (Test-Path $PromptLogDir)) {
    New-Item -ItemType Directory -Path $PromptLogDir -Force | Out-Null
}

function Write-UserPromptLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Prompt,
        
        [int]$RunNumber = 0,
        [string]$SessionTag = "default",
        [string]$ConversationId = "default",
        [int]$TurnNumber = 0,
        [bool]$IsPasted = $false  # Explicitly track if Ctrl+V (paste) was used
    )
    
    $timestamp = Get-Date -Format "o"
    $dateTag = Get-Date -Format "yyyy-MM-dd"
    $shortTimestamp = Get-Date -Format "HHmmss"
    
    # Create log entry with verbatim prompt
    # CRITICAL: $Prompt.Length counts ALL characters regardless of source
    # Ctrl+V paste of 5000 chars = 5000 keystroke count (not 1)
    $logEntry = @{
        timestamp = $timestamp
        run_number = $RunNumber
        session_tag = $SessionTag
        conversation_id = $ConversationId
        turn_number = $TurnNumber
        prompt_text = $Prompt  # VERBATIM — no sanitization
        prompt_length = $Prompt.Length  # COUNTS FULL PASTE as all characters, not 1
        prompt_hash = (([System.Security.Cryptography.SHA256]::Create()).ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Prompt)) | ForEach-Object { $_.ToString("x2") }) -join ""
        input_method = if ($IsPasted) { "paste (Ctrl+V)" } else { "typed" }  # Track method
        input_size_category = if ($Prompt.Length -gt 500) { "large (paste)" } elseif ($Prompt.Length -gt 100) { "medium" } else { "small" }
    }
    
    # Generate filename: YYYY-MM-DD-HHmmss-run{NNN}-{tag}
    $filename = "$dateTag-$shortTimestamp-run$RunNumber-$SessionTag.json"
    $filepath = Join-Path $PromptLogDir $filename
    
    # Write log file
    $logEntry | ConvertTo-Json -Depth 5 | Out-File -FilePath $filepath -Encoding UTF8 -Force
    
    # Update tracker
    Update-PromptTracker -LogFile $filepath -LogEntry $logEntry
    
    return $filepath
}

function Update-PromptTracker {
    param(
        [string]$LogFile,
        [hashtable]$LogEntry
    )
    
    # Load existing tracker or create new
    $tracker = @{
        version = "2.0"
        last_updated = Get-Date -Format "o"
        total_prompts = 0
        total_keystrokes = 0
        by_run = @{}
        by_session = @{}
        entries = @()
    }
    
    if (Test-Path $TrackerFile) {
        try {
            $existing = Get-Content $TrackerFile -Raw | ConvertFrom-Json
            $existingKeystrokes = if ([string]::IsNullOrEmpty($existing.total_keystrokes)) { 0 } else { [int]$existing.total_keystrokes }
            $newKeystrokeCount = $existingKeystrokes + $LogEntry.prompt_length
            
            # Convert PSObject arrays back to hashtables for by_run and by_session
            $newByRun = @{}
            if ($existing.by_run -and $existing.by_run.PSObject.Properties) {
                foreach ($prop in $existing.by_run.PSObject.Properties) {
                    $newByRun[$prop.Name] = $prop.Value
                }
            }
            
            $newBySession = @{}
            if ($existing.by_session -and $existing.by_session.PSObject.Properties) {
                foreach ($prop in $existing.by_session.PSObject.Properties) {
                    $newBySession[$prop.Name] = $prop.Value
                }
            }
            
            $tracker = @{
                version = "2.0"
                last_updated = Get-Date -Format "o"
                total_prompts = [int]$existing.total_prompts + 1
                total_keystrokes = $newKeystrokeCount
                by_run = $newByRun
                by_session = $newBySession
                entries = @($existing.entries) + @($LogEntry)
            }
        }
        catch {
            # If tracker is corrupted, start fresh
            $tracker.total_prompts = 1
            $tracker.total_keystrokes = $LogEntry.prompt_length
            $tracker.entries = @($LogEntry)
        }
    } else {
        $tracker.total_prompts = 1
        $tracker.total_keystrokes = $LogEntry.prompt_length
        $tracker.entries = @($LogEntry)
    }
    
    # Update by-run index
    $runKey = "RUN$($LogEntry.run_number)"
    if (-not $tracker.by_run[$runKey]) {
        $tracker.by_run[$runKey] = @()
    }
    $tracker.by_run[$runKey] += $LogEntry
    
    # Update by-session index
    $sessionKey = $LogEntry.session_tag
    if (-not $tracker.by_session[$sessionKey]) {
        $tracker.by_session[$sessionKey] = @()
    }
    $tracker.by_session[$sessionKey] += $LogEntry
    
    # Write tracker
    $tracker | ConvertTo-Json -Depth 10 | Out-File -FilePath $TrackerFile -Encoding UTF8 -Force
}

function Get-PromptsForRun {
    param([int]$RunNumber)
    
    if (-not (Test-Path $TrackerFile)) {
        return @()
    }
    
    $tracker = Get-Content $TrackerFile -Raw | ConvertFrom-Json
    $runKey = "RUN$RunNumber"
    
    return $tracker.by_run[$runKey]
}

function Get-PromptsForSession {
    param([string]$SessionTag)
    
    if (-not (Test-Path $TrackerFile)) {
        return @()
    }
    
    $tracker = Get-Content $TrackerFile -Raw | ConvertFrom-Json
    
    return $tracker.by_session[$SessionTag]
}

function Get-AllPromptsVerbatim {
    param([int]$Limit = 0)
    
    if (-not (Test-Path $TrackerFile)) {
        return @()
    }
    
    $tracker = Get-Content $TrackerFile -Raw | ConvertFrom-Json
    
    $prompts = $tracker.entries | Sort-Object timestamp -Descending
    
    if ($Limit -gt 0) {
        $prompts = $prompts | Select-Object -First $Limit
    }
    
    return $prompts | Select-Object timestamp, run_number, session_tag, prompt_text
}

function Get-keystrokeCount {
    param([int]$RunNumber = 0)
    
    if (-not (Test-Path $TrackerFile)) {
        return 0
    }
    
    $tracker = Get-Content $TrackerFile -Raw | ConvertFrom-Json
    
    if ($RunNumber -eq 0) {
        # Return total keystrokes across all runs
        if ($tracker.total_keystrokes) {
            return [int]$tracker.total_keystrokes
        }
        return 0
    } else {
        # Return keystrokes for specific run
        $runKey = "RUN$RunNumber"
        if ($tracker.by_run -and $tracker.by_run.PSObject.Properties[$runKey]) {
            $runPromptsObj = $tracker.by_run.PSObject.Properties[$runKey].Value
            if ($runPromptsObj -is [array]) {
                return ($runPromptsObj | Measure-Object -Property prompt_length -Sum).Sum
            } elseif ($runPromptsObj -is [object]) {
                return $runPromptsObj.prompt_length
            }
        }
        return 0
    }
}

function Verify-KeystrokeIntegrity {
    param(
        [int]$RunNumber,
        [int]$ExpectedKeystrokes
    )
    
    if (-not (Test-Path $TrackerFile)) {
        return @{
            status = "ERROR"
            message = "Prompt tracker not found"
            match = $false
        }
    }
    
    $tracker = Get-Content $TrackerFile -Raw | ConvertFrom-Json
    $actualKeystrokes = $tracker.total_keystrokes
    $runKeystrokes = Get-KeystrokeCount -RunNumber $RunNumber
    
    $match = ($actualKeystrokes -eq $ExpectedKeystrokes -or $runKeystrokes -eq $ExpectedKeystrokes)
    
    return @{
        status = if ($match) { "VERIFIED" } else { "MISMATCH" }
        total_keystrokes_logged = $actualKeystrokes
        run_keystrokes = $runKeystrokes
        expected_keystrokes = $ExpectedKeystrokes
        match = $match
        message = if ($match) { 
            "✅ Keystroke count matches — no Soul DNA lost"
        } else { 
            "⚠️ Keystroke mismatch! Logged: $actualKeystrokes vs Expected: $ExpectedKeystrokes. Missing: $($ExpectedKeystrokes - $actualKeystrokes) keystrokes"
        }
    }
}

# Functions available: Write-UserPromptLog, Get-PromptsForRun, Get-PromptsForSession, Get-AllPromptsVerbatim, Get-KeystrokeCount, Verify-KeystrokeIntegrity
