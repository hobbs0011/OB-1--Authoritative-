# 2026-04-01 — Post-Launch Day-1 Monitoring & Rollback Plan (T-114h)

> **Pulse:** :24 | **Agent:** Anakin (Agent-98) | **Mode:** BUILD
> **Genesis Anchor:** Game Bible (Survive a Brainrot — Complete Game Bible)
> **Date:** 2026-04-01 20:24 ICT

---

## Mission (one line)
Produce the exact monitoring checklist and rollback protocol for the first 24 hours after Roblox publish — zero guessing on launch day.

## Cold Start
- COLD-START-BOOT.md: SHA `bc70200` ✅
- Last 3 reincarnation entries loaded ✅
- Active state: CODE COMPLETE (41/41), BLOCKED on 21 Product IDs

---

## SECTION 1: Pre-Launch Verification (T-0 minus 30 min)

- [ ] All 21 Product IDs wired (5 Game Passes + 16 Dev Products) — non-zero in config
- [ ] ReceiptRouter.lua migration applied — single ProcessReceipt handler confirmed
- [ ] Studio test: purchase each Game Pass → verify attribute set on player
- [ ] Studio test: purchase 1 Dev Product per category (Currency, Consumable, Gacha) → verify grant
- [ ] DataStoreService test: save/load cycle for coins, gems, inventory
- [ ] No `warn()` or `error()` in Output during 5-minute play session
- [ ] Game set to **Public** in Creator Dashboard
- [ ] Thumbnail + Icon uploaded (specs in Store Listing Copy Spec)
- [ ] Description pasted (from Store Listing Copy Spec)
- [ ] Search tags set: `survive, zombie, brainrot, skibidi, train`
- [ ] Genre set: Horror (primary)
- [ ] Max Players: 20
- [ ] Devices: Phone ✅ Tablet ✅ Computer ✅
- [ ] AllowThirdPartySales: true

## SECTION 2: Launch (T-0)

1. Click **Publish to Roblox** in Studio
2. Verify experience appears on Roblox.com within 5 minutes
3. Open experience on phone AND desktop — confirm both load to Stage 1
4. Record first server instance ID
5. Note exact publish timestamp for analytics baseline

## SECTION 3: First 60 Minutes Monitoring

### Developer Console Checks (every 15 min)
- [ ] Server memory < 500MB
- [ ] Server heartbeat > 55 FPS
- [ ] No script errors in Developer Console → Server tab
- [ ] No DataStore throttle warnings
- [ ] Network receive < 50 KB/s per player

### Gameplay Checks
- [ ] Players spawn on train correctly
- [ ] Stage 1 enemies spawn and are killable
- [ ] Coins drop and display in HUD
- [ ] Shop opens between waves
- [ ] At least 1 weapon purchasable from shop
- [ ] Game Pass benefits activate (test with alt account if possible)

### Economy Checks
- [ ] MarketplaceService.ProcessReceipt fires (check Output for `[ReceiptRouter]` logs)
- [ ] Coin balance persists after rejoin
- [ ] Gem balance persists after rejoin
- [ ] First-purchase gem doubling works

## SECTION 4: First 24 Hours — Key Metrics to Track

| Metric | Where to Find | Red Flag Threshold |
|--------|--------------|-------------------|
| Concurrent players | Creator Dashboard → Analytics | < 5 after 6 hours (if promoted) |
| Average session length | Creator Dashboard → Analytics | < 2 minutes |
| Day-1 revenue (R$) | Creator Dashboard → Monetization | $0 after 100+ visits |
| Server crash rate | Developer Console → Errors | Any crash = investigate |
| DataStore request failures | Developer Console → Server | > 1% failure rate |
| Player feedback | Game page comments | Any "broken" or "scam" reports |
| Thumbs up ratio | Game page | < 50% |

## SECTION 5: Rollback Protocol

### Severity 1 — CRITICAL (roll back immediately)
**Trigger:** Data loss, real-money purchase fails, server crash loop
**Action:**
1. Set game to **Private** in Creator Dashboard (< 1 minute)
2. Post on game page: "Maintenance in progress — back soon!"
3. Identify root cause in Studio
4. Fix → test → re-publish
5. Set back to **Public**
**Max downtime target:** 30 minutes

### Severity 2 — HIGH (hot-fix within 2 hours)
**Trigger:** Game pass benefits not applying, economy exploit, progression broken
**Action:**
1. Keep game Public
2. Open Studio → fix the specific module
3. Test in Studio play mode
4. Publish update (Roblox hot-updates live servers within ~5 min)
5. Verify fix on live server

### Severity 3 — MEDIUM (fix next session)
**Trigger:** Visual bugs, minor balance issues, non-blocking UI glitches
**Action:**
1. Log in Notion Reincarnation Log with exact repro steps
2. Fix in next work session
3. Publish update

### Severity 4 — LOW (backlog)
**Trigger:** Polish, "nice to have" feedback, future feature requests
**Action:**
1. Add to Notion backlog
2. Prioritize in next sprint

## SECTION 6: Communication Channels (Day 1)

- [ ] Roblox game page comments — monitor every 2 hours
- [ ] Discord server (if created) — monitor continuously
- [ ] Creator Dashboard notifications — check hourly
- [ ] Notion Reincarnation Log — log every incident

## SECTION 7: Day-1 Success Criteria

| Criteria | Pass | Fail |
|----------|------|------|
| Game stays live 24h with zero Sev-1 | ✅ | Any Sev-1 = fail |
| At least 1 real purchase processed | ✅ | 0 purchases with 50+ visits = investigate |
| DataStore zero data loss | ✅ | Any data loss = Sev-1 |
| Average session > 3 min | ✅ | < 2 min = gameplay issue |
| No exploit reports | ✅ | Any exploit = Sev-2 hot-fix |

---

## Acceptance Test
- [x] Checklist items are concrete, copy-pasteable, and reference exact pages/paths
- [x] Rollback protocol has severity levels with exact actions
- [x] Metrics table references where to find each metric
- [x] Zero drift from Game Bible source (all features referenced match)
- [x] Time-boxed actions (max downtime targets specified)

## Source Evidence
- Game Bible: `🎮 Survive a Brainrot — Complete Game Bible (Human-Readable)`
- Store Listing Copy Spec: `CANON/REINCARNATION/2026-04-01-store-listing-copy-spec.md`
- ReceiptRouter: SHA `11303d4c`
- Product ID Checklist: `CANON/REINCARNATION/2026-04-01-product-id-creation-checklist-t119h.md`
- Cold Start: SHA `bc70200`
