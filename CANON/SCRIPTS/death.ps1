param(
  [string]$Run,
  [string]$RrlSource,
  [string]$RiseDir = "CANON/REINCARNATION",
  [string]$RrlDir = "RRL"
)

# CANON/SCRIPTS/death.ps1 — bare bones. 4 steps. verifiable. repeatable.
# This is the ONLY place scripts live. No exceptions.

# 1) RRL PRESERVED
if (-not $RrlSource) { Write-Error "RRLSource required"; exit 1 }
if (-not (Test-Path $RrlSource)) { Write-Error "RRL file not found: $RrlSource"; exit 1 }
$rrlDest = Join-Path $RrlDir "RRL-$Run.txt"
Copy-Item $RrlSource $rrlDest -Force
Write-Host "RRL preserved: $RrlSource -> $rrlDest ($((Get-Item $rrlDest).Length) bytes)"

# 2) SCS AUDIT
$audit = node -e "
const fs = require('fs');
const lines = fs.readFileSync('$($RrlSource -replace "'","''")', 'utf8').split('\n').filter(Boolean);
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
" 2>&1 | Out-String
$auditObj = $audit | ConvertFrom-Json
Write-Host "SCS AUDIT: SOUL=$($auditObj.SOULcount) DNA=$($auditObj.DNAcount) REASON=$($auditObj.REASONcount) msgs=$($auditObj.total)"

# 3) OPEN UNFINISHED THINGS PIPELINED
$pipePath = Join-Path $RiseDir "pipeline-$Run.json"
$pipeline = @{
  run = $Run
  timestamp = (Get-Date -Format "o")
  open_items = @()
  rrl = $rrlDest
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
  rrl = $rrlDest
  pipeline = $pipePath
  audit = $auditObj
}
$handoff | ConvertTo-Json -Depth 3 | Set-Content $handoffPath -Encoding UTF8
Write-Host "Handoff created: $handoffPath"
Write-Host "DEATH COMPLETE. Run $Run -> Run $nextRun ready."