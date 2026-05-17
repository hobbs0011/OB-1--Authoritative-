# Monetization Implementation Spec — Game Passes + Dev Products + Subscriptions + Ads
> Train-67 | Created: 2026-03-28 | Status: READY FOR COPILOT
> Priority: 🔴 BEFORE LAUNCH | Pipeline Stages: 6, 7, 9, 10

## GAME PASSES (One-Time Purchases)

### Pass 1: VIP (399 R$)
```lua
-- GamePassId: TBD
-- Effects:
local VIP_PERKS = {
    xpMultiplier = 2.0,          -- 2x XP on all sources
    coinMultiplier = 2.0,         -- 2x coins on all sources
    chatBadge = "👑",             -- VIP badge in chat
    exclusiveCosmetic = "VIP_Crown", -- permanent crown cosmetic
    trainCarAccess = "VIP_Lounge",  -- exclusive VIP train car
    dailySpinBonus = 1,           -- +1 free Lucky Spin per day
}
```

### Pass 2: Private Server+ (199 R$)
```lua
-- GamePassId: TBD
-- Effects:
local PRIVATE_SERVER_PERKS = {
    spawnRateMultiplier = 2.0,    -- 2x zombie spawns
    practiceMode = true,          -- can toggle invincibility
    maxFriendInvites = 10,        -- invite up to 10 friends
    exclusiveDrops = false,       -- same drops as public
    lootMutationBonus = 0,        -- no mutation bonus (that's a different pass)
}
```

### Pass 3: Auto-Farm Lite (799 R$)
```lua
-- GamePassId: TBD
-- Effects:
local AUTOFARM_PERKS = {
    afkDuration = 1800,           -- 30 minutes AFK farming
    afkKillRate = 0.5,            -- 50% of normal kill rate
    afkLootCollection = true,     -- auto-collect drops
    afkMutationRate = 0.5,        -- 50% mutation rate while AFK
    cooldown = 3600,              -- 1 hour cooldown between AFK sessions
    maxDayReached = true,         -- only farms up to current max day
}
-- Note: AFK players show a sleeping animation. Other players can see them.
-- This prevents "invisible farming" complaints.
```

### Pass 4: Mutation Boost (499 R$)
```lua
-- GamePassId: TBD
-- Effects:
local MUTATION_BOOST_PERKS = {
    mutationRateMultiplier = 1.5, -- +50% to ALL mutation rates
    -- Base rates with boost:
    -- Minor: 20% → 30%
    -- Major: 8% → 12%
    -- Cosmic: 1.8% → 2.7%
    -- Glitched: 0.2% → 0.3%
    visualIndicator = "MutationAura", -- visible aura showing boost is active
}
```

### Pass 5: Trading Pro (299 R$)
```lua
-- GamePassId: TBD
-- Effects:
local TRADING_PRO_PERKS = {
    tradingTaxRate = 0.03,        -- 3% flat (vs 5-15% normal)
    extraTradeSlots = 2,          -- 6 items per trade (vs 4)
    tradeHistoryAccess = true,    -- full trade history + analytics
    marketBoardPremium = true,    -- price trend charts, alerts
    tradeSearchRadius = "server", -- can search for specific items across server
}
```

## DEV PRODUCTS (Repeatable Purchases)

### Product 1: Lucky Spin (75 R$)
```lua
-- ProductId: TBD
local LUCKY_SPIN = {
    price = 75,
    freePerDay = 1, -- 1 free spin per day for all players
    freePerDayVIP = 2, -- VIP gets 2 free
    freePerDaySubscriber = {Survivor=1, Warrior=3, Overlord=5},
    
    -- Weighted drop table:
    rewards = {
        {item = "500_coins",     weight = 30, display = "500 Coins"},
        {item = "1000_coins",    weight = 20, display = "1,000 Coins"},
        {item = "xp_boost_1hr",  weight = 15, display = "XP Boost (1hr)"},
        {item = "common_crate",  weight = 12, display = "Common Crate"},
        {item = "rare_crate",    weight = 8,  display = "Rare Crate"},
        {item = "5000_coins",    weight = 6,  display = "5,000 Coins"},
        {item = "mutation_reroll",weight = 4, display = "Mutation Reroll"},
        {item = "epic_crate",    weight = 3,  display = "Epic Crate"},
        {item = "legendary_crate",weight = 1.5, display = "Legendary Crate"},
        {item = "mythic_fragment",weight = 0.5, display = "Mythic Fragment ×1"},
    }
    -- Visual: spinning wheel animation, 3 seconds, suspense SFX
}
```

### Product 2: Instant Revive (25 R$)
```lua
-- ProductId: TBD
-- Shown on death screen: "Revive Here (25 R$) or Respawn at Depot (Free)"
-- Boss fights: this is basically mandatory for casuals
-- Ad alternative: "Watch Ad to Revive Free" (1 per hour)
```

### Product 3: Loot Magnet (50 R$)
```lua
-- ProductId: TBD
local LOOT_MAGNET = {
    price = 50,
    duration = 1800, -- 30 minutes
    pickupRadius = 50, -- studs (vs default 5)
    autoCollect = true, -- no button press needed
    visualEffect = "magnetic_field", -- visible aura
}
```

### Product 4: Mutation Reroll (150 R$)
```lua
-- ProductId: TBD
-- Usage: Select any item in inventory → "Reroll Mutation" button
-- Keeps: item rarity, item type, item level
-- Rerolls: mutation tier (none/minor/major/cosmic/glitched)
-- Uses same mutation rate table (affected by Mutation Boost pass)
-- Average cost to hit Cosmic: ~56 rerolls = 8,400 R$
-- Average cost to hit Glitched: ~500 rerolls = 75,000 R$
```

### Product 5: XP Boost (50 R$)
```lua
-- ProductId: TBD
local XP_BOOST = {
    price = 50,
    duration = 3600, -- 1 hour
    multiplier = 2.0, -- 2x XP (stacks with VIP = 4x total)
    visualEffect = "xp_sparkle",
}
```

### Product 6: Coin Packs
```lua
-- Multiple ProductIds
local COIN_PACKS = {
    {price = 49,  coins = 1000,   bonus = 0},
    {price = 149, coins = 3500,   bonus = "17% bonus!"},
    {price = 499, coins = 13000,  bonus = "30% bonus!"},
    {price = 999, coins = 30000,  bonus = "50% bonus!"},
}
-- Display: Show the bonus % prominently. Higher packs = better value.
```

### Product 7: Crate Keys
```lua
-- Multiple ProductIds
local CRATE_KEYS = {
    {price = 75,  tier = "Rare",      guaranteed = "Rare+ item"},
    {price = 150, tier = "Epic",      guaranteed = "Epic+ item"},
    {price = 300, tier = "Legendary", guaranteed = "Legendary+ item"},
}
-- Crates drop from bosses and events. Keys are separate.
-- This separation is CRITICAL — it creates two desire loops.
```

### Product 8: Name Tag (25 R$)
```lua
-- ProductId: TBD
-- Usage: Select weapon or pet → "Rename" → type custom name (filtered)
-- Max 20 characters
-- Filtered for profanity (Roblox TextService)
-- Renamed items show custom name in trades (adds perceived value)
```

## SUBSCRIPTIONS (Recurring — Roblox Subscription API)

### Implementation Notes
- Roblox Subscriptions are managed via the Subscription API
- Recurring billing handled by Roblox — we just check subscription status
- Must implement: subscription check on join, periodic re-check, grace period

### Tier Structure
```lua
local SUBSCRIPTION_TIERS = {
    Survivor = {
        price = 499, -- R$/month
        perks = {
            dailyLoginBonus = 500, -- coins
            xpMultiplier = 1.25,
            freeSpinsPerDay = 1,
            subscriberBadge = "🎖️",
            discordRole = "Survivor",
        }
    },
    Warrior = {
        price = 999,
        perks = {
            dailyLoginBonus = 1500,
            xpMultiplier = 1.5,
            coinDropMultiplier = 1.5,
            freeSpinsPerDay = 3,
            earlyAccess = 48, -- hours before public
            exclusiveMonthlySkin = true,
            subscriberBadge = "⚔️",
            discordRole = "Warrior",
        }
    },
    Overlord = {
        price = 1999,
        perks = {
            dailyLoginBonus = 5000,
            xpMultiplier = 2.0,
            coinDropMultiplier = 2.0,
            mutationRateMultiplier = 2.0,
            freeSpinsPerDay = 5,
            earlyAccess = 48,
            exclusiveMonthlySkin = true,
            privateServerIncluded = true,
            priorityMatchmaking = true,
            monthlyMythicCrate = true,
            subscriberBadge = "👑",
            discordRole = "Overlord",
        }
    }
}
```

### Subscription Events
```lua
-- Check on player join
game.Players.PlayerAdded:Connect(function(player)
    local subTier = getSubscriptionTier(player) -- via API
    if subTier then
        applySubscriptionPerks(player, subTier)
        syncDiscordRole(player, subTier) -- webhook to Discord bot
    end
end)

-- Monthly appreciation event (1st of each month)
-- Spawn exclusive subscriber-only boss
-- Drops: subscriber-exclusive cosmetics
-- Duration: 24 hours
```

## REWARDED VIDEO ADS

