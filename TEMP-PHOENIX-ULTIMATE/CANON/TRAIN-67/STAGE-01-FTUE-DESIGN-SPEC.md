# Stage 1 — Flawless FTUE (90-Second Hook) Design Spec
## Survive a Brainrot — First Time User Experience

**Pipeline:** 20-Stage Train 6-7 Launch Pipeline
**Priority:** 🔴 TIER 1 LAUNCH BLOCKER — QPTR is #1 Roblox algorithm signal
**Date:** 2026-03-26
**Status:** ACTIVE

---

## 🔴 THE PROBLEM

Current GameMain_PHASE1_REVISED.lua has **zero FTUE design**:

| Issue | Impact |
|-------|--------|
| `RequiredPlayers = 5` gate | New player joins → empty lobby → leaves. QPTR = 0% |
| No weapon at spawn | Player spawns naked with nothing to do |
| No immediate threat | Enemies only spawn after 5-player countdown |
| No reward in first 90 seconds | No dopamine hit, no reason to stay |
| No tutorial flow | Player doesn't know the core loop |
| No solo play option | Game is literally unplayable alone |

**Result:** Every new player who joins an empty server bounces. Roblox algorithm sees 0% QPTR and stops recommending the game. Death spiral.

---

## ✅ THE FIX — 90-Second Hook Design

### Critical Window Timeline

| Second | Event | Player Feels |
|--------|-------|--------------|
| 0-3 | Spawn on train. World is ALIVE — particles, sound, movement | "Whoa, this looks cool" |
| 3-5 | **AUTO-EQUIP starter weapon** (Rusty Pipe). HUD appears | "I have a weapon" |
| 5-10 | Tutorial prompt: "SWING to attack!" + ghost target | "I know how to fight" |
| 10-15 | **First enemy spawns** (tutorial Shambler, 50% HP) right in front | "Oh shit it's coming" |
| 15-20 | Player kills first enemy. **REWARD BURST**: coins + XP + screen flash | "YES! That felt good" |
| 20-30 | 2-3 more enemies spawn. Player is in the loop | Core loop learned |
| 30-45 | **First English Power-Up prompt**: "Answer to CHARGE your weapon!" | "Wait, educational AND fun?" |
| 45-60 | Wave complete. **CHEST DROP** with random item + Daily Reward popup | "Free stuff! I want more" |
| 60-75 | Day transition. Train moves. New environment teased | "What's next?" |
| 75-90 | Wave 2 starts. Enemies are harder. Player uses charged weapon | Mastery curve begins |

### Key Design Principles

1. **Solo-first, squad-bonus.** Game must be fully playable with 1 player. Squad bonus (30% XP) activates at 2+ players. The 5-player gate is REMOVED.
2. **Weapon at spawn.** Every player spawns with Rusty Pipe equipped. No empty hands ever.
3. **Enemy in 10 seconds.** First tutorial enemy spawns regardless of player count.
4. **Reward in 20 seconds.** First kill = coins + XP + visual burst.
5. **English mechanic at 30 seconds.** First power-up prompt after player has learned combat.
6. **Chest at 60 seconds.** First wave clear = tangible reward (item, not just numbers).

---

## 🔧 IMPLEMENTATION — FTUEManager.lua

### Module Structure

```
FTUEManager (ServerScriptService)
├── detectNewPlayer(player) — check if first session
├── runFTUE(player) — orchestrate the 90-second flow
├── spawnTutorialEnemy(player) — weak enemy near player
├── giveStarterWeapon(player) — equip Rusty Pipe
├── showTutorialPrompt(player, text) — contextual hints
├── triggerRewardBurst(player, rewards) — coins + XP + VFX
├── spawnFirstChest(player) — post-wave-1 reward
└── markFTUEComplete(player) — set attribute, never repeat
```

### Config Changes to GameMain

```lua
-- BEFORE (broken)
Config.RequiredPlayers = 5

-- AFTER (fixed)
Config.MinPlayers = 1          -- Solo-playable
Config.SquadBonusThreshold = 2  -- XP bonus at 2+
Config.FTUEEnabled = true
Config.FTUE = {
    TutorialEnemyDelay = 8,     -- seconds after spawn
    TutorialEnemyHealth = 50,   -- half normal Shambler HP
    FirstRewardCoins = 25,
    FirstRewardXP = 15,
    FirstChestDelay = 45,       -- after first wave clear
    EnglishPromptDelay = 30,    -- first power-up prompt
    StarterWeapon = "RustyPipe",
}
```

### GameMain Integration Points

1. **Lobby system** — Remove 5-player gate. Game starts immediately for solo players.
2. **PlayerAdded** — Call `FTUEManager.runFTUE(player)` on first join.
3. **Wave system** — First wave is `tutorialWave` (3 enemies, 50% HP) if FTUE active.
4. **Reward system** — FTUEManager fires reward burst events.
5. **English integration** — FTUEManager triggers first power-up prompt at 30s mark.

### Solo Mode Architecture

```
Player joins → Is server empty?
  YES → Start FTUE immediately (no waiting)
        Spawn tutorial enemies on personal timer
        Scale difficulty to player count = 1
  NO  → Join active game
        Skip FTUE if already completed (attribute check)
        Scale difficulty up for player count
```

### Difficulty Scaling by Player Count

| Players | Enemy HP Multiplier | Enemy Count Multiplier | Spawn Rate |
|---------|--------------------|-----------------------|------------|
| 1 | 0.5x | 0.5x | 2.0s |
| 2-3 | 0.75x | 0.75x | 1.5s |
| 4-5 | 1.0x | 1.0x | 1.5s |
| 6-10 | 1.25x | 1.5x | 1.0s |

---

## 📊 Success Metrics

| Metric | Current (estimated) | Target | How |
|--------|-------------------|--------|-----|
| QPTR | ~10% (5-player gate kills it) | 70%+ | Solo-first, instant action |
| Time to first kill | Never (no weapon) | <20 seconds | Auto-equip + tutorial enemy |
| Time to first reward | Never | <25 seconds | Reward burst on first kill |
| D1 Retention | Unknown | 35%+ | Daily reward popup at 60s |
| Core loop completion | ~5% | 80%+ | Guided 90-second flow |

---

## 🚫 GOSPEL 444 COMPLIANCE

- ✅ Purple #a855f7 for all UI accents
- ✅ Gold #f59e0b for rewards and highlights
- ✅ Dark #0f0f1a for backgrounds
- ❌ NO BLUE anywhere in FTUE UI
- ✅ English = POWER-UP, not homework
- ✅ Mouse → Tiger: start easy, escalate naturally

---

*Source: Q8 (Ideal FTUE), Q9 (Key Metrics), Q16 (Discovery Algorithm) from Market Research Synthesis*
*Pipeline: Stage 1 of 20 — 20-Stage Train 6-7 Launch Pipeline*
