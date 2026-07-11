$repoRoot = 'D:\OB-1-CANONICAL'
$cmdDir = Join-Path $repoRoot '.kilo\command'
$archiveDir = Join-Path $cmdDir 'archive'
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null

$dead = @(
  'audit','Centurion-Code','checker','class-preflight-6pm','debug','detective',
  'dnaREGISTRY','gateway','help','layer6-deploy-pipeline','layer6-kv-perf','ledger',
  'netpet-observability','netpet-preflight','ob1-scout-mission','obinet-reliability-blueprint',
  'PAA','PCCloud','PhoenixScout','reincarnate','reincarnaterise-FIXED','reincarnaterise',
  'report','romeprotocol','run105-audit-addendum','run105-pipeline','run106-p10-fix-blueprint',
  'soulcap','souldna','SoulSearch','ssm','stabilize','status','summarize','supersaiyan',
  'supplylines','sync','test-pipeline-the-gauntlet'
)

foreach ($d in $dead) {
  $src = Join-Path $cmdDir ($d + '.md')
  if (Test-Path $src) {
    Move-Item $src $archiveDir -Force
    Write-Output ('ARCHIVED: ' + $d)
  }
}
