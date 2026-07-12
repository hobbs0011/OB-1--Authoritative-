param([string]$File='D:\OB-1-CANONICAL\CANON\REINCARNATION\run157-reincarnateDEATH.md')
$text = [System.IO.File]::ReadAllText($File)
$sectionMarker = '§'
$old = '## ' + $sectionMarker + '9 -- Unfinished Actions'
$idx = $text.IndexOf($old)
Write-Output ('OLD_STRING: ' + $old)
Write-Output ('IDX: ' + $idx)
if($idx -lt 0){
  $lines = $text -split "`n"
  for($i=0; $i -lt $lines.Length; $i++){
    if($lines[$i].Contains('Unfinished Actions')){
      Write-Output ('FOUND_LINE: ' + $i)
      Write-Output ('LINE_TEXT: ' + $lines[$i])
      $lineBytes = [System.Text.Encoding]::UTF8.GetBytes($lines[$i])
      Write-Output ('LINE_BYTES: ' + [System.BitConverter]::ToString($lineBytes))
      break
    }
  }
}
