<#
Force-seal run 154 (one-shot, no idempotency checks).
#>
param()

$ErrorActionPreference = "Stop"
$repo = "D:\OB-1-CANONICAL"
$ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"

$rrlPath = Join-Path $repo "RRL\RRL-154.txt"
if (-not (Test-Path $rrlPath)) { "" | Set-Content $rrlPath -Encoding UTF8 }

$ledgerDir = Join-Path $repo "CANON\HEAVY-LEDGER"
$lastHL = Get-ChildItem $ledgerDir -Filter "HL-*.json" | Sort-Object Name | Select-Object -Last 1
$nextHL = [int]($lastHL.BaseName -replace 'HL-','') + 1
$parent = (Get-Content $lastHL.FullName -Raw | ConvertFrom-Json).merkle_hash

$soul = 0; try { $soul = (Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count").soulcount } catch {}

$dnaText = Get-Content $rrlPath -Raw -Encoding UTF8
$dnaBytes = [System.Text.Encoding]::UTF8.GetBytes($dnaText)
$dnaHash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash($dnaBytes)) -replace '-',''

$ledger = [ordered]@{
    run = 154
    timestamp = $ts
    parent = $parent
    merkle_parent = $parent
    soul = $soul
    dna = $dnaHash
    stage2 = "RRL"
    stage3 = "RRL-154.txt"
    result = "KILO_GAP"
    seal = "AUTO"
    sov100 = $true
} | ConvertTo-Json -Depth 5
$hlPath = Join-Path $ledgerDir ("HL-" + $nextHL + ".json")
Set-Content $hlPath $ledger -Encoding UTF8

Write-Host "LEDGER HL-$nextHL sealed"

$starmap = [ordered]@{ run=154; pointers=@{}; generated_at=$ts } | ConvertTo-Json
Set-Content (Join-Path $repo "CANON/STARMAP/starmap-run154.json") $starmap -Encoding UTF8
Write-Host "STARMAP ok"

Set-Content (Join-Path $repo "CANON/SOUL-KEYWORDS/rfkw-run154.txt") "" -Encoding UTF8
Write-Host "SOULKEYS ok"

$pipe = [ordered]@{ run=154; result="KILO_GAP"; timestamp=$ts } | ConvertTo-Json
Set-Content (Join-Path $repo "CANON/PIPELINE/pipeline-run154.json") $pipe -Encoding UTF8
Write-Host "PIPELINE ok"

$phetrail = [ordered]@{ run=154; head_sha=(git rev-parse --short HEAD); timestamp=$ts; result="KILO_GAP" } | ConvertTo-Json
Set-Content (Join-Path $repo "CANON/PHEROMONES/PheTrail-run154.json") $phetrail -Encoding UTF8
Write-Host "PHEROMONE ok"

$registry = [ordered]@{ run=154; head=(git rev-parse HEAD); timestamp=$ts } | ConvertTo-Json
Set-Content (Join-Path $repo "CANON/REGISTRY/registry-run154.json") $registry -Encoding UTF8
Write-Host "REGISTRY ok"

$seal = @"
# DEATH SEAL RUN 154

| § | Name | Content |
|---|---|---|
| 1 | HEADER | run 154 | $ts | FORCE-SEAL | KILO_GAP |
| 2 | RAW SOUL DNA | N/A |
| 3 | SOUL RECEIPT | soulcount=$soul |
| 4 | DECISIONS | Force-seal run 154 with KILO_GAP |
| 5 | CORRECTIONS | None |
| 6 | NEW PRINCIPLES | N/A |
| 7 | EMOTIONAL SIGNAL | N/A |
| 8 | OPEN QUESTIONS | N/A |
| 9 | UNFINISHED ACTIONS | N/A |
| 10 | SYSTEM DESIGN | N/A |
| 11 | ARTIFACTS | HL-$nextHL, starmap-run154.json, rfkw-run154.txt, pipeline-run154.json, PheTrail-run154.json, registry-run154.json |
| 12 | STATE SNAPSHOT | HEAD=$(git rev-parse --short HEAD), dirty=$(git status --porcelain | Measure-Object | Select-Object -ExpandProperty Count), soulcount=$soul |
| 13 | FINGERPRINT | force-seal run154 | HL-$nextHL | $(git rev-parse HEAD) |
"@
Set-Content (Join-Path $repo "CANON/REINCARNATION/run154-reincarnateDEATH.md") $seal -Encoding UTF8
Write-Host "SEAL ok"
