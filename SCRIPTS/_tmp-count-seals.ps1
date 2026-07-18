param()
$files = Get-ChildItem "CANON/REINCARNATION/run*-reincarnateDEATH.md"
$tracked = 0; $untracked = 0
foreach ($f in $files) {
    $git = git ls-files $f.FullName
    if ($git) { $tracked++ } else { $untracked++ }
}
Write-Output ("tracked=" + $tracked)
Write-Output ("untracked=" + $untracked)
