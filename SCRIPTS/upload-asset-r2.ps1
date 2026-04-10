# Upload Asset to R2
# Usage: .\upload-asset-r2.ps1 -LocalPath "C:\path\to\file.mp3" -Product "net-pet-ai" -Type "audio"

param(
    [Parameter(Mandatory=$true)]
    [string]$LocalPath,
    
    [Parameter(Mandatory=$true)]
    [string]$Product,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("audio","video","images","docs","slides","backups")]
    [string]$Type
)

$FileName = Split-Path $LocalPath -Leaf
$R2Key = "$Product/$Type/$FileName"
$ManifestPath = Join-Path $PSScriptRoot "..\ASSETS\manifest.json"

Write-Host "Uploading $FileName to R2 as $R2Key..." -ForegroundColor Cyan

# Upload via wrangler
wrangler r2 object put "phoenix-rising-assets/$R2Key" --file "$LocalPath"

if ($LASTEXITCODE -eq 0) {
    $FileSizeMB = [math]::Round((Get-Item $LocalPath).Length / 1MB, 2)
    $CdnUrl = "https://assets.naturalenglishtraining.net/$R2Key"
    
    # Update manifest.json
    $Manifest = Get-Content $ManifestPath | ConvertFrom-Json
    $NewAsset = [PSCustomObject]@{
        key      = $R2Key
        type     = $Type
        product  = $Product
        size_mb  = $FileSizeMB
        uploaded = (Get-Date -Format "yyyy-MM-dd")
        cdn_url  = $CdnUrl
    }
    $Manifest.assets += $NewAsset
    $Manifest.updated = (Get-Date -Format "yyyy-MM-dd")
    $Manifest | ConvertTo-Json -Depth 5 | Set-Content $ManifestPath
    
    Write-Host "✅ Uploaded: $CdnUrl" -ForegroundColor Green
    Write-Host "📋 Manifest updated. Commit ASSETS/manifest.json (not the binary file)." -ForegroundColor Yellow
} else {
    Write-Host "❌ Upload failed. Check wrangler auth and R2 bucket config." -ForegroundColor Red
    exit 1
}
