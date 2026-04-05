--[[
	CombatSystem.lua v2.0 -- Real Tap-to-Attack Combat
	Game: Survive a Brainrot
	Replaces: ESL quiz combat (v1.x)

	ARCHITECTURE: Server-authoritative. Client predicts, server validates.
	Sacred Rule: < 100ms tap-to-feedback via client prediction.

	Input model (mobile-first, 4 action buttons max):
	  Attack   -- tap to melee, 3-hit combo (3rd hit = knockback)
	  Dodge    -- 0.5s i-frames, 3s cooldown
	  Ability  -- weapon special (Rare+ only), per-rarity cooldown
	  Interact -- pick up drops, shop, doors

	Ranged: hold aim + tap fire, 15-degree aim-assist snap on mobile.
	Boss parry: dodge during 1.5s telegraph = 3s stun.

	Combo multipliers (consecutive kills without taking damage):
	  5x = 1.5x coins | 10x = 2x | 50x = 5x | 100x = 10x

	Combat juice (mandatory):
	  Screen shake on hit, hit flash, knockback on 3rd melee hit,
	  floating damage numbers, haptic on mobile, kill dissolve.

	Network: 2 RemoteEvents
	  EventBus       (client -> server actions)
	  ClientDispatch (server -> client notifications)

	Dependencies: ServerGateway, WeaponData, EnemyData, EnemyFactory,
	              EconomyManager, CombatRewardsManager, SecurityLayer
	Version: 2.0.0
	Date: 2026-03-28
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players           = game:GetService("Players")
local ServerStorage     = game:GetService("ServerStorage")

------------------------------------------------------------------------
-- LAZY DEPENDENCIES (injected at Init)
------------------------------------------------------------------------

local ServerGateway        = nil
local WeaponData           = nil
local EnemyData            = nil
local EnemyFactory         = nil
local EconomyManager       = nil -- luacheck: ignore
local CombatRewardsManager = nil
local SecurityLayer        = nil

local CombatSystem = {}

------------------------------------------------------------------------
-- CONFIGURATION
------------------------------------------------------------------------

local CONFIG = {
	-- Melee
	MELEE_COMBO_HITS      = 3,
	MELEE_KNOCKBACK_FORCE = 60,
	MELEE_HIT_WINDOW      = 0.4,
	MELEE_DAMAGE_MULT     = { 1.0, 1.0, 1.5 },

	-- Ranged
	AIM_ASSIST_ANGLE      = 15,
	AIM_ASSIST_RANGE      = 60,

	-- Dodge
	DODGE_IFRAME_DURATION = 0.5,
	DODGE_COOLDOWN        = 3.0,

	-- Boss parry
	PARRY_STUN_DURATION   = 3.0,

	-- Combo coin multipliers (consecutive kills without taking damage)
	COMBO_MULTIPLIERS = {
		[5]   = 1.5,
		[10]  = 2.0,
		[50]  = 5.0,
		[100] = 10.0,
	},

	BASE_PLAYER_HP  = 100,
	RESPAWN_DELAY   = 3.0,
	AI_TICK_RATE    = 0.5,

	-- Defaults (used when weapon/enemy definitions are unavailable)
	DEFAULT_ENEMY_HP             = 30,
	DEFAULT_MAGAZINE_SIZE        = 12,
	ABILITY_TARGET_SEARCH_RADIUS = 30, -- studs, used when no target is provided
	RATE_LIMIT_WINDOW = 1.0,
	RATE_LIMIT_MAX    = 15,
}

------------------------------------------------------------------------
-- PLAYER STATE
------------------------------------------------------------------------

local playerStates = {}

local function newPlayerState(player)
	return {
		player           = player,
		hp               = CONFIG.BASE_PLAYER_HP,
		maxHp            = CONFIG.BASE_PLAYER_HP,
		isAlive          = true,

		meleeWeaponId    = "melee_rusty_pipe",
		rangedWeaponId   = "ranged_slingshot",
		equippedType     = "Melee",

		comboHit         = 0,
		lastMeleeTime    = 0,

		isDodging        = false,
		dodgeEndTime     = 0,
		dodgeCooldownEnd = 0,

		abilityCooldownEnd = 0,

		magazineAmmo     = 0,
		reloading        = false,
		reloadEndTime    = 0,

		killStreak       = 0,
		totalKills       = 0,
		bossKills        = 0,
		damageDone       = 0,

		activeEffects    = {},

		_eventCount      = 0,
		_eventWindow     = 0,
	}
end

------------------------------------------------------------------------
-- ENEMY RUNTIME STATE
------------------------------------------------------------------------

local enemyStates = {}

local function newEnemyState(enemyId, enemyDef, dayNumber)
	local hp = CONFIG.DEFAULT_ENEMY_HP
	if EnemyData then
		hp = EnemyData.GetScaledHP(enemyId, dayNumber or 1) or hp
	elseif enemyDef then
		hp = enemyDef.baseHP or hp
	end
	return {
		id               = enemyId,
		def              = enemyDef,
		hp               = hp,
		maxHp            = hp,
		isAlive          = true,
		dayNumber        = dayNumber or 1,

		isBleeding       = false, bleedEndTime = 0, bleedDmgPerSec = 0,
		isConfused       = false, confusedEndTime = 0,
		isCharmed        = false, charmedEndTime  = 0,
		isStaggered      = false, staggerEndTime  = 0,
		isStuned         = false, stunEndTime     = 0,

		isBoss           = false,
		isTelegraphing   = false,
		telegraphEndTime = 0,
		isEnraged        = false,
		enrageTime       = 0,
		attackIndex      = 1,
		lastAttackTime   = 0,
	}
end

------------------------------------------------------------------------
-- UTILITY
------------------------------------------------------------------------

local function getComboMultiplier(killStreak)
	local best = 1.0
	for threshold, mult in pairs(CONFIG.COMBO_MULTIPLIERS) do
		if killStreak >= threshold and mult > best then
			best = mult
		end
	end
	return best
end

local function isRateLimited(state)
	local now = tick()
	if now - state._eventWindow > CONFIG.RATE_LIMIT_WINDOW then
		state._eventCount  = 0
		state._eventWindow = now
	end
	state._eventCount = state._eventCount + 1
	return state._eventCount > CONFIG.RATE_LIMIT_MAX
end

local _clientDispatch = nil

local function fireAllClients(event, data)
	if _clientDispatch then _clientDispatch:FireAllClients(event, data) end
end

local function fireClient(player, event, data)
	if _clientDispatch then _clientDispatch:FireClient(player, event, data) end
end

------------------------------------------------------------------------
-- DAMAGE APPLICATION (server-authoritative)
------------------------------------------------------------------------

local function damageEnemy(attackerPlayer, enemyState, rawDamage, isKnockback)
	if not enemyState or not enemyState.isAlive then return 0 end
	local damage = math.max(0, math.floor(rawDamage))
	enemyState.hp = enemyState.hp - damage

	fireAllClients("EnemyHit", {
		enemyId   = enemyState.id,
		damage    = damage,
		isCrit    = false,
		knockback = isKnockback or false,
	})

	if attackerPlayer then
		fireClient(attackerPlayer, "ScreenShake", {
			intensity = math.clamp(damage / 50, 0.1, 1.0),
		})
	end

	if enemyState.hp <= 0 then
		CombatSystem._defeatEnemy(attackerPlayer, enemyState)
	end
	return damage
end

local function damagePlayer(targetPlayer, amount, sourceEnemyId)
	local state = playerStates[targetPlayer]
	if not state or not state.isAlive then return end
	if state.isDodging and tick() < state.dodgeEndTime then return end

	state.hp = math.max(0, state.hp - amount)

	if state.killStreak > 0 then
		state.killStreak = 0
		fireClient(targetPlayer, "ComboReset", {})
	end

	fireClient(targetPlayer, "PlayerHit", {
		damage    = amount,
		currentHp = state.hp,
		maxHp     = state.maxHp,
		source    = sourceEnemyId,
	})

	if state.hp <= 0 then
		CombatSystem._defeatPlayer(targetPlayer)
	end
end

------------------------------------------------------------------------
-- DEFEAT HANDLERS
------------------------------------------------------------------------

function CombatSystem._defeatEnemy(killerPlayer, enemyState)
	if not enemyState.isAlive then return end
	enemyState.isAlive = false

	local dayNumber   = enemyState.dayNumber or 1
	local killerState = killerPlayer and playerStates[killerPlayer]
	local comboMult   = 1.0

	if killerState then
		killerState.killStreak = killerState.killStreak + 1
		killerState.totalKills = killerState.totalKills + 1
		if enemyState.isBoss then killerState.bossKills = killerState.bossKills + 1 end
		comboMult = getComboMultiplier(killerState.killStreak)

		local streak = killerState.killStreak
		if CONFIG.COMBO_MULTIPLIERS[streak] then
			fireAllClients("ComboMilestone", {
				player = killerPlayer.Name,
				streak = streak,
				mult   = CONFIG.COMBO_MULTIPLIERS[streak],
			})
		end
	end

	if CombatRewardsManager then
		pcall(CombatRewardsManager.OnEnemyKilled, killerPlayer, {
			enemyId   = enemyState.id,
			isBoss    = enemyState.isBoss,
			dayNumber = dayNumber,
			comboMult = comboMult,
		})
	end

	fireAllClients("EnemyDied", {
		enemyId   = enemyState.id,
		killedBy  = killerPlayer and killerPlayer.Name or "ENV",
		comboMult = comboMult,
	})

	-- BrainrotMutant split on defeat
	local def = enemyState.def
	if def and def.specialAbility == "Split" and def.splitCount then
		if EnemyFactory and type(EnemyFactory.SpawnSplitMinis) == "function" then
			pcall(EnemyFactory.SpawnSplitMinis, enemyState, def)
		end
	end

	-- Boss post-defeat gacha spin
	if enemyState.isBoss and killerPlayer then
		fireClient(killerPlayer, "BossGachaSpinStart", {
			bossId = enemyState.id,
			day    = dayNumber,
		})
	end

	enemyStates[enemyState.id] = nil
end

function CombatSystem._defeatPlayer(player)
	local state = playerStates[player]
	if not state or not state.isAlive then return end
	state.isAlive    = false
	state.killStreak = 0
	state.hp         = 0
	fireAllClients("PlayerDied", { player = player.Name })

	task.delay(CONFIG.RESPAWN_DELAY, function()
		if playerStates[player] then
			CombatSystem.RespawnPlayer(player)
		end
	end)
end

function CombatSystem.RespawnPlayer(player)
	local state = playerStates[player]
	if not state then return end
	state.hp               = state.maxHp
	state.isAlive          = true
	state.killStreak       = 0
	state.isDodging        = false
	state.dodgeEndTime     = 0
	state.dodgeCooldownEnd = 0
	state.comboHit         = 0
	state.lastMeleeTime    = 0
	state.activeEffects    = {}
	fireClient(player, "PlayerRespawned", { currentHp = state.hp, maxHp = state.maxHp })
end

------------------------------------------------------------------------
-- WEAPON ABILITY DISPATCHER
------------------------------------------------------------------------

local function applyWeaponAbility(attackerState, enemyState, weaponDef)
	if not weaponDef or not weaponDef.ability then return 0 end
	local now = tick()
	if now < attackerState.abilityCooldownEnd then return 0 end

	local cooldown = (WeaponData and WeaponData.GetAbilityCooldown(weaponDef.id)) or 0
	attackerState.abilityCooldownEnd = now + cooldown

	local ability = weaponDef.ability
	local addDmg  = 0

	if ability == "Bleed" then
		enemyState.isBleeding     = true
		enemyState.bleedEndTime   = now + 4
		enemyState.bleedDmgPerSec = 3

	elseif ability == "Cleave" or ability == "DashSlash" then
		addDmg = weaponDef.damage

	elseif ability == "Shred" then
		task.spawn(function()
			for _ = 1, 10 do
				if enemyState.isAlive then
					enemyState.hp = enemyState.hp - 5
					fireAllClients("EnemyHit", { enemyId = enemyState.id, damage = 5, isCrit = false })
					if enemyState.hp <= 0 then
						CombatSystem._defeatEnemy(nil, enemyState)
						break
					end
				end
				task.wait(0.2)
			end
		end)

	elseif ability == "ToiletTornado" then
		addDmg = 30

	elseif ability == "OnePunch" then
		if enemyState.def and enemyState.def.type == "SkibidiZombie" then
			addDmg = enemyState.hp + 1
		else
			addDmg = weaponDef.damage * 2
		end
		fireAllClients("ScreenDistort", { intensity = 1.0 })

	elseif ability == "BurstFire" then
		addDmg = weaponDef.damage * 2

	elseif ability == "Headshot" or ability == "Explosion" or ability == "Spread" then
		addDmg = weaponDef.damage

	elseif ability == "CharmBeam" then
		enemyState.isCharmed      = true
		enemyState.charmedEndTime = now + 5

	elseif ability == "Confuse" then
		enemyState.isConfused      = true
		enemyState.confusedEndTime = now + 5
	end

	return addDmg
end

------------------------------------------------------------------------
-- ACTION HANDLERS (routed from EventBus)
------------------------------------------------------------------------

function CombatSystem.OnMeleeAttack(player, data)
	local state = playerStates[player]
	if not state or not state.isAlive then return end
	if isRateLimited(state) then return end

	local now      = tick()
	local weaponId = (type(data) == "table" and type(data.weaponId) == "string")
		and data.weaponId or state.meleeWeaponId
	local targetId = type(data) == "table" and data.targetEnemyId

	if now - state.lastMeleeTime > CONFIG.MELEE_HIT_WINDOW then
		state.comboHit = 0
	end
	state.comboHit      = (state.comboHit % CONFIG.MELEE_COMBO_HITS) + 1
	state.lastMeleeTime = now

	local weaponDef  = WeaponData and WeaponData.GetWeapon(weaponId)
	local baseDamage = weaponDef and weaponDef.damage or 10
	local hitMult    = CONFIG.MELEE_DAMAGE_MULT[state.comboHit] or 1.0
	local damage     = math.floor(baseDamage * hitMult)
	local isThirdHit = state.comboHit == CONFIG.MELEE_COMBO_HITS

	local character = player.Character
	local rootPart  = character and character:FindFirstChild("HumanoidRootPart")
	local range     = (weaponDef and weaponDef.range or 8) * 1.3

	local enemyState = targetId and enemyStates[targetId]
	if enemyState and enemyState.isAlive then
		-- Distance validation (anti-cheat)
		if rootPart and EnemyFactory and EnemyFactory.GetEnemyPosition then
			local ePos = EnemyFactory.GetEnemyPosition(targetId)
			if ePos and (rootPart.Position - ePos).Magnitude > range then return end
		end
		damageEnemy(player, enemyState, damage, isThirdHit)
		if isThirdHit then
			fireAllClients("EnemyKnockback", { enemyId = targetId, force = CONFIG.MELEE_KNOCKBACK_FORCE })
		end
	else
		-- Sweep nearest enemy within range
		if rootPart and EnemyFactory and EnemyFactory.GetEnemiesInRadius then
			local nearby = EnemyFactory.GetEnemiesInRadius(rootPart.Position, range)
			if nearby then
				for _, eid in ipairs(nearby) do
					local es = enemyStates[eid]
					if es and es.isAlive then
						damageEnemy(player, es, damage, isThirdHit)
						if isThirdHit then
							fireAllClients("EnemyKnockback", { enemyId = eid, force = CONFIG.MELEE_KNOCKBACK_FORCE })
						end
						break
					end
				end
			end
		end
	end

	fireClient(player, "HapticPulse", { intensity = isThirdHit and 1.0 or 0.5 })
end

function CombatSystem.OnRangedFire(player, data)
	local state = playerStates[player]
	if not state or not state.isAlive then return end
	if isRateLimited(state) then return end
	if type(data) ~= "table" then return end

	local weaponId  = type(data.weaponId) == "string" and data.weaponId or state.rangedWeaponId
	local weaponDef = WeaponData and WeaponData.GetWeapon(weaponId)
	if not weaponDef then return end

	if state.magazineAmmo <= 0 then
		-- Auto-initiate reload so the player is never left stuck
		CombatSystem.OnReload(player, { weaponId = weaponId })
		return
	end
	state.magazineAmmo = state.magazineAmmo - 1

	local dirX = type(data.directionX) == "number" and data.directionX or 0
	local dirY = type(data.directionY) == "number" and data.directionY or 0
	local dirZ = type(data.directionZ) == "number" and data.directionZ or 1

	local character = player.Character
	local rootPart  = character and character:FindFirstChild("HumanoidRootPart")
	local hitEnemy  = nil

	if rootPart and weaponDef.aimAssist and EnemyFactory then
		local origin  = rootPart.Position
		local dir     = Vector3.new(dirX, dirY, dirZ).Unit
		local bestDot = math.cos(math.rad(CONFIG.AIM_ASSIST_ANGLE))
		local nearby  = EnemyFactory.GetEnemiesInRadius
			and EnemyFactory.GetEnemiesInRadius(origin, CONFIG.AIM_ASSIST_RANGE)

		if nearby then
			for _, eid in ipairs(nearby) do
				local es = enemyStates[eid]
				if es and es.isAlive and EnemyFactory.GetEnemyPosition then
					local ePos = EnemyFactory.GetEnemyPosition(eid)
					if ePos then
						local toEnemy = (ePos - origin).Unit
						local dot = dir:Dot(toEnemy)
						if dot >= bestDot then
							bestDot  = dot
							hitEnemy = es
						end
					end
				end
			end
		end
	end

	if hitEnemy then
		damageEnemy(player, hitEnemy, weaponDef.damage, false)
	else
		fireClient(player, "ShotMissed", { weaponId = weaponId })
	end

	fireClient(player, "RangedFired", {
		weaponId = weaponId,
		ammoLeft = state.magazineAmmo,
		hit      = hitEnemy ~= nil,
	})
end

function CombatSystem.OnReload(player, data)
	local state = playerStates[player]
	if not state or not state.isAlive or state.reloading then return end

	local weaponId  = type(data) == "table" and data.weaponId or state.rangedWeaponId
	local weaponDef = WeaponData and WeaponData.GetWeapon(weaponId)
	if not weaponDef then return end

	local reloadTime = weaponDef.reloadTime or 1.5
	state.reloading     = true
	state.reloadEndTime = tick() + reloadTime

	fireClient(player, "ReloadStart", { weaponId = weaponId, duration = reloadTime })

	task.delay(reloadTime, function()
		if playerStates[player] then
			state.reloading    = false
			state.magazineAmmo = weaponDef.magazineSize or CONFIG.DEFAULT_MAGAZINE_SIZE
			fireClient(player, "ReloadComplete", { weaponId = weaponId, ammo = state.magazineAmmo })
		end
	end)
end

function CombatSystem.OnDodge(player, _data)
	local state = playerStates[player]
	if not state or not state.isAlive then return end

	local now = tick()
	if now < state.dodgeCooldownEnd then
		fireClient(player, "DodgeCooldown", { remaining = state.dodgeCooldownEnd - now })
		return
	end

	state.isDodging        = true
	state.dodgeEndTime     = now + CONFIG.DODGE_IFRAME_DURATION
	state.dodgeCooldownEnd = now + CONFIG.DODGE_COOLDOWN

	fireClient(player, "DodgeStart", { iframeDuration = CONFIG.DODGE_IFRAME_DURATION })

	-- Boss parry check: if any boss is telegraphing, this dodge is a parry
	for _, es in pairs(enemyStates) do
		if es.isBoss and es.isTelegraphing and now < es.telegraphEndTime then
			es.isStuned         = true
			es.stunEndTime      = now + CONFIG.PARRY_STUN_DURATION
			es.isTelegraphing   = false
			fireAllClients("BossParried", {
				bossId       = es.id,
				stunDuration = CONFIG.PARRY_STUN_DURATION,
			})
			break
		end
	end

	task.delay(CONFIG.DODGE_IFRAME_DURATION, function()
		if playerStates[player] then
			state.isDodging = false
			fireClient(player, "DodgeEnd", {})
		end
	end)
end

function CombatSystem.OnUseAbility(player, data)
	local state = playerStates[player]
	if not state or not state.isAlive then return end

	local now = tick()
	if now < state.abilityCooldownEnd then
		fireClient(player, "AbilityCooldown", { remaining = state.abilityCooldownEnd - now })
		return
	end

	local weaponId  = state.equippedType == "Ranged" and state.rangedWeaponId or state.meleeWeaponId
	local weaponDef = WeaponData and WeaponData.GetWeapon(weaponId)
	if not weaponDef or not weaponDef.ability then return end

	local targetId    = type(data) == "table" and data.targetEnemyId
	local targetState = targetId and enemyStates[targetId]

	if not targetState then
		local character = player.Character
		local rootPart  = character and character:FindFirstChild("HumanoidRootPart")
		if rootPart and EnemyFactory and EnemyFactory.GetEnemiesInRadius then
			local nearby = EnemyFactory.GetEnemiesInRadius(rootPart.Position, CONFIG.ABILITY_TARGET_SEARCH_RADIUS)
			if nearby then
				for _, eid in ipairs(nearby) do
					if enemyStates[eid] and enemyStates[eid].isAlive then
						targetState = enemyStates[eid]
						break
					end
				end
			end
		end
	end

	if not targetState then return end

	local extraDmg = applyWeaponAbility(state, targetState, weaponDef)
	if extraDmg > 0 then damageEnemy(player, targetState, extraDmg, false) end

	fireClient(player, "AbilityUsed", {
		weaponId = weaponId,
		ability  = weaponDef.ability,
		cooldown = state.abilityCooldownEnd - now,
	})
end

function CombatSystem.OnEquipWeapon(player, data)
	local state = playerStates[player]
	if not state or type(data) ~= "table" then return end

	local weaponId  = type(data.weaponId) == "string" and data.weaponId
	if not weaponId then return end

	local weaponDef = WeaponData and WeaponData.GetWeapon(weaponId)
	if not weaponDef then return end

	if weaponDef.weaponType == "Melee" then
		state.meleeWeaponId = weaponId
		state.equippedType  = "Melee"
		state.comboHit      = 0
	elseif weaponDef.weaponType == "Ranged" then
		state.rangedWeaponId = weaponId
		state.equippedType   = "Ranged"
		state.magazineAmmo   = weaponDef.magazineSize or 12
		state.reloading      = false
	elseif weaponDef.weaponType == "Throwable" then
		state.equippedType = "Throwable"
	end

	fireClient(player, "WeaponEquipped", {
		weaponId   = weaponId,
		weaponType = weaponDef.weaponType,
	})
end

------------------------------------------------------------------------
-- ENEMY REGISTRATION (called by EnemyFactory when spawning)
------------------------------------------------------------------------

function CombatSystem.RegisterEnemy(enemyId, enemyDef, dayNumber, isBoss)
	local es = newEnemyState(enemyId, enemyDef, dayNumber)
	es.isBoss = isBoss or false
	if isBoss and enemyDef then
		es.enrageTime = tick() + (enemyDef.enrageTimer or 120)
	end
	enemyStates[enemyId] = es
	return es
end

function CombatSystem.GetEnemyState(enemyId)
	return enemyStates[enemyId]
end

function CombatSystem.UnregisterEnemy(enemyId)
	enemyStates[enemyId] = nil
end

------------------------------------------------------------------------
-- BOSS TELEGRAPH
------------------------------------------------------------------------

function CombatSystem.StartBossTelegraph(bossId, attackPattern, telegraphTime)
	local es = enemyStates[bossId]
	if not es or not es.isBoss then return end

	local duration = telegraphTime or 1.5
	es.isTelegraphing   = true
	es.telegraphEndTime = tick() + duration

	fireAllClients("BossTelegraph", {
		bossId      = bossId,
		attackName  = attackPattern and attackPattern.name or "Attack",
		duration    = duration,
		isParryable = attackPattern and attackPattern.parryable or false,
	})

	task.delay(duration, function()
		local bes = enemyStates[bossId]
		if not bes or not bes.isAlive or bes.isStuned then return end
		bes.isTelegraphing = false

		if attackPattern then
			for _, p in ipairs(Players:GetPlayers()) do
				local pChar = p.Character
				local pRoot = pChar and pChar:FindFirstChild("HumanoidRootPart")
				if pRoot then
					local def     = bes.def
					local bossDmg = def and def.baseDamage or 20
					if attackPattern.type == "AoE" then
						local bPos = EnemyFactory and EnemyFactory.GetEnemyPosition
							and EnemyFactory.GetEnemyPosition(bossId)
						if bPos and (pRoot.Position - bPos).Magnitude <= (attackPattern.radius or 12) then
							damagePlayer(p, bossDmg, bossId)
						end
					else
						damagePlayer(p, bossDmg, bossId)
					end
				end
			end
		end
	end)
end

------------------------------------------------------------------------
-- SERVER TICK (status effects, boss enrage, heal aura)
------------------------------------------------------------------------

local _lastAITick = 0

function CombatSystem.Tick(_dt)
	local now = tick()
	if now - _lastAITick < CONFIG.AI_TICK_RATE then return end
	_lastAITick = now

	for enemyId, es in pairs(enemyStates) do
		if es.isAlive then
			-- Bleed DoT
			if es.isBleeding then
				if now >= es.bleedEndTime then
					es.isBleeding = false
				else
					local bleedDmg = es.bleedDmgPerSec * CONFIG.AI_TICK_RATE
					es.hp = es.hp - bleedDmg
					fireAllClients("EnemyHit", { enemyId = enemyId, damage = math.floor(bleedDmg), isCrit = false })
					if es.hp <= 0 then CombatSystem._defeatEnemy(nil, es) end
				end
			end

			-- Clear expired statuses
			if es.isConfused  and now >= es.confusedEndTime  then es.isConfused  = false end
			if es.isCharmed   and now >= es.charmedEndTime   then es.isCharmed   = false end
			if es.isStaggered and now >= es.staggerEndTime   then es.isStaggered = false end
			if es.isStuned    and now >= es.stunEndTime      then es.isStuned    = false end

			-- Boss enrage
			if es.isBoss and not es.isEnraged and now >= es.enrageTime then
				es.isEnraged = true
				local def = es.def
				if def then
					fireAllClients("BossEnraged", {
						bossId = enemyId,
						newDmg = math.floor((def.baseDamage or 20) * (def.enrageDmgMult or 1.5)),
					})
				end
			end
		end
	end

	-- RizzMerchant heal aura
	for _, es in pairs(enemyStates) do
		if es.isAlive and es.def and es.def.specialAbility == "HealAura" then
			if EnemyFactory and EnemyFactory.GetEnemyPosition then
				local healerPos = EnemyFactory.GetEnemyPosition(es.id)
				if healerPos then
					local radius  = es.def.healAuraRadius or 10
					local healAmt = (es.def.healAuraRate or 3) * CONFIG.AI_TICK_RATE
					for _, other in pairs(enemyStates) do
						if other.isAlive and other ~= es then
							local oPos = EnemyFactory.GetEnemyPosition(other.id)
							if oPos and (healerPos - oPos).Magnitude <= radius then
								other.hp = math.min(other.maxHp, other.hp + healAmt)
							end
						end
					end
				end
			end
		end
	end
end

------------------------------------------------------------------------
-- REMOTE EVENT SETUP (EventBus + ClientDispatch)
------------------------------------------------------------------------

local function setupRemotes()
	local remotes = ReplicatedStorage:FindFirstChild("Remotes")
	if not remotes then
		remotes        = Instance.new("Folder")
		remotes.Name   = "Remotes"
		remotes.Parent = ReplicatedStorage
	end

	local eventBus = remotes:FindFirstChild("EventBus")
	if not eventBus then
		eventBus        = Instance.new("RemoteEvent")
		eventBus.Name   = "EventBus"
		eventBus.Parent = remotes
	end

	local clientDispatch = remotes:FindFirstChild("ClientDispatch")
	if not clientDispatch then
		clientDispatch        = Instance.new("RemoteEvent")
		clientDispatch.Name   = "ClientDispatch"
		clientDispatch.Parent = remotes
	end
	_clientDispatch = clientDispatch

	eventBus.OnServerEvent:Connect(function(player, action, data)
		if type(action) ~= "string" then return end

		if SecurityLayer and type(SecurityLayer.CheckRateLimit) == "function" then
			if not SecurityLayer.CheckRateLimit(player, "CombatAction") then return end
		end

		if     action == "MeleeAttack"  then CombatSystem.OnMeleeAttack(player, data)
		elseif action == "RangedFire"   then CombatSystem.OnRangedFire(player, data)
		elseif action == "Reload"       then CombatSystem.OnReload(player, data)
		elseif action == "Dodge"        then CombatSystem.OnDodge(player, data)
		elseif action == "UseAbility"   then CombatSystem.OnUseAbility(player, data)
		elseif action == "EquipWeapon"  then CombatSystem.OnEquipWeapon(player, data)
		end
	end)

	print("[CombatSystem] EventBus + ClientDispatch configured")
end

------------------------------------------------------------------------
-- INIT
------------------------------------------------------------------------

function CombatSystem.Init()
	local function tryRequire(name)
		local m = ServerStorage:FindFirstChild(name)
		if not m then return nil end
		local ok, result = pcall(require, m)
		return ok and result or nil
	end

	ServerGateway        = tryRequire("ServerGateway")
	WeaponData           = tryRequire("WeaponData")
	EnemyData            = tryRequire("EnemyData")
	EnemyFactory         = tryRequire("EnemyFactory")
	EconomyManager       = tryRequire("EconomyManager")
	CombatRewardsManager = tryRequire("CombatRewardsManager")
	SecurityLayer        = tryRequire("SecurityLayer")

	Players.PlayerAdded:Connect(function(player)
		playerStates[player] = newPlayerState(player)
		local startLoadout   = WeaponData and WeaponData.StarterLoadout
		if startLoadout and WeaponData then
			local rDef = WeaponData.GetWeapon(startLoadout.ranged or "ranged_slingshot")
			playerStates[player].magazineAmmo = rDef and rDef.magazineSize or 1
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		playerStates[player] = nil
	end)

	for _, player in ipairs(Players:GetPlayers()) do
		if not playerStates[player] then
			playerStates[player] = newPlayerState(player)
		end
	end

	setupRemotes()

	print("[CombatSystem] v2.0 ready. Tap to attack.")
	return true
end

------------------------------------------------------------------------
-- PUBLIC API
------------------------------------------------------------------------

function CombatSystem.GetConfig()            return CONFIG end
function CombatSystem.GetPlayerState(player) return playerStates[player] end

function CombatSystem.IsPlayerAlive(player)
	local s = playerStates[player]
	return s and s.isAlive or false
end

function CombatSystem.OnWaveStart(_dayNumber, _waveNumber)
	for _, state in pairs(playerStates) do
		state.comboHit      = 0
		state.lastMeleeTime = 0
	end
end

function CombatSystem.OnWaveClear(dayNumber, waveNumber)
	if CombatRewardsManager then
		pcall(CombatRewardsManager.OnWaveClear, dayNumber, waveNumber)
	end
end

function CombatSystem.DamagePlayer(player, amount, source)
	damagePlayer(player, amount, source)
end

function CombatSystem.DamageEnemy(enemyId, amount, sourcePlayer)
	local es = enemyStates[enemyId]
	if es then damageEnemy(sourcePlayer, es, amount, false) end
end

return CombatSystem
