# Train 6-7 — Survive a Brainrot

**Game:** Survive a Brainrot (Roblox)
**Lesson:** Train 6-7 — Natural English Training
**Account:** PhoenixRisingGames
**Framework:** 20x20x20x20 (Classes × Weapons × Enemies × Bosses)
**Palette:** Gospel 444 — Purple #a855f7 / Gold #f59e0b / Dark #0f0f1a / **NO BLUE**

---

## Directory Structure

```
CANON/TRAIN-67/
├── README.md                          ← You are here
├── TURN-KEY-DEPLOY-PACKET.md          ← Step-by-step deploy guide
├── REVISION-SUMMARY.md                ← Phase 1 revision changelog
├── QUICK-START-V1.md                  ← 15-min setup guide
├── BOT-BOOT-CONTRACT-V1.md            ← System prompt for all bots
├── DEPLOYMENT-PIPELINE-20-STAGE.md    ← Full 20-stage deploy pipeline
├── MARKETPLACE-SPECS.md               ← 8-tier rarity, trading, currencies
└── CODE/
    ├── MonetizationServer.lua         ← Gacha + Trading + Rarity module
    ├── LedgerSchema.lua               ← Phoenix Ledger v1 schema
    ├── GameMain_PHASE1_REVISED.lua    ← [PENDING] Main server script
    ├── HUDController_PHASE1_REVISED.lua ← [PENDING] Client HUD
    ├── CodexData.lua                  ← [PENDING] Codex data (Timmy wiped)
    └── CodexClient.lua                ← [PENDING] Codex UI controller
```

## File Status

| File | Lines | Status |
|------|-------|--------|
| MonetizationServer.lua | 177 | ✅ In repo |
| LedgerSchema.lua | 35 | ✅ In repo |
| BOT-BOOT-CONTRACT-V1.md | 70 | ✅ In repo |
| DEPLOYMENT-PIPELINE-20-STAGE.md | 68 | ✅ In repo |
| MARKETPLACE-SPECS.md | 110 | ✅ In repo |
| QUICK-START-V1.md | ~150 | ✅ In repo |
| REVISION-SUMMARY.md | ~200 | ✅ In repo |
| GameMain_PHASE1_REVISED.lua | ~865 | ❌ Pending |
| HUDController_PHASE1_REVISED.lua | ~625 | ❌ Pending |
| CodexData.lua | ~80 | ❌ Pending |
| CodexClient.lua | ~100 | ❌ Pending |
| MainServer.lua v2.0.0 | ~600+ | ❌ Truncated |

## Phase 1 Demo Specs

- **Playtime:** 40-45 minutes
- **Players:** Exactly 5 (viral lobby gate)
- **Phases:** Defense → Town (Rusted Depot) → Boss (Baron Skibidi)
- **Boss:** Baron Skibidi — HP 2500, Charge/Stomp/Summon mechanics
- **Ending:** 4-phase cliffhanger → "99 days to Sanctuary"
- **Squad Bonus:** +30% XP at full train (5/5)

## Deploy Quick Reference

1. Log into Roblox as PhoenixRisingGames
2. Create experience → "Survive a Brainrot" → max 5 players
3. Create API key at create.roblox.com (DataStore + MessagingService)
4. Open Studio → place scripts per TURN-KEY-DEPLOY-PACKET.md
5. Test → Publish → Go Live

## Gospel 444 Palette (LAW)

| Token | Hex | Use |
|-------|-----|-----|
| Deep Dark | #0f0f1a | Backgrounds |
| Neon Purple | #a855f7 | Health, borders |
| Brushed Gold | #f59e0b | Rewards, objectives |
| Glass | rgba(26,26,38,0.7) | UI panels |
| **BLUE** | **FORBIDDEN** | **NEVER** |
