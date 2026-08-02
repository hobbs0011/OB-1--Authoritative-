param(
    [string]$IndexFile,
    [string]$RfkwDir
)

$index = Get-Content $IndexFile -Raw | ConvertFrom-Json
$nl = [Environment]::NewLine

$files = Get-ChildItem -Path $RfkwDir -Filter "rfkw-*.txt"
foreach ($f in $files) {
    $lines = Get-Content $f.FullName
    $sessionName = ""
    foreach ($line in $lines) {
        if ($line -match '^# SOUL-KEYWORDS for (.+)$') {
            $sessionName = $Matches[1]
            break
        }
    }
    if (-not $sessionName) { continue }
    
    foreach ($line in $lines) {
        if ($line -match '^\d+ \| (.+)$') {
            $word = $Matches[1]
            if (-not $index.PSObject.Properties[$word]) {
                $index | Add-Member -NotePropertyName $word -NotePropertyValue @{run=$sessionName; category="extracted"; weight=1}
            }
        }
    }
}

$index | ConvertTo-Json -Depth 3 | Set-Content $IndexFile -Encoding UTF8
Write-Host "Updated: $IndexFile"
$props = $index.PSObject.Properties
Write-Host "Total keywords: $($props.Count)"
