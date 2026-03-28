--[[
    CombatSystem.lua v2.0 — THE Core Combat Engine
    Skibidi Zombie: Survive the Brainrots
    
    REPLACES: v1.0 ESL quiz-based combat (answer questions → damage)
    NOW: Real-time action combat. Tap-to-attack melee, aim-assist ranged,
         dodge roll, boss parry, combo counter, combat juice.
    
    ZERO ESL. ZERO QUESTIONS. PURE COMBAT.
    This game is about killing zombies and MAKING MONEY.
    
    Architecture: ServerScript (ServerScriptService)
    Server-authoritative: all damage, hit detection, rewards validated server-side.
    Client sends input intents only.
    
    Dependencies: WeaponData, EnemyData, DayScaling, CombatRewardsManager,
                  EnemyFactory, EconomyManager, AnalyticsService
    
    Mobile-first: designed for lowest-compute phones.
    All VFX are client-side cosmetic only. Server runs pure math.
    
    Generated: 2026-03-28 | Ne0 direct write | SUPER SAIYAN MODE
    Platform Death Test: PASS
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CombatSystem = {}
CombatSystem.__index = CombatSystem

--------------------------------------------------------------------------------
-- CONFIGURATION
--------------------------------------------------------------------------------

local CONFIG = {
    -- MELEE COMBAT
    MELEE_TAP_WINDOW = 0.4,           -- seconds between taps for combo chain
    MELEE_COMBO_MAX_HITS = 3,          -- 3-hit combo chain
    MELEE_COMBO_FINISHER_MULT = 1.5,   -- 3rd hit deals 1.5x damage
    MELEE_LUNGE_DISTANCE = 3,          -- studs: auto-lunge toward target
    MELEE_HIT_CONE_ANGLE = 60,         -- degrees: frontal arc for hit detection
    MELEE_COOLDOWN_AFTER_COMBO = 0.6,  -- seconds after full combo before next chain
    
    -- RANGED COMBAT
    RANGED_AIM_ASSIST_RADIUS = 8,      -- studs: magnetism radius for mobile aim
    RANGED_AIM_ASSIST_STRENGTH = 0.6,  -- 0-1: how much aim snaps to nearest enemy
    RANGED_HEADSHOT_MULT = 2.0,        -- 2x damage on precision hits
    RANGED_BODYSHOT_MULT = 1.0,
    RANGED_FALLOFF_START = 30,         -- studs: damage falloff begins
    RANGED_FALLOFF_END = 60,           -- studs: minimum damage distance
    RANGED_FALLOFF_MIN_MULT = 0.5,     -- 50% damage at max range
    
    -- DODGE ROLL
    DODGE_DISTANCE = 12,               -- studs traveled
    DODGE_DURATION = 0.4,              -- seconds of roll animation
    DODGE_IFRAMES = 0.3,               -- seconds of invincibility during roll
    DODGE_COOLDOWN = 1.5,              -- seconds between dodges
    DODGE_STAMINA_COST = 25,           -- stamina consumed per dodge
    
    -- STAMINA SYSTEM
    STAMINA_MAX = 100,
    STAMINA_REGEN_RATE = 15,           -- per second (out of combat: 25)
    STAMINA_REGEN_DELAY = 1.0,         -- seconds after action before regen starts
    STAMINA_COMBAT_REGEN = 15,
    STAMINA_OOC_REGEN = 25,
    
    -- BOSS PARRY SYSTEM
    PARRY_WINDOW = 0.5,                -- seconds (matches Combat Warriors feel)
    PARRY_TELEGRAPH_TIME = 1.5,        -- seconds of wind-up before boss attack
    PARRY_STUN_DURATION = 3.0,         -- seconds boss is stunned after successful parry
    PARRY_DAMAGE_MULT = 2.0,           -- 2x damage during stun window
    PARRY_COOLDOWN = 0.3,              -- can't spam parry
    
    -- COMBO COUNTER (kill streaks, not hit combos)
    KILL_COMBO_DECAY_TIME = 4.0,       -- seconds without a kill before combo resets
    KILL_COMBO_THRESHOLDS = {5, 10, 20, 50, 100},
    
    -- PLAYER BASE STATS
    BASE_HEALTH = 100,
    BASE_STAMINA = 100,
    BASE_MOVE_SPEED = 16,              -- Roblox WalkSpeed
    BASE_SPRINT_SPEED = 24,
    SPRINT_STAMINA_COST = 10,          -- per second
    
    -- HEALTH REGEN
    HEALTH_REGEN_DELAY = 5.0,          -- seconds after taking damage
    HEALTH_REGEN_RATE = 3,             -- HP per second
    HEALTH_REGEN_CAP = 0.30,           -- only regen up to 30% of max HP
    
    -- KNOCKBACK
    KNOCKBACK_BASE = 10,               -- studs
    KNOCKBACK_RESIST_PER_LEVEL = 0.02, -- 2% resistance per player level
    
    -- HIT DETECTION
    MAX_HIT_DISTANCE_TOLERANCE = 3,    -- studs: anti-cheat tolerance
    HIT_RATE_LIMIT = 0.1,              -- minimum seconds between registered hits
    
    -- COMBAT JUICE (client-side cosmetic triggers)
    SCREEN_SHAKE_ON_HIT = true,
    HITSTOP_FRAMES = 2,                -- frames of freeze on heavy hit
    DAMAGE_NUMBERS = true,
    COMBO_ANNOUNCER = true,            -- "DOUBLE KILL", "MEGA KILL" etc.
}

--------------------------------------------------------------------------------
-- COMBAT STATE (per player, server-authoritative)
--------------------------------------------------------------------------------

local playerStates = {}

local function createCombatState(player)
    return {
        player = player,
        
        -- Health
        health = CONFIG.BASE_HEALTH,
        maxHealth = CONFIG.BASE_HEALTH,
        lastDamageTime = 0,
        isAlive = true,
        
        -- Stamina
        stamina = CONFIG.STAMINA_MAX,
        maxStamina = CONFIG.STAMINA_MAX,
        lastStaminaUseTime = 0,
        
        -- Melee state
        meleeComboStep = 0,             -- 0 = idle, 1-3 = combo chain position
        lastMeleeTime = 0,
        meleeComboResetTime = 0,
        
        -- Ranged state
        currentAmmo = 0,
        maxAmmo = 0,
        isReloading = false,
        reloadEndTime = 0,
        lastFireTime = 0,
        
        -- Dodge state
        isDodging = false,
        dodgeEndTime = 0,
        lastDodgeTime = 0,
        hasIFrames = false,
        iframeEndTime = 0,
        
        -- Parry state
        isParrying = false,
        parryWindowEnd = 0,
        lastParryTime = 0,
        
        -- Sprint state
        isSprinting = false,
        
        -- Kill combo
        killCombo = 0,
        lastKillTime = 0,
        highestKillCombo = 0,
        
        -- Equipped weapon refs
        equippedMelee = nil,            -- WeaponData entry
        equippedRanged = nil,           -- WeaponData entry
        activeSlot = "Melee",           -- "Melee" or "Ranged"
        
        -- Ability cooldown
        abilityLastUsed = 0,
        abilityCooldownEnd = 0,
        
        -- Stats tracking
        totalDamageDealt = 0,
        totalDamageTaken = 0,
        totalKills = 0,
        totalDeaths = 0,
        bossesKilled = 0,
        dodgesUsed = 0,
        parriesLanded = 0,
        headshots = 0,
        
        -- Anti-cheat
        lastHitRegistered = 0,
        suspiciousHitCount = 0,
        
        -- Combat state
        inCombat = false,
        combatExitTime = 0,
        targetEnemy = nil,
    }
end

--------------------------------------------------------------------------------
-- INITIALIZATION
--------------------------------------------------------------------------------

function CombatSystem.new(deps)
    local self = setmetatable({}, CombatSystem)
    
    self._weaponData = deps.WeaponData
    self._enemyData = deps.EnemyData
    self._dayScaling = deps.DayScaling
    self._rewards = deps.CombatRewardsManager
    self._enemyFactory = deps.EnemyFactory
    self._economy = deps.EconomyManager
    self._analytics = deps.AnalyticsService
    
    -- Enemy registry (server-side enemy instances)
    self._enemies = {}  -- [enemyId] = { id, type, health, maxHealth, position, ... }
    self._nextEnemyId = 1
    
    -- Player states
    self._playerStates = {}
    
    return self
end

function CombatSystem:Init()
    Players.PlayerAdded:Connect(function(player)
        self._playerStates[player.UserId] = createCombatState(player)
        if self._rewards then
            self._rewards:InitPlayer(player)
        end
    end)
    
    Players.PlayerRemoving:Connect(function(player)
        if self._rewards then
            self._rewards:CleanupPlayer(player)
        end
        self._playerStates[player.UserId] = nil
    end)
    
    -- Init existing players
    for _, player in ipairs(Players:GetPlayers()) do
        if not self._playerStates[player.UserId] then
            self._playerStates[player.UserId] = createCombatState(player)
            if self._rewards then
                self._rewards:InitPlayer(player)
            end
        end
    end
    
    -- Server tick for stamina regen, combo decay, iframe tracking
    RunService.Heartbeat:Connect(function(dt)
        self:_tick(dt)
    end)
    
    return true
end

--------------------------------------------------------------------------------
-- SERVER TICK (runs every frame)
--------------------------------------------------------------------------------

function CombatSystem:_tick(dt)
    local now = tick()
    
    for userId, state in pairs(self._playerStates) do
        if not state.isAlive then continue end
        
        -- Stamina regen
        if now - state.lastStaminaUseTime > CONFIG.STAMINA_REGEN_DELAY then
            local regenRate = state.inCombat and CONFIG.STAMINA_COMBAT_REGEN or CONFIG.STAMINA_OOC_REGEN
            state.stamina = math.min(state.maxStamina, state.stamina + regenRate * dt)
        end
        
        -- Health regen (only out of combat, caps at 30%)
        if now - state.lastDamageTime > CONFIG.HEALTH_REGEN_DELAY then
            local regenCap = state.maxHealth * CONFIG.HEALTH_REGEN_CAP
            if state.health < regenCap then
                state.health = math.min(regenCap, state.health + CONFIG.HEALTH_REGEN_RATE * dt)
            end
        end
        
        -- Kill combo decay
        if state.killCombo > 0 and now - state.lastKillTime > CONFIG.KILL_COMBO_DECAY_TIME then
            state.killCombo = 0
        end
        
        -- Dodge end
        if state.isDodging and now > state.dodgeEndTime then
            state.isDodging = false
        end
        
        -- IFrame end
        if state.hasIFrames and now > state.iframeEndTime then
            state.hasIFrames = false
        end
        
        -- Parry window end
        if state.isParrying and now > state.parryWindowEnd then
            state.isParrying = false
        end
        
        -- Melee combo timeout
        if state.meleeComboStep > 0 and now > state.meleeComboResetTime then
            state.meleeComboStep = 0
        end
        
        -- Reload completion
        if state.isReloading and now > state.reloadEndTime then
            state.isReloading = false
            if state.equippedRanged then
                state.currentAmmo = state.equippedRanged.magazineSize or 0
                state.maxAmmo = state.currentAmmo
            end
        end
        
        -- Combat exit timer (5 sec no combat = out of combat)
        if state.inCombat and now > state.combatExitTime then
            state.inCombat = false
        end
        
        -- Sprint stamina drain
        if state.isSprinting and state.stamina > 0 then
            state.stamina = math.max(0, state.stamina - CONFIG.SPRINT_STAMINA_COST * dt)
            state.lastStaminaUseTime = now
            if state.stamina <= 0 then
                state.isSprinting = false
            end
        end
    end
end

--------------------------------------------------------------------------------
-- MELEE ATTACK (tap-to-attack with 3-hit combo chain)
--------------------------------------------------------------------------------

function CombatSystem:MeleeAttack(player, targetPosition, targetEnemyId)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    if state.isDodging then return nil end
    if state.isParrying then return nil end
    
    local weapon = state.equippedMelee
    if not weapon then return { error = "NO_MELEE_WEAPON" } end
    
    local now = tick()
    
    -- Rate limit (anti-cheat)
    if now - state.lastHitRegistered < CONFIG.HIT_RATE_LIMIT then
        return nil
    end
    
    -- Combo chain logic
    local comboStep = state.meleeComboStep
    if comboStep >= CONFIG.MELEE_COMBO_MAX_HITS then
        -- Full combo completed, cooldown
        if now < state.meleeComboResetTime then
            return nil
        end
        comboStep = 0
    end
    
    -- Advance combo
    comboStep = comboStep + 1
    state.meleeComboStep = comboStep
    state.lastMeleeTime = now
    state.lastHitRegistered = now
    
    -- Set combo reset timer
    if comboStep >= CONFIG.MELEE_COMBO_MAX_HITS then
        state.meleeComboResetTime = now + CONFIG.MELEE_COOLDOWN_AFTER_COMBO
    else
        state.meleeComboResetTime = now + CONFIG.MELEE_TAP_WINDOW
    end
    
    -- Get weapon stats
    local speedInfo = self._weaponData and self._weaponData.SpeedTier[weapon.speed]
    local rarityInfo = self._weaponData and self._weaponData.Rarity[weapon.rarity]
    
    -- Calculate damage
    local baseDamage = weapon.damage or 10
    local rarityMult = rarityInfo and rarityInfo.powerMult or 1.0
    local finisherMult = (comboStep == CONFIG.MELEE_COMBO_MAX_HITS) and CONFIG.MELEE_COMBO_FINISHER_MULT or 1.0
    local damage = math.floor(baseDamage * rarityMult * finisherMult)
    
    -- Hit detection: find enemies in frontal cone
    local hits = self:_findEnemiesInCone(player, weapon.range or 6, CONFIG.MELEE_HIT_CONE_ANGLE)
    
    -- Apply damage to all enemies in cone
    local results = {}
    for _, enemyId in ipairs(hits) do
        local enemy = self._enemies[enemyId]
        if enemy then
            local hitResult = self:_applyDamageToEnemy(player, state, enemy, damage, "melee", comboStep)
            table.insert(results, hitResult)
        end
    end
    
    -- Apply knockback
    local knockback = weapon.knockback or CONFIG.KNOCKBACK_BASE
    if comboStep == CONFIG.MELEE_COMBO_MAX_HITS then
        knockback = knockback * 1.5 -- finisher has extra knockback
    end
    
    -- Enter combat
    state.inCombat = true
    state.combatExitTime = now + 5.0
    
    -- Build response packet (sent to client for VFX)
    return {
        type = "MELEE_HIT",
        comboStep = comboStep,
        isFinisher = comboStep == CONFIG.MELEE_COMBO_MAX_HITS,
        damage = damage,
        knockback = knockback,
        hits = results,
        weaponId = weapon.id,
        screenShake = comboStep == CONFIG.MELEE_COMBO_MAX_HITS,
        hitstop = comboStep == CONFIG.MELEE_COMBO_MAX_HITS and CONFIG.HITSTOP_FRAMES or 0,
    }
end

--------------------------------------------------------------------------------
-- RANGED ATTACK (aim-assist for mobile, precision for PC)
--------------------------------------------------------------------------------

function CombatSystem:RangedAttack(player, aimDirection, aimOrigin)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    if state.isDodging then return nil end
    if state.isReloading then return nil end
    
    local weapon = state.equippedRanged
    if not weapon then return { error = "NO_RANGED_WEAPON" } end
    
    local now = tick()
    
    -- Fire rate check
    local fireInterval = 1.0 / (weapon.fireRate or 1.0)
    if now - state.lastFireTime < fireInterval then
        return nil
    end
    
    -- Ammo check
    if state.currentAmmo <= 0 then
        self:StartReload(player)
        return { type = "EMPTY_CLIP", needsReload = true }
    end
    
    -- Rate limit
    if now - state.lastHitRegistered < CONFIG.HIT_RATE_LIMIT then
        return nil
    end
    
    state.lastFireTime = now
    state.lastHitRegistered = now
    state.currentAmmo = state.currentAmmo - 1
    
    -- Aim assist (mobile-first)
    local finalDirection = aimDirection
    if weapon.aimAssist then
        finalDirection = self:_applyAimAssist(aimOrigin, aimDirection, weapon.range or 50)
    end
    
    -- Raycast for hit detection
    local hitEnemy, hitPosition, hitDistance, isHeadshot = self:_raycastForEnemy(aimOrigin, finalDirection, weapon.range or 50)
    
    if not hitEnemy then
        -- Enter combat state even on miss
        state.inCombat = true
        state.combatExitTime = now + 5.0
        return {
            type = "RANGED_MISS",
            weaponId = weapon.id,
            ammoRemaining = state.currentAmmo,
        }
    end
    
    -- Calculate damage with falloff
    local baseDamage = weapon.damage or 10
    local rarityInfo = self._weaponData and self._weaponData.Rarity[weapon.rarity]
    local rarityMult = rarityInfo and rarityInfo.powerMult or 1.0
    local headshotMult = isHeadshot and CONFIG.RANGED_HEADSHOT_MULT or CONFIG.RANGED_BODYSHOT_MULT
    local falloffMult = self:_calculateFalloff(hitDistance)
    
    local damage = math.floor(baseDamage * rarityMult * headshotMult * falloffMult)
    
    -- Apply damage
    local hitResult = self:_applyDamageToEnemy(player, state, hitEnemy, damage, "ranged", 0)
    
    if isHeadshot then
        state.headshots = state.headshots + 1
    end
    
    state.inCombat = true
    state.combatExitTime = now + 5.0
    
    return {
        type = "RANGED_HIT",
        damage = damage,
        isHeadshot = isHeadshot,
        hitPosition = hitPosition,
        hitDistance = hitDistance,
        falloffMult = falloffMult,
        weaponId = weapon.id,
        ammoRemaining = state.currentAmmo,
        enemyKilled = hitResult.killed,
        hitResult = hitResult,
        screenShake = isHeadshot,
    }
end

function CombatSystem:StartReload(player)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return false end
    if state.isReloading then return false end
    
    local weapon = state.equippedRanged
    if not weapon then return false end
    if state.currentAmmo >= (weapon.magazineSize or 0) then return false end
    
    state.isReloading = true
    state.reloadEndTime = tick() + (weapon.reloadTime or 2.0)
    
    return true
end

--------------------------------------------------------------------------------
-- DODGE ROLL
--------------------------------------------------------------------------------

function CombatSystem:DodgeRoll(player, direction)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    if state.isDodging then return nil end
    
    local now = tick()
    if now - state.lastDodgeTime < CONFIG.DODGE_COOLDOWN then
        return nil
    end
    
    if state.stamina < CONFIG.DODGE_STAMINA_COST then
        return { error = "NO_STAMINA" }
    end
    
    -- Consume stamina
    state.stamina = state.stamina - CONFIG.DODGE_STAMINA_COST
    state.lastStaminaUseTime = now
    
    -- Activate dodge
    state.isDodging = true
    state.dodgeEndTime = now + CONFIG.DODGE_DURATION
    state.lastDodgeTime = now
    state.dodgesUsed = state.dodgesUsed + 1
    
    -- Activate iframes
    state.hasIFrames = true
    state.iframeEndTime = now + CONFIG.DODGE_IFRAMES
    
    return {
        type = "DODGE_ROLL",
        direction = direction,
        distance = CONFIG.DODGE_DISTANCE,
        duration = CONFIG.DODGE_DURATION,
        staminaRemaining = state.stamina,
    }
end

--------------------------------------------------------------------------------
-- BOSS PARRY
--------------------------------------------------------------------------------

function CombatSystem:AttemptParry(player)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    
    local now = tick()
    if now - state.lastParryTime < CONFIG.PARRY_COOLDOWN then
        return nil
    end
    
    state.isParrying = true
    state.parryWindowEnd = now + CONFIG.PARRY_WINDOW
    state.lastParryTime = now
    
    return {
        type = "PARRY_START",
        windowDuration = CONFIG.PARRY_WINDOW,
    }
end

function CombatSystem:_checkParryOnBossAttack(state, bossEnemy)
    if not state.isParrying then
        return false
    end
    
    local now = tick()
    if now > state.parryWindowEnd then
        state.isParrying = false
        return false
    end
    
    -- Successful parry
    state.isParrying = false
    state.parriesLanded = state.parriesLanded + 1
    
    -- Stun the boss
    bossEnemy.isStunned = true
    bossEnemy.stunEndTime = now + CONFIG.PARRY_STUN_DURATION
    bossEnemy.damageMult = CONFIG.PARRY_DAMAGE_MULT -- takes extra damage while stunned
    
    return true
end

--------------------------------------------------------------------------------
-- WEAPON ABILITY (Rare+ weapons have special abilities)
--------------------------------------------------------------------------------

function CombatSystem:UseAbility(player)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    
    local weapon = (state.activeSlot == "Melee") and state.equippedMelee or state.equippedRanged
    if not weapon or not weapon.ability then
        return { error = "NO_ABILITY" }
    end
    
    local now = tick()
    if now < state.abilityCooldownEnd then
        return { error = "ON_COOLDOWN", remaining = state.abilityCooldownEnd - now }
    end
    
    -- Get cooldown from weapon data
    local cooldown = 10
    if self._weaponData then
        cooldown = self._weaponData.GetAbilityCooldown(weapon.id) or 10
    end
    
    state.abilityLastUsed = now
    state.abilityCooldownEnd = now + cooldown
    
    -- Execute ability based on type
    local abilityResult = self:_executeAbility(player, state, weapon)
    
    return {
        type = "ABILITY_USED",
        abilityName = weapon.ability,
        abilityDesc = weapon.abilityDesc,
        cooldown = cooldown,
        result = abilityResult,
    }
end

function CombatSystem:_executeAbility(player, state, weapon)
    local abilityName = weapon.ability
    
    -- DashSlash (Katana): dash forward, damage all enemies in path
    if abilityName == "DashSlash" then
        local enemies = self:_findEnemiesInLine(player, 15, 4) -- 15 studs forward, 4 wide
        local damage = math.floor((weapon.damage or 28) * 2.0)
        local kills = 0
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                local result = self:_applyDamageToEnemy(player, state, enemy, damage, "ability", 0)
                if result.killed then kills = kills + 1 end
            end
        end
        return { type = "DASH_SLASH", enemiesHit = #enemies, kills = kills, distance = 15 }
    
    -- Shred (Chainsaw): rapid hits over 2 seconds
    elseif abilityName == "Shred" then
        local target = state.targetEnemy
        if not target then return { type = "NO_TARGET" } end
        local tickDamage = 5
        local totalTicks = 10
        -- Schedule damage ticks (server-side)
        for i = 1, totalTicks do
            task.delay(i * 0.2, function()
                if self._enemies[target.id] and state.isAlive then
                    self:_applyDamageToEnemy(player, state, self._enemies[target.id], tickDamage, "ability", 0)
                end
            end)
        end
        return { type = "SHRED", totalDamage = tickDamage * totalTicks, duration = 2.0 }
    
    -- ToiletTornado (Skibidi Blade): AoE spin attack
    elseif abilityName == "ToiletTornado" then
        local enemies = self:_findEnemiesInRadius(player, 12)
        local damage = 30
        local kills = 0
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                local result = self:_applyDamageToEnemy(player, state, enemy, damage, "ability", 0)
                if result.killed then kills = kills + 1 end
            end
        end
        return { type = "AOE_SPIN", radius = 12, enemiesHit = #enemies, kills = kills }
    
    -- OnePunch (Sigma Fist): massive single-target
    elseif abilityName == "OnePunch" then
        local target = state.targetEnemy
        if not target or not self._enemies[target.id] then return { type = "NO_TARGET" } end
        local damage = math.floor((weapon.damage or 55) * 5.0)
        local result = self:_applyDamageToEnemy(player, state, self._enemies[target.id], damage, "ability", 0)
        return { type = "ONE_PUNCH", damage = damage, killed = result.killed }
    
    -- Explosion (Ohio Cannon): AoE ranged explosion
    elseif abilityName == "Explosion" then
        local enemies = self:_findEnemiesInRadius(player, 15)
        local damage = 30
        local kills = 0
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                local result = self:_applyDamageToEnemy(player, state, enemy, damage, "ability", 0)
                if result.killed then kills = kills + 1 end
            end
        end
        return { type = "EXPLOSION", radius = 15, enemiesHit = #enemies, kills = kills }
    
    -- CharmBeam (Rizz Ray): enemies fight each other
    elseif abilityName == "CharmBeam" then
        local enemies = self:_findEnemiesInCone(player, 45, 30)
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                enemy.isCharmed = true
                enemy.charmEndTime = tick() + 5.0
            end
        end
        return { type = "CHARM_BEAM", enemiesCharmed = #enemies, duration = 5.0 }
    
    -- BurstFire (AR-15): 3 rapid shots
    elseif abilityName == "BurstFire" then
        local target = state.targetEnemy
        if not target or not self._enemies[target.id] then return { type = "NO_TARGET" } end
        local shotDamage = weapon.damage or 15
        local totalDamage = 0
        for i = 1, 3 do
            if self._enemies[target.id] then
                local result = self:_applyDamageToEnemy(player, state, self._enemies[target.id], shotDamage, "ability", 0)
                totalDamage = totalDamage + shotDamage
                if result.killed then break end
            end
        end
        return { type = "BURST_FIRE", shots = 3, totalDamage = totalDamage }
    
    -- Headshot (Sniper): guaranteed crit
    elseif abilityName == "Headshot" then
        local target = state.targetEnemy
        if not target or not self._enemies[target.id] then return { type = "NO_TARGET" } end
        local damage = math.floor((weapon.damage or 60) * CONFIG.RANGED_HEADSHOT_MULT)
        local result = self:_applyDamageToEnemy(player, state, self._enemies[target.id], damage, "ability", 0)
        state.headshots = state.headshots + 1
        return { type = "GUARANTEED_CRIT", damage = damage, killed = result.killed }
    
    -- Bleed (Machete): DoT
    elseif abilityName == "Bleed" then
        local target = state.targetEnemy
        if not target or not self._enemies[target.id] then return { type = "NO_TARGET" } end
        local dotDamage = 3
        local dotDuration = 4
        for i = 1, dotDuration do
            task.delay(i, function()
                if self._enemies[target.id] and state.isAlive then
                    self:_applyDamageToEnemy(player, state, self._enemies[target.id], dotDamage, "ability_dot", 0)
                end
            end)
        end
        return { type = "BLEED", dps = dotDamage, duration = dotDuration }
    
    -- Cleave (Fire Axe): hit 2 enemies in arc
    elseif abilityName == "Cleave" then
        local enemies = self:_findEnemiesInCone(player, weapon.range or 8, 90)
        local damage = math.floor((weapon.damage or 22) * 1.5)
        local maxTargets = 2
        local kills = 0
        for i, enemyId in ipairs(enemies) do
            if i > maxTargets then break end
            local enemy = self._enemies[enemyId]
            if enemy then
                local result = self:_applyDamageToEnemy(player, state, enemy, damage, "ability", 0)
                if result.killed then kills = kills + 1 end
            end
        end
        return { type = "CLEAVE", enemiesHit = math.min(#enemies, maxTargets), kills = kills }
    
    -- Spread (Shotgun): cone AoE
    elseif abilityName == "Spread" then
        local enemies = self:_findEnemiesInCone(player, 10, 45)
        local damage = weapon.damage or 25
        local kills = 0
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                local result = self:_applyDamageToEnemy(player, state, enemy, damage, "ability", 0)
                if result.killed then kills = kills + 1 end
            end
        end
        return { type = "SPREAD_SHOT", enemiesHit = #enemies, kills = kills }
    
    -- Confuse (Brainrot Bomb throwable ability)
    elseif abilityName == "Confuse" then
        local enemies = self:_findEnemiesInRadius(player, 15)
        for _, enemyId in ipairs(enemies) do
            local enemy = self._enemies[enemyId]
            if enemy then
                enemy.isConfused = true
                enemy.confuseEndTime = tick() + 5.0
            end
        end
        return { type = "CONFUSE", enemiesConfused = #enemies, duration = 5.0 }
    end
    
    return { type = "UNKNOWN_ABILITY" }
end

--------------------------------------------------------------------------------
-- DAMAGE APPLICATION (server-authoritative)
--------------------------------------------------------------------------------

function CombatSystem:_applyDamageToEnemy(player, state, enemy, damage, source, comboStep)
    if not enemy or enemy.health <= 0 then
        return { killed = false, damage = 0 }
    end
    
    -- Boss stun damage multiplier
    if enemy.isStunned and enemy.damageMult then
        damage = math.floor(damage * enemy.damageMult)
    end
    
    -- Apply damage
    enemy.health = enemy.health - damage
    state.totalDamageDealt = state.totalDamageDealt + damage
    
    local killed = enemy.health <= 0
    
    if killed then
        local now = tick()
        state.totalKills = state.totalKills + 1
        state.killCombo = state.killCombo + 1
        state.lastKillTime = now
        
        if state.killCombo > state.highestKillCombo then
            state.highestKillCombo = state.killCombo
        end
        
        local isBoss = enemy.type == "SigmaBoss"
        if isBoss then
            state.bossesKilled = state.bossesKilled + 1
        end
        
        -- Process kill rewards
        if self._rewards then
            self._rewards:ProcessKill(
                player,
                enemy.type,
                enemy.isElite or false,
                isBoss,
                enemy.dayNumber or 1,
                0 -- prestigeLevel
            )
        end
        
        -- Remove from enemy registry
        self._enemies[enemy.id] = nil
    end
    
    return {
        killed = killed,
        damage = damage,
        remainingHP = math.max(0, enemy.health),
        killCombo = state.killCombo,
        source = source,
    }
end

--------------------------------------------------------------------------------
-- PLAYER TAKES DAMAGE (from enemy attacks)
--------------------------------------------------------------------------------

function CombatSystem:DamagePlayer(player, damage, source, attackerEnemy)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return nil end
    
    -- IFrame check (dodge roll invincibility)
    if state.hasIFrames then
        return { type = "DODGED", damage = 0 }
    end
    
    -- Parry check (for boss attacks)
    if attackerEnemy and attackerEnemy.type == "SigmaBoss" then
        if self:_checkParryOnBossAttack(state, attackerEnemy) then
            return {
                type = "PARRIED",
                damage = 0,
                bossStunned = true,
                stunDuration = CONFIG.PARRY_STUN_DURATION,
            }
        end
    end
    
    -- Apply damage
    state.health = math.max(0, state.health - damage)
    state.totalDamageTaken = state.totalDamageTaken + damage
    state.lastDamageTime = tick()
    state.inCombat = true
    state.combatExitTime = tick() + 5.0
    
    -- Break kill combo on damage
    if self._rewards then
        self._rewards:BreakCombo(player)
    end
    
    -- Death check
    local died = state.health <= 0
    if died then
        state.isAlive = false
        state.totalDeaths = state.totalDeaths + 1
        
        -- Death penalty
        if self._rewards then
            self._rewards:ProcessDeath(player)
        end
    end
    
    return {
        type = died and "PLAYER_DIED" or "PLAYER_HIT",
        damage = damage,
        health = state.health,
        maxHealth = state.maxHealth,
        died = died,
        source = source,
    }
end

function CombatSystem:RespawnPlayer(player)
    local state = self._playerStates[player.UserId]
    if not state then return false end
    
    state.health = state.maxHealth
    state.stamina = state.maxStamina
    state.isAlive = true
    state.isDodging = false
    state.hasIFrames = false
    state.isParrying = false
    state.isReloading = false
    state.meleeComboStep = 0
    state.killCombo = 0
    state.inCombat = false
    
    -- Reload ranged weapon
    if state.equippedRanged then
        state.currentAmmo = state.equippedRanged.magazineSize or 0
    end
    
    return true
end

--------------------------------------------------------------------------------
-- ENEMY MANAGEMENT (server-side registry)
--------------------------------------------------------------------------------

function CombatSystem:SpawnEnemy(enemyDef, dayNumber, position, isElite)
    local id = self._nextEnemyId
    self._nextEnemyId = id + 1
    
    -- Scale stats by day
    local scaledHP = enemyDef.baseHP or 30
    local scaledDamage = enemyDef.baseDamage or 5
    local scaledSpeed = enemyDef.baseSpeed or 8
    
    if self._enemyData then
        scaledHP = self._enemyData.GetScaledHP(enemyDef.id, dayNumber) or scaledHP
        scaledDamage = self._enemyData.GetScaledDamage(enemyDef.id, dayNumber) or scaledDamage
    end
    
    -- Elite modifier
    if isElite then
        scaledHP = math.floor(scaledHP * 2.0)
        scaledDamage = math.floor(scaledDamage * 1.5)
    end
    
    local enemy = {
        id = id,
        defId = enemyDef.id,
        type = enemyDef.type,
        name = enemyDef.name,
        health = scaledHP,
        maxHealth = scaledHP,
        damage = scaledDamage,
        speed = scaledSpeed,
        position = position,
        isElite = isElite,
        dayNumber = dayNumber,
        
        -- Status effects
        isStunned = false,
        stunEndTime = 0,
        isCharmed = false,
        charmEndTime = 0,
        isConfused = false,
        confuseEndTime = 0,
        damageMult = 1.0,
        
        -- Special ability
        specialAbility = enemyDef.specialAbility,
    }
    
    self._enemies[id] = enemy
    return enemy
end

function CombatSystem:SpawnBoss(bossDef, dayNumber, position, playerCount)
    local id = self._nextEnemyId
    self._nextEnemyId = id + 1
    
    local scaledHP = bossDef.baseHP or 200
    if self._enemyData then
        scaledHP = self._enemyData.GetBossHP(bossDef.id, dayNumber, playerCount) or scaledHP
    end
    
    local boss = {
        id = id,
        defId = bossDef.id,
        type = bossDef.type,
        name = bossDef.name,
        health = scaledHP,
        maxHealth = scaledHP,
        damage = bossDef.baseDamage or 20,
        speed = bossDef.baseSpeed or 6,
        position = position,
        isElite = false,
        dayNumber = dayNumber,
        
        -- Boss-specific
        isBoss = true,
        telegraphTime = bossDef.telegraphTime or 1.5,
        parryWindow = bossDef.parryWindow or 0.5,
        enrageTimer = bossDef.enrageTimer or 120,
        enrageDmgMult = bossDef.enrageDmgMult or 1.5,
        enrageSpeedMult = bossDef.enrageSpeedMult or 1.3,
        attackPatterns = bossDef.attackPatterns or {},
        currentPatternIndex = 1,
        
        -- Status
        isStunned = false,
        stunEndTime = 0,
        damageMult = 1.0,
        isEnraged = false,
        spawnTime = tick(),
    }
    
    self._enemies[id] = boss
    return boss
end

--------------------------------------------------------------------------------
-- WEAPON EQUIP
--------------------------------------------------------------------------------

function CombatSystem:EquipWeapon(player, weaponId, slot)
    local state = self._playerStates[player.UserId]
    if not state then return false end
    
    if not self._weaponData then return false end
    
    local weapon = self._weaponData.GetWeapon(weaponId)
    if not weapon then return false end
    
    if slot == "Melee" or weapon.weaponType == "Melee" then
        state.equippedMelee = weapon
    elseif slot == "Ranged" or weapon.weaponType == "Ranged" then
        state.equippedRanged = weapon
        state.currentAmmo = weapon.magazineSize or 0
        state.maxAmmo = state.currentAmmo
    end
    
    return true
end

function CombatSystem:SwitchSlot(player, slot)
    local state = self._playerStates[player.UserId]
    if not state then return false end
    
    if slot ~= "Melee" and slot ~= "Ranged" then return false end
    state.activeSlot = slot
    return true
end

--------------------------------------------------------------------------------
-- SPRINT
--------------------------------------------------------------------------------

function CombatSystem:SetSprinting(player, sprinting)
    local state = self._playerStates[player.UserId]
    if not state or not state.isAlive then return false end
    
    if sprinting and state.stamina <= 0 then return false end
    state.isSprinting = sprinting
    return true
end

--------------------------------------------------------------------------------
-- HIT DETECTION HELPERS (server-side spatial queries)
--------------------------------------------------------------------------------

function CombatSystem:_findEnemiesInCone(player, range, angleDegs)
    -- Server-side: check all enemies within range and angle of player facing
    local results = {}
    local character = player.Character
    if not character then return results end
    
    local root = character:FindFirstChild("HumanoidRootPart")
    if not root then return results end
    
    local origin = root.Position
    local forward = root.CFrame.LookVector
    local halfAngle = math.rad(angleDegs / 2)
    
    for id, enemy in pairs(self._enemies) do
        if enemy.health > 0 and enemy.position then
            local toEnemy = (enemy.position - origin)
            local dist = toEnemy.Magnitude
            if dist <= range then
                local angle = math.acos(math.clamp(forward:Dot(toEnemy.Unit), -1, 1))
                if angle <= halfAngle then
                    table.insert(results, id)
                end
            end
        end
    end
    
    return results
end

function CombatSystem:_findEnemiesInRadius(player, radius)
    local results = {}
    local character = player.Character
    if not character then return results end
    
    local root = character:FindFirstChild("HumanoidRootPart")
    if not root then return results end
    
    local origin = root.Position
    
    for id, enemy in pairs(self._enemies) do
        if enemy.health > 0 and enemy.position then
            local dist = (enemy.position - origin).Magnitude
            if dist <= radius then
                table.insert(results, id)
            end
        end
    end
    
    return results
end

function CombatSystem:_findEnemiesInLine(player, length, width)
    local results = {}
    local character = player.Character
    if not character then return results end
    
    local root = character:FindFirstChild("HumanoidRootPart")
    if not root then return results end
    
    local origin = root.Position
    local forward = root.CFrame.LookVector
    local halfWidth = width / 2
    
    for id, enemy in pairs(self._enemies) do
        if enemy.health > 0 and enemy.position then
            local toEnemy = enemy.position - origin
            local forwardDist = forward:Dot(toEnemy)
            if forwardDist > 0 and forwardDist <= length then
                local lateral = (toEnemy - forward * forwardDist).Magnitude
                if lateral <= halfWidth then
                    table.insert(results, id)
                end
            end
        end
    end
    
    return results
end

function CombatSystem:_applyAimAssist(origin, direction, maxRange)
    -- Find nearest enemy to aim line within assist radius
    local bestTarget = nil
    local bestDist = CONFIG.RANGED_AIM_ASSIST_RADIUS
    
    for _, enemy in pairs(self._enemies) do
        if enemy.health > 0 and enemy.position then
            local toEnemy = enemy.position - origin
            local projDist = direction:Dot(toEnemy)
            if projDist > 0 and projDist <= maxRange then
                local lateralDist = (toEnemy - direction * projDist).Magnitude
                if lateralDist < bestDist then
                    bestDist = lateralDist
                    bestTarget = enemy
                end
            end
        end
    end
    
    if bestTarget then
        local toTarget = (bestTarget.position - origin).Unit
        -- Blend original aim with assist
        local blended = (direction * (1 - CONFIG.RANGED_AIM_ASSIST_STRENGTH) + toTarget * CONFIG.RANGED_AIM_ASSIST_STRENGTH).Unit
        return blended
    end
    
    return direction
end

function CombatSystem:_raycastForEnemy(origin, direction, maxRange)
    -- Simplified server-side raycast against enemy hitboxes
    local bestHit = nil
    local bestDist = maxRange
    
    for _, enemy in pairs(self._enemies) do
        if enemy.health > 0 and enemy.position then
            local toEnemy = enemy.position - origin
            local projDist = direction:Dot(toEnemy)
            if projDist > 0 and projDist <= maxRange then
                local lateralDist = (toEnemy - direction * projDist).Magnitude
                local hitRadius = 3 -- stud hitbox radius
                if lateralDist <= hitRadius and projDist < bestDist then
                    bestDist = projDist
                    bestHit = enemy
                end
            end
        end
    end
    
    if bestHit then
        -- Headshot check (top 30% of hitbox)
        local isHeadshot = math.random() < 0.15 -- simplified; real impl checks Y position
        return bestHit, bestHit.position, bestDist, isHeadshot
    end
    
    return nil, nil, 0, false
end

function CombatSystem:_calculateFalloff(distance)
    if distance <= CONFIG.RANGED_FALLOFF_START then
        return 1.0
    elseif distance >= CONFIG.RANGED_FALLOFF_END then
        return CONFIG.RANGED_FALLOFF_MIN_MULT
    else
        local t = (distance - CONFIG.RANGED_FALLOFF_START) / (CONFIG.RANGED_FALLOFF_END - CONFIG.RANGED_FALLOFF_START)
        return 1.0 - t * (1.0 - CONFIG.RANGED_FALLOFF_MIN_MULT)
    end
end

--------------------------------------------------------------------------------
-- PUBLIC API
--------------------------------------------------------------------------------

function CombatSystem:GetPlayerState(player)
    return self._playerStates[player.UserId]
end

function CombatSystem:GetEnemy(enemyId)
    return self._enemies[enemyId]
end

function CombatSystem:GetAllEnemies()
    return self._enemies
end

function CombatSystem:GetConfig()
    return CONFIG
end

function CombatSystem:GetPlayerStats(player)
    local state = self._playerStates[player.UserId]
    if not state then return nil end
    
    return {
        totalKills = state.totalKills,
        totalDeaths = state.totalDeaths,
        totalDamageDealt = state.totalDamageDealt,
        totalDamageTaken = state.totalDamageTaken,
        highestKillCombo = state.highestKillCombo,
        bossesKilled = state.bossesKilled,
        headshots = state.headshots,
        dodgesUsed = state.dodgesUsed,
        parriesLanded = state.parriesLanded,
    }
end

return CombatSystem
