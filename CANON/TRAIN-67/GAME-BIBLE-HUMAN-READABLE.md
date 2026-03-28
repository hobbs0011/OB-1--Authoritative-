# 🎮 Survive a Brainrot — Complete Game Bible (Human-Readable)

**Everything we built, in plain language. No code. Just the game.**
*Last updated: March 28, 2026 — PRE-LAUNCH REVIEW*

---

## 🧠 What Is This Game?

**"Survive a Brainrot"** is a Roblox wave-based zombie survival game where players fight meme-themed zombie enemies with **real weapons** — melee, ranged, and throwables. Kill zombies, earn coins, buy better gear, survive 99 days.

A mix of **Dead Rails** + **Survive Wave Z**, built on the **Brainrot meme** that is currently meta. Designed for the **lowest compute cell phones** but still looks good. Built to **MONETIZE**.

**The pitch:** A zombie survival game that secretly is all about **MAKING MONEY**. Players are gaming, and get hooked by all the proven practices we have studied from other successful games.

Targeting Roblox's **126.5 million daily players** — 70% on mobile.

---

## 🚂 The Story: 99 Days on The Train

You and your squad of **5 players** board **The Train** — a moving fortress rolling through a post-apocalyptic wasteland overrun by "Brainrot" zombies.

Your mission: **Survive 99 days.**

The Train has three sections:
- **Engine Car** — up front, keeps you moving
- **Shield Car** — middle, your defense
- **Living Quarters** — back, your home base

Every day brings new waves of enemies. Every few days, you stop at locations like the **Rusted Depot** where you scavenge for supplies while fighting off hordes. Boss fights happen every 11 days.

**If you make it to Day 99 and kill the Final Boss, you complete the journey.** Then you can Rebirth (reset with multipliers) and do it all again — harder, with permanent bonuses.

---

## ⚔️ How Combat Works

Real combat. Tap to attack. Aim and shoot. Dodge roll. Parry bosses.

### The Core Loop
```
Wave Start → Zombies Spawn → Kill (tap/shoot) → Coins Drop → Wave End
→ Shop Phase (upgrade weapons, buy items, open crates) → Next Wave (harder)
→ Boss every 11 days → Day 99 = Final Boss → Rebirth (reset + multiplier)
```

### Input Model (Mobile-First)
- **Movement:** Virtual joystick (left thumb)
- **Camera:** Drag to look (right thumb) — third-person over-shoulder
- **Melee attack:** Tap attack button — tap-to-attack
- **Ranged attack:** Hold aim + tap shoot — aim-assisted for mobile
- **Dodge:** Tap dodge button — 0.5s i-frame roll, 3s cooldown
- **Ability:** Tap ability button — one special per weapon on cooldown
- **Max on-screen buttons:** 4 action (Attack, Dodge, Ability, Interact) + weapon swap

### Combo System
- **Melee:** Tap-tap-tap = 3-hit combo. Third hit = knockback. Simple.
- **Combo counter:** Consecutive kills without taking damage ("5x COMBO! 10x COMBO!")
- **Combo multiplier:** More combo = more coins = incentive to play aggressive

### Dodge & Parry
- **Dodge (all players):** Tap dodge = roll with 0.5s invincibility frames. 3s cooldown.
- **Parry (boss fights only):** Boss telegraphs heavy attack → tap dodge at exact moment = parry → 3s stun → damage window. Miss = knocked back.
- **No block.** Dodge is active and fun.

### Combat Feel (Mandatory Juice)
1. Screen shake on every hit
2. Hit flash on enemy (white/red for 1 frame)
3. Knockback on melee hits
4. Floating damage numbers
5. Hit sound effect per weapon type
6. Kill dissolve effect
7. Combo counter UI
8. Haptic vibration on mobile

**Rule: < 100ms from tap to visual feedback. Client-side prediction. Server validates.**

---

## ⚔️ Weapons

### Rarity Tiers

