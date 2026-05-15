# Mobile-First English Input Design — Survive a Brainrot
## The Core Product Question: How Do Players Use English on Mobile?
## Active Mission: "100% Roblox — Know What We Don't Know"

**Date:** 2026-03-27  
**Artifact Class:** 🔨 BUILD  
**Run:** Pulse 45  
**Source Files:**  
- `STAGE-07-MOBILE-CONTROLS-AUDIT.md` (control scheme baseline)  
- `RobloxLaunchIntelligence-DeepDive-GapClosure.md` Gap 10 (cross-platform UI)  
- `HUDController_v2.lua` (current implementation)  
- Roblox Creator Hub — Mobile Input docs + UI/UX Design docs  
- Web research: DevForum mobile UX best practices, typing game analysis  

---

## 🔴 WHY THIS DOCUMENT EXISTS

**English is the mechanic. Money is the mission.**

70% of Roblox players are on mobile. The ENTIRE revenue model depends on players engaging with English content. If English input is painful on mobile, 70% of potential revenue walks away in the first 30 seconds.

This isn't a UI polish task. This is THE product design decision that determines if the game makes money or dies.

### The Fundamental Tension
- English learning requires PRODUCTION (typing, speaking, constructing)
- Mobile devices make production HARD (tiny keyboards, no tactile feedback, screen occlusion)
- Solution: Design input mechanics that feel like GAMING, not like homework

---

## 📱 THE FOUR INPUT MODES

### Mode 1: TAP SELECT (Primary Mobile — Lowest Friction)

**What:** Player taps the correct answer from 2-4 options  
**When:** Default mode for all mobile players  
**Friction:** ⭐ (minimal)  
**Learning depth:** Recognition-level (receptive skill)  

```
┌─────────────────────────────────┐
│  🧟 Zombie says: "I'm very ___" │
│                                   │
│  ┌─────────┐  ┌─────────┐       │
│  │  HUNGRY  │  │  CHAIR  │       │
│  └─────────┘  └─────────┘       │
│  ┌─────────┐  ┌─────────┐       │
│  │  PURPLE  │  │  FAST   │       │
│  └─────────┘  └─────────┘       │
│                                   │
│  ⏱️ ████████░░ 3.2s              │
└─────────────────────────────────┘
```

**Design Rules:**
- Buttons: 60pt minimum height (exceeds Apple 44pt guideline)
- 2 options for beginners, 4 for intermediate+
- Timer bar visible but generous (5-8 seconds)
- Wrong answer = button shakes + red flash (0.3s), correct = green glow + coin particle
- Auto-advance after selection — no "Next" button needed
- Answer positions randomized every question to prevent pattern learning

**Gospel 444 Alignment:**
- Mouse → Tiger: Start with 2 easy options, earn harder 4-option questions
- Permission over perfection: ANY tap = engagement, wrong answers still teach
- 10-Minute Rule: Questions must not interrupt combat flow for more than 5 seconds

**Implementation (matches HUDController_v2.lua):**
- QuestionUI container: 90% screen width on mobile, anchored bottom
- 4 TextButtons in UIListLayout, 60px height each
- `Activated` event (not `MouseButton1Click`) for cross-platform
- Timer frame with tween countdown

---

### Mode 2: WORD BUILDER (Medium Friction — Mobile Enhanced)

**What:** Player drags/taps word fragments to build a phrase  
**When:** Unlocked at Level 5 or when player opts in  
**Friction:** ⭐⭐ (moderate)  
**Learning depth:** Construction-level (productive skill)  

```
┌──────────────────────────────────┐
│  Build the sentence:              │
│                                    │
│  [ ___ ] [ ___ ] [ ___ ] [ ___ ]  │   ← Drop slots
│                                    │
│  ┌────┐ ┌──────┐ ┌────┐ ┌───┐   │
│  │ is │ │ name │ │ My │ │ ? │   │   ← Word bank
│  └────┘ └──────┘ └────┘ └───┘   │
│  ┌──────┐ ┌─────┐               │
│  │ what │ │ Bob │               │
│  └──────┘ └─────┘               │
│                                    │
│  ⏱️ ████████████░░ 8.5s          │
└──────────────────────────────────┘
```

**Design Rules:**
- Word tiles: 48pt minimum, rounded corners, distinct colors per word type (noun=gold, verb=green, article=gray)
- TAP to place (not drag) — dragging on mobile is imprecise and conflicts with camera control
- Tap a placed word to return it to the bank
- Drop slots auto-size to word length
- Include 1-2 distractor words (wrong words that don't fit)
- Longer timer (8-12 seconds) since this requires more thought
- Partial credit: 3/4 words correct = 75% reward (Mouse → Tiger)

**Roblox-Specific Implementation:**
- Use `TextButton` grid with `UIGridLayout` for word bank
- Slots are `Frame` objects that accept word assignment via tap
- State machine: EMPTY → FILLED → LOCKED (on submit)
- Haptic feedback (`HapticService`) on successful word placement (mobile-only)

**Why Not Drag-and-Drop:**
- Roblox `UserInputService` touch events conflict with camera rotation
- `GuiObject.Draggable` is deprecated
- Custom drag requires eating `TouchMoved` events → breaks camera
- TAP-TO-PLACE is universally reliable across all Roblox mobile devices

---

### Mode 3: SPEED TYPE (Desktop Primary — High Production)

**What:** Player types the answer using physical keyboard  
**When:** Auto-enabled on desktop (keyboard detected), optional on mobile  
**Friction:** ⭐⭐⭐ (high on mobile, natural on desktop)  
**Learning depth:** Production-level (full productive skill)  

```
┌────────────────────────────────────┐
│  Translate: "ฉันหิวมาก"             │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ I am very hungry█            │   │  ← TextBox with cursor
│  └──────────────────────────────┘   │
│                                      │
│  ⏱️ ████████████████░░ 12.0s       │
│                                      │
│  💡 Hint: "I am very ____"          │
└────────────────────────────────────┘
```

**Design Rules:**
- `TextBox` with `ClearTextOnFocus = false`
- Placeholder text shows hint format (with blanks)
- Case-insensitive matching
- Fuzzy matching: accept common typos (1 Levenshtein distance = partial credit)
- Auto-capitalize first word
- Submit on Enter key (desktop) or "Submit" button (mobile fallback)
- 12-15 second timer (typing takes time)
- Progressive hints: after 5s with no input, reveal first letter

**Mobile Keyboard Handling (THE HARD PROBLEM):**
- Roblox's mobile `TextBox` opens the native OS keyboard
- OS keyboard covers bottom ~40% of screen
- QuestionUI MUST reposition above keyboard when TextBox is focused
- Use `TextBox.Focused` / `TextBox.FocusLost` events to animate UI position
- On iOS: keyboard height varies (standard vs autocomplete bar)
- **Recommendation: Only offer Speed Type on mobile as OPT-IN advanced mode**
- Default mobile players to Tap Select — never force keyboard on touch users

**Known Roblox TextBox Issues (from DevForum research):**
- Samsung devices: TextBox content doesn't update visually while typing (known bug)
- Some Android keyboards send characters out of order
- Autocorrect can change answers before submission
- **Mitigation:** Disable autocorrect via `TextBox.TextEditable` workaround OR accept autocorrected valid English as correct

---

### Mode 4: QUICK REACT (All Platforms — Reflex-Based)

**What:** Single correct word flashes among wrong words; tap/click the right one before it disappears  
**When:** Mid-combat power-up moments, boss fights, bonus rounds  
**Friction:** ⭐ (minimal but exciting)  
**Learning depth:** Vocabulary recognition (reflexive)  

```
┌──────────────────────────────────┐
│                                    │
│        ┌────────┐                 │
│        │ DRAGON │  ← flying across│
│        └────────┘    screen       │
│   ┌───────┐                       │
│   │ CHAIR │      ┌────────┐      │
│   └───────┘      │ PURPLE │      │
│                   └────────┘      │
│  "Tap the ANIMAL!"               │
│                                    │
└──────────────────────────────────┘
```

**Design Rules:**
- Words float/fly across screen as `TextButton` objects with `TweenService` animations
- Player must tap the correct category word before it exits screen
- Wrong tap = small penalty (0.5s stun), correct = damage bonus + particles
- Words move faster at higher difficulties
- Touch targets: 56pt minimum (larger than normal because they're MOVING)
- Maximum 6 words on screen simultaneously (prevents clutter on mobile)
- Speed scales with device: slightly slower on mobile (touch is less precise than click)

**Combat Integration:**
- Triggers during "English Power-Up" charge moments
- Correct taps fill the combo meter
- 3 correct in a row = SUPER ATTACK unlocked
- This is the "popcorn" mechanic — light, fast, addictive between heavier questions

---

## 🎯 PLATFORM DETECTION & MODE SELECTION

### Automatic Mode Assignment

```lua
local UserInputService = game:GetService("UserInputService")

local function getDefaultInputMode()
    if UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled then
        return "TAP_SELECT"  -- Pure mobile
    elseif UserInputService.TouchEnabled and UserInputService.KeyboardEnabled then
        return "TAP_SELECT"  -- Tablet with keyboard (default to touch)
    elseif UserInputService.GamepadEnabled then
        return "TAP_SELECT"  -- Console (no keyboard)
    else
        return "SPEED_TYPE"  -- Desktop with keyboard
    end
end
```

### Player Override (Settings Menu)

| Setting | Options | Default |
|---------|---------|---------|
| English Input Mode | Tap Select / Word Builder / Speed Type | Auto-detect |
| Difficulty | Beginner (2 options) / Normal (4) / Hard (4 + timer) | Normal |
| Quick React Speed | Slow / Normal / Fast | Normal |
| Show Hints | On / Off | On |
| Keyboard on Mobile | Enable / Disable | Disable |

**Key Rule:** NEVER force a harder input mode. Players self-select up. Mouse → Tiger.

---

## ⚡ THE ENGLISH-COMBAT INTEGRATION LOOP

### How English Powers Combat (The Money Mechanic)

```
COMBAT LOOP:
  Fight enemies → English question triggers → Answer correctly →
  → Damage boost + Coins + Combo meter fills →
  → Combo maxed = SUPER ATTACK →
  → More enemies die = more loot = more upgrades →
  → Harder enemies = harder English = bigger rewards →
  → REPEAT
```

### Question Trigger Points (When English Appears)

| Trigger | Frequency | Mode Used | Timer |
|---------|-----------|-----------|-------|
| Enemy kill streak (every 3rd kill) | High | Tap Select | 5s |
| Boss fight phase transition | Medium | Word Builder | 10s |
| Treasure chest / loot box | Medium | Tap Select | 5s |
| Daily challenge | Low (1/day) | Speed Type (desktop) / Word Builder (mobile) | 15s |
| PvP arena | High | Quick React | 3s |
| FTUE (first 60 seconds) | Once | Tap Select (2 options) | 8s |

### Reward Scaling by Input Mode

| Mode | Base Coins | Rationale |
|------|-----------|-----------|
| Tap Select (2 options) | 10 | Low difficulty = low reward |
| Tap Select (4 options) | 20 | Standard |
| Word Builder | 35 | Higher effort = higher reward |
| Speed Type | 50 | Maximum effort = maximum reward |
| Quick React (per word) | 5 | Fast + frequent = accumulates |

**This creates a natural incentive to try harder modes WITHOUT punishing mobile-only players.**

---

## 📐 SCREEN LAYOUT — MOBILE PORTRAIT

```
┌──────────────────────────────────┐
│ [Wave] [HP████████] [🪙 150 💎 3]│  ← Top bar: INFO ONLY (no tappable)
│                                    │
│                                    │
│          GAME VIEW                 │  ← 60% of screen: clean gameplay
│       (no UI clutter)              │
│                                    │
│                                    │
├──────────────────────────────────┤
│  🧟 "What does SURVIVE mean?"     │  ← Question appears here
│  ┌──────────┐  ┌──────────┐      │
│  │ Live     │  │ Run      │      │     Bottom 40%: English UI
│  └──────────┘  └──────────┘      │     (overlays game, doesn't replace)
│  ┌──────────┐  ┌──────────┐      │
│  │ Eat      │  │ Sleep    │      │
│  └──────────┘  └──────────┘      │
│           ⏱️ ████░░ 2.1s         │
├──────────────────────────────────┤
│ [JOYSTICK]          [ATK] [JMP]  │  ← Controls always visible
│                     [SPL] [🛍️]   │     underneath question panel
└──────────────────────────────────┘
```

### Critical Layout Rules
1. **Question UI anchored to bottom, ABOVE controls** — never cover joystick/attack buttons
2. **Game view stays visible** — player can still see enemies approaching while answering
3. **Question panel slides up** with `TweenService` (0.2s ease-out), doesn't pop
4. **Question auto-dismisses** after answer — no manual close needed
5. **During boss fights:** question panel can be larger (50% screen) since combat pauses
6. **Safe area compliance:** respect `GuiService:GetGuiInset()` for notch/punch-hole cameras

---

## 🧪 FTUE — FIRST ENGLISH MOMENT (Critical for Retention)

### The 10-Second English Hook

Current FTUE has 9 tutorial steps. **Fatal.** Here's the redesigned first English encounter:

**Second 0-3:** Player spawns, sees zombie. Attacks with tap. Zombie takes damage.  
**Second 3-5:** Zombie drops a glowing "?" orb. Player walks over it (auto-pickup).  
**Second 5-8:** Screen: "⚡ ENGLISH POWER!" — 2-option question appears:  
```
"What is this? 🧟"
[ZOMBIE]  [BANANA]
```
**Second 8-9:** Player taps ZOMBIE (obviously correct). Gold particles explode. "+50 🪙 BONUS!"  
**Second 9-10:** Player's next attack does 3x damage. Zombie dies. "ENGLISH MAKES YOU POWERFUL!"

### FTUE Design Principles
- **First question is impossible to get wrong** (2 absurd options)
- **Reward is HUGE** (5x normal) — dopamine spike on first English interaction
- **Visual link is immediate:** English → more damage → more loot
- **Zero text tutorial** — pure show-don't-tell
- **Second question (30s later):** Slightly harder, 3 options. Still generous timer.
- **Third question (60s later):** Standard 4 options. Normal timer. Player is hooked.

### Progression Curve (First Session)

| Time | Options | Timer | Reward Multiplier | Purpose |
|------|---------|-------|-------------------|---------|
| 0-10s | 2 (trivial) | 10s | 5x | Hook — "English = power" |
| 30s | 3 (easy) | 8s | 3x | Reinforce — "I can do this" |
| 60s | 4 (normal) | 6s | 2x | Standard — "This is the game" |
| 2min+ | 4 (scaled) | 5s | 1x | Steady state — natural difficulty |
| 5min+ | Word Builder unlocks | 10s | 1.5x | Depth — "I want more challenge" |

---

## 🌍 LOCALIZATION OF QUESTION LANGUAGE

### The L1 → L2 Bridge

Questions must bridge FROM the player's native language TO English. The game supports:

| Player Language | Question Format | Example |
|----------------|----------------|---------|
| Thai (primary market) | Thai prompt → English answer | "แปลว่าอะไร: ซอมบี้?" → [ZOMBIE] |
| Vietnamese | Vietnamese prompt → English answer | "Dịch: con quái vật?" → [MONSTER] |
| Chinese | Chinese prompt → English answer | "翻译：跑步" → [RUN] |
| Japanese | Japanese prompt → English answer | "翻訳：食べる" → [EAT] |
| English (default) | English definition → English word | "A creature that eats brains" → [ZOMBIE] |

### Auto-Detection
- Use `LocalizationService:GetCountryRegionForPlayerAsync()` for initial guess
- Settings menu: explicit language selection
- Fall back to English-only if L1 not supported

---

## 📊 QUESTION DATABASE ARCHITECTURE

### Schema

```lua
local QuestionBank = {
    {
        id = "vocab_001",
        level = 1,
        type = "TAP_SELECT",
        category = "animals",
        prompt = { en = "What is this? 🧟", th = "นี่คืออะไร? 🧟" },
        correct = "ZOMBIE",
        distractors = { "BANANA", "CHAIR", "PURPLE" },
        difficulty = 1,  -- 1-10 scale
        tags = { "noun", "beginner", "ftue_safe" },
    },
    -- ...
}
```

### Difficulty Scaling Algorithm

```
Player Skill Rating (Elo-style):
- Start: 1000
- Correct answer: +10 to +30 (scaled by difficulty)
- Wrong answer: -5 to -15
- Timeout: -10

Question Selection:
- Pick questions within ±200 of player skill rating
- 70% at skill level, 20% slightly harder, 10% slightly easier
- Never repeat same question within 20 questions
- Track per-word mastery: words answered correctly 3x in a row → mastered → reduce frequency
```

### Content Scale Requirements

| Level | Vocabulary | Sentence Patterns | Total Questions |
|-------|-----------|-------------------|-----------------|
| Beginner (1-3) | 200 words | 20 patterns | ~500 |
| Intermediate (4-6) | 500 words | 50 patterns | ~1,500 |
| Advanced (7-10) | 1,000 words | 100 patterns | ~3,000 |
| **Total MVP** | **200 words** | **20 patterns** | **~500** |

MVP launches with Beginner tier only. Content scales with updates.

---

## 💰 MONETIZATION TOUCH POINTS IN ENGLISH UI

### Where Money Meets English

| Mechanic | Free Tier | Premium Tier (Game Pass) |
|----------|----------|------------------------|
| Questions per session | Unlimited | Unlimited |
| Hint reveals | 3 per day | Unlimited |
| Wrong answer retry | Wait 5s | Instant retry |
| Word Builder mode | Unlock at Level 5 | Unlock at Level 1 |
| Speed Type bonus | +50 coins | +100 coins |
| Daily challenge reward | 100 coins | 250 coins + exclusive item |
| Question categories | Core vocab | Core + slang + business + gaming |
| Progress tracking | Basic (level only) | Detailed (words mastered, accuracy %) |

### The "$1.99 English Power Pass" (Primary Revenue Item)
- Unlimited hints
- Instant retry
- Early Word Builder unlock
- Double coins on all English answers
- Exclusive "Scholar" aura effect
- **Value prop: "Learn faster, earn faster"**
- Price: 199 Robux (~$2.49)

---

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1: MVP (Pre-Launch)
- [x] Tap Select with 4 options (HUDController_v2.lua — DONE)
- [ ] Platform detection for input mode switching
- [ ] Question database (200 words minimum)
- [ ] FTUE 10-second hook sequence
- [ ] Reward integration (coins per correct answer)
- [ ] Timer bar with visual countdown
- [ ] Basic difficulty scaling (level-based, not Elo yet)

### Phase 2: Week 1 Post-Launch
- [ ] Quick React mode (combat integration)
- [ ] Word Builder mode (Level 5 unlock)
- [ ] Thai/Vietnamese L1 prompts
- [ ] Per-word mastery tracking
- [ ] English Power Pass game pass

### Phase 3: Month 1
- [ ] Elo-style skill rating
- [ ] Speed Type for desktop (opt-in on mobile)
- [ ] Full 500-word beginner question bank
- [ ] Leaderboards (English score)
- [ ] UGC limited items tied to English milestones

---

## 🧪 TESTING CHECKLIST

### Mobile Testing Matrix

| Device | OS | Screen | Must Test |
|--------|----|--------|-----------|
| iPhone SE (2020) | iOS 15+ | 4.7" | Minimum spec. All UI readable? |
| iPhone 14 | iOS 16+ | 6.1" | Notch safe area. Dynamic Island? |
| iPad Air | iPadOS | 10.9" | Landscape mode. Button sizing? |
| Samsung A13 | Android 12 | 6.6" | TextBox bug. Keyboard overlap? |
| Xiaomi Redmi Note | Android 11 | 6.5" | Low-end GPU. FPS during questions? |

### Critical Test Cases

1. **Question appears during combat** — can player still see enemies?
2. **Question auto-dismisses** — does UI clean up after answer?
3. **Keyboard opens on mobile** — does UI reposition correctly?
4. **Rapid-fire questions** — 3 questions in 10 seconds. Any UI collision?
5. **Network lag** — answer submitted, server confirms late. Does UI handle gracefully?
6. **Player dies during question** — does question dismiss? Does answer still count?
7. **Screen rotation** — landscape ↔ portrait. Does layout adapt?
8. **Low memory device** — do question UI textures load? Fallback?

---

## 📋 DECISION LOG

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | Tap Select as default mobile input | Lowest friction, highest engagement. 70% of players are mobile. | ✅ LOCKED |
| 2 | TAP-to-place, NOT drag-and-drop for Word Builder | Roblox touch events conflict with camera. Drag is unreliable. | ✅ LOCKED |
| 3 | Speed Type is OPT-IN only on mobile | Forcing keyboard = rage quit. Desktop players get it by default. | ✅ LOCKED |
| 4 | First question is impossible to fail | FTUE hook must deliver dopamine, not frustration. Mouse → Tiger. | ✅ LOCKED |
| 5 | English ENHANCES combat, doesn't GATE it | Players can fight without English. English = bonus damage/loot. | ✅ LOCKED |
| 6 | Higher input effort = higher reward | Natural incentive to try harder modes. No punishment for easy mode. | ✅ LOCKED |
| 7 | 5-second max question interruption during combat | Longer interruptions break flow. Boss fights can be longer (paused). | ✅ LOCKED |
| 8 | Auto-detect platform, allow manual override | Respect player preference. Some mobile players want typing. | ✅ LOCKED |

---

## CROSS-REFERENCES

- **Stage 7 Mobile Controls Audit:** `CANON/TRAIN-67/STAGE-07-MOBILE-CONTROLS-AUDIT.md` — button sizing, auto-aim, layout zones
- **Gap Closure (Gap 10):** `CANON/TRAIN-67/DOCS/RobloxLaunchIntelligence-DeepDive-GapClosure.md` — cross-platform UI decision
- **HUDController_v2.lua:** `CANON/TRAIN-67/CODE/HUDController_v2.lua` — current Tap Select implementation
- **Gospel 444 Canon:** `CANON/GOSPEL-444-TEACHING-METHODS-CONSOLIDATED.md` — Mouse → Tiger, 10-Minute Rule
- **NET Teaching Methodology:** `CANON/NET-TEACHING-METHODOLOGY.md` — pedagogical framework

---

*Generated by OB1 — Pulse Run 45 — 2026-03-27T01:00 ICT*  
*Active Mission: 100% Roblox — Know What We Don't Know*  
*Artifact Class: 🔨 BUILD*  
*Cross-repo sources: 3 (STAGE-07, Gap Closure, HUDController_v2)*  
*Gospel 444 alignment: Mouse → Tiger, Permission over Perfection, 10-Minute Rule*
