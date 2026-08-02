param(
    [string]$IndexFile
)

$index = Get-Content $IndexFile -Raw | ConvertFrom-Json
$newIndex = @{}
foreach ($prop in $index.PSObject.Properties) {
    $name = $prop.Name
    $value = $prop.Value
    if (-not $newIndex[$name]) {
        $newIndex[$name] = $value
    }
}

$output = "{"
$first = $true
foreach ($key in ($newIndex.Keys | Sort-Object)) {
    if (-not $first) { $output += "," }
    $output += $nl + "    """ + $key + """: " + ($newIndex[$key] | ConvertTo-Json -Depth 2 -Compress)
    $first = $false
}
$output += $nl + "}" + $nl

Set-Content -Path $IndexFile -Value $output -Encoding UTF8
Write-Host "Deduplicated: $IndexFile"
$props = (Get-Content $IndexFile -Raw | ConvertFrom-Json).PSObject.Properties
Write-Host "Total unique keywords: $($props.Count)"
