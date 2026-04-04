# Trading System — Implementation Spec
> Train-67 | Created: 2026-03-28 | Status: READY FOR COPILOT
> Priority: 🔴 BEFORE LAUNCH | Pipeline Stage: 3

## PURPOSE
Trading is THE #1 retention mechanic across top Roblox earners. Grow a Garden, Blox Fruits, Pet Sim 99, Adopt Me — all have trading as their core loop. Without trading, players beat the game and leave. With trading, they NEVER leave because the economy is infinite.

## TRADING HUB

### Location
- **Depot Stop 3: "The Bazaar"** — dedicated train car that serves as the trading hub
- Always accessible from any depot via fast-travel
- Visual: neon market aesthetic, stalls, display cases showing "recent trades"
- Capacity: 30 players per instance (matchmake by level range)

### Trade UI
```
+--------------------------------------------------+
|              TRADE WITH: PlayerName               |
+---------------------+----------------------------+
|   YOUR OFFER        |   THEIR OFFER              |
|                     |                            |
| [Item Slot 1]       | [Item Slot 1]              |
| [Item Slot 2]       | [Item Slot 2]              |
| [Item Slot 3]       | [Item Slot 3]              |
| [Item Slot 4]       | [Item Slot 4]              |
|                     |                            |
| + 500 Coins         | + 0 Coins                  |
|                     |                            |
| Total Value: 2,450  | Total Value: 3,100         |
+---------------------+----------------------------+
|  Warning: Trading Tax: 245 Coins (10%)           |
|  [ACCEPT]  [COUNTER]  [DECLINE]                  |
+--------------------------------------------------+
```

### Trade Rules
- **Max 4 items per side per trade** (6 with Trading Pro pass)
- **Coins can be added to either side** to balance trades
- **Both players must ACCEPT** — 5-second countdown after both accept (cancel window)
- **Trade-locked items** show a lock icon and cannot be placed in trade slots
- **Value display** shows estimated value based on rarity x mutation x recent trade history

### Trading Tax
| Trade Value (Coins) | Tax Rate | Revenue |
|---------------------|----------|---------|
| 0 - 999 | 0% | Free trades for small items |
| 1,000 - 9,999 | 5% | Light tax |
| 10,000 - 99,999 | 10% | Standard tax |
| 100,000+ | 15% | Whale tax |

- **Trading Pro pass holders:** Tax reduced to 3% flat (all tiers)
- Tax is paid in coins by the INITIATOR of the trade
- Tax is a coin SINK — removes currency from economy, fights inflation

### Trade-Locked Items
These items CANNOT be traded:
- Battle Pass rewards (exclusive to earner)
- Prestige shop items (earned through gameplay)
- Subscriber-exclusive items (monthly drops)
- Achievement/milestone rewards
- "Soulbound" items (from completing specific challenges)

**Everything else is tradeable.** This is critical — the more items that can trade, the deeper the economy.

## MARKET BOARD

### What It Shows
- Last 50 trades (anonymized): "Cosmic Legendary Katana traded for Mythic Crossbow + 50,000 coins"
- **Price index** per item: average trade value over last 7 days
- **Trending items:** what's being traded most (volume)
- **Rare sightings:** latest SECRET/Glitched/Mythic drops (who got it, what biome)

### Market Board Location
- Display screen in The Bazaar
- Also accessible from inventory menu (button: "Market Prices")

## SCARCITY MECHANICS

### Limited Edition Items
- **Launch Week items** — available Day 1-7 ONLY. Never return. Value increases forever.
- **Season-exclusive items** — only obtainable during that Battle Pass season. Once season ends, GONE.
- **Event items** — from hourly events and special events. Limited quantity per event.
- **Holiday items** — Christmas, Halloween, etc. Return annually but with DIFFERENT designs. Originals stay rare.

### Artificial Scarcity Levers
- **"Sunset" items** — every quarter, 3 items get "sunset" (removed from drop tables). Existing copies become collector items.
- **Serial numbers** — first 100 of any new item get a visible serial number (#001 - #100). Serial #001 is worth 100x.
- **Signed items** — items dropped during a developer play session get a "Dev Signed" tag. Ultra rare.

## ANTI-SCAM PROTECTION

- **Trade review screen** — 5-second mandatory review before trade completes
- **Value warning** — if one side's value is >300% of the other, yellow warning: "This trade may be uneven"
- **Trade history** — players can view their last 50 trades
- **Report system** — report suspicious trades, auto-flag for review
- **Cooldown** — max 20 trades per hour per player (prevents bot farming)

## ECONOMY BALANCE

### Currency Flow
```
INFLOW (earning):
  Zombie kills -> coins
  Boss kills -> coins + items
  Daily challenges -> coins
  World events -> coins + items
  Trading (selling items) -> coins

OUTFLOW (spending):
  Weapon upgrades -> coins
  Forge mutations -> coins
  Trading tax -> coins (DESTROYED)
  Lucky Spin -> Robux
  Dev products -> Robux
  Game passes -> Robux
```

### Inflation Control
- Trading tax destroys coins -> reduces supply
- Upgrade costs scale exponentially -> absorbs coins at high levels
- New coin sinks added each season (new upgrade paths, new crafting)
- If average player coin balance exceeds threshold -> auto-increase upgrade costs by 5%

## LUA MODULE MAPPING

| New Module | Purpose | Priority |
|-----------|---------|----------|
| `TradingManager` (Server) | Handles trade initiation, validation, execution, tax calculation | REPLACE |
| `TradingUI` (Client) | Trade window, item slots, value display, accept/decline | NEW |
| `MarketBoard` (Server) | Tracks trade history, calculates price index, trending items | NEW |
| `MarketBoardUI` (Client) | Displays market data, price charts, rare sightings | NEW |
| `EconomyManager` (existing) | SURGERY: Add trading tax logic, inflation monitoring | SURGERY |
| `InventoryManager` (existing) | SURGERY: Add trade-lock flags, serial numbers | SURGERY |

## REMOTE EVENTS

```lua
-- Client -> Server: Initiate Trade
TradeRequest:FireServer({targetPlayer = Player})

-- Server -> Client: Trade Window
TradeWindowOpen:FireClient(player, {
    partnerName = string,
    partnerLevel = number,
    partnerItems = {}
})

-- Client -> Server: Place Item
TradeAddItem:FireServer({tradeId = string, itemId = string, slot = number})

-- Client -> Server: Add Coins
TradeAddCoins:FireServer({tradeId = string, amount = number})

-- Server -> Both Clients: Trade Update
TradeStateUpdate:FireClient(player, {
    yourItems = {}, theirItems = {},
    yourCoins = number, theirCoins = number,
    yourTotalValue = number, theirTotalValue = number,
    taxAmount = number, valueWarning = boolean
})

-- Server -> Both Clients: Trade Complete
TradeComplete:FireClient(player, {
    itemsReceived = {}, coinsReceived = number, taxPaid = number
})

-- Server -> All: Market Update
MarketBoardUpdate:FireAllClients({
    recentTrades = {}, trendingItems = {}, priceChanges = {}
})
```

## TESTING CHECKLIST

- [ ] Trade initiation works between two players
- [ ] Items display correctly in trade UI with rarity/mutation info
- [ ] Value calculation is accurate (rarity x mutation x market history)
- [ ] Tax applies correctly at all thresholds
- [ ] Trading Pro pass reduces tax to 3%
- [ ] Trade-locked items cannot be placed in trade slots
- [ ] 5-second review countdown works, cancel works
- [ ] Value warning triggers at >300% imbalance
- [ ] Trade history saves and displays correctly
- [ ] Market Board updates in real-time
- [ ] 20 trades/hour cooldown enforced
- [ ] Mobile: trade UI is usable on small screens
- [ ] No item duplication exploits (server validates both inventories)
- [ ] Coins correctly deducted/added for both parties
