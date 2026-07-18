param()
$inputPath = "OPERATIONS/CLASS-INTEL/voice-260713-180332-transcript.json"
$outputPath = "OPERATIONS/CLASS-INTEL/voice-260713-180332-transcript.txt"

if (-not (Test-Path $inputPath)) {
    Write-Host "Input file not found"
    exit 1
}

$json = Get-Content $inputPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lines = @()

foreach ($channel in $json.results.channels) {
    foreach ($alt in $channel.alternatives) {
        if ($alt.transcript) {
            $speaker = "SPEAKER_UNKNOWN"
            if ($channel -ne $null) {
                # Try to infer speaker from channel index if available
                $speaker = "SPEAKER_$($channel.PSObject.Properties | Where-Object { $_.Name -eq 'speaker' } | Select-Object -ExpandProperty Value)"
            }
            $lines += "$speaker`: $($alt.transcript)"
        }
    }
}

$lines | Out-File $outputPath -Encoding UTF8
Write-Host "Transcript extracted to $outputPath ($($lines.Count) lines)"
