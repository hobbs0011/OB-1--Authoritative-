$repo = "CANON"
$logFile = "merge-log-CANON.txt"
"Merge started at $(Get-Date)" | Out-File -FilePath $logFile -Encoding utf8
"===================================" | Out-File -FilePath $logFile -Append -Encoding utf8

if (-Not (Test-Path $repo)) {
    "SKIP: Directory '$repo' not found" | Out-File -FilePath $logFile -Append -Encoding utf8
} else {
    "Processing repository: $repo" | Out-File -FilePath $logFile -Append -Encoding utf8
    
    # Get all files in the repo, excluding .git and node_modules
    $files = Get-ChildItem -Path $repo -Recurse -File | 
             Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch 'node_modules' }
    
    $count = 0
    foreach ($file in $files) {
        $relPath = $file.FullName.Substring($repo.Length + 1) # Remove repo\ prefix
        $targetPath = Join-Path -Path (Get-Location) -ChildPath $relPath
        
        if (Test-Path $targetPath) {
            "SKIP: $relPath (already exists)" | Out-File -FilePath $logFile -Append -Encoding utf8
        } else {
            # Ensure target directory exists
            $targetDir = Split-Path -Path $targetPath -Parent
            if (-Not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            
            # Copy the file
            Copy-Item -Path $file.FullName -Destination $targetPath
            "COPY: $relPath" | Out-File -FilePath $logFile -Append -Encoding utf8
            $count++
        }
    }
    
    "Finished processing $repo. Copied $count new files." | Out-File -FilePath $logFile -Append -Encoding utf8
}

"===================================" | Out-File -FilePath $logFile -Append -Encoding utf8
"Merge completed at $(Get-Date)" | Out-File -FilePath $logFile -Append -Encoding utf8