# Augment dna-registry-run142.json with missing TRAIN-67 entries
param([string]$RegistryPath = "D:\OB-1-CANONICAL\CANON\REGISTRY\dna-registry-run142.json")
$ErrorActionPreference = "SilentlyContinue"
$repo = "D:\OB-1-CANONICAL"

$reg = Get-Content $RegistryPath -Raw | ConvertFrom-Json
$existingPaths = @{}
foreach ($e in $reg.all_entries) { $existingPaths[$e.path] = $true }

$scanRoots = @(
    "$repo\CANON\TRAIN-67\CODE",
    "$repo\CANON\TRAIN-67\BATTLE-REPORT",
    "$repo\CANON\TRAIN-67\LAUNCH",
    "$repo\CANON\TRAIN-67\SPECS",
    "$repo\CANON\TRAIN-67\DOCS"
)

$newEntries = @()
foreach ($root in $scanRoots) {
    if (-not (Test-Path $root)) { continue }
    Get-ChildItem $root -Recurse -Filter "*.md" -ErrorAction SilentlyContinue | ForEach-Object {
        $rel = $_.FullName.Substring($repo.Length + 1)
        if ($existingPaths.ContainsKey($rel)) { return }
        if ($_.Length -le 50) { return }
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { return }
        $first200 = $content.Substring(0, [Math]::Min(200, $content.Length)).Replace("`n", " ").Replace("`r","")
        $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.Substring(0,12)
        $hashInput = $rel + "|" + $_.Length + "|" + $_.LastWriteTimeUtc.Ticks
        $regId = "REG-" + ((Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($hashInput))) -Algorithm SHA256).Hash.Substring(0,8)).ToUpper()
        $matchedKeywords = @()
        $idx = Get-Content "$repo\CANON\SOUL-KEYWORDS\inverted-index.json" -Raw | ConvertFrom-Json
        foreach ($kw in $idx.PSObject.Properties.Name) {
            if ($content -match [regex]::Escape($kw)) { $matchedKeywords += $kw }
        }
        $entry = [ordered]@{
            reg_id = $regId
            path = $rel
            size_bytes = $_.Length
            last_modified = $_.LastWriteTimeUtc.ToString("o")
            sha256_prefix = $hash
            category = "TRAIN-67"
            first_tokens = $first200
            keyword_hits = $matchedKeywords.Count
            top_keywords = ($matchedKeywords | Sort-Object { $idx[$_].weight } -Descending | Select-Object -First 10)
            linked_stages = @("ALL")
        }
        $newEntries += [pscustomobject]$entry
    }
}

if ($newEntries.Count -gt 0) {
    $reg.all_entries += $newEntries
    $reg.total_entries = $reg.all_entries.Count
    $reg | ConvertTo-Json -Depth 6 | Set-Content $RegistryPath -Encoding UTF8
    Write-Host "Added $($newEntries.Count) new TRAIN-67 entries to registry"
    Write-Host "New total: $($reg.total_entries)"
} else {
    Write-Host "No new entries found"
}
