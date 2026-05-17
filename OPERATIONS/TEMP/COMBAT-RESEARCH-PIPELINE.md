# 20-Stage Combat Mechanics Market Research Pipeline — Roblox Top Earners

> **Generated:** 2026-03-28 | **Status:** 20/20 COMPLETE | **Artifact class:** 🏦 VAULT
> **Purpose:** Research backing for Survive a Brainrot combat replacement spec

---

## Pipeline Structure

| Squad | Stages | Focus | Status |
|-------|--------|-------|--------|
| 🔴 ALPHA | 1–4 | Revenue Intelligence | ✅ COMPLETE |
| 🟠 BRAVO | 5–8 | Combat Mechanics Deep Dive | ✅ COMPLETE |
| 🟡 CHARLIE | 9–12 | Mobile-First Combat Engineering | ✅ COMPLETE |
| 🟢 DELTA | 13–16 | Combat-to-Money Pipeline | ✅ COMPLETE |
| 🟣 ECHO | 17–20 | Combat System Architecture | ✅ COMPLETE |

---

## ALPHA — Revenue Intelligence

### Stage 1: Top 20 Earning Games Inventory

| Rank | Game | Genre | DAU | Combat? |
|------|------|-------|-----|---------|
| 1 | RIVALS | FPS | 408K | ✅ Core |
| 2 | Steal a Brainrot | Tycoon/Steal | 299K | ❌ |
| 3 | Adopt Me! | Roleplay | 524K | ❌ |
| 4 | Blox Fruits | Anime Combat | 310K | ✅ Core |
| 5 | Escape Tsunami For Brainrots | Obby/Survival | 175K | ❌ |
| 6 | Grow a Garden | Idle/Farming | High | ❌ |
| 7 | Blade Ball | PvP Arena | 80-200K | ✅ Timing |
| 8 | Combat Warriors | PvP Melee | ~50K | ✅ Core |
| 9 | Pet Simulator 99 | Simulator | High | ❌ |
| 10 | Arsenal | FPS | ~40K | ✅ Core |
| 11 | Da Hood | PvP Brawler | ~60K | ✅ Core |
| 12 | Dead Rails | Co-op Zombie Survival | High | ✅ Core |
| 13 | Anime Defenders | Tower Defense | High | ⚡ Hybrid |
| 14 | Survive Wave Z | Wave Survival | Medium | ✅ Core |
| 15 | The Strongest Battlegrounds | Anime PvP | ~80K | ✅ Core |
| 16 | Slap Battles | PvP Arena | ~50K | ✅ |
| 17 | Brookhaven | Roleplay | High | ❌ |
| 18 | Jailbreak | Action/Crime | ~30K | ⚡ Hybrid |
| 19 | Fisch | Simulator | High | ❌ |
| 20 | Ink Game | Action | ~15K | ⚡ Hybrid |

**Platform stats:** Roblox 126.5M DAU, $6.8B bookings (+55% YoY), $4.9B revenue (+36% YoY), 123.8B hours played (+69% YoY). 70%+ mobile. 50M DAU under 13.

### Stage 2: Combat Games Filter
11 combat-revenue games isolated: RIVALS, Blox Fruits, Dead Rails, Blade Ball, The Strongest Battlegrounds, Combat Warriors, Da Hood, Arsenal, Slap Battles, Survive Wave Z, Anime Defenders.

### Stage 3: Genre Clustering

| Cluster | Games | Revenue | Relevance |
|---------|-------|---------|-----------|
| 🎯 Survival Wave | Dead Rails, Survive Wave Z, 99 Nights | HIGH | 🔴 DIRECT |
| ⚔️ PvP Arena/Melee | Combat Warriors, Da Hood, Blade Ball, Slap Battles, TSB | HIGH | 🟡 Steal mechanics |
| 🔫 FPS | RIVALS, Arsenal | VERY HIGH | 🟡 Input model |
| 🐉 Anime Combat | Blox Fruits, Anime Defenders | VERY HIGH | 🟡 Ability system |

### Stage 4: Brainrot Market Position
- Direct comps: Dead Rails, Survive Wave Z, 99 Nights in the Forest
- Our angle: Brainrot meme IP × 99-day survival × full monetization stack
- "Steal a Brainrot" proves brainrot IP = $90M+
- 3 pillars of top earners: Customization, Social interaction, Accessibility

---

## BRAVO — Combat Mechanics Deep Dive

### Stage 5: Blox Fruits
- 12 fighting styles, 3 weapon types, Devil Fruits with 4-5 moves each
- Damage calc: base × amplification - reduction
- Instinct auto-dodge, Bounty/Honor ranking, stun-combo core mechanic
- Mobile: virtual buttons for abilities, tap/hold attack, joystick movement
- **Steal:** Power progression model, combo concept. NOT the complexity.

### Stage 6: RIVALS / Arsenal
- RIVALS: #1 earner, auto-aim assist on mobile, fast rounds, cosmetic-only monetization
- Arsenal: gun game format, simpler, casual, mobile-friendly
- **Steal:** Auto-aim for ranged, fast kill feedback, cosmetic-only skins. NOT FPS camera.

