# Deploy net-tiger-assessment to Cloudflare Pages
# Run: pwsh -File SCRIPTS/deploy-pages.ps1

$projectPath = "D:\OB-1\net-tiger-assessment"

# Check if wrangler is available
$wranglerCheck = npx wrangler --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing wrangler..."
    npm install -g wrangler
}

# Create _redirects for SPA fallback if it doesn't exist
$redirectsPath = Join-Path $projectPath "_redirects"
if (-not (Test-Path $redirectsPath)) {
    "# SPA fallback
/*    /index.html   200" | Out-File -FilePath $redirectsPath -Encoding utf8
    Write-Host "Created _redirects"
}

# Deploy to Cloudflare Pages
Write-Host "Deploying net-tiger-assessment to Cloudflare Pages..."
Set-Location $projectPath
npx wrangler pages deploy . --project-name net-tiger-assessment

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployed! Your site is live at:"
    Write-Host "https://net-tiger-assessment.pages.dev"
} else {
    Write-Host "❌ Deploy failed"
}