# Update inverted-index.json with missing critical keywords
param([string]$IndexPath = "D:\OB-1-CANONICAL\CANON\SOUL-KEYWORDS\inverted-index.json")
$ErrorActionPreference = "SilentlyContinue"

$idx = Get-Content $IndexPath -Raw | ConvertFrom-Json
$run = 142
$ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"

$newKeywords = @(
    "roblox",
    "survive",
    "brainrot",
    "zombie",
    "wave",
    "train",
    "survival",
    "enemy",
    "weapon",
    "prestige",
    "gacha",
    "battlepass",
    "gamepass",
    "pet",
    "aura",
    "guild",
    "day99",
    "rizz",
    "skibidi",
    "sigma",
    "ohio",
    "3d",
    "asset",
    "manifest",
    "roblox-studio",
    "robux",
    "crate",
    "boss",
    "day",
    "wave-survival"
)

foreach ($kw in $newKeywords) {
    $escaped = [regex]::Escape($kw)
    $existing = $idx.PSObject.Properties | Where-Object { $_.Name -eq $escaped }
    if (-not $existing) {
        $entry = [ordered]@{
            term = $kw
            weight = 10
            runs = @($run)
            count = 1
            category = "train-67"
        }
        $idx | Add-Member -NotePropertyName $kw -NotePropertyValue ([pscustomobject]$entry)
    }
}

$idx | ConvertTo-Json -Depth 10 | Set-Content $IndexPath -Encoding UTF8
Write-Host "INVERTED INDEX UPDATED: Added $($newKeywords.Count) keywords to $IndexPath"
