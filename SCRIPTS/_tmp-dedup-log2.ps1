param()
$p = "CANON/REINCARNATION/REINCARNATION-LOG.md"
$c = Get-Content $p -Raw

# Remove remaining Run 161 duplicate (first occurrence with trailing fragment)
$pattern = "| Run 161 (ROMAN) | 2026-07-13 | PhoenixScout pipeline gap audit. 7 commands implemented: verify, phoenix-scout, phetrails, soulaudit, soul-check, cf-audit, doctor (L30 fixed). Pipeline audit: 115 runs. RRL audit: 160 files. Scripts created: state-capture.ps1, phetrail-validate.ps1, build-soulkeys.ps1 RunMax=161. STATE-SNAPSHOT updated to run 161, HEAD 3a070fa67. SOUL 239,645,670 TITANIUM_ANCHOR. HEAD 3a070fa67. | 3a070fa67 | `0xe2`"
$c = $c -replace [regex]::Escape($pattern), ""

Set-Content $p $c -Encoding UTF8
Write-Host "Removed remaining Run 161 duplicate"
