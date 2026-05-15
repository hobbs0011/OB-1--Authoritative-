# STAGE 18 — First Limited-Time Event: Brainrot Mutation Invasion

**Train 6-7: Survival English**  
**Pipeline Stage:** 18 of 20  
**Type:** Design Specification  
**Status:** COMPLETE  
**Gospel 444 Palette:** Purple #a855f7 | Gold #f59e0b | Dark #0f0f1a | Blue = FORBIDDEN

---

## 1. Event Overview

**Name:** Brainrot Mutation Invasion  
**Duration:** 14 days (2 weeks)  
**Theme:** A mysterious mutation wave has created hyper-evolved Brainrot enemies. Players must survive the invasion, defeat mutant bosses, and earn exclusive rewards before time runs out.

**Revenue Impact:** 9/10 top-earning Roblox games use limited-time events. They generate the highest revenue per day of any game mechanic due to FOMO + exclusive content.

---

## 2. Event Mechanics

### 2.1 Mutant Enemies
- **Mutant Skibidi** — faster, glowing purple, drops Mutation Tokens
- **Mutant Sigma** — larger, golden aura, mini-boss HP, drops 3x tokens
- **Mutant Brainrot Hydra** — event raid boss, spawns 3x per day at set times
- All mutant enemies have Gospel 444 color palette (purple glow, gold drops)

### 2.2 Mutation Tokens (Event Currency)
- Earned ONLY during the event
- Cannot be traded
- Expire when event ends (FOMO pressure)
- Spent at the Event Shop

### 2.3 Event Token Earn Rates
| Source | Tokens |
|--------|--------|
| Kill Mutant Skibidi | 1 |
| Kill Mutant Sigma | 5 |
| Defeat Hydra Boss | 50 |
| Daily Event Challenge | 20 |
| English Power-Up (correct answer during event) | 3 |
| 10-minute survival streak | 10 |

---

## 3. Event Shop

| Item | Cost | Rarity | Notes |
|------|------|--------|-------|
| Mutation Aura (purple/gold swirl) | 500 tokens | Epic | Event-exclusive, never returns |
| Mutant Brainrot Pet | 300 tokens | Rare | Tradeable after event |
| Hydra Slayer Skin | 750 tokens | Legendary | Event-exclusive |
| Mutation Kill Effect | 200 tokens | Rare | Bodies dissolve in purple mist |
| Event Crate (exclusive pool) | 100 tokens | Variable | Contains event-only cosmetics |
| 2x XP Boost (1 hour) | 50 tokens | N/A | Stackable |
| 1,000 Survival Coins | 30 tokens | N/A | Basic conversion |
| 25 Brainrot Gems | 75 tokens | N/A | Premium conversion |

### 3.1 Exclusive Gacha Pool
Event Crates have a SEPARATE drop table from standard crates:

| Rarity | Drop Rate | Examples |
|--------|-----------|----------|
| Uncommon | 40% | Mutant Skin Variant |
| Rare | 30% | Mutant Pet Variant |
| Epic | 20% | Mutation Aura Variant |
| Legendary | 8% | Hydra King Pet |
| Mythic | 2% | ??? (Secret — discovered by community) |

Pity counter: guaranteed Legendary at 25 pulls (lower than standard to encourage spending).

---

## 4. Event Progression

### 4.1 Personal Event Pass (Free)
10-tier mini-pass running alongside the regular Battle Pass:

| Tier | Requirement | Reward |
|------|-------------|--------|
| 1 | Earn 50 tokens | 100 Survival Coins |
| 2 | Kill 10 mutants | Event Nameplate |
| 3 | Earn 150 tokens | 10 Brainrot Gems |
| 4 | Survive 10 min in mutation zone | Event Trail Effect |
| 5 | Earn 300 tokens | Event Crate x1 |
| 6 | Answer 20 English questions | Word Warrior Event Badge |
| 7 | Earn 500 tokens | Mutant Brainrot Pet (alternate color) |
| 8 | Defeat Hydra 3 times | 50 Brainrot Gems |
| 9 | Earn 750 tokens | Event Crate x3 |
| 10 | Earn 1,000 tokens | Mutation Invasion Title + Legendary Crate |

