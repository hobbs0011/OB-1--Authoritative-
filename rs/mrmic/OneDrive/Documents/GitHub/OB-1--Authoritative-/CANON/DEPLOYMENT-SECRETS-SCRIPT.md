# Deployment Secrets + Finalization Script

## Current State
- Worker deployed: `net-pet-ai-production.mrmichaelhobbs123.workers.dev`
- Version: 1.5.0
- Status: LIVE (core app operational)
- Missing: BRAVE_API_KEY, NOTION_SOUL_DNA_DB (optional)

## Add Secrets and Redeploy (Copy-Paste Ready)

```powershell
# Set working directory
cd d:\OB-1\APPS\NET-PET-AI

# Clear any conflicting env var
$env:CLOUDFLARE_API_TOKEN = $null

# Add BRAVE_API_KEY (get from brave.com/search/api/)
# Replace YOUR_BRAVE_KEY with actual key from Brave
$braveKey = Read-Host "Enter BRAVE_API_KEY (from brave.com/search/api/)"
$braveKey | npx wrangler secret put BRAVE_API_KEY

# Add NOTION_SOUL_DNA_DB (your Notion database ID)
# Replace YOUR_NOTION_DB_ID with your Notion database ID (32 hex characters)
$notionDb = Read-Host "Enter NOTION_SOUL_DNA_DB (Notion database ID)"
$notionDb | npx wrangler secret put NOTION_SOUL_DNA_DB

# Redeploy with secrets
npx wrangler deploy --env production

# Verify deployment
curl -s https://net-pet-ai-production.mrmichaelhobbs123.workers.dev/health | ConvertFrom-Json | Select-Object ok, readiness
```

## Manual Steps (No Script)

### Step 1: Set BRAVE_API_KEY
```powershell
$env:CLOUDFLARE_API_TOKEN = $null
cd d:\OB-1\APPS\NET-PET-AI
wrangler secret put BRAVE_API_KEY
# Paste your key when prompted
```

### Step 2: Set NOTION_SOUL_DNA_DB
```powershell
wrangler secret put NOTION_SOUL_DNA_DB
# Paste your Notion database ID when prompted
```

### Step 3: Redeploy
```powershell
npx wrangler deploy --env production
```

### Step 4: Verify
```powershell
curl https://net-pet-ai-production.mrmichaelhobbs123.workers.dev/health
```

## Expected Result
```json
{
  "ok": true,
  "version": "1.5.0",
  "readiness": "PRODUCTION"
}
```

---

**Note:** Without secrets, worker is still LIVE for:
- ✅ /magic-chat (OBI voice tutor)
- ✅ /api/chat (DeepSeek conversation)
- ✅ /api/correct (speech correction)
- ✅ /souldna (soul DNA pipeline)
- ⏳ /api/image (needs BRAVE_API_KEY)
- ⏳ Notion sync (needs NOTION_SOUL_DNA_DB)
