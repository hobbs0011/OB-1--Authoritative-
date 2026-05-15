# Incubator Submission Assets — DevForum Post + Video Demo Script (T-108h)

> **Artifact Class:** 🔨 BUILD
> **Run:** 245 | **Date:** 2026-04-01 20:48 ICT
> **Agent:** Anakin (Agent-98)
> **Active Mission:** Roblox Incubator Submission — Apr 6 deadline
> **Countdown:** ~108 hours remaining
> **Genesis Anchor:** CANON/TRAIN-67/DOCS/RobloxIncubatorApplicationDraft-V2.md
> **Cross-refs:** Game Bible, Store Listing Copy, Market Research Synthesis

---

## PURPOSE

Two [FILL] fields in the Incubator Application V2 require concrete assets before Michael can submit:
1. **DevForum "Cool Creations" post** — drives 200+ initial plays for cold start
2. **2-minute gameplay video demo script** — required for application reviewers

Both are copy-paste-ready. Michael reviews, personalizes bracketed fields, executes.

---

## ASSET 1: DevForum "Cool Creations" Post

**Where to post:** https://devforum.roblox.com → #resources:cool-creations
**When:** Same day as game publish (before incubator submission)
**Estimated time:** 5 minutes (copy, paste, add screenshots, post)

### Title

```
Skibidi Zombie: Survive the Brainrots — Wave-Based Survival with a Unique Answer-to-Attack Combat System
```

### Body (copy-paste below the line)

---

**Hey devs!** 👋

I'm excited to share **Skibidi Zombie: Survive the Brainrots** — a wave-based survival game with a combat mechanic I haven't seen anywhere else on Roblox.

## What makes it different?

Instead of button-mashing, you **answer questions to attack**. Tap the correct answer → your character strikes. Chain correct answers → combo multipliers. Build your combo meter → unlock power-up attacks. It creates actual gameplay depth where knowledge = combat power.

The enemies are meme-themed (Skibidi Zombies, Sigma Bosses, Ohio Anomalies, Rizz Merchants, Brainrot Mutants) so it speaks the language of the players.

## What's built

- **41+ Lua modules** — full server/client architecture
- **5 enemy types** with infinite wave scaling
- **Monetization stack**: 5 game passes, 16 dev products, gacha system, battle pass, daily rewards
- **Mobile-first**: tap-to-select combat designed for the 70% mobile audience
- **Social systems**: guilds, leaderboards, challenges, world boss events
- **50+ cosmetic items** with rarity tiers
- **Full security layer**: rate limiting, anomaly detection, duplicate purchase prevention
- **9-step FTUE** that gets new players killing zombies in under 10 seconds

## Technical highlights for devs

- Centralized boot: `UnifiedServer.lua` → 28+ server modules, `UnifiedClient.lua` → 5 client modules
- `DataStoreV2` with automatic migration, retry logic, and session locking
- `SecurityLayer` + `AnomalyDetector` — pcall everywhere, nothing trusts the client
- `EconomyManager` with balanced dual-currency sink/faucet system
- Platform-adaptive input: mobile tap-to-select, desktop keyboard typing
- Custom analytics pipeline tracking all key retention and monetization events

## The unique angle

The answer-to-attack mechanic means parents actively approve their kids playing (and spending on) this game. That creates a dual-audience monetization flywheel that pure combat games can't touch. Kids want to kill zombies. Parents see productive screen time. Both audiences are served.

## Screenshots

[FILL: Insert 3-4 screenshots showing: (1) combat in action with combo UI, (2) enemy wave with meme zombies, (3) shop/monetization UI, (4) mobile gameplay]

## Play it

🎮 **[FILL: Paste Roblox game URL here]**

Built solo with an AI-assisted development pipeline. Would love feedback on the combat feel, mobile controls, and FTUE flow. Drop a comment or DM me!

— Michael

---

### Post checklist

- [ ] Game is published and URL is live
- [ ] Take 3-4 screenshots in Studio (combat, enemies, shop, mobile view)
- [ ] Copy post body above
- [ ] Paste into DevForum new topic → #resources:cool-creations
- [ ] Replace [FILL] fields with actual URLs/screenshots
- [ ] Post
- [ ] Copy the DevForum post URL back into the Incubator Application V2 Section 10

---

## ASSET 2: 2-Minute Video Demo Script

**Format:** Screen recording of Roblox Studio or published game
**Tool:** OBS (free) or Roblox built-in recorder
**Length:** Exactly 2 minutes
**When:** After game is published, before incubator submission

