$repo = "CANON"
$logFile = "merge-log-CANON.txt"

"Merge started at $(Get-Date)" | Out-File -FilePath $logFile -Encoding utf8
"====================================" | Out-File -FilePath $logFile -Append -Encoding utf8

$repoPath = (Resolve-Path $repo).Path

if (-Not (Test-Path $repo)) {
    "SKIP: Directory '$repo' not found" | Out-File -FilePath $logFile -Append -Encoding utf8
} else {
    "Processing repository: $repo (resolved: $repoPath)" | Out-File -FilePath $logFile -Append -Encoding utf8

    # Get all files in the repo, excluding .git and node_modules
    $files = Get-ChildItem -Path $repoPath -Recurse -File |
             Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' }

    $count = 0
    $skipped = 0
    foreach ($file in $files) {
        # Get relative path by stripping repo path prefix
        $relPath = $file.FullName.Substring($repoPath.Length + 1)
        $targetPath = Join-Path -Path $PWD -ChildPath $relPath

        if (Test-Path $targetPath) {
            #"SKIP: $relPath (already exists)" | Out-File -FilePath $logFile -Append -Encoding utf8
            $skipped++
        } else {
            $targetDir = Split-Path -Path $targetPath -Parent
            if (-Not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item -Path $file.FullName -Destination $targetPath
            "COPY: $relPath" | Out-File -FilePath $logFile -Append -Encoding utf8
            $count++
        }
    }

    "Finished processing $repo. Copied $count new files. Skipped $skipped existing files." | Out-File -FilePath $logFile -Append -Encoding utf8
}

"====================================" | Out-File -FilePath $logFile -Append -Encoding utf8
"Merge completed at $(Get-Date)" | Out-File -FilePath $logFile -Append -Encoding utf8
"See $logFile for details" | Out-File -FilePath $logFile -Append -Encoding utf8