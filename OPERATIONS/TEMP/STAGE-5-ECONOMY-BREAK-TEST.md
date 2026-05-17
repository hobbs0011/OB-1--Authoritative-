# BATTLE STAGE 5 — ECONOMY BREAK TEST

**Date:** 2026-03-26
**Auditor:** Ne0 (CHAT 000)
**Scope:** EconomyManager, GachaManager, TradeManager, MonetizationServer, GamePassConfig, DevProductsConfig, BattlePass, DailyRewards

---

## CURRENT STATE: NO ECONOMY EXISTS AT RUNTIME

All economy modules exist as code but **none are initialized**. This means:
- Players earn zero persistent currency
- No items can be purchased
- No trades can happen
- No gacha pulls can be made
- The game has zero monetization

This section analyzes what WOULD break if the economy were activated.

---

## CURRENCY SYSTEM ANALYSIS

### Dual Currency Design (EconomyManager)

| Currency | Earn Rate | Spend Sinks | Balance Risk |
|----------|-----------|-------------|-------------|
| **Scrap Metal** (free) | Kill rewards, wave clear, daily login | Gacha pulls, basic items | ⚠️ INFLATION — no drain cap |
| **Brain Cells** (premium) | Boss kills, achievements, Robux purchase | Premium gacha, cosmetics | ✅ Gated by content |

### Break Test 1: Infinite Scrap Metal

**Attack vector:** Enemy kill rewards are processed on the CLIENT (EnemyDied event sends XP amount). Server never validates.

```
CLIENT exploiter:
1. Listen to EnemyDied RemoteEvent
2. Fire fake EnemyDied events to self
3. Each fake event = free XP + currency
4. No server validation exists
```

**RESULT:** 🔴 BROKEN — Client can fabricate unlimited currency.

**Fix:** Server-side kill tracking. Enemy Died → server validates enemy was in ActiveEnemies → server awards currency → server sends update to client.

### Break Test 2: Gacha Pity System

GachaManager has a pity counter that guarantees a Rare+ after N pulls. But:

```lua
-- GachaManager pulls from EconomyManager
-- EconomyManager is never initialized
-- Pity counter stored in... player data? session memory?
```

**RESULT:** ⚠️ UNKNOWN — Can't test pity without initialization. But the pity counter appears to be session-only (no DataStore write), meaning it resets on rejoin. Players who pull 99 times, leave, and come back lose their pity progress.

**Fix:** Persist pity counter in DataStore alongside player data.

### Break Test 3: Trade Duplication

TradeManager allows player-to-player item trades. Classic dupe vectors:

| Vector | Protected? | Notes |
|--------|-----------|-------|
| Trade + disconnect simultaneously | ⚠️ UNCLEAR | No explicit atomic trade in code |
| Trade same item to two players | ⚠️ UNCLEAR | No item lock mechanism visible |
| Trade with self | ✅ LIKELY BLOCKED | TradeManager checks player IDs |
| Modify trade payload mid-flight | ⚠️ If through ServerGateway, rate-limited. If direct, no protection |

**RESULT:** 🟡 HIGH RISK — Trade system needs:
- Atomic transactions (both sides commit or both roll back)
- Item locking during trade window
- Server-side item validation (player owns what they claim)

### Break Test 4: Daily Rewards Double-Claim

DailyRewards uses DataStore to track last claim time. But:

```
ATTACK: Change device clock → trigger "new day" → claim again
DEFENSE: DailyRewards uses os.time() which is SERVER time, not client
RESULT: ✅ PROTECTED — server-side time check
```

However:
```
ATTACK: Exploit to fire the claim RemoteEvent multiple times rapidly
DEFENSE: Depends on whether ServerGateway rate limiting is active
RESULT: ⚠️ VULNERABLE if ServerGateway not initialized (which it isn't)
```

### Break Test 5: GamePass Ownership Spoofing

GamePassConfig checks `MarketplaceService:UserOwnsGamePassAsync()`. This is a Roblox API call that cannot be spoofed client-side. ✅ SAFE.

But GamePassConfig caches results in `playerPerks[userId]`. If cache is populated before ownership check completes (race condition), player might briefly have perks without owning the pass.

**Fix:** Don't apply perks until async check completes. Use a loading state.

### Break Test 6: Robux Purchase Flow

MonetizationServer uses `MarketplaceService.ProcessReceipt`. This is Roblox's official callback — server-authoritative, cannot be spoofed.

**BUT:** ProcessReceipt must return `Enum.ProductPurchaseDecision.PurchaseGranted` only AFTER the currency/item is saved to DataStore. If the DataStore write fails and we return PurchaseGranted anyway, the player loses their Robux and gets nothing.

**Current code analysis:** MonetizationServer appears to grant the item then return PurchaseGranted. If DataStore is down, the item grant succeeds in session but doesn't persist. Player loses item on rejoin but already spent Robux.

**RESULT:** 🔴 CRITICAL — Must only return PurchaseGranted after confirmed DataStore write. Return `NotProcessedYet` on failure so Roblox retries.

---

## RARITY TABLE ANALYSIS

| Rarity | Chance | Expected Pulls | Pity? |
|--------|--------|---------------|-------|
| Common | 50.0% | 2 | No |
| Uncommon | 30.0% | 3.3 | No |
| Rare | 12.0% | 8.3 | Yes? |
| Epic | 5.0% | 20 | ? |
| Legendary | 2.0% | 50 | ? |
| Mythic | 0.8% | 125 | ? |
| Godly | 0.15% | 667 | ? |
| Rizzlord | 0.05% | 2,000 | ? |

**Total:** 100.0% ✅ Probabilities sum correctly.

**Rizzlord at 0.05%** = 1 in 2,000 pulls. If each pull costs 100 Scrap Metal, that's 200,000 Scrap Metal for expected Rizzlord. Need to verify earning rate makes this achievable but aspirational.

**Regulatory note:** Gacha/lootbox disclosure is legally required in some jurisdictions (Belgium, Netherlands, Japan). Roblox ToS requires drop rates to be disclosed to users.

---

## ECONOMY BALANCE PROJECTION

Assuming economy gets wired:

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Currency earn rate | 0 (broken) | ~500 Scrap/session | TOTAL |
| Currency drain rate | 0 (broken) | ~400 Scrap/session | TOTAL |
| Session length driver | None | "one more pull" / daily reward | TOTAL |
| Paying player conversion | 0% | 2-5% | TOTAL |
| ARPPU | $0 | $5-15/month | TOTAL |

**The economy exists on paper. In practice, the game has zero economy.**

---

## VERDICT

6 break points found. The most critical:
1. **Client-side currency fabrication** (no server validation on kills)
2. **ProcessReceipt data loss** (Robux spent, item not persisted)
3. **Trade duplication risk** (no atomic transactions)

None of these are active because the economy isn't wired. But they MUST be fixed before activation.

---

*Stage 5 Complete. Artifact class: 🏦 VAULT*
