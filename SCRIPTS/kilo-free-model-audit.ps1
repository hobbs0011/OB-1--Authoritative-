<#
  kilo-free-model-audit.ps1 — Queries Kilo Gateway /models endpoint and produces free-model intel report.
  Output: OPERATIONS/kilo-free-model-audit-{timestamp}.json
#>

$ENDPOINT = 'https://api.kilo.ai/api/gateway/models'
$REPORT_DIR = 'D:\OB-1-CANONICAL\OPERATIONS'
$timestamp = Get-Date -Format "yyyy-MM-ddTHHmmss"

try {
  $response = Invoke-RestMethod -Uri $ENDPOINT -Method Get -ErrorAction Stop
} catch {
  Write-Error "Failed to fetch models: $_"
  exit 1
}

$freeModels = @()
$autoTiers = @()
$totalModels = 0

foreach ($entry in $response.PSObject.Properties) {
  $totalModels++
  $id = $entry.Name
  $meta = $entry.Value

  $provider = $meta.provider
  if (-not $provider) { $provider = $meta.owned_by }
  if (-not $provider) { $provider = 'unknown' }

  $pricing = $meta.pricing
  $input = 0
  $output = 0
  if ($pricing) {
    $input = [double]$pricing.prompt
    $output = [double]$pricing.completion
    if (-not $input -and $pricing.input) { $input = [double]$pricing.input }
    if (-not $output -and $pricing.output) { $output = [double]$pricing.output }
  }

  $isFree = $false
  if ($input -eq 0 -and $output -eq 0) {
    $isFree = $true
  }

  $obj = [ordered]@{
    id = $id
    provider = $provider
    context_length = $meta.context_length
    capabilities = @($meta.capabilities)
    free = $isFree
    pricing = $pricing
  }

  if ($isFree) {
    $freeModels += $obj
  }

  if ($id -like 'kilo-auto/*') {
    $autoTiers += $obj
  }
}

$report = [ordered]@{
  timestamp = (Get-Date).ToISOString()
  endpoint = $ENDPOINT
  summary = [ordered]@{
    total_models = $totalModels
    free_count = $freeModels.Count
    auto_tiers = $autoTiers.Count
  }
  free_models = $freeModels | ForEach-Object {
    [ordered]@{
      id = $_.id
      provider = $_.provider
      context_length = $_.context_length
      capabilities = $_.capabilities
      pricing = $_.pricing
    }
  }
  auto_tiers = $autoTiers | ForEach-Object {
    [ordered]@{
      id = $_.id
      provider = $_.provider
      description = ($_.capabilities -join ', ')
    }
  }
  decision_matrix = @(
    [ordered]@{ need = 'Consistency/reproducibility'; pick = 'stepfun/step-3.7-flash:free'; why = 'Fixed model, predictable output' }
    [ordered]@{ need = 'Best available free now'; pick = 'kilo-auto/free'; why = 'Server picks strongest candidate per session' }
    [ordered]@{ need = 'Code-specific tasks'; pick = 'poolside/laguna-m.1:free'; why = 'Purpose-built for code' }
    [ordered]@{ need = 'Avoid prompt logging'; pick = 'Avoid Auto Free + NVIDIA'; why = 'Data handling warning applies' }
    [ordered]@{ need = 'High-volume automation'; pick = 'Monitor kilo.ai/models live'; why = 'Free models rotate; need live view' }
  )
}

$filePath = Join-Path $REPORT_DIR "kilo-free-model-audit-$timestamp.json"
$report | ConvertTo-Json -Depth 5 | Out-File -FilePath $filePath -Encoding UTF8

Write-Host "=== KILO FREE MODEL AUDIT ==="
Write-Host "Total models: $totalModels"
Write-Host "Free models: $($freeModels.Count)"
Write-Host "Auto tiers: $($autoTiers.Count)"
Write-Host ""
Write-Host "FREE MODELS:"
foreach ($m in $freeModels) {
  Write-Host "  $($m.id) ($($m.provider)) -- ctx=$($m.context_length)"
}
Write-Host ""
Write-Host "AUTO TIERS:"
foreach ($m in $autoTiers) {
  Write-Host "  $($m.id) ($($m.provider))"
}
Write-Host ""
Write-Host "Report: $filePath"
Write-Host "Decision matrix: see report"
