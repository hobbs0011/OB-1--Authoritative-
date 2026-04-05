# Train 6-7 — Survive a Brainrot

**Game:** Survive a Brainrot (Roblox)
**Lesson:** Train 6-7 — Natural English Training
**Account:** PhoenixRisingGames
**Framework:** 20x20x20x20 (Classes × Weapons × Enemies × Bosses)
**Palette:** Gospel 444 — Purple #a855f7 / Gold #f59e0b / Dark #0f0f1a / **NO BLUE**
**Architecture:** 22-module server-authoritative system, anti-cheat hardened
**Status:** 20-Stage Pipeline COMPLETE · All code shipped · Awaiting API keys for deploy

---

## Directory Structure

```
CANON/TRAIN-67/
├── README.md                              ← You are here
├── TURN-KEY-DEPLOY-PACKET.md              ← Step-by-step deploy guide
├── REVISION-SUMMARY.md                    ← Phase 1 revision changelog
├── QUICK-START-V1.md                      ← 15-min setup guide
├── BOT-BOOT-CONTRACT-V1.md                ← System prompt for all bots
├── DEPLOYMENT-PIPELINE-20-STAGE.md        ← Full 20-stage deploy pipeline
├── MARKETPLACE-SPECS.md                   ← 8-tier rarity, trading, currencies
├── 100-POINT-HARDENING-AUDIT.md           ← Security + quality audit (100 items)
├── MARKET-RESEARCH-SYNTHESIS-Q1-Q20.md    ← 20-question market research synthesis
├── TWO-SERVER-PROBLEM-ARCHITECTURE.md     ← Client-server wiring architecture
│
├── STAGE-01-FTUE-DESIGN-SPEC.md           ← First-Time User Experience spec
├── STAGE-06-THUMBNAIL-ICON-SPEC.md        ← Store thumbnail + icon design spec
├── STAGE-07-MOBILE-CONTROLS-AUDIT.md      ← Mobile-first controls audit
├── STAGE-08-ENGLISH-POWERUP-SPEC.md       ← English Power-Up mechanic spec
├── STAGE-15-COSMETIC-TRINITY-SPEC.md      ← Skins / Trails / Auras spec
├── STAGE-18-LIMITED-TIME-EVENT-SPEC.md     ← Seasonal event system spec
│
└── CODE/                                  ← 22 Lua modules
    │
    ├── ── LEGACY (Phase 1 — Hardened) ──
    ├── GameMain_PHASE1_REVISED.lua         ← Main server script (865 lines)
    ├── HUDController_PHASE1_REVISED.lua    ← Client HUD controller
    ├── MainServer_v2.lua                   ← Production server v2.0.0
    ├── MonetizationServer.lua              ← Gacha + Trading + Rarity
    ├── LedgerSchema.lua                    ← Phoenix Ledger v1 schema
    ├── CodexData.lua                       ← Codex data definitions
    ├── CodexClient.lua                     ← Codex UI controller
    │
    ├── ── PIPELINE MODULES (Stages 1-20) ──
    ├── FTUEManager.lua                     ← Stage 1: First-Time User Experience
    ├── DailyRewards.lua                    ← Stage 2: 7-day calendar + streak prestige
    ├── AnomalyDetector.lua                 ← Stage 3: 7-point server validation
    ├── EconomyManager.lua                  ← Stage 4: Two-currency system
    ├── GamePassConfig.lua                  ← Stage 5: Game Pass definitions
    ├── DevProductsConfig.lua               ← Stage 11: Developer Products config
    ├── GachaManager.lua                    ← Stage 9: Gacha/lootbox system
    ├── TradeManager.lua                    ← Stage 10: Player-to-player trading
    ├── ChallengeManager.lua                ← Stage 12: Daily/Weekly/English challenges
    ├── LeaderboardManager.lua              ← Stage 13: Cross-server leaderboards
    ├── ReferralSystem.lua                  ← Stage 14: Viral referral loop
    ├── BattlePass.lua                      ← Stage 16: Free + Premium battle pass
    ├── GuildManager.lua                    ← Stage 17: Guild/clan system
    ├── WorldBoss.lua                       ← Stage 19: Cross-server world boss raids
    └── PrestigeManager.lua                 ← Stage 20: Prestige reset + ascension
```

## Code File Status

