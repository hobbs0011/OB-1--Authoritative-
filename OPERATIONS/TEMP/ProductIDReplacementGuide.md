# Product ID Replacement Guide — Survive a Brainrot

> **Purpose:** Step-by-step guide to create ALL monetization products in Roblox Creator Dashboard and wire the real IDs into the codebase. This is the #1 revenue blocker — nothing monetizes until these placeholder IDs become real.
>
> **Generated:** 2026-03-28 Run 82 | **Source files:** GamePassConfig.lua, DevProductsConfig.lua, ReceiptRouter.lua, MonetizationArchitectureDeepDive.md

---

## Executive Summary

- **5 Game Passes** (one-time purchases) — all `GamePassId = 0` in `GamePassConfig.lua`
- **16 Developer Products** (repeatable purchases) — all using placeholder string keys in `DevProductsConfig.lua`
- **10 Developer Products** — all `ProductId = 0` in `GamePassConfig.DevProducts` table
- **⚠️ OVERLAP:** Both files define dev products independently. Use `ReceiptRouter.lua` to unify.
- **⚠️ BUG:** `DevProductsConfig.lua` has HTML entity `&lt;` in `GetAllProducts()` sort — will break in Studio.
- **Total IDs needed:** 5 Game Passes + 16 Dev Products = **21 unique products to create**

---

## Phase 1: Create Game Passes (5 passes)

### Steps in Creator Dashboard
1. Go to [create.roblox.com](https://create.roblox.com)
2. Select your experience → **Monetization** → **Passes**
3. Click **Create a Pass** for each:

| # | Pass Name | Price (R$) | Internal ID | Description for Dashboard |
|---|-----------|-----------|-------------|---------------------------|
| 1 | 2x Coins | 99 | PASS_2X_COINS | Double ALL Survival Coin earnings forever! |
| 2 | 2x XP | 149 | PASS_2X_XP | Level up 2x faster! Double ALL XP earned. |
| 3 | Auto-Collect | 199 | PASS_AUTO_COLLECT | Automatically collect drops, coins, and loot. Never miss a pickup! |
| 4 | VIP Access | 499 | PASS_VIP | VIP badge + exclusive VIP zone + 5 bonus daily gems + VIP chat tag |
| 5 | Ultimate Survivor Pack | 1499 | PASS_ULTIMATE | ALL passes included + exclusive Brainrot Immune aura + 10 daily gems + priority server join |

4. Upload a 150x150 icon for each pass (use purple/gold per Gospel 444)
5. Set the price and save
6. **Copy the Game Pass ID** from the URL or details page

### Where to Paste Game Pass IDs

**File:** `CANON/TRAIN-67/CODE/GamePassConfig.lua`

Find each `GamePassId = 0` and replace with the real ID:

```lua
-- Line ~38: 2x Coins
GamePassId = 0, -- SET AFTER CREATION  →  GamePassId = YOUR_ID_HERE,

-- Line ~49: 2x XP
GamePassId = 0,  →  GamePassId = YOUR_ID_HERE,

-- Line ~58: Auto-Collect
GamePassId = 0,  →  GamePassId = YOUR_ID_HERE,

-- Line ~69: VIP Access
GamePassId = 0,  →  GamePassId = YOUR_ID_HERE,

-- Line ~83: Ultimate Survivor Pack
GamePassId = 0,  →  GamePassId = YOUR_ID_HERE,
```

---

## Phase 2: Create Developer Products (16 products)

### Steps in Creator Dashboard
1. Same experience → **Monetization** → **Developer Products**
2. Click **Create a Developer Product** for each:

### Currency Packs (6)

| # | Product Name | Price (R$) | Placeholder Key | Grant |
|---|-------------|-----------|-----------------|-------|
| 1 | 500 Survival Coins | 49 | PRODUCT_ID_COINS_500 | 500 SurvivalCoins |
| 2 | 2,500 Survival Coins (+25% Bonus) | 199 | PRODUCT_ID_COINS_2500 | 2,500 SurvivalCoins |
| 3 | 10,000 Survival Coins (+50% Bonus) | 699 | PRODUCT_ID_COINS_10000 | 10,000 SurvivalCoins |
| 4 | 25 Brainrot Gems | 99 | PRODUCT_ID_GEMS_25 | 25 BrainrotGems |
| 5 | 100 Brainrot Gems (+20% Bonus) | 349 | PRODUCT_ID_GEMS_100 | 100 BrainrotGems |
| 6 | 500 Brainrot Gems (+40% Bonus) | 1499 | PRODUCT_ID_GEMS_500 | 500 BrainrotGems |

### Revives (2)

| # | Product Name | Price (R$) | Placeholder Key | Grant |
|---|-------------|-----------|-----------------|-------|
| 7 | Instant Revive | 25 | PRODUCT_ID_REVIVE_1 | 1 revive token |
| 8 | 5x Revive Pack | 99 | PRODUCT_ID_REVIVE_5 | 5 revive tokens |

### Temporary Boosts (4)

| # | Product Name | Price (R$) | Placeholder Key | Duration |
|---|-------------|-----------|-----------------|----------|
| 9 | 2x Coins (30 min) | 49 | PRODUCT_ID_BOOST_2X_COINS | 1800s |
| 10 | 2x XP (30 min) | 49 | PRODUCT_ID_BOOST_2X_XP | 1800s |
| 11 | Shield (5 min) | 29 | PRODUCT_ID_BOOST_SHIELD | 300s |
| 12 | MEGA Boost (2x Everything + Shield, 60 min) | 149 | PRODUCT_ID_BOOST_MEGA | 3600s |

### Gacha Spins (4)

| # | Product Name | Price (R$) | Placeholder Key | Grant |
|---|-------------|-----------|-----------------|-------|
| 13 | 1x Survival Crate | 75 | PRODUCT_ID_GACHA_BASIC_1 | 1 BasicCrate pull |
| 14 | 10x Survival Crate (+1 Free) | 649 | PRODUCT_ID_GACHA_BASIC_10 | 11 BasicCrate pulls |
| 15 | 1x Brainrot Crate | 149 | PRODUCT_ID_GACHA_PREMIUM_1 | 1 PremiumCrate pull |
| 16 | 10x Brainrot Crate (+1 Free) | 1299 | PRODUCT_ID_GACHA_PREMIUM_10 | 11 PremiumCrate pulls |

### Where to Paste Developer Product IDs

**File:** `CANON/TRAIN-67/CODE/DevProductsConfig.lua`

The PRODUCTS table uses placeholder string keys like `"PRODUCT_ID_COINS_500"`. Replace each key with the **actual numeric Product ID** (as a string):

```lua
-- BEFORE:
["PRODUCT_ID_COINS_500"] = {

-- AFTER:
["123456789"] = {  -- actual Product ID from Creator Dashboard
```

Do this for all 16 entries. The Product ID is shown in the Creator Dashboard URL after creating each product.

---

## Phase 3: Wire ReceiptRouter (Critical)

### ⚠️ ProcessReceipt Conflict

Both `GamePassConfig.lua` (line 230) and `DevProductsConfig.lua` (line ~160) set:
```lua
MarketplaceService.ProcessReceipt = ...
```

**The second script to load silently overwrites the first.** This means one category of purchases will NEVER be granted.

### Fix: Use ReceiptRouter.lua

`ReceiptRouter.lua` was built specifically to resolve this. It provides a single unified `ProcessReceipt` callback with a handler registry.

**Steps:**
1. In `UnifiedServer.lua`, ensure `ReceiptRouter` loads BEFORE `GamePassConfig` and `DevProductsConfig`
2. Remove the `MarketplaceService.ProcessReceipt = ...` line from both `GamePassConfig.lua` and `DevProductsConfig.lua`
3. Instead, register handlers with ReceiptRouter:

```lua
-- In UnifiedServer.lua boot sequence:
local ReceiptRouter = require(Modules.ReceiptRouter)
ReceiptRouter.Init()

-- GamePassConfig registers its dev product handler:
ReceiptRouter.RegisterHandler("game_pass_devproducts", function(receiptInfo)
    return GamePassConfig.processDevProductReceipt(receiptInfo)
end)

-- DevProductsConfig registers its handler:
ReceiptRouter.RegisterHandler("dev_products", function(receiptInfo)
    return processReceipt(receiptInfo)
end)
```

---

## Phase 4: Fix Known Bugs

### Bug 1: HTML Entity in DevProductsConfig.lua

**File:** `DevProductsConfig.lua`, `GetAllProducts()` function

```lua
-- BROKEN (HTML entity):
table.sort(productList, function(a, b) return a.robuxPrice &lt; b.robuxPrice end)

-- FIXED:
table.sort(productList, function(a, b) return a.robuxPrice < b.robuxPrice end)
```

This `&lt;` will cause a Lua syntax error in Roblox Studio.

### Bug 2: GamePassConfig DevProducts Overlap

`GamePassConfig.DevProducts` defines 10 dev products (gems + consumables) while `DevProductsConfig.lua` defines 16 dev products (currency + revives + boosts + gacha). These overlap and have different schemas.

**Resolution:** Use `DevProductsConfig.lua` as the canonical dev product source (it's more comprehensive, has idempotent receipt processing, and integrates with EconomyManager). Remove or deprecate the `DevProducts` table from `GamePassConfig.lua`.

---

## Quick Reference Checklist

```
[ ] 1. Open Creator Dashboard → Monetization → Passes
[ ] 2. Create 5 Game Passes (see Phase 1 table)
[ ] 3. Upload 150x150 icons for each pass
[ ] 4. Copy 5 Game Pass IDs → paste into GamePassConfig.lua
[ ] 5. Open Creator Dashboard → Monetization → Developer Products  
[ ] 6. Create 16 Developer Products (see Phase 2 tables)
[ ] 7. Copy 16 Product IDs → paste into DevProductsConfig.lua
[ ] 8. Fix HTML entity bug in DevProductsConfig.lua (Phase 4)
[ ] 9. Remove duplicate ProcessReceipt callbacks (Phase 3)
[ ] 10. Studio smoke test: require(GamePassConfig) + require(DevProductsConfig)
[ ] 11. Test purchase flow in Studio (test mode)
[ ] 12. Verify ReceiptRouter routes all receipts correctly
```

---

## Revenue Projection (Once IDs Are Live)

Based on MonetizationArchitectureDeepDive.md analysis:

| DAU | Estimated Daily Revenue (R$) | Monthly (R$) |
|-----|------------------------------|-------------|
| 100 | 2,000-5,000 | 60K-150K |
| 1,000 | 20K-50K | 600K-1.5M |
| 10,000 | 200K-500K | 6M-15M |

Key: Game Pass conversion ~2-5% of DAU. Dev Product repeat purchase ~10-15% of spenders.

---

## File Cross-Reference

| File | Location | Role | IDs Needed |
|------|----------|------|------------|
| GamePassConfig.lua | CANON/TRAIN-67/CODE/ | 5 Game Passes + pass ownership cache | 5 Game Pass IDs |
| DevProductsConfig.lua | CANON/TRAIN-67/CODE/ | 16 Dev Products + receipt processing | 16 Product IDs |
| ReceiptRouter.lua | CANON/TRAIN-67/CODE/ | Unified ProcessReceipt callback | None (routes to handlers) |
| MonetizationOrchestrator.lua | CANON/TRAIN-67/CODE/ | Offer decision engine | Reads from above |
| UnifiedServer.lua | CANON/TRAIN-67/CODE/ | Boot sequence (load order matters) | None |

---

*Platform Death Test: PASS — all products defined, all placeholders mapped, conflict identified and resolution documented.*