### 4.2 Community Goal
Server-wide collective target:
- **Kill 1,000,000 mutants** across all servers
- Progress shown on event UI dashboard
- If reached: ALL players get exclusive "Mutation Survivor" aura
- Creates shared purpose + social media buzz

---

## 5. Boss Raid: Mutant Brainrot Hydra

### 5.1 Spawn Schedule
- Spawns 3x per day at fixed times (appointment gaming)
- Times: 10:00 AM, 4:00 PM, 10:00 PM (server local time, staggered across regions)
- Boss persists for 30 minutes or until defeated
- Max 20 players per boss instance

### 5.2 Boss Mechanics
- **3 Phases:** Each phase a head grows back stronger
- **Phase 1 (100-66% HP):** Basic attacks, spawns Mutant Skibidi adds
- **Phase 2 (66-33% HP):** AoE poison zones, spawns Mutant Sigma adds
- **Phase 3 (33-0% HP):** Enrage mode, faster attacks, screen effects
- **English Challenge Phase:** Between phases, players answer English questions to charge a "weakness beam" that deals massive damage. More correct answers = more damage. Mouse → Tiger in action.

### 5.3 Loot Distribution
- All participants who dealt damage get base rewards (50 tokens)
- Top 3 DPS get bonus rewards (extra 25 tokens each)
- MVP (most damage) gets guaranteed Rare+ from event crate
- Random legendary drop chance for all participants (5%)

---

## 6. Monetization Angles

| Revenue Source | Mechanism |
|----------------|----------|
| Event Crate purchases (Robux) | Direct purchase of Event Crates (149R$ each) |
| Token Boost Pass (199R$) | 2x token earn rate for event duration |
| Event Battle Pass upgrade (Premium track additions) | Extra tiers with exclusive rewards |
| Gem purchases for token conversion | Gems → tokens at Event Shop |
| FOMO on exclusive items | Items NEVER return — drives urgency |

### 6.1 FOMO Framework
- Countdown timer always visible on event UI
- "X players own this item" counter on rare items
- Daily event challenges rotate (miss a day = miss rewards)
- Community goal progress creates time pressure
- Final 48 hours: bonus token rate (2x) to drive last-minute spending

---

## 7. Technical Implementation

### 7.1 Server Architecture
```
EventManager.lua (Server)
├── MutantSpawner — spawns event enemies on schedule
├── HydraBoss — raid boss controller
├── EventShop — token → reward transactions
├── EventPass — 10-tier progression tracking
├── CommunityGoal — cross-server kill counter
└── EventCrate — separate gacha pool with event items
```

### 7.2 Cross-Server Communication
- Community kill counter uses MessagingService
- Each server reports kills every 60 seconds
- Central DataStore aggregates total
- UI polls every 30 seconds for display update

### 7.3 Event Toggle
- Event activation controlled by server flag in DataStore
- Can be enabled/disabled remotely without code update
- Event assets loaded on-demand (don't bloat non-event servers)

---

## 8. Marketing & Launch

1. **Tease:** 3 days before event, show mysterious purple rifts in the sky
2. **Launch:** Event UI appears, event enemies start spawning, shop opens
3. **Mid-event:** Community goal progress milestone announcements
4. **Final 48h:** "Last Chance" messaging, 2x token bonus
5. **Post-event:** Event enemies disappear, shop closes, flex your exclusives

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| DAU during event | 2x normal |
| Revenue during event | 3x normal |
| Event crate purchases | 15% of active players |
| Community goal completion | Yes |
| D7 retention for event joiners | 25%+ |
| Social media posts about event | 100+ |
