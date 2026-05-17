--[[
    LeaderboardManager.lua — Train 6-7: Survive the Brainrots
    Stage 13: Leaderboard System
    
    DESIGN LAW:
    - Server-authoritative score submission
    - Anti-cheat: scores validated before posting
    - Multiple board types (survival, kills, combos, rarest items)
    - Friend leaderboards (strongest engagement driver)
    - Reset cycles: daily, weekly, all-time
    - Combat mastery boards prominently featured
    
    ARCHITECTURE:
    - OrderedDataStore for sorted retrieval
    - Cache layer to reduce DataStore reads
    - Rate-limited updates (max 1 per 30s per board per player)
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local LeaderboardManager = {}
LeaderboardManager.__index = LeaderboardManager

-- ============================================================
-- BOARD DEFINITIONS
-- ============================================================

local BOARDS = {
    {
        id = "survival_time_daily",
        displayName = "🏆 Top Survivors (Today)",
        stat = "survivalTime",
        cycle = "daily",
        maxEntries = 100,
        unit = "seconds",
    },
    {
        id = "survival_time_weekly",
        displayName = "🏆 Top Survivors (Week)",
        stat = "survivalTime",
        cycle = "weekly",
        maxEntries = 100,
        unit = "seconds",
    },
    {
        id = "survival_time_alltime",
        displayName = "🏆 Top Survivors (All Time)",
        stat = "survivalTime",
        cycle = "alltime",
        maxEntries = 100,
        unit = "seconds",
    },
    {
        id = "kills_daily",
        displayName = "⚔ Top Slayers (Today)",
        stat = "kills",
        cycle = "daily",
        maxEntries = 100,
        unit = "count",
    },
    {
        id = "kills_weekly",
        displayName = "⚔ Top Slayers (Week)",
        stat = "kills",
        cycle = "weekly",
        maxEntries = 100,
        unit = "count",
    },
    {
        id = "combo_masters_daily",
        displayName = "🔥 Combo Masters (Today)",
        stat = "bestCombo",
        cycle = "daily",
        maxEntries = 100,
        unit = "count",
        featured = true,
    },
    {
        id = "combo_masters_alltime",
        displayName = "🔥 Combo Masters (All Time)",
        stat = "bestCombo",
        cycle = "alltime",
        maxEntries = 100,
        unit = "count",
        featured = true,
    },
    {
        id = "rarest_items",
        displayName = "💎 Rarest Collections",
        stat = "rarityScore",
        cycle = "alltime",
        maxEntries = 50,
        unit = "score",
    },
    {
        id = "coins_earned_weekly",
        displayName = "💰 Top Earners (Week)",
        stat = "coinsEarned",
        cycle = "weekly",
        maxEntries = 100,
        unit = "count",
    },
    {
        id = "boss_kills_weekly",
        displayName = "💀 Boss Hunters (Week)",
        stat = "bossKills",
        cycle = "weekly",
        maxEntries = 100,
        unit = "count",
    },
}

-- ============================================================
-- CONFIGURATION
-- ============================================================

local CONFIG = {
    UPDATE_COOLDOWN = 30,
    CACHE_TTL = 60,
    FRIEND_BOARD_CACHE_TTL = 30,
    MAX_SCORE_JUMP = 10000,
    SCORE_VALIDATION = true,
}

-- ============================================================
-- STATE
-- ============================================================

local boardCache = {}
local playerScores = {}
local lastUpdateTime = {}

-- ============================================================
-- DATE KEYS
-- ============================================================

local function getDailyKey()
    local d = os.date("!*t", os.time())
    return string.format("%04d%02d%02d", d.year, d.month, d.day)
end

local function getWeeklyKey()
    local d = os.date("!*t", os.time())
    local dayOfYear = os.date("!%j", os.time())
    local weekNum = math.ceil(tonumber(dayOfYear) / 7)
    return string.format("%04dW%02d", d.year, weekNum)
end

local function getBoardStoreKey(board)
    if board.cycle == "daily" then
        return board.id .. "_" .. getDailyKey()
    elseif board.cycle == "weekly" then
        return board.id .. "_" .. getWeeklyKey()
    else
        return board.id
    end
end

-- ============================================================
-- SCORE VALIDATION (Anti-Cheat)
-- ============================================================

local function validateScore(userId, stat, newScore, oldScore)
    if not CONFIG.SCORE_VALIDATION then return true end
    if newScore < 0 then
        warn(string.format("[Leaderboard] REJECTED negative score: P=%d stat=%s score=%d", userId, stat, newScore))
        return false
    end
    local jump = newScore - (oldScore or 0)
    if jump > CONFIG.MAX_SCORE_JUMP then
        warn(string.format("[Leaderboard] REJECTED suspicious jump: P=%d stat=%s jump=%d", userId, stat, jump))
        return false
    end
    return true
end

-- ============================================================
-- SCORE SUBMISSION
-- ============================================================

function LeaderboardManager.SubmitScore(player, stat, score)
    local userId = player.UserId
    if not playerScores[userId] then
        playerScores[userId] = {}
    end
    
    local oldScore = playerScores[userId][stat] or 0
    if not validateScore(userId, stat, score, oldScore) then
        return { success = false, error = "SCORE_REJECTED" }
    end
    
    playerScores[userId][stat] = math.max(oldScore, score)
    
    local updated = {}
    for _, board in ipairs(BOARDS) do
        if board.stat == stat then
            local cooldownKey = userId .. "_" .. board.id
            local now = os.time()
            local lastUpdate = lastUpdateTime[cooldownKey] or 0
            
            if (now - lastUpdate) >= CONFIG.UPDATE_COOLDOWN then
                local storeKey = getBoardStoreKey(board)
                task.spawn(function()
                    local success, err = pcall(function()
                        local store = DataStoreService:GetOrderedDataStore(storeKey)
                        store:SetAsync(tostring(userId), playerScores[userId][stat])
                    end)
                    if not success then
                        warn(string.format("[Leaderboard] Failed to update %s for P=%d: %s", board.id, userId, tostring(err)))
                    end
                end)
                lastUpdateTime[cooldownKey] = now
                table.insert(updated, board.id)
            end
        end
    end
    
    return { success = true, boardsUpdated = updated }
end

-- ============================================================
-- BOARD RETRIEVAL
-- ============================================================

function LeaderboardManager.GetBoard(boardId, pageSize)
    pageSize = pageSize or 50
    
    local cached = boardCache[boardId]
    if cached and (os.time() - cached.timestamp) < CONFIG.CACHE_TTL then
        return { success = true, data = cached.data, cached = true }
    end
    
    local boardConfig = nil
    for _, board in ipairs(BOARDS) do
        if board.id == boardId then
            boardConfig = board
            break
        end
    end
    
    if not boardConfig then
        return { success = false, error = "INVALID_BOARD" }
    end
    
    local storeKey = getBoardStoreKey(boardConfig)
    
    local success, result = pcall(function()
        local store = DataStoreService:GetOrderedDataStore(storeKey)
        local pages = store:GetSortedAsync(false, pageSize)
        local currentPage = pages:GetCurrentPage()
        local entries = {}
        for rank, entry in ipairs(currentPage) do
            table.insert(entries, {
                rank = rank,
                userId = tonumber(entry.key),
                score = entry.value,
            })
        end
        return entries
    end)
    
    if success then
        for _, entry in ipairs(result) do
            local nameSuccess, name = pcall(function()
                return Players:GetNameFromUserIdAsync(entry.userId)
            end)
            entry.displayName = nameSuccess and name or ("Player_" .. entry.userId)
        end
        
        boardCache[boardId] = {
            data = result,
            timestamp = os.time(),
        }
        
        return {
            success = true,
            boardId = boardId,
            displayName = boardConfig.displayName,
            featured = boardConfig.featured or false,
            unit = boardConfig.unit,
            data = result,
            cached = false,
        }
    else
        warn("[Leaderboard] Failed to get board:", boardId, result)
        return { success = false, error = "DATASTORE_ERROR" }
    end
end

-- ============================================================
-- FRIEND LEADERBOARD
-- ============================================================

function LeaderboardManager.GetFriendBoard(player, boardId)
    local boardConfig = nil
    for _, board in ipairs(BOARDS) do
        if board.id == boardId then
            boardConfig = board
            break
        end
    end
    
    if not boardConfig then
        return { success = false, error = "INVALID_BOARD" }
    end
    
    local friendSuccess, friends = pcall(function()
        return Players:GetFriendsAsync(player.UserId)
    end)
    
    if not friendSuccess then
        return { success = false, error = "FRIENDS_UNAVAILABLE" }
    end
    
    local friendIds = { player.UserId }
    local friendPages = friends
    while true do
        local page = friendPages:GetCurrentPage()
        for _, friend in ipairs(page) do
            table.insert(friendIds, friend.Id)
            if #friendIds >= 50 then break end
        end
        if friendPages.IsFinished or #friendIds >= 50 then break end
        friendPages:AdvanceToNextPageAsync()
    end
    
    local storeKey = getBoardStoreKey(boardConfig)
    local entries = {}
    
    local store = DataStoreService:GetOrderedDataStore(storeKey)
    for _, friendId in ipairs(friendIds) do
        local scoreSuccess, score = pcall(function()
            return store:GetAsync(tostring(friendId))
        end)
        if scoreSuccess and score then
            local nameSuccess, name = pcall(function()
                return Players:GetNameFromUserIdAsync(friendId)
            end)
            table.insert(entries, {
                userId = friendId,
                displayName = nameSuccess and name or ("Player_" .. friendId),
                score = score,
                isMe = (friendId == player.UserId),
            })
        end
    end
    
    table.sort(entries, function(a, b) return a.score > b.score end)
    for i, entry in ipairs(entries) do
        entry.rank = i
    end
    
    return {
        success = true,
        boardId = boardId,
        displayName = boardConfig.displayName .. " (Friends)",
        data = entries,
    }
end

-- ============================================================
-- AVAILABLE BOARDS LIST
-- ============================================================

function LeaderboardManager.GetAvailableBoards()
    local boards = {}
    for _, board in ipairs(BOARDS) do
        table.insert(boards, {
            id = board.id,
            displayName = board.displayName,
            stat = board.stat,
            cycle = board.cycle,
            unit = board.unit,
            featured = board.featured or false,
        })
    end
    return boards
end

-- ============================================================
-- PLAYER RANK LOOKUP
-- ============================================================

function LeaderboardManager.GetMyRank(player, boardId)
    local boardConfig = nil
    for _, board in ipairs(BOARDS) do
        if board.id == boardId then
            boardConfig = board
            break
        end
    end
    
    if not boardConfig then
        return { success = false, error = "INVALID_BOARD" }
    end
    
    local boardResult = LeaderboardManager.GetBoard(boardId, boardConfig.maxEntries)
    if not boardResult.success then
        return boardResult
    end
    
    for _, entry in ipairs(boardResult.data) do
        if entry.userId == player.UserId then
            return { success = true, rank = entry.rank, score = entry.score }
        end
    end
    
    return { success = true, rank = nil, score = playerScores[player.UserId] and playerScores[player.UserId][boardConfig.stat] or 0 }
end

-- ============================================================
-- INCREMENT HELPERS
-- ============================================================

function LeaderboardManager.IncrementStat(player, stat, amount)
    local userId = player.UserId
    if not playerScores[userId] then
        playerScores[userId] = {}
    end
    playerScores[userId][stat] = (playerScores[userId][stat] or 0) + (amount or 1)
    return LeaderboardManager.SubmitScore(player, stat, playerScores[userId][stat])
end

-- ============================================================
-- CLEANUP
-- ============================================================

Players.PlayerRemoving:Connect(function(player)
    local userId = player.UserId
    if playerScores[userId] then
        for stat, score in pairs(playerScores[userId]) do
            LeaderboardManager.SubmitScore(player, stat, score)
        end
        playerScores[userId] = nil
    end
    for key in pairs(lastUpdateTime) do
        if string.find(key, "^" .. tostring(userId)) then
            lastUpdateTime[key] = nil
        end
    end
end)

-- ============================================================
-- REMOTE SETUP
-- ============================================================

local LeaderboardRemote = Instance.new("RemoteFunction")
LeaderboardRemote.Name = "LeaderboardRemote"
LeaderboardRemote.Parent = ReplicatedStorage

LeaderboardRemote.OnServerInvoke = function(player, action, ...)
    if action == "GetBoard" then
        return LeaderboardManager.GetBoard(...)
    elseif action == "GetFriendBoard" then
        return LeaderboardManager.GetFriendBoard(player, ...)
    elseif action == "GetAvailableBoards" then
        return LeaderboardManager.GetAvailableBoards()
    elseif action == "GetMyRank" then
        return LeaderboardManager.GetMyRank(player, ...)
    end
    return { success = false, error = "INVALID_ACTION" }
end

return LeaderboardManager
