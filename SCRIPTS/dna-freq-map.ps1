# DNA FREQUENCY MAP — CRUNCH-B-7 Anti-Parrot Pass
# Scans all 20 segments for [DNA:FLAG] markers, ranks by frequency

$segDir = 'C:\Users\mrmic\Desktop\OB-1\CANON\SOUL-SEGMENTS\OB_1_-CRUNCH-B-7__KEYKEY_'

$all = @()
Get-ChildItem $segDir -Filter '*.md' | ForEach-Object {
    $all += Select-String -Path $_.FullName -Pattern '[DNA:' -SimpleMatch
}
Write-Host "TOTAL_DNA_LINES: $($all.Count)"

$fc = @{}
$all | ForEach-Object {
    if ($_.Line -match '\[DNA:([^\]]+)\]') {
        $Matches[1].Split('|') | ForEach-Object { $fc[$_] = ($fc[$_] + 1) }
    }
}

Write-Host "`nRANK  COUNT  FLAG"
Write-Host "----  -----  ----"
$rank = 1
$fc.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 30 | ForEach-Object {
    "{0,4}  {1,5}  {2}" -f $rank, $_.Value, $_.Key
    $rank++
}
