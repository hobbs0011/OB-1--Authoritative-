param(
  [string]$Run,
  [string]$IlogSource,
  [string]$RiseDir = "CANON/REINCARNATION",
  [string]$IlogDir = "I-LOG"
)

# CANON/SCRIPTS/death.ps1 — bare bones. 4 steps. verifiable. repeatable.
# This is the ONLY place scripts live. No exceptions.

# 1) I-LOG PRESERVED
if (-not $IlogSource) { Write-Error "IlogSource required"; exit 1 }
if (-not (Test-Path $IlogSource)) { Write-Error "I-LOG file not found: $IlogSource"; exit 1 }
$ilogDest = Join-Path $IlogDir "I-LOG-$Run.txt"
if ((Resolve-Path $IlogSource).Path -ne (Resolve-Path $ilogDest).Path) {
    Copy-Item $IlogSource $ilogDest -Force
    Write-Host "I-LOG preserved: $IlogSource -> $ilogDest ($((Get-Item $ilogDest).Length) bytes)"
} else {
    Write-Host "I-LOG in place: $ilogDest ($((Get-Item $ilogDest).Length) bytes)"
}

# 1b) I-LOG COLORIZED (LFG §SCS — purple/red/yellow/green)
Write-Host "Colorizing: $ilogDest -> I-LOG/I-LOG-$Run-COLORIZED.md" -ForegroundColor Magenta
$colorStats = & "$PSScriptRoot\rrl-colorize.ps1" -InputFile $ilogDest
Write-Host "COLORIZED: SOUL=$($colorStats.SOULcount) DNA=$($colorStats.DNAcount) REASON=$($colorStats.REASONcount) PHEROMONE=$($colorStats.PHEROMONEcount)" -ForegroundColor Green

# 2) SCS AUDIT
$auditJs = @"
const fs = require('fs');
const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean);
const msgs = lines.map(l => JSON.parse(l));
const user = msgs.filter(m => m.role === 'user').length;
const asst = msgs.filter(m => m.role === 'assistant').length;
const reason = msgs.filter(m => m.content && m.content.some(c => c.type === 'reasoning')).length;
const first = msgs[0], last = msgs[msgs.length - 1];
console.log(JSON.stringify({
  SOULcount: user,
  DNAcount: asst,
  REASONcount: reason,
  total: msgs.length,
  first_utc: new Date(first.time).toISOString(),
  last_utc: new Date(last.time).toISOString(),
  duration_min: Math.round((last.time - first.time) / 60000)
}));
"@
$auditTmp = Join-Path $PSScriptRoot '_audit_tmp.js'
[System.IO.File]::WriteAllText($auditTmp, $auditJs, [System.Text.UTF8Encoding]::new($false))
$auditOut = node $auditTmp $IlogSource 2>$null | Out-String
$auditObj = $auditOut | ConvertFrom-Json
Write-Host "SCS AUDIT: SOUL=$($auditObj.SOULcount) DNA=$($auditObj.DNAcount) REASON=$($auditObj.REASONcount) msgs=$($auditObj.total)"
Remove-Item $auditTmp -Force -ErrorAction SilentlyContinue

# 3) OPEN UNFINISHED THINGS PIPELINED
$pipePath = Join-Path $RiseDir "pipeline-$Run.json"
$pipeline = @{
  run = $Run
  timestamp = (Get-Date -Format "o")
  open_items = @()
  ilog = $ilogDest
  ilog_colorized = "I-LOG/I-LOG-$Run-COLORIZED.md"
  ilog_stats = "I-LOG/I-LOG-$Run-STATS.json"
  audit = $auditObj
}
$pipeline | ConvertTo-Json -Depth 3 | Set-Content $pipePath -Encoding UTF8
Write-Host "Pipeline created: $pipePath"

# 4) DEATH CONNECTS TO THE NEXT RISE
$nextRun = ([int]$Run) + 1
$handoffPath = Join-Path $RiseDir "handoff-$Run-to-$nextRun.json"
$handoff = @{
  from_run = $Run
  to_run = $nextRun
  timestamp = (Get-Date -Format "o")
  ilog = $ilogDest
  ilog_colorized = "I-LOG/I-LOG-$Run-COLORIZED.md"
  ilog_stats = "I-LOG/I-LOG-$Run-STATS.json"
  pipeline = $pipePath
  audit = $auditObj
}
$handoff | ConvertTo-Json -Depth 3 | Set-Content $handoffPath -Encoding UTF8
Write-Host "Handoff created: $handoffPath"
Write-Host "DEATH COMPLETE. Run $Run -> Run $nextRun ready."
