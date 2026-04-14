Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Run from repo root to use the committed hooks directory.
git config core.hooksPath .githooks
Write-Host "Configured core.hooksPath=.githooks"
