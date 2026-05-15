# CosmeticTrinityIntegrationSpec.md
## Cosmetic Trinity Integration Specification — TRAIN-67 Roblox Experience
### Version: 1.0 | Artifact Class: 🔨 BUILD | Run: 54 | Date: 2026-03-27

---

> **Canon Source:** Synthesized from 6 cross-repo source files:
> - `STAGE-15-COSMETIC-TRINITY-SPEC.md` (SHA `9d53b3de`) — Master design spec
> - `GachaManager.lua` (SHA `8ed648e3`) — Gacha/crate system implementation
> - `BattlePass.lua` (SHA `71a5c55f`) — Season pass with cosmetic rewards
> - `MonetizationServer.lua` (SHA `02fc92ef`) — Server-side monetization + rarity system
> - `TradeManager.lua` (SHA `11a04441`) — P2P trading infrastructure
> - `EnglishRewardsManagerSpec.md` (SHA `f442ac19`) — English→Cosmetic reward bridge
> - `MonetizationOrchestratorSpec.md` (SHA `6ed43ba3`) §10 — Cosmetic desire signals
>
> **Law:** English is the mechanic, money is the mission. Every cosmetic exists to reward English mastery and drive monetization.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [The Cosmetic Trinity — Three Pillars](#2-the-cosmetic-trinity--three-pillars)
3. [Rarity System — Unified 8-Tier Hierarchy](#3-rarity-system--unified-8-tier-hierarchy)
4. [CosmeticCatalog Module](#4-cosmeticcatalog-module)
5. [PetController Architecture](#5-petcontroller-architecture)
6. [AuraController Architecture](#6-auracontroller-architecture)
7. [SkinController Architecture](#7-skincontroller-architecture)
8. [DataStore Schema](#8-datastore-schema)
9. [Integration: GachaManager](#9-integration-gachamanager)
10. [Integration: BattlePass](#10-integration-battlepass)
11. [Integration: TradeManager](#11-integration-trademanager)
12. [Integration: MonetizationOrchestrator](#12-integration-monetizationorchestrator)
13. [Integration: EnglishRewardsManager](#13-integration-englishrewardsmanager)
14. [English Learning Auras — Gospel 444 Bridge](#14-english-learning-auras--gospel-444-bridge)
15. [Social Features & Desire Engine](#15-social-features--desire-engine)
16. [Performance Budget](#16-performance-budget)
17. [Anti-Exploit & Security](#17-anti-exploit--security)
18. [Implementation Plan](#18-implementation-plan)
19. [Cross-Reference Index](#19-cross-reference-index)

---

## 1. System Overview

The **Cosmetic Trinity** is the visual reward layer of the TRAIN-67 Roblox experience. It encompasses three cosmetic categories — **Pets**, **Auras**, and **Skins** — that serve as the primary aspirational reward for English learning mastery.

### Core Design Philosophy

```
English Mastery → Cosmetic Rewards → Social Status → More English → More Spending
```

- **Mouse → Tiger:** Players start with basic cosmetics and evolve to legendary status through English engagement
- **Permission over perfection:** Every cosmetic unlock is earned through English interaction, creating positive reinforcement
- **Desire drives monetization:** Visible cosmetics on other players create organic demand for premium purchases

### System Boundaries

| System | Role | Owns |
|--------|------|------|
| **CosmeticCatalog** | Master registry of all cosmetic items | Item definitions, rarity, metadata |
| **PetController** | Pet spawning, following, abilities | Pet instances, pet state, pet animations |
| **AuraController** | Aura rendering, stacking, effects | Aura VFX, aura buffs, English Learning Auras |
| **SkinController** | Character skin application, previews | Skin meshes, skin textures, outfit saving |
| **GachaManager** | Acquisition via crates | Drop rates, pity counters, pull logic |
| **BattlePass** | Acquisition via season progression | Tier rewards, XP tracking, premium track |
| **TradeManager** | P2P cosmetic exchange | Trade sessions, tax, anti-scam |
| **EnglishRewardsManager** | English→Cosmetic bridge | Streak rewards, milestone unlocks, English Auras |
| **MonetizationOrchestrator** | Purchase flow + desire signals | Robux transactions, bundle logic, FOMO triggers |

---

## 2. The Cosmetic Trinity — Three Pillars

### 2.1 Pets

Followable companions that orbit the player. Each pet has a rarity tier, visual effects scaled to rarity, and optional passive abilities.

| Property | Description |
|----------|-------------|
| **Display** | 3D model following player, bobbing animation, particle trail |
| **Equip Slots** | 1 active pet displayed (expandable to 3 with gamepass) |
| **Abilities** | Passive buffs: XP boost, coin magnet, luck boost (higher rarity = stronger) |
| **Evolution** | Pets can be fused (3 same-rarity → 1 next-rarity) via English challenges |
| **Source** | Gacha crates, BattlePass tiers, English milestone rewards, events |

**Pet Subtypes:**
- **Standard Pets** — Common through Legendary, available in gacha
- **English Buddy Pets** — Earned exclusively through English mastery (untradeable, show English level)
- **Event Pets** — Limited-time, create FOMO and trade value
- **Mythic Pets** — Rizzlord tier only, 0.01% gacha or season-end exclusive

### 2.2 Auras

Visual effects surrounding the player character. Auras are the most visible cosmetic in-game, making them the strongest social signal and desire driver.

| Property | Description |
|----------|-------------|
| **Display** | Particle system wrapping character, color-coded by rarity |
| **Equip Slots** | 1 primary aura (expandable with premium) |
| **Stacking** | English Learning Auras stack on top of cosmetic auras |
| **Categories** | Cosmetic Auras (visual only) + English Auras (earned by learning, show mastery level) |
| **Source** | Gacha, BattlePass, English streaks, special achievements |

**English Learning Auras (Gospel 444 Integration):**
- Visible indicator of English mastery level
- Cannot be purchased — earned only through genuine English engagement
- Creates aspirational pull: "How do I get THAT aura?" → "By learning English"
- Progressive tiers tied to English XP milestones (see §14)

### 2.3 Skins

Character appearance modifications including outfits, accessories, and special effects.

| Property | Description |
|----------|-------------|
| **Display** | Full character mesh/texture override or accessory attachment |
| **Equip Slots** | 1 outfit + up to 5 accessories |
| **Preview** | Full 3D preview before purchase/equip |
| **Outfit Saving** | Players save named outfit presets (3 free, 10 with premium) |
| **Source** | Gacha, BattlePass, shop rotation, English achievements, events |

**Skin Categories:**
- **Outfits** — Full body appearance change
- **Accessories** — Hat, back, face, shoulder slots
- **Emotes** — Animated expressions (social desire driver)
- **Titles** — Text above character (English mastery titles are highest status)

---

## 3. Rarity System — Unified 8-Tier Hierarchy

All cosmetics across all three pillars share one rarity system. Sourced from MonetizationServer.lua's canonical 8-tier definition:

| Tier | Name | Color | Drop Rate (Basic) | Drop Rate (Premium) | Trade Tax | Pity Threshold |
|------|------|-------|-------------------|---------------------|-----------|----------------|
| 1 | **Common** | White | 40% | 25% | 3% | — |
| 2 | **Uncommon** | Green | 30% | 25% | 3% | — |
| 3 | **Rare** | Blue | 15% | 20% | 3% | — |
| 4 | **Epic** | Purple | 8% | 15% | 3% | 50 pulls |
| 5 | **Legendary** | Gold | 4% | 10% | 5% | 100 pulls |
| 6 | **Mythic** | Red/Animated | 2% | 4% | 7% | 200 pulls |
| 7 | **Celestial** | Rainbow/Animated | 0.5% | 0.8% | 10% | 400 pulls |
| 8 | **Rizzlord** | Custom VFX | 0.01% | 0.05% | 15% | 1000 pulls |

### Rarity Rules

1. **Pity system is per-crate-type, per-player.** Counters do not reset across sessions (persisted in DataStore).
2. **Guaranteed floor:** After pity threshold pulls without that rarity or higher, next pull guarantees that rarity.
3. **Pity counter resets** when ANY item of that rarity or higher is obtained.
4. **Rate limiting:** Max 100 pulls per 5-minute window per player (from GachaManager).
5. **10x pull:** Guarantees at least 1 Rare or higher (from GachaManager).
6. **English bonus:** Active English streak adds +luck modifier to all gacha pulls (see §13).

### Visual Scaling by Rarity

| Rarity | Pet Effect | Aura Intensity | Skin Effect |
|--------|-----------|----------------|-------------|
| Common | None | Subtle shimmer | Standard |
| Uncommon | Small trail | Light glow | Minor accents |
| Rare | Medium trail + idle anim | Visible particles | Animated accents |
| Epic | Large trail + sound | Strong particles + color | Full animation |
| Legendary | Trail + aura + sound | Intense + screen effect | Mesh deform |
| Mythic | Full VFX suite | Environment-affecting | Unique mesh |
| Celestial | Unique model + VFX | Area-of-effect visual | Exclusive set |
| Rizzlord | Custom everything | Server-wide announcement | One-of-a-kind |

---

## 4. CosmeticCatalog Module

The **CosmeticCatalog** is the single source of truth for all cosmetic item definitions. Every system that creates, grants, displays, or trades cosmetics reads from this catalog.

### 4.1 Module API

```lua
-- CosmeticCatalog.lua (ModuleScript under ReplicatedStorage/Shared/Data)

local CosmeticCatalog = {}

-- Item schema
export type CosmeticItem = {
    id: string,              -- Unique ID: "PET_DRAGON_FIRE_001"
    category: "Pet" | "Aura" | "Skin",
    subcategory: string,     -- e.g., "Outfit", "Accessory", "Emote", "EnglishAura"
    name: string,            -- Display name
    description: string,     -- Flavor text
    rarity: number,          -- 1-8 (Common through Rizzlord)
    rarityName: string,      -- Human-readable rarity
    modelId: string?,        -- AssetId for 3D model (Pets, some Skins)
    textureId: string?,      -- AssetId for texture (Skins)
    particleConfig: table?,  -- Particle system config (Auras, high-rarity Pets)
    animationIds: {string}?, -- Animation tracks
    abilities: {Ability}?,   -- Passive abilities (Pets)
    stackable: boolean,      -- Can stack with other equipped items
    tradeable: boolean,      -- Can be traded P2P
    purchaseable: boolean,   -- Available in shop for Robux
    englishOnly: boolean,    -- Earned only through English (untradeable, unpurchaseable)
    eventTag: string?,       -- nil = permanent, "EVENT_HALLOWEEN_2026" = limited
    fusionRecipe: FusionRecipe?, -- nil = cannot be fused
    releaseDate: number,     -- Unix timestamp
    retireDate: number?,     -- nil = permanent
    tags: {string},          -- Search/filter tags
}

export type Ability = {
    type: "XP_BOOST" | "COIN_MAGNET" | "LUCK_BOOST" | "ENGLISH_XP_BOOST",
    magnitude: number,       -- Multiplier (1.05 = 5% boost)
    description: string,
}

export type FusionRecipe = {
    inputCount: number,      -- How many of same rarity needed (typically 3)
    outputRarity: number,    -- Resulting rarity tier
    englishChallengeRequired: boolean, -- Must complete English challenge to fuse
}

-- Registry
CosmeticCatalog.Items = {} :: {[string]: CosmeticItem}
CosmeticCatalog.ByCategory = {
    Pet = {} :: {[string]: CosmeticItem},
    Aura = {} :: {[string]: CosmeticItem},
    Skin = {} :: {[string]: CosmeticItem},
}
CosmeticCatalog.ByRarity = {} :: {[number]: {CosmeticItem}}

-- Lookup methods
function CosmeticCatalog.GetItem(itemId: string): CosmeticItem?
function CosmeticCatalog.GetByCategory(category: string): {CosmeticItem}
function CosmeticCatalog.GetByRarity(rarity: number): {CosmeticItem}
function CosmeticCatalog.GetTradeable(): {CosmeticItem}
function CosmeticCatalog.GetAvailableInGacha(crateType: string): {CosmeticItem}
function CosmeticCatalog.GetEnglishOnly(): {CosmeticItem}
function CosmeticCatalog.GetCurrentEvent(): {CosmeticItem}
function CosmeticCatalog.Search(query: string, filters: table?): {CosmeticItem}

return CosmeticCatalog
```

### 4.2 Item ID Convention

```
{CATEGORY}_{TYPE}_{VARIANT}_{SEQ}
Examples:
  PET_DRAGON_FIRE_001
  AURA_ENGLISH_STREAK30_001
  SKIN_OUTFIT_CYBERPUNK_003
  SKIN_EMOTE_VICTORY_001
  AURA_COSMETIC_GALAXY_002
```

### 4.3 Catalog Population

- Items defined in `CosmeticData.lua` (static data module)
- Event items loaded dynamically from DataStore on server start
- Admin dashboard can hot-add items without code deploy (via MessagingService)

---

## 5. PetController Architecture

### 5.1 Client-Side: PetDisplayController

```lua
-- PetDisplayController.lua (LocalScript under StarterPlayerScripts)
-- Handles: Pet model rendering, following logic, animations, VFX

local PetDisplayController = {}

function PetDisplayController:EquipPet(itemId: string)
    -- 1. Load model from CosmeticCatalog
    -- 2. Spawn model at follow offset
    -- 3. Start follow/bob animation loop
    -- 4. Apply rarity-scaled VFX (particles, trails)
    -- 5. Register abilities for HUD display
end

function PetDisplayController:UnequipPet()
function PetDisplayController:PreviewPet(itemId: string)  -- UI preview without equipping
function PetDisplayController:UpdateFollowPosition(dt: number)  -- Called in RenderStepped

-- Follow behavior
PetDisplayController.FOLLOW_OFFSET = Vector3.new(3, 2, -1)  -- Right shoulder, above
PetDisplayController.FOLLOW_SPEED = 12  -- Studs/sec, lerped
PetDisplayController.BOB_AMPLITUDE = 0.5
PetDisplayController.BOB_FREQUENCY = 1.5

return PetDisplayController
```

### 5.2 Server-Side: PetManager

```lua
-- PetManager.lua (ModuleScript under ServerScriptService/Modules)
-- Handles: Pet ownership, equip validation, ability application, fusion

local PetManager = {}

function PetManager:EquipPet(player: Player, itemId: string): boolean
    -- 1. Validate ownership via CosmeticInventory DataStore
    -- 2. Check equip slot availability
    -- 3. Apply passive abilities to player stats
    -- 4. Replicate equip state to all clients
    -- 5. Fire CosmeticEquipped event (for MonetizationOrchestrator desire tracking)
end

function PetManager:FusePets(player: Player, inputItemIds: {string}): string?
    -- 1. Validate all inputs same rarity, owned by player
    -- 2. Check fusion recipe exists in CosmeticCatalog
    -- 3. If englishChallengeRequired: trigger English challenge UI
    -- 4. On success: remove inputs, grant output, log to analytics
    -- 5. Return new item ID or nil on failure
end

function PetManager:GetEquippedPets(player: Player): {string}
function PetManager:GetOwnedPets(player: Player): {string}

return PetManager
```

### 5.3 Pet Abilities — Balance Table

| Ability | Common | Uncommon | Rare | Epic | Legendary | Mythic+ |
|---------|--------|----------|------|------|-----------|---------|
| XP Boost | +2% | +5% | +8% | +12% | +18% | +25% |
| Coin Magnet | 5 stud range | 8 | 12 | 18 | 25 | 40 |
| Luck Boost | +1% | +2% | +3% | +5% | +8% | +12% |
| English XP Boost | — | — | +5% | +10% | +15% | +25% |

---

## 6. AuraController Architecture

### 6.1 Client-Side: AuraDisplayController

```lua
-- AuraDisplayController.lua (LocalScript under StarterPlayerScripts)
-- Handles: Aura particle rendering, stacking, performance scaling

local AuraDisplayController = {}

-- Aura rendering config
AuraDisplayController.MAX_PARTICLES_PER_AURA = 200  -- Performance cap
AuraDisplayController.LOD_DISTANCES = {50, 100, 200}  -- Studs: full, medium, low detail
AuraDisplayController.MAX_VISIBLE_AURAS_OTHER_PLAYERS = 10  -- Performance limit

function AuraDisplayController:EquipAura(itemId: string, slot: "Primary" | "English")
    -- 1. Load particle config from CosmeticCatalog
    -- 2. Create ParticleEmitter attachments on character
    -- 3. Apply rarity color mapping
    -- 4. Start animation/rotation loop
    -- 5. Register for LOD scaling
end

function AuraDisplayController:StackAuras(cosmeticAuraId: string, englishAuraId: string?)
    -- English auras render as an outer ring, cosmetic aura as inner
    -- Both visible simultaneously — English mastery enhances appearance
end

function AuraDisplayController:ApplyLOD(distance: number)
    -- Reduce particle count based on distance from camera
    -- Beyond MAX distance: show simplified billboard sprite only
end

return AuraDisplayController
```

### 6.2 Aura Stacking System

The stacking system is key to the English→Cosmetic integration:

```
┌─────────────────────────┐
│    ENGLISH AURA (outer)  │ ← Earned through English mastery
│  ┌───────────────────┐  │    Cannot be purchased
│  │  COSMETIC AURA    │  │ ← Earned/purchased through gameplay
│  │  (inner)          │  │
│  │  ┌─────────┐     │  │
│  │  │ PLAYER  │     │  │
│  │  └─────────┘     │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

- A player with BOTH a high-tier English Aura AND a high-tier Cosmetic Aura has the most impressive visual in the game
- This creates aspirational pull for BOTH English engagement AND monetization
- English Auras are **unpurchaseable and untradeable** — the only flex that can't be bought

---

## 7. SkinController Architecture

### 7.1 Client-Side: SkinDisplayController

```lua
-- SkinDisplayController.lua (LocalScript under StarterPlayerScripts)

local SkinDisplayController = {}

-- Equip slots
export type OutfitLoadout = {
    outfit: string?,        -- Full body skin ID
    hat: string?,           -- Hat accessory ID
    back: string?,          -- Back accessory ID
    face: string?,          -- Face accessory ID
    shoulderL: string?,     -- Left shoulder ID
    shoulderR: string?,     -- Right shoulder ID
}

SkinDisplayController.MAX_SAVED_OUTFITS_FREE = 3
SkinDisplayController.MAX_SAVED_OUTFITS_PREMIUM = 10

function SkinDisplayController:ApplyOutfit(loadout: OutfitLoadout)
    -- 1. Clear current appearance
    -- 2. Apply outfit mesh/texture override
    -- 3. Attach each accessory to correct attachment point
    -- 4. Apply rarity VFX (animated textures, glow for Epic+)
    -- 5. Update HumanoidDescription for persistence
end

function SkinDisplayController:PreviewSkin(itemId: string)
    -- Render in dedicated ViewportFrame for UI preview
end

function SkinDisplayController:SaveOutfit(name: string, loadout: OutfitLoadout)
function SkinDisplayController:LoadOutfit(name: string): OutfitLoadout
function SkinDisplayController:GetSavedOutfits(): {[string]: OutfitLoadout}

return SkinDisplayController
```

### 7.2 Server-Side: SkinManager

```lua
-- SkinManager.lua (ModuleScript under ServerScriptService/Modules)

local SkinManager = {}

function SkinManager:ValidateAndEquip(player: Player, loadout: OutfitLoadout): boolean
    -- 1. Validate all items owned
    -- 2. Validate no slot conflicts
    -- 3. Apply appearance changes (server-authoritative)
    -- 4. Replicate to all clients
    -- 5. Fire CosmeticEquipped event
end

function SkinManager:SaveOutfitPreset(player: Player, name: string, loadout: OutfitLoadout)
function SkinManager:GetOwnedSkins(player: Player): {string}

return SkinManager
```

---

## 8. DataStore Schema

### 8.1 CosmeticInventory DataStore

Per-player cosmetic ownership and state. Integrates with DataStoreV2 (canonical DataStore wrapper in CODE/).

```lua
-- Key: "cosmetics_" .. tostring(player.UserId)
-- Scope: "CosmeticInventory"

export type CosmeticInventoryData = {
    -- Ownership registry
    owned: {[string]: OwnedCosmeticEntry},  -- itemId → entry
    
    -- Equip state
    equippedPet: string?,                    -- Currently equipped pet ID
    equippedAura: string?,                   -- Currently equipped cosmetic aura ID
    equippedEnglishAura: string?,            -- Currently equipped English aura ID (auto-managed)
    equippedSkin: OutfitLoadout,             -- Current skin loadout
    savedOutfits: {[string]: OutfitLoadout}, -- Named outfit presets
    
    -- Gacha state (per-crate pity counters)
    gachaPity: {[string]: GachaPityState},   -- crateType → pity state
    
    -- Fusion state
    fusionCooldown: number?,                 -- Unix timestamp of last fusion
    
    -- English aura progression (managed by EnglishRewardsManager)
    englishAuraTier: number,                 -- Current English aura tier (0-8)
    englishAuraXP: number,                   -- Progress toward next tier
    
    -- Analytics
    totalPulls: number,
    totalTrades: number,
    totalFusions: number,
    totalRobuxSpentOnCosmetics: number,
    firstCosmeticDate: number?,              -- Unix timestamp
}

export type OwnedCosmeticEntry = {
    itemId: string,
    obtainedAt: number,          -- Unix timestamp
    obtainedVia: "Gacha" | "BattlePass" | "Trade" | "English" | "Event" | "Shop" | "Fusion" | "Reward",
    instanceId: string,          -- Unique instance for trading (UUID)
    tradeable: boolean,          -- Overrides catalog if item becomes untradeable
    locked: boolean,             -- Player-locked (prevent accidental trade)
    fusionCount: number,         -- Times this item was a fusion output (provenance)
}

export type GachaPityState = {
    pullsSinceLastEpic: number,
    pullsSinceLastLegendary: number,
    pullsSinceLastMythic: number,
    pullsSinceLastCelestial: number,
    pullsSinceLastRizzlord: number,
    lastPullTime: number,        -- Rate limiting
    pullsInWindow: number,       -- Current 5-min window count
    windowStart: number,         -- Window start timestamp
}
```

### 8.2 DataStore Budget

Roblox DataStore limits: 4MB per key. Cosmetic inventory estimated sizes:

| Player Tier | Est. Owned Items | Est. Data Size | Headroom |
|-------------|-----------------|----------------|----------|
| Casual (F2P) | 20-50 | ~15KB | 99.6% |
| Regular | 100-300 | ~80KB | 98% |
| Whale | 500-1000 | ~250KB | 93.8% |
| Extreme collector | 2000+ | ~600KB | 85% |

**Mitigation for extreme cases:**
- Archive items not accessed in 90+ days to cold storage DataStore
- Compress repeated fields via lookup tables
- Split inventory into hot (equipped + recent) and cold (archived) stores

---

## 9. Integration: GachaManager

**Source:** `GachaManager.lua` (SHA `8ed648e3`)

### 9.1 Interface Contract

```lua
-- CosmeticTrinity ↔ GachaManager interface

-- GachaManager calls CosmeticCatalog to get available items per crate
GachaManager.GetCrateContents = function(crateType: string): {CosmeticItem}
    return CosmeticCatalog.GetAvailableInGacha(crateType)
end

-- On successful pull, GachaManager calls CosmeticInventory to grant item
GachaManager.OnPullSuccess = function(player: Player, item: CosmeticItem)
    CosmeticInventory:GrantItem(player, item.id, "Gacha")
    -- Fire analytics event
    AnalyticsManager:TrackEvent("gacha_pull", {
        player = player.UserId,
        item = item.id,
        rarity = item.rarity,
        crateType = crateType,
    })
    -- Fire desire signal to MonetizationOrchestrator
    MonetizationOrchestrator:OnCosmeticObtained(player, item)
end
```

### 9.2 Crate Types (from GachaManager.lua)

| Crate | Currency | Contents | Special Rules |
|-------|----------|----------|---------------|
| **BasicCrate** | In-game coins (1000) | Common-Epic, weighted toward Common | Free daily crate available |
| **PremiumCrate** | Robux (75) or Premium Tokens | All rarities, better rates | Guarantees Rare+ on first pull |
| **EventCrate** | Event currency | Event-exclusive items + standard pool | Time-limited, creates urgency |
| **EnglishCrate** | English XP tokens (from streaks) | English-themed cosmetics, some exclusive | Untradeable pulls possible |

### 9.3 English Luck Bonus

Active English streak modifies gacha rates (from EnglishRewardsManagerSpec §4.3):

| Streak Days | Luck Modifier | Effect |
|-------------|--------------|--------|
| 3-day | +1% rare+ chance | Slight improvement |
| 7-day | +3% rare+ chance | Noticeable |
| 14-day | +5% rare+ chance | Significant |
| 30-day | +8% rare+ chance | Major |
| 60-day | +12% rare+ chance | Elite |
| 100-day | +15% rare+ chance + guaranteed Epic floor | Whale-tier luck |

---

## 10. Integration: BattlePass

**Source:** `BattlePass.lua` (SHA `71a5c55f`)

### 10.1 Cosmetic Reward Tiers

Season 1 configuration (50 tiers). **English activities give the best XP** — this is the core learning incentive.

| Tier | Free Track | Premium Track |
|------|-----------|---------------|
| 1-9 | Coins, basic skins | Coins + Uncommon pet |
| **10** | Rare Aura | **Premium Exclusive: Epic Pet** |
| 11-19 | Mixed common/uncommon | Mixed + rare skins |
| **20** | Epic Skin | **Premium Exclusive: Epic Aura** |
| 21-29 | Gacha tickets, coins | Legendary gacha tickets |
| **30** | Legendary Aura | **Premium Exclusive: Legendary Skin Set** |
| 31-39 | Mixed rare cosmetics | Mixed + event currency |
| **40** | English Crate x5 | **Premium Exclusive: Mythic Pet** |
| 41-49 | Mixed epic cosmetics | Mixed + exclusive emotes |
| **50** | Exclusive Title | **Premium Exclusive: Celestial Aura** |

### 10.2 XP Sources (from BattlePass.lua)

| Activity | XP per Unit | Notes |
|----------|------------|-------|
| **English Quiz (correct)** | **50 XP** | **Highest per-action XP in the game** |
| **English Streak (daily)** | **100 XP** | **Compounds with streak multiplier** |
| **English Challenge (complete)** | **200 XP** | **Best batch XP source** |
| Combat (wave clear) | 25 XP | Standard gameplay |
| Daily login | 30 XP | Baseline |
| Boss kill | 75 XP | Weekly cap of 5 |
| Trade completed | 10 XP | Minor |

The XP table ensures that **English engagement is always the optimal BattlePass progression strategy**. A player who does English daily will hit tier 50 ~3 weeks faster than a combat-only player.

### 10.3 Interface Contract

```lua
-- BattlePass calls CosmeticInventory when player reaches a reward tier
BattlePass.OnTierReward = function(player: Player, tier: number, isPremium: boolean)
    local reward = BattlePass.GetTierReward(tier, isPremium)
    if reward.type == "Cosmetic" then
        CosmeticInventory:GrantItem(player, reward.itemId, "BattlePass")
        MonetizationOrchestrator:OnCosmeticObtained(player, CosmeticCatalog.GetItem(reward.itemId))
    end
end
```

---

## 11. Integration: TradeManager

**Source:** `TradeManager.lua` (SHA `11a04441`)

### 11.1 Trade Flow

```
Player A initiates trade → TradeManager validates both inventories →
Both players confirm → Atomic two-phase commit → Tax applied →
Items transferred → Analytics logged → Desire signals fired
```

### 11.2 Trade Rules (from TradeManager.lua)

| Rule | Value | Rationale |
|------|-------|-----------|
| **Tax rate** | 3% base (scales with rarity, see §3) | Coin sink, prevents inflation |
| **Cooldown** | 60 seconds between trades | Anti-bot |
| **Max items per trade** | 4 per side | UX clarity |
| **Untradeable items** | English-only cosmetics, locked items, event items (configurable) | Preserve earn-only value |
| **Level requirement** | Must be level 5+ to trade | Anti-scam for new players |
| **Scam protection** | 3-second confirmation delay, rarity mismatch warning | Anti-social-engineering |
| **Shadow trade verification** | Server validates both sides independently | Anti-exploit |

### 11.3 Interface Contract

```lua
-- TradeManager reads CosmeticCatalog for tradeable status
TradeManager.ValidateItem = function(itemId: string): boolean
    local item = CosmeticCatalog.GetItem(itemId)
    if not item then return false end
    if item.englishOnly then return false end
    if not item.tradeable then return false end
    return true
end

-- On trade complete, update both inventories atomically
TradeManager.OnTradeComplete = function(playerA, playerB, itemsA, itemsB, taxPaid)
    -- Atomic transfer via DataStoreV2
    CosmeticInventory:TransferItems(playerA, playerB, itemsA)
    CosmeticInventory:TransferItems(playerB, playerA, itemsB)
    -- Fire desire signals (seeing traded items creates demand)
    MonetizationOrchestrator:OnTradeObserved(playerA, itemsB)
    MonetizationOrchestrator:OnTradeObserved(playerB, itemsA)
end
```

### 11.4 Auction House (from MonetizationServer.lua)

Future feature — P2P marketplace with listings:

- List cosmetic for sale at set price (in-game coins or premium currency)
- 5% marketplace tax on all sales
- Price history tracking for value discovery
- Featured listings (premium placement for Robux)
- **English Discount:** Active English streak gives 1% tax reduction (max -3%)

---

## 12. Integration: MonetizationOrchestrator

**Source:** `MonetizationOrchestratorSpec.md` (SHA `6ed43ba3`) §10

### 12.1 Cosmetic Desire Signal System

The MonetizationOrchestrator tracks what players WANT but don't have, and uses this to drive monetization:

```lua
-- Desire signals fired by CosmeticTrinity systems
MonetizationOrchestrator.DesireSignals = {
    -- Player saw another player's cosmetic and inspected it
    COSMETIC_INSPECTED = "cosmetic_inspected",
    -- Player previewed a cosmetic in shop but didn't buy
    COSMETIC_PREVIEWED_NO_BUY = "cosmetic_previewed_no_buy",
    -- Player attempted gacha but didn't get desired item
    GACHA_MISS = "gacha_miss",
    -- Player was outbid or missed a trade
    TRADE_MISSED = "trade_missed",
    -- Player's friend got a new rare cosmetic
    FRIEND_OBTAINED_RARE = "friend_obtained_rare",
    -- Player viewed BattlePass premium reward they can't access
    BATTLEPASS_PREMIUM_VIEWED = "battlepass_premium_viewed",
}
```

### 12.2 FOMO Triggers

| Trigger | Source | Monetization Path |
|---------|--------|-------------------|
| "X players own this" counter | CosmeticCatalog stats | Shop purchase |
| "Limited time" badge on event items | Event system | Event crate purchase |
| "Your friend just got [Legendary Pet]!" | Social feed | Gacha crate purchase |
| Premium BattlePass preview | BattlePass UI | BattlePass upgrade |
| "Only 3 left at this price" | Auction house | Premium currency purchase |
| "English learners get +15% luck" | English integration | English engagement → longer session → more spending |

### 12.3 Bundle Packaging

The MonetizationOrchestrator dynamically creates personalized bundles based on desire signals:

```lua
-- Example: Player has been inspecting Dragon pets but only owns Common ones
-- System generates a targeted offer:
local bundle = {
    name = "Dragon Collector Starter",
    items = {
        CosmeticCatalog.GetItem("PET_DRAGON_FIRE_001"),  -- Rare
        CosmeticCatalog.GetItem("AURA_COSMETIC_FLAME_001"),  -- Matches theme
        "PremiumCrate_x3",  -- Chance at higher rarity dragon
    },
    price = 299,  -- Robux (30% discount vs individual)
    expiresIn = 86400,  -- 24 hours
    triggerSignal = "COSMETIC_INSPECTED:PET_DRAGON_*",
}
```

---

## 13. Integration: EnglishRewardsManager

**Source:** `EnglishRewardsManagerSpec.md` (SHA `f442ac19`)

### 13.1 English → Cosmetic Reward Bridge

The EnglishRewardsManager is the critical bridge that makes English learning DIRECTLY produce cosmetic rewards. This is the Gospel 444 principle in action: English is the mechanic, cosmetics are the visible reward.

```lua
-- EnglishRewardsManager → CosmeticTrinity interface

-- Streak milestone rewards
EnglishRewardsManager.StreakRewards = {
    [3]   = {type = "EnglishCrate", count = 1},
    [7]   = {type = "Cosmetic", itemId = "AURA_ENGLISH_STREAK7_001"},     -- Uncommon English Aura
    [14]  = {type = "Cosmetic", itemId = "PET_ENGLISH_BUDDY_RARE_001"},   -- Rare English Buddy
    [30]  = {type = "Cosmetic", itemId = "AURA_ENGLISH_STREAK30_001"},    -- Epic English Aura
    [60]  = {type = "Cosmetic", itemId = "SKIN_ENGLISH_MASTER_001"},      -- Legendary English Skin
    [100] = {type = "Cosmetic", itemId = "AURA_ENGLISH_STREAK100_001"},   -- Mythic English Aura
    [365] = {type = "Cosmetic", itemId = "PET_ENGLISH_PHOENIX_001"},      -- Celestial English Pet
}

-- English mastery level → English Aura tier mapping
EnglishRewardsManager.AuraTiers = {
    [1]  = {name = "Spark",      rarity = 1, xpRequired = 0},
    [2]  = {name = "Glow",       rarity = 2, xpRequired = 500},
    [3]  = {name = "Flame",      rarity = 3, xpRequired = 2000},
    [4]  = {name = "Blaze",      rarity = 4, xpRequired = 5000},
    [5]  = {name = "Inferno",    rarity = 5, xpRequired = 15000},
    [6]  = {name = "Supernova",  rarity = 6, xpRequired = 50000},
    [7]  = {name = "Cosmic",     rarity = 7, xpRequired = 150000},
    [8]  = {name = "Transcendent", rarity = 8, xpRequired = 500000},
}

-- On English activity, update cosmetic state
EnglishRewardsManager.OnEnglishXPGained = function(player, xpAmount, source)
    -- 1. Update englishAuraXP in CosmeticInventory
    -- 2. Check for tier-up → grant new English Aura
    -- 3. Check streak milestones → grant cosmetic rewards
    -- 4. Update luck modifier for gacha
    -- 5. Fire analytics
end
```

### 13.2 The English Advantage Matrix

Every cosmetic system gives English learners an edge:

| System | English Advantage | Non-English Equivalent |
|--------|-------------------|----------------------|
| **Gacha** | Luck bonus up to +15% | Base rates only |
| **BattlePass** | Fastest XP source | 3 weeks slower to tier 50 |
| **Trading** | Tax reduction up to -3% | Full tax rate |
| **Fusion** | English challenges unlock fusion | Cannot fuse |
| **English Auras** | Exclusive aura tier system | Cannot obtain |
| **English Pets** | Exclusive buddy pets | Cannot obtain |
| **English Skins** | Mastery-gated titles and outfits | Cannot obtain |
| **Shop** | English streak discount on bundles | Full price |

---

## 14. English Learning Auras — Gospel 444 Bridge

### 14.1 Design Philosophy

English Learning Auras are the **visible embodiment of Gospel 444** in the game world:

- **Mouse → Tiger:** Start with "Spark" (barely visible shimmer), evolve to "Transcendent" (server-wide visual impact)
- **Permission over perfection:** Every English interaction earns XP toward the next aura tier
- **Social proof:** Other players SEE your English mastery level, creating aspirational pull
- **Unpurchaseable status:** The ONLY cosmetic category that cannot be bought with money

### 14.2 Visual Progression

| Tier | Name | Visual | Social Impact |
|------|------|--------|---------------|
| 1 — Spark | English Spark | Faint white shimmer, barely visible | "They're learning" |
| 2 — Glow | English Glow | Soft warm glow around feet | "Consistent learner" |
| 3 — Flame | English Flame | Animated flame particles, visible at distance | "Dedicated" |
| 4 — Blaze | English Blaze | Full-body flame aura with sound | "Impressive commitment" |
| 5 — Inferno | English Inferno | Intense fire + ground cracks + screen heat | "English master" |
| 6 — Supernova | English Supernova | Expanding star effect + light source | "Elite tier" |
| 7 — Cosmic | English Cosmic | Galaxy particles + orbital rings | "How is this possible" |
| 8 — Transcendent | English Transcendent | Custom VFX, server announcement on equip | "Legendary status" |

### 14.3 XP Sources for English Aura Progression

| Activity | English Aura XP | Notes |
|----------|----------------|-------|
| Answer quiz correctly | 10 XP | Base, scales with difficulty |
| Complete daily English challenge | 50 XP | One per day |
| Maintain streak (daily) | 25 XP × streak_multiplier | Compounds! |
| Perfect score on lesson | 100 XP | Bonus for mastery |
| Help another player (English mentor) | 75 XP | Social teaching |
| Complete English-gated content | 150 XP | Exploration reward |
| Win English duel | 50 XP | PvP English |

### 14.4 Gospel 444 Integration Points

- **Lesson completion** → English Aura XP + possible English Crate reward
- **Vocabulary mastery** → Tracked for English Pet evolution
- **Grammar challenges** → Required for pet fusion (English challenge gate)
- **Conversation practice** → Highest XP multiplier for English Aura
- **Teaching others** → "Mentor" title unlock + XP bonus

---

## 15. Social Features & Desire Engine

### 15.1 Cosmetic Visibility System

Every cosmetic is designed to be SEEN by other players:

```lua
-- Visibility ranges for cosmetic effects
local VISIBILITY = {
    Pets = {
        model = 200,           -- Studs: pet model visible
        trail = 100,           -- Studs: particle trail visible
        nameplate = 150,       -- Studs: pet name visible
    },
    Auras = {
        full = 100,            -- Full particle effect
        reduced = 200,         -- Reduced particles
        billboard = 400,       -- Simple glow sprite
    },
    Skins = {
        full = 150,            -- Full texture/mesh detail
        simplified = 300,      -- Simplified LOD
    },
}
```

### 15.2 Social Features

| Feature | Description | Monetization Impact |
|---------|-------------|-------------------|
| **Inspect Player** | Tap any player to see full cosmetic loadout with rarity badges | Creates desire for items seen on others |
| **Cosmetic Feed** | "X just obtained [Legendary Dragon Pet]!" in chat | FOMO, social proof |
| **Showcase Room** | Personal room to display collection | Drives completionism |
| **Fashion Contests** | Weekly player-voted best outfit | Creates demand for variety |
| **Flex Emotes** | Show off equipped cosmetics with special animations | Drives emote purchases |
| **English Leaderboard** | Top English Aura holders displayed in hub | Aspirational for English engagement |

### 15.3 The Desire Loop

```
See cosmetic on other player
        ↓
Inspect → "Legendary Dragon Pet, obtained via PremiumCrate"
        ↓
Check own inventory → don't have it
        ↓
Desire signal fires → MonetizationOrchestrator records
        ↓
Targeted offer appears: "Dragon Bundle — 24h only!"
        ↓
Purchase OR engage with English (for luck bonus → gacha)
        ↓
Obtain cosmetic → equip → OTHER players see it → cycle repeats
```

---

## 16. Performance Budget

### 16.1 Client Frame Budget

Target: 60 FPS on mobile (lowest spec target)

| System | Frame Budget | Strategy |
|--------|-------------|----------|
| Pet rendering (own) | 1ms | Single model + simple trail |
| Pet rendering (others, max 10) | 3ms | LOD reduction beyond 50 studs |
| Aura particles (own) | 1.5ms | Max 200 particles |
| Aura particles (others, max 10) | 4ms | Aggressive LOD, billboard beyond 200 studs |
| Skin rendering | 0.5ms | Standard Roblox humanoid, no extra cost |
| **Total cosmetic budget** | **10ms** | **60% of total 16.6ms frame budget** |

### 16.2 Memory Budget

| Asset | Budget per Player | Max Loaded |
|-------|------------------|------------|
| Pet models | 2MB each | 15 (own + nearby) |
| Aura particle configs | 50KB each | 20 |
| Skin textures | 1MB each | 15 |
| **Total cosmetic memory** | — | **~50MB max** |

### 16.3 Network Budget

| Event | Frequency | Size | Strategy |
|-------|-----------|------|----------|
| Equip/unequip | Per action | ~100 bytes | RemoteEvent |
| Nearby player cosmetics | On proximity | ~500 bytes per player | Proximity-based replication |
| Gacha pull result | Per pull | ~200 bytes | RemoteFunction |
| Trade session | Per trade | ~2KB | Secure RemoteFunction |

### 16.4 Performance Scaling

```lua
-- Dynamic quality scaling based on FPS
local QualityLevels = {
    HIGH = {maxParticles = 200, maxVisibleAuras = 15, petLODDistance = 100},
    MEDIUM = {maxParticles = 100, maxVisibleAuras = 10, petLODDistance = 50},
    LOW = {maxParticles = 50, maxVisibleAuras = 5, petLODDistance = 25},
    POTATO = {maxParticles = 20, maxVisibleAuras = 3, petLODDistance = 15},
}
-- Auto-detect: if FPS < 30 for 5 seconds, drop one quality level
-- Manual override in settings
```

---

## 17. Anti-Exploit & Security

### 17.1 Server-Authoritative Model

ALL cosmetic state is server-authoritative:

| Action | Client Role | Server Role |
|--------|-------------|-------------|
| Equip cosmetic | Request + display | Validate ownership, apply, replicate |
| Gacha pull | Request + animate | Roll RNG, validate payment, grant |
| Trade | Propose + confirm | Validate both sides, atomic commit |
| Fusion | Request + animate | Validate inputs, apply recipe, grant |
| English Aura update | Display | Calculate XP, update tier |

### 17.2 Exploit Vectors & Mitigations

| Vector | Risk | Mitigation |
|--------|------|------------|
| Fake equip (display item not owned) | Visual only, low | Server validates on equip, kick on mismatch |
| Gacha manipulation | High (economy) | Server-side RNG, no client seeds |
| Trade duplication | Critical | Atomic two-phase commit, version checks |
| XP injection (English Aura) | Medium | Server validates all XP grants, rate limiting |
| Inventory overflow | Medium | Hard cap on owned items per category |
| API abuse (rapid equip/unequip) | Low | Rate limiting on all cosmetic actions |

### 17.3 Anti-Scam (from TradeManager.lua)

- **Rarity mismatch warning:** If trade is heavily imbalanced, both players see warning
- **Confirmation delay:** 3-second countdown after both accept, either can cancel
- **Item swap detection:** If either side changes items after initial proposal, trade resets
- **New player protection:** Players under level 5 cannot trade
- **Cooldown:** 60 seconds between completed trades
- **Report system:** Flag suspicious trades for review

---

## 18. Implementation Plan

### 18.1 Implementation Priority (from STAGE-15)

| Phase | Module | Dependencies | Est. Effort |
|-------|--------|-------------|-------------|
| **P1** | CosmeticCatalog | None | 2 days |
| **P1** | CosmeticInventory DataStore | DataStoreV2 | 2 days |
| **P1** | Basic PetController (equip/display) | CosmeticCatalog | 3 days |
| **P1** | Basic SkinController (equip/display) | CosmeticCatalog | 2 days |
| **P2** | AuraController (equip/display) | CosmeticCatalog | 3 days |
| **P2** | English Aura system | AuraController, EnglishRewardsManager | 3 days |
| **P2** | GachaManager cosmetic integration | CosmeticCatalog, GachaManager | 2 days |
| **P2** | BattlePass cosmetic rewards | CosmeticCatalog, BattlePass | 1 day |
| **P3** | TradeManager cosmetic integration | CosmeticCatalog, TradeManager | 2 days |
| **P3** | Pet abilities & fusion | PetController, English challenges | 3 days |
| **P3** | Aura stacking system | AuraController | 2 days |
| **P3** | Outfit saving system | SkinController | 1 day |
| **P4** | MonetizationOrchestrator desire signals | All controllers | 2 days |
| **P4** | Social features (inspect, feed, contests) | All controllers | 4 days |
| **P4** | Auction house | TradeManager, CosmeticCatalog | 5 days |
| **P4** | Dynamic bundle generation | MonetizationOrchestrator | 3 days |

**Total estimated: ~40 days of implementation**

### 18.2 Testing Requirements

| Test Category | Scope | Automation |
|---------------|-------|------------|
| Ownership validation | All equip paths | Unit tests |
| Gacha rate verification | 10K simulated pulls per rarity tier | Automated |
| Trade atomicity | Concurrent trade stress test | Integration test |
| Performance regression | FPS on target devices with max cosmetics | Manual + automated |
| DataStore migration | Schema version upgrades | Migration scripts |
| English Aura progression | XP calculation accuracy | Unit tests |
| Exploit resistance | Each vector in §17.2 | Penetration testing |

---

## 19. Cross-Reference Index

### 19.1 Related Specs

| Spec | Path | Relevance |
|------|------|-----------|
| MonetizationOrchestratorSpec | `CANON/TRAIN-67/DOCS/MonetizationOrchestratorSpec.md` | §10 cosmetic desire signals, bundle logic |
| EnglishRewardsManagerSpec | `CANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md` | §4 cosmetic reward bridge, streak rewards |
| STAGE-15 Cosmetic Trinity | `CANON/TRAIN-67/STAGES/STAGE-15-COSMETIC-TRINITY-SPEC.md` | Original design spec |

### 19.2 Related Code

| Module | Path | Integration Point |
|--------|------|-------------------|
| GachaManager.lua | `CANON/TRAIN-67/CODE/GachaManager.lua` | §9 — Crate pulls grant cosmetics |
| BattlePass.lua | `CANON/TRAIN-67/CODE/BattlePass.lua` | §10 — Tier rewards include cosmetics |
| TradeManager.lua | `CANON/TRAIN-67/CODE/TradeManager.lua` | §11 — P2P cosmetic trading |
| MonetizationServer.lua | `CANON/TRAIN-67/CODE/MonetizationServer.lua` | Rarity system, pity counters |
| DataStoreV2.lua | `CANON/TRAIN-67/CODE/DataStoreV2.lua` | Underlying data persistence |
| EconomyManager.lua | `CANON/TRAIN-67/CODE/EconomyManager.lua` | Currency for gacha/shop |

### 19.3 Canon Pages

| Page | Content |
|------|---------|
| Gospel 444 & Teaching Methods | English-first design philosophy |
| Core Principles & Physics | Mouse → Tiger, permission over perfection |
| Soul DNA — Canon | Master design principles |

---

## Appendix A: Item Count Estimates

| Category | Subcategory | Launch Count | Year 1 Target |
|----------|------------|--------------|----------------|
| Pets | Standard | 30 | 100 |
| Pets | English Buddy | 8 | 20 |
| Pets | Event | 0 (first event) | 30 |
| Auras | Cosmetic | 20 | 60 |
| Auras | English | 8 (tier system) | 8 (fixed tiers) |
| Skins — Outfits | All | 25 | 80 |
| Skins — Accessories | All | 40 | 150 |
| Skins — Emotes | All | 15 | 50 |
| Skins — Titles | All | 10 | 30 |
| **Total** | | **156** | **528** |

## Appendix B: Revenue Model Projections

| Source | Revenue Driver | Projected % of Cosmetic Revenue |
|--------|---------------|--------------------------------|
| Premium Crates (Gacha) | Desire for rare items | 40% |
| BattlePass (Premium) | Season progression | 25% |
| Direct Shop (Bundles) | Targeted offers | 20% |
| Auction House (Fees) | Marketplace tax | 10% |
| Gamepasses (Slots) | Extra pet/outfit slots | 5% |

---

*Generated by Pulse-Incarnation Engine v5 — Run 54*
*Cross-repo synthesis: 6 source files from Phoenix-Rising-Protocol-Ultimate*
*Artifact class: 🔨 BUILD | Platform Death Test: Pending SHIP phase*
