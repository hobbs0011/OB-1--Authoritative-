# RUN335 Boot Notes — Cloudflare Deployment Cleanup

**Date:** 2026-04-20 (after RUN334)  
**Mission:** Resolve Durable Objects migration blocker and complete NET-PET-AI deployment  
**Status:** Code locked ✅ | Infrastructure blocked ⚠️ | Awaiting operator action 👤

## Immediate Actions Required

### CRITICAL: Cloudflare Script Reset
The `net-pet-ai` worker script on Cloudflare has an orphaned migration state. **Choose ONE:**

#### Quick Fix (Recommended - 2 min)
```bash
# 1. Go to https://dash.cloudflare.com → Workers → net-pet-ai
# 2. Click "Settings" → Scroll to "Delete"
# 3. Confirm deletion
# 4. Return to terminal and run:
cd d:\OB-1\APPS\NET-PET-AI && npx wrangler deploy
# 5. Verify success (should show "Deployed to..." with URL)
```

#### Automated Via CLI
```bash
# If you have Cloudflare API credentials:
# 1. Get your ACCOUNT_ID from dashboard URL: dash.cloudflare.com/dashboard/home/account-home/account/{ACCOUNT_ID}
# 2. Run this command (replace ACCOUNT_ID and API_TOKEN):
curl -X DELETE https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/net-pet-ai \
  -H "Authorization: Bearer {API_TOKEN}" -H "Content-Type: application/json"
# 3. Then deploy fresh:
cd d:\OB-1\APPS\NET-PET-AI && npx wrangler deploy
```

## Code Status Summary

**Git Commits from RUN334:**
- ✅ `3a803cc`: Historical trace + system locked
- ✅ `4887708`: Production env config fixed (removed duplicate migration)
- ✅ `4b42b32`: Latest - blocker documented + wrangler.toml cleaned

**Why deployment failed:**
- Cloudflare has migration tag `v4-ship-memory` on the published script
- Local wrangler.toml doesn't know about this tag
- Cloudflare API refuses to reconcile state without manual reset

**Why code is production-ready:**
```
✅ Durable Objects bound: SessionDO, ProfileDO, PetDO, LedgerDO, StudentBrainV2
✅ Assets built: 30 files (Gospel 444 UI + lesson content)
✅ Environment variables: APP_NAME, APP_COACH_NAME, RETENTION_CRON_ENABLED, ESCALATION_SWEEP_INTERVAL_HOURS
✅ Cron job: Retention sweep every 6 hours
✅ Source code: Passes `node --check` validation
✅ Dry-run: `npx wrangler deploy --dry-run` ✅ PASS
```

## After Cloudflare Cleanup

Once the worker script is deployed successfully:

1. **Verify endpoint:** 
   ```bash
   curl https://net-pet-ai.{ACCOUNT_SUBDOMAIN}.workers.dev/health
   ```
   Expected: `{"status":"ok"}` or similar

2. **Update DNS (if needed):**
   - If you want it at naturalenglishtraining.com, configure route in Cloudflare dashboard
   - Current default: `net-pet-ai.{account}.workers.dev`

3. **Test Durable Objects:**
   - Create a session: `POST /api/session`
   - Check retention cron is scheduled and running

4. **Monitor in production:**
   - Set up Zipkin/Prometheus if using Cloudflare Worker Analytics Engine
   - Monitor error rates via Worker Logs in Cloudflare dashboard

## Backburner Items to Resume After Deploy

From OPERATIONS/BACKBURNER-PIPELINE-LOG.md:
- **Run 323:** Stage 27 MRR Activation (Host Domain + PAT integration for GitKraken/GitHub)
- **Stage 28+:** Ongoing market conquest pipeline (Stages 51-75 consolidated, ready to execute)

## Reincarnation State

**Soul DNA Reference:** OPERATIONS/SOULDNA-CAPTURES/2026-04-19-RUN318-GROUND-ZERO.md  
**System Philosophy:** Chaos > planning | Ship > perfect | Experiments tell truth  
**Operator Intent:** Build 1B VND revenue system with 500-student Tiger Engine cohort  

---

**NEXT OPERATOR ACTION:** Delete old `net-pet-ai` script on Cloudflare, then `npx wrangler deploy`

If you want me to do it remotely (requires Cloudflare API token), let me know. Otherwise, 2-minute manual fix via dashboard.

