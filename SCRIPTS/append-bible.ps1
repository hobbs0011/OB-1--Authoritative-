param([int[]]$Runs = 80..85)

$biblePath = "D:\OB-1-CANONICAL\CANON\SOUL\BIBLE-OF-THE-SYSTEM.json"
$rrlDir = "D:\OB-1-CANONICAL\RRL\"

$bible = Get-Content $biblePath -Raw | ConvertFrom-Json
$existingRunSet = [System.Collections.Generic.HashSet[int]]($bible.entries | ForEach-Object { [int]$_.run })

foreach ($run in $Runs) {
    if ($existingRunSet.Contains($run)) { Write-Host "Run $run already in Bible — skip"; continue }

    # Real JSONL (RRL-0NN.txt) preferred over small format (RRL-N.txt)
    $realPath = $rrlDir + "RRL-" + $run.ToString("D3") + ".txt"
    $smallPath = $rrlDir + "RRL-$run.txt"
    $useReal = Test-Path $realPath
    $filePath = if ($useReal) { $realPath } else { $smallPath }
    $source = Split-Path $filePath -Leaf

    if (-not (Test-Path $filePath)) { Write-Host "Run $($run) no RRL file found — skip"; continue }

    $newEntries = @()
    Get-Content $filePath | ForEach-Object {
        $obj = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
        if (-not $obj) { return }

        if ($useReal) {
            # Real JSONL: top-level type="user", message.content[] array
            if ($obj.type -ne "user") { return }
            foreach ($c in $obj.message.content) {
                if ($c.type -eq "text" -and $c.text) {
                    $newEntries += [ordered]@{ run=$run; source=$source; text=$c.text; char_count=$c.text.Length }
                }
            }
        } else {
            # Small format: display/pastedContents
            if ($obj.display -match '^\[Pasted text') { return }
            $pastedText = $null
            if ($obj.pastedContents) {
                $pastedText = ($obj.pastedContents.PSObject.Properties.Value | ForEach-Object { $_.content } | Where-Object { $_ -and $_.Trim().Length -gt 20 }) -join "`n`n"
            }
            $text = if ($pastedText -and $pastedText.Trim().Length -gt 20) { $pastedText } else { $obj.display }
            if ($text) {
                $newEntries += [ordered]@{ run=$run; source=$source; text=$text; char_count=$text.Length }
            }
        }
    }

    $bible.entries += $newEntries
    Write-Host "Run $run ($source): +$($newEntries.Count) entries"
}

$bible.total_entries = $bible.entries.Count
$uniqueRuns = ($bible.entries | ForEach-Object { $_.run } | Sort-Object -Unique).Count
$bible | ConvertTo-Json -Depth 4 -Compress | Set-Content $biblePath -Encoding UTF8
Write-Host "Bible updated: $($bible.total_entries) total entries, $uniqueRuns unique runs"

