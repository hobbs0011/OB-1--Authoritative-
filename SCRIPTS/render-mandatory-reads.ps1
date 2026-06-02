param()
$ErrorActionPreference = 'Stop'
$repo = "D:\OB-1-CANONICAL"
Set-Location $repo

$jsonPath = "$repo\CANON\SYSTEM\mandatory-reads.json"
if (-not (Test-Path $jsonPath)) { Write-Error "MISSING: $jsonPath"; exit 1 }
$config = Get-Content $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json

$outPath = "$repo\CANON\SYSTEM\MANDATORY-READS.md"
$meta = $config.meta

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine("# MANDATORY-READS v$($meta.version)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("> Auto-generated from `CANON/SYSTEM/mandatory-reads.json` — do not hand-edit.")
[void]$sb.AppendLine("> Last updated: run $($meta.updated_run) | $($meta.updated_at)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Task Types")
[void]$sb.AppendLine("")

foreach ($typeName in $config.task_types.PSObject.Properties.Name) {
    $tt = $config.task_types.$typeName
    [void]$sb.AppendLine("### $typeName")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("**Docs loaded:**")
    [void]$sb.AppendLine("")
    foreach ($slug in $tt.docs) {
        $def = $config.docs.$slug
        $modeDesc = switch ($def.mode) {
            "tail" { "tail $($def.tail_lines) lines (max $($def.max_chars) chars)" }
            "head" { "head $($def.head_lines) lines (max $($def.max_chars) chars)" }
            "slice" { "lines $($def.start_line)-$($def.end_line) (max $($def.max_chars) chars)" }
            "full" { "full file (max $($def.max_chars) chars)" }
            "dynamic" { "dynamic path: $($def.path) (max $($def.max_chars) chars)" }
            default { "full (max $($def.max_chars) chars)" }
        }
        [void]$sb.AppendLine("- **$slug** — $($def.path) — $modeDesc")
        [void]$sb.AppendLine("  - _Why: $($def.why)_")
    }
    if ($tt.dynamic.PSObject.Properties.Count -gt 0) {
        [void]$sb.AppendLine("")
        [void]$sb.AppendLine("**Dynamic sources:**")
        [void]$sb.AppendLine("")
        foreach ($dynName in $tt.dynamic.PSObject.Properties.Name) {
            $dyn = $tt.dynamic.$dynName
            $desc = switch ($dyn.type) {
                "git_log" { "git log -$($dyn.count)" }
                "git_status" { "git status" }
                "rfkw" { "RFKW search: `"$($dyn.query)`" top $($dyn.top)" }
                "latest_rrl" { "latest RRL (max $($dyn.max_chars) chars)" }
                default { $dyn.type }
            }
            [void]$sb.AppendLine("- **$dynName** — $desc")
        }
    }
    [void]$sb.AppendLine("")
}

[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Doc Definitions")
[void]$sb.AppendLine("")
foreach ($slug in $config.docs.PSObject.Properties.Name) {
    $def = $config.docs.$slug
    [void]$sb.AppendLine("### $slug")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("| Field | Value |")
    [void]$sb.AppendLine("|-------|-------|")
    [void]$sb.AppendLine("| path | $($def.path) |")
    [void]$sb.AppendLine("| mode | $($def.mode) |")
    switch ($def.mode) {
        "tail" { [void]$sb.AppendLine("| tail_lines | $($def.tail_lines) |") }
        "head" { [void]$sb.AppendLine("| head_lines | $($def.head_lines) |") }
        "slice" { [void]$sb.AppendLine("| start_line | $($def.start_line) |"); [void]$sb.AppendLine("| end_line | $($def.end_line) |") }
    }
    [void]$sb.AppendLine("| max_chars | $($def.max_chars) |")
    [void]$sb.AppendLine("| why | $($def.why) |")
    [void]$sb.AppendLine("")
}

[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("**Source of truth:** `CANON/SYSTEM/mandatory-reads.json`")
[void]$sb.AppendLine("**Contract:** $($meta.contract)")

[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "RENDERED: $outPath"
Write-Host "  Lines: $($sb.ToString().Split("`n").Count)"
