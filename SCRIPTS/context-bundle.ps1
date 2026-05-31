param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("netpetai", "general", "death", "rise")]
    [string]$TaskType
)

$ErrorActionPreference = "Continue"
Set-Location -Path "D:\OB-1-CANONICAL"

function Get-SafeContent {
    param(
        [string]$Path,
        [int]$HeadLines = 0,
        [int]$TailLines = 0,
        [int]$StartLine = 0,
        [int]$EndLine = 0,
        [int]$MaxChars = 5000
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return "[FILE MISSING: $Path]"
    }

    try {
        $lines = Get-Content -LiteralPath $Path -Encoding UTF8

        if ($TailLines -gt 0) {
            $total = $lines.Count
            $skip = [Math]::Max(0, $total - $TailLines)
            $lines = $lines[$skip..($total - 1)]
        }
        elseif ($StartLine -gt 0 -and $EndLine -gt 0) {
            $startIdx = [Math]::Max(0, $StartLine - 1)
            $endIdx = [Math]::Min($lines.Count - 1, $EndLine - 1)
            if ($startIdx -le $endIdx) {
                $lines = $lines[$startIdx..$endIdx]
            } else {
                $lines = @()
            }
        }
        elseif ($HeadLines -gt 0) {
            $take = [Math]::Min($HeadLines, $lines.Count)
            $lines = $lines[0..($take - 1)]
        }

        $content = $lines -join "`n"

        if ($content.Length -gt $MaxChars) {
            $content = $content.Substring(0, $MaxChars) + "`n[TRUNCATED at $MaxChars chars]"
        }

        return $content
    }
    catch {
        return "[FILE READ ERROR: $Path — $($_.Exception.Message)]"
    }
}

function Get-GitLog {
    param([int]$Count)
    try {
        $result = git log --oneline -$Count 2>&1
        if ($LASTEXITCODE -ne 0) { return "[GIT ERROR]" }
        $text = ($result | Out-String).Trim()
        if ($text.Length -gt 2000) { $text = $text.Substring(0, 2000) }
        return $text
    }
    catch { return "[GIT ERROR]" }
}

function Get-GitStatusShort {
    try {
        $result = git status --short 2>&1
        if ($LASTEXITCODE -ne 0) { return "[GIT ERROR]" }
        $text = ($result | Out-String).Trim()
        if ($text.Length -gt 2000) { $text = $text.Substring(0, 2000) }
        return $text
    }
    catch { return "[GIT ERROR]" }
}

$docs = [ordered]@{}

switch ($TaskType) {
    "netpetai" {
        $docs["student_portal_dev"] = Get-SafeContent -Path "OPERATIONS/STUDENT-PORTAL-DEV.md" -TailLines 300
        $docs["deepgram_constraints"] = Get-SafeContent -Path "CANON/RESEARCH/deepgram-voice-agent-edge-cases.md" -StartLine 20 -EndLine 115
        $docs["cold_start_boot"] = Get-SafeContent -Path "CANON/SYSTEM/COLD-START-BOOT.md" -HeadLines 100
        $docs["git_state"] = Get-GitLog -Count 5
    }
    "general" {
        $docs["cold_start_boot"] = Get-SafeContent -Path "CANON/SYSTEM/COLD-START-BOOT.md" -HeadLines 100
        $docs["git_state"] = Get-GitLog -Count 5
    }
    "death" {
        $docs["cold_start_boot"] = Get-SafeContent -Path "CANON/SYSTEM/COLD-START-BOOT.md"
        $docs["git_state"] = Get-GitLog -Count 3
        $docs["git_status"] = Get-GitStatusShort
    }
    "rise" {
        $docs["cold_start_boot"] = Get-SafeContent -Path "CANON/SYSTEM/COLD-START-BOOT.md"
        $docs["git_state"] = Get-GitLog -Count 5
        $docs["git_status"] = Get-GitStatusShort
    }
}

$output = [ordered]@{
    bundle_type  = $TaskType
    docs         = $docs
    assembled_at = (Get-Date -Format "o")
    char_count   = ($docs.Values | ForEach-Object { $_.Length } | Measure-Object -Sum).Sum
}

Write-Output ($output | ConvertTo-Json -Compress -Depth 3)
