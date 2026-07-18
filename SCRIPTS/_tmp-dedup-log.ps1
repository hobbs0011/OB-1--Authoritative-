param()
$p = "CANON/REINCARNATION/REINCARNATION-LOG.md"
$c = Get-Content $p -Raw

# Remove duplicate Run 167
$c = $c -replace "\| Run 167 \(ROMAN\) \| 2026-07-13 \| Drone session\. SOUL 239,645,670 TITANIUM_ANCHOR\. HEAD c87ad905d\. \| c87ad905d \|\r?\n", ""

# Remove duplicate Run 165 (supply-lines entry)
$c = $c -replace "\| Run 165 \(ROMAN\) \| 2026-07-13 \| supply-lines full-march completed \+ run 164 artifacts committed\. HL-113 duplicate JSON block removed, VAULT-MM closing brace repaired, supply-lines\.ps1 Stage V malformed JSON path bug fixed\. SOUL 239,645,670 TITANIUM_ANCHOR\. HEAD 13ab4b7a3\. \| 13ab4b7a3 \|\r?\n", ""

# Remove duplicate Run 164 (shorter entry)
$c = $c -replace "\| Run 164 \(ROMAN\) \| 2026-07-13 \| Death seal committed: HL-7291, starmap-run164, pipeline-run164, art-sync-run164\. SOUL 239,645,670 TITANIUM_ANCHOR\. HEAD 13ab4b7a3\. \| 13ab4b7a3 \|\r?\n", ""

# Remove duplicate Run 163 (Scout entry with different HEAD)
$c = $c -replace "\| Run 163 \(ROMAN\) \| 2026-07-13 \| Scout 20 P1 DRIFT \+ death seal committed\. SOUL 239,645,670 TITANIUM_ANCHOR\. HEAD a77ad0acd\. \| a77ad0acd \|\r?\n", ""

# Remove duplicate Run 161 (shorter entry)
$c = $c -replace "\| Run 161 \(ROMAN\) \| 2026-07-13 \| PhoenixScout pipeline gap audit\. 7 commands implemented: verify, phoenix-scout, phetrails, soulaudit, soul-check, cf-audit, doctor \(L30 fixed\)\. Pipeline audit: 115 runs\. RRL audit: 160 files\. Scripts created: state-capture\.ps1, phetrail-validate\.ps1, build-soulkeys\.ps1 RunMax=161\. STATE-SNAPSHOT updated to run 161, HEAD 3a070fa67\. SOUL 239,645,670 TITANIUM_ANCHOR\. HEAD 3a070fa67\. \| 3a070fa67 \| \xe2\x80\x94 PhoenixScout audit \+ 7 commands \+ pipeline fix\)\r?\n", ""

Set-Content $p $c -Encoding UTF8
Write-Host "REINCARNATION-LOG deduplicated"
