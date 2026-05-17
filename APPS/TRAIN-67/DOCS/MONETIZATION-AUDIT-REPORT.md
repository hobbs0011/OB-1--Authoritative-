# Monetization Stack Audit Report
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Action:** #3 of 20

## Executive Summary
**Grade: B+ — MonetizationOrchestrator + ReceiptRouter are production-quality. MonetizationServer is a legacy prototype with stub functions.**

The monetization architecture is split across 3 modules with clear separation of concerns. The Orchestrator + Router combo is solid. MonetizationServer.lua is dead weight that should be deprecated.

## Architecture Map

```
MonetizationOrchestrator.lua (BRAIN — decides WHAT/WHEN to offer)
         ↓ contextual triggers
    Client UI (ShowContextualOffer remote)
         ↓ player purchases
ReceiptRouter.lua (SPINE — ONLY ProcessReceipt handler)
         ↓ dispatches to registered handlers
DevProductsConfig / GamePassConfig / GachaManager / BattlePass
         ↓ fulfillment complete
MonetizationOrchestrator.OnPurchaseComplete() (tracks spend tier)
```

## Module Grades

### MonetizationOrchestrator.lua — Grade: A-
**SHA:** 2f5622b5 | **Size:** ~25KB | **Status:** PRODUCTION-READY

**Strengths:**
- Unified offer decision engine with scoring system
- 4-tier spend tracking (Never Spent → Minnow → Dolphin → Whale)
- Robust annoyance guard with 12+ protection rules
- Contextual trigger system with 14 valid triggers
- FTUE handoff with 5-min delayed soft sell
- English × Monetization bridge (streak/milestone triggers)
- Full analytics instrumentation
- Fail-closed: if Orchestrator errors, NO offers shown
- DataStore persistence with session + daily state

**Issues Found:**

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟡 | All `productId = 0` in OFFER_CATALOG | Expected — IDs not created yet (Blocker 3). No code bug. |
| 2 | 🟡 | Uses `Remotes` folder only (line ~380) | Inconsistent with FTUEController which uses `GameRemotes`. Standardize. |
| 3 | 🟢 | `PRODUCT_PRICES` map is empty (all IDs = 0) | `OnPurchaseComplete` will log `robuxAmount = 0`. Fix when IDs assigned. |
| 4 | 🟢 | `getActiveOffers` scoring doesn't account for purchase recency | Could show similar offers too soon after a purchase of the same type. Minor. |
| 5 | 🟢 | No A/B test framework | Future enhancement. Not needed for launch. |

### ReceiptRouter.lua — Grade: A
**SHA:** 11303d4c | **Size:** ~18KB | **Status:** PRODUCTION-READY

**Strengths:**
- Solves the critical ProcessReceipt conflict between DevProductsConfig and GamePassConfig
- Idempotent via DataStore dedup (checks before ANY handler runs)
- 3-priority dispatch: exact product ID → category matcher → fallback
- Audit trail with batched DataStore writes
- Handler isolation (pcall around each handler)
- Unknown products return NotProcessedYet (safe retry)
- Built-in diagnostics and conflict audit
- Clean migration guide in comments
- Category handlers for ID=0 products during development

**Issues Found:**

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🟡 | Sets `ProcessReceipt` at module load time (side effect) | Requiring the module activates it. Document this clearly in boot sequence. |
| 2 | 🟢 | `AuditConflicts()` always returns empty table | The conflict detection logic is incomplete — it counts per-module but doesn't actually detect cross-module conflicts. |
| 3 | 🟢 | Audit buffer never caps size | If flushes fail repeatedly, buffer grows unbounded. Add max buffer size. |

### MonetizationServer.lua — Grade: D (LEGACY PROTOTYPE)
**SHA:** 02fc92ef | **Size:** ~8KB | **Status:** DEPRECATED — DO NOT LOAD

**Critical Problems:**
1. **Stub functions everywhere** — `GetPlayerData`, `GenerateItem`, `AddToInventory`, `GetAuction`, `ExecuteTrade`, `CommitTrade`, `LogFailure`, `SendNotification`, `SendWarning`, `ContainsAdminItem` — ALL UNDEFINED
2. **Duplicate gacha system** — Has its own rarity table + pity system, separate from GachaManager.lua
3. **No ReceiptRouter integration** — If loaded, would conflict with the router
4. **No DataStore** for trades or auctions
5. **Trading system is skeleton only** — ActiveTrades table is in-memory, no persistence
6. **Auction house is skeleton only** — PlaceBid exists but no CreateAuction, EndAuction, etc.

**Recommendation:** Remove from require chain. Keep file for reference (append-first). Use GachaManager.lua for gacha, TradeManager.lua for trading.

## Cross-Module Integration Status

| Integration Point | Status | Notes |
|-------------------|--------|-------|
| Orchestrator → ReceiptRouter | ✅ Connected | Via `RegisterCompletionCallback` |
| ReceiptRouter → DevProductsConfig | ✅ Ready | Via `RegisterDevProducts` helper |
| ReceiptRouter → GamePassConfig | ✅ Ready | Via `RegisterGamePassDevProducts` helper |
| Orchestrator → EnglishRewardsManager | ✅ Connected | Via `OnEnglishEvent` bridge |
| Orchestrator → FTUEController | 🟡 Partial | `OnFTUEComplete` exists but FTUEController doesn't call it |
| Orchestrator → GachaManager | 🟡 Partial | Dep loaded but no trigger wiring |
| Orchestrator → BattlePass | 🟡 Partial | Dep loaded but no trigger wiring |
| MonetizationServer → anything | ❌ Disconnected | Legacy prototype, not integrated |

## Remote Folder Audit (Cross-System)

| Module | Folder Used | Status |
|--------|-------------|--------|
| FTUEController | `GameRemotes` OR `Remotes` | ✅ Fallback |
| FTUEManager | `GameRemotes` only | 🟡 Rigid |
| FTUEWiring | `Remotes` only | 🟡 Rigid |
| MonetizationOrchestrator | `Remotes` only | 🟡 Rigid |
| ReceiptRouter | N/A (uses MarketplaceService) | ✅ N/A |

**Recommendation:** Standardize ALL modules to use `GameRemotes` with `Remotes` fallback (FTUEController pattern).

## Recommended Fix Priority
1. **Do NOT load MonetizationServer.lua** in UnifiedServer boot sequence
2. **Wire FTUEController.RunFTUE completion → Orchestrator.OnFTUEComplete()** (missing link)
3. **Wire GachaManager pity/dup events → Orchestrator.OnContextualTrigger()** 
4. **Wire BattlePass near-tier events → Orchestrator.OnContextualTrigger()**
5. **Standardize remote folder name** across all modules
6. **Add max buffer size** to ReceiptRouter audit buffer

## Files Audited
- `MonetizationOrchestrator.lua` — SHA: 2f5622b5 (25,120 bytes)
- `ReceiptRouter.lua` — SHA: 11303d4c (18,432 bytes)
- `MonetizationServer.lua` — SHA: 02fc92ef (8,192 bytes)

## Next Action
Action 4: Combat + Enemy System Audit
