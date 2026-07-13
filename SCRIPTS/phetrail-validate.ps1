<#
.SYNOPSIS
phetrail-validate.ps1 — Validates phetrail JSON against schema
Checks: schema_version, required fields, negative_trails structure, decay_days
#>

param(
    [string]$Path,
    [switch]$AutoFix
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\OB-1-CANONICAL"

if (-not $Path) {
    $phetrailDir = Join-Path $repoRoot "CANON/PHEROMONES"
    $files = Get-ChildItem $phetrailDir -Filter "PheTrail-run*.json" -File -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending
    if ($files) { $Path = $files[0].FullName } else { throw "No phetrail files found" }
}

$json = Get-Content $Path -Raw -ErrorAction Stop | ConvertFrom-Json

$errors = @()
$warnings = @()

# Check schema_version
if (-not $json.schema_version) { $errors += "Missing schema_version" }
elseif ($json.schema_version -ne "2.0") { $warnings += "schema_version is $($json.schema_version), expected 2.0" }

# Required fields
$required = @("run_number", "extracted_at", "head_sha", "positive_trails", "negative_trails", "state_markers")
foreach ($field in $required) {
    if (-not $json.PSObject.Properties[$field]) { $errors += "Missing required field: $field" }
}

# Validate negative_trails structure
if ($json.PSObject.Properties['negative_trails']) {
    foreach ($nt in $json.negative_trails) {
        if (-not $nt.type -or $nt.type -ne "NEGATIVE") { $errors += "negative_trail missing type=NEGATIVE" }
        if (-not $nt.artifact) { $errors += "negative_trail missing artifact" }
        if (-not $nt.failure) { $errors += "negative_trail missing failure" }
        if (-not $nt.root_cause) { $errors += "negative_trail missing root_cause" }
        if (-not $nt.decay_days -or $nt.decay_days -ne 180) { $warnings += "negative_trail decay_days should be 180" }
        if (-not $nt.timestamp) { $errors += "negative_trail missing timestamp" }
    }
}

# Validate positive_trails structure
if ($json.PSObject.Properties['positive_trails']) {
    foreach ($pt in $json.positive_trails) {
        if (-not $pt.type -or $pt.type -ne "POSITIVE") { $errors += "positive_trail missing type=POSITIVE" }
        if (-not $pt.artifact) { $errors += "positive_trail missing artifact" }
        if (-not $pt.action) { $errors += "positive_trail missing action" }
        if (-not $pt.verification) { $errors += "positive_trail missing verification" }
        if (-not $pt.timestamp) { $errors += "positive_trail missing timestamp" }
    }
}

# Validate state_markers
if ($json.PSObject.Properties['state_markers']) {
    $smRequired = @("active_mission", "open_flags_count", "top_priority")
    foreach ($sm in $smRequired) {
        if (-not $json.state_markers.$sm) { $warnings += "state_markers missing $sm" }
    }
}

# Output
if ($errors.Count -gt 0) {
    Write-Host "VALIDATION FAILED ($($errors.Count) errors):" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  ERROR: $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "VALIDATION PASSED" -ForegroundColor Green
    exit 0
}
if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  WARN: $_" -ForegroundColor Yellow }
}

# Auto-fix common issues
if ($AutoFix -and $errors.Count -gt 0) {
    Write-Host "Auto-fix not yet implemented" -ForegroundColor Cyan
}