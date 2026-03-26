# Stage 8 — English Power-Up Mechanic Spec
## Survive a Brainrot — "Answer This To Charge Your Weapon"

**Pipeline:** 20-Stage Train 6-7 Launch Pipeline
**Priority:** 🔴 TIER 1 LAUNCH BLOCKER
**Date:** 2026-03-26
**Status:** SPEC COMPLETE

---

## 🔴 THE SOUL DNA

> **Mouse → Tiger. Permission over perfection.**

English is a **POWER-UP**, not homework.
The player doesn't study English. The player **channels English into their weapon.**
Get it right = weapon charges up, does more damage, gets cooler effects.
Get it wrong = nothing bad happens. Try again.

**No punishment. Only power.**

This is Gospel 444 law. This is the core of Natural English Training.

---

## ⚡ MECHANIC DESIGN

### Core Loop
```
Kill enemies → Fill CHARGE meter (combat XP)
  ↓
CHARGE meter full → POWER-UP PROMPT appears
  ↓
English question appears (vocabulary, grammar, translation)
  ↓
Correct answer:
  → Weapon CHARGES with Purple energy
  → 2x damage for 30 seconds
  → Special VFX (Gold particles + Purple aura)
  → +15 Coins bonus
  → Streak counter advances
  ↓
Wrong answer:
  → "Almost! Try again next charge"
  → Weapon stays normal
  → No punishment, no coin loss
  → Same word appears again later (spaced repetition)
```

### Question Types (Phase 1)

| Type | Format | Example | Difficulty |
|------|--------|---------|------------|
| **Vocabulary** | "What does [word] mean?" + 4 choices | "What does 'survive' mean?" | Easy |
| **Translation** | Thai → English, 4 choices | "รอดชีวิต = ?" | Easy |
| **Fill-in** | Sentence with blank + 4 choices | "I ___ to school every day" | Medium |
| **Synonym** | "Which word means the same?" | "Big = ?" (Large/Small/Fast/Slow) | Medium |
| **Listening** (future) | Audio clip + 4 text choices | [audio plays] "What did you hear?" | Hard |

### Difficulty Scaling (Mouse → Tiger)

| Player Level | Question Pool | Timer | Choices |
|-------------|---------------|-------|--------|
| 1-5 (Mouse) | 100 basic words | 15 seconds | 4 (1 correct, 3 very wrong) |
| 6-15 (Cat) | 300 intermediate | 12 seconds | 4 (1 correct, 1 close, 2 wrong) |
| 16-30 (Wolf) | 500 advanced | 10 seconds | 4 (1 correct, 2 close, 1 wrong) |
| 31+ (Tiger) | 1000+ all levels | 8 seconds | 4 (all plausible) |

### Spaced Repetition (SRS-Lite)
- Words the player gets **wrong** come back 2x more often
- Words the player gets **right 3 times** get promoted to the next interval
- Intervals: immediate → 5 min → 30 min → next session → next day
- This means the game naturally teaches the words the player struggles with

---

## 🎮 UI DESIGN

### Power-Up Prompt (Full Screen Overlay)
```
┌──────────────────────────────────────┐
│                                      │
│     ⚡ CHARGE YOUR WEAPON! ⚡          │  <- Gold text, pulsing
│                                      │
│     What does 'SURVIVE' mean?        │  <- White text, large
│                                      │
│  ┌──────────┐  ┌──────────┐      │
│  │ รอดชีวิต  │  │  วิ่ง    │      │  <- Big buttons (60pt+)
│  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐      │
│  │  นอน    │  │  กิน    │      │
│  └──────────┘  └──────────┘      │
│                                      │
│         [──────── TIMER ───]         │  <- Purple bar, shrinking
│                                      │
└──────────────────────────────────────┘
```

### Colors
- Background: Dark (#0f0f1a) with 80% opacity overlay
- Title: Gold (#f59e0b) pulsing glow
- Question: White
- Answer buttons: Purple (#a855f7) border, Dark fill
- Correct flash: Gold burst
- Wrong flash: Subtle red shake (gentle, not punishing)
- Timer bar: Purple, turns Gold when <3 seconds
- **NO BLUE ANYWHERE**

### Charged Weapon VFX
When answer is correct:
- Weapon gains Purple energy aura (particle emitter)
- Gold sparks on each swing
- Hit effect: Purple impact + Gold coin burst
- Duration indicator: small Purple bar under health
- Sound: satisfying power-up chime

---

## 📚 WORD DATABASE STRUCTURE

```lua
local WordDatabase = {
    {
        id = "survive_001",
        english = "survive",
        thai = "รอดชีวิต",
        level = 1,
        category = "core",
        distractors = {"วิ่ง", "นอน", "กิน"},
        sentence = "I must ___ this wave of brainrots!",
        audio_id = nil, -- future
    },
    -- ... hundreds more
}
```

### Content Pipeline
1. **Phase 1 (Launch):** 100 core words, manually curated
2. **Phase 2 (Week 2):** 300 words, expanding categories
3. **Phase 3 (Month 1):** 500+ words, community-contributed
4. **Phase 4 (Month 2+):** Listening exercises, sentence building

### Word Categories
- **Core** (L1): survive, attack, defend, run, jump, strong, weak
- **Combat** (L1-2): weapon, shield, health, damage, power, armor
- **Daily Life** (L2): eat, sleep, work, school, friend, family
- **Emotions** (L2-3): happy, angry, scared, brave, confident
- **Advanced** (L3+): negotiate, strategy, resilient, persistent

---

## 📈 LEARNING METRICS (INVISIBLE TO PLAYER)

| Metric | Tracked | Purpose |
|--------|---------|--------|
| Words learned (3+ correct) | Per player | Progress |
| Accuracy rate | Per word | SRS weighting |
| Response time | Per answer | Difficulty calibration |
| Streak length | Per session | Engagement |
| Words per session | Aggregate | Content pacing |
| Most missed words | Aggregate | Content improvement |

These metrics feed into the Natural English Training platform.
The game is the acquisition channel. The learning data is the product.

---

## 🔗 INTEGRATION POINTS

1. **GameMain** — triggers Power-Up prompt after charge meter fills
2. **HUDController** — renders the prompt UI + charged weapon indicator
3. **EconomyManager** — grants bonus coins on correct answer
4. **FTUEManager** — first Power-Up at 30 seconds (simplified, 2 choices)
5. **DailyChallenge** (Stage 12) — "Answer 10 English questions" challenge
6. **Leaderboard** (Stage 13) — "Most English words learned" board

---

## ✅ DEFINITION OF DONE

- [ ] EnglishPowerUp.lua module created
- [ ] 100 core words database populated
- [ ] Power-Up UI implemented (mobile-first, 60pt buttons)
- [ ] Charged weapon VFX (Purple aura + Gold sparks)
- [ ] SRS-lite algorithm working
- [ ] Integration with GameMain charge meter
- [ ] Integration with EconomyManager for coin bonus
- [ ] Gospel 444 compliance verified (no blue)
- [ ] Tested on mobile (touch targets, readability)

---

*Source: Gospel 444 Teaching Methods, Q8 (FTUE), Mouse→Tiger principle*
*Pipeline: Stage 8 of 20 — 20-Stage Train 6-7 Launch Pipeline*
*This is the SOUL of the game. English as power, not punishment.*
