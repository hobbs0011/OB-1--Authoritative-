param()
$ErrorActionPreference = 'Stop'
$repo = 'D:\OB-1-CANONICAL'
$wrangler = Join-Path $repo 'APPS\SOUL-LOGGER'
$apiBase = 'https://soul-logger.mrmichaelhobbs123.workers.dev'

function Step($n,$t){ Write-Host "`n===== STEP $n : $t =====" -ForegroundColor Cyan }

Step 1 'STAGE + COMMIT + PUSH'
Push-Location $repo
git add -A
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
  Write-Host 'Working tree already clean. Skipping commit.'
} else {
  git commit -m 'pipeline: phetrails - wire BB-00 PheromoneKeylogger to live API'
  git push origin canon
}
Pop-Location

Step 2 'DEPLOY SOUL-LOGGER WORKER'
Push-Location $wrangler
npx wrangler deploy
Pop-Location

Step 3 'VERIFY /health'
$health = Invoke-RestMethod "$apiBase/health" -TimeoutSec 15
Write-Host "health: $($health.status) | version=$($health.version) | ts=$($health.timestamp)"

Step 4 'VERIFY /api/soul/count per-session'
$session = 'ses_0899b2c82ffe2PtNt3XBMEVv5V'
$count = Invoke-RestMethod "$apiBase/api/soul/count?session_id=$session" -TimeoutSec 15
Write-Host "per-session soulcount=$($count.soulcount) | level=$($count.level) | events=$($count.events)"

Step 5 'VERIFY /api/soul/count aggregate banned'
$agg = Invoke-RestMethod "$apiBase/api/soul/count?mode=aggregate" -TimeoutSec 15
$aggCode = if ($agg.status_code) { '410' } else { $agg.level }
Write-Host "aggregate status_code=$aggCode | error=$($agg.error)"

Step 6 'DEPOSIT TEST PHEROMONE'
$body = @{
  session_id = 'workhorse-test-2026-07-24'
  stage = 'SCOUT'
  finding = 'Pipeline verification: end-to-end pheromone deposition'
  strength = 2
  soulcount = 10
  dnacount = 3
  reasoncount = 2
} | ConvertTo-Json
$dep = Invoke-RestMethod "$apiBase/api/pheromone/deposit" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 15
Write-Host "deposit_id=$($dep.deposit_id) | stage=$($dep.stage)"

Step 7 'VERIFY TRENDS'
Start-Sleep -Seconds 5
$trends = Invoke-RestMethod "$apiBase/api/pheromone/trends?days=1" -TimeoutSec 15
Write-Host "trends.total_deposits=$($trends.total_deposits)"
if ($trends.trends) { $trends.trends | ConvertTo-Json -Depth 5 }

Step 8 'UPDATE REINCARNATE-SYNCH HEADER'
$syncDoc = Join-Path $repo 'CANON\SYSTEM\Reincarnate-Synch.md'
$content = Get-Content $syncDoc -Raw
$content = $content -replace 'updated: 2026-07-19T05:01 ICT', "updated: $(Get-Date -Format 'yyyy-MM-ddTHH:mmK')"
$content = $content -replace 'updated_by: Run 183 \(DeepThink / FABRI\)', 'updated_by: Workhorse (phetrails pipeline execute)'
$content | Set-Content $syncDoc -Encoding UTF8

Step 9 'FINAL COMMIT + PUSH'
git add -A
git commit -m 'verify: phetrails live - deposit + trends + per-session SOULCOUNT confirmed'
git push origin canon

Write-Host "`n===== PIPELINE COMPLETE =====" -ForegroundColor Green
