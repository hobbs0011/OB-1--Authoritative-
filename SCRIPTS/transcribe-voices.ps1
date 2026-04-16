# Deepgram Transcription Script
# Run: pwsh -File SCRIPTS/transcribe-voices.ps1
# PREREQUISITE: $env:DEEPGRAM_API_KEY must be set before running

if (-not $env:DEEPGRAM_API_KEY) {
    Write-Error "DEEPGRAM_API_KEY environment variable not set. Set it and retry."
    exit 1
}

$files = @(
    "C:\Users\mrmic\Downloads\Voice 260416_211505.m4a",
    "C:\Users\mrmic\Downloads\Voice 260416_203228.m4a"
)

$outputDir = "D:\OB-1\ASSETS\TRANSCRIPTIONS"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

function Split-AndTranscribe {
    param([string]$FilePath, [string]$filename)
    
    $tempDir = Join-Path $env:TEMP "deepgram_$([System.Guid]::NewGuid().ToString())"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    Write-Host "Converting to WAV (16kHz mono)..."
    $wavPath = Join-Path $tempDir "input.wav"
    & ffmpeg -i $FilePath -vn -acodec pcm_s16le -ar 16000 -ac 1 $wavPath -y 2>$null
    
    $fileSizeMB = [math]::Round((Get-Item $wavPath).Length / 1MB, 2)
    Write-Host "WAV size: $fileSizeMB MB"
    
    $durationSec = 8
    $chunkNum = 0
    
    $allTranscripts = @()
    
    for ($startSec = 0; $startSec -lt 600; $startSec += $durationSec) {
        $chunkPath = Join-Path $tempDir "chunk_$chunkNum.wav"
        
        & ffmpeg -i $wavPath -ss $startSec -t $durationSec -vn -acodec pcm_s16le -ar 16000 -ac 1 $chunkPath -y 2>$null
        
        $chunkSize = (Get-Item $chunkPath).Length
        if ($chunkSize -lt 1000) {
            break
        }
        
        $chunkSizeMB = [math]::Round($chunkSize/1MB, 2)
        $endSec = $startSec + $durationSec
        $chunkInfo = "Chunk $chunkNum`t$startSec-$endSec sec ($chunkSizeMB MB)"
        Write-Host $chunkInfo
        
        $audioBytes = [System.IO.File]::ReadAllBytes($chunkPath)
        $audioBase64 = [Convert]::ToBase64String($audioBytes)
        
        $jsonBody = "{`"audio`":`"$audioBase64`",`"model`":`"nova-2`",`"language`":`"vi`",`"smart_format`":true}"
        
        try {
            $response = Invoke-RestMethod -Uri "https://api.deepgram.com/v1/listen" `
                -Method Post `
                -Headers @{
                    "Authorization" = "Token $env:DEEPGRAM_API_KEY"
                    "Content-Type" = "application/json"
                } `
                -Body $jsonBody
            
            $transcript = $response.results.channels[0].alternatives[0].transcript
            if ($transcript) {
                $allTranscripts += $transcript
            }
        } catch {
            Write-Host "Error on chunk: $_"
        }
        
        $chunkNum++
    }
    
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    return ($allTranscripts -join " ")
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $filename = [System.IO.Path]::GetFileNameWithoutExtension($file)
        Write-Host "Processing: $filename"
        
        $transcript = Split-AndTranscribe -FilePath $file -filename $filename
        
        $outputFile = Join-Path $outputDir "$filename.txt"
        $transcript | Out-File -FilePath $outputFile -Encoding utf8
        
        Write-Host "Saved: $outputFile"
        Write-Host "---FINAL TRANSCRIPT---"
        Write-Host $transcript
        Write-Host "==="
    } else {
        Write-Host "File not found: $file"
    }
}