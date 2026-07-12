param([string]$File='D:\OB-1-CANONICAL\CANON\REINCARNATION\run157-reincarnateDEATH.md')
$lines = [System.IO.File]::ReadAllLines($File)
$lines[47] = '## `u00A79 -- Unfinished Actions'
$lines[48] = '- git add <paths> | git commit -m "death: run 157 artifacts"  -> CLOSED/UNRECOVERABLE. Pipeline-run157.json deleted via Remove-Item -Force against untracked git orphan; bypassed Recycle Bin; no recovery path. See Sec-16 EC-10 and Sec-17 for SupplyLines protocol gaps.'
[System.IO.File]::WriteAllLines($File, $lines, (New-Object System.Text.UTF8Encoding $true))
Write-Output 'LINES_UPDATED'
for($i=45; $i -lt 53; $i++){ Write-Output ("[{0}] {1}" -f $i, $lines[$i]) }