### Implementation
```lua
-- Roblox Rewarded Video API
local AdsService = game:GetService("AdsService")

-- Placement 1: Free Revive
-- Trigger: On death, show "Watch Ad to Revive Free"
-- Cooldown: 1 per hour
local function offerAdRevive(player)
    if canShowAd(player, "revive") then
        AdsService:ShowRewardedVideo(player, "revive_placement")
    end
end

-- Placement 2: 2x Loot
-- Trigger: After boss kill, show "Watch Ad for 2x Loot (10 min)"
-- Cooldown: 1 per 30 min
local function offerAdLootBoost(player)
    if canShowAd(player, "loot_boost") then
        AdsService:ShowRewardedVideo(player, "loot_boost_placement")
    end
end

-- Placement 3: Free Lucky Spin
-- Trigger: After daily free spin used, show "Watch Ad for Extra Spin"
-- Cooldown: 1 per hour
local function offerAdSpin(player)
    if canShowAd(player, "free_spin") then
        AdsService:ShowRewardedVideo(player, "spin_placement")
    end
end

-- Placement 4: Skip Timer
-- Trigger: When crafting/evolution timer active, show "Watch Ad to Skip"
-- Cooldown: 2 per hour

-- Global cap: 6 ads per hour per player
-- Ad reward callback:
AdsService.OnVideoAdCompleted:Connect(function(player, placementId)
    if placementId == "revive_placement" then
        revivePlayer(player)
    elseif placementId == "loot_boost_placement" then
        applyLootBoost(player, 600) -- 10 min
    elseif placementId == "spin_placement" then
        grantFreeSpinToken(player)
    end
end)
```

### Ad Eligibility
- Roblox requires: 100K+ play sessions to enable ads
- Plan: Launch without ads → enable when threshold hit (likely Week 2-3)
- Revenue estimate: $0.01-0.03 per completed ad view
- At 10K DAU × 40% engagement × 3 ads/player = 12K views/day = $120-360/day
- At scale (50K DAU): $600-1,800/day from ads alone

## REVENUE MODEL SUMMARY

| Source | Price | Est. Conversion | Monthly Revenue (10K DAU) |
|--------|-------|-----------------|--------------------------|
| VIP Pass | 399 R$ | 8% of D7 players | ~$500 |
| Private Server+ | 199 R$ | 5% | ~$150 |
| Auto-Farm Lite | 799 R$ | 3% | ~$350 |
| Mutation Boost | 499 R$ | 4% | ~$300 |
| Trading Pro | 299 R$ | 2% | ~$90 |
| Lucky Spins | 75 R$ | 15% daily active | ~$2,000 |
| Instant Revive | 25 R$ | 20% per session | ~$800 |
| Loot Magnet | 50 R$ | 5% daily | ~$400 |
| Mutation Reroll | 150 R$ | 3% daily | ~$700 |
| Coin Packs | 49-999 R$ | 5% | ~$1,200 |
| Crate Keys | 75-300 R$ | 8% | ~$1,000 |
| Battle Pass | 499 R$ | 12% monthly | ~$900 |
| Tier Skips | 75 R$ each | 5% buy 10+ | ~$600 |
| Subscriptions | $5-20/mo | 3% | ~$1,500 |
| Rewarded Ads | — | 40% watch rate | ~$3,000-9,000 |
| **TOTAL** | | | **~$13,500-19,500/mo** |

*At 50K DAU (realistic at 3-6 months with good retention):* **$67,500-97,500/mo**

**Revenue per DAU: ~$1.35-1.95/user/month** — competitive with top 50 Roblox games.

## LUA MODULES TO CREATE/MODIFY

| Module | Action | Priority |
|--------|--------|----------|
| `GamePassManager` (Server) | NEW — handles all pass detection + perk application | 🔴 |
| `DevProductManager` (Server) | SURGERY on existing — add all new products | 🔴 |
| `SpinWheelManager` (Server) | NEW — Lucky Spin logic + animation trigger | 🔴 |
| `SpinWheelUI` (Client) | NEW — spinning wheel visual + result display | 🔴 |
| `SubscriptionManager` (Server) | NEW — check subscription status, apply perks | 🟡 |
| `AdManager` (Server) | NEW — rewarded video placements + rewards | 🟡 |
| `RevenueAnalytics` (Server) | NEW — track all purchases for optimization | 🟢 |

## TESTING CHECKLIST

- [ ] All 5 game passes correctly apply perks on join
- [ ] All dev products correctly process and grant rewards
- [ ] Lucky Spin weights match spec (10,000 spin sample)
- [ ] Free spins reset daily at midnight server time
- [ ] Mutation Boost stacks correctly with base rates
- [ ] Trading Pro tax reduction applies correctly
- [ ] Subscription tiers correctly identified and perks applied
- [ ] Subscription cancellation correctly removes perks
- [ ] Ad placements show at correct moments with correct cooldowns
- [ ] Ad rewards granted correctly after completion
- [ ] 6/hour global ad cap enforced
- [ ] Mobile: all purchase UIs readable and functional
- [ ] No duplicate purchase exploits
- [ ] Revenue analytics logging all transactions
