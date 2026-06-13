# Deepgram Transcription Script — BlueTech class audio goldmine
# Run: pwsh -File SCRIPTS/transcribe-voices.ps1
# PREREQUISITE: $env:DEEPGRAM_API_KEY must be set
# Outputs: OPERATIONS/CLASS-INTEL/<label>/<label>-raw.json + <label>-transcript.txt

if (-not $env:DEEPGRAM_API_KEY) {
    Write-Error "DEEPGRAM_API_KEY not set. Run: `$env:DEEPGRAM_API_KEY = '891891df...'"
    exit 1
}

$files = @(
    @{ path = "C:\Users\mrmic\Downloads\Telegram Desktop\Voice 260611_181619.m4a"; label = "2026-06-11-huong" },
    @{ path = "C:\Users\mrmic\Downloads\Telegram Desktop\Voice 260610_180150.m4a"; label = "2026-06-10-mai-tram" }
)

$baseOutputDir = "D:\OB-1-CANONICAL\OPERATIONS\CLASS-INTEL"

function Invoke-Transcription {
    param([string]$FilePath, [string]$Label)

    $outDir = Join-Path $baseOutputDir $Label
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null

    $sizeMB = [math]::Round((Get-Item $FilePath).Length / 1MB, 2)
    Write-Host "`n=== $Label ($sizeMB MB) ==="

    $audioBytes = [System.IO.File]::ReadAllBytes($FilePath)

    # Deepgram REST: full file, single call — preserves global word timestamps
    $uri = "https://api.deepgram.com/v1/listen?model=nova-3&language=en&diarize=true&utterances=true&punctuate=true&smart_format=true&paragraphs=true&words=true"

    Write-Host "Sending to Deepgram nova-3 (diarize + utterances + word timestamps)..."
    try {
        $response = Invoke-RestMethod -Uri $uri `
            -Method Post `
            -Headers @{
                "Authorization" = "Token $env:DEEPGRAM_API_KEY"
                "Content-Type"  = "audio/mp4"
            } `
            -Body $audioBytes `
            -TimeoutSec 600

        # Save full JSON (timestamps, speaker labels, words — everything Mission G needs)
        $jsonPath = Join-Path $outDir "$Label-raw.json"
        $response | ConvertTo-Json -Depth 10 | Out-File $jsonPath -Encoding utf8
        Write-Host "Raw JSON saved: $jsonPath"

        # Save human-readable diarized transcript
        $txtPath = Join-Path $outDir "$Label-transcript.txt"
        $lines = @()
        if ($response.results.utterances) {
            foreach ($u in $response.results.utterances) {
                $mm = [int]($u.start / 60); $ss = [int]($u.start % 60)
                $ts = "{0:D2}:{1:D2}" -f $mm, $ss
                $lines += "[$ts speaker:$($u.speaker)] $($u.transcript)"
            }
        } else {
            $lines += $response.results.channels[0].alternatives[0].transcript
        }
        $lines | Out-File $txtPath -Encoding utf8
        Write-Host "Transcript saved: $txtPath"
        Write-Host "Utterances: $($response.results.utterances.Count)"

    } catch {
        Write-Host "ERROR: $_"
    }
}

foreach ($f in $files) {
    if (Test-Path $f.path) {
        Invoke-Transcription -FilePath $f.path -Label $f.label
    } else {
        Write-Host "NOT FOUND: $($f.path)"
    }
}

Write-Host "`nDone. Outputs in: $baseOutputDir"