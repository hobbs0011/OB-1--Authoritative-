# FTUE Implementation Spec — Survive a Brainrot

> **Artifact Class:** 🔨 BUILD
> **Run:** 51 | **Date:** 2026-03-27 06:00 ICT
> **Active Mission:** 100% Roblox — MAKE MONEY is the only goal
> **Sources:** FTUECompressionAnalysis.md (`c47a1859`), MobileFirstEnglishInputDesign.md (`305efd84`), MonetizationArchitectureDeepDive.md (`63234bee`), AnalyticsTelemetryIntegrationSpec.md (`f182ccfd`), STAGE-01-FTUE-DESIGN-SPEC.md (`ef84a545`), FTUEManager.lua (`33a7d165`), FTUEWiring.lua (`5adf3afd`)
> **Cross-repo sources:** 7 files from `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`

---

## 1. Executive Summary

The FTUE (First Time User Experience) is the **single highest-leverage system** in Survive a Brainrot. A player who doesn't hook in 60 seconds never pays. 70% of players are on mobile. If the first English interaction is painful, confusing, or slow, 70% of potential revenue walks away.

This spec is the **unified implementation blueprint** — it reconciles two existing code architectures (FTUEManager.lua timer-based + FTUEWiring.lua step-based), incorporates the 90→60s compression from Run 46, wires mobile-first input from Run 45, adds the monetization hook sequence missing from Run 47's gap analysis, integrates analytics from Run 50, and delivers a complete build plan with module-level pseudocode.

**This document answers one question: exactly what gets built, in what order, to make the FTUE convert players into payers.**

### Key Decisions (LOCKED)

| # | Decision | Source | Status |
|---|---|---|---|
| 1 | FTUE target: **60 seconds** (compressed from 90s) | Run 46 Analysis | ✅ LOCKED |
| 2 | Default mobile input: **Tap Select** (2 options for FTUE) | Run 45 Design | ✅ LOCKED |
| 3 | First question is **impossible to fail** | Run 45 Design | ✅ LOCKED |
| 4 | Monetization tease at **second 42-48** | Run 46 + Run 47 | ✅ LOCKED |
| 5 | English **enhances** combat, doesn't **gate** it | Run 45 Design | ✅ LOCKED |
| 6 | Mouse tier split into **Mouse-A / Mouse-B** | Run 46 Analysis | ✅ LOCKED |
| 7 | **Solo-first** — no multiplayer until FTUE complete | STAGE-01 Spec | ✅ LOCKED |
| 8 | Architecture: **hybrid timer+step** (unified from two modules) | This spec | ✅ LOCKED |

---

## 2. Architecture Reconciliation — FTUEManager vs FTUEWiring

### The Problem

Two separate FTUE modules exist with incompatible architectures:

| Aspect | FTUEManager.lua | FTUEWiring.lua |
|---|---|---|
| **Model** | Timer-gated (90-second countdown) | Step-based (9 sequential steps) |
| **Flow control** | Wall-clock timer drives transitions | Step completion drives transitions |
| **Question delivery** | Inline within timer phases | Via `fireQuestion()` at specific steps |
| **DataStore** | Saves completion state directly | Routes through `UnifiedServer` |
| **Solo mode** | `soloMode = true` flag | Not referenced |
| **Difficulty** | `difficultyTable` with tier thresholds | Not referenced |
| **Skip detection** | `checkReturningPlayer()` | `detectSkip()` via DataStore |
| **Strengths** | Timing precision, difficulty scaling, solo isolation | Clean step sequencing, UnifiedServer integration, modular wiring |
| **Weaknesses** | No step abstraction, monolithic flow, no mobile input | No timing control, no difficulty scaling, no monetization window |

### The Solution: Hybrid Timer+Step Architecture

**Merge both.** The unified FTUEController uses:
- **Steps** from FTUEWiring for clean sequencing and modularity
- **Timer** from FTUEManager for pacing discipline and compression targets
- **UnifiedServer integration** from FTUEWiring for DataStore consistency
- **Solo mode + difficulty scaling** from FTUEManager for gameplay isolation
- **NEW:** Mobile input mode, monetization hook, analytics integration

```
FTUEController.lua (NEW — replaces both modules)
├── Imports
│   ├── InputModeManager (from Run 45)
│   ├── MonetizationOrchestrator (from Run 47)
│   ├── AnalyticsService (from Run 50)
│   ├── QuestionService (server question bank)
│   └── UnifiedServer (DataStore gateway)
├── State
│   ├── currentStep: number (1-8)
│   ├── elapsedTime: number (0-60s target)
│   ├── correctCount: number
│   ├── totalAnswered: number
│   ├── tierReached: string ("Mouse-A" | "Mouse-B" | "Cat")
│   ├── soloMode: boolean (true during FTUE)
│   └── isComplete: boolean
├── Step Definitions (timer-bounded)
│   ├── Step 1: Intro + Tutorial Merged (0-5s)
│   ├── Step 2: Question 1 — Mouse-A (5-15s)
│   ├── Step 3: Reward Burst (15-17s)
│   ├── Step 4: Questions 2-3 — adaptive (17-35s)
│   ├── Step 5: Chest Spawn + Auto-Open (35-42s)
│   ├── Step 6: Premium Tease (42-48s) ← MONEY MOMENT
│   ├── Step 7: FTUE Complete + CTA (48-55s)
│   └── Step 8: Transition to Main Game (55-60s)
└── Hooks
    ├── onStepStart(step) → analytics event
    ├── onQuestionAnswered(result) → scoring + analytics
    ├── onFTUEComplete() → DataStore + analytics + monetization
    └── onFTUEAbandoned(step) → analytics + retry hook
```