### Recording setup

1. Open game in Roblox Studio (Play mode) or published game
2. Set resolution to 1920x1080
3. Use OBS or QuickTime screen recording
4. No voiceover needed (text overlays preferred for accessibility)
5. Upload to YouTube as Unlisted → paste URL in application

### Shot list (2:00 total)

| Timestamp | Duration | Shot | What to show |
|-----------|----------|------|-------------|
| 0:00-0:05 | 5s | **Title card** | Game logo/title + "Skibidi Zombie: Survive the Brainrots" text overlay |
| 0:05-0:20 | 15s | **FTUE** | New player spawns → first question appears → tap answer → first zombie kill. Show the 10-second hook. |
| 0:20-0:40 | 20s | **Core combat loop** | Answer questions rapidly → combo counter climbing → power-up meter filling → unleash special attack. Show the answer-to-attack mechanic clearly. |
| 0:40-0:55 | 15s | **Enemy variety** | Show 3+ enemy types: Skibidi Zombie, Sigma Boss, Brainrot Mutant. Show wave counter advancing. |
| 0:55-1:10 | 15s | **Mobile gameplay** | Switch to mobile device or mobile emulator. Show tap-to-select working on phone-sized screen. Thumb-friendly controls. |
| 1:10-1:25 | 15s | **Monetization UI** | Open shop → show game passes, currency packs, gacha crates. Show battle pass. Show the breadth of monetization. |
| 1:25-1:35 | 10s | **Social features** | Flash guild screen, leaderboard, challenge system. Show social hooks exist. |
| 1:35-1:50 | 15s | **Cosmetics** | Open cosmetic inventory → equip items → show character appearance change. Show rarity tiers. |
| 1:50-2:00 | 10s | **End card** | Text overlay: "41+ Lua modules / 5 enemy types / Full monetization stack / Mobile-first / Solo dev" + game URL |

### Text overlays (add in editor or OBS)

Use these text overlays at key moments:

- 0:05: "Answer questions to attack — a combat mechanic no other Roblox game has"
- 0:20: "Combo multipliers reward fast, accurate answers"
- 0:40: "Meme-native enemies: Skibidi, Sigma, Ohio, Rizz, Brainrot"
- 0:55: "Designed mobile-first for the 70% mobile audience"
- 1:10: "21 monetization products ready on Day 1"
- 1:35: "50+ cosmetic items with rarity tiers"
- 1:50: "Built by a solo developer — seeking incubator support to scale"

### Video checklist

- [ ] OBS or screen recorder installed
- [ ] Game running in Studio Play mode or published
- [ ] Record each shot (can be separate takes, edited together)
- [ ] Add text overlays (use free editor: CapCut, DaVinci Resolve, or iMovie)
- [ ] Export as MP4, 1080p, under 100MB
- [ ] Upload to YouTube as Unlisted
- [ ] Copy YouTube URL into Incubator Application V2 Section 10
- [ ] Total video length: exactly 2:00 (±5 seconds)

---

## ACCEPTANCE TEST

| # | Criterion | Status |
|---|-----------|--------|
| 1 | DevForum post is copy-paste-ready with no creative decisions required | ✅ PASS |
| 2 | Video script has exact timestamps, shot descriptions, and text overlays | ✅ PASS |
| 3 | Both assets reference concrete tools and paths | ✅ PASS |
| 4 | Checklist items are actionable with zero ambiguity | ✅ PASS |
| 5 | Cross-references to Application V2 Section 10 [FILL] fields | ✅ PASS |

---

## CROSS-REFERENCES

- `CANON/TRAIN-67/DOCS/RobloxIncubatorApplicationDraft-V2.md` — Section 10 [FILL] fields
- `CANON/TRAIN-67/DOCS/STORE-LISTING-COPY.md` — SEO keywords reused in DevForum post
- `CANON/TRAIN-67/DOCS/GamePageSEO.md` — Discovery keywords
- `CANON/TRAIN-67/DOCS/LaunchAnnouncementPack.md` — Announcement copy (different audience)
- `CANON/TRAIN-67/DOCS/ThumbnailIconSpec.md` — Visual assets for screenshots

---

*Built by Anakin (Agent-98) — Pulse Run 245 — 2026-04-01 20:48 ICT*
*Mode: BUILD | Genesis: RobloxIncubatorApplicationDraft-V2.md*
*Platform Death Test: PASS (this file is the artifact)*
