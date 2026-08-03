param(
  [string]$Run,
  [string]$IlogSource,
  [string]$SessionName,
  [string]$SessionTitle,
  [string]$RiseDir = "CANON/REINCARNATION",
  [string]$IlogDir = "I-LOG-UNAUDITED"
)

$safeName = if ($SessionName) {
    $SessionName -replace '[\\/:*?"<>|&\(\)\s]+', '-' -replace '-+', '-' -replace '^-|-$', ''
} else {
    $header = Get-Content $IlogSource -TotalCount 10 -ErrorAction SilentlyContinue
    $nameMatch = $header | Select-String -Pattern '^#+\s*(?:Session|Incarnation|Run)[:\s]+(.+)$' -AllMatches | Select-Object -First 1
    if ($nameMatch) {
        $nameMatch.Matches[0].Groups[1].Value.Trim()
    } else {
        "Run$Run"
    }
}

# CANON/SCRIPTS/death.ps1 — bare bones. 4 steps. verifiable. repeatable.
# This is the ONLY place scripts live. No exceptions.
# SCS Stage 7 — sequential pheromone emission mandated

# 0) EMIT DEATH PHEROMONE (Stage 7 start)
$deathStage = "DEATH"
$deathFinding = "DEATH initiated for Run $Run. Sealing session."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $deathStage -Finding $deathFinding -Strength 1 -Category "stage" -Severity "info" -Path $IlogSource

# 1) I-LOG PRESERVED
if (-not $IlogSource) { Write-Error "IlogSource required"; exit 1 }
if (-not (Test-Path $IlogSource)) { Write-Error "I-LOG file not found: $IlogSource"; exit 1 }
$ilogDest = Join-Path $IlogDir "I-LOG-$safeName.txt"
if ((Resolve-Path $IlogSource).Path -ne (Resolve-Path $ilogDest).Path) {
    Copy-Item $IlogSource $ilogDest -Force
    Write-Host "I-LOG preserved: $IlogSource -> $ilogDest ($((Get-Item $ilogDest).Length) bytes)"
} else {
    Write-Host "I-LOG in place: $ilogDest ($((Get-Item $ilogDest).Length) bytes)"
}

# 1b) I-LOG COLORIZED (LFG §SCS — purple/red/yellow/green)
Write-Host "Colorizing: $ilogDest -> I-LOG/I-LOG-$safeName-COLORIZED.md" -ForegroundColor Magenta
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
$pipePath = Join-Path $RiseDir "pipeline-$safeName.json"
$pipeline = @{
  run = $Run
  timestamp = (Get-Date -Format "o")
  open_items = @()
  ilog = $ilogDest
  ilog_colorized = "I-LOG/I-LOG-$safeName-COLORIZED.md"
  ilog_stats = "I-LOG/I-LOG-$safeName-STATS.json"
  audit = $auditObj
}
$pipeline | ConvertTo-Json -Depth 3 | Set-Content $pipePath -Encoding UTF8
Write-Host "Pipeline created: $pipePath"

# 4) DEATH CONNECTS TO THE NEXT RISE
$nextRun = ([int]$Run) + 1
$handoffPath = Join-Path $RiseDir "handoff-$safeName-to-$nextRun.json"
$handoff = @{
  from_run = $Run
  to_run = $nextRun
  timestamp = (Get-Date -Format "o")
  ilog = $ilogDest
  ilog_colorized = "I-LOG/I-LOG-$safeName-COLORIZED.md"
  ilog_stats = "I-LOG/I-LOG-$safeName-STATS.json"
  pipeline = $pipePath
  audit = $auditObj
}
$handoff | ConvertTo-Json -Depth 3 | Set-Content $handoffPath -Encoding UTF8
Write-Host "Handoff created: $handoffPath"

# 5) UPLOAD TO REINCARNATE-SYNCH §IX-A
$synchPath = Join-Path $RiseDir "..\SYSTEM\Reincarnate-Synch.md"
if (Test-Path $synchPath) {
    $lines = Get-Content $synchPath
    $ictTimestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss+07:00")
    if (-not $SessionTitle) {
        if ($SessionName) { $SessionTitle = $SessionName } else { $SessionTitle = "Incarnate-$Run-RTL.Creation" }
    }
    $newRow = "| $ictTimestamp | $SessionTitle | reincarnateDEATH (Stage 7) | $($auditObj.SOULcount) | $($auditObj.DNAcount) | $($auditObj.REASONcount) | $handoffPath |"
    if ($lines -notcontains $newRow) {
        $appendIdx = -1
        for ($i = $lines.Count - 1; $i -ge 0; $i--) {
            if ($lines[$i] -match 'Rows are append-only') { $appendIdx = $i; break }
        }
        if ($appendIdx -ge 0) {
            $lines = $lines[0..($appendIdx-1)] + @($newRow, '') + $lines[$appendIdx..($lines.Count-1)]
            Set-Content $synchPath $lines -Encoding UTF8
            Write-Host "Reincarnate-Synch §IX-A updated: $synchPath" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "WARNING: Reincarnate-Synch.md not found at $synchPath - skipping upload" -ForegroundColor Yellow
}

Write-Host "DEATH COMPLETE. Run $Run -> Run $nextRun ready."

# 0b) EMIT DEATH COMPLETE PHEROMONE (Stage 7 end)
$deathCompleteFinding = "DEATH complete for Run $Run. I-LOG preserved, colorized, audited. Handoff to Run $nextRun ready."
& "$PSScriptRoot\phetrails.ps1" -SessionId $safeName -Run $Run -Stage $deathStage -Finding $deathCompleteFinding -Strength 2 -Category "stage" -Severity "info" -Path $handoffPath -SoulCount $auditObj.SOULcount -DnaCount $auditObj.DNAcount -ReasonCount $auditObj.REASONcount