### Migration Path

1. FTUEController.lua is a **new module** — does not modify existing files
2. FTUEManager.lua and FTUEWiring.lua remain as reference/fallback
3. UnifiedServer init script swaps to FTUEController when ready
4. Feature flag: `FTUE_VERSION = "v2"` controls which module loads

---

## 3. The 60-Second Compressed Flow

### Flow Diagram

```
TIME  STEP  ACTION                                      ANALYTICS EVENT
─────────────────────────────────────────────────────────────────────────
0s    1     Camera fly-in + animated hand on Q1         ftue_started
      1     "Tap to answer!" overlay ON first question  ftue_question_shown
5s    2     Question 1: Mouse-A (2 options, trivial)    ftue_question_shown
            Player taps correct answer                  ftue_question_answered
15s   3     REWARD BURST: gold particles + "+50 🪙"     (inline)
            + haptic buzz (mobile) + 3x damage flash
17s   4     Question 2: Mouse-A (3 options, easy)       ftue_question_shown
            Question 3: Mouse-B OR Cat (adaptive)       ftue_question_shown
35s   5     Chest spawns at player's feet               ftue_chest_spawned
            Auto-opens on approach (no walk mechanic)   ftue_chest_opened
42s   6     ★ PREMIUM TEASE ★                           ftue_premium_tease_shown
            Locked golden chest: "Premium members
            get this!" + preview of Tiger-tier aura
48s   7     FTUE COMPLETE                               ftue_completed
            "ENGLISH MAKES YOU POWERFUL!"
            Clear "PLAY MORE" CTA button
55s   8     Warp to main game area (instant, no load)   session_heartbeat
            Solo mode OFF → multiplayer enabled
60s   —     Grace buffer for slow readers               —
─────────────────────────────────────────────────────────────────────────
```

### Compression Levers (from Run 46)

| Lever | Savings | How |
|---|---|---|
| Merge intro + tutorial | **-13s** | Animated hand pointer appears ON first question. No separate tutorial screen. |
| Merge chest spawn + open | **-13s** | Chest spawns at player's feet, auto-opens on approach. No walk-to-chest. |
| Tighter reward burst | **-1s** | 2s instead of 3s. Players want to keep going. |
| Faster transition | **-5s** | No loading screen. Instant warp to main game area. |
| Add monetization window | **+6s** | Premium tease at s42-48. Costs 6s but is the entire revenue justification. |
| **Net** | **-26s** | **90s → ~55-60s with monetization hook added** |

### Timer Discipline

The timer is a **pacing guide**, not a hard gate. Steps can complete early (player answers fast) but cannot exceed their time window:

```lua
local STEP_BUDGETS = {
    [1] = { maxTime = 5,  name = "IntroTutorial" },
    [2] = { maxTime = 10, name = "Question1" },
    [3] = { maxTime = 2,  name = "RewardBurst" },
    [4] = { maxTime = 18, name = "Questions2_3" },
    [5] = { maxTime = 7,  name = "ChestSpawnOpen" },
    [6] = { maxTime = 6,  name = "PremiumTease" },
    [7] = { maxTime = 7,  name = "FTUEComplete" },
    [8] = { maxTime = 5,  name = "Transition" },
}
-- Total budget: 60 seconds
-- If a step finishes early, next step starts immediately
-- If a step hits maxTime, force-advance to next step
```

---

## 4. Mobile Input Integration

### FTUE Default: Tap Select (2 Options)

From Run 45's Mobile-First English Input Design, the FTUE uses Mode 1: TAP SELECT exclusively.

```
┌─────────────────────────────────┐
│  🧟 Zombie says: "I'm very ___" │
│                                   │
│  ┌─────────────┐                 │
│  │   HUNGRY     │  ← correct     │
│  └─────────────┘                 │
│  ┌─────────────┐                 │
│  │   CHAIR      │  ← absurd      │
│  └─────────────┘                 │
│                                   │
│  ⏱️ ████████████░░ 7.2s          │
└─────────────────────────────────┘
```

### FTUE-Specific Input Rules

| Rule | Value | Rationale |
|---|---|---|
| Options count | 2 for Q1, 3 for Q2, 4 for Q3 | Progressive difficulty |
| Button height | 60pt minimum | Exceeds Apple 44pt guideline (thumb-friendly) |
| Timer | 8s (Q1), 6s (Q2), 5s (Q3) | Generous → standard ramp |
| Wrong answer | Button shakes + red flash (0.3s) | Feedback without punishment |
| Correct answer | Green glow + coin particle + haptic | Dopamine hit |
| Auto-advance | Yes — no "Next" button | Zero friction |
| Position randomization | Yes | Prevent pattern learning |

### Platform Detection (from Run 45)

```lua
local function getDefaultInputMode()
    local UIS = game:GetService("UserInputService")
    if UIS.TouchEnabled and not UIS.KeyboardEnabled then
        return "TAP_SELECT"  -- Pure mobile (70% of players)
    elseif UIS.TouchEnabled and UIS.KeyboardEnabled then
        return "TAP_SELECT"  -- Tablet with keyboard (default to touch)
    elseif UIS.GamepadEnabled then
        return "TAP_SELECT"  -- Console (no keyboard)
    else
        return "TAP_SELECT"  -- FTUE is ALWAYS tap select, even desktop
    end
end
-- Note: Desktop players get TAP_SELECT during FTUE.
-- Speed Type unlocks post-FTUE for desktop players.
```

### Screen Layout — Mobile Portrait (FTUE)

```
┌──────────────────────────────────┐
│ [Wave 1]  [HP████████]  [🪙 0]   │  ← Top bar (info only)
│                                    │
│                                    │
│          GAME VIEW                 │  ← 60% screen: gameplay visible
│     (zombie approaching)           │     during questions
│                                    │
│                                    │
├──────────────────────────────────┤
│  🧟 "What is this?"               │  ← Question slides up (0.2s ease)
│  ┌──────────────────────────────┐ │
│  │          ZOMBIE              │ │     Bottom 35%: English UI
│  └──────────────────────────────┘ │     (overlays, doesn't replace)
│  ┌──────────────────────────────┐ │
│  │          BANANA              │ │
│  └──────────────────────────────┘ │
│           ⏱️ ████████░░ 6.1s     │
├──────────────────────────────────┤
│ [JOYSTICK]          [ATK] [JMP]  │  ← Controls always visible
└──────────────────────────────────┘
```

**Critical rules:**
1. Question UI anchored ABOVE controls — never cover joystick/attack buttons
2. Game view stays visible — player sees enemies while answering
3. Question panel slides up with `TweenService` (0.2s ease-out)
4. Question auto-dismisses after answer
5. Safe area compliance: `GuiService:GetGuiInset()` for notch/punch-hole

### FTUEController Integration Points

```lua
-- In FTUEController.lua Step 2 (Question 1):
local InputModeManager = require(path.to.InputModeManager)
InputModeManager:SetMode("TAP_SELECT")
InputModeManager:SetOptionCount(2)  -- FTUE starts with 2

-- In Step 4 (Questions 2-3):
InputModeManager:SetOptionCount(3)  -- Q2 bumps to 3
-- If player scored >80% on Q1-Q2:
InputModeManager:SetOptionCount(4)  -- Q3 at 4 options

-- Haptic feedback (mobile only):
local HapticService = game:GetService("HapticService")
local function buzzOnCorrect(player)
    pcall(function()
        HapticService:SetMotor(Enum.UserInputType.Gamepad1,
            Enum.VibrationMotor.Small, 0.5)
        task.wait(0.15)
        HapticService:SetMotor(Enum.UserInputType.Gamepad1,
            Enum.VibrationMotor.Small, 0)
    end)
end
```

---

## 5. Question Bank — FTUE Tier Design

### Mouse-A / Mouse-B Split (from Run 46)

The current Mouse tier has 40 questions at roughly equal difficulty. For FTUE, this is a **hook-killer** — the first question shown must be trivially easy.

| Sub-Tier | Count | Difficulty | FTUE Usage | Examples |
|---|---|---|---|---|
| **Mouse-A** | 20 | Trivial (1-3/10) | Q1 always, Q2 usually | "What is this? 🧟" [ZOMBIE/BANANA] |
| **Mouse-B** | 20 | Easy (4-5/10) | Q3 if scoring <80% | "The zombie is very ___" [HUNGRY/PURPLE/CHAIR/FAST] |

### FTUE Weight System

```lua
-- Added to QuestionBank schema:
{
    id = "vocab_001",
    tier = "Mouse",
    subTier = "A",        -- NEW: "A" or "B"
    ftueWeight = 1.0,     -- NEW: 1.0 = always eligible for Q1
    category = "animals", -- NEW: topic tag
    prompt = { en = "What is this? 🧟", th = "นี่คืออะไร? 🧟" },
    correct = "ZOMBIE",
    distractors = { "BANANA", "CHAIR", "PURPLE" },
    difficulty = 1,
    tags = { "noun", "beginner", "ftue_safe" },
}
```

### FTUE Question Selection Algorithm

```lua
function selectFTUEQuestion(questionNumber, playerState)
    if questionNumber == 1 then
        -- ALWAYS Mouse-A, ftueWeight=1.0, 2 options (1 absurd distractor)
        return QuestionBank:GetRandom({
            subTier = "A",
            ftueWeight = 1.0,
            exclude = playerState.shownIds,
        })
    elseif questionNumber == 2 then
        -- Mouse-A, 3 options, slightly harder
        return QuestionBank:GetRandom({
            subTier = "A",
            exclude = playerState.shownIds,
        })
    elseif questionNumber == 3 then
        if playerState.correctRate > 0.8 then
            -- Ramp to Cat tier (adaptive)
            return QuestionBank:GetRandom({ tier = "Cat" })
        else
            -- Stay at Mouse-B
            return QuestionBank:GetRandom({ subTier = "B" })
        end
    end
end
```

### Struggling Detection Fix (from Run 46)

**Current:** `isStruggling` after 2 consecutive wrong answers — too aggressive for FTUE.
**Fix:** 3 consecutive wrong for FTUE mode. 2 remains the threshold post-FTUE.

```lua
local STRUGGLING_THRESHOLD = isFTUE and 3 or 2
```

---

## 6. Monetization Hook Sequence

### The Missing Piece (from Run 47)

The FTUE currently has **zero monetization touchpoints**. This is the single biggest revenue gap. The compressed 60s flow creates a dedicated 6-second monetization window at s42-48.

### FTUE Monetization Timeline

| Second | Trigger | Player Sees | Revenue Mechanism |
|---|---|---|---|
| 35-42 | 3 correct answers | Free chest auto-opens → basic reward + **glimpse of locked premium item** | Desire creation |
| 42-48 | Step 6 fires | Locked golden chest: "🔒 Premium Members Get This!" + preview Tiger-tier aura | Subscription tease |
| 48-55 | FTUE Complete | "Start Your Tiger Journey — First Week Free" CTA (NON-BLOCKING) | Trial conversion |
| 55-60 | Transition | "Come back tomorrow for a free Mystery Chest 🎁" | Retention + DAU |

### Step 6 Implementation — Premium Tease

```lua
-- Step 6: PremiumTease (s42-48, max 6 seconds)
function FTUEController:executePremiumTease(player)
    -- Analytics
    Analytics.TrackFTUE("premium_tease_shown", player, {
        teaseType = "golden_chest",
        timeInFTUE = self.elapsedTime,
        correctCount = self.correctCount,
        tierReached = self.tierReached,
    })

    -- Visual: locked golden chest with particle glow
    local teaseUI = FTUEUIManager:ShowPremiumTease({
        type = "golden_chest",
        text = "🔒 Premium Members Get This!",
        preview = "Tiger-Tier Aura",    -- show preview image
        colors = GOSPEL_444_PALETTE,     -- Purple/Gold, no blue
        duration = 5,                    -- auto-dismiss after 5s
        dismissable = true,              -- tap anywhere to dismiss
    })

    -- Track taps
    teaseUI.Tapped:Connect(function()
        Analytics.TrackFTUE("premium_tease_tapped", player, {
            teaseType = "golden_chest",
            timeInFTUE = self.elapsedTime,
        })
        -- Don't open store in FTUE — just plant the seed
        -- Store opens post-FTUE via MonetizationOrchestrator
    end)
end
```

### Post-FTUE Monetization Handoff (to MonetizationOrchestrator)

```lua
-- On FTUE Complete (Step 7):
function FTUEController:onFTUEComplete(player)
    -- Save completion
    UnifiedServer:SaveFTUECompletion(player, {
        totalTime = self.elapsedTime,
        correctCount = self.correctCount,
        tierReached = self.tierReached,
    })

    -- Hand off to MonetizationOrchestrator for post-FTUE offers
    MonetizationOrchestrator:OnFTUEComplete(player, {
        correctRate = self.correctCount / self.totalAnswered,
        tierReached = self.tierReached,
        tappedPremiumTease = self.tappedPremiumTease,
    })
    -- Orchestrator will show (in priority order):
    -- 1. Battle Pass (299 R$) if Season active
    -- 2. 2x Coins Pass (99 R$) — impulse buy
    -- 3. Starter Pack (one-time 50% off)
    -- All NON-BLOCKING — player can dismiss and play

    -- Set 24h return reminder
    DailyRewards:SetReturnHook(player, {
        reward = "mystery_chest",
        message = "Come back tomorrow for a free Mystery Chest! 🎁",
    })
end
```

### Gospel 444 Alignment

The sell is **confidence, not features**:
> "You just answered 3 questions correctly. Imagine what you'll do as a Tiger."

- Mouse → Tiger transformation is the value proposition
- Permission over perfection: wrong answers still teach, still reward
- English enhances combat — "ENGLISH MAKES YOU POWERFUL!" is the tagline
- Purple/Gold palette throughout (no blue — Gospel 444 compliant)

---

## 7. Analytics Integration

### FTUE Funnel Events (from Run 50)

Every step fires to AnalyticsService. The FTUE funnel is the **most critical analytics pipeline** — it shows exactly where money is being lost.

| Funnel Step | Event | Key Properties |
|---|---|---|
| Enter | `ftue_started` | `platform, isFirstEver` |
| See Q1 | `ftue_question_shown` | `questionId, questionNumber=1, tier="Mouse-A"` |
| Answer Q1 | `ftue_question_answered` | `isCorrect, responseTime, questionNumber=1` |
| See Q2 | `ftue_question_shown` | `questionNumber=2` |
| Answer Q2 | `ftue_question_answered` | `questionNumber=2` |
| See Q3 | `ftue_question_shown` | `questionNumber=3, tier=adaptive` |
| Answer Q3 | `ftue_question_answered` | `questionNumber=3` |
| Chest | `ftue_chest_spawned` | `timeInFTUE, correctCount` |
| Chest open | `ftue_chest_opened` | `rewardType, rewardAmount` |
| Premium tease | `ftue_premium_tease_shown` | `teaseType, timeInFTUE` |
| Tease tap | `ftue_premium_tease_tapped` | `teaseType` (optional) |
| Complete | `ftue_completed` | `totalTime, correctRate, tierReached, platform` |
| **OR** Abandon | `ftue_abandoned` | `abandonPhase, timeInFTUE, lastQuestionNumber` |

### Integration Code Pattern

```lua
local Analytics = require(path.to.AnalyticsService)

-- Every step start:
Analytics.TrackFTUE("step_started", player, {
    step = self.currentStep,
    stepName = STEP_BUDGETS[self.currentStep].name,
    timeInFTUE = self.elapsedTime,
})

-- Question answered:
Analytics.TrackFTUE("question_answered", player, {
    questionId = question.id,
    isCorrect = result,
    responseTime = answerTime,
    questionNumber = self.totalAnswered,
    inputMode = "TAP_SELECT",
    optionCount = currentOptionCount,
})

-- FTUE abandoned (player disconnect during FTUE):
Players.PlayerRemoving:Connect(function(player)
    if self.isActive and not self.isComplete then
        Analytics.TrackFTUE("abandoned", player, {
            abandonPhase = STEP_BUDGETS[self.currentStep].name,
            timeInFTUE = self.elapsedTime,
            lastQuestionNumber = self.totalAnswered,
        })
    end
end)
```

### Target Metrics (from Run 50)

| Metric | Target | Action if Below |
|---|---|---|
| FTUE Start Rate | >95% | Check spawn/trigger — are players even entering FTUE? |
| FTUE Completion Rate | >80% | Identify drop-off step — simplify that step |
| FTUE Duration (avg) | <60s | Check timer budgets — is something taking too long? |
| Q1 Correct Rate | >95% | If below, Q1 is too hard. Make it easier. |
| Premium Tease View Rate | >90% of completers | Tease should always show if they reach Step 6 |
| FTUE → First Purchase (24h) | >5% | Monetization offers not compelling enough |

---

## 8. Reward System — VFX & Feedback

### Reward Burst (Gap from Run 46)

`rewardBurst()` is called in FTUEManager but VFX is undefined. This spec defines it:

```lua
-- RewardVFX.lua (new module)
local RewardVFX = {}

function RewardVFX:BurstOnCorrect(player, multiplier)
    multiplier = multiplier or 1

    -- 1. Gold particle explosion (0.5s)
    local particles = Instance.new("ParticleEmitter")
    particles.Color = ColorSequence.new(
        Color3.fromHex("#FFD700"),  -- Gospel 444 Gold
        Color3.fromHex("#9B59B6")   -- Gospel 444 Purple
    )
    particles.Rate = 100 * multiplier
    particles.Lifetime = NumberRange.new(0.3, 0.8)
    particles.Speed = NumberRange.new(10, 25)
    particles.Parent = player.Character.HumanoidRootPart
    task.delay(0.5, function() particles:Destroy() end)

    -- 2. Floating text "+50 🪙" (rises and fades, 1s)
    local billboard = createFloatingText(player, {
        text = string.format("+%d 🪙", 50 * multiplier),
        color = Color3.fromHex("#FFD700"),
        size = 24 + (8 * multiplier),
        riseSpeed = 2,
        fadeTime = 1,
    })

    -- 3. Screen flash (0.1s gold overlay, 10% opacity)
    remoteEvent:FireClient(player, "ScreenFlash", {
        color = Color3.fromHex("#FFD700"),
        duration = 0.1,
        opacity = 0.1,
    })

    -- 4. Sound effect
    local sound = Instance.new("Sound")
    sound.SoundId = CORRECT_ANSWER_SOUND_ID  -- TBD: source from asset library
    sound.Volume = 0.7
    sound.Parent = player.Character.HumanoidRootPart
    sound:Play()
    task.delay(2, function() sound:Destroy() end)

    -- 5. Haptic (mobile)
    pcall(function()
        game:GetService("HapticService"):SetMotor(
            Enum.UserInputType.Gamepad1,
            Enum.VibrationMotor.Small, 0.5
        )
        task.wait(0.15)
        game:GetService("HapticService"):SetMotor(
            Enum.UserInputType.Gamepad1,
            Enum.VibrationMotor.Small, 0
        )
    end)
end

function RewardVFX:BurstOnIncorrect(player)
    -- Button shake + red flash handled by UI
    -- Sound only from server
    local sound = Instance.new("Sound")
    sound.SoundId = INCORRECT_ANSWER_SOUND_ID  -- TBD
    sound.Volume = 0.4
    sound.Parent = player.Character.HumanoidRootPart
    sound:Play()
    task.delay(1, function() sound:Destroy() end)
end

-- FTUE-specific: 5x reward on first correct answer
function RewardVFX:FTUEFirstCorrect(player)
    RewardVFX:BurstOnCorrect(player, 5)  -- 5x multiplier
    -- Additional: 3x damage flash on next attack
    remoteEvent:FireClient(player, "DamageBoost", { multiplier = 3, duration = 5 })
    -- "ENGLISH MAKES YOU POWERFUL!" overlay
    remoteEvent:FireClient(player, "ShowOverlay", {
        text = "ENGLISH MAKES YOU POWERFUL!",
        color = Color3.fromHex("#FFD700"),
        duration = 2,
        style = "impact",  -- large, bold, center screen
    })
end

return RewardVFX
```

### Reward Progression (FTUE)

| Question | Reward Multiplier | Visual | Why |
|---|---|---|---|
| Q1 (first correct ever) | **5x** (250 🪙) | Gold explosion + "ENGLISH MAKES YOU POWERFUL!" + 3x damage | Massive dopamine spike. Hook them. |
| Q2 | **3x** (150 🪙) | Gold particles + floating text | Reinforce: "I can do this" |
| Q3 | **2x** (100 🪙) | Standard burst | Settling into normal loop |
| Post-FTUE | **1x** (50 🪙) | Standard burst | Steady state |

---

## 9. Solo Mode & Skip Logic

### Solo Mode (from STAGE-01 + FTUEManager)

During FTUE, the player is in **solo mode** — no other players visible, no multiplayer interactions, no PvP. This ensures:
- Zero confusion from seeing experienced players
- No accidental PvP deaths during tutorial
- Clean, controlled environment for the hook

```lua
-- On FTUE start:
function FTUEController:enableSoloMode(player)
    -- Hide other players
    remoteEvent:FireClient(player, "SetSoloMode", true)
    -- Disable collision with other characters
    player.Character.Humanoid:SetAttribute("FTUESoloMode", true)
    -- Spawn FTUE-specific enemies (weaker, scripted)
    FTUEEnemySpawner:SpawnTutorialZombie(player)
end

-- On FTUE complete:
function FTUEController:disableSoloMode(player)
    remoteEvent:FireClient(player, "SetSoloMode", false)
    player.Character.Humanoid:SetAttribute("FTUESoloMode", false)
    -- Multiplayer now visible
end
```

### Skip Detection (merged from both modules)

```lua
function FTUEController:checkSkip(player)
    -- Check DataStore for prior FTUE completion
    local data = UnifiedServer:GetPlayerData(player)
    if data and data.ftueCompleted then
        Analytics.TrackFTUE("skipped", player, {
            reason = "returning_player",
            previousCompletionDate = data.ftueCompletedAt,
        })
        return true  -- skip FTUE
    end
    return false
end
```

---

## 10. Audio Design

### Sound Requirements (Gap from Run 46)

| Sound | Trigger | Duration | Priority |
|---|---|---|---|
| `correct_answer` | Correct tap-select | 0.5s | 🔴 HIGH — emotional hook |
| `incorrect_answer` | Wrong tap-select | 0.3s | 🔴 HIGH — clear feedback |
| `reward_burst` | Chest open / big reward | 1.0s | 🔴 HIGH — dopamine |
| `question_appear` | Question UI slides in | 0.2s | 🟡 MED — awareness cue |
| `premium_tease` | Golden chest glow | 1.5s | 🟡 MED — desire creation |
| `ftue_complete` | "ENGLISH MAKES YOU POWERFUL!" | 2.0s | 🔴 HIGH — triumph |
| `timer_warning` | Timer <2 seconds remaining | 0.3s (repeating) | 🟡 MED — urgency |

### Asset Sourcing

**Option 1:** Roblox Marketplace free SFX (fastest, zero cost)
**Option 2:** Custom sounds from free libraries (freesound.org)
**Option 3:** Roblox built-in sounds via `rbxasset://`

Placeholder IDs should be set in a `SoundConfig.lua` module:

```lua
local SoundConfig = {
    CORRECT_ANSWER = "rbxassetid://0",   -- TBD
    INCORRECT_ANSWER = "rbxassetid://0", -- TBD
    REWARD_BURST = "rbxassetid://0",     -- TBD
    QUESTION_APPEAR = "rbxassetid://0",  -- TBD
    PREMIUM_TEASE = "rbxassetid://0",    -- TBD
    FTUE_COMPLETE = "rbxassetid://0",    -- TBD
    TIMER_WARNING = "rbxassetid://0",    -- TBD
}
return SoundConfig
```

---

## 11. Tutorial Overlay (Gap from Run 46)

### Animated Hand Pointer

The `showTutorial()` stub in FTUEManager needs implementation. In the compressed flow, the tutorial **IS** the first question — the animated hand appears ON the answer button:

```lua
-- FTUETutorial.lua (new module)
local FTUETutorial = {}

function FTUETutorial:ShowHandPointer(targetButton)
    -- Create animated hand image
    local hand = Instance.new("ImageLabel")
    hand.Image = HAND_POINTER_ASSET_ID  -- TBD
    hand.Size = UDim2.new(0, 48, 0, 48)
    hand.BackgroundTransparency = 1
    hand.Parent = targetButton.Parent

    -- Position below-right of the correct answer button
    hand.Position = UDim2.new(
        targetButton.Position.X.Scale + 0.05,
        0,
        targetButton.Position.Y.Scale + 0.05,
        0
    )

    -- Bouncing animation (tap gesture)
    local tween = TweenService:Create(hand,
        TweenInfo.new(0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
        { Position = hand.Position + UDim2.new(0, 0, 0, -10) }
    )
    tween:Play()

    -- "Tap here!" text above hand
    local label = Instance.new("TextLabel")
    label.Text = "Tap here!"
    label.TextColor3 = Color3.fromHex("#FFD700")
    label.Font = Enum.Font.GothamBold
    label.TextSize = 18
    label.BackgroundTransparency = 1
    label.Position = UDim2.new(0, -20, 0, -30)
    label.Parent = hand

    return {
        destroy = function()
            tween:Cancel()
            hand:Destroy()
        end
    }
end

-- Auto-dismiss after first correct answer
-- Hand only shows on Q1 (the trivially easy one)

return FTUETutorial
```

---

## 12. Complete Module Dependency Map

```
FTUEController.lua (NEW — the unified FTUE module)
  ├── InputModeManager.lua (Run 45 — tap select, option count)
  ├── QuestionService.lua (existing — question selection + adaptive)
  │   └── QuestionBank.lua (patched — Mouse-A/B split, ftueWeight)
  ├── FTUETutorial.lua (NEW — animated hand pointer)
  ├── RewardVFX.lua (NEW — particle burst, floating text, haptic)
  ├── SoundConfig.lua (NEW — audio asset IDs)
  ├── FTUEUIManager.lua (NEW — question panel, timer bar, premium tease)
  ├── MonetizationOrchestrator.lua (Run 47 — post-FTUE offers)
  ├── AnalyticsService.lua (Run 50 — event tracking)
  ├── UnifiedServer.lua (existing — DataStore gateway)
  └── DailyRewards.lua (existing — return hook)
```

### New Modules to Build

| Module | Purpose | Effort | Dependencies |
|---|---|---|---|
| **FTUEController.lua** | Unified FTUE orchestrator (replaces FTUEManager + FTUEWiring) | 4hr | All below |
| **FTUEUIManager.lua** | Question panel rendering, timer bar, premium tease UI | 3hr | InputModeManager |
| **RewardVFX.lua** | Particle effects, floating text, screen flash, haptic | 2hr | SoundConfig |
| **FTUETutorial.lua** | Animated hand pointer for Q1 | 1hr | None |
| **SoundConfig.lua** | Audio asset ID registry | 30min | None (asset sourcing separate) |

### Existing Modules to Patch

| Module | Patch | Effort |
|---|---|---|
| **QuestionBank.lua** | Add `subTier`, `ftueWeight`, `category` fields; split Mouse into A/B | 1hr |
| **QuestionBank.lua** | Change FTUE struggling threshold from 2→3 consecutive wrong | 15min |
| **UnifiedServer.lua** | Add FTUEController to init sequence with feature flag | 30min |

---

## 13. Build Priority & Execution Order

### Phase 1: Core FTUE (Ship first — makes the game playable)

| # | Task | Module | Effort | Revenue Impact |
|---|---|---|---|---|
| 1 | Split Mouse tier into A/B + add `ftueWeight` + `category` | QuestionBank.lua | 1hr | 🔴 First impression quality |
| 2 | Build FTUEController skeleton (8-step timer+step hybrid) | FTUEController.lua | 2hr | 🔴 Entire FTUE structure |
| 3 | Build FTUEUIManager (tap-select rendering, timer bar) | FTUEUIManager.lua | 3hr | 🔴 Unplayable on mobile without this |
| 4 | Wire InputModeManager into FTUEController | FTUEController.lua | 30min | 🔴 Mobile input |
| 5 | Build RewardVFX (particles, floating text, haptic) | RewardVFX.lua | 2hr | 🔴 Emotional hook |
| 6 | Build FTUETutorial (animated hand on Q1) | FTUETutorial.lua | 1hr | 🟡 Reduces confusion |
| 7 | Wire AnalyticsService into FTUEController | FTUEController.lua | 30min | 🟡 Can't measure without this |

**Phase 1 total: ~10 hours**

### Phase 2: Monetization Layer (Ship second — makes the game profitable)

| # | Task | Module | Effort | Revenue Impact |
|---|---|---|---|---|
| 8 | Build premium tease UI (Step 6) | FTUEUIManager.lua | 1.5hr | 🔴 Zero revenue without monetization touch |
| 9 | Wire MonetizationOrchestrator post-FTUE handoff | FTUEController.lua | 1hr | 🔴 Connects FTUE to spending journey |
| 10 | Build return hook (24h Mystery Chest reminder) | FTUEController + DailyRewards | 30min | 🟡 Retention driver |
| 11 | Implement compressed 60s timing (adjust STEP_BUDGETS) | FTUEController.lua | 1hr | 🟡 Faster hook = less drop-off |

**Phase 2 total: ~4 hours**

### Phase 3: Polish (Ship third — makes the game feel premium)

| # | Task | Module | Effort | Revenue Impact |
|---|---|---|---|---|
| 12 | Source and wire audio assets | SoundConfig.lua | 1hr | 🟢 Polish |
| 13 | Solo mode implementation (hide other players) | FTUEController.lua | 1hr | 🟢 Clean FTUE environment |
| 14 | Struggling detection fix (2→3 threshold for FTUE) | QuestionBank.lua | 15min | 🟢 Fewer false negatives |
| 15 | Feature flag + UnifiedServer integration | UnifiedServer.lua | 30min | 🟢 Safe rollout |

**Phase 3 total: ~3 hours**

### Grand Total: ~17 hours of focused Roblox Studio work

---

## 14. Spec vs Implementation Gap Matrix (Updated)

Comprehensive status after this spec — all 13 original items plus new items from cross-repo synthesis:

| # | Feature | Spec Status | Implementation Status | Gap | Priority | Addressed In |
|---|---|---|---|---|---|---|
| 1 | 60-Second Compressed Flow | ✅ Defined | ❌ Not built | YES | 🔴 | §3 |
| 2 | Solo-First Entry | ✅ Defined | ⚠️ Flag exists, not enforced | PARTIAL | 🟡 | §9 |
| 3 | Difficulty Scaling (Mouse A/B) | ✅ Defined | ❌ Mouse tier is flat | YES | 🔴 | §5 |
| 4 | Mobile Tap-Select Input | ✅ Defined | ❌ Not wired into FTUE | YES | 🔴 | §4 |
| 5 | Reward Burst VFX | ✅ Defined | ❌ Called but undefined | YES | 🔴 | §8 |
| 6 | Monetization Hook (s42-48) | ✅ Defined | ❌ Zero monetization in FTUE | YES | 🔴 | §6 |
| 7 | Post-FTUE Offers | ✅ Defined | ❌ Orchestrator not built | YES | 🔴 | §6 |
| 8 | Tutorial Overlay | ✅ Defined | ❌ Stub only | YES | 🟡 | §11 |
| 9 | Audio Cues | ✅ Defined | ❌ Placeholder IDs only | YES | 🟡 | §10 |
| 10 | Analytics Integration | ✅ Defined | ❌ Zero analytics | YES | 🟡 | §7 |
| 11 | Skip for Returning Players | ✅ Defined | ✅ Both modules have skip logic | ALIGNED | — | §9 |
| 12 | Adaptive Question Selection | ✅ Defined | ✅ `adaptiveSelect()` works | ALIGNED | — | §5 |
| 13 | DataStore Persistence | ✅ Defined | ✅ Saves completion | ALIGNED | — | §9 |
| 14 | Gospel 444 Colors | ✅ Defined | ✅ Color constants match | ALIGNED | — | — |
| 15 | Chest Spawn at 3 Correct | ✅ Defined | ✅ `spawnChest()` at threshold | ALIGNED | — | §3 |
| 16 | Architecture Reconciliation | ✅ Defined | ❌ Two conflicting modules | YES | 🔴 | §2 |
| 17 | FTUE Weight System | ✅ Defined | ❌ No `ftueWeight` field | YES | 🔴 | §5 |
| 18 | 24h Return Hook | ✅ Defined | ❌ Not wired | YES | 🟡 | §6 |

**Score: 5/18 aligned, 10 critical gaps, 3 medium gaps**

---

## 15. Cross-Reference Map

| Source Document | Location | SHA | Key Content Used |
|---|---|---|---|
| STAGE-01-FTUE-DESIGN-SPEC.md | `CANON/TRAIN-67/` | `ef84a545` | 90s hook, solo-first, difficulty scaling, success metrics |
| FTUEManager.lua | `CANON/TRAIN-67/src/` | `33a7d165` | Timer-gated flow, difficulty table, solo mode, DataStore |
| FTUEWiring.lua | `CANON/TRAIN-67/src/` | `5adf3afd` | 9-step sequence, UnifiedServer integration, skip detection |
| FTUECompressionAnalysis.md | `CANON/TRAIN-67/DOCS/` | `c47a1859` | Gap matrix, 60s compression, Mouse A/B split, build targets |
| MobileFirstEnglishInputDesign.md | `CANON/TRAIN-67/DOCS/` | `305efd84` | 4 input modes, tap-select rules, FTUE 10s hook, screen layout |
| MonetizationArchitectureDeepDive.md | `CANON/TRAIN-67/DOCS/` | `63234bee` | Spending journey, FTUE monetization gap, orchestrator design |
| AnalyticsTelemetryIntegrationSpec.md | `CANON/TRAIN-67/DOCS/` | `f182ccfd` | FTUE funnel events, AnalyticsService integration, target metrics |

---

## 16. Summary Verdict

**The FTUE has a solid foundation (FTUEManager + FTUEWiring) but needs one unified module that merges the best of both, wires mobile input, adds the monetization hook, and integrates analytics.**

**Three things determine if this game makes money:**

1. **First 15 seconds:** Player taps the correct answer, gets 5x reward, sees "ENGLISH MAKES YOU POWERFUL!" — and they're hooked. If this fails, nothing else matters.

2. **Seconds 42-48:** Player sees the locked golden chest, the Tiger-tier aura preview. The seed of desire is planted. If this window doesn't exist, they complete FTUE and have zero reason to pay.

3. **Post-FTUE handoff:** MonetizationOrchestrator shows the Battle Pass, the 2x Coins impulse buy, the Starter Pack. If this handoff doesn't exist, the FTUE is a dead end.

**This spec provides the complete blueprint for all three.** Build order is clear. Module dependencies are mapped. Every gap from Runs 45-50 is addressed. Total effort: ~17 hours of focused Roblox Studio work.

**Next run targets per Active Mission pipeline:**
- Run 52: MonetizationOrchestrator implementation spec
- Run 53: EnglishRewardsManager (English × Gacha bridge) spec

---

*Artifact produced by Pulse Run 51 | Active Mission: 100% Roblox — MAKE MONEY is the only goal*
*Platform Death Test: PASS (if commit succeeds)*
*Cross-repo sources: 7 files mined from `hobbs-lab/Phoenix-Rising-Protocol-Ultimate`*
*Gospel 444 alignment: Mouse → Tiger, Permission over Perfection, English is the mechanic money is the mission*
