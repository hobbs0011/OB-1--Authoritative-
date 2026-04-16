# Deepgram Full Transcription - Chunked for large files
# Run: pwsh -File SCRIPTS/transcribe-full.ps1
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

$fileNames = @("Voice 260416_211505", "Voice 260416_203228")

$chunkSize = 1800000  # 1.8MB chunks to stay under 2MB limit

for ($i = 0; $i -lt $files.Count; $i++) {
    $file = $files[$i]
    $filename = $fileNames[$i]
    Write-Host "Processing: $filename"
    Write-Host "============================================"
    
    try {
        $audioBytes = [System.IO.File]::ReadAllBytes($file)
        $totalChunks = [Math]::Ceiling($audioBytes.Length / $chunkSize)
        Write-Host "File size: $($audioBytes.Length) bytes, splitting into $totalChunks chunks"
        
        $fullTranscript = @()
        
        for ($chunk = 0; $chunk -lt $totalChunks; $chunk++) {
            $start = $chunk * $chunkSize
            $length = [Math]::Min($chunkSize, $audioBytes.Length - $start)
            $chunkBytes = $audioBytes[$start..($start + $length - 1)]
            $audioBase64 = [Convert]::ToBase64String($chunkBytes)
            
            Write-Host "Processing chunk $($chunk + 1)/$totalChunks (bytes $start-$($start + $length))..."
            
            $body = @{
                audio = $audioBase64
                model = "nova-2"
                language = "vi"
                smart_format = $true
                punctuate = $true
            } | ConvertTo-Json -Depth 10
            
            $response = Invoke-RestMethod -Uri "https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&language=vi" `
                -Method Post `
                -Headers @{
                    "Authorization" = "Token $env:DEEPGRAM_API_KEY"
                    "Content-Type" = "application/json"
                } `
                -Body $body
            
            $transcript = $response.results.channels[0].alternatives[0].transcript
            if ($transcript) {
                $fullTranscript += $transcript
                Write-Host "  Got transcript: $($transcript.Length) chars"
            }
            Start-Sleep -Milliseconds 500
        }
        
        $combined = $fullTranscript -join " "
        $outputFile = Join-Path $outputDir "$filename-RAW.txt"
        $combined | Out-File -FilePath $outputFile -Encoding utf8
        
        Write-Host $combined
        Write-Host ""
        Write-Host "=== END TRANSCRIPT ==="
        Write-Host "Word count: $($combined.Split(' ').Count)"
        Write-Host ""
        
    } catch {
        Write-Host "Error: $_"
        Write-Host $_.Exception.Message
    }
}