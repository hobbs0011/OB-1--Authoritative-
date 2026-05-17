# 🎮 ROBLOX STRATEGY — CONSOLIDATED MASTER DOCUMENT

**Game:** Survive a Brainrot
**Genre:** Wave Zombie Survival × Brainrot Meme IP
**References:** Dead Rails + Survive Wave Z + Combat Warriors + Steal a Brainrot monetization
**Account:** PhoenixRisingGames
**Brand:** Natural English Training (users never see Phoenix Rising)
**Framework:** 20×20×20×20 (Classes × Weapons × Enemies × Bosses)
**Palette:** Gospel 444 — Purple #a855f7 / Gold #f59e0b / Dark #0f0f1a / **NO BLUE EVER**
**Architecture:** 41-module server-authoritative system, anti-cheat hardened
**Deadline:** 🔴 NOW — Launch immediately
**Status:** Combat recode in progress per 20-stage market research pipeline. See COMBAT-REPLACEMENT-SPEC.md.

---

## ⚠️ COMBAT RECODE STATUS

**The original codebase was built with ESL quiz combat mechanics. This is being COMPLETELY REPLACED with real combat:**
- Tap-to-attack melee + aim-assist ranged + dodge roll + boss parry
- 19 weapons across 6 rarity tiers (Common → RIZZLORD)
- 99-day difficulty scaling with bosses every 11 days
- See `COMBAT-REPLACEMENT-SPEC.md` for the full replacement spec
- See `COMBAT-RESEARCH-PIPELINE.md` for the 20-stage market research backing every decision