| Tier | Color | Drop Rate | Power |
|------|-------|-----------|-------|
| ⚪ Common | Gray | 45% | 1.0x |
| 🟢 Uncommon | Green | 30% | 1.3x |
| 🔵 Rare | Blue | 15% | 1.6x |
| 🟣 Epic | Purple | 7% | 2.0x |
| 🟠 Legendary | Orange | 2.5% | 2.5x |
| 🔴 RIZZLORD | Red + glow + aura | 0.5% | 3.0x + unique ability |

### Melee Weapons

| Weapon | Rarity | DMG | Speed | Ability | How to Get |
|--------|--------|-----|-------|---------|------------|
| Rusty Pipe | ⚪ Common | 10 | Fast | None | Starter |
| Wooden Bat | ⚪ Common | 12 | Fast | None | Day 1 shop |
| Machete | 🟢 Uncommon | 18 | Medium | Bleed (DoT) | Day 5+ shop |
| Fire Axe | 🟢 Uncommon | 22 | Slow | Cleave (hits 2) | Day 10+ shop |
| Katana | 🔵 Rare | 28 | Fast | Dash slash | Crate / Day 20+ |
| Chainsaw | 🟣 Epic | 35 | Medium | Shred (rapid hits) | Crate / Boss drop |
| Skibidi Blade | 🟠 Legendary | 45 | Fast | Toilet tornado (AoE spin) | Gacha only |
| **Sigma Fist** | 🔴 RIZZLORD | 55 | Very Fast | One-punch knockback + screen distort | 0.5% gacha / Day 99 boss |

### Ranged Weapons

| Weapon | Rarity | DMG | Fire Rate | Ability | How to Get |
|--------|--------|-----|-----------|---------|------------|
| Slingshot | ⚪ Common | 8 | Slow | None | Starter |
| 9mm Pistol | ⚪ Common | 12 | Medium | None | Day 3 shop |
| Shotgun | 🟢 Uncommon | 25 | Slow | Spread (close AoE) | Day 10+ shop |
| AR-15 | 🔵 Rare | 15 | Fast | Burst fire (3 shots) | Crate / Day 25+ |
| Sniper | 🟣 Epic | 60 | Very Slow | Headshot (2x crit) | Crate / Boss drop |
| Ohio Cannon | 🟠 Legendary | 50 | Slow | Explosion + knockback | Gacha only |
| **Rizz Ray** | 🔴 RIZZLORD | 40 | Medium | Charm beam — zombies fight each other 5s | 0.5% gacha / Day 99 boss |

### Throwables

| Item | Rarity | DMG | Effect | How to Get |
|------|--------|-----|--------|------------|
| Rock | ⚪ Common | 5 | Stagger | Free (ground pickup) |
| Molotov | 🟢 Uncommon | 15/sec | Fire zone (3s) | Shop / crate |
| Frag Grenade | 🔵 Rare | 40 | Explosion AoE | Shop / crate |
| Brainrot Bomb | 🟣 Epic | 30 | Confuse — zombies wander 5s | Crate only |

### Ability System
- Each weapon Rare+ has ONE unique ability on cooldown
- Cooldowns: 8s (Rare), 12s (Epic), 15s (Legendary), 20s (RIZZLORD)
- RIZZLORD abilities have dramatic screen-wide VFX — the ultimate flex

---

## 🌊 The 99-Day Difficulty Scaling

| Phase | Days | Zombies | Weapons Available | Monetization Trigger |
|-------|------|---------|-------------------|---------------------|
| 🟢 **Tutorial** | 1–5 | Slow walkers, 1-2 hit kills | Starter bat + pistol | None — hook the player |
| 🟢 **Early** | 6–15 | Faster, some runners | Tier 1 melee + ranged | First weapon crate Day 10 |
| 🟡 **Mid** | 16–30 | Armored, ranged spitters | Tier 2 + first special | 🔴 Difficulty spike Day 15 |
| 🟠 **Hard** | 31–50 | Brute zombies, mini-bosses | Tier 3 + throwables | 🔴 Difficulty spike Day 30 |
| 🔴 **Hell** | 51–75 | Mutant waves, night specials | Tier 4 + ability weapons | 🔴 Difficulty spike Day 50 |
| 🟣 **Endgame** | 76–99 | Max density, elite mutations | All tiers + RIZZLORD | 🔴 Day 75 + Day 99 Final Boss |

