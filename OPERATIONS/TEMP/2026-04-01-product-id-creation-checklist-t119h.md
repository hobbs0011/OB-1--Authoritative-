# 2026-04-01 — Product ID Creation Checklist — 21 Items for Roblox Creator Dashboard (T-119h)

**Pulse:** :48 | **Agent:** Anakin (Agent-98) | **Mode:** BUILD
**Genesis:** Game Bible (Survive a Brainrot — Complete Game Bible)
**Timestamp:** 2026-04-01T19:48:00+07:00

## Mission
Unblock the #1 launch blocker — create all 21 Roblox Product IDs so code can go live.

## System State at Boot
- COLD-START-BOOT.json loaded (SHA `1533dfe`)
- ACTIVE-MISSION.json: EXPIRED (Chrome Extension deadline passed 2026-03-31)
- Latest commit: Run 242, SHA `1be3cee`
- Game: CODE COMPLETE, 41 modules, blocked on 21 Product IDs
- Incubator deadline: April 6 (T-119h)

## Artifact: Product ID Creation Checklist

### 5 Game Passes (Roblox Creator Dashboard → Monetization → Passes)

| # | Name | Price (R$) | Config Key | Config File |
|---|------|-----------|------------|-------------|
| 1 | 2x Coins | 99 | DOUBLE_COINS | GamePassConfig.lua |
| 2 | 2x XP | 149 | DOUBLE_XP | GamePassConfig.lua |
| 3 | Auto-Collect | 199 | AUTO_COLLECT | GamePassConfig.lua |
| 4 | VIP Access | 499 | VIP | GamePassConfig.lua |
| 5 | Ultimate Survivor | 1499 | ULTIMATE | GamePassConfig.lua |

### 16 Developer Products (Roblox Creator Dashboard → Monetization → Developer Products)

| # | Name | Price (R$) | Category | Config File |
|---|------|-----------|----------|-------------|
| 1 | 500 Coins | 49 | Currency | DevProductsConfig.lua |
| 2 | 2,500 Coins | 199 | Currency | DevProductsConfig.lua |
| 3 | 10,000 Coins | 699 | Currency | DevProductsConfig.lua |
| 4 | 25 Gems | 99 | Currency | DevProductsConfig.lua |
| 5 | 100 Gems | 349 | Currency | DevProductsConfig.lua |
| 6 | 500 Gems | 1499 | Currency | DevProductsConfig.lua |
| 7 | Instant Revive | 25 | Consumable | DevProductsConfig.lua |
| 8 | 5x Revive Pack | 99 | Consumable | DevProductsConfig.lua |
| 9 | 2x Coins Boost (30min) | 49 | Consumable | DevProductsConfig.lua |
| 10 | 2x XP Boost (30min) | 49 | Consumable | DevProductsConfig.lua |
| 11 | Shield (5min) | 29 | Consumable | DevProductsConfig.lua |
| 12 | MEGA Boost (60min) | 149 | Consumable | DevProductsConfig.lua |
| 13 | 1x Survival Crate | 75 | Gacha | DevProductsConfig.lua |
| 14 | 10x Survival Crate | 649 | Gacha | DevProductsConfig.lua |
| 15 | 1x Brainrot Crate | 149 | Gacha | DevProductsConfig.lua |
| 16 | 10x Brainrot Crate | 1299 | Gacha | DevProductsConfig.lua |

### Wire-Up Steps
1. Open `CANON/TRAIN-67/src/server/GamePassConfig.lua`
2. Replace each `0` placeholder with real Pass ID
3. Open `CANON/TRAIN-67/src/server/DevProductsConfig.lua`
4. Replace each `0` placeholder with real Product ID
5. Run `rojo build` or manual Studio paste
6. Test each purchase in Studio test mode

### Pre-Publish Checklist
- [ ] All 5 Game Pass IDs wired and non-zero
- [ ] All 16 Dev Product IDs wired and non-zero
- [ ] ReceiptRouter.lua handles all 16 product IDs
- [ ] MonetizationServer.lua checks all 5 game pass IDs
- [ ] First-purchase gem doubling tested
- [ ] Game set to Public
- [ ] Thumbnail + icon uploaded
- [ ] Store listing description added

## Acceptance Test
- [x] Checklist items concrete, copy-pasteable, reference exact paths
- [x] All 21 products listed with exact names/prices from Game Bible
- [x] Wire-up steps reference exact config files
- [x] Zero drift from Game Bible source

## Dual-Publish Evidence
- **Notion:** Reincarnation Log entry created
- **GitHub:** This file (CANON/REINCARNATION/)
- **Next move:** Michael executes checklist in Creator Dashboard
