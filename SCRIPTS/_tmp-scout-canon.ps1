$ErrorActionPreference='SilentlyContinue'
$base='CANON'
$ts=(Get-Date -Format 'yyyy-MM-ddTHHmmss')
$report="OPERATIONS/phoenix-scout-$ts.jsonl"
$learned="OPERATIONS/phetrail-scout-learned-$ts.md"
$total=(Get-ChildItem $base -Recurse -File).Count
Write-Host "ZONE: $base FILES: $total"
$seq=0
$flags=@()
Get-ChildItem $base -Recurse -File | ForEach-Object {
  $rel=$_.FullName.Substring((Resolve-Path $base).Path.Length+1)
  if($_.Extension -eq '.json'){
    try {
      $j=Get-Content $_.FullName -Raw|ConvertFrom-Json
      if($j -and $j.PSObject.Properties.Name -notcontains 'no_fabrication'){
        $seq++
        $flags += [pscustomobject]@{
          scout_id="SC-$ts-$seq"
          priority='P2'
          type='LEDGER'
          status='ORPHAN'
          file=$rel
          line=1
          excerpt=($j|ConvertTo-Json -Compress).Substring(0, [Math]::Min(120, ($j|ConvertTo-Json -Compress).Length))
          bytes=$_.Length
          reason='JSON missing no_fabrication attestation'
          learned='Attestation scan must check PSObject.Properties.Name'
          next='Append attestation unless raw capture'
        }
      }
    } catch {}
  }
  $first=Get-Content $_.FullName -TotalCount 20 -ErrorAction SilentlyContinue
  $text=$first -join "`n"
  foreach($m in @('UNMINED','UNTOUCHED','STALE','FROZEN','PHANTOM')){
    if($text -match $m){
      $seq++
      $flags += [pscustomobject]@{
        scout_id="SC-$ts-$seq"
        priority='P2'
        type='SOUL'
        status=$m
        file=$rel
        line=1
        excerpt=$text.Substring(0,[Math]::Min(120,$text.Length))
        bytes=$_.Length
        reason=("$m marker in header")
        learned='Header marker scan detects unmined/stale sources'
        next='Route through extractor or update cursor'
      }
    }
  }
  if($text -match '> "'){
    $seq++
    $flags += [pscustomobject]@{
      scout_id="SC-$ts-$seq"
      priority='P1'
      type='SOUL'
      status='UNMINED'
      file=$rel
      line=1
      excerpt=$text.Substring(0,[Math]::Min(120,$text.Length))
      bytes=$_.Length
      reason='Raw Michael verbatim quote block'
      learned='Blockquote grep finds raw soul blocks needing D1 ingestion'
      next='Route through /api/soul/extract'
    }
  }
  if($text -match 'deepseek-v4|mrmichaelhobbs1234'){
    $seq++
    $flags += [pscustomobject]@{
      scout_id="SC-$ts-$seq"
      priority='P2'
      type='DRIFT'
      status='STALE'
      file=$rel
      line=1
      excerpt=$text.Substring(0,[Math]::Min(120,$text.Length))
      bytes=$_.Length
      reason='Legacy alias/domain reference'
      learned='Drift grep found stale model/domain referencing old identity'
      next='Update to canonical alias/domain'
    }
  }
}
foreach($f in $flags){ $f|ConvertTo-Json -Depth 4|Out-File -Append -Encoding UTF8 $report }
$p1=($flags|?{$_.priority -eq 'P1'}).Count
$p2=($flags|?{$_.priority -eq 'P2'}).Count
$p3=($flags|?{$_.priority -eq 'P3'}).Count
$soul=($flags|?{$_.type -eq 'SOUL'}).Count
$ledger=($flags|?{$_.type -eq 'LEDGER'}).Count
$drift=($flags|?{$_.type -eq 'DRIFT'}).Count
$summary=@"
================================================================================
PHOENIX SCOUT — $base
================================================================================
ZONE:          $base
FILES:         $total
FINDS:         $($flags.Count)
  P1 CRITICAL: $p1
  P2 HIGH:     $p2
  P3 MEDIUM:   $p3
BREAKDOWN:
  SOUL:    $soul
  LEDGER:  $ledger
  DRIFT:   $drift
REPORT:        $report
================================================================================
SCOUT COMPLETE. Flagged items ready for tier dispatch.
"@
$summary|Out-File -Encoding UTF8 $learned
Write-Host $summary
