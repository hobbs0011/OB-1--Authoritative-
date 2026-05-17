# RNG Mutation System — Implementation Spec
> Train-67 | Created: 2026-03-28 | Status: READY FOR COPILOT
> Priority: 🔴 BEFORE LAUNCH | Pipeline Stage: 2

## PURPOSE
Inject deep RNG into every loot drop, weapon upgrade, and world event. This is the #1 revenue driver based on top earner analysis (Grow a Garden mutations, Blox Fruits fruit spawns, Fisch rare catches). Every zombie kill, every chest, every boss is a slot machine.

## RARITY TIERS

| Tier | Color | Drop Rate (base) | Trading Value Multiplier | Visual Effect |
|------|-------|-------------------|--------------------------|---------------|
| Common | White | 60% | 1x | None |
| Uncommon | Green | 25% | 3x | Faint glow |
| Rare | Blue | 10% | 10x | Pulsing glow |
| Epic | Purple | 3.5% | 50x | Particle trail |
| Legendary | Gold | 1.2% | 200x | Full aura + particles |
| Mythic | Red/Black | 0.28% | 1,000x | Screen flash on drop + unique SFX |
| SECRET | Rainbow/Glitch | 0.02% | 10,000x | Server-wide announcement + glitch effect |

**Total: 100%** — every kill drops SOMETHING. Players always feel rewarded.

## MUTATION SYSTEM

### Loot Mutations
Every dropped item has a secondary roll for MUTATION:
- **No Mutation:** 70%
- **Minor Mutation:** 20% — +10-25% stat boost, slight visual change
- **Major Mutation:** 8% — +25-75% stat boost, distinct visual (color shift, size change)
- **Cosmic Mutation:** 1.8% — +75-150% stat boost, unique particle effect, name prefix ("Cosmic Neon Katana")
- **Glitched Mutation:** 0.2% — +150-300% stat boost, glitch visual effect, extremely rare, server announcement

### Mutation Stacking
- Items can have BOTH a rarity tier AND a mutation
- A Legendary + Cosmic = insanely valuable
- A SECRET + Glitched = "holy grail" item, server goes crazy
- Trading value = rarity multiplier × mutation multiplier

### Mutation Multipliers for Trading
| Mutation | Value Multiplier |
|----------|-----------------|
| None | 1x |
| Minor | 2x |
| Major | 5x |
| Cosmic | 25x |
| Glitched | 100x |

**Example:** Legendary Katana (200x) + Cosmic (25x) = 5,000x base value

## BIOME-SPECIFIC DROPS

| Biome | Exclusive Drop | Drop Rate | Available |
|-------|---------------|-----------|-----------|
| Wasteland (Day 1-15) | Rusty Talisman set | 2% per kill | Always |
| Rusted City (Day 16-30) | Rust weapons | 1.5% per kill | Always |
| Toxic Swamp (Day 31-50) | Venomous set | 1% per kill | Always |
| Volcanic Rift (Day 51-75) | Infernal set | 0.8% per kill | Always |
| The Void (Day 76-99) | Void Crystal weapons | 0.5% per kill | Always |
| ANY biome | Brainrot drops | 0.1% per kill | Rotating weekly |

### Day-Specific Rare Spawns
- **Day 13:** "Unlucky" zombie spawns — drops cursed items (high power, visual debuff)
- **Day 33:** Triple mutation rate for 1 hour
- **Day 44:** Golden zombie horde — all drops guaranteed Rare+
- **Day 66:** Shadow zombie — drops exclusive shadow set (one piece per appearance)
- **Day 77:** Lucky 7s event — 7x mutation rate for 7 minutes
- **Day 99:** JACKPOT — guaranteed Mythic+ item, specific item is RNG

## HOURLY WORLD EVENTS

Every 60 minutes (server time), ONE of these spawns randomly:

| Event | Duration | What Happens | Exclusive Loot |
|-------|----------|-------------|----------------|
| **Meteor Strike** | 5 min | Meteor crashes in random biome. Mine it for materials. | Meteor Ore → craft Meteor weapons |
| **Golden Horde** | 3 min | 50 golden zombies spawn. All drops Rare+. | Golden Bones (crafting material) |
| **Treasure Car** | 10 min | Mystery train car appears at random depot. Loot inside. | Treasure Map fragments → full map = Mythic chest |
| **Mutation Storm** | 15 min | 5x mutation rate on all drops. | Storm Crystals (mutation reroll material) |
| **Boss Rush** | 8 min | Mini-boss gauntlet. 3 bosses in sequence. | Boss Tokens → exclusive Boss Shop items |
| **Brainrot Invasion** | 5 min | Meme zombies flood the server. Chaos. Fun. | Brainrot exclusive cosmetics |

