# STAGE 15 — Cosmetic Trinity: Pets + Auras + Skins

**Train 6-7: Survival English**  
**Pipeline Stage:** 15 of 20  
**Type:** Design Specification  
**Status:** COMPLETE  
**Gospel 444 Palette:** Purple #a855f7 | Gold #f59e0b | Dark #0f0f1a | Blue = FORBIDDEN

---

## 1. Overview

The Cosmetic Trinity is the visual identity layer of Train 6-7. Three cosmetic categories — **Companion Brainrots (Pets)**, **Auras**, and **Class Skins** — form the primary aspiration and trading ecosystem.

All cosmetics are:
- **Non-functional** (no stat boosts, cosmetic only)
- **Tradeable** (via TradeManager with 3% tax sink)
- **Obtainable via gacha** (GachaManager integration)
- **Visible to other players** (social proof = spending driver)

---

## 2. Companion Brainrots (Pets)

### 2.1 Concept
Small brainrot creatures that follow the player. Each has unique idle animations and visual effects. Players can equip 1 active pet + display 2 in their profile showcase.

### 2.2 Rarity Tiers

| Tier | Drop Rate | Examples | Visual FX |
|------|-----------|----------|-----------|
| Common | 40% | Skibidi Rat, Ohio Cat | None |
| Uncommon | 25% | Sigma Frog, Rizz Penguin | Subtle particle trail |
| Rare | 15% | Gyatt Dragon, Fanum Tax Bird | Glow effect |
| Epic | 10% | Brainrot Phoenix, Sigma Wolf | Flame/ice particles |
| Legendary | 5% | Golden Skibidi God, Crystal Sigma | Full body glow + unique trail |
| Mythic | 1% | ??? (event-exclusive) | Screen-wide aura effect |

### 2.3 Pet Abilities (Passive, Cosmetic-Adjacent)
- **Coin Magnet** — attracts nearby coins (QoL, not stat boost)
- **Emote Partner** — pet mimics player emotes
- **Trail Effect** — unique particle trail behind player
- **Sound Effect** — unique ambient sound when equipped

### 2.4 Pet Fusion
Integrates with PrestigeManager (Stage 20):
- 3 Rare → 1 Epic (random from pool)
- 3 Epic → 1 Legendary (random from pool)
- Fusion consumes the input pets (item sink)

---

## 3. Auras

### 3.1 Concept
Full-body visual effects that surround the player. Auras are the **highest social-proof item** — visible from across the map, immediately communicates status.