### Stage 7: Survival Wave Games
- **Dead Rails:** Classes (Arsonist, Demolitionist, Werewolf, Vampire, Cowboy, Milkman, High Roller), guns + melee + throwables, day/night cycle, resource management, team dynamics
- **Survive Wave Z:** WASD + mouse, kill→coins→upgrade→defend→harder wave, team-based, weapon tiers
- **THE LOOP:** Wave→Kill→Coins→Shop→Harder Wave→Boss→Repeat→Day 99

### Stage 8: PvP Arena / Fighting Games
- **Combat Warriors:** Parry (F key, 0.5s window, miss=1.5s self-stun, hit=3s enemy stun), Roll/Dash (E, i-frames), Stomp (Q), Glory Kill (G), Slide (Shift+C), weapon skills at 400+ damage
- **Blade Ball:** ONE mechanic (tap to deflect), miss=eliminated, abilities purchasable. 80-200K players on simplicity.
- **Da Hood:** Click punch, combo chains, ragdoll physics
- **TSB:** Anime abilities, combo-based, flashy VFX
- **Steal for bosses:** Parry window, simplicity, dodge roll, glory kill finisher

---

## CHARLIE — Mobile-First Combat Engineering

### Stage 9: Mobile Input Patterns
- Tap-to-attack = PRIMARY melee (Combat Warriors, Blade Ball)
- Virtual joystick + aim button = PRIMARY ranged (Survive Wave Z, Dead Rails)
- Auto-aim assist = ADD for ranged (RIVALS mobile)
- Max 4 action buttons: Attack, Ability, Dodge, Interact

### Stage 10: Low-Compute Combat Design
- Target: $100 Android (2GB RAM, low-end GPU) — Thailand, Indonesia, Philippines, Vietnam
- 8-12 zombies max, shadows OFF, <500 parts, StreamingEnabled ON
- Raycast/GetPartsInPart hitboxes (never .Touched), client prediction + server validation
- Pre-baked animations > real-time particles, BillboardGui damage numbers

### Stage 11: Combat Feel on Mobile
- Screen shake (FREE), hit flash (FREE), knockback (FREE) = CRITICAL
- Damage numbers (LOW), hit sound (FREE), kill effect (LOW) = HIGH
- Combo counter (LOW), haptic vibration (FREE) = NICE
- Rule: < 100ms tap-to-feedback via client-side prediction

### Stage 12: Camera & Controls
- Third-person over-shoulder (Roblox default) + shift-lock toggle
- Standard layout: left joystick, right camera drag, bottom-right action buttons
- Zero learning curve = Roblox default patterns

---

## DELTA — Combat-to-Money Pipeline

### Stage 13: Weapon Monetization
- Layer 1: Gacha crates (Robux → randomized rarity). Casino for kids. Steal a Brainrot = $90M+.
- Layer 2: Cosmetic skins (pure flex, no gameplay advantage). RIVALS model.
- Layer 3: Soft power (game passes +10-20%). Enough to feel, not enough to break.

### Stage 14: Frustration-to-Purchase Pipeline
- "I keep dying" → revive tokens (difficulty spikes Day 15/30/50/75)
- "I want to flex" → weapon skins, kill effects (see other player's rare skin)
- "I want stronger" → game pass, weapon upgrade (hit difficulty wall)
- "Don't want to wait" → speed boost, skip timer
- "Friend is ahead" → XP boost, catch-up pack
- "Almost got rare one" → another gacha spin, luck boost

### Stage 15: Power Progression vs Cosmetic
- Hybrid (power + cosmetic) = HIGHEST revenue + retention (Blox Fruits)
- Our model: 70% cosmetic, 20% soft power, 10% convenience
- PvE reduces P2W complaints (fighting AI, not players)

### Stage 16: Event Monetization
- Limited-time bosses (exclusive drops, FOMO)
- Seasonal weapon crates (time-limited gacha)
- Battle Pass (free + premium track)
- Guild competitions (social pressure)
- Leaderboard seasons
- Live events (dev-hosted, exclusive drops)
- Calendar: hourly mutations, daily challenges, weekly bosses, monthly seasons, quarterly content

---

## ECHO — Combat System Architecture

### Stage 17: Combat Spec v1
See `COMBAT-REPLACEMENT-SPEC.md` for full spec. Covers:
- Core loop, input model, weapon types, combo system, dodge/parry
- 6-phase difficulty scaling (Day 1-99), boss fights every 11 days
- Combat feel (8 mandatory juice effects), performance budget

### Stage 18: Weapon & Ability Inventory
See `COMBAT-REPLACEMENT-SPEC.md` for full tables. Covers:
- 6 rarity tiers (Common → RIZZLORD)
- 8 melee weapons, 7 ranged weapons, 4 throwables
- Ability system (Rare+ weapons, cooldown 8-20s by rarity)

### Stage 19: Recode Impact Assessment
- 🔴 5 modules REPLACE (~21h): CombatSystem, QuestionBankV1/V2, EnglishRewardsManager, DifficultyTiers
- 🟡 6 modules SURGERY (~18h): WaveManager, EconomyManager, BattlePass, WorldBoss, GuildManager, CosmeticController
- 🟢 30 modules CLEAN: no changes needed
- Total: ~39h Copilot time, ~12-15h wall clock parallel

### Stage 20: Final Combat Replacement Spec
Consolidated in `COMBAT-REPLACEMENT-SPEC.md` — the single document Copilot uses to recode.

---

*Research completed 2026-03-28. Every design decision backed by proof from top-earning Roblox games.*