**Key rule:** Events are announced 60 seconds before they start. Players who aren't online MISS IT. This trains daily logins.

## WEAPON MUTATION ON UPGRADE

When a player upgrades a weapon at the forge:
1. Pay coin cost
2. Weapon gains +1 level
3. **Mutation roll triggers:**
   - 85% — no mutation change
   - 10% — weapon gains Minor visual mutation
   - 4% — weapon gains Major visual mutation (color shift)
   - 0.9% — weapon gains Cosmic mutation (full visual overhaul + stat spike)
   - 0.1% — weapon gains Glitched mutation (screen effect, server announcement)

**A fully upgraded + Cosmic mutated weapon is the ultimate flex.** Players will spend THOUSANDS of Robux rerolling for this.

## MUTATION BOOST (GAME PASS INTERACTION)

- **Mutation Boost pass (499 R$):** +50% to all mutation rates
  - Glitched goes from 0.2% → 0.3%
  - Cosmic goes from 1.8% → 2.7%
  - This is a PERMANENT advantage that makes the pass extremely desirable
- **Mutation Reroll (150 R$ dev product):** Reroll the mutation on a dropped item. Keeps rarity, randomizes mutation tier.
  - Players chasing Cosmic/Glitched on a Legendary will buy dozens of these
  - Average rerolls to hit Cosmic: ~56. That's 8,400 R$ average spend.

## PITY SYSTEM

To prevent rage-quit:
- After 200 kills with no Epic+ drop → next kill guaranteed Epic
- After 500 kills with no Legendary+ → next kill guaranteed Legendary  
- After 2,000 kills with no Mythic → next kill guaranteed Mythic
- SECRET has NO pity. It stays rare. Forever.

**Pity counter resets on ANY drop at or above the threshold tier.**

## LUA MODULE MAPPING

| Existing Module | Action | New Module |
|----------------|--------|------------|
| `QuestionBankV1` | **REPLACE** | `WeaponDataManager` — stores all weapon stats, rarity tiers, mutation tables |
| `QuestionBankV2` | **REPLACE** | `EnemyDropTableManager` — stores all enemy drop tables, biome modifiers, day modifiers |
| `EnglishRewardsManager` | **REPLACE** | `LootMutationEngine` — handles all mutation rolls, pity tracking, boost calculations |
| `DifficultyTiers` | **REPLACE** | `DayScalingManager` — manages day-specific events, drop rate scaling, difficulty curve |
| `CombatSystem` (partial) | **SURGERY** | Add mutation roll on kill, integrate with LootMutationEngine |

## REMOTE EVENTS

```lua
-- Server → Client
LootDropped:FireClient(player, {
    itemId = string,
    rarity = "Legendary",
    mutation = "Cosmic",
    visualEffect = "cosmic_glow",
    tradingValue = 5000,
    isServerAnnouncement = false
})

-- Server → All Clients (rare drops)
ServerAnnouncement:FireAllClients({
    type = "RARE_DROP",
    playerName = string,
    itemName = "Glitched Mythic Neon Katana",
    rarity = "Mythic",
    mutation = "Glitched"
})

-- World Event
WorldEventStart:FireAllClients({
    eventType = "METEOR_STRIKE",
    biome = "Wasteland",
    duration = 300,
    position = Vector3
})
```

## TESTING CHECKLIST

- [ ] All 7 rarity tiers drop at correct rates (10,000 kill sample)
- [ ] All 5 mutation tiers roll at correct rates
- [ ] Biome-specific drops only drop in correct biome
- [ ] Day-specific events trigger on correct days
- [ ] Hourly events spawn correctly and rotate
- [ ] Pity system triggers at correct thresholds
- [ ] Mutation Boost pass correctly modifies rates
- [ ] Mutation Reroll correctly randomizes mutation only
- [ ] Server announcements fire for SECRET and Glitched drops
- [ ] Trading value calculates correctly (rarity × mutation)
- [ ] Mobile performance: mutation visual effects don't drop FPS below 30
