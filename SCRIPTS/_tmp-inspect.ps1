param([string]$File='D:\OB-1-CANONICAL\CANON\REINCARNATION\run157-reincarnateDEATH.md',[int]$Line1=47,[int]$Line2=51)
$lines = Get-Content $File
$i=1
foreach($l in $lines){
  if($i -ge $Line1 -and $i -le $Line2){
    Write-Output ("[{0}] {1}" -f $i, $l)
  }
  $i++
}