**Each wave:**
- Enemies scale with day number, max 8-12 on screen (performance budget)
- Boss appears every **11th day** (Day 11, 22, 33, 44, 55, 66, 77, 88, 99)
- Enemy health scales per wave
- Spawn rate increases each wave

---

## 🧟 The 5 Enemy Types

Every enemy is a meme-culture brainrot zombie. Each plays differently:

| Enemy | HP | Speed | Damage | What Makes It Special |
|-------|-----|-------|--------|----------------------|
| 🧟 **Skibidi Zombie** | 30 | Slow | 5 | The basic shuffler. Toilet head. Weak alone, deadly in hordes. |
| ⚡ **Ohio Anomaly** | 20 | Very Fast | 8 | Erratic zigzag movement. Fast but fragile. "Only in Ohio." |
| 💖 **Rizz Merchant** | 40 | Medium | 3 | **Healer.** Charms nearby enemies, healing them. Kill first to break the aura. |
| 🧬 **Brainrot Mutant** | 60 | Medium | 12 | **Splits into 2 mini-mutants on death.** Maximum brainrot. |
| 💀 **Sigma Boss** | 200+ | Slow | 20+ | **BOSS.** Telegraphed attacks, parry window, damage phase. Exclusive drops. |

**Spawn weights:** Skibidi Zombie (40%) → Ohio Anomaly (25%) → Rizz Merchant (15%) → Brainrot Mutant (10%) → Sigma Boss (boss waves only)

---

## 💀 Boss Fights (Day 11, 22, 33, 44, 55, 66, 77, 88, 99)

- **Telegraphed attacks:** Boss winds up (1.5s animation) → AoE slam/charge/projectile
- **Dodge or parry:** Player dodges the attack, or parries for stun window
- **Damage phase:** 3s window to deal max damage while boss is stunned
- **Enrage timer:** Boss gets stronger over time → can't just kite forever
- **Team scaling:** Boss HP scales with player count
- **Exclusive drops:** Boss weapons/cosmetics only from boss kills. Gacha spin after kill.
- **Day 99 Final Boss:** Multi-phase, requires all weapon types, ultimate RIZZLORD weapon drop

---

## 🏆 Named Bosses & Locations (The Codex)

The game has an in-game encyclopedia called **The Codex**:

### Enemies
- **Skibidi Shambler** — Common. HP 100, Speed 12, Damage 15. "A single Shambler is a joke. A horde of them is a funeral."
- **Sigma Walker** — Uncommon. HP 200, Speed 8, Damage 25. Appears from Day 2. Travels in pairs.
- **Baron Skibidi** — 👑 RIZZLORD TIER. HP 2,500, Speed 10, Damage 50. Rules the Rusted Depot. Three attacks. No mercy.

### Locations
- **The Train** — Your moving fortress. Engine + Shield Car + Living Quarters.
- **Rusted Depot** — Abandoned train station on Day 2. 3 fuel barrels. 5 minute timer. Zombies don't stop.

---

## 💎 The Rarity System (8 Tiers)

Everything in the game — weapons, pets, auras, skins, loot — follows this rarity scale:

| Tier | Rarity | Color | Basic Crate Drop % | Premium Crate Drop % | Pity Guarantee |
|------|--------|-------|--------------------|-----------------------|----------------|
| 1 | Common | White | 40% | 25% | — |
| 2 | Uncommon | Green | 30% | 25% | — |
| 3 | Rare | Purple | 15% | 20% | — |
| 4 | Epic | Purple | 8% | 15% | After 50 pulls |
| 5 | Legendary | Gold | 4% | 10% | After 100 pulls |
| 6 | Mythic | Red/Animated | 2% | 4% | After 200 pulls |
| 7 | Celestial | Rainbow | 0.5% | 0.8% | After 400 pulls |
| 8 | **RIZZLORD** | Custom VFX | 0.01% | 0.05% | After 1,000 pulls |

