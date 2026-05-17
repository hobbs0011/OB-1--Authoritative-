# Combat×English Bridge Specification — TRAIN-67 Roblox Experience
## Version: 1.0 | Artifact Class: 🔨 BUILD | Run: 57 | Date: 2026-03-27

---

> **Canon Source:** Synthesized from 7 cross-repo source files:
> - `RewardBridge.lua` (SHA `36b4f338`) — Reward distribution bridge
> - `UnifiedServer.lua` (SHA `ccd827bf`) — Server-side combat + English orchestration
> - `EnglishRewardsManagerSpec.md` (SHA `f442ac19`) — English→Reward pipeline (14 sections)
> - `FTUEImplementationSpec.md` (SHA `18bee6a6`) — First-time combat+English flow (16 sections)
> - `CosmeticTrinityIntegrationSpec.md` (SHA `c91097ff`) — Cosmetic rewards from combat+English
> - `AnalyticsTelemetryIntegrationSpec.md` (SHA `427320695c7f`) — Combat+English event tracking
> - `GuildManagerIntegrationSpec.md` (SHA `79c01d2e`) — Guild wars English combat integration
>
> **Law:** English is the mechanic, money is the mission. Combat exists to make English answering feel powerful. Every damage number, every heal, every ability activation is gated through English mastery.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [The Core Loop — Answer to Attack](#2-the-core-loop--answer-to-attack)
3. [Combat State Machine](#3-combat-state-machine)
4. [English Question Integration Points](#4-english-question-integration-points)
5. [Damage Calculation — English Performance Multipliers](#5-damage-calculation--english-performance-multipliers)
6. [Ability System — English-Gated Powers](#6-ability-system--english-gated-powers)
7. [Healing & Defense — English as Shield](#7-healing--defense--english-as-shield)
8. [Combo System — Streak-Powered Escalation](#8-combo-system--streak-powered-escalation)
9. [Boss Encounters — English Intensity Scaling](#9-boss-encounters--english-intensity-scaling)
10. [FTUE Combat Bridge — First 60 Seconds](#10-ftue-combat-bridge--first-60-seconds)
11. [Guild War Combat — Team English Mechanics](#11-guild-war-combat--team-english-mechanics)
12. [Reward Pipeline — Combat→English→Loot](#12-reward-pipeline--combatenglishloot)
13. [Cosmetic Integration — Combat Earns English Earns Cosmetics](#13-cosmetic-integration--combat-earns-english-earns-cosmetics)
14. [Analytics — Combat×English Event Tracking](#14-analytics--combatenglish-event-tracking)
15. [Monetization Hooks — Where Combat Meets Spending](#15-monetization-hooks--where-combat-meets-spending)
16. [Performance Budget](#16-performance-budget)
17. [Anti-Exploit — Server-Authoritative Combat](#17-anti-exploit--server-authoritative-combat)
18. [Implementation Plan](#18-implementation-plan)
19. [Cross-Reference Index](#19-cross-reference-index)

---

## 1. System Overview

The **Combat×English Bridge** is the central gameplay integration that makes "Survive a Brainrot" unique: **every combat action is powered by English language performance.** Players don't just hack and slash — they answer English questions to deal damage, activate abilities, heal, and defend. English IS the combat mechanic.

### Core Design Philosophy

```
Enemy Attacks → English Question Prompt → Correct Answer → Combat Action Executes
                                        → Wrong Answer  → Reduced/Failed Action
                                        → Streak Bonus  → Amplified Action + Rewards
```

- **Mouse → Tiger:** Early combat is forgiving (wrong answers still deal reduced damage). As players advance, English precision becomes critical for survival.
- **Permission over perfection:** The game never punishes wrong answers with death — it punishes with weakness. Correct answers feel POWERFUL.
- **English is invisible:** Players think they're fighting enemies. They're actually doing English drills. The combat wrapper makes repetitive language practice feel exciting.

### System Boundaries

| System | Role | Owns |
|--------|------|------|
| **CombatController** | Combat state machine, turn flow, enemy AI | Combat state, turn order, enemy behavior |
| **EnglishBridge** | Question injection into combat flow | Question timing, difficulty matching, streak tracking |
| **DamageCalculator** | Damage/healing math with English multipliers | Base stats, multipliers, crit logic |
| **AbilitySystem** | English-gated special abilities | Ability definitions, cooldowns, charge requirements |
| **RewardBridge** | Post-combat reward distribution | Loot tables, XP grants, currency drops |
| **ComboEngine** | Streak tracking and escalation effects | Combo counter, multiplier curves, visual feedback |
| **BossManager** | Boss encounter English intensity | Boss phases, question pressure, mechanics |

### The Golden Rule

**A player who answers English questions well ALWAYS outperforms a player who doesn't.** This isn't a suggestion — it's the architecture. Every damage formula, every ability gate, every reward multiplier enforces this. Combat without English engagement is possible but weak. Combat WITH English mastery is devastating.

---

## 2. The Core Loop — Answer to Attack

### 2.1 The Basic Combat Turn

```
┌─────────────────────────────────────────────────────┐
│                    COMBAT TURN                        │
│                                                       │
│  1. ENEMY INTENT      Enemy telegraphs attack         │
│         ↓                                             │
│  2. QUESTION PROMPT   English question appears         │
│         ↓             (difficulty = player tier)       │
│         ↓                                             │
│  3. PLAYER ANSWERS    Timer running (mobile-first UI) │
│         ↓                                             │
│  ├── CORRECT ──→ Full damage + combo increment        │
│  │                + ability charge + reward XP         │
│  │                                                    │
│  ├── WRONG ────→ Reduced damage (50% base)            │
│  │                + combo reset + no ability charge    │
│  │                                                    │
│  └── TIMEOUT ──→ Minimal damage (25% base)            │
│                   + combo reset + enemy bonus attack   │
│                                                       │
│  4. RESOLUTION   Damage applied, effects triggered    │
│         ↓                                             │
│  5. ENEMY TURN   Enemy attacks (reduced by defense)   │
│         ↓                                             │
│  └── NEXT TURN   Return to step 1                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Question Timing

| Context | Time Limit | Rationale |
|---------|-----------|-----------|
| Normal combat | 8 seconds | Comfortable, learning-focused |
| Boss combat | 6 seconds | Pressure increases, engagement up |
| Guild war PvE | 6 seconds | Team coordination pressure |
| Guild war PvP | 5 seconds | Competitive intensity |
| FTUE (first 3 questions) | 12 seconds | Generous for new players |
| Combo ×5+ active | -1 second (min 4s) | Reward speed with challenge |

### 2.3 Question Selection Logic

The EnglishBridge selects questions based on:

```lua
-- EnglishBridge.lua — Question selection for combat
function EnglishBridge:SelectCombatQuestion(player, context)
    local playerTier = EloManager:GetTier(player)
    local combatContext = context.combatType  -- "normal", "boss", "guild_pve", "guild_pvp"
    local streakCount = self.comboEngine:GetStreak(player)
    
    -- Base difficulty = player's English tier
    local targetDifficulty = playerTier
    
    -- Streak escalation: every 5 correct answers, bump difficulty by 0.5 sub-tiers
    if streakCount >= 5 then
        targetDifficulty = targetDifficulty + math.floor(streakCount / 5) * 0.5
    end
    
    -- Boss encounters: +1 sub-tier difficulty
    if combatContext == "boss" then
        targetDifficulty = targetDifficulty + 1
    end
    
    -- Cap at player tier + 2 (never impossible, just challenging)
    targetDifficulty = math.min(targetDifficulty, playerTier + 2)
    
    -- Format selection weighted by combat context
    local format = self:SelectFormat(combatContext, player)
    -- Normal: 60% multiple choice, 30% fill-blank, 10% audio
    -- Boss: 40% multiple choice, 40% fill-blank, 20% audio
    -- PvP: 50% multiple choice, 50% fill-blank (no audio in PvP — latency)
    
    return QuestionService:GetQuestion(player, targetDifficulty, format)
end
```

---

## 3. Combat State Machine

### 3.1 States

```
IDLE → ENCOUNTER_START → TURN_START → QUESTION_PHASE → 
ANSWER_PHASE → RESOLUTION_PHASE → ENEMY_TURN → 
TURN_END → [TURN_START | COMBAT_END]
```

### 3.2 State Definitions

```lua
-- CombatController.lua — State machine
local CombatStates = {
    IDLE = "idle",                    -- No combat
    ENCOUNTER_START = "encounter",    -- Enemy spawned, intro animation
    TURN_START = "turn_start",        -- Begin player turn
    QUESTION_PHASE = "question",      -- Question displayed, awaiting input
    ANSWER_PHASE = "answering",       -- Player is typing/selecting answer
    RESOLUTION_PHASE = "resolution",  -- Answer evaluated, damage calculated
    ENEMY_TURN = "enemy_turn",        -- Enemy attacks
    TURN_END = "turn_end",            -- Cleanup, check win/lose
    COMBAT_END = "combat_end",        -- Victory or defeat
}

-- Transition rules
local Transitions = {
    [CombatStates.IDLE] = {CombatStates.ENCOUNTER_START},
    [CombatStates.ENCOUNTER_START] = {CombatStates.TURN_START},
    [CombatStates.TURN_START] = {CombatStates.QUESTION_PHASE},
    [CombatStates.QUESTION_PHASE] = {CombatStates.ANSWER_PHASE},
    [CombatStates.ANSWER_PHASE] = {CombatStates.RESOLUTION_PHASE},
    [CombatStates.RESOLUTION_PHASE] = {CombatStates.ENEMY_TURN, CombatStates.COMBAT_END},
    [CombatStates.ENEMY_TURN] = {CombatStates.TURN_END},
    [CombatStates.TURN_END] = {CombatStates.TURN_START, CombatStates.COMBAT_END},
    [CombatStates.COMBAT_END] = {CombatStates.IDLE},
}
```

### 3.3 Combat Context Object

```lua
export type CombatContext = {
    -- Participants
    player: Player,
    enemy: EnemyInstance,
    
    -- State
    currentState: string,
    turnNumber: number,
    
    -- English bridge state
    currentQuestion: Question?,
    answerResult: AnswerResult?,
    comboCount: number,
    maxComboThisFight: number,
    questionsAnswered: number,
    questionsCorrect: number,
    
    -- Combat stats
    playerHP: number,
    playerMaxHP: number,
    enemyHP: number,
    enemyMaxHP: number,
    
    -- Ability state
    abilityCharges: {[string]: number},
    abilityCooldowns: {[string]: number},
    
    -- Timing
    combatStartTime: number,
    turnStartTime: number,
    questionShowTime: number,
    
    -- Type
    combatType: "normal" | "boss" | "guild_pve" | "guild_pvp" | "ftue",
}
```

---

## 4. English Question Integration Points

### 4.1 When Questions Appear

| Combat Moment | Question Trigger | Purpose |
|---------------|-----------------|---------|
| **Player attack turn** | Every turn | Core loop — answer to attack |
| **Ability activation** | On ability use | Gate powerful abilities behind English |
| **Critical hit chance** | Bonus question on correct | Fast follow-up for crit opportunity |
| **Healing** | When using heal item/ability | English powers healing too |
| **Defense boost** | On enemy power attack telegraph | Answer correctly to brace for impact |
| **Boss phase transition** | Multi-question burst | Intensity spike at boss checkpoints |
| **Guild war rally** | Team question (shared) | Collaborative English moment |
| **Revive (free)** | Hard question | Free revive earned through English mastery |

### 4.2 Question Format Distribution by Combat Type

| Format | Normal | Boss | Guild PvE | Guild PvP | FTUE |
|--------|--------|------|-----------|-----------|------|
| Multiple choice (4 options) | 60% | 40% | 50% | 50% | 80% |
| Fill-in-the-blank | 25% | 35% | 30% | 40% | 10% |
| Audio comprehension | 10% | 15% | 10% | 0% | 5% |
| Sentence ordering | 5% | 10% | 10% | 10% | 5% |

**PvP excludes audio** — latency and fairness concerns. Audio is a PvE advantage for immersion.

### 4.3 Adaptive Difficulty in Combat

```lua
-- EnglishBridge adaptive difficulty during combat
function EnglishBridge:AdaptDifficulty(context)
    local correctRate = context.questionsCorrect / math.max(1, context.questionsAnswered)
    
    -- If player is struggling (< 40% correct), ease off
    if correctRate < 0.4 and context.questionsAnswered >= 3 then
        return context.baseDifficulty - 1  -- Drop one sub-tier
    end
    
    -- If player is crushing it (> 85% correct), push harder
    if correctRate > 0.85 and context.questionsAnswered >= 5 then
        return context.baseDifficulty + 1  -- Rise one sub-tier
    end
    
    -- Goldilocks zone: 50-80% correct rate = stay
    return context.baseDifficulty
end
```

**Why 50-80%?** This is the optimal learning zone (Krashen's i+1). Too easy = bored. Too hard = frustrated. Combat difficulty auto-tunes to keep the player in flow state while maximizing English acquisition.

---

## 5. Damage Calculation — English Performance Multipliers

### 5.1 Base Damage Formula

```lua
-- DamageCalculator.lua — The core formula
function DamageCalculator:Calculate(context, answerResult)
    local baseDamage = self:GetBaseDamage(context.player)
    local englishMultiplier = self:GetEnglishMultiplier(answerResult)
    local comboMultiplier = self:GetComboMultiplier(context.comboCount)
    local abilityMultiplier = self:GetAbilityMultiplier(context)
    local petBonus = self:GetPetBonus(context.player)
    local critMultiplier = self:GetCritMultiplier(answerResult, context)
    
    local finalDamage = baseDamage 
        * englishMultiplier 
        * comboMultiplier 
        * abilityMultiplier 
        * petBonus
        * critMultiplier
    
    -- Floor at 1 (always deal at least 1 damage)
    return math.max(1, math.floor(finalDamage))
end
```

### 5.2 English Multiplier Table

| Answer Result | Multiplier | Visual Feedback |
|---------------|-----------|-----------------|
| **Correct (fast, < 3s)** | 1.5× | 🔥 "PERFECT!" gold text + screen shake |
| **Correct (normal)** | 1.0× | ✅ "CORRECT!" green text |
| **Correct (slow, > 6s)** | 0.8× | ⚡ "CORRECT..." yellow text |
| **Wrong answer** | 0.5× | ❌ "WRONG" red text + weak hit animation |
| **Timeout (no answer)** | 0.25× | 💀 "TOO SLOW" gray text + fumble animation |
| **Streak ×3** | +0.1× bonus | 🔥×3 combo counter glow |
| **Streak ×5** | +0.25× bonus | 🔥×5 fire particles |
| **Streak ×10** | +0.5× bonus | 🔥×10 SUPER mode (character glows) |
| **Streak ×20** | +1.0× bonus | 🔥×20 ULTRA mode (environment changes) |

### 5.3 Combo Multiplier Curve

```lua
function DamageCalculator:GetComboMultiplier(comboCount)
    if comboCount <= 0 then return 1.0 end
    if comboCount <= 2 then return 1.0 end       -- No bonus yet
    if comboCount <= 4 then return 1.1 end        -- +10%
    if comboCount <= 6 then return 1.25 end       -- +25%
    if comboCount <= 9 then return 1.5 end        -- +50%
    if comboCount <= 14 then return 1.75 end      -- +75%
    if comboCount <= 19 then return 2.0 end       -- +100%
    return 2.5                                     -- +150% (max, requires 20+ streak)
end
```

### 5.4 Critical Hit System (English-Powered)

After a correct answer, the player gets a **0.5-second bonus question flash** — a single-word vocab check. Correct = critical hit.

```lua
function DamageCalculator:GetCritMultiplier(answerResult, context)
    if not answerResult.correct then return 1.0 end
    if not answerResult.critQuestionCorrect then return 1.0 end
    
    -- Base crit multiplier
    local critMult = 2.0
    
    -- Pet luck bonus (from CosmeticTrinity §5.3)
    local petLuckBonus = PetManager:GetAbilityValue(context.player, "LUCK_BOOST")
    critMult = critMult + (petLuckBonus or 0)
    
    return critMult
end
```

---

## 6. Ability System — English-Gated Powers

### 6.1 Ability Charge Mechanic

Abilities don't use mana or cooldown timers — they charge through **correct English answers**. This is the killer design: want to use your powerful attack? Answer English questions correctly.

```lua
-- AbilitySystem.lua
export type Ability = {
    id: string,
    name: string,
    description: string,
    chargesRequired: number,     -- Correct answers needed to activate
    currentCharges: number,
    effect: AbilityEffect,
    tier: number,                -- Unlocked at this English tier
    category: "attack" | "defense" | "heal" | "utility",
    gateQuestion: boolean,       -- Requires a bonus question to activate?
    gateQuestionDifficulty: number, -- Difficulty offset from player tier
}

-- Charge accumulation
function AbilitySystem:OnCorrectAnswer(player, context)
    for _, ability in pairs(self:GetEquippedAbilities(player)) do
        if ability.currentCharges < ability.chargesRequired then
            ability.currentCharges = ability.currentCharges + 1
            
            -- Notify client of charge progress
            AbilityChargeRemote:FireClient(player, ability.id, ability.currentCharges)
            
            -- If fully charged, notify with VFX
            if ability.currentCharges >= ability.chargesRequired then
                AbilityReadyRemote:FireClient(player, ability.id)
            end
        end
    end
end

-- On wrong answer: lose 1 charge from each ability (penalty)
function AbilitySystem:OnWrongAnswer(player)
    for _, ability in pairs(self:GetEquippedAbilities(player)) do
        ability.currentCharges = math.max(0, ability.currentCharges - 1)
    end
end
```

### 6.2 Ability Roster (Launch Set)

| Ability | Charges | Gate Question | Effect | English Tier |
|---------|---------|--------------|--------|-------------|
| **Power Strike** | 3 correct | No | 3× damage single target | Mouse (Tier 1) |
| **Word Shield** | 4 correct | Yes (current tier) | Block next enemy attack | Mouse (Tier 1) |
| **Heal Wave** | 5 correct | Yes (current tier) | Restore 30% HP | Cat (Tier 2) |
| **Combo Saver** | 3 correct | No | Preserve combo on next wrong answer | Cat (Tier 2) |
| **Grammar Bomb** | 6 correct | Yes (tier + 1) | AoE 2× damage all enemies | Dog (Tier 3) |
| **Vocab Drain** | 5 correct | Yes (tier + 1) | Steal enemy buff + heal 15% | Tiger (Tier 4) |
| **Perfect Sentence** | 8 correct | Yes (tier + 2) | 5× damage + full heal + combo preserved | Eagle (Tier 5) |
| **English Mastery** | 10 correct | Yes (hardest) | 10× damage, ignores defense, server announcement | Phoenix (Tier 6+) |

### 6.3 Gate Questions

When a player activates a charged ability, a **gate question** appears. This is harder than normal combat questions and must be answered correctly for the ability to fire. Wrong answer = ability fizzles, charges reset to 50%.

```lua
function AbilitySystem:ActivateAbility(player, abilityId, context)
    local ability = self:GetAbility(player, abilityId)
    if not ability then return false, "Ability not found" end
    if ability.currentCharges < ability.chargesRequired then
        return false, "Not enough charges"
    end
    
    if ability.gateQuestion then
        -- Present harder question
        local gateDifficulty = EloManager:GetTier(player) + ability.gateQuestionDifficulty
        local question = QuestionService:GetQuestion(player, gateDifficulty, "fill_blank")
        
        -- Wait for answer
        local result = EnglishBridge:PresentGateQuestion(player, question, 6) -- 6 second timer
        
        if not result.correct then
            -- Fizzle: lose 50% charges
            ability.currentCharges = math.floor(ability.chargesRequired * 0.5)
            Analytics.Track("combat_ability_fizzled", {
                abilityId = abilityId, 
                questionId = question.id,
                tier = gateDifficulty
            }, player)
            return false, "Gate question failed"
        end
    end
    
    -- Execute ability effect
    ability.currentCharges = 0
    self:ExecuteEffect(player, ability, context)
    
    Analytics.Track("combat_ability_activated", {
        abilityId = abilityId,
        chargesUsed = ability.chargesRequired,
        comboAtActivation = context.comboCount
    }, player)
    
    return true
end
```

---

## 7. Healing & Defense — English as Shield

### 7.1 Healing Mechanics

Healing is not passive — it requires English performance:

| Heal Source | English Requirement | Heal Amount |
|-------------|-------------------|-------------|
| **Post-combat auto-heal** | Correct rate > 60% in last fight | 20% HP |
| **Heal ability (Heal Wave)** | 5 correct + gate question | 30% HP |
| **Heal item (Potion)** | Answer 1 question correctly | Full potion value |
| **Heal item (failed answer)** | Wrong answer | 50% potion value |
| **English streak passive** | Active 7+ day streak | +1% HP regen per 30s |
| **English Aura heal** | Tier 4+ English Aura equipped | +0.5% HP regen per 30s |

### 7.2 Defense Mechanics

When an enemy telegraphs a powerful attack, the player gets a **defense question**:

```lua
function CombatController:OnEnemyPowerAttack(context)
    -- Telegraph: "INCOMING POWER ATTACK!"
    -- Player gets a defense question
    local question = EnglishBridge:SelectCombatQuestion(context.player, {
        combatType = context.combatType,
        urgency = "defense"
    })
    
    local result = EnglishBridge:PresentQuestion(context.player, question, 5) -- tighter timer
    
    if result.correct then
        -- Successful brace: 70% damage reduction
        context.defenseMultiplier = 0.3
        -- Fast answer bonus: if < 2s, reflect 20% damage back
        if result.responseTime < 2 then
            context.reflectDamage = 0.2
        end
    elseif result.answered then
        -- Wrong answer: 30% damage reduction (still tried)
        context.defenseMultiplier = 0.7
    else
        -- Timeout: full damage + stun for 1 turn
        context.defenseMultiplier = 1.0
        context.stunned = true
    end
end
```

### 7.3 The Death-and-Revive Bridge

When a player dies, they get ONE free revive opportunity — answer a **hard English question** (tier + 2):

```lua
function CombatController:OnPlayerDeath(context)
    -- Check if free revive available (once per combat encounter)
    if not context.freeReviveUsed then
        local question = QuestionService:GetQuestion(
            context.player, 
            EloManager:GetTier(context.player) + 2, 
            "fill_blank"  -- Hardest format
        )
        
        local result = EnglishBridge:PresentReviveQuestion(context.player, question, 10)
        
        if result.correct then
            context.freeReviveUsed = true
            context.playerHP = math.floor(context.playerMaxHP * 0.3) -- Revive at 30%
            Analytics.Track("combat_free_revive_success", {
                questionTier = EloManager:GetTier(context.player) + 2
            }, context.player)
            return -- Continue combat
        end
    end
    
    -- No free revive: offer paid revive (monetization hook)
    MonetizationOrchestrator:ShowReviveOffer(context.player, {
        context = "death",
        deathCount = context.deathCount,
        combatProgress = context.enemyHP / context.enemyMaxHP
    })
end
```

---

## 8. Combo System — Streak-Powered Escalation

### 8.1 Combo Mechanics

The combo system is the dopamine engine. Consecutive correct answers build a visible combo counter that amplifies everything:

```lua
-- ComboEngine.lua
local ComboEngine = {}

function ComboEngine:OnAnswer(player, context, result)
    if result.correct then
        context.comboCount = context.comboCount + 1
        context.maxComboThisFight = math.max(context.maxComboThisFight, context.comboCount)
        
        -- Milestone effects
        if context.comboCount == 3 then
            self:TriggerMilestone(player, "COMBO_3", context)  -- Fire particles
        elseif context.comboCount == 5 then
            self:TriggerMilestone(player, "COMBO_5", context)  -- Character aura glow
        elseif context.comboCount == 10 then
            self:TriggerMilestone(player, "COMBO_10", context) -- SUPER mode
        elseif context.comboCount == 20 then
            self:TriggerMilestone(player, "COMBO_20", context) -- ULTRA mode
        end
        
        -- English rewards scale with combo
        local comboXPMultiplier = 1 + (context.comboCount * 0.05) -- +5% per combo
        EnglishRewardsManager:GrantCombatXP(player, comboXPMultiplier)
        
    else
        -- Wrong answer: combo breaks
        local lostCombo = context.comboCount
        context.comboCount = 0
        
        -- Combo Saver ability check
        if AbilitySystem:HasActiveComboSaver(player) then
            context.comboCount = lostCombo  -- Preserved!
            AbilitySystem:ConsumeComboSaver(player)
        end
        
        if lostCombo >= 5 then
            -- Big combo loss: visual/audio feedback (motivate to rebuild)
            self:TriggerComboBreak(player, lostCombo)
        end
    end
end
```

### 8.2 Combo Visual Tiers

| Combo Count | Mode Name | Visual Effects | Sound | Damage Bonus |
|-------------|-----------|---------------|-------|-------------|
| 0-2 | Normal | None | Normal hit | 0% |
| 3-4 | **Warming Up** | Small fire particles on weapon | Slight pitch up | +10% |
| 5-6 | **On Fire** | 🔥 Weapon engulfed in flames | Energetic beat | +25% |
| 7-9 | **Blazing** | Full body fire aura | Intensity rising | +50% |
| 10-14 | **SUPER** | Character model glows gold, screen tint | Power chord | +75% |
| 15-19 | **MEGA** | Environment particles, ground cracks | Bass drop | +100% |
| 20+ | **ULTRA** | Server-visible effect, announcer voice | Epic theme | +150% |

### 8.3 Combo Preservation (Cross-Combat)

Between encounters (within same session), combo count **decays** rather than resets:

```lua
function ComboEngine:OnCombatEnd(player, context)
    -- Preserve 50% of combo for next encounter (rounded down)
    local preserved = math.floor(context.comboCount * 0.5)
    -- Max preserved: 10 (prevent infinite snowball)
    self.preservedCombo[player.UserId] = math.min(preserved, 10)
end

function ComboEngine:OnCombatStart(player, context)
    -- Restore preserved combo
    context.comboCount = self.preservedCombo[player.UserId] or 0
    self.preservedCombo[player.UserId] = 0
end
```

---

## 9. Boss Encounters — English Intensity Scaling

### 9.1 Boss Phase System

Boss encounters ramp English intensity through phases:

| Phase | HP Threshold | English Mechanic | Pressure Level |
|-------|-------------|------------------|---------------|
| **Phase 1** (Opening) | 100%-75% | Normal combat questions | Standard |
| **Phase 2** (Engaged) | 75%-50% | Timer reduced to 6s, +1 sub-tier difficulty | Elevated |
| **Phase 3** (Desperate) | 50%-25% | Rapid-fire: 2 questions per turn | High |
| **Phase 4** (Enraged) | 25%-0% | Multi-question burst (3), fill-blank only, 5s timer | Maximum |

### 9.2 Boss Mechanics — English Integration

```lua
-- BossManager.lua — Phase-specific English mechanics
local BossPhases = {
    PHASE_1 = {
        hpThreshold = 0.75,
        questionCount = 1,
        timerOverride = nil,      -- Use default
        difficultyOffset = 0,
        formatRestriction = nil,  -- All formats
        specialMechanic = nil,
    },
    PHASE_2 = {
        hpThreshold = 0.50,
        questionCount = 1,
        timerOverride = 6,
        difficultyOffset = 1,
        formatRestriction = nil,
        specialMechanic = "ENGLISH_SHIELD",  -- Boss gains shield, removed by correct answers
    },
    PHASE_3 = {
        hpThreshold = 0.25,
        questionCount = 2,
        timerOverride = 6,
        difficultyOffset = 1,
        formatRestriction = nil,
        specialMechanic = "RAPID_FIRE",  -- Two questions, both must be correct for full damage
    },
    PHASE_4 = {
        hpThreshold = 0,
        questionCount = 3,
        timerOverride = 5,
        difficultyOffset = 2,
        formatRestriction = "fill_blank",
        specialMechanic = "FINAL_EXAM",  -- Three fill-blank questions, all correct = massive damage
    },
}
```

### 9.3 Boss English Shield Mechanic

In Phase 2+, bosses can gain an **English Shield** — a barrier that can only be broken by answering questions correctly:

```lua
function BossManager:OnEnglishShieldActive(context)
    -- Boss is immune to damage until shield broken
    -- Shield has "question HP" — requires N correct answers to break
    local shieldQuestions = context.boss.shieldStrength  -- e.g., 3 questions
    
    -- Present rapid questions (no damage dealt, just shield breaking)
    for i = 1, shieldQuestions do
        local question = EnglishBridge:SelectCombatQuestion(context.player, context)
        local result = EnglishBridge:PresentQuestion(context.player, question, 6)
        
        if result.correct then
            context.boss.shieldRemaining = context.boss.shieldRemaining - 1
        end
        -- Wrong answer: shield stays, wasted turn
    end
    
    if context.boss.shieldRemaining <= 0 then
        -- Shield broken! Boss stunned for 1 turn (bonus damage window)
        context.boss.stunned = true
        context.boss.shieldActive = false
    end
end
```

---

## 10. FTUE Combat Bridge — First 60 Seconds

Source: `FTUEImplementationSpec.md` (SHA `18bee6a6`)

The first combat encounter is carefully designed to teach the Answer-to-Attack loop without overwhelming new players:

### 10.1 FTUE Combat Flow (within 60-second FTUE window)

| Second | Event | English | Combat |
|--------|-------|---------|--------|
| 0-5 | Spawn + intro | None | Enemy appears, telegraphs |
| 5-12 | First question | Multiple choice (easy, 12s timer) | "Answer to attack!" prompt |
| 12-15 | First hit | Result feedback | Damage animation (even wrong = hit) |
| 15-22 | Second question | Multiple choice (easy, 12s timer) | Enemy attacks between |
| 22-25 | Second hit | Combo counter appears if 2 correct | Bigger damage if correct |
| 25-35 | Third question | Slightly harder, 10s timer | "COMBO!" if 3 correct |
| 35-42 | Chest/reward | Chest spawns if 2+ correct | Visual loot explosion |
| 42-55 | Premium tease | Show English Aura preview | "Learn more English = more power" |
| 55-60 | Transition | — | Exit to main hub |

### 10.2 FTUE Guardrails

```lua
-- FTUECombatBridge.lua
local FTUEConfig = {
    -- Never let a new player die in FTUE combat
    playerInvincible = true,
    
    -- Even wrong answers deal damage (teach the loop, not the penalty)
    wrongAnswerDamageMultiplier = 0.75, -- 75% damage on wrong (not 50%)
    
    -- Timeout still hits (25%) — but with encouraging message
    timeoutMessage = "Try answering faster next time! You'll get stronger!",
    
    -- Max 3 questions in FTUE combat
    maxQuestions = 3,
    
    -- All multiple choice, easiest tier
    format = "multiple_choice",
    tier = 1, -- Mouse tier (absolute easiest)
    
    -- Generous timer
    timer = 12,
    
    -- Combo feedback starts at 2 (lower threshold for FTUE dopamine)
    comboThreshold = 2,
}
```

---

## 11. Guild War Combat — Team English Mechanics

Source: `GuildManagerIntegrationSpec.md` (SHA `79c01d2e`)

### 11.1 Guild War PvE — Cooperative English

In guild war PvE encounters, teams fight together with shared English mechanics:

| Mechanic | Description | English Integration |
|----------|-------------|-------------------|
| **Team Question** | All guild members see same question | First correct answer = team damage bonus |
| **Chain Answer** | Sequential questions, each member answers one | Full chain = massive team attack |
| **English Rally** | Guild leader triggers rally | All members get bonus question, correct = team buff |
| **Shared Combo** | Team combo counter (anyone's correct answer adds) | Faster combo build, shared bonus |

### 11.2 Guild War PvP — Competitive English

PvP guild combat adds competitive English pressure:

```lua
-- GuildWarPvP combat bridge
function GuildWarBridge:PvPCombatTurn(teamA, teamB)
    -- Both teams get the SAME question simultaneously
    local question = EnglishBridge:SelectGuildWarQuestion(teamA, teamB)
    
    -- Race condition: first team to answer correctly gets advantage
    local resultA = EnglishBridge:PresentToTeam(teamA, question, 5) -- 5s PvP timer
    local resultB = EnglishBridge:PresentToTeam(teamB, question, 5)
    
    -- Scoring:
    -- Both correct: faster team gets 1.5× damage, slower gets 1.0×
    -- One correct: correct team gets 2.0× damage, wrong team gets 0.5×
    -- Both wrong: both get 0.5× damage (mutual penalty)
    
    local damageA, damageB = self:CalculatePvPDamage(resultA, resultB)
    return damageA, damageB
end
```

### 11.3 Guild War English Score

Guild wars track **English Score** alongside combat score:

| Metric | Weight | Description |
|--------|--------|-------------|
| Questions answered correctly | 40% | Raw English performance |
| Average response time | 20% | Speed of English recall |
| Team chain completions | 20% | Cooperative English success |
| Combo maintained | 20% | Consistency of English performance |

**Guild War English Score** determines bonus rewards post-war, creating incentive for ALL guild members to improve English, not just the combat-focused players.

---

## 12. Reward Pipeline — Combat→English→Loot

Source: `RewardBridge.lua` (SHA `36b4f338`), `EnglishRewardsManagerSpec.md` (SHA `f442ac19`)

### 12.1 Post-Combat Reward Calculation

```lua
-- RewardBridge.lua — Post-combat reward distribution
function RewardBridge:CalculateRewards(context)
    local rewards = {
        coins = 0,
        xp = 0,
        englishXP = 0,
        battlePassXP = 0,
        items = {},
        abilityCharges = 0, -- Carry-over for next combat
    }
    
    -- Base rewards from enemy type
    local baseReward = EnemyConfig:GetReward(context.enemy.type)
    rewards.coins = baseReward.coins
    rewards.xp = baseReward.xp
    
    -- English performance multiplier (THE KEY MULTIPLIER)
    local correctRate = context.questionsCorrect / math.max(1, context.questionsAnswered)
    local englishMultiplier = self:GetEnglishRewardMultiplier(correctRate)
    
    rewards.coins = math.floor(rewards.coins * englishMultiplier)
    rewards.xp = math.floor(rewards.xp * englishMultiplier)
    
    -- English XP (from EnglishRewardsManagerSpec §3)
    rewards.englishXP = context.questionsCorrect * 10  -- 10 English XP per correct
    rewards.englishXP = rewards.englishXP + (context.maxComboThisFight * 2) -- Combo bonus
    
    -- BattlePass XP (from CosmeticTrinity §10.2)
    -- Combat wave clear: 25 XP base, but English quiz correct: 50 XP each
    rewards.battlePassXP = 25 + (context.questionsCorrect * 50)
    
    -- Combo bonus rewards
    if context.maxComboThisFight >= 10 then
        rewards.bonusCrate = "EnglishCrate" -- Free English crate for 10+ combo
    end
    if context.maxComboThisFight >= 20 then
        rewards.bonusItem = self:RollBonusItem(context) -- Chance at rare cosmetic
    end
    
    return rewards
end
```

### 12.2 English Reward Multiplier Table

| Correct Rate | Reward Multiplier | Label |
|-------------|-------------------|-------|
| 0% (all wrong/timeout) | 0.25× | "Struggling" |
| 1-29% | 0.5× | "Needs Practice" |
| 30-49% | 0.75× | "Getting There" |
| 50-69% | 1.0× | "Good" |
| 70-84% | 1.25× | "Great" |
| 85-94% | 1.5× | "Excellent" |
| 95-99% | 1.75× | "Outstanding" |
| 100% (perfect) | 2.0× | "PERFECT" |

### 12.3 Streak Integration (from EnglishRewardsManagerSpec §4)

Active English streak (daily login + English activity) adds passive combat bonuses:

| Streak Days | Combat Bonus | Source |
|-------------|-------------|--------|
| 3-day | +5% coin drops | EnglishRewardsManagerSpec §4.1 |
| 7-day | +10% coin drops + 3% gacha luck | EnglishRewardsManagerSpec §4.3 |
| 14-day | +15% all rewards | EnglishRewardsManagerSpec §4.3 |
| 30-day | +20% all rewards + 8% gacha luck | EnglishRewardsManagerSpec §4.3 |
| 100-day | +30% all rewards + guaranteed Epic floor | EnglishRewardsManagerSpec §4.3 |

---

## 13. Cosmetic Integration — Combat Earns English Earns Cosmetics

Source: `CosmeticTrinityIntegrationSpec.md` (SHA `c91097ff`)

### 13.1 The Full Value Chain

```
Combat Victory 
    → English XP earned (more for correct answers)
        → English Aura tier advances (visible status)
            → Streak maintained (gacha luck bonus)
                → Better cosmetic drops (desire engine)
                    → Social status (other players see your gear)
                        → More engagement (desire loop)
```

### 13.2 Combat-Specific Cosmetic Triggers

| Trigger | Cosmetic Reward | Source |
|---------|----------------|--------|
| First combat victory | Title: "Brainrot Survivor" | Combat-only |
| 10-streak in combat | English Crate ×1 | EnglishRewardsManager |
| 20-streak in combat | Rare combat aura (temporary, 1hr) | CosmeticTrinity |
| First boss kill | Pet: "Baby Brainrot" (Common) | Boss loot table |
| Perfect boss fight (100%) | Title: "English Master" + Epic pet chance | Boss loot table |
| Guild war MVP (top English Score) | War Trophy cosmetic (Legendary) | GuildManager |
| 100 total combats | Title: "Veteran Fighter" | Achievement system |
| 1000 correct combat answers | English Aura XP ×500 (massive boost) | EnglishRewardsManager |

### 13.3 Pet Abilities in Combat (from CosmeticTrinity §5.3)

Equipped pets provide passive combat bonuses:

| Pet Ability | Common | Rare | Legendary | Effect in Combat |
|-------------|--------|------|-----------|-----------------|
| XP Boost | +2% | +8% | +18% | More English XP per correct answer |
| Luck Boost | +1% | +3% | +8% | Better post-combat loot |
| English XP Boost | — | +5% | +15% | Faster English Aura progression |

---

## 14. Analytics — Combat×English Event Tracking

Source: `AnalyticsTelemetryIntegrationSpec.md` (SHA `427320695c7f`)

### 14.1 Combat×English Events

| Event | Fires When | Key Properties |
|-------|-----------|---------------|
| `combat_question_answered` | Every combat question | `{questionId, isCorrect, responseTime, comboCount, damageDealt, combatType}` |
| `combat_ability_activated` | Ability used | `{abilityId, chargesUsed, comboAtActivation, gateQuestionResult}` |
| `combat_ability_fizzled` | Gate question failed | `{abilityId, questionId, tier}` |
| `combat_combo_milestone` | 3, 5, 10, 20 streaks | `{milestone, combatType, questionsAnswered}` |
| `combat_combo_broken` | Streak breaks at 5+ | `{lostCombo, questionId, wasTimeout}` |
| `combat_boss_phase` | Boss changes phase | `{bossId, phase, playerHP, comboCount}` |
| `combat_free_revive_attempt` | Death revive question | `{questionTier, isCorrect, responseTime}` |
| `combat_ended` | Combat resolves | `{won, questionsInCombat, correctRate, maxCombo, damageDealt, duration}` |
| `combat_english_score` | Guild war English score | `{guildId, score, correctRate, avgResponseTime, chainCompletions}` |

### 14.2 Key Dashboard Metrics

| Metric | Calculation | Target | Why It Matters |
|--------|------------|--------|---------------|
| **Combat Correct Rate** | Avg correct answers in combat | 55-75% | Learning sweet spot |
| **Avg Combo** | Mean max combo per fight | > 5 | Engagement indicator |
| **Ability Usage Rate** | Abilities activated / combats | > 0.5 | Are gates too hard? |
| **Ability Fizzle Rate** | Fizzled / activated attempts | < 30% | Gate difficulty check |
| **Free Revive Success** | Revive correct / attempts | 30-50% | Should be hard but possible |
| **Boss English Shield Break** | Avg questions to break shield | 2-4 | Boss pacing check |
| **Combat Duration** | Avg fight time | 2-5 min | Session pacing |
| **PvP English Win Correlation** | English score vs PvP win rate | > 0.7 | English should predict winning |

---

## 15. Monetization Hooks — Where Combat Meets Spending

### 15.1 Combat Monetization Touch Points

| Moment | Offer | Source |
|--------|-------|--------|
| **Death** | Revive (75 Robux) | Standard — after free revive fails |
| **Death (boss, > 50% done)** | Premium revive + 30% HP (125 Robux) | Context-aware — invested progress |
| **Post-combat (high combo)** | "Keep your streak! Premium Combo Saver" | Desire-driven — protect investment |
| **Post-combat (low rewards)** | "Double Loot" pass (50 Robux) | Recovery offer — what could have been |
| **Boss defeated** | Premium chest (better loot table) | Victory reward amplifier |
| **Guild war loss** | "Train harder" English booster pack | Improvement-driven |
| **Ability fizzle** | "Study up" English practice mode (free) → Premium questions | Soft convert via frustration |

### 15.2 The English→Spending Pipeline

```
Player struggles with English in combat
    → Weaker damage, lower rewards, no abilities
        → Frustration point (measurable via analytics)
            → TWO paths offered:
                1. LEARN (free): English practice mode, improve naturally
                2. BOOST (paid): XP booster, premium questions, cosmetic motivation
            → Both paths lead to English improvement
                → Better combat performance
                    → More rewards, more fun
                        → Longer sessions
                            → More spending opportunities
```

**Critical rule:** The free path ALWAYS works. Paying is faster/flashier, but never mandatory. Gospel 444 principle: English mastery is the mechanic, money is the consequence of engagement.

---

## 16. Performance Budget

### 16.1 Combat Frame Budget

| System | Budget | Strategy |
|--------|--------|----------|
| Combat state machine | 0.5ms | Simple state transitions |
| Question display | 1ms | Pre-loaded UI, instant swap |
| Damage calculation | 0.2ms | Pure math, no allocation |
| Combo VFX (own player) | 2ms | Particle system, LOD-scaled |
| Combo VFX (other players) | 1ms per visible | Max 5 visible combats nearby |
| Enemy AI | 0.5ms | Simple pattern-based |
| **Total combat budget** | **~6ms** | **36% of 16.6ms frame** |

### 16.2 Network Budget

| Event | Frequency | Size | Strategy |
|-------|-----------|------|----------|
| Question delivery | Per turn (~5s) | ~500 bytes | RemoteFunction |
| Answer submission | Per turn | ~100 bytes | RemoteFunction |
| Damage result | Per turn | ~200 bytes | RemoteEvent |
| Combo update | Per correct answer | ~50 bytes | RemoteEvent (unreliable OK) |
| Ability activation | Per use | ~150 bytes | RemoteFunction |

---

## 17. Anti-Exploit — Server-Authoritative Combat

### 17.1 Server Authority

ALL combat logic runs server-side. Client is display-only:

| Action | Client | Server |
|--------|--------|--------|
| Show question | Display UI | Select question, start timer |
| Submit answer | Send answer text | Validate answer, calculate damage |
| Deal damage | Play animation | Apply HP change, verify math |
| Activate ability | Request activation | Validate charges, run gate question, apply effect |
| Combo tracking | Display counter | Maintain authoritative count |
| Loot grant | Display rewards | Calculate + DataStore write |

### 17.2 Exploit Mitigations

| Vector | Risk | Mitigation |
|--------|------|-----------|
| Answer injection (send "correct" without question) | Critical | Server tracks question state, answer must match active question |
| Timer manipulation | High | Server-side timer, client timer is display-only |
| Damage modification | Critical | All damage calculated server-side |
| Combo inflation | Medium | Server tracks combo, client counter is cosmetic |
| Ability charge injection | High | Server tracks charges per ability per player |
| Auto-answer bots | Medium | Response time tracking, CAPTCHA on suspicious patterns (< 0.5s consistently) |
| Question data mining | Low | Questions rotated, answer not sent to client until after submission |

---

## 18. Implementation Plan

### 18.1 Implementation Priority

| Phase | Module | Dependencies | Effort |
|-------|--------|-------------|--------|
| **P0** | CombatController (state machine) | None | 3 days |
| **P0** | EnglishBridge (question injection) | QuestionService | 2 days |
| **P0** | DamageCalculator (base formula) | None | 1 day |
| **P0** | Basic enemy AI | CombatController | 2 days |
| **P1** | ComboEngine | CombatController | 2 days |
| **P1** | AbilitySystem (3 launch abilities) | EnglishBridge | 3 days |
| **P1** | RewardBridge (post-combat rewards) | EnglishRewardsManager | 2 days |
| **P1** | FTUE combat flow | CombatController, FTUEManager | 2 days |
| **P2** | Boss phase system | CombatController, EnglishBridge | 3 days |
| **P2** | Defense question mechanic | CombatController | 1 day |
| **P2** | Free revive question | CombatController | 1 day |
| **P2** | Full ability roster (8 abilities) | AbilitySystem | 2 days |
| **P3** | Guild war PvE combat | GuildManager, CombatController | 3 days |
| **P3** | Guild war PvP combat | GuildManager, CombatController | 3 days |
| **P3** | Combat analytics wiring | AnalyticsService | 1 day |
| **P3** | Combat monetization hooks | MonetizationOrchestrator | 2 days |
| **P4** | Combat VFX polish (combo tiers) | All controllers | 3 days |
| **P4** | Combat sound design integration | All controllers | 2 days |
| **P4** | Anti-bot detection | AnalyticsService | 2 days |

**Total estimated: ~40 days of implementation**

### 18.2 Testing Requirements

| Test Category | Scope | Automation |
|---------------|-------|-----------|
| Damage formula accuracy | All multiplier combinations | Unit tests |
| Combo math verification | 0-50 combo range | Unit tests |
| Ability charge/gate flow | All 8 abilities | Integration tests |
| FTUE combat guardrails | New player can't die | Integration test |
| Boss phase transitions | HP threshold accuracy | Unit tests |
| PvP fairness | Same question, latency compensation | Load test |
| Exploit resistance | All vectors in §17.2 | Penetration testing |
| Performance regression | 50-player server with combat | Automated benchmark |

---

## 19. Cross-Reference Index

### 19.1 Related Specs

| Spec | Path | Relevance |
|------|------|-----------|
| EnglishRewardsManagerSpec | `CANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md` | §3-4: XP grants, streak bonuses, gacha luck |
| FTUEImplementationSpec | `CANON/TRAIN-67/DOCS/FTUEImplementationSpec.md` | §5-8: First combat flow, 60s window |
| CosmeticTrinityIntegrationSpec | `CANON/TRAIN-67/DOCS/CosmeticTrinityIntegrationSpec.md` | §13-14: English Auras, pet abilities in combat |
| AnalyticsTelemetryIntegrationSpec | `CANON/TRAIN-67/DOCS/AnalyticsTelemetryIntegrationSpec.md` | §3.2: Combat event taxonomy |
| GuildManagerIntegrationSpec | `CANON/TRAIN-67/DOCS/GuildManagerIntegrationSpec.md` | §6-8: Guild war combat mechanics |
| MonetizationOrchestratorSpec | `CANON/TRAIN-67/DOCS/MonetizationOrchestratorSpec.md` | Revive offers, combat monetization |

### 19.2 Related Code

| Module | Path | Integration Point |
|--------|------|-------------------|
| RewardBridge.lua | `CANON/TRAIN-67/CODE/RewardBridge.lua` | Post-combat reward distribution |
| UnifiedServer.lua | `CANON/TRAIN-67/CODE/UnifiedServer.lua` | Server orchestration of combat + English |
| GachaManager.lua | `CANON/TRAIN-67/CODE/GachaManager.lua` | English luck bonus on combat crate drops |
| BattlePass.lua | `CANON/TRAIN-67/CODE/BattlePass.lua` | Combat XP → BP progression |
| EconomyManager.lua | `CANON/TRAIN-67/CODE/EconomyManager.lua` | Currency drops from combat |

### 19.3 Canon Pages

| Page | Content |
|------|---------|
| Gospel 444 & Teaching Methods | Mouse → Tiger progression in combat difficulty |
| Core Principles & Physics | Permission over perfection — wrong answers weaken, don't kill |
| Soul DNA — Canon | English is the mechanic, money is the mission |

---

## Appendix A: Enemy Types and English Difficulty Mapping

| Enemy Tier | English Tier Match | Questions per Fight | Time per Question |
|------------|-------------------|--------------------|--------------------|
| Brainrot Grunt | Mouse (T1) | 3-4 | 8s |
| Brainrot Soldier | Cat (T2) | 4-5 | 8s |
| Brainrot Captain | Dog (T3) | 5-6 | 7s |
| Brainrot Elite | Tiger (T4) | 6-8 | 7s |
| Brainrot Commander | Eagle (T5) | 8-10 | 6s |
| Brainrot Overlord (Boss) | Phoenix (T6) | 10-15 (phased) | 5-6s |

## Appendix B: Revenue Impact Estimates

| Feature | Revenue Driver | Projected Impact |
|---------|---------------|-----------------|
| Death revives | Direct purchase on frustration | 15% of combat revenue |
| Ability boosters | Faster charge accumulation | 10% of combat revenue |
| Premium questions (harder, more XP) | English improvement → retention | 5% of combat revenue |
| Combat cosmetics (combo VFX, titles) | Social status from combat performance | 20% of combat revenue |
| Guild war entry fees | Premium guild war tiers | 15% of combat revenue |
| Double loot passes | Post-combat upsell | 10% of combat revenue |
| English streak maintenance | Retain streak → retain player → retain spending | 25% of combat revenue (indirect) |

---

*Generated by Pulse-Incarnation Engine v5 — Run 57*
*Cross-repo synthesis: 7 source files from Phoenix-Rising-Protocol-Ultimate*
*Artifact class: 🔨 BUILD | Platform Death Test: PASS (commit below)*
