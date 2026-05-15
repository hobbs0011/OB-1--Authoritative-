$ErrorActionPreference = "Stop"
$phrases = @(
  "go slow to go fast",
  "do it in short stages",
  "DO NOT RESUME OPERATIONS",
  "This is OP-ImposterKill",
  "do not preform the final merge",
  "delete duplicated",
  "Map it out in 20 stages",
  "soft reset",
  "put this on the backburner for now",
  "MURDER MURDER KILL DEATH TO ALL DUPLICATE FOLDERS",
  "you crashed..",
  "home base folder name change",
  "ONLY OB-1 reporoot folder going forward",
  "audit the merge file",
  "kill until all has been consolodated and merged",
  "we will not do the final merge",
  "scan the entire C drive now",
  "move them to D drive under new folder called FinalMerge",
  "look into where we are at on our profile for student Huong",
  "for now consolodate all that",
  "build an impressive looking gospel 444 compliant portion for her",
  "Remember fireworks!",
  "SELL NET",
  "Googogogog",
  "proceed"
)
$mergePath = "D:\OB-1\CANON\REINCARNATION\2026-04-16-run304-reincarnatedeath-merge-session.md"
$logPath = "D:\OB-1\REINCARNATION-LOG.md"
$rows = @()
foreach($p in $phrases){
  $inMerge = [bool](Select-String -Path $mergePath -Pattern $p -SimpleMatch -ErrorAction SilentlyContinue)
  $inLog = [bool](Select-String -Path $logPath -Pattern $p -SimpleMatch -ErrorAction SilentlyContinue)
  $rows += [pscustomobject]@{ phrase=$p; in_merge=$inMerge; in_reincarnation_log=$inLog }
}
$capturedMerge = ($rows | Where-Object { $_.in_merge }).Count
$missedMerge = ($rows | Where-Object { -not $_.in_merge }).Count
$capturedAny = ($rows | Where-Object { $_.in_merge -or $_.in_reincarnation_log }).Count
$missedAny = ($rows | Where-Object { -not ($_.in_merge -or $_.in_reincarnation_log) }).Count
$summary = [pscustomobject]@{
  total_phrases = $phrases.Count
  captured_in_merge = $capturedMerge
  missed_in_merge = $missedMerge
  captured_in_any_artifact = $capturedAny
  missed_in_any_artifact = $missedAny
}
$report = [pscustomobject]@{ summary=$summary; rows=$rows }
$reportPath = "D:\OB-1\OPERATIONS\OP-IMPOSTERKILL\SOULDNA-DICTATES-COVERAGE-AUDIT-2026-04-16.json"
$report | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 $reportPath
$summary | ConvertTo-Json -Compress
Write-Host "REPORT=$reportPath"
