--[[
═══════════════════════════════════════════════════════════
SURVIVE A BRAINROT — DAILY REWARDS + STREAK PRESTIGE
Script: DailyRewards.lua
Type: Server Module (ServerScriptService)
Purpose: 7-Day Login Calendar with Streak Prestige Tiers
Version: 1.0
Date: March 26, 2026
Pipeline: Stage 2 of 20 — Train 6-7 Launch Pipeline
Gospel 444 Compliant — NO BLUE
Phoenix Rising Gaming Division
═══════════════════════════════════════════════════════════
DESIGN:
  D1 Retention is #2 Roblox algorithm signal.
  7-day escalating reward calendar with streak prestige.
  If player misses a day, streak resets but total login days persist.
  Prestige tiers at 7, 14, 30, 60, 100 consecutive days.
  Visual: spinning reward display with Gospel 444 palette.
═══════════════════════════════════════════════════════════
]]

local DailyRewards = {}

-- SERVICES
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- ══════════════════════════════════════════════════════════
-- CONFIGURATION
-- ══════════════════════════════════════════════════════════
DailyRewards.Config = {
    -- Reward calendar (7-day cycle, repeats)
    Calendar = {
        [1] = { Coins = 100, XP = 50,  Item = nil,            Label = "Welcome Back!" },
        [2] = { Coins = 200, XP = 75,  Item = nil,            Label = "Day 2 Bonus" },
        [3] = { Coins = 500, XP = 100, Item = "EpicCrate",    Label = "🎁 EPIC CRATE" },
        [4] = { Coins = 300, XP = 100, Item = nil,            Label = "Keep Going!" },
        [5] = { Coins = 400, XP = 125, Item = nil,            Label = "Almost There!" },
        [6] = { Coins = 750, XP = 150, Item = nil,            Label = "Day 6 Mega" },
        [7] = { Coins = 1000, XP = 250, Item = "LegendaryCrate", Label = "🏆 LEGENDARY!" },
    },

    -- Streak prestige tiers (consecutive days)
    PrestigeTiers = {
        { Days = 7,   Title = "Survivor",      Multiplier = 1.1,  Badge = "⭐" },
        { Days = 14,  Title = "Veteran",        Multiplier = 1.2,  Badge = "⭐⭐" },
        { Days = 30,  Title = "Iron Will",      Multiplier = 1.35, Badge = "🔥" },
        { Days = 60,  Title = "Unbreakable",    Multiplier = 1.5,  Badge = "💎" },
        { Days = 100, Title = "Brainrot Immune", Multiplier = 2.0,  Badge = "👑" },
    },

    -- Timing
    ResetHourUTC = 0, -- midnight UTC for daily reset
    GracePeriodHours = 2, -- 2 hours grace before streak breaks

    -- Gospel 444 Colors (NO BLUE)
    Colors = {
        Purple = Color3.fromRGB(168, 85, 247),
        Gold = Color3.fromRGB(245, 158, 11),
        Dark = Color3.fromRGB(15, 15, 26),
    },
}

-- ══════════════════════════════════════════════════════════
-- DATA STORE
-- ══════════════════════════════════════════════════════════
local dailyStore = nil

local function getStore()
    if dailyStore then return dailyStore end
    local ok, store = pcall(function()
        return DataStoreService:GetDataStore("DailyRewards_v1")
    end)
    if ok then dailyStore = store end
    return dailyStore
end

local function getPlayerKey(player)
    return "daily_" .. tostring(player.UserId)
end

--- Default player reward data
local function defaultData()
    return {
        lastClaimDay = 0,       -- day number in UTC
        currentStreak = 0,      -- consecutive days
        totalLogins = 0,        -- lifetime logins
        calendarDay = 0,        -- position in 7-day cycle (1-7)
        highestStreak = 0,      -- personal best streak
        prestigeTier = 0,       -- current prestige level index
    }
end

--- Load player reward data
function DailyRewards.loadData(player)
    local store = getStore()
    if not store then return defaultData() end

    local ok, data = pcall(function()
        return store:GetAsync(getPlayerKey(player))
    end)

    if ok and data then
        return data
    end
    return defaultData()
end

--- Save player reward data
function DailyRewards.saveData(player, data)
    local store = getStore()
    if not store then return false end

    local ok = pcall(function()
        store:SetAsync(getPlayerKey(player), data)
    end)
    return ok
end

-- ══════════════════════════════════════════════════════════
-- CORE LOGIC
-- ══════════════════════════════════════════════════════════

--- Get current UTC day number (days since epoch)
local function getCurrentDayUTC()
    return math.floor(os.time() / 86400)
end

--- Check if player can claim today's reward
function DailyRewards.canClaim(player)
    local data = DailyRewards.loadData(player)
    local today = getCurrentDayUTC()
    return data.lastClaimDay < today
end

--- Get current prestige tier for a streak
function DailyRewards.getPrestigeTier(streak)
    local tier = nil
    for i, t in ipairs(DailyRewards.Config.PrestigeTiers) do
        if streak >= t.Days then
            tier = { index = i, data = t }
        end
    end
    return tier
end