Auras are trending hard in Roblox 2025-26 (see: Aura Craft, Sol's RNG).

### 3.2 Rarity Tiers

| Tier | Drop Rate | Examples | Visual |
|------|-----------|----------|--------|
| Common | 35% | Mist, Ember Glow | Subtle haze |
| Uncommon | 25% | Electric Spark, Frost Ring | Animated particles |
| Rare | 18% | Sigma Flame, Dark Matter | Strong particle system |
| Epic | 12% | Galaxy Swirl, Blood Moon | Multi-layer particles |
| Legendary | 7% | Golden Sigma, Void King | Full-screen effect for nearby players |
| Mythic | 2% | ???, Event-exclusive | Custom animation + sound |
| SECRET | 0.1% | ??? (hidden from drop tables) | Unique one-of-a-kind |

### 3.3 Aura Stacking
- Players can equip **1 primary aura** + **1 accent aura**
- Primary = main visual effect
- Accent = secondary particle overlay
- Combo creates unique visual combinations (emergent flex)

### 3.4 English Learning Auras (Gospel 444 Integration)
Special aura tier earned ONLY through English mastery:
- **Word Warrior Aura** — answer 100 questions correctly
- **Vocabulary Master Aura** — learn 500 words
- **Language God Aura** — complete all word packs

These cannot be traded or bought. Pure skill flex. Mouse → Tiger.

---

## 4. Class Skins

### 4.1 Concept
Alternate character appearances. Not full avatar changes (Roblox TOS), but outfit overlays, weapon skins, and effect changes.

### 4.2 Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Outfit Overlays | Layered clothing effects | Sigma Suit, Brainrot Armor, Ohio Drip |
| Weapon Skins | Visual weapon modifications | Gold AK, Crystal Sword, Flame Bat |
| Kill Effects | What happens when you eliminate enemies | Explosion, Disintegrate, Meme Flash |
| Spawn Effects | Entrance animation | Lightning Strike, Portal, Sigma Walk |

### 4.3 Rarity Distribution
Same 6-tier system as pets (Common through Mythic).

### 4.4 Bundle System
Complete sets provide a **visual set bonus** (extra particle effect when all 4 pieces equipped):
- Outfit + Weapon + Kill + Spawn = Set Bonus active
- Encourages collecting full sets = more gacha pulls

---

## 5. Economy Integration

### 5.1 Obtaining Cosmetics

| Method | Items Available | Notes |
|--------|----------------|-------|
| Gacha Crates (GachaManager) | All tiers | Primary source |
| Trading (TradeManager) | All except English auras | 3% tax sink |
| Battle Pass (Stage 16) | Exclusive skins/auras per season | FOMO driver |
| Limited Events (Stage 18) | Event-exclusive mythics | Strongest FOMO |
| English Challenges | English auras only | Gospel 444 |
| Referral Milestones | Referral-exclusive auras | Viral loop |
| Daily Challenges | Common-Rare only | Retention |

### 5.2 Item Sinks (Inflation Prevention)
- **Pet Fusion** — 3 pets consumed per fusion
- **Trading Tax** — 3% per trade
- **Skin Upgrade** — spend coins to upgrade skin rarity (consumes coins)
- **Prestige Reset** — optional cosmetic sacrifice for prestige multiplier

### 5.3 Pricing Psychology
- Common cosmetics flood the market → low perceived value → easy trades
- Mythic/Secret cosmetics are ultra-rare → high trade value → whales pay premium
- English auras are UNTRADEABLE → pure flex → motivates learning

---

## 6. Technical Implementation

### 6.1 Data Structure
```lua
PlayerCosmetics = {
    pets = {
        owned = { [petId] = count },
        equipped = { active = petId, showcase = { petId, petId } },
    },
    auras = {
        owned = { [auraId] = true },
        equipped = { primary = auraId, accent = auraId },
    },
    skins = {
        owned = { [skinId] = true },
        equipped = {
            outfit = skinId,
            weapon = skinId,
            killEffect = skinId,
            spawnEffect = skinId,
        },
    },
}
```

### 6.2 Performance Budget
- Max particle emitters per player: 3 (pet + primary aura + accent aura)
- LOD system: reduce particle density for distant players
- Mobile optimization: simplified particles on low-end devices
- Total cosmetic render budget: < 2ms per frame

### 6.3 Catalog System
- Server maintains master catalog of all cosmetics
- Client receives only owned + equipped data
- Catalog includes: id, name, rarity, category, meshId, textureId, particleConfig
- Preview system: try-before-you-buy in gacha UI

---

## 7. Social Features

- **Profile Showcase** — display 3 favorite cosmetics on profile card
- **Inspect Player** — tap any player to see their equipped cosmetics
- **Trading Post** — dedicated UI for browsing trade offers
- **Flex Chat** — auto-announce when someone gets Legendary+ from gacha
- **Cosmetic Leaderboard** — ranked by total rarity score

---

## 8. Revenue Projections

Based on market research (Q1-Q20):
- **Gacha** generates 40-60% of revenue in top Roblox games
- **Auras** are the fastest-growing cosmetic category (2025-26 trend)
- **Pet collecting** has proven $100M+ potential (Adopt Me case study)
- **Trading** creates self-sustaining economy that retains players

The Cosmetic Trinity is the **primary monetization engine** after game passes.

---

## 9. Implementation Priority

1. ✅ GachaManager.lua (Stage 9) — drop system ready
2. ✅ TradeManager.lua (Stage 10) — trading ready
3. 🔜 CosmeticCatalog.lua — master catalog + equip system
4. 🔜 PetController.lua — client-side pet rendering
5. 🔜 AuraController.lua — client-side aura rendering
6. 🔜 SkinController.lua — outfit/weapon/effect rendering
7. 🔜 Integration with BattlePass (Stage 16) + Events (Stage 18)
