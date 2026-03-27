--[[
    UnifiedServer.lua — Single Entry Point Server Script
    Skibidi Zombie: Survive the Brainrots

    RESOLVES: The Two-Server Problem (GameMain + MainServer_v2 collision)
    This is THE one server script.

    GOAL: MAKE MONEY. English is the game mechanic.
    Boot order: UnifiedServer → ServerGateway → all server modules

    Architecture: Script (ServerScriptService) — THE entry point
    Version: 1.0.2
    Date: 2026-03-27
    Patch: HTML entity sanitize (Studio-safe)
--]]

local ServerScriptService = game:GetService("ServerScriptService")
local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

--------------------------------------------------------------------------------
-- BOOT SEQUENCE
--------------------------------------------------------------------------------

local BOOT_ORDER = {
    -- Phase 1: Core infrastructure
    { name = "ServerGateway",     path = "ServerGateway",     required = true  },
    { name = "SecurityLayer",     path = "SecurityLayer",     required = true  },
    { name = "DataStoreV2",       path = "DataStoreV2",       required = true  },
    { name = "AnalyticsService",  path = "AnalyticsService",  required = false },
    -- Phase 2: Game systems
    { name = "QuestionBankV2",    path = "QuestionBankV2",    required = true  },
    { name = "EnemyFactory",      path = "EnemyFactory",      required = true  },
    { name = "CombatSystem",      path = "CombatSystem",      required = true  },
    { name = "WaveManager",       path = "WaveManager",       required = true  },
    -- Phase 3: Economy & progression (non-blocking)
    { name = "EconomyManager",    path = "EconomyManager",    required = false },
    { name = "MonetizationServer",path = "MonetizationServer",required = false },
    { name = "DailyRewards",      path = "DailyRewards",      required = false },
    { name = "BattlePass",        path = "BattlePass",        required = false },
    { name = "GachaManager",      path = "GachaManager",      required = false },
    -- Phase 4: Social & meta (non-blocking)
    { name = "LeaderboardManager",path = "LeaderboardManager",required = false },
    { name = "GuildManager",      path = "GuildManager",      required = false },
    { name = "ReferralSystem",    path = "ReferralSystem",    required = false },
    { name = "TradeManager",      path = "TradeManager",      required = false },
    { name = "ChallengeManager",  path = "ChallengeManager",  required = false },
    -- Phase 5: Advanced (non-blocking)
    { name = "PrestigeManager",   path = "PrestigeManager",   required = false },
    { name = "WorldBoss",         path = "WorldBoss",         required = false },
    { name = "AnomalyDetector",   path = "AnomalyDetector",   required = false },
    { name = "FTUEManager",       path = "FTUEManager",       required = false },
}

local Modules = {}
local BootLog = {}
local bootStart = tick()

local function log(level, msg)
    local ts = string.format("%.2f", tick() - bootStart)
    print(string.format("[UnifiedServer][%ss][%s] %s", ts, level, msg))
end

local function loadModule(entry)
    local name = entry.name
    local moduleScript = ServerStorage:FindFirstChild(entry.path)
        or ServerScriptService:FindFirstChild(entry.path)
        or ServerStorage:FindFirstChild(entry.path, true)

    if not moduleScript then
        if entry.required then
            log("FATAL", name .. " — MODULE NOT FOUND (REQUIRED)")
            return false
        else
            log("WARN", name .. " — not found (optional, skipping)")
            return true
        end
    end

    local ok, result = pcall(require, moduleScript)
    if not ok then
        if entry.required then
            log("FATAL", name .. " — REQUIRE FAILED: " .. tostring(result))
            return false
        else
            log("WARN", name .. " — require failed: " .. tostring(result))
            return true
        end
    end

    Modules[name] = result

    if type(result) == "table" and type(result.Init) == "function" then
        local initOk, initErr = pcall(result.Init)
        if not initOk then
            if entry.required then
                log("FATAL", name .. " — INIT FAILED: " .. tostring(initErr))
                return false
            else
                log("WARN", name .. " — init failed: " .. tostring(initErr))
                return true
            end
        end
    end

    log("OK", name .. " — loaded")
    table.insert(BootLog, { name = name, status = "OK", time = tick() - bootStart })
    return true
end

--------------------------------------------------------------------------------
-- PLAYER LIFECYCLE
--------------------------------------------------------------------------------

local function onPlayerAdded(player)
    log("INFO", "Player joined: " .. player.Name)

    if Modules.DataStoreV2 then
        Modules.DataStoreV2.LoadPlayer(player)
    end

    if Modules.AnalyticsService then
        Modules.AnalyticsService.StartSession(player)
    end

    if Modules.FTUEManager then
        local data = Modules.DataStoreV2 and Modules.DataStoreV2.GetPlayerData(player)
        if data and not data.ftueComplete then
            Modules.FTUEManager.StartFTUE(player)
        end
    end

    if Modules.DailyRewards then
        Modules.DailyRewards.CheckIn(player)
    end
end

local function onPlayerRemoving(player)
    log("INFO", "Player leaving: " .. player.Name)

    if Modules.AnalyticsService then
        Modules.AnalyticsService.EndSession(player)
    end

    if Modules.DataStoreV2 then
        local ok, err = pcall(function() Modules.DataStoreV2.SavePlayer(player) end)
        if not ok then
            warn("[UnifiedServer] CRITICAL: Save failed " .. player.Name .. ": " .. tostring(err))
        end
    end
