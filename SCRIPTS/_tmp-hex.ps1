param([string]$File='D:\OB-1-CANONICAL\CANON\REINCARNATION\run157-reincarnateDEATH.md',[int]$ShowLine=47)
$bytes = [System.IO.File]::ReadAllBytes($File)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)
$lines = $text -split "`n"
$l = $lines[$ShowLine]
Write-Output ([System.BitConverter]::ToString([System.Text.Encoding]::UTF8.GetBytes($l)))
Write-Output $l
$lines2 = $text -split "`r`n"
Write-Output "CRLF count: $($lines2.Length)"
for($i=0; $i -lt $lines2.Length; $i++){ if($lines2[$i] -match 'Unfinished Actions'){ Write-Output ("CRLF line {0}: [{1}]" -f $i,$lines2[$i]); break } }
