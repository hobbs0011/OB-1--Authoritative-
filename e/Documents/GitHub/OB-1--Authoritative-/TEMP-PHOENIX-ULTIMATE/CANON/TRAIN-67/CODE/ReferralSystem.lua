--[[
    ReferralSystem.lua — Train 6-7: Survival English
    Stage 14: Friend Invite & Referral Rewards
    
    DESIGN LAW:
    - Both players get rewards (referrer + invitee)
    - Anti-abuse: one referral per invitee, rate-limited per referrer
    - Server-authoritative validation
    - Viral loop: every player = recruiter
    - Tiered rewards: more referrals = better rewards
    - Gospel 444: English challenge bonus for referred players
    
    ARCHITECTURE:
    - DataStore persistence for referral records
    - TeleportData for tracking invite source
    - Idempotent reward grants (no double-dipping)
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TeleportService = game:GetService("TeleportService")

local ReferralStore = DataStoreService:GetDataStore("ReferralSystem_v1")

local ReferralSystem = {}
ReferralSystem.__index = ReferralSystem

-- ============================================================
-- CONFIGURATION
-- ============================================================

local CONFIG = {
    MAX_REFERRALS_PER_DAY = 20,         -- anti-abuse cap
    MIN_PLAYTIME_TO_QUALIFY = 300,       -- invitee must play 5 min before reward
    REFERRAL_CODE_PREFIX = "REF",
    
    -- Referrer milestone rewards (cumulative)
    MILESTONES = {
        { count = 1,   reward = { coins = 500,  gems = 10 } },
        { count = 5,   reward = { coins = 2500, gems = 50 } },
        { count = 10,  reward = { coins = 5000, gems = 100, exclusiveItem = "referral_aura_bronze" } },
        { count = 25,  reward = { coins = 10000, gems = 250, exclusiveItem = "referral_aura_silver" } },
        { count = 50,  reward = { coins = 25000, gems = 500, exclusiveItem = "referral_aura_gold" } },
        { count = 100, reward = { coins = 50000, gems = 1000, exclusiveItem = "referral_pet_legendary" } },
    },
    
    -- Per-referral rewards
    REFERRER_PER_INVITE = { coins = 200, gems = 5 },
    INVITEE_WELCOME_BONUS = { coins = 500, gems = 10, crate = "BasicCrate" },
}

-- ============================================================
-- STATE
-- ============================================================

local playerReferralData = {} -- [userId] = { referralCode, referredBy, referrals = {}, ... }
local pendingInvitees = {}    -- [userId] = { referrerId, joinTime }

-- ============================================================
-- REFERRAL CODE GENERATION
-- ============================================================

local function generateReferralCode(userId)
    return CONFIG.REFERRAL_CODE_PREFIX .. tostring(userId)
end

local function getUserIdFromCode(code)
    if not code or type(code) ~= "string" then return nil end
    local prefix = CONFIG.REFERRAL_CODE_PREFIX
    if string.sub(code, 1, #prefix) ~= prefix then return nil end
    return tonumber(string.sub(code, #prefix + 1))
end

-- ============================================================
-- DATA PERSISTENCE
-- ============================================================

local function loadReferralData(userId)
    if playerReferralData[userId] then
        return playerReferralData[userId]
    end
    
    local success, data = pcall(function()
        return ReferralStore:GetAsync("referral_" .. tostring(userId))
    end)
    
    if success and data then
        playerReferralData[userId] = data
    else
        playerReferralData[userId] = {
            referralCode = generateReferralCode(userId),
            referredBy = nil,
            referralCount = 0,
            referrals = {},            -- [inviteeId] = { timestamp, qualified }
            milestonesAwarded = {},     -- [milestoneCount] = true
            dailyReferrals = {},        -- [dateKey] = count
            totalCoinsEarned = 0,
            totalGemsEarned = 0,
        }
    end
    
    return playerReferralData[userId]
end

local function saveReferralData(userId)
    local data = playerReferralData[userId]
    if not data then return end
    
    pcall(function()
        ReferralStore:SetAsync("referral_" .. tostring(userId), data)
    end)
end

-- ============================================================
-- REFERRAL PROCESSING
-- ============================================================

local function getDailyKey()
    local d = os.date("!*t", os.time())
    return string.format("%04d%02d%02d", d.year, d.month, d.day)
end

function ReferralSystem.ProcessJoin(player, referralCode)
    local inviteeId = player.UserId
    local referrerId = getUserIdFromCode(referralCode)
    
    if not referrerId then return end
    if referrerId == inviteeId then return end -- Can't refer yourself
    
    local inviteeData = loadReferralData(inviteeId)
    
    -- Already referred by someone
    if inviteeData.referredBy then return end
    
    -- Mark as referred
    inviteeData.referredBy = referrerId
    
    -- Track as pending until playtime qualifies
    pendingInvitees[inviteeId] = {
        referrerId = referrerId,
        joinTime = os.time(),
    }
    
    print(string.format("[Referral] Player %d joined via referral from %d", inviteeId, referrerId))
    
    task.spawn(function()
        saveReferralData(inviteeId)
    end)
end

function ReferralSystem.QualifyInvitee(player)
    local inviteeId = player.UserId
    local pending = pendingInvitees[inviteeId]
    
    if not pending then return end
    
    local playtime = os.time() - pending.joinTime
    if playtime < CONFIG.MIN_PLAYTIME_TO_QUALIFY then return end
    
    -- Invitee qualified! Grant rewards to both parties
    local referrerId = pending.referrerId
    local referrerData = loadReferralData(referrerId)
    
    -- Daily cap check
    local dayKey = getDailyKey()
    local dailyCount = referrerData.dailyReferrals[dayKey] or 0
    if dailyCount >= CONFIG.MAX_REFERRALS_PER_DAY then
        print(string.format("[Referral] Referrer %d hit daily cap", referrerId))
        return
    end
    
    -- Record the referral
    referrerData.referralCount = (referrerData.referralCount or 0) + 1
    referrerData.referrals[tostring(inviteeId)] = {
        timestamp = os.time(),
        qualified = true,
    }
    referrerData.dailyReferrals[dayKey] = dailyCount + 1
    
    -- Grant per-invite reward to referrer
    local referrerPlayer = Players:GetPlayerByUserId(referrerId)
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    
    if referrerPlayer and EconomyManager then
        local r = CONFIG.REFERRER_PER_INVITE
        if r.coins and r.coins > 0 then
            EconomyManager.AddBalance(referrerPlayer, "SurvivalCoins", r.coins, "referral_reward")
            referrerData.totalCoinsEarned = (referrerData.totalCoinsEarned or 0) + r.coins
        end
        if r.gems and r.gems > 0 then
            EconomyManager.AddBalance(referrerPlayer, "BrainrotGems", r.gems, "referral_reward")
            referrerData.totalGemsEarned = (referrerData.totalGemsEarned or 0) + r.gems
        end
    end
    
    -- Check milestones
    ReferralSystem._CheckMilestones(referrerId)
    
    -- Grant welcome bonus to invitee
    if EconomyManager then
        local w = CONFIG.INVITEE_WELCOME_BONUS
        if w.coins and w.coins > 0 then
            EconomyManager.AddBalance(player, "SurvivalCoins", w.coins, "referral_welcome")
        end
        if w.gems and w.gems > 0 then
            EconomyManager.AddBalance(player, "BrainrotGems", w.gems, "referral_welcome")
        end
        -- Grant bonus crate
        if w.crate then
            local GachaManager = require(script.Parent:FindFirstChild("GachaManager"))
            if GachaManager then
                GachaManager.Pull(player, w.crate)
            end
        end
    end
    
    -- Clear pending
    pendingInvitees[inviteeId] = nil
    
    print(string.format("[Referral] QUALIFIED: Invitee %d, Referrer %d (total: %d)",
        inviteeId, referrerId, referrerData.referralCount))
    
    task.spawn(function()
        saveReferralData(referrerId)
        saveReferralData(inviteeId)
    end)
end

function ReferralSystem._CheckMilestones(userId)
    local data = loadReferralData(userId)
    local player = Players:GetPlayerByUserId(userId)
    local EconomyManager = require(script.Parent:FindFirstChild("EconomyManager"))
    
    for _, milestone in ipairs(CONFIG.MILESTONES) do
        if data.referralCount >= milestone.count and not data.milestonesAwarded[tostring(milestone.count)] then
            data.milestonesAwarded[tostring(milestone.count)] = true
            
            if player and EconomyManager then
                local r = milestone.reward
                if r.coins then
                    EconomyManager.AddBalance(player, "SurvivalCoins", r.coins, "referral_milestone_" .. milestone.count)
                end
                if r.gems then
                    EconomyManager.AddBalance(player, "BrainrotGems", r.gems, "referral_milestone_" .. milestone.count)
                end
            end
            
            print(string.format("[Referral] MILESTONE: Player %d reached %d referrals!", userId, milestone.count))
        end
    end
end

-- ============================================================
-- PLAYTIME QUALIFICATION LOOP
-- ============================================================

task.spawn(function()
    while true do
        task.wait(30) -- Check every 30 seconds
        for inviteeId, pending in pairs(pendingInvitees) do
            local player = Players:GetPlayerByUserId(inviteeId)
            if player then
                ReferralSystem.QualifyInvitee(player)
            else
                -- Player left before qualifying
                pendingInvitees[inviteeId] = nil
            end
        end
    end
end)

-- ============================================================
-- CLIENT API
-- ============================================================

function ReferralSystem.GetMyCode(player)
    local data = loadReferralData(player.UserId)
    return data.referralCode
end

function ReferralSystem.GetMyStats(player)
    local data = loadReferralData(player.UserId)
    
    local nextMilestone = nil
    for _, milestone in ipairs(CONFIG.MILESTONES) do
        if data.referralCount < milestone.count then
            nextMilestone = milestone
            break
        end
    end
    
    return {
        referralCode = data.referralCode,
        referredBy = data.referredBy,
        totalReferrals = data.referralCount,
        totalCoinsEarned = data.totalCoinsEarned or 0,
        totalGemsEarned = data.totalGemsEarned or 0,
        nextMilestone = nextMilestone and {
            count = nextMilestone.count,
            remaining = nextMilestone.count - data.referralCount,
            reward = nextMilestone.reward,
        } or nil,
    }
end

function ReferralSystem.GetMilestones()
    return CONFIG.MILESTONES
end

-- ============================================================
-- PLAYER JOIN HOOK
-- ============================================================

Players.PlayerAdded:Connect(function(player)
    -- Check for referral code in join data
    local joinData = nil
    pcall(function()
        joinData = player:GetJoinData()
    end)
    
    if joinData and joinData.LaunchData then
        local code = tostring(joinData.LaunchData)
        ReferralSystem.ProcessJoin(player, code)
    end
end)

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerReferralData[userId] then
        saveReferralData(userId)
        playerReferralData[userId] = nil
    end
    pendingInvitees[userId] = nil
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local ReferralRemote = Instance.new("RemoteFunction")
ReferralRemote.Name = "ReferralRemote"
ReferralRemote.Parent = ReplicatedStorage

ReferralRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetMyCode" then
        return ReferralSystem.GetMyCode(player)
    elseif action == "GetMyStats" then
        return ReferralSystem.GetMyStats(player)
    elseif action == "GetMilestones" then
        return ReferralSystem.GetMilestones()
    end
    return { success = false, error = "INVALID_ACTION" }
end

return ReferralSystem