**Modules being replaced:** CombatSystem, QuestionBankV1, QuestionBankV2, EnglishRewardsManager, DifficultyTiers
**Modules getting surgery:** WaveManager, EconomyManager, BattlePass, WorldBoss, GuildManager, CosmeticController
**30 modules are clean** — no changes needed

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Game Design](#2-game-design)
3. [Market Intelligence](#3-market-intelligence)
4. [Technical Architecture](#4-technical-architecture)
5. [Code Inventory (41 Modules)](#5-code-inventory)
6. [Documentation Inventory (32 Specs)](#6-documentation-inventory)
7. [Monetization Strategy](#7-monetization-strategy)
8. [Launch Pipeline](#8-launch-pipeline)
9. [Battle Reports (16 Tests)](#9-battle-reports)
10. [Open Items & Blockers](#11-open-items--blockers)
11. [File Map](#12-file-map)

---

## 1. EXECUTIVE SUMMARY

**One sentence:** A 5-player co-op wave zombie survival game on Roblox — a mix of Dead Rails and Survive Wave Z, built on the Brainrot meme that is currently meta, designed for the lowest compute phones, built to MONETIZE.

**Core thesis:** Brainrot meme IP is proven ($90M+ from Steal a Brainrot alone). Wave survival is a proven genre. We combine them with a 7-pillar monetization system modeled after the top 10 Roblox earners.

**What exists right now:**
- 41 hardened Lua modules (~750KB+ total code) — ALL server-authoritative
- 32 detailed spec documents covering every system
- 16 battle test reports (simulation, stress test, penetration, economy break)
- 4 launch pipeline docs
- Two-Server Problem architecture RESOLVED (Event Bus + Gateway pattern)
- Market research synthesis across 20 deep-dive questions
- 20-stage combat market research pipeline COMPLETE
- Combat Replacement Spec COMPLETE (COMBAT-REPLACEMENT-SPEC.md)
- 20-stage deployment pipeline mapped

**What's blocking launch:**
- Combat recode (5 modules REPLACE ~21h, 6 modules SURGERY ~18h, ~39h total Copilot time)
- API keys (DataStore + MessagingService) from Michael in Roblox Studio

---

## 2. GAME DESIGN

### Core Loop
```
Wave Start → Zombies Spawn → Kill (tap/shoot) → Coins Drop → Wave End
→ Shop Phase (upgrade weapons, buy items, open crates) → Next Wave (harder)
→ Boss every 11 days → Day 99 = Final Boss → Rebirth (reset + multiplier)
```

### Combat System (NEW — replacing ESL quiz mechanics)
- **Melee:** Tap-to-attack, 3-hit combo, knockback on third hit
- **Ranged:** Aim-assist + shoot button, mobile-optimized
- **Dodge:** 0.5s i-frame roll, 3s cooldown
- **Parry:** Boss fights only — telegraph → parry → 3s stun → damage phase
- **Weapons:** 19 weapons across 6 rarity tiers (Common → RIZZLORD)
- **Performance:** 8-12 zombies max, shadows OFF, < 500 parts, < 100ms feedback

### Phase 1 Demo Specs
| Spec | Value |
|------|-------|
| Playtime | 40-45 minutes |
| Players | Exactly 5 (viral lobby gate) |
| Phases | Defense → Town (Rusted Depot) → Boss (Baron Skibidi) |
| Boss | Baron Skibidi — HP 2500, Charge/Stomp/Summon |
| Ending | 4-phase cliffhanger → "99 days to Sanctuary" |
| Squad Bonus | +30% XP at full train (5/5) |

### 5-Class System
Sigma · Railrunner · Sniper · Medic · Thief

### Gospel 444 Palette (LAW)
| Token | Hex | Use |
|-------|-----|-----|
| Deep Dark | #0f0f1a | Backgrounds |
| Neon Purple | #a855f7 | Health, borders |
| Brushed Gold | #f59e0b | Rewards, objectives |
| Glass | rgba(26,26,38,0.7) | UI panels |
| **BLUE** | **FORBIDDEN** | **NEVER** |

---

## 3. MARKET INTELLIGENCE

### Platform Numbers (2025-2026)
- **$4.9B revenue** (+36% YoY), **$6.8B bookings** (+55% YoY)
- **126.5M DAU**, **123.8B hours** total playtime (+69% YoY)
- **70% mobile** — design mobile-first
- **APAC = 29.5%** of users (largest region)
- **13+ age group** fastest growing, now ~58% of DAU

### Our Targets
| Metric | Target | Benchmark |
|--------|--------|-----------|
| D1 Retention | 35%+ | Top 25% |
| D7 Retention | 18%+ | Top 25% |
| D30 Retention | 10%+ | Top 25% |
| Session Length | 30+ min | Top 25% |
| Payer Conversion | 6%+ | Top 25% |
| ARPPU | $12+ | Top 25% |

### Top 10 Earners Reference (March 2026)
| # | Game | CCU | Est. Rev | Core Model |
|---|------|-----|----------|------------|
| 1 | Blox Fruits | 516K | $90M+ | Passes + grinding boosts |
| 2 | Steal a Brainrot | 216K | $90M+ | Collecting + trading + events |
| 3 | Adopt Me! | 420K+ | $80M+ | Pets + trading + limited eggs |
| 4 | RIVALS | 248K | $100M+/yr | Skin cases + battle pass |
| 5 | Grow a Garden | 22.3M peak | $50M+ | Seeds + trading + crafting |
| 6 | Bee Swarm Sim | 189K | $30M+ | Passes + long progression |
| 7 | Brookhaven RP | 487K | $40M+ | Properties + cosmetics |
| 8 | Fisch | ~110K | $25M+ | Gear passes + rare trading |
| 9 | Strongest Battlegrounds | ~100K | $20M+ | Skins + abilities + PvP |
| 10 | Escape Tsunami Brainrots | 175K | $15M+ | Characters + events |

### 7 Revenue Patterns of Top Earners
1. **Collecting + Trading Economy** — 8/10 top earners
2. **Gacha/RNG Mechanics** — 7/10 top earners
3. **Grinding Boosts (Pay-to-Progress)** — #1 purchased pass type
4. **Cosmetic Flex Culture** — Social proof drives purchases
5. **Limited-Time Events + FOMO** — 9/10 top earners
6. **Rebirth/Prestige Loops** — 5/10 top earners
7. **Creator Rewards** — Roblox pays extra based on engagement

### Discovery Algorithm Signals (Ranked)
1. 🔴 **QPTR** (Qualified Play-Through Rate) — % completing core loop
2. 🔴 **D1 Retention** — most important for recommendations
3. 🟡 **Session Time** — longer = better signal
4. 🟡 **Thumbnail CTR** — click-through from discovery feeds
5. 🟡 **Social Signals** — friends playing
6. 🟢 **Payer Conversion** — Roblox profits when you monetize
7. 🟢 **Age Appropriateness** — wider distribution

---

## 4. TECHNICAL ARCHITECTURE

### Server-Authoritative Model
```
┌─────────────────────────────────────────────────┐
│                SERVER (Authoritative)            │
│                                                 │
│  GameMain ──┬── EconomyManager                  │
│             ├── FTUEManager                     │
│             ├── DailyRewards                    │
│             ├── AnomalyDetector (watchdog)       │
│             ├── GachaManager                    │
│             ├── TradeManager                    │
│             ├── ChallengeManager                │
│             ├── LeaderboardManager              │
│             ├── ReferralSystem                  │
│             ├── BattlePass                      │
│             ├── GuildManager                    │
│             ├── WorldBoss                       │
│             ├── PrestigeManager                 │
│             ├── MonetizationServer              │
│             ├── GamePassConfig                  │
│             ├── DevProductsConfig               │
│             ├── CombatSystem (NEW)              │
│             ├── WeaponData (NEW)                │
│             ├── EnemyData (NEW)                 │
│             ├── CombatRewardsManager (NEW)      │
│             └── DayScaling (NEW)                │
│                                                 │
│  MainServer_v2 (production router)              │
│  LedgerSchema (DataStore schema)                │
│  AnomalyDetector (validates ALL transactions)    │
│                                                 │
├────────── RemoteEvent Bus ──────────────────────┤
│                                                 │
│                CLIENT (Display Only)             │
│  HUDController ──── CodexClient ── CodexData    │
│  (No economy writes. Server-authoritative.)      │
└─────────────────────────────────────────────────┘
```

### Two-Server Problem — RESOLVED
**Solution:** Event Bus + Gateway Pattern — ONE door in, ONE door out.

Only TWO RemoteEvents for the entire game:
| Remote | Direction | Purpose |
|--------|-----------|---------|
| `ServerGateway` | Client → Server | ALL client requests |
| `ClientDispatch` | Server → Client | ALL server updates |

### Anti-Cheat Core
- **Never trust the client** — all combat, currency, inventory server-validated
- Decoy RemoteEvents as honeypots
- AFK detection
- Trade atomic commits with rollback
- AnomalyDetector at the Gateway chokepoint

### Init Boot Sequence (5 Layers)
1. **Layer 0: Infrastructure** — ServerGateway + AnomalyDetector
2. **Layer 1: Data & Economy** — LedgerSchema + EconomyManager
3. **Layer 2: Progression** — FTUE + DailyRewards + Challenges + BattlePass + Prestige
4. **Layer 3: Monetization** — Gacha + GamePasses + DevProducts + MonetizationServer
5. **Layer 4: Social** — Trade + Leaderboard + Referral + Guild + WorldBoss

---

## 5. CODE INVENTORY

### 41 Lua Modules (~750KB+)

#### Legacy (Phase 1 — Hardened)
| File | Size | Purpose |
|------|------|---------|
| GameMain_PHASE1_REVISED.lua | 27KB | Main server script (865 lines) |
| HUDController_PHASE1_REVISED.lua | 15KB | Client HUD controller |
| MainServer_v2.lua | 17KB | Production server v2.0.0 |
| MonetizationServer.lua | 9KB | Gacha + Trading + Rarity |
| LedgerSchema.lua | 4KB | Phoenix Ledger v1 schema |
| CodexData.lua | 5KB | Codex data definitions |
| CodexClient.lua | 7KB | Codex UI controller |

#### Pipeline Modules (Stages 1-20)
| File | Size | Stage | Purpose |
|------|------|-------|---------|
| FTUEManager.lua | 19KB | S1 | First-Time User Experience |
| FTUEController.lua | 33KB | S1 | FTUE client-side controller |
| FTUEWiring.lua | 6KB | S1 | FTUE wiring/integration |
| DailyRewards.lua | 13KB | S2 | 7-day calendar + streak prestige |
| AnomalyDetector.lua | 17KB | S3 | 7-point server validation |
| EconomyManager.lua | 17KB | S4 | Two-currency system |
| GamePassConfig.lua | 15KB | S5 | Game Pass definitions |
| GachaManager.lua | 14KB | S9 | Gacha/lootbox system |
| TradeManager.lua | 16KB | S10 | Player-to-player trading |
| DevProductsConfig.lua | 10KB | S11 | Developer Products config |
| ChallengeManager.lua | 15KB | S12 | Daily/Weekly challenges |
| LeaderboardManager.lua | 16KB | S13 | Cross-server leaderboards |
| ReferralSystem.lua | 13KB | S14 | Viral referral loop |
| BattlePass.lua | 13KB | S16 | Free + Premium battle pass |
| GuildManager.lua | 16KB | S17 | Guild/clan system |
| WorldBoss.lua | 14KB | S19 | Cross-server world boss raids |
| PrestigeManager.lua | 15KB | S20 | Prestige reset + ascension |

#### v2 Architecture Modules
| File | Size | Purpose |
|------|------|---------|
| ServerGateway.lua | 12KB | Gateway pattern — inbound validation + routing |
| ClientBridge.lua | 7KB | Client-side bridge for gateway pattern |
| UnifiedServer.lua | 19KB | Unified server orchestrator |
| UnifiedClient.lua | 25KB | Unified client orchestrator |
| HUDController_v2.lua | 17KB | Updated HUD for v2 architecture |
| CombatSystem.lua | 24KB | ⚠️ RECODE — replacing ESL quiz combat with real combat |
| WaveManager.lua | 8KB | ⚠️ SURGERY — rewiring to kill-count triggers |
| EnemyFactory.lua | 10KB | Enemy creation and pooling |
| EloManager.lua | 32KB | Elo/skill rating system |
| QuestionBank.lua | 36KB | ❌ REPLACING with WeaponData.lua |
| QuestionBankV2.lua | 23KB | ❌ REPLACING with EnemyData.lua |
| EnglishRewardsManager.lua | 41KB | ❌ REPLACING with CombatRewardsManager.lua |
| CosmeticController.lua | 46KB | ⚠️ SURGERY — rewiring unlock conditions |
| MobileInputController.lua | 39KB | Mobile-first input handling |
| MonetizationOrchestrator.lua | 34KB | Unified monetization orchestrator |
| ReceiptRouter.lua | 26KB | Purchase receipt processing |
| RewardBridge.lua | 8KB | Cross-system reward routing |
| SecurityLayer.lua | 7KB | Additional security layer |
| AnalyticsService.lua | 16KB | Telemetry and analytics |
| DataStoreV2.lua | 9KB | DataStore v2 wrapper |

**Total: 41 files · All hardened · All server-authoritative**

---

## 6. DOCUMENTATION INVENTORY

### Root-Level Strategy Docs (14+ files)
| File | Size | Topic |
|------|------|-------|
| README.md | 10KB | Master overview + file map |
| ROBLOX-STRATEGY-CONSOLIDATED.md | — | THIS FILE |
| GAME-BIBLE-HUMAN-READABLE.md | ~13KB | Human-readable game bible |
| COMBAT-REPLACEMENT-SPEC.md | ~12KB | Combat recode specification |
| COMBAT-RESEARCH-PIPELINE.md | ~8KB | 20-stage market research |
| MARKET-RESEARCH-SYNTHESIS-Q1-Q20.md | 10KB | 20-question market research |
| TWO-SERVER-PROBLEM-ARCHITECTURE.md | 21KB | Client-server wiring |
| DEPLOYMENT-PIPELINE-20-STAGE.md | 3KB | 20-stage deploy pipeline |
| MARKETPLACE-SPECS.md | 3KB | 8-tier rarity, trading, currencies |
| 100-POINT-HARDENING-AUDIT.md | 12KB | Security + quality audit |
| REVISION-SUMMARY.md | 7KB | Phase 1 revision changelog |
| QUICK-START-V1.md | 6KB | 15-min setup guide |
| BOT-BOOT-CONTRACT-V1.md | 2KB | System prompt for bots |
| TURN-KEY-DEPLOY-PACKET.md | 3KB | Step-by-step deploy |
| MEME-RESEARCH-PIPELINE.md | 6KB | Meme research for marketing |

### DOCS/ Directory (32 detailed specs)
*(32 spec files as inventoried — see File Map below)*

### LAUNCH/ Directory (4 files)
| File | Size | Topic |
|------|------|-------|
| RUNBOOK.md | 2KB | Launch runbook |
| PIPELINE-TO-10.md | 1KB | Pipeline to 10K players |
| LAUNCH-PIPELINE-10.md | 2KB | 10-stage launch pipeline |
| LAUNCH-CHECKLIST.md | 1KB | Final launch checklist |

---

## 7. MONETIZATION STRATEGY

### 3-Layer Model (from 20-stage market research)
- **70% Cosmetic** — weapon skins, kill effects, trails, emotes, auras
- **20% Soft Power** — game passes +10-20% damage, extra revive, faster reload
- **10% Convenience** — inventory slots, auto-collect, XP boosts

### 7-Pillar System
1. **Game Passes** — 5 tiers (99-1499 R$)
2. **Gacha/Lootbox** — 6-tier rarity (Common→RIZZLORD), pity system
3. **Trading Economy** — 3% tax sink, server-local only, atomic commits
4. **Daily Rewards** — 7-day calendar with streak prestige + legendary Day 7
5. **Battle Pass** — 30 days, 299R$, free + premium tracks
6. **Developer Products** — Currency packs, revives, boosts (consumables)
7. **Limited-Time Events** — Seasonal content, FOMO mechanics, rotating crates

### Two-Currency Model
| Currency | Earned | Spent On | Purpose |
|----------|--------|----------|---------|
| Survival Coins (soft) | Combat kills, waves, combos | Weapons, upgrades, gacha | Reward engagement |
| Brainrot Gems (hard) | Bosses, achievements, Robux | Premium gacha, exclusive | Monetization |

### Frustration-to-Purchase Pipeline
- Difficulty spikes at Day 15, 30, 50, 75 = natural purchase triggers
- Boss fights create "I keep dying" moments = revive purchases
- Weapon gacha after boss kills = "I almost got it" moments
- FOMO from limited-time crates, hourly mutation events

### Monetization Calendar
- **Hourly:** Mutation events (rare zombie spawns)
- **Daily:** Login reward, daily challenge
- **Weekly:** World Boss event, Guild Quest reset
- **Monthly:** Battle Pass season, new weapon crate rotation
- **Quarterly:** Major content update (new zone, weapons, boss)

---

## 8. LAUNCH PIPELINE

### 20-Stage Deployment Pipeline

**Phase I: The Skeleton (Infrastructure)**
| Stage | Name | Task |
|-------|------|------|
| 1 | The Void Setup | Initialize Workspace: TrainModel + Lobby folders |
| 2 | The Cast (Assets) | Inject R15 Rigs: SkibidiShambler + SigmaWalker |
| 3 | The Engine (Server) | Deploy GameMain — 5-Player Gate + Wave Logic |
| 4 | The Face (Client UI) | Deploy HUDController — Gospel 444 Glassmorphism |
| 5 | The Physics Law | Collision Groups: Train, Zombies, Players |

**Phase II: The Loop (Gameplay)**
| Stage | Name | Task |
|-------|------|------|
| 6 | 5-Class System | Squad: Sigma, Railrunner, Sniper, Medic, Thief |
| 7 | Rust Creek Injection | Day 2 Town Map — 5 Fuel Barrels |
| 8 | Rizzlord Awakening | Baron Skibidi (2500 HP) — Charge + Ground Stomp |
| 9 | The Cliffhanger | 4-Phase Cinematic ending |
| 10 | Full Train Logic | Lock Start until Players >= 5 |

**Phase III: The Aesthetic (Gospel 444)**
| Stage | Name | Task |
|-------|------|------|
| 11 | The Color Ban | Purge ALL Blue → Purple + Gold |
| 12 | Atmosphere Injection | Deep Dark lighting, purple fog |
| 13 | Audio Landscape | Western/Industrial ambient |
| 14 | Visual Feedback | Gold damage, Purple healing |
| 15 | Performance Optimization | Object Pooling → 60 FPS mobile |

**Phase IV: The Empire (Monetization & Launch)**
| Stage | Name | Task |
|-------|------|------|
| 16 | Brain Cell Economy | MarketplaceService → Gamepasses |
| 17 | Hype Deck | Roblox Game Page (SEO + brand voice) |
| 18 | The Whale Trap | "Conductor Hat" tease |
| 19 | 10-Min QA | Full 5-player run-through |
| 20 | GO LIVE | Toggle Public Access → Viral Referral |

---

## 9. BATTLE REPORTS

16 simulation/test reports in `BATTLE-REPORT/`:

| Stage | Report | Topic |
|-------|--------|-------|
| 3 | STAGE-3-GAME-SIMULATION.md | Full game simulation |
| 4 | STAGE-4-TWO-SERVER-STRESS-TEST.md | Server stress test |
| 5 | STAGE-5-ECONOMY-BREAK-TEST.md | Economy break test |
| 6 | STAGE-6-ANTI-CHEAT-PENETRATION.md | Anti-cheat pen test |
| 7 | STAGE-7-DATA-PERSISTENCE-TORTURE.md | DataStore torture test |
| 8 | STAGE-8-WEBSITE-DOMAIN-HEALTH.md | Website/domain health |
| 9 | STAGE-9-GITHUB-REPO-SECURITY.md | Repo security audit |
| 10 | STAGE-10-DISCORD-RECON.md | Discord reconnaissance |
| 11-20 | Various | Discord bot, content, integration, load tests |

---

## 10. OPEN ITEMS & BLOCKERS

### 🔴 LAUNCH BLOCKERS
- [ ] **Combat recode** — 5 modules REPLACE (~21h) + 6 modules SURGERY (~18h). Spec ready: COMBAT-REPLACEMENT-SPEC.md
- [ ] **API keys** — Michael needs to create DataStore + MessagingService API keys in Roblox Studio

### 🟡 PRIORITY (Week 1-2 Post-Launch)
- [ ] Discord bot deployment
- [ ] Content calendar execution
- [ ] Trading market activation

### 🟢 ONGOING
- [ ] Weekly content cadence
- [ ] APAC market outreach
- [ ] TikTok/YouTube creator pipeline
- [ ] Economy monitoring dashboard

---

## 11. FILE MAP

```
CANON/TRAIN-67/
├── ROBLOX-STRATEGY-CONSOLIDATED.md    ← THIS FILE
├── GAME-BIBLE-HUMAN-READABLE.md       ← Human-readable game bible
├── COMBAT-REPLACEMENT-SPEC.md         ← Combat recode spec (NEW)
├── COMBAT-RESEARCH-PIPELINE.md        ← 20-stage market research (NEW)
├── README.md
├── 100-POINT-HARDENING-AUDIT.md
├── MARKET-RESEARCH-SYNTHESIS-Q1-Q20.md
├── TWO-SERVER-PROBLEM-ARCHITECTURE.md
├── DEPLOYMENT-PIPELINE-20-STAGE.md
├── MARKETPLACE-SPECS.md
├── QUICK-START-V1.md
├── TURN-KEY-DEPLOY-PACKET.md
├── (+ other root strategy docs)
│
├── CODE/ (41 Lua modules · ~750KB+)
│   ├── CombatSystem.lua          ⚠️ RECODE
│   ├── QuestionBank.lua          ❌ REPLACE → WeaponData.lua
│   ├── QuestionBankV2.lua        ❌ REPLACE → EnemyData.lua
│   ├── EnglishRewardsManager.lua ❌ REPLACE → CombatRewardsManager.lua
│   ├── WaveManager.lua           ⚠️ SURGERY
│   ├── WorldBoss.lua             ⚠️ SURGERY
│   ├── EconomyManager.lua        ⚠️ SURGERY
│   ├── BattlePass.lua            ⚠️ SURGERY
│   ├── GuildManager.lua          ⚠️ SURGERY
│   ├── CosmeticController.lua    ⚠️ SURGERY
│   └── (31 more clean modules)
│
├── DOCS/ (32 spec documents)
├── LAUNCH/ (4 launch docs)
└── BATTLE-REPORT/ (16 test reports)
```

### TOTAL INVENTORY

| Category | Count | Total Size |
|----------|-------|------------|
| Lua Modules | 41 | ~750KB+ |
| Root Strategy Docs | 20+ | ~150KB+ |
| Detailed Specs (DOCS/) | 32 | ~530KB+ |
| Launch Docs | 4 | ~6KB |
| Battle Reports | 16 | ~120KB |
| **TOTAL** | **115+ files** | **~1.5MB+** |

---

*Consolidated: 2026-03-28 by OB1 for SOV100*
*Updated: 2026-03-28 — Combat recode status added, deadline corrected to NOW, ESL references marked for replacement*
*Source: `hobbs0011/Phoenix-Rising-Protocol-Ultimate` repo, `CANON/TRAIN-67/` directory*
*Artifact class: 🏦 VAULT — consolidated strategy document*