end

--------------------------------------------------------------------------------
-- REMOTE EVENTS
--------------------------------------------------------------------------------

local function setupRemoteEvents()
    local remotes = ReplicatedStorage:FindFirstChild("Remotes")
    if not remotes then
        remotes = Instance.new("Folder")
        remotes.Name = "Remotes"
        remotes.Parent = ReplicatedStorage
    end

    local events = {
        "RequestQuestion", "SubmitAnswer", "ActivatePowerUp",
        "QuestionDelivered", "AnswerResult", "PlayerDied", "PlayerRespawned",
        "WaveUpdate", "EnemySpawned", "EnemyDied", "ComboUpdate",
        "PowerUpReady", "PowerUpActivated", "TierChanged",
        "CurrencyUpdate", "TeachingMilestone",
    }

    for _, eventName in ipairs(events) do
        if not remotes:FindFirstChild(eventName) then
            local re = Instance.new("RemoteEvent")
            re.Name = eventName
            re.Parent = remotes
        end
    end

    -- Wire handlers
    local rq = remotes:FindFirstChild("RequestQuestion")
    if rq and Modules.CombatSystem and Modules.SecurityLayer then
        rq.OnServerEvent:Connect(function(player, enemyId)
            if not Modules.SecurityLayer.CheckRateLimit(player, "RequestQuestion") then return end
            local enemy = Modules.EnemyFactory and Modules.EnemyFactory.GetEnemy(enemyId)
            local qData = Modules.CombatSystem.ServeQuestion(player, enemy)
            if qData then remotes.QuestionDelivered:FireClient(player, qData) end
        end)
    end

    local sa = remotes:FindFirstChild("SubmitAnswer")
    if sa and Modules.CombatSystem and Modules.SecurityLayer then
        sa.OnServerEvent:Connect(function(player, answerId)
            if not Modules.SecurityLayer.CheckRateLimit(player, "SubmitAnswer") then return end
            if type(answerId) ~= "string" then return end
            local result = Modules.CombatSystem.ProcessAnswer(player, answerId)
            if result then
                remotes.AnswerResult:FireClient(player, result)
                if result.correct and result.enemyKilled then
                    remotes.EnemyDied:FireAllClients({ killer = player.Name })
                end
                if result.correct and result.combo and result.combo >= 3 then
                    remotes.ComboUpdate:FireAllClients({ player = player.Name, combo = result.combo })
                end
            end
        end)
    end

    local ap = remotes:FindFirstChild("ActivatePowerUp")
    if ap and Modules.CombatSystem and Modules.SecurityLayer then
        ap.OnServerEvent:Connect(function(player)
            if not Modules.SecurityLayer.CheckRateLimit(player, "ActivatePowerUp") then return end
            local activated = Modules.CombatSystem.ActivatePowerUp(player)
            if activated then
                remotes.PowerUpActivated:FireClient(player, { duration = Modules.CombatSystem.GetConfig().POWER_UP_DURATION })
            end
        end)
    end

    log("OK", "Remote events: " .. #events .. " configured")
end

--------------------------------------------------------------------------------
-- HEARTBEAT
--------------------------------------------------------------------------------

local TICK_INTERVAL = 0.5
local lastTick = 0

local function onHeartbeat(dt)
    local now = tick()
    if now - lastTick < TICK_INTERVAL then return end
    lastTick = now
    if Modules.WaveManager then Modules.WaveManager.Tick(dt) end
    if Modules.EnemyFactory then Modules.EnemyFactory.Tick(dt) end
    if Modules.AnomalyDetector then Modules.AnomalyDetector.Tick(dt) end
end

--------------------------------------------------------------------------------
-- MAIN BOOT
--------------------------------------------------------------------------------

log("BOOT", "=== SKIBIDI ZOMBIE: SURVIVE THE BRAINROTS ===")
log("BOOT", "=== GOAL: MAKE MONEY ===")
log("BOOT", "Starting boot sequence...")

local bootFailed = false
for i, entry in ipairs(BOOT_ORDER) do
    log("BOOT", string.format("[%d/%d] %s...", i, #BOOT_ORDER, entry.name))
    if not loadModule(entry) then
        bootFailed = true
        log("FATAL", "Boot aborted at " .. entry.name)
        break
    end
end

if bootFailed then
    log("FATAL", "=== SERVER BOOT FAILED ===")
    return
end

setupRemoteEvents()
Players.PlayerAdded:Connect(onPlayerAdded)
Players.PlayerRemoving:Connect(onPlayerRemoving)
for _, player in ipairs(Players:GetPlayers()) do
    task.spawn(onPlayerAdded, player)
end
RunService.Heartbeat:Connect(onHeartbeat)

game:BindToClose(function()
    if Modules.AnalyticsService then
        Modules.AnalyticsService.Shutdown()
    end
end)

local bootTime = tick() - bootStart
local moduleCount = 0
for _ in pairs(Modules) do moduleCount = moduleCount + 1 end
log("BOOT", string.format("=== BOOT COMPLETE — %d modules in %.2fs ===", moduleCount, bootTime))

return Modules