--- Claim daily reward
--- Returns: { success, rewards, streakInfo, prestigeUp }
function DailyRewards.claim(player)
    local data = DailyRewards.loadData(player)
    local today = getCurrentDayUTC()

    -- Already claimed today
    if data.lastClaimDay >= today then
        return {
            success = false,
            reason = "Already claimed today",
        }
    end

    -- Check streak continuity
    local daysSinceLast = today - data.lastClaimDay
    local graceHours = DailyRewards.Config.GracePeriodHours
    local graceDays = math.ceil(graceHours / 24)

    if daysSinceLast <= (1 + graceDays) and data.lastClaimDay > 0 then
        -- Streak continues
        data.currentStreak = data.currentStreak + 1
    else
        -- Streak broken (or first login)
        data.currentStreak = 1
    end

    -- Advance calendar (1-7 cycle)
    data.calendarDay = ((data.calendarDay) % 7) + 1
    data.totalLogins = data.totalLogins + 1
    data.lastClaimDay = today

    -- Track highest streak
    if data.currentStreak > data.highestStreak then
        data.highestStreak = data.currentStreak
    end

    -- Get rewards for today's calendar position
    local calendarReward = DailyRewards.Config.Calendar[data.calendarDay]
    if not calendarReward then
        calendarReward = DailyRewards.Config.Calendar[1] -- fallback
    end

    -- Check prestige tier change
    local oldTier = data.prestigeTier
    local newTierInfo = DailyRewards.getPrestigeTier(data.currentStreak)
    local prestigeUp = false

    if newTierInfo and newTierInfo.index > oldTier then
        data.prestigeTier = newTierInfo.index
        prestigeUp = true
    end

    -- Apply prestige multiplier to rewards
    local multiplier = 1.0
    if newTierInfo then
        multiplier = newTierInfo.data.Multiplier
    end

    local finalReward = {
        Coins = math.floor(calendarReward.Coins * multiplier),
        XP = math.floor(calendarReward.XP * multiplier),
        Item = calendarReward.Item,
        Label = calendarReward.Label,
    }

    -- Save data
    DailyRewards.saveData(player, data)

    -- Apply rewards to player
    DailyRewards.applyRewards(player, finalReward)

    return {
        success = true,
        rewards = finalReward,
        calendarDay = data.calendarDay,
        streak = data.currentStreak,
        highestStreak = data.highestStreak,
        totalLogins = data.totalLogins,
        multiplier = multiplier,
        prestigeUp = prestigeUp,
        prestigeTier = newTierInfo and newTierInfo.data or nil,
    }
end

--- Apply rewards to player (coins, XP, items)
function DailyRewards.applyRewards(player, rewards)
    -- Coins + XP via leaderstats (placeholder until EconomyManager ships)
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local coins = leaderstats:FindFirstChild("Coins")
        if coins then
            coins.Value = coins.Value + (rewards.Coins or 0)
        end
        local xp = leaderstats:FindFirstChild("XP")
        if xp then
            xp.Value = xp.Value + (rewards.XP or 0)
        end
    end

    -- Item delivery (placeholder — integrate with inventory system)
    if rewards.Item then
        -- TODO: Stage 9 (Gacha) will handle item delivery
        print("[DailyRewards] Item granted to " .. player.Name .. ": " .. rewards.Item)
    end
end

-- ══════════════════════════════════════════════════════════
-- AUTO-CLAIM ON JOIN
-- ══════════════════════════════════════════════════════════

--- Called when player joins — check and offer daily reward
function DailyRewards.onPlayerJoin(player)
    -- Small delay to let character load
    task.wait(3)

    if not DailyRewards.canClaim(player) then
        return -- already claimed today
    end

    local result = DailyRewards.claim(player)

    if result.success then
        -- Send reward notification to client
        local remote = getRemote("ShowNotification")
        if remote then
            local msg = string.format(
                "🎁 DAY %d REWARD! +%d Coins +%d XP%s",
                result.calendarDay,
                result.rewards.Coins,
                result.rewards.XP,
                result.rewards.Item and (" + " .. result.rewards.Item) or ""
            )
            remote:FireClient(player, msg)
        end

        -- Streak notification
        if result.streak > 1 then
            task.wait(2)
            local streakRemote = getRemote("ShowNotification")
            if streakRemote then
                local streakMsg = string.format(
                    "🔥 %d-DAY STREAK! (x%.1f multiplier)",
                    result.streak, result.multiplier
                )
                streakRemote:FireClient(player, streakMsg)
            end
        end

        -- Prestige tier up notification
        if result.prestigeUp and result.prestigeTier then
            task.wait(2)
            local prestigeRemote = getRemote("ShowNotification")
            if prestigeRemote then
                local pMsg = string.format(
                    "%s PRESTIGE UNLOCKED: %s! (x%.1f rewards)",
                    result.prestigeTier.Badge,
                    result.prestigeTier.Title,
                    result.prestigeTier.Multiplier
                )
                prestigeRemote:FireClient(player, pMsg)
            end
        end

        print(string.format(
            "[DailyRewards] %s claimed Day %d (streak: %d, tier: %s, total: %d)",
            player.Name,
            result.calendarDay,
            result.streak,
            result.prestigeTier and result.prestigeTier.Title or "None",
            result.totalLogins
        ))
    end
end

-- Remote helper
local function getRemote(name)
    local folder = ReplicatedStorage:FindFirstChild("GameRemotes")
    if folder then return folder:FindFirstChild(name) end
    return nil
end

-- ══════════════════════════════════════════════════════════
-- INIT
-- ══════════════════════════════════════════════════════════
print("══════════════════════════════════════════════")
print("🎁 DailyRewards v1.0 — 7-Day Calendar + Streak Prestige")
print("D1 Retention Engine | Gospel 444 Compliant | NO BLUE")
print("Pipeline: Stage 2 of 20")
print("══════════════════════════════════════════════")

return DailyRewards
