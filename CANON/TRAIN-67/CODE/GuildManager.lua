--[[
    GuildManager.lua — Train 6-7: Survival English
    Stage 17: Guild / Squad System
    
    DESIGN LAW:
    - Social obligation = strongest retention hook
    - Shared challenges (guild quests)
    - Guild leaderboard (inter-guild competition)
    - Guild rewards (shared loot for contribution)
    - Max 30 members per guild
    - Guild levels with perks
    - Gospel 444: Guild English challenges = bonus rewards
    
    ARCHITECTURE:
    - Server-authoritative guild management
    - DataStore persistence for guild data
    - Role hierarchy: Leader > Officer > Member
    - Anti-grief: cooldowns on join/leave, kick protection
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GuildStore = DataStoreService:GetDataStore("GuildSystem_v1")
local GuildMemberStore = DataStoreService:GetDataStore("GuildMembers_v1")

local GuildManager = {}
GuildManager.__index = GuildManager

-- ============================================================
-- CONFIGURATION
-- ============================================================

local CONFIG = {
    MAX_MEMBERS = 30,
    CREATE_COST = { currency = "SurvivalCoins", amount = 5000 },
    NAME_MIN_LENGTH = 3,
    NAME_MAX_LENGTH = 20,
    JOIN_COOLDOWN = 3600,          -- 1 hour after leaving before joining another
    KICK_PROTECTION_HOURS = 24,    -- Can't be kicked within 24h of joining
    MAX_OFFICERS = 5,
    GUILD_XP_PER_MEMBER_KILL = 5,
    GUILD_XP_PER_MEMBER_ENGLISH = 10, -- Gospel 444 bonus
    
    -- Guild level thresholds
    LEVEL_THRESHOLDS = {
        [1] = 0,
        [2] = 1000,
        [3] = 3000,
        [4] = 7000,
        [5] = 15000,
        [6] = 30000,
        [7] = 50000,
        [8] = 80000,
        [9] = 120000,
        [10] = 200000,
    },
    
    -- Guild level perks
    LEVEL_PERKS = {
        [1] = { maxMembers = 10, description = "Basic guild" },
        [2] = { maxMembers = 15, description = "+5 member slots" },
        [3] = { maxMembers = 15, coinBonus = 0.05, description = "+5% coin bonus for members" },
        [4] = { maxMembers = 20, coinBonus = 0.05, description = "+5 member slots" },
        [5] = { maxMembers = 20, coinBonus = 0.10, guildCrate = true, description = "Guild crate unlocked" },
        [6] = { maxMembers = 25, coinBonus = 0.10, description = "+5 member slots" },
        [7] = { maxMembers = 25, coinBonus = 0.15, guildAura = true, description = "Guild aura unlocked" },
        [8] = { maxMembers = 30, coinBonus = 0.15, description = "Max member slots" },
        [9] = { maxMembers = 30, coinBonus = 0.20, description = "+20% coin bonus" },
        [10] = { maxMembers = 30, coinBonus = 0.25, guildPet = true, description = "Legendary guild pet" },
    },
}

local ROLES = { LEADER = "LEADER", OFFICER = "OFFICER", MEMBER = "MEMBER" }

-- ============================================================
-- GUILD QUEST DEFINITIONS
-- ============================================================

local GUILD_QUESTS = {
    { id = "guild_kills_100",    type = "kills",   target = 100,  name = "Guild Hunt",        reward = { guildXP = 500, memberCoins = 200 } },
    { id = "guild_kills_500",    type = "kills",   target = 500,  name = "Guild Massacre",    reward = { guildXP = 2000, memberCoins = 500, memberGems = 5 } },
    { id = "guild_survive_60",   type = "survive", target = 3600, name = "Guild Endurance",   reward = { guildXP = 1000, memberCoins = 300 } },
    { id = "guild_english_50",   type = "english", target = 50,   name = "Guild Scholars",    reward = { guildXP = 1500, memberCoins = 400, memberGems = 10 } },
    { id = "guild_english_200",  type = "english", target = 200,  name = "Guild Wordsmiths",  reward = { guildXP = 5000, memberCoins = 1000, memberGems = 25 } },
    { id = "guild_trades_10",    type = "trades",  target = 10,   name = "Guild Merchants",   reward = { guildXP = 800, memberCoins = 250 } },
    { id = "guild_coins_50000",  type = "coins",   target = 50000,name = "Guild Fortune",     reward = { guildXP = 3000, memberGems = 15 } },
}

-- ============================================================
-- STATE
-- ============================================================

local guildsCache = {}          -- [guildId] = guildData
local playerGuildMap = {}       -- [userId] = guildId
local playerCooldowns = {}      -- [userId] = leaveTimestamp

-- ============================================================
-- GUILD DATA
-- ============================================================

local function loadGuild(guildId)
    if guildsCache[guildId] then
        return guildsCache[guildId]
    end
    
    local success, data = pcall(function()
        return GuildStore:GetAsync("guild_" .. guildId)
    end)
    
    if success and data then
        guildsCache[guildId] = data
        return data
    end
    return nil
end

local function saveGuild(guildId)
    local data = guildsCache[guildId]
    if not data then return end
    
    pcall(function()
        GuildStore:SetAsync("guild_" .. guildId, data)
    end)
end

local function loadPlayerGuild(userId)
    if playerGuildMap[userId] then
        return playerGuildMap[userId]
    end
    
    local success, guildId = pcall(function()
        return GuildMemberStore:GetAsync("member_" .. tostring(userId))
    end)
    
    if success and guildId then
        playerGuildMap[userId] = guildId
        return guildId
    end
    return nil
end

-- ============================================================
-- GUILD OPERATIONS
-- ============================================================

local guildCounter = 0

function GuildManager.CreateGuild(player, guildName)
    local userId = player.UserId
    
    -- Validation
    if loadPlayerGuild(userId) then
        return { success = false, error = "ALREADY_IN_GUILD" }
    end
    
    if #guildName < CONFIG.NAME_MIN_LENGTH or #guildName > CONFIG.NAME_MAX_LENGTH then
        return { success = false, error = "INVALID_NAME_LENGTH" }
    end
    
    -- Check cost
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    if EconomyManager then
        local balance = EconomyManager.GetBalance(player, CONFIG.CREATE_COST.currency)
        if balance < CONFIG.CREATE_COST.amount then
            return { success = false, error = "INSUFFICIENT_FUNDS" }
        end
        EconomyManager.Deduct(player, CONFIG.CREATE_COST.currency, CONFIG.CREATE_COST.amount, "guild_create")
    end
    
    guildCounter = guildCounter + 1
    local guildId = "G" .. os.time() .. "_" .. guildCounter
    
    local guild = {
        id = guildId,
        name = guildName,
        leaderId = userId,
        createdAt = os.time(),
        level = 1,
        xp = 0,
        members = {
            [tostring(userId)] = {
                role = ROLES.LEADER,
                joinedAt = os.time(),
                contribution = 0,
            },
        },
        memberCount = 1,
        activeQuest = nil,
        questProgress = 0,
        questsCompleted = 0,
        totalKills = 0,
        totalEnglishWords = 0,
    }
    
    guildsCache[guildId] = guild
    playerGuildMap[userId] = guildId
    
    task.spawn(function()
        saveGuild(guildId)
        pcall(function()
            GuildMemberStore:SetAsync("member_" .. tostring(userId), guildId)
        end)
    end)
    
    return { success = true, guildId = guildId }
end

function GuildManager.JoinGuild(player, guildId)
    local userId = player.UserId
    
    if loadPlayerGuild(userId) then
        return { success = false, error = "ALREADY_IN_GUILD" }
    end
    
    -- Cooldown check
    local cooldown = playerCooldowns[userId]
    if cooldown and (os.time() - cooldown) < CONFIG.JOIN_COOLDOWN then
        return { success = false, error = "COOLDOWN", remaining = CONFIG.JOIN_COOLDOWN - (os.time() - cooldown) }
    end
    
    local guild = loadGuild(guildId)
    if not guild then
        return { success = false, error = "GUILD_NOT_FOUND" }
    end
    
    -- Check member cap based on guild level
    local perks = CONFIG.LEVEL_PERKS[guild.level] or CONFIG.LEVEL_PERKS[1]
    if guild.memberCount >= (perks.maxMembers or CONFIG.MAX_MEMBERS) then
        return { success = false, error = "GUILD_FULL" }
    end
    
    guild.members[tostring(userId)] = {
        role = ROLES.MEMBER,
        joinedAt = os.time(),
        contribution = 0,
    }
    guild.memberCount = guild.memberCount + 1
    playerGuildMap[userId] = guildId
    
    task.spawn(function()
        saveGuild(guildId)
        pcall(function()
            GuildMemberStore:SetAsync("member_" .. tostring(userId), guildId)
        end)
    end)
    
    return { success = true }
end

function GuildManager.LeaveGuild(player)
    local userId = player.UserId
    local guildId = loadPlayerGuild(userId)
    
    if not guildId then
        return { success = false, error = "NOT_IN_GUILD" }
    end
    
    local guild = loadGuild(guildId)
    if not guild then
        return { success = false, error = "GUILD_NOT_FOUND" }
    end
    
    -- Leader can't leave (must transfer or disband)
    if guild.leaderId == userId then
        return { success = false, error = "LEADER_CANNOT_LEAVE" }
    end
    
    guild.members[tostring(userId)] = nil
    guild.memberCount = math.max(0, guild.memberCount - 1)
    playerGuildMap[userId] = nil
    playerCooldowns[userId] = os.time()
    
    task.spawn(function()
        saveGuild(guildId)
        pcall(function()
            GuildMemberStore:RemoveAsync("member_" .. tostring(userId))
        end)
    end)
    
    return { success = true }
end

-- ============================================================
-- GUILD QUESTS
-- ============================================================

function GuildManager.StartQuest(player, questId)
    local userId = player.UserId
    local guildId = loadPlayerGuild(userId)
    if not guildId then return { success = false, error = "NOT_IN_GUILD" } end
    
    local guild = loadGuild(guildId)
    if not guild then return { success = false, error = "GUILD_NOT_FOUND" } end
    
    -- Only leader/officers can start quests
    local member = guild.members[tostring(userId)]
    if not member or (member.role ~= ROLES.LEADER and member.role ~= ROLES.OFFICER) then
        return { success = false, error = "INSUFFICIENT_ROLE" }
    end
    
    if guild.activeQuest then
        return { success = false, error = "QUEST_ALREADY_ACTIVE" }
    end
    
    -- Find quest
    local quest = nil
    for _, q in ipairs(GUILD_QUESTS) do
        if q.id == questId then
            quest = q
            break
        end
    end
    
    if not quest then
        return { success = false, error = "INVALID_QUEST" }
    end
    
    guild.activeQuest = quest
    guild.questProgress = 0
    
    task.spawn(function() saveGuild(guildId) end)
    
    return { success = true, quest = quest }
end

function GuildManager.ContributeToQuest(player, questType, amount)
    local userId = player.UserId
    local guildId = loadPlayerGuild(userId)
    if not guildId then return end
    
    local guild = loadGuild(guildId)
    if not guild or not guild.activeQuest then return end
    
    if guild.activeQuest.type ~= questType then return end
    
    guild.questProgress = guild.questProgress + amount
    
    -- Track individual contribution
    local member = guild.members[tostring(userId)]
    if member then
        member.contribution = (member.contribution or 0) + amount
    end
    
    -- Check completion
    if guild.questProgress >= guild.activeQuest.target then
        GuildManager._CompleteQuest(guild)
    end
    
    task.spawn(function() saveGuild(guildId) end)
end

function GuildManager._CompleteQuest(guild)
    local quest = guild.activeQuest
    if not quest then return end
    
    -- Grant guild XP
    guild.xp = (guild.xp or 0) + (quest.reward.guildXP or 0)
    guild.questsCompleted = (guild.questsCompleted or 0) + 1
    
    -- Check level up
    for level = 10, 1, -1 do
        if guild.xp >= (CONFIG.LEVEL_THRESHOLDS[level] or 0) then
            if level > guild.level then
                guild.level = level
                print(string.format("[Guild] %s leveled up to %d!", guild.name, level))
            end
            break
        end
    end
    
    -- Grant member rewards
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    for memberIdStr in pairs(guild.members) do
        local memberId = tonumber(memberIdStr)
        local memberPlayer = memberId and Players:GetPlayerByUserId(memberId)
        if memberPlayer and EconomyManager then
            if quest.reward.memberCoins then
                EconomyManager.AddBalance(memberPlayer, "SurvivalCoins", quest.reward.memberCoins, "guild_quest")
            end
            if quest.reward.memberGems then
                EconomyManager.AddBalance(memberPlayer, "BrainrotGems", quest.reward.memberGems, "guild_quest")
            end
        end
    end
    
    guild.activeQuest = nil
    guild.questProgress = 0
    
    print(string.format("[Guild] %s completed quest: %s", guild.name, quest.name))
end

-- ============================================================
-- CLIENT API
-- ============================================================

function GuildManager.GetGuildInfo(player)
    local guildId = loadPlayerGuild(player.UserId)
    if not guildId then
        return { inGuild = false }
    end
    
    local guild = loadGuild(guildId)
    if not guild then
        return { inGuild = false }
    end
    
    local perks = CONFIG.LEVEL_PERKS[guild.level] or CONFIG.LEVEL_PERKS[1]
    
    return {
        inGuild = true,
        id = guild.id,
        name = guild.name,
        level = guild.level,
        xp = guild.xp,
        nextLevelXP = CONFIG.LEVEL_THRESHOLDS[guild.level + 1],
        memberCount = guild.memberCount,
        maxMembers = perks.maxMembers,
        perks = perks,
        activeQuest = guild.activeQuest and {
            name = guild.activeQuest.name,
            progress = guild.questProgress,
            target = guild.activeQuest.target,
        } or nil,
        questsCompleted = guild.questsCompleted or 0,
        myRole = guild.members[tostring(player.UserId)] and guild.members[tostring(player.UserId)].role or nil,
    }
end

function GuildManager.GetAvailableQuests()
    return GUILD_QUESTS
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    playerGuildMap[player.UserId] = nil
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local GuildRemote = Instance.new("RemoteFunction")
GuildRemote.Name = "GuildRemote"
GuildRemote.Parent = ReplicatedStorage

GuildRemote.OnServerInvoke = function(player, action, ...)
    if action == "Create" then return GuildManager.CreateGuild(player, ...)
    elseif action == "Join" then return GuildManager.JoinGuild(player, ...)
    elseif action == "Leave" then return GuildManager.LeaveGuild(player)
    elseif action == "GetInfo" then return GuildManager.GetGuildInfo(player)
    elseif action == "StartQuest" then return GuildManager.StartQuest(player, ...)
    elseif action == "GetQuests" then return GuildManager.GetAvailableQuests()
    end
    return { success = false, error = "INVALID_ACTION" }
end

return GuildManager
