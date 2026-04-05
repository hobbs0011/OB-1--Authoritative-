# SURVIVE A BRAINROT — Combat Replacement Specification v1

> **Generated:** 2026-03-28 | **Pipeline:** 20-Stage Combat Market Research | **Status:** COMPLETE
> **Notion source:** 20-Stage Pipeline page | **Artifact class:** 🔨 BUILD

---

## MISSION

Replace the ESL quiz combat system with PROVEN money-making combat mechanics.
Every design decision backed by research from top-earning Roblox games.

**Game:** Survive a Brainrot
**Genre:** Wave Zombie Survival × Brainrot Meme IP
**References:** Dead Rails + Survive Wave Z + Combat Warriors + Steal a Brainrot monetization
**Platform:** Roblox, 70%+ mobile, target device = $100 Android phone
**Launch:** NOW

---

## THE CORE LOOP

```
Wave Start → Zombies Spawn → Kill (tap/shoot) → Coins Drop → Wave End
→ Shop Phase (upgrade weapons, buy items, open crates) → Next Wave (harder)
→ Boss every 11 days → Day 99 = Final Boss → Rebirth (reset + multiplier)
```

---

## INPUT MODEL

| Input | Method | Reference |
|-------|--------|-----------|
| Movement | Virtual joystick (left thumb) | Roblox default |
| Camera | Drag to look (right thumb) | Third-person over-shoulder |
| Melee attack | Tap attack button | Combat Warriors model |
| Ranged attack | Hold aim + tap shoot | RIVALS mobile (aim-assisted) |
| Dodge | Tap dodge button | 0.5s i-frame roll (Combat Warriors E-dodge) |
| Ability | Tap ability button | One special per weapon (cooldown) |
| Interact | Tap interact button | Pick up drops, shops, doors |

**Max on-screen buttons:** 4 action (Attack, Dodge, Ability, Interact) + weapon swap
**Camera:** Third-person over-shoulder + shift-lock toggle for combat focus

---

## WEAPON TYPES

| Type | Range | Speed | Damage | Best For |
|------|-------|-------|--------|----------|
| **Melee** (bats, swords, fists) | Close | Fast | Medium | Crowd control, early game |
| **Ranged** (guns, bows) | Long | Medium | High | Boss damage, safe play |
| **Throwable** (molotovs, grenades) | Medium | Slow | AoE | Wave clear, area denial |
| **Special** (brainrot weapons) | Varies | Varies | Very High | Flex + power, gacha/earned |

---

## RARITY TIERS

| Tier | Color | Drop Rate | Power |
|------|-------|-----------|-------|
| ⚪ Common | Gray | 45% | 1.0x |
| 🟢 Uncommon | Green | 30% | 1.3x |
| 🔵 Rare | Blue | 15% | 1.6x |
| 🟣 Epic | Purple | 7% | 2.0x |
| 🟠 Legendary | Orange | 2.5% | 2.5x |
| 🔴 RIZZLORD | Red + glow + aura | 0.5% | 3.0x + unique ability |

---

## MELEE WEAPONS

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

## RANGED WEAPONS

| Weapon | Rarity | DMG | Fire Rate | Ability | How to Get |
|--------|--------|-----|-----------|---------|------------|
| Slingshot | ⚪ Common | 8 | Slow | None | Starter |
| 9mm Pistol | ⚪ Common | 12 | Medium | None | Day 3 shop |
| Shotgun | 🟢 Uncommon | 25 | Slow | Spread (close AoE) | Day 10+ shop |
| AR-15 | 🔵 Rare | 15 | Fast | Burst fire (3 shots) | Crate / Day 25+ |
| Sniper | 🟣 Epic | 60 | Very Slow | Headshot (2x crit) | Crate / Boss drop |
| Ohio Cannon | 🟠 Legendary | 50 | Slow | Explosion radius + knockback | Gacha only |
| **Rizz Ray** | 🔴 RIZZLORD | 40 | Medium | Charm beam — zombies fight each other 5s | 0.5% gacha / Day 99 boss |

## THROWABLES

| Item | Rarity | DMG | Effect | How to Get |
|------|--------|-----|--------|------------|
| Rock | ⚪ Common | 5 | Stagger | Free (ground pickup) |
| Molotov | 🟢 Uncommon | 15/sec | Fire zone (3s) | Shop / crate |
| Frag Grenade | 🔵 Rare | 40 | Explosion AoE | Shop / crate |
| Brainrot Bomb | 🟣 Epic | 30 | Confuse — zombies wander 5s | Crate only |

---

## COMBO SYSTEM (SIMPLE)