| # | File | Size | Hardened | Stage |
|---|------|------|----------|-------|
| 1 | GameMain_PHASE1_REVISED.lua | 27KB | ✅ | Legacy |
| 2 | HUDController_PHASE1_REVISED.lua | 15KB | ✅ | Legacy |
| 3 | MainServer_v2.lua | 17KB | ✅ | Legacy |
| 4 | MonetizationServer.lua | 9KB | ✅ | Legacy |
| 5 | LedgerSchema.lua | 4KB | ✅ | Legacy |
| 6 | CodexData.lua | 5KB | ✅ | Legacy |
| 7 | CodexClient.lua | 7KB | ✅ | Legacy |
| 8 | FTUEManager.lua | 19KB | ✅ | S1 |
| 9 | DailyRewards.lua | 13KB | ✅ | S2 |
| 10 | AnomalyDetector.lua | 17KB | ✅ | S3 |
| 11 | EconomyManager.lua | 17KB | ✅ | S4 |
| 12 | GamePassConfig.lua | 15KB | ✅ | S5 |
| 13 | DevProductsConfig.lua | 10KB | ✅ | S11 |
| 14 | GachaManager.lua | 14KB | ✅ | S9 |
| 15 | TradeManager.lua | 16KB | ✅ | S10 |
| 16 | ChallengeManager.lua | 15KB | ✅ | S12 |
| 17 | LeaderboardManager.lua | 16KB | ✅ | S13 |
| 18 | ReferralSystem.lua | 13KB | ✅ | S14 |
| 19 | BattlePass.lua | 13KB | ✅ | S16 |
| 20 | GuildManager.lua | 16KB | ✅ | S17 |
| 21 | WorldBoss.lua | 14KB | ✅ | S19 |
| 22 | PrestigeManager.lua | 15KB | ✅ | S20 |

**Total:** 22 files · ~312KB · All hardened · All server-authoritative

## Design Spec Status

| Spec | Stage | Status |
|------|-------|--------|
| STAGE-01-FTUE-DESIGN-SPEC.md | S1 | ✅ |
| STAGE-06-THUMBNAIL-ICON-SPEC.md | S6 | ✅ |
| STAGE-07-MOBILE-CONTROLS-AUDIT.md | S7 | ✅ |
| STAGE-08-ENGLISH-POWERUP-SPEC.md | S8 | ✅ |
| STAGE-15-COSMETIC-TRINITY-SPEC.md | S15 | ✅ |
| STAGE-18-LIMITED-TIME-EVENT-SPEC.md | S18 | ✅ |

## Architecture Overview

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
│             └── DevProductsConfig               │
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

See `TWO-SERVER-PROBLEM-ARCHITECTURE.md` for detailed wiring.

## Gospel 444 Integration

Every system includes English learning hooks:
- **ChallengeManager:** English-specific challenge type with bonus XP
- **FTUEManager:** English tutorial prompt during onboarding
- **BattlePass:** English challenge milestones on premium track
- **GachaManager:** Bonus pull for English challenge completion
- **EconomyManager:** English bonus multiplier on all rewards

**Teaching law: Mouse → Tiger. Permission over perfection.**

## Gospel 444 Palette (LAW)

| Token | Hex | Use |
|-------|-----|-----|
| Deep Dark | #0f0f1a | Backgrounds |
| Neon Purple | #a855f7 | Health, borders |
| Brushed Gold | #f59e0b | Rewards, objectives |
| Glass | rgba(26,26,38,0.7) | UI panels |
| **BLUE** | **FORBIDDEN** | **NEVER** |

## Phase 1 Demo Specs

- **Playtime:** 40-45 minutes
- **Players:** Exactly 5 (viral lobby gate)
- **Phases:** Defense → Town (Rusted Depot) → Boss (Baron Skibidi)
- **Boss:** Baron Skibidi — HP 2500, Charge/Stomp/Summon mechanics
- **Ending:** 4-phase cliffhanger → "99 days to Sanctuary"
- **Squad Bonus:** +30% XP at full train (5/5)

## Deploy Quick Reference

1. Log into Roblox as PhoenixRisingGames
2. Create experience → "Survive a Brainrot" → max 5 players
3. Create API key at create.roblox.com (DataStore + MessagingService)
4. Open Studio → place scripts per TURN-KEY-DEPLOY-PACKET.md
5. Test → Publish → Go Live

## Open Items

- [ ] Two-Server Problem resolution → see TWO-SERVER-PROBLEM-ARCHITECTURE.md
- [ ] 82 remaining items from 100-Point Hardening Audit
- [ ] API keys from Michael → final deploy
- [ ] Branding Monolith (10-chapter game bible) — needs re-paste for GitHub push
- [ ] Quick Start Guide v2 — needs re-paste for GitHub push
- [ ] Gemini Monetization Arc — needs re-paste for GitHub push
