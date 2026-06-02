param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("netpetai", "general", "death", "rise", "pipeline", "student")]
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

function Get-RFKwContext {
    param([string]$Query, [int]$Top = 12)
    $indexPath = "CANON/SOUL-KEYWORDS/inverted-index.json"
    if (-not (Test-Path -LiteralPath $indexPath)) { return "" }
    try {
        $raw = Get-Content -LiteralPath $indexPath -Encoding UTF8 -Raw
        $index = $raw | ConvertFrom-Json
    } catch { return "" }
    $terms = [regex]::Matches($Query, '\b[a-zA-Z]{3,}\b') | ForEach-Object { $_.Value.ToLower() } | Sort-Object -Unique
    if ($terms.Count -eq 0) { return "" }
    $scores = @{}
    $meta = @{}
    foreach ($term in $terms) {
        if (-not $index.PSObject.Properties[$term]) { continue }
        foreach ($entry in $index.$term) {
            $k = "$($entry.run)|$($entry.category)"
            $scores[$k] = ($scores[$k] + [int]$entry.weight)
            $meta[$k] = $entry
        }
    }
    $results = $scores.GetEnumerator() | Sort-Object { $_.Value } -Descending | Select-Object -First $Top
    if ($results.Count -eq 0) { return "" }
    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($r in $results) {
        $runId = $r.Key.Split('|')[0]
        $entry = $meta[$r.Key]
        $rrl = "RRL/RRL-${runId}.txt"
        $rfkw = "CANON/SOUL-KEYWORDS/rfkw-run${runId}.txt"
        $lines.Add("Run ${runId} | $($entry.category) | score=$($r.Value) | $rrl")
    }
    return ($lines -join "`n")
}

$configPath = "CANON/SYSTEM/mandatory-reads.json"
if (-not (Test-Path -LiteralPath $configPath)) {
    Write-Error "MISSING: $configPath — cannot build context bundle without registry"
    exit 1
}

$config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json

if (-not $config.task_types.PSObject.Properties[$TaskType]) {
    Write-Error "UNKNOWN TaskType: $TaskType — valid: $($config.task_types.PSObject.Properties.Name -join ', ')"
    exit 1
}

$taskConfig = $config.task_types.$TaskType

# Resolve prior run for dynamic paths (reincarnation v5.0)
$lastDeathLine = git log --oneline --grep "^death:" -1 2>&1
$priorPad = ""
if ($lastDeathLine -match 'run(\d+)') {
    $priorRun = [int]$matches[1]
    $priorPad = "{0:D3}" -f $priorRun
}

$docs = [ordered]@{}

foreach ($slug in $taskConfig.docs) {
    if (-not $config.docs.PSObject.Properties[$slug]) {
        Write-Warning "DOC SLUG MISSING from registry: $slug (task $TaskType)"
        continue
    }
    $def = $config.docs.$slug
    $path = $def.path -replace '\{priorPad\}', $priorPad

    switch ($def.mode) {
        "tail" {
            $tailLines = if ($def.tail_lines) { $def.tail_lines } else { $def.tailLines }
            $docs[$slug] = Get-SafeContent -Path $path -TailLines $tailLines -MaxChars $def.max_chars
        }
        "slice" {
            $docs[$slug] = Get-SafeContent -Path $path -StartLine $def.start_line -EndLine $def.end_line -MaxChars $def.max_chars
        }
        "head" {
            $docs[$slug] = Get-SafeContent -Path $path -HeadLines $def.head_lines -MaxChars $def.max_chars
        }
        "full" {
            $docs[$slug] = Get-SafeContent -Path $path -MaxChars $def.max_chars
        }
        default {
            $docs[$slug] = Get-SafeContent -Path $path -MaxChars $def.max_chars
        }
    }
}

foreach ($key in $taskConfig.dynamic.PSObject.Properties.Name) {
    $dyn = $taskConfig.dynamic.$key
    switch ($dyn.type) {
        "git_log" {
            $docs[$key] = Get-GitLog -Count $dyn.count
        }
        "git_status" {
            $docs[$key] = Get-GitStatusShort
        }
        "rfkw" {
            $docs[$key] = Get-RFKwContext -Query $dyn.query -Top $dyn.top
        }
        "latest_rrl" {
            $latestRRL = Get-ChildItem "RRL/RRL-*.txt" |
                Where-Object { $_.BaseName -match '^RRL-\d+$' } |
                Sort-Object { [int]($_.BaseName -replace 'RRL-', '') } -Descending |
                Select-Object -First 1
            if ($latestRRL) {
                $docs[$key] = Get-SafeContent -Path $latestRRL.FullName -MaxChars $dyn.max_chars
            } else {
                $docs[$key] = "[NO RRL FILES]"
            }
        }
    }
}

$output = [ordered]@{
    bundle_type  = $TaskType
    docs         = $docs
    assembled_at = (Get-Date -Format "o")
    char_count   = ($docs.Values | ForEach-Object { $_.Length } | Measure-Object -Sum).Sum
}

Write-Output ($output | ConvertTo-Json -Compress -Depth 3)