---

## 🐾 The Cosmetic Trinity: Pets, Auras & Skins

Three cosmetic categories. All visible to other players. Desire drives spending.

### Pets (Follow You Around)

| Pet | Rarity | How to Get | Abilities |
|-----|--------|-----------|-----------| 
| 🐭 Basic Mouse | Common | Gacha / Free | +2% XP boost |
| 🐻 Starter Cub | Uncommon | Gacha | +5% XP, 8-stud coin magnet |
| 🐉 Fire Dragon | Rare | Gacha | +8% XP, 12-stud coin magnet |
| 🦅 Golden Phoenix | Legendary | Gacha (rare!) | +18% XP, 25-stud coin magnet, +8% luck |
| 🔥 Brainrot Phoenix | Celestial | Day 99 Final Boss drop (0.5%) | +25% XP, +12% luck |

**Pet Fusion:** 3 same-rarity pets → 1 next-rarity pet. 60-second cooldown.

### Auras (Visual Effects Around Your Character)

Two aura slots that **stack**:
- **Cosmetic Aura** (inner ring) — bought or earned from gacha
- **Combat Aura** (outer ring) — **CANNOT BE PURCHASED. Earned only through combat milestones.**

**Combat Aura Tiers (the ultimate flex money can't buy):**

| Tier | Name | Requirement | What It Looks Like |
|------|------|-------------|-------------------|
| 1 | ✨ Spark | 0 | Faint glow — everyone starts here |
| 2 | 💡 Glow | Survive Day 10 | Soft light aura |
| 3 | 🔥 Flame | Survive Day 25 | Flickering flame effect |
| 4 | 🌟 Blaze | Survive Day 50 | Intense blazing aura |
| 5 | 🔥 Inferno | Survive Day 75 | Full fire ring |
| 6 | 💥 Supernova | Kill Day 99 Final Boss | Explosive energy field |
| 7 | 🌌 Cosmic | Prestige 10 | Galaxy swirl — **server-wide announcement** |
| 8 | 🕊️ Transcendent | Prestige 50 | Ascended being effect — **server-wide announcement** |

**Cosmetic Auras:** Flame Aura (Rare), Galaxy Aura (Legendary), Void Aura (Mythic)

### Skins (Character Outfits)

6 equip slots: Outfit, Hat, Back, Face, Left Shoulder, Right Shoulder

**Built-in skins:** Cyberpunk Outfit (Rare), Tiger Outfit (Legendary), Victory Emote (Uncommon), Brainrot Commander Set (Legendary, Battle Pass exclusive)

---

## 💰 The Economy: Two Currencies

| Currency | Color | How You Earn It | What You Spend It On |
|----------|-------|----------------|---------------------|
| 🪙 **Survival Coins** (soft) | Gold | Killing enemies, clearing waves, combo bonuses, challenges | Weapons, gacha crates, crafting, trade fees, prestige |
| 💎 **Brainrot Gems** (hard) | Purple | Bosses, achievements, daily login, rare drops — OR Robux | Premium gacha, exclusive cosmetics, battle pass |

**Earn rates per action:**
- Kill regular zombie: 10 coins
- Kill elite: 50 coins + 1 gem
- Kill boss: 200 coins + 5 gems
- 10-kill combo streak: 100 coins + 1 gem
- Daily challenge: 200 coins + 3 gems
- Achievement: 500 coins + 10 gems

**Starting balance:** 100 coins + 10 gems
**Daily free gem cap:** 25 gems/day (purchases bypass this)
**Economy sinks (prevent inflation):** 3% trade tax, weapon repair costs, crafting fees, escalating prestige costs

---

## 🛒 Monetization: Game Passes & Products

### Game Passes (One-Time Purchase, Permanent)

| Pass | Price | What You Get |
|------|-------|-------------|
| 🪙 2x Coins | 99 R$ | Double ALL coin earnings forever |
| ⚡ 2x XP | 149 R$ | Level up 2x faster forever |
| 🧲 Auto-Collect | 199 R$ | Auto-pickup drops in 30-stud radius |
| 👑 VIP Access | 499 R$ | VIP badge + zone + 5 daily gems + [VIP] tag |
| 🏆 Ultimate Survivor | 1,499 R$ | ALL passes + Brainrot Immune aura + 10 daily gems + [ULTIMATE] gold tag + priority join |

### Developer Products (Repeatable Purchases)

**Currency Packs:** 500 Coins (49 R$), 2,500 Coins (199 R$), 10,000 Coins (699 R$), 25 Gems (99 R$), 100 Gems (349 R$), 500 Gems (1,499 R$)

**Consumables:** Instant Revive (25 R$), 5x Revive (99 R$), 2x Coins 30min (49 R$), 2x XP 30min (49 R$), Shield 5min (29 R$), MEGA Boost 60min (149 R$)

**Gacha:** 1x Survival Crate (75 R$), 10x (649 R$), 1x Brainrot Crate (149 R$), 10x (1,299 R$)

**First purchase bonus:** 2x gems on your first ever purchase.

---

## 🎰 Gacha System (Crates)

**Survival Crate** (500 Coins): Common to Legendary drops, pity at 50 pulls
**Brainrot Crate** (50 Gems): Uncommon to Mythic drops, pity at 30 pulls

All drop rates visible (Roblox policy compliant).

---

## 🎖️ Battle Pass: Season 1 — Brainrot Origins

- **Price:** 299 R$ for Premium
- **Duration:** 30 days
- **50 tiers** with Free + Premium tracks

**How you earn Battle Pass XP:**
- Kill enemy: 10 XP
- Survive 1 minute: 20 XP
- 5-kill combo: 50 XP
- 10-kill combo: 150 XP
- Boss kill: 100 XP
- Daily challenge: 200 XP
- Daily login: 50 XP
- Referral: 500 XP

**Key Premium Rewards:** Recruit Outfit (T10), Origins Flame Aura (T20), Brainrot Commander Skin (T30), Sigma Phoenix Pet (T40), Brainrot Origins Legendary Aura (T50)

---

## 🔄 Prestige System (The 99-Day Completion Cycle)

Voluntary reset for permanent bonuses. 50 max levels.

| Prestige Level | Coin Bonus | XP Bonus | Luck | Damage | Cosmetic |
|----------------|-----------|----------|------|--------|----------|
| 1 | +5% | +3% | +2% | +1% | ★ Nameplate |
| 5 | +25% | +15% | +10% | +5% | Bronze Aura |
| 10 | +50% | +30% | +20% | +10% | Silver Aura |
| 20 | +100% | +60% | +40% | +20% | Gold Aura |
| 30 | +150% | +90% | +60% | +30% | Diamond Aura |
| 50 (MAX) | +250% | +150% | +100% | +50% | **Prestige God** |

---

## 🐲 Weekly World Boss: Mega Brainrot Sigma

- **When:** Saturday 9 PM ICT
- **HP:** 500,000
- **Duration:** 30 minutes
- **3 Phases** with increasing attack complexity + enrage
- **Telegraphed attacks:** dodge/parry windows, damage phases
- **Loot:** Sigma Essence, exclusive cosmetics, Sigma God Transformation (Mythic 0.5%)
- **MVP gets:** Sigma Slayer Title + guaranteed Epic+ drop

---

## 👥 Guild System

- 10 levels, max 30 members
- Guild quests: cooperative combat challenges
  - Guild Hunt: 100 kills together → 500 guild XP + 200 coins each
  - Guild Slayers: Kill 5 bosses together → 1,500 guild XP + 400 coins + 10 gems each
  - Guild Legends: Survive to Day 50+ together → 5,000 guild XP + 1,000 coins + 25 gems each
- Level 10 perk: Legendary Guild Pet + 25% coin bonus for all members

---

## 🔀 Fusion System

Combine duplicate items to get higher-rarity ones:
- 5 Common → 1 Rare (500 coins)
- 3 Rare → 1 Epic (2,000 coins)
- 3 Epic → 1 Legendary (10,000 coins)
- 3 Legendary → 1 Mythic (50,000 coins)

This is the **item sink** that prevents the economy from flooding with duplicates.

---

## 🏗️ Technical Architecture (The Non-Coder Summary)

**41 Lua modules** power the game. Server-authoritative, anti-cheat hardened, mobile-optimized for 70% mobile playerbase.

| System | What It Does |
|--------|-------------|
| CombatSystem | Real melee + ranged + dodge + parry combat |
| WeaponData | All weapon stats, rarities, abilities |
| EnemyData | Zombie types, scaling per day |
| CombatRewardsManager | Kill rewards, combo multipliers, boss loot |
| DayScaling | 99-day difficulty curve |
| EnemyFactory | Creates and manages all enemy types |
| WaveManager | Wave progression, boss timing, difficulty scaling |
| EconomyManager | Two-currency system with inflation prevention |
| CosmeticController | Pets, Auras, Skins system |
| GachaManager | Crate system with visible drop rates and pity |
| BattlePass | 50-tier seasonal pass with free + premium tracks |
| GamePassConfig | 5 tiered permanent game passes |
| DevProductsConfig | All repeatable Robux purchases |
| MonetizationOrchestrator | Smart offer timing |
| WorldBoss | Weekly boss with telegraphed attacks + parry |
| GuildManager | Social system with guild quests and level perks |
| PrestigeManager | Rebirth system for infinite progression |
| EloManager | Competitive ranking system |
| TradeManager | Player-to-player item trading with tax |
| DailyRewards | 7-day login reward cycle |
| ReferralSystem | Invite friends → earn rewards |
| ChallengeManager | Daily and weekly combat challenges |
| LeaderboardManager | Global and guild leaderboards |
| FTUEController + FTUEManager | First-time user experience (tutorial) |
| SecurityLayer | Anti-cheat and exploit protection |
| AnomalyDetector | Catches suspicious transactions |
| AnalyticsService | Tracks every player action |
| DataStoreV2 | Saves all player data reliably |
| ServerGateway + ClientBridge | Secure server-client communication (only 2 RemoteEvents) |
| MobileInputController | Touch controls — tap-to-attack, virtual joystick, aim-assist |
| CodexData + CodexClient | In-game encyclopedia |
| HUDController | Health, combos, wave info, weapon display |

**Server architecture:** Only **2 RemoteEvents** (Event Bus + Gateway pattern). Everything server-authoritative.

**Performance budget:** 8-12 zombies max, shadows OFF on mobile, < 500 parts, StreamingEnabled ON, raycast hitboxes, < 100ms tap-to-feedback.

---

## 📊 The Bottom Line

**What we built:** A complete Roblox survival game with 41 interconnected systems — real tap-to-attack melee + aim-assist ranged combat, 19 weapons across 6 rarity tiers, dodge roll with i-frames, boss parry mechanics, 5 enemy types, 99-day difficulty scaling, 8 rarity levels, 3 cosmetic categories, 2 currencies, 5 game passes, 16+ developer products, a battle pass, gacha system, guild system, world boss, prestige system, competitive ranking, trading, daily rewards, referrals, challenges, leaderboards, analytics, and anti-cheat — all proven monetization and retention mechanics from the top Roblox games.

**107+ design documents and code files** across the `CANON/TRAIN-67/` directory.

**Launch status: 🔴 NOW.**
