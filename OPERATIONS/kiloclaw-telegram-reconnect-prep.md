# TELEGRAM RECONNECT PREPARATION — KILOCLAW
**Status:** PREP | PENDING MICHAEL ACTION  
**Date:** 2026-07-12  
**Run:** KiloClaw Integration Pipeline

---

## §1 CURRENT STATE

| Component | Status | Details |
|-----------|--------|---------|
| Telegram Bot | ✅ PAIRED | `@Phoenix_Centurion_Bot` — token active |
| KiloClaw Dashboard | ⚠️ PENDING | https://i-a947dc7776e34f8d86d7fc3c24d694b9.kiloclaw.ai |
| Dashboard Telegram Config | ❌ NOT CONFIGURED | Michael action required |
| Local OpenClaw Gateway | ✅ RUNNING | Port 18789, Windows startup item |
| MCP Wiring | ❌ NOT WIRED | `.claude/settings.json` missing OpenClaw MCP |
| Model Routing | ⚠️ FALLBACK | Model IDs not recognized at gateway, falls back to `openai/` prefix |

---

## §2 RECONNECT SEQUENCE

### Step 1: KiloClaw Dashboard Configuration (MICHAEL ACTION)

**This is the critical path. Nothing advances until this is done.**

1. Open browser → https://i-a947dc7776e34f8d86d7fc3c24d694b9.kiloclaw.ai
2. Log in with KiloClaw credentials
3. Navigate to **Settings** → **Telegram**
4. Paste bot token: `8603251036:AAGykOKDjx2KtZYb534oRtRkqt52HIS_88s`
5. Set default model: `kilo-auto/free`
6. Set fallback chain:
   - Primary: `kilo-auto/free`
   - Secondary: `openrouter/moonshotai/kimi-k2.5`
   - Tertiary: `google/gemini-2.5-flash-lite`
   - Last resort: `llm7.io`
7. Click **Save** → **Redeploy**
8. Wait for redeploy to complete (~2 minutes)

### Step 2: Unpair Telegram from Local OpenClaw

```powershell
# Stop local OpenClaw gateway
Stop-Process -Name "openclaw" -Force -ErrorAction SilentlyContinue

# Remove Telegram account from local OpenClaw config
$openclawConfig = "$env:USERPROFILE\.openclaw\openclaw.json"
if (Test-Path $openclawConfig) {
    $config = Get-Content $openclawConfig -Raw | ConvertFrom-Json
    # Remove telegram channel binding
    $config.channels = @($config.channels | Where-Object { $_.type -ne "telegram" })
    $config | ConvertTo-Json -Depth 10 | Set-Content $openclawConfig -Encoding UTF8
}
```

### Step 3: Pair Telegram with KiloClaw Dashboard

1. In KiloClaw dashboard, go to **Channels** → **Add Channel** → **Telegram**
2. Confirm bot token is recognized
3. Set webhook URL to KiloClaw dashboard endpoint
4. Test by sending `/start` to `@Phoenix_Centurion_Bot`
5. Confirm KiloClaw dashboard shows paired status

### Step 4: Verify Message Flow

```
Operator → Telegram API → KiloClaw Dashboard → Model (kilo-auto/free) → KiloClaw Dashboard → Telegram API → Operator
```

**Test commands:**
1. Send `ping` to `@Phoenix_Centurion_Bot` → expect `pong`
2. Send `models` to `@Phoenix_Centurion_Bot` → expect list of available models
3. Send `status` to `@Phoenix_Centurion_Bot` → expect KiloClaw system status

### Step 5: Update Pipeline Documentation

After successful reconnect:
1. Update `CANON/SYSTEM/COLD-START-BOOT.md` — mark KiloClaw Telegram config as COMPLETE
2. Update `CANON/REINCARNATION/REINCARNATION-LOG.md` — add entry for Telegram reconnect
3. Write phetrail: `CANON/PHEROMONES/PheTrail-run{N}.json`
4. Commit all changes with message: `feat: KiloClaw Telegram gateway live — Phoenix-Centurion`

---

## §3 FAILURE RECOVERY

| Failure Point | Recovery |
|---------------|----------|
| Dashboard unreachable | Check VM status, firewall, Cloudflare tunnel |
| Bot token rejected | Regenerate via @BotFather, update dashboard |
| Model not found | Check KiloClaw model catalog, verify `kilo-auto/free` exists |
| Webhook fails | Verify HTTPS endpoint, SSL certificate |
| Message not delivered | Check Telegram API status, bot not blocked |

---

## §4 VERIFICATION CHECKLIST

- [ ] KiloClaw dashboard shows Telegram channel as ACTIVE
- [ ] `@Phoenix_Centurion_Bot` responds to `/start`
- [ ] Model routing uses `kilo-auto/free` as default
- [ ] Fallback chain activates on primary failure
- [ ] Local OpenClaw no longer handles Telegram messages
- [ ] MCP wiring updated in `.claude/settings.json`
- [ ] All pipeline docs updated
- [ ] Phetrail written and committed

---

## §5 KNOWN ISSUES

| Issue | Status | Workaround |
|-------|--------|------------|
| Model IDs not recognized at gateway | UNRESOLVED | Fallback to `openai/` prefix |
| MCP wiring not complete | PENDING | Use direct API calls until wired |
| Local OpenClaw still paired | PENDING | Step 2 above resolves this |

---

**Next Action:** Michael must complete Step 1 (dashboard config). All other steps are automated or pending Michael's action.
