# 🎮 Survive a Brainrot — Complete Game Bible (Human-Readable)

**The complete, definitive document of everything we are about to put live on Roblox.**
**No code. No jargon. Just every single thing a player will experience, every dollar we will make, and every system running under the hood.**
*Last updated: March 28, 2026 — FINAL PRE-LAUNCH REVIEW*
*Source: 41 Lua modules + 32 spec documents across CANON/TRAIN-67/*

---

# PART 1: THE GAME

---

## 🧠 What Is "Survive a Brainrot"?

A **Roblox wave-based zombie survival game** where you and up to 4 friends board a moving train and fight meme-themed zombie hordes for 99 days. Kill zombies with real weapons — swing a bat, fire a shotgun, throw a molotov. Earn coins. Buy better gear. Open crates. Flex rare cosmetics. Survive the final boss. Prestige and do it all again, harder.

**The formula:**
- Take **Dead Rails** (the train survival loop)
- Mix in **Survive 99 Days in a Forest** (the wave-based day counter)
- Skin it in **Brainrot meme culture** (Skibidi, Ohio, Sigma, Rizz — the stuff kids are obsessed with right now)
- Optimize for the **cheapest cell phones on the planet** (70% of Roblox players are on mobile)
- Wire it with **every proven monetization mechanic** from the top-grossing Roblox games

**The pitch in one sentence:** A zombie survival game that is secretly a money-printing machine, disguised as something kids can't stop playing.

**Target market:** Roblox's **126.5 million daily active users**. 70% mobile. Average age 9-15. We don't need 1% of them. We need 0.001% spending money.

---

## 🚂 The Setting: 99 Days on The Train

### The Story

You wake up on **The Train** — a rusted, reinforced locomotive barreling through a post-apocalyptic wasteland. The world outside is overrun with "Brainrot" zombies — grotesque meme-creatures that came from nowhere and consumed everything.

Your squad of **up to 5 players** has one job: **survive 99 days** on The Train.

### The Train (Your Home Base)

The Train has three connected cars that players can move between freely:

| Car | Location | What's Inside | Why It Matters |
|-----|----------|---------------|----------------|
| 🚂 **Engine Car** | Front | Controls, fuel gauge, speed lever | Keeps the train moving. If fuel runs out during a depot stop, you're stuck fighting until you refuel. |
| 🛡️ **Shield Car** | Middle | Defensive turrets, barricade slots | Your first line of defense. Zombies breach here first during night waves. |
| 🏠 **Living Quarters** | Back | Shop terminal, crafting bench, crate opener, stash | Where you spend coins, open crates, manage inventory between waves. |

### The Journey

The Train rolls through different biomes as the days progress:

| Days | Biome | Visual Style | Special Mechanic |
|------|-------|-------------|------------------|
| 1–15 | Wasteland Plains | Flat, dry, open sightlines | Tutorial zone. Easy to see enemies coming. |
| 16–30 | Rusted City | Collapsed buildings, tight corridors | Ambush zones. Enemies hide behind cover. |
| 31–50 | Toxic Swamp | Green fog, limited visibility | Poison zones that damage players who stand still. |
| 51–75 | Volcanic Rift | Lava flows, dark skies, fire | Environmental hazards + stronger enemy variants. |
| 76–99 | The Void | Neon, glitch effects, reality breaking | Max difficulty. Elite mutations. Reality-warping boss mechanics. |

### Depot Stops (Scavenge Missions)

Every few days, The Train stops at a **Depot** — an abandoned location where players must disembark, find fuel/supplies, and fight back to the train before time runs out.

- **Rusted Depot** (Day 2) — Abandoned train station. 3 fuel barrels. 5-minute timer. Your first real test.
- Depot stops get progressively harder and more complex as days increase.
- **Fail to reboard** = left behind = dead. Respawn costs coins (or Robux).

---

## ⚔️ How Combat Works — The Complete Breakdown

This is the core of the game. Everything else exists to support this loop.

### The Core Gameplay Loop (Every Single Session)

```
→ Wave Starts
→ Zombies spawn around The Train (or at Depot)
→ Players fight with melee, ranged, throwables
→ Kill enemies → Coins + XP drop
→ Combo kills → Bonus multiplier
→ Wave clears
→ Shop Phase (buy weapons, open crates, upgrade)
→ Next wave (harder: more enemies, tougher types)
→ Every 11th day: BOSS FIGHT
→ Day 99: FINAL BOSS
→ Beat it? → PRESTIGE (reset with permanent bonuses)
→ Start over at Day 1, but stronger
```

**Average session length target:** 15-30 minutes (3-8 waves per session, with progress saved between sessions).

### Controls (Mobile-First, Desktop-Compatible)

Every control decision was made for **one-thumb mobile play on a $50 phone.**

**Mobile Layout:**

| Input | Control | Where on Screen | Details |
|-------|---------|----------------|---------|
| Movement | Virtual joystick | Bottom-left | Left thumb. Fixed position, 80px radius. |
| Camera | Touch drag | Right side of screen | Right thumb. Third-person over-the-shoulder. |
| Melee Attack | Tap button | Bottom-right cluster | Instant swing. Client predicts, server validates. |
| Ranged Attack | Hold aim + tap fire | Bottom-right cluster | Aim-assist snaps to nearest enemy within 15°. |
| Dodge Roll | Tap button | Bottom-right cluster | 0.5s invincibility frames. 3s cooldown. Direction = joystick direction. |
| Ability | Tap button | Bottom-right cluster | Weapon-specific special ability. Cooldown varies by rarity. |
| Weapon Swap | Tap weapon icon | Top-right | Switch between equipped melee and ranged. |
| Interact | Proximity prompt | Center screen | Auto-appears near shops, chests, fuel barrels. |

**Max on-screen buttons at once:** 4 action buttons + 1 weapon swap = 5 total. That's it. Clean, uncluttered, playable on tiny screens.

**Desktop:** WASD movement, mouse aim, left-click attack, right-click aim, space dodge, E interact, Q ability, number keys swap weapons.

### The Combat System — Blow by Blow

**Melee Combat:**
- **Tap attack:** Each tap = one swing. Fast weapons swing in 0.3s. Slow weapons in 0.6s.
- **3-hit combo:** Tap-tap-tap = light → medium → heavy. The third hit always knockbacks.
- **Hitbox:** Server-authoritative raycast in a cone in front of the player. No phantom hits.
- **Damage:** Base weapon damage × combo multiplier × prestige bonus × any active buffs.

**Ranged Combat:**
- **Aim mode:** Hold aim button = crosshair appears, camera zooms slightly.
- **Aim-assist (mobile only):** Crosshair auto-snaps to nearest enemy within 15° cone. Essential for thumbstick aiming.
- **Fire:** Tap fire button. Each weapon has its own fire rate and projectile behavior.
- **Ammo:** Unlimited base ammo. Special ammo (explosive rounds, etc.) is limited and purchasable.

**Throwables:**
- Equip from inventory → aim arc appears → release to throw.
- Molotovs leave fire zones. Grenades explode on impact. Brainrot Bombs confuse enemies.
- Limited quantity. Found in crates, bought in shop, dropped by elites.

**Dodge Roll:**
- Tap dodge → character rolls in joystick direction.
- **0.5 seconds of total invincibility** during the roll animation. Nothing can hit you.
- **3-second cooldown.** You can't spam it.
- Direction matters — dodge sideways to avoid boss charges, dodge backward to create space.

**Boss Parry:**
- Boss telegraphs a heavy attack with a **1.5-second wind-up animation** (glowing red fist/weapon).
- If you tap dodge at the **exact right moment** (0.3s window) = **PARRY.**
- Successful parry = boss stunned for **3 seconds** = everyone unloads damage.
- Failed parry = you get hit for massive damage + knocked back.
- **Only works on bosses.** Regular combat is pure dodge/attack.

### Combo System — The Addiction Loop

Combos are the secret sauce. They make combat feel incredible and drive coin earning.

- **Combo counter:** Every consecutive kill without taking damage increments the counter.
- **Visual escalation:**

| Combo | Visual | Coin Multiplier | Sound |
|-------|--------|----------------|-------|
| 1-4x | Small white text | 1.0x | Normal hit sounds |
| 5-9x | Green text, slight glow | 1.5x | Pitch increases |
| 10-19x | Yellow text, screen shake | 2.0x | "COMBO!" voice clip |
| 20-49x | Orange text, particle trail on player | 3.0x | "UNSTOPPABLE!" voice clip |
| 50-99x | Red text, full fire aura, screen pulse | 5.0x | "GODLIKE!" voice clip |
| 100x+ | Purple text, reality glitch effect, server announcement | 10.0x | **Server-wide announcement + unique sound** |

- **Getting hit = combo resets to 0.** This creates constant tension — do you play safe or go aggressive for the multiplier?
- **Combo coins are the primary earning driver.** A 50x combo on a boss kill = 200 × 5.0 = 1,000 coins from one kill.

### Combat Feel — The "Juice" (Non-Negotiable Polish)

Every single one of these must be in the game. Without them, combat feels dead:

1. **Screen shake** on every melee hit (intensity scales with weapon damage)
2. **Hit flash** — enemy model flashes white for 1 frame on hit
3. **Knockback** — melee hits push enemies backward (distance scales with weapon weight)
4. **Floating damage numbers** — pop up, drift upward, fade out. Crits are bigger + colored.
5. **Hit sound effect** — unique per weapon type (thwack for bat, slice for katana, boom for shotgun)
6. **Kill dissolve** — enemy ragdolls briefly then dissolves into particles
7. **Combo counter UI** — center-right of screen, animates on increment, color-shifts per tier
8. **Haptic vibration** — mobile phones buzz on hits (short pulse melee, longer for ranged)
9. **Coin pickup sound** — satisfying "cha-ching" with rising pitch for combos
10. **Kill streak announcement** — text banner across screen at 10x, 25x, 50x, 100x

**The sacred rule: < 100ms from tap to visual feedback.** Client predicts the hit immediately. Server validates afterward. Player must NEVER feel lag between tapping and seeing the enemy react.

---

## ⚔️ Every Weapon in the Game

### The Rarity System (6 Weapon Tiers)

| Tier | Name | Color | Power Multiplier | Drop Rate (Basic Crate) | Has Ability? |
|------|------|-------|-----------------|------------------------|-------------|
| 1 | ⚪ Common | Gray/White | 1.0x | 45% | No |
| 2 | 🟢 Uncommon | Green | 1.3x | 30% | No |
| 3 | 🔵 Rare | Blue | 1.6x | 15% | **Yes** (8s cooldown) |
| 4 | 🟣 Epic | Purple | 2.0x | 7% | **Yes** (12s cooldown) |
| 5 | 🟠 Legendary | Orange/Gold | 2.5x | 2.5% | **Yes** (15s cooldown) |
| 6 | 🔴 RIZZLORD | Red + custom glow + aura | 3.0x | 0.5% | **Yes** (20s cooldown) + screen-wide VFX |

### Complete Melee Weapon Table

| Weapon | Rarity | Base DMG | Attack Speed | Unique Ability | How to Get |
|--------|--------|----------|-------------|----------------|-----------|
| Rusty Pipe | ⚪ Common | 10 | Fast (0.3s) | — | Everyone starts with this |
| Wooden Bat | ⚪ Common | 12 | Fast (0.3s) | — | Day 1 shop (50 coins) |
| Machete | 🟢 Uncommon | 18 | Medium (0.4s) | **Bleed** — target takes 3 DMG/sec for 4s | Day 5+ shop (200 coins) |
| Fire Axe | 🟢 Uncommon | 22 | Slow (0.6s) | **Cleave** — hits up to 2 adjacent enemies | Day 10+ shop (400 coins) |
| Katana | 🔵 Rare | 28 | Fast (0.3s) | **Dash Slash** — lunge forward 10 studs dealing 2x damage (8s CD) | Crate / Day 20+ shop (1,500 coins) |
| Chainsaw | 🟣 Epic | 35 | Medium (0.4s) | **Shred** — hold attack = rapid hits for 3s at 60% DMG each (12s CD) | Crate / Boss drop |
| Skibidi Blade | 🟠 Legendary | 45 | Fast (0.3s) | **Toilet Tornado** — AoE spin hitting all enemies in 12-stud radius (15s CD) | Gacha only |
| **Sigma Fist** | 🔴 RIZZLORD | 55 | Very Fast (0.2s) | **One Punch** — single massive hit, knockback + screen distortion effect (20s CD) | 0.5% gacha / Day 99 Final Boss drop |

### Complete Ranged Weapon Table

| Weapon | Rarity | Base DMG | Fire Rate | Unique Ability | How to Get |
|--------|--------|----------|-----------|----------------|-----------|
| Slingshot | ⚪ Common | 8 | Slow (1.0s) | — | Everyone starts with this |
| 9mm Pistol | ⚪ Common | 12 | Medium (0.5s) | — | Day 3 shop (100 coins) |
| Shotgun | 🟢 Uncommon | 25 | Slow (0.8s) | **Spread** — fires 5 pellets in a cone, devastating at close range | Day 10+ shop (500 coins) |
| AR-15 | 🔵 Rare | 15 | Fast (0.2s) | **Burst Fire** — 3 rapid shots in 0.3s (8s CD) | Crate / Day 25+ shop (2,000 coins) |
| Sniper | 🟣 Epic | 60 | Very Slow (2.0s) | **Headshot** — 2x crit if you hit the head hitbox (12s CD on ability mode) | Crate / Boss drop |
| Ohio Cannon | 🟠 Legendary | 50 | Slow (1.5s) | **Explosion** — AoE blast + knockback in 8-stud radius (15s CD) | Gacha only |
| **Rizz Ray** | 🔴 RIZZLORD | 40 | Medium (0.5s) | **Charm Beam** — hit enemies fight each other for 5s (20s CD) | 0.5% gacha / Day 99 Final Boss drop |

### Complete Throwables Table

| Item | Rarity | Damage | Effect | Duration | How to Get |
|------|--------|--------|--------|----------|-----------|
| Rock | ⚪ Common | 5 | Stagger (interrupts enemy attack) | Instant | Free — pick up off the ground |
| Molotov | 🟢 Uncommon | 15/sec | Creates a fire zone enemies avoid or burn in | 3 seconds | Shop (150 coins) / Crate |
| Frag Grenade | 🔵 Rare | 40 | Explosion AoE — hits everything in radius | Instant | Shop (300 coins) / Crate |
| Brainrot Bomb | 🟣 Epic | 30 | Confuse — enemies wander aimlessly | 5 seconds | Crate only |

---

## 🌊 The 99-Day Difficulty Curve — Every Phase

### Phase Breakdown

| Phase | Days | Enemy Types Active | Max Enemies On-Screen | Enemy HP Range | What Opens Up | Monetization Trigger |
|-------|------|-------------------|----------------------|----------------|---------------|---------------------|
| 🟢 Tutorial | 1–5 | Skibidi Zombie only | 4-6 | 20-40 | Basic melee + ranged. Learn dodge. | None. Pure hook. |
| 🟢 Early | 6–15 | + Ohio Anomaly | 6-8 | 30-80 | Tier 1 shop weapons. First depot stop. | First crate (Day 10). "See what you COULD have." |
| 🟡 Mid | 16–30 | + Rizz Merchant | 8-10 | 60-150 | Tier 2 weapons. Throwables. Fusion. | 🔴 **Difficulty spike Day 15.** Players start dying. Revive offer triggers. |
| 🟠 Hard | 31–50 | + Brainrot Mutant | 8-12 | 100-300 | Tier 3 weapons. Guild quests. | 🔴 **Difficulty spike Day 30.** Gem purchases spike. Gacha crates feel necessary. |
| 🔴 Hell | 51–75 | All types + night variants | 10-12 | 200-500 | Tier 4 weapons. Ability weapons. | 🔴 **Difficulty spike Day 50.** Premium players pull ahead. FOMO kicks in. |
| 🟣 Endgame | 76–99 | All types + elite mutations | 10-12 | 400-1000+ | All tiers. RIZZLORD weapons. | 🔴 **Day 75 + Day 99 Final Boss.** Maximum spend motivation. |

### Boss Schedule

A boss appears every **11th day.** This is not random — it's psychologically paced:

| Day | Boss | HP | Exclusive Drop |
|-----|------|----|---------------|
| 11 | Skibidi Shambler King | 500 | Uncommon weapon crate |
| 22 | Ohio Anomaly Alpha | 1,200 | Rare weapon crate |
| 33 | Rizz Lord Junior | 2,500 | Rare weapon + cosmetic crate |
| 44 | Mutant Brainrot Prime | 5,000 | Epic weapon crate |
| 55 | Baron Skibidi | 10,000 | Epic weapon + pet crate |
| 66 | Sigma General | 20,000 | Legendary weapon crate |
| 77 | Void Walker | 40,000 | Legendary weapon + aura crate |
| 88 | Omega Brainrot | 75,000 | Legendary+ guaranteed |
| **99** | **MEGA SIGMA — THE FINAL BOSS** | **150,000** | **RIZZLORD weapon drop chance (0.5%) + guaranteed Legendary** |

**Boss fight mechanics are identical across all bosses:**
1. Boss appears with cutscene intro (3s, skippable)
2. Boss has 3 attack patterns, telegraphed with 1.5s wind-up
3. Players dodge attacks, parry for stun windows
4. Boss enrages at 25% HP (faster attacks, more damage)
5. Boss HP scales with player count (×1.5 per additional player)
6. Kill → loot drops → post-boss gacha spin (free)

---

## 🧟 Every Enemy in the Game

### The 5 Core Enemy Types

| Enemy | Base HP | Speed | Base DMG | Attack Pattern | Special Mechanic | Spawn Weight |
|-------|---------|-------|----------|----------------|-----------------|-------------|
| 🧟 **Skibidi Zombie** | 30 | 8 studs/s (slow) | 5 | Walk toward player, swipe when close | None. Pure fodder. Deadly in hordes of 6+. | 40% |
| ⚡ **Ohio Anomaly** | 20 | 18 studs/s (very fast) | 8 | Erratic zigzag charge, lunges | Zigzag pathing makes it hard to hit with ranged. "Only in Ohio." | 25% |
| 💖 **Rizz Merchant** | 40 | 12 studs/s (medium) | 3 | Stays behind other enemies, pulses heal aura | **Healer.** Heals all enemies within 15 studs for 5 HP/sec. Kill first or the horde never dies. | 15% |
| 🧬 **Brainrot Mutant** | 60 | 12 studs/s (medium) | 12 | Charges, heavy swing | **Splits on death** into 2 mini-mutants (30 HP each, faster). Forces you to fight 3 enemies from 1. | 10% |
| 💀 **Sigma Boss** | 200+ | 6 studs/s (slow) | 20+ | 3 telegraphed attacks: slam, charge, projectile | **Boss.** Parry window. Damage phase when stunned. Enrage at 25%. Exclusive drops. | Boss waves only |

### Enemy Scaling Formula

Every day, all enemies get harder:
- **HP per day:** Base HP × (1 + 0.03 × Day Number). So Day 50 Skibidi = 30 × 2.5 = 75 HP.
- **Damage per day:** Base DMG × (1 + 0.02 × Day Number). So Day 50 Skibidi = 5 × 2.0 = 10 DMG.
- **Speed:** Does NOT scale. Speed is fixed per enemy type.
- **Spawn count per wave:** Starts at 4, increases by 1 every 5 days, capped at 12 on screen.

### Named Codex Enemies (The Lore Layer)

The in-game **Codex** encyclopedia contains extended lore entries for all enemies and bosses. Players unlock entries by killing enemies. Examples:
- **Skibidi Shambler** — *"A single Shambler is a joke. A horde of them is a funeral."*
- **Sigma Walker** — *"Travels in pairs. Kill one and the other enrages."*
- **Baron Skibidi** — *"RIZZLORD TIER. HP 2,500. Rules the Rusted Depot. Three attacks. No mercy."*

Codex completion = achievements = coins + gems.

---

# PART 2: THE MONEY

---

## 💰 The Economy — Complete Breakdown

### Two Currencies

| | 🪙 **Survival Coins** (Soft Currency) | 💎 **Brainrot Gems** (Hard Currency) |
|---|---|---|
| **Color** | Gold | Purple |
| **How players earn it FREE** | Kill enemies, clear waves, combo bonuses, daily challenges, achievements | Boss kills, achievements, daily login, rare drops — small amounts |
| **How players BUY it** | Robux → coin packs | Robux → gem packs (the primary money driver) |
| **What it buys** | Weapons from shop, basic gacha crates, crafting, fusion, trade fees, prestige reset | Premium gacha crates, exclusive cosmetics, battle pass, revives, boosts |
| **Daily free cap** | No cap | 25 gems/day (Robux purchases bypass this) |

### Exact Earn Rates (What Players Get for Free)

| Action | Coins | Gems | Battle Pass XP |
|--------|-------|------|---------------|
| Kill regular zombie | 10 | — | 10 |
| Kill elite enemy | 50 | 1 | 25 |
| Kill boss | 200 | 5 | 100 |
| Clear wave | 50 | — | — |
| 5-kill combo | 25 bonus | — | 50 |
| 10-kill combo | 100 bonus | 1 | 150 |
| 25-kill combo | 500 bonus | 3 | 300 |
| 50-kill combo | 2,000 bonus | 5 | 500 |
| Daily challenge (complete) | 200 | 3 | 200 |
| Weekly challenge (complete) | 1,000 | 10 | 500 |
| Achievement | 500 | 10 | — |
| Daily login (Day 1-6) | 50-100 | 1-3 | 50 |
| Daily login (Day 7) | 500 | 10 | 100 |
| Survive 1 minute | — | — | 20 |
| Referral (friend joins) | 500 | 10 | 500 |

**Starting balance for new players:** 100 coins + 10 gems.

### Economy Sinks (Preventing Inflation)

Without sinks, the economy floods with coins and nothing has value:
- **3% trade tax** on all player-to-player trades (coins destroyed)
- **Weapon repair costs** — weapons degrade over time, cost coins to maintain
- **Crafting/fusion fees** — escalating coin costs to fuse items
- **Prestige reset cost** — each prestige costs more (1K → 5K → 25K → 100K → 500K)
- **Gacha** — the biggest sink. 500 coins per basic pull, 50 gems per premium pull
- **Auction house listing fee** — 5% non-refundable listing fee

---

## 🛒 Every Monetization Product — What We Sell

### Game Passes (One-Time, Permanent)

| Pass | Price (Robux) | What the Player Gets | Our Revenue (70% after Roblox cut) |
|------|--------------|---------------------|-------------------------------------|
| 🪙 2x Coins | 99 R$ | Double ALL coin earnings. Forever. Every kill, every challenge, every boss. | ~$0.69 |
| ⚡ 2x XP | 149 R$ | Level up and earn Battle Pass XP 2x faster. Forever. | ~$1.04 |
| 🧲 Auto-Collect | 199 R$ | Automatically picks up all drops within 30-stud radius. No more missing coins. | ~$1.39 |
| 👑 VIP Access | 499 R$ | VIP badge visible to all players + VIP-only area on Train + 5 bonus gems/day + [VIP] chat tag | ~$3.49 |
| 🏆 Ultimate Survivor | 1,499 R$ | **EVERYTHING above** + "Brainrot Immune" exclusive aura + 10 bonus gems/day + [ULTIMATE] gold chat tag + priority server join | ~$10.49 |

### Developer Products (Repeatable Purchases)

**Currency Packs:**

| Product | Price (Robux) | What You Get | Value per Robux |
|---------|--------------|-------------|-----------------|
| 500 Coins | 49 R$ | 500 Survival Coins | 10.2 coins/R$ |
| 2,500 Coins | 199 R$ | 2,500 Survival Coins | 12.6 coins/R$ (better deal) |
| 10,000 Coins | 699 R$ | 10,000 Survival Coins | 14.3 coins/R$ (best deal) |
| 25 Gems | 99 R$ | 25 Brainrot Gems | 0.25 gems/R$ |
| 100 Gems | 349 R$ | 100 Brainrot Gems | 0.29 gems/R$ (better) |
| 500 Gems | 1,499 R$ | 500 Brainrot Gems | 0.33 gems/R$ (best) |

**First purchase bonus:** Player's very first gem purchase is doubled. This is a proven conversion trigger — they feel like they're getting a deal and the barrier to the SECOND purchase drops.

**Consumables:**

| Product | Price (Robux) | Effect |
|---------|--------------|--------|
| Instant Revive | 25 R$ | Revive immediately where you died instead of respawning at Train |
| 5x Revive Pack | 99 R$ | 5 instant revives (20% discount vs buying individually) |
| 2x Coins Boost (30min) | 49 R$ | Double coin earnings for 30 minutes (stacks with 2x Coins pass = 4x total) |
| 2x XP Boost (30min) | 49 R$ | Double XP earnings for 30 minutes |
| Shield (5min) | 29 R$ | Invincible for 5 minutes. The "I'm about to die" panic buy. |
| MEGA Boost (60min) | 149 R$ | 2x Coins + 2x XP + 2x Luck for 60 minutes. The whale product. |

**Gacha Purchases:**

| Product | Price (Robux) | What You Pull |
|---------|--------------|--------------|
| 1x Survival Crate | 75 R$ | Common → Legendary (pity at 50 pulls) |
| 10x Survival Crate | 649 R$ (14% discount) | 10 pulls, guaranteed 1 Rare+ |
| 1x Brainrot Crate | 149 R$ | Uncommon → Mythic (pity at 30 pulls) |
| 10x Brainrot Crate | 1,299 R$ (13% discount) | 10 pulls, guaranteed 1 Epic+ |

---

## 🎰 Gacha System — The Drop Tables

All rates are visible in-game (Roblox policy). Pity system prevents infinite bad luck.

### Survival Crate (500 Coins or 75 R$)

| Rarity | Drop Rate | Pity |
|--------|-----------|------|
| Common | 40% | — |
| Uncommon | 30% | — |
| Rare | 15% | — |
| Epic | 8% | Guaranteed after 50 pulls |
| Legendary | 4% | Guaranteed after 100 pulls |

### Brainrot Crate (50 Gems or 149 R$)

| Rarity | Drop Rate | Pity |
|--------|-----------|------|
| Uncommon | 25% | — |
| Rare | 20% | — |
| Epic | 15% | Guaranteed after 30 pulls |
| Legendary | 10% | Guaranteed after 60 pulls |
| Mythic | 4% | Guaranteed after 100 pulls |
| Celestial | 0.8% | Guaranteed after 200 pulls |
| RIZZLORD | 0.05% | Guaranteed after 500 pulls |

**Gacha items include:** weapons, pets, cosmetic auras, skins, and exclusive items that can't be bought directly.

---

## 🎖️ Battle Pass — Season 1: Brainrot Origins

- **Price:** 299 R$ for Premium track (~$2.09 revenue)
- **Duration:** 30 days per season
- **50 tiers** — Free track (everyone gets rewards) + Premium track (paying players get bonus rewards at every tier)

### Key Tier Rewards

| Tier | Free Reward | Premium Reward |
|------|------------|----------------|
| 1 | 50 Coins | 100 Coins + Recruit Badge |
| 5 | 100 Coins | Basic Crate + Uncommon Skin |
| 10 | 200 Coins | **Recruit Outfit** (exclusive skin) |
| 15 | 5 Gems | Brainrot Crate |
| 20 | 500 Coins | **Origins Flame Aura** (exclusive cosmetic aura) |
| 25 | 10 Gems | 2x Brainrot Crate |
| 30 | 1,000 Coins | **Brainrot Commander Skin** (exclusive legendary skin) |
| 35 | 15 Gems | 3x Brainrot Crate |
| 40 | 2,000 Coins | **Sigma Phoenix Pet** (exclusive legendary pet) |
| 45 | 20 Gems | 5x Brainrot Crate |
| **50** | 5,000 Coins | **Brainrot Origins Legendary Aura** + [ORIGINS] exclusive tag |

**Why the Battle Pass prints money:** Players see the premium rewards at every tier. FOMO builds as the season timer counts down. Players who bought it play MORE to get their money's worth. Players who didn't buy it see what they're missing every time they level up.

---

# PART 3: RETENTION SYSTEMS

---

## 🐾 Cosmetic Trinity: Pets, Auras & Skins

Three cosmetic categories that players obsess over. All visible to other players. **Social visibility drives spending** — you don't just want the item, you want everyone to SEE you have it.

### Pets (They Follow You Everywhere)

| Pet | Rarity | How to Get | Passive Buff | Coin Magnet Range |
|-----|--------|-----------|-------------|-------------------|
| 🐭 Basic Mouse | Common | Gacha / free starter | +2% XP | 5 studs |
| 🐻 Starter Cub | Uncommon | Gacha | +5% XP | 8 studs |
| 🐉 Fire Dragon | Rare | Gacha | +8% XP | 12 studs |
| 🦊 Sigma Fox | Epic | Gacha | +12% XP, +4% luck | 15 studs |
| 🦅 Golden Phoenix | Legendary | Gacha (rare) | +18% XP, +8% luck | 25 studs |
| 🔥 **Brainrot Phoenix** | Celestial | Day 99 Final Boss drop (0.5%) | +25% XP, +12% luck | 30 studs |

**Pet Fusion:** 3 same-rarity pets → 1 next-rarity pet. Costs coins (escalating). 60-second cooldown to prevent macro abuse.

### Auras (Visual Flex)

Two slots that **stack visually** — inner ring + outer ring:

**Cosmetic Auras** (inner ring) — purchasable through gacha/shop:
- Flame Aura (Rare), Galaxy Aura (Legendary), Void Aura (Mythic), Glitch Aura (Celestial)

**Combat Auras** (outer ring) — **CANNOT BE BOUGHT. Earned ONLY through gameplay milestones.** This is the ultimate status symbol.

| Tier | Name | How You Earn It | Visual Effect |
|------|------|----------------|---------------|
| 1 | ✨ Spark | Default (everyone) | Faint glow |
| 2 | 💡 Glow | Survive to Day 10 | Soft pulsing light |
| 3 | 🔥 Flame | Survive to Day 25 | Flickering fire particles |
| 4 | 🌟 Blaze | Survive to Day 50 | Intense blazing ring |
| 5 | 🔥 Inferno | Survive to Day 75 | Full fire ring + heat distortion |
| 6 | 💥 Supernova | Kill the Day 99 Final Boss | Explosive energy field |
| 7 | 🌌 Cosmic | Reach Prestige 10 | Galaxy swirl + **server-wide announcement when you join** |
| 8 | 🕊️ Transcendent | Reach Prestige 50 | Ascended being VFX + **server-wide announcement** |

### Skins (Character Outfits)

**6 equip slots:** Outfit, Hat, Back accessory, Face, Left Shoulder, Right Shoulder

**Built-in skins:**
- Cyberpunk Outfit (Rare) — neon lines, techy look
- Tiger Outfit (Legendary) — full tiger themed set
- Victory Emote (Uncommon) — celebration animation
- **Brainrot Commander Set** (Legendary, Battle Pass exclusive) — military brainrot aesthetic, the most wanted skin at launch

---

## 🔄 Prestige System — The Infinite Loop

Beat Day 99 → option to **Prestige** (voluntary reset). You go back to Day 1 with starter weapons, BUT you keep:
- All cosmetics (pets, auras, skins)
- Prestige rank (visible nameplate)
- **Permanent stacking bonuses:**

| Prestige | Coin Bonus | XP Bonus | Luck Bonus | Damage Bonus | Cosmetic Unlock |
|----------|-----------|----------|-----------|-------------|----------------|
| 1 | +5% | +3% | +2% | +1% | ★ Prestige nameplate |
| 5 | +25% | +15% | +10% | +5% | Bronze Aura |
| 10 | +50% | +30% | +20% | +10% | Silver Aura + 🌌 Cosmic combat aura |
| 20 | +100% | +60% | +40% | +20% | Gold Aura |
| 30 | +150% | +90% | +60% | +30% | Diamond Aura |
| **50 (MAX)** | **+250%** | **+150%** | **+100%** | **+50%** | **🕊️ Transcendent aura + "Prestige God" title** |

**Prestige reset cost:** P1 = 1,000 coins → P5 = 25,000 → P10 = 100,000 → P20 = 500,000 → P50 = 5,000,000. Escalating costs are a massive coin sink.

**Why this prints money:** Prestige players are the most engaged. They play the most, they spend the most, and they're the ones flexing high-tier auras that make other players want to spend to catch up.

---

## 🐲 Weekly World Boss: Mega Brainrot Sigma

**Every Saturday at 9 PM ICT** (peak hours), a server-wide boss spawns.

- **HP:** 500,000 (scales with player count)
- **Duration:** 30 minutes max
- **Players:** Everyone on the server fights together
- **3 Phases:** Each phase = new attack patterns + enrage mechanic
- **Telegraphed attacks:** dodge windows, parry windows, damage phases — same system as regular bosses but bigger, flashier, more dramatic
- **MVP system:** Player with most damage dealt = MVP

**Loot:**
- Everyone who participates: Sigma Essence (currency for exclusive Sigma shop items)
- Top 10 damage: Guaranteed Epic+ drop
- MVP: **Sigma Slayer Title** (lasts 1 week) + guaranteed Legendary drop
- 0.5% chance from boss: **Sigma God Transformation** (Mythic cosmetic — your character transforms)

**Why this matters:** Weekly events create appointment gaming. Players log in specifically for this. It drives DAU on Saturdays. The MVP system creates competition. The exclusive drops create FOMO.

---

## 👥 Guild System — Social Stickiness

Guilds are the retention glue. Players who join guilds stay 3-5x longer than solo players.

- **Create a guild:** 5,000 coins
- **Max members:** 30
- **10 guild levels** — unlock perks as the guild levels up

### Guild Quests (Cooperative Combat Challenges)

| Quest | Requirement | Guild XP | Personal Reward |
|-------|-----------|----------|----------------|
| Guild Hunt | 100 kills as a guild | 500 | 200 coins each |
| Guild Slayers | Kill 5 bosses as a guild | 1,500 | 400 coins + 10 gems each |
| Guild Legends | Survive to Day 50+ as a guild | 5,000 | 1,000 coins + 25 gems each |

### Guild Level Perks

| Level | Perk |
|-------|------|
| 1 | Guild chat + guild tag visible on nameplate |
| 3 | +5% coin bonus for all members |
| 5 | Guild banner (customizable) + shared guild storage |
| 7 | +15% coin bonus for all members |
| 10 (MAX) | **+25% coin bonus + Legendary Guild Pet** (exclusive pet only guild L10 members get) |

---

## 🔀 Fusion, Trading & Other Systems

### Fusion (Item Sink)

Combine duplicate items to upgrade rarity:
- 5 Common → 1 Rare (500 coins)
- 3 Rare → 1 Epic (2,000 coins)
- 3 Epic → 1 Legendary (10,000 coins)
- 3 Legendary → 1 Mythic (50,000 coins)

Prevents the economy from flooding with duplicate items. Forces engagement with the gacha.

### Trading (Player-to-Player Economy)

- Direct trades between players
- **3% trade tax** on the seller (coins destroyed = deflationary)
- **Auction house** for listing items (5% listing fee, non-refundable)
- Anti-scam: both players must confirm, 10-second review window, server-authoritative

### Daily Rewards (7-Day Cycle)

Login every day → escalating rewards:
- Day 1: 50 coins
- Day 2: 100 coins
- Day 3: 1 gem
- Day 4: 200 coins
- Day 5: 3 gems
- Day 6: Basic crate
- **Day 7: 500 coins + 10 gems + Brainrot crate**
- Then resets. Missing a day resets the streak.

### Referral System

- Share your referral code → friend joins and plays 10 minutes → both get 500 coins + 10 gems + 500 BP XP
- Max 50 referrals (25,000 coins + 500 gems total possible)

### Challenge System

- **3 daily challenges** (kill X enemies, survive X waves, use X weapon type) → 200 coins + 3 gems each
- **1 weekly challenge** (bigger goal) → 1,000 coins + 10 gems
- Challenges rotate daily/weekly to keep gameplay varied

### Leaderboards

- **Global:** Total kills, highest day survived, most prestige, richest player
- **Guild:** Guild XP, guild kills, guild day record
- **Weekly World Boss:** Damage dealt, MVPs this season
- Top players get visible badges/nameplates

### Competitive Ranking (Elo System)

- Invisible Elo rating based on survival performance
- Matchmaking balances squads by average Elo
- High-Elo players get matched with harder modifiers but better drop rates
- Prevents veterans from stomping newbies

---

# PART 4: UNDER THE HOOD

---

## 🏗️ Technical Architecture — The Full 41-Module Stack

**41 Lua modules** power everything. All server-authoritative (anti-cheat by design). The server is the boss — the client just renders what the server tells it to.

### Server-Side Modules (31 modules — run on Roblox servers)

| Module | What It Does | Deploy Status |
|--------|-------------|---------------|
| **UnifiedServer.lua** | Master boot script. Initializes all 28 server modules in dependency order. The brain. | ✅ Ready |
| **CombatSystem.lua** | All combat logic: melee, ranged, dodge, parry, damage calculation, hitboxes | 🔴 RECODE NEEDED — currently ESL quiz-based |
| **WeaponData.lua** (was QuestionBankV1) | All weapon stats, rarity tables, ability definitions, damage formulas | 🔴 RECODE NEEDED — currently ESL question bank |
| **EnemyData.lua** (was QuestionBankV2) | All enemy types, HP/DMG/speed tables, spawn weights, scaling formulas | 🔴 RECODE NEEDED — currently ESL question bank v2 |
| **CombatRewardsManager.lua** (was EnglishRewardsManager) | Kill rewards, combo multipliers, boss loot tables, coin/gem distribution | 🔴 RECODE NEEDED — currently ESL rewards |
| **DayScaling.lua** (was DifficultyTiers) | 99-day difficulty curve, enemy scaling formulas, phase transitions | 🔴 RECODE NEEDED — currently ESL difficulty tiers |
| **WaveManager.lua** | Wave progression, enemy spawning, boss timing, wave-end triggers | 🟡 SURGERY — remove ESL hooks, wire to real combat |
| **EconomyManager.lua** | Two-currency system, coin/gem earning, spending, inflation sinks | 🟡 SURGERY — remove ESL bonus hooks |
| **BattlePass.lua** | 50-tier seasonal pass, XP tracking, free/premium reward distribution | 🟡 SURGERY — remove ESL XP hooks |
| **WorldBoss.lua** | Weekly boss system, multi-phase fights, server-wide HP pool, MVP tracking | 🟡 SURGERY — remove ESL challenge phase |
| **GuildManager.lua** | Guild creation, members, quests, levels, perks, shared storage | 🟡 SURGERY — remove ESL guild quests |
| **CosmeticController.lua** | Pet/aura/skin equip, display, fusion, inventory management | 🟡 SURGERY — remove ESL aura references |
| **MonetizationServer.lua** | All Robux purchase processing, game pass checks, receipt handling | ✅ Ready |
| **GamePassConfig.lua** | 5 game pass definitions, pricing, perk application | ✅ Ready (Product IDs need real values) |
| **DevProductsConfig.lua** | 16 developer product definitions, pricing, delivery logic | ✅ Ready (Product IDs need real values) |
| **GachaManager.lua** | Crate system, drop rate tables, pity counters, pull animation triggers | ✅ Ready |
| **MonetizationOrchestrator.lua** | Smart offer timing — shows the right purchase prompt at the right moment | ✅ Ready |
| **ReceiptRouter.lua** | Unified ProcessReceipt callback, prevents purchase conflicts, idempotent dedup | ✅ Ready |
| **PrestigeManager.lua** | Reset logic, permanent bonus application, prestige rank tracking | ✅ Ready |
| **EloManager.lua** | Competitive rating, matchmaking input, performance-based difficulty | ✅ Ready |
| **TradeManager.lua** | Player-to-player trading, auction house, tax collection, anti-scam | ✅ Ready |
| **DailyRewards.lua** | 7-day login cycle, streak tracking, reward distribution | ✅ Ready |
| **ReferralSystem.lua** | Invite codes, friend tracking, reward distribution, cap enforcement | ✅ Ready |
| **ChallengeManager.lua** | Daily/weekly challenge generation, progress tracking, reward payout | ✅ Ready |
| **LeaderboardManager.lua** | Global/guild/weekly leaderboards, OrderedDataStore integration | ✅ Ready |
| **DataStoreV2.lua** | All player data save/load, session locking, versioning, crash recovery | ✅ Ready |
| **SecurityLayer.lua** | Anti-cheat: speed checks, damage validation, teleport detection, rate limiting | ✅ Ready |
| **AnomalyDetector.lua** | Detects suspicious transactions, impossible economy states, exploit patterns | ✅ Ready |
| **AnalyticsService.lua** | Dual-channel analytics: Roblox AnalyticsService + DataStore. 50+ event types. | ✅ Ready |
| **FTUEController.lua** | First-time user experience. 60-second guided tutorial. Hook the player fast. | ✅ Ready |
| **ServerGateway.lua** | Server-side of the 2-RemoteEvent architecture. All server→client communication. | ✅ Ready |

### Client-Side Modules (6 modules — run on player's device)

| Module | What It Does | Deploy Status |
|--------|-------------|---------------|
| **UnifiedClient.lua** | Master client boot. Initializes all 5 client modules. Connects to server. | ✅ Ready |
| **ClientBridge.lua** | Client-side of the 2-RemoteEvent architecture. All client→server communication. | ✅ Ready |
| **HUDController_v2.lua** | Health bar, combo counter, wave info, weapon display, currency display, all UI | ✅ Ready |
| **MobileInputController.lua** | Virtual joystick, attack buttons, dodge button, aim-assist, platform detection | ✅ Ready |
| **CodexClient.lua** | In-game encyclopedia UI, entry unlocking, lore display | ✅ Ready |
| **FTUEManager.lua** | Client-side tutorial UI, step tracking, tooltip overlays | ✅ Ready |

### Shared Modules (4 modules — used by both server and client)

| Module | What It Does | Deploy Status |
|--------|-------------|---------------|
| **CodexData.lua** | Enemy/location/weapon encyclopedia data. Shared between server and client. | ✅ Ready |
| **EnemyFactory.lua** | Creates and configures all enemy instances from templates | ✅ Ready |
| **RewardBridge.lua** | Bridges combat rewards → economy → UI. The glue between systems. | 🟡 SURGERY — remove ESL hooks |
| **EventBus (embedded)** | Internal event system for module-to-module communication | ✅ Ready |

### Network Architecture

**Only 2 RemoteEvents for the entire game:**
1. **EventBus** — general-purpose event channel (batched, compressed)
2. **Gateway** — high-priority direct channel (purchases, auth, security)

**Why 2 instead of 50:** Roblox charges network overhead per RemoteEvent. 2 events with smart batching = less lag, less bandwidth, better mobile performance. Everything is multiplexed through these 2 channels.

### Performance Budget (Mobile-First)

| Constraint | Limit | Why |
|-----------|-------|-----|
| Max enemies on screen | 8-12 | More = frame drops on cheap phones |
| Shadows on mobile | OFF | Shadows kill mobile FPS |
| Max parts in workspace | < 500 | Part count is the #1 performance killer |
| StreamingEnabled | ON | Only renders what's near the player |
| Hitbox system | Raycasts (not parts) | Raycasts are free; part-based hitboxes are expensive |
| Tap-to-feedback latency | < 100ms | Client predicts immediately. Server validates after. |
| Target FPS (mobile) | 30fps minimum | Below 30 = unplayable |
| Target FPS (desktop) | 60fps | Desktop can handle more |

---

## 🔴 Deploy Readiness — The Honest Assessment

**5 modules need COMPLETE RECODE** before the combat is real. The current combat system was built on ESL quiz mechanics (answering English questions to deal damage). That's been wiped from the design — now it's tap-to-attack melee + aim-assist ranged. But the code still needs to be rewritten.

### Module Status Summary

| Status | Count | What It Means | Estimated Copilot Time |
|--------|-------|---------------|----------------------|
| 🔴 **REPLACE** | 5 modules | Delete and rewrite from scratch with real combat mechanics | ~21 hours |
| 🟡 **SURGERY** | 6 modules | Remove ESL hooks, wire to new combat system | ~18 hours |
| 🟢 **CLEAN** | 30 modules | Ready to deploy as-is | 0 hours |
| **TOTAL** | **41 modules** | | **~39 hours Copilot time (~12-15 hours wall clock parallel)** |

### What "REPLACE" Means (The 5 Critical Modules)

These 5 modules currently power combat through English quiz questions. They need to be completely rewritten:
1. **CombatSystem.lua** → Real tap-to-attack melee, aim-assist ranged, dodge roll, boss parry
2. **QuestionBankV1 → WeaponData.lua** → All weapon stats, rarity tables, ability definitions
3. **QuestionBankV2 → EnemyData.lua** → All enemy types, scaling formulas, spawn tables
4. **EnglishRewardsManager → CombatRewardsManager.lua** → Kill rewards, combo multipliers, boss loot
5. **DifficultyTiers → DayScaling.lua** → 99-day difficulty curve, phase transitions

### What "SURGERY" Means (The 6 Modules That Need Cleanup)

These modules work, but have ESL hooks wired into them that need to be removed and rewired:
1. **WaveManager** — remove ESL quiz trigger between waves
2. **EconomyManager** — remove ESL streak bonus hooks
3. **BattlePass** — remove ESL XP bonus hooks
4. **WorldBoss** — remove ESL challenge phase
5. **GuildManager** — remove ESL-themed guild quests
6. **CosmeticController** — remove ESL aura naming

### What's Blocking Launch

| Blocker | Status | Who Fixes It |
|---------|--------|-------------|
| 5 modules need recode (combat core) | Spec written, code not started | GitHub Copilot |
| 6 modules need surgery (ESL removal) | Identified, not started | GitHub Copilot |
| 21 Product IDs = 0 (placeholder) | Need real IDs from Roblox Creator Dashboard | Michael (create products in Dashboard) |
| Rojo CI/CD pipeline | Workflow created, needs first test | Michael (trigger workflow_dispatch) |
| Game visuals / map / assets | In Roblox Studio | Already done |

---

## 📊 The Bottom Line

**What we are deploying:**

A complete 41-module Roblox survival game with:
- **Real combat** — tap-to-attack melee, aim-assist ranged, dodge roll with i-frames, boss parry
- **19 weapons** across 6 rarity tiers, each with unique abilities
- **5 enemy types** with distinct behaviors + boss encounters every 11 days
- **99-day difficulty scaling** across 5 biomes
- **8-tier rarity system** (Common → RIZZLORD) powering every item
- **3 cosmetic categories** (pets, auras, skins) with dual aura system
- **2 currencies** with inflation-preventing sinks
- **5 game passes** (99-1,499 R$) + 16 developer products
- **Gacha with pity system** — 2 crate types, visible rates, Roblox-compliant
- **30-day Battle Pass** — 50 tiers, free + premium
- **50-level Prestige system** with permanent stacking bonuses
- **Weekly World Boss** — 500K HP, server-wide event, MVP system
- **Guild system** — 10 levels, cooperative quests, perks
- **Player trading** with tax sink + auction house
- **Daily rewards, referrals, challenges, leaderboards, Elo ranking**
- **Anti-cheat** — server-authoritative, anomaly detection, exploit protection
- **Dual-channel analytics** — 50+ event types tracking everything
- **2-RemoteEvent architecture** — minimal network overhead
- **Mobile-first** — runs on $50 phones at 30fps

**107+ design documents and code files** in the vault.
**30 modules ready to deploy. 11 need Copilot work.**

Built to hook. Built to retain. Built to **MONETIZE.**

**Launch status: 🔴 COMBAT RECODE → THEN GO.**