- **Melee:** Tap-tap-tap = 3-hit combo. Third hit = knockback. That's it.
- **No complex input combos.** Kids on $100 phones. Blade Ball simple.
- **Combo counter UI** rewards consecutive kills without damage ("5x COMBO! 10x COMBO!")
- **Combo multiplier** on coin drops — more combo = more coins = aggressive play incentive

---

## DODGE / PARRY

- **Dodge (all):** Tap dodge = roll with 0.5s i-frames. 3s cooldown.
- **Parry (boss fights only):** Boss telegraphs heavy attack → tap dodge at exact moment = parry → 3s stun window → damage phase. Miss = knocked back. (Combat Warriors F-key parry model)
- **No block.** Blocking is passive. Dodge is active and fun.

---

## DIFFICULTY SCALING (99 DAYS)

| Phase | Days | Zombies | Weapons | Monetization Trigger |
|-------|------|---------|---------|---------------------|
| Tutorial | 1–5 | Slow walkers, 1-2 hit | Starter bat + pistol | None — hook player |
| Early | 6–15 | Faster, some runners | Tier 1 melee + ranged | First crate Day 10 |
| Mid | 16–30 | Armored, spitters | Tier 2 + first special | 🔴 Day 15 spike |
| Hard | 31–50 | Brutes, mini-bosses | Tier 3 + throwables | 🔴 Day 30 spike |
| Hell | 51–75 | Mutants, night specials | Tier 4 + abilities | 🔴 Day 50 spike |
| Endgame | 76–99 | Max density, elite mutations | All tiers + RIZZLORD | 🔴 Day 75 + Day 99 Final Boss |

---

## BOSS FIGHTS (Day 11, 22, 33, 44, 55, 66, 77, 88, 99)

- **Telegraphed attacks:** 1.5s wind-up → AoE slam/charge/projectile
- **Dodge or parry:** Player dodges or parries for stun window
- **Damage phase:** 3s window while boss stunned/recovering
- **Enrage timer:** Boss strengthens over time — can't kite forever
- **Team scaling:** HP scales with player count
- **Exclusive drops:** Boss weapons/cosmetics only from kills. Gacha spin after kill.
- **Day 99 Final Boss:** Multi-phase, all weapon types, ultimate RIZZLORD drop

---

## COMBAT FEEL (MANDATORY JUICE)

1. Screen shake on every hit (camera offset, FREE)
2. Hit flash on enemy (white/red 1 frame, FREE)
3. Knockback on melee hits (velocity, FREE)
4. Floating damage numbers (BillboardGui, LOW)
5. Hit sound per weapon type (audio, FREE)
6. Kill dissolve effect (particle burst, LOW)
7. Combo counter UI ("5x COMBO!", LOW)
8. Haptic vibration on mobile (HapticService, FREE)

**Rule: < 100ms tap-to-feedback. Client-side prediction. Server validates.**

---

## PERFORMANCE BUDGET ($100 Android)

| Element | Budget | Method |
|---------|--------|--------|
| Max enemies on screen | 8–12 | Queue overflow off-screen |
| Particle effects | 2-3 per hit max | Pre-baked > real-time |
| Shadows | OFF on mobile | #1 FPS killer |
| Part count (combat) | < 500 active | MeshParts, no unions |
| Combat VFX | BillboardGui + flash | Not 3D objects |
| Animations | 15 FPS acceptable | Keep simple |
| Network | Client hit + server validate | All top games do this |
| Hitboxes | Raycast / GetPartsInPart | Never .Touched() |
| Streaming | StreamingEnabled ON | Load nearby only |

---

## MONETIZATION MODEL

### 3-Layer Stack
- **Layer 1 (70%): Cosmetic** — weapon skins, kill effects, trails, emotes, auras
- **Layer 2 (20%): Soft power** — game passes +10-20% damage, extra revive, faster reload
- **Layer 3 (10%): Convenience** — inventory slots, auto-collect, XP boosts

### Revenue Mechanics
| Mechanic | Reference | Implementation |
|----------|-----------|----------------|
| Weapon gacha/crates | Steal a Brainrot ($90M+) | Randomized rarity crates (Common→RIZZLORD) |
| Frustration-to-purchase | All top earners | Difficulty spikes at Day 15, 30, 50, 75 |
| FOMO events | Steal a Brainrot hourly events | Hourly mutation spawns, seasonal crates |
| Battle Pass | RIVALS, Fortnite model | Free + premium track, combat challenges |
| Social pressure | Blox Fruits crews | Guild competitions, leaderboards |
| Near-miss gambling | Grow a Garden | "Almost got RIZZLORD" gacha psychology |

### Monetization Calendar
- **Hourly:** Mutation events (rare zombie spawns)
- **Daily:** Login reward, daily challenge
- **Weekly:** World Boss, Guild Quest reset
- **Monthly:** Battle Pass season, crate rotation
- **Quarterly:** Major content update

---

## MODULE RECODE CHECKLIST

### 🔴 REPLACE ENTIRELY (5 modules, ~21h)

| Module | Current | Replacement | Hours |
|--------|---------|-------------|-------|
| CombatSystem.lua | ESL quiz combat | Real melee + ranged + dodge + parry | 8h |
| QuestionBankV1.lua | English vocab | WeaponData.lua (weapon stats) | 3h |
| QuestionBankV2.lua | English grammar | EnemyData.lua (zombie types) | 3h |
| EnglishRewardsManager.lua | ESL rewards | CombatRewardsManager.lua | 4h |
| DifficultyTiers.lua | ESL levels | DayScaling.lua (99-day curve) | 3h |

### 🟡 SURGERY (6 modules, ~18h)

| Module | Surgery | Hours |
|--------|---------|-------|
| WaveManager.lua | Rewire to kill-count triggers | 4h |
| WorldBoss.lua | Telegraph + dodge/parry boss spec | 5h |
| EconomyManager.lua | Combat kill rewards + combo | 3h |
| BattlePass.lua | Combat challenge templates | 2h |
| GuildManager.lua | Combat quest goals | 2h |
| CosmeticController.lua | Combat milestone unlocks | 2h |

### 🟢 CLEAN (30 modules — no changes)

UI, Core systems, Economy, Social, World, Audio, Network, Misc — all ESL-free.

### PRIORITY ORDER
1. CombatSystem.lua
2. WeaponData.lua + EnemyData.lua
3. CombatRewardsManager.lua
4. DayScaling.lua
5. WaveManager.lua surgery
6. WorldBoss.lua surgery
7. EconomyManager.lua surgery
8. BattlePass.lua surgery
9. GuildManager.lua + CosmeticController.lua surgery

**Total: ~39h Copilot time, ~12-15h wall clock with parallel agents**

---

## RESEARCH BACKING (Stages 1-16 Summary)

### Top Earner Intelligence
- Roblox: 126.5M DAU, $6.8B bookings, 70%+ mobile
- 11 combat-revenue games analyzed across 4 genre clusters
- Direct comps: Dead Rails, Survive Wave Z, 99 Nights
- Brainrot IP proven: Steal a Brainrot = $90M+

### Combat Mechanics Mined
- Blox Fruits: 12 fighting styles, combo stun system, power progression
- RIVALS: Auto-aim on mobile, cosmetic-only monetization
- Combat Warriors: Parry (F key, 0.5s window, miss=1.5s stun, hit=3s stun)
- Blade Ball: One mechanic, extreme simplicity = virality
- Dead Rails: Class-based co-op zombie survival, our #1 reference
- Survive Wave Z: Kill→coins→upgrade→harder wave, THE loop we need

### Mobile Engineering
- Tap-to-attack = primary melee (most responsive on low-end)
- Virtual joystick + aim-assist = primary ranged
- Max 4 action buttons on screen
- $100 Android budget: 8-12 enemies, shadows OFF, < 500 parts, StreamingEnabled

### Monetization Mapping
- 3-layer stack: 70% cosmetic, 20% soft power, 10% convenience
- Frustration-to-purchase pipeline at Day 15/30/50/75
- Casino mechanics from Steal a Brainrot: gacha, FOMO, near-miss
- Event calendar: hourly mutations through quarterly content drops

---

## DEFINITION OF DONE

A player can:
- ✅ Tap to attack zombies with melee weapons
- ✅ Aim and shoot with ranged weapons (auto-aim assist on mobile)
- ✅ Dodge roll with i-frames
- ✅ Parry boss telegraphed attacks for stun windows
- ✅ Progress through 99 days of increasing difficulty
- ✅ Fight bosses every 11 days
- ✅ Open weapon crates with gacha mechanics
- ✅ Earn and equip weapons from Common to RIZZLORD
- ✅ Use weapon abilities on cooldown
- ✅ See screen shake, damage numbers, kill effects (combat juice)
- ✅ Play on a $100 Android phone at acceptable FPS
- ✅ **ZERO English/ESL references anywhere in the game**

---

*This spec was generated from a 20-stage market research pipeline analyzing the top-earning Roblox games of 2025-2026. Every mechanic is backed by proof from games already earning millions.*
