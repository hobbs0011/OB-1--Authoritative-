# GuildManager Integration Spec
## TRAIN-67 — Social & Guild System for OBI Roblox Experience

**Version:** 1.0.0  
**Status:** DRAFT  
**Author:** Agent-99 (OB1) — Run 56, Pulse-Incarnation Engine v5  
**Date:** 2026-03-27  
**Artifact Class:** 🔨 BUILD  
**Cross-repo sources:** CosmeticTrinityIntegrationSpec.md §15, EnglishRewardsManagerSpec.md §8/§4, MonetizationOrchestratorSpec.md §5/§10, AnalyticsTelemetryIntegrationSpec.md §3.2  
**Dependencies:** EnglishRewardsManager, CosmeticTrinitySystem, MonetizationOrchestrator, AnalyticsTelemetryService  

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Gospel 444 Alignment](#2-gospel-444-alignment)
3. [Architecture Overview](#3-architecture-overview)
4. [GuildManager Module API](#4-guildmanager-module-api)
5. [Guild Data Schema](#5-guild-data-schema)
6. [Guild Lifecycle](#6-guild-lifecycle)
7. [English-Powered Guild Mechanics](#7-english-powered-guild-mechanics)
8. [Guild Tiers & Progression](#8-guild-tiers--progression)
9. [Guild Challenges & Events](#9-guild-challenges--events)
10. [Social Features Integration](#10-social-features-integration)
11. [Leaderboard System](#11-leaderboard-system)
12. [Monetization Hooks](#12-monetization-hooks)
13. [Analytics & Telemetry](#13-analytics--telemetry)
14. [Anti-Abuse & Moderation](#14-anti-abuse--moderation)
15. [Integration Points](#15-integration-points)
16. [Roblox Platform Constraints](#16-roblox-platform-constraints)
17. [Implementation Roadmap](#17-implementation-roadmap)
18. [Testing Strategy](#18-testing-strategy)

---

## 1. Overview & Purpose

### 1.1 What Is GuildManager?

GuildManager is the **social backbone** of the OBI Roblox experience. It provides the infrastructure for player-created guilds (called "Crews" in player-facing UI) that turn solitary English learning into a **competitive, cooperative, social activity** where peer pressure, shared goals, and collective rewards drive retention and monetization.

### 1.2 Core Thesis

**English is the mechanic. Money is the mission.** (Living Reincarnation State, active principle)

Guilds exist to:
1. **Multiply engagement** — social accountability keeps players returning
2. **Create monetization surface** — guild cosmetics, boosts, and competitive features drive spending
3. **Amplify English practice** — guild challenges require English interaction, creating natural practice loops
4. **Generate SOCIAL_PROOF triggers** — guild activity feeds the MonetizationOrchestrator's contextual trigger system

### 1.3 Mouse → Tiger in Guilds

The teaching law applies at guild scale:
- **Mouse phase:** Join a crew, see others learning, feel safe to try
- **Cat phase:** Participate in guild challenges, start competing on leaderboards
- **Tiger phase:** Lead a guild, mentor new members, create English content for the guild

### 1.4 Player-Facing Terminology

| Internal Term | Player-Facing Term | Reason |
|---|---|---|
| Guild | Crew | Feels casual, Roblox-native, less MMO-intimidating |
| Guild Leader | Captain | Authority without hierarchy anxiety |
| Guild Officer | First Mate | Nautical theme, fun |
| Guild Member | Crew Member | Inclusive |
| Guild Hall | Crew HQ | Familiar |
| Guild Challenge | Crew Mission | Action-oriented |

---

## 2. Gospel 444 Alignment

### 2.1 Permission Over Perfection
- Joining a Crew has ZERO English requirements
- First guild challenge is trivially easy (tap to contribute a word)
- No public shaming for low English tier members
- Guild chat has optional auto-translate for Mouse-tier players

### 2.2 The Desire Loop (from CosmeticTrinityIntegrationSpec §15.3)
Guild features feed all three desire vectors:
1. **SEE** — Guild cosmetic showcase, crew banners in public spaces, leaderboard visibility
2. **WANT** — Exclusive guild-only cosmetics, limited crew mission rewards, guild tier badges
3. **ACT** — Join/create crew, participate in missions, climb guild leaderboard, purchase guild boosts

### 2.3 Gentle On-Ramp, Steep Ceiling
- Creating a guild: free, instant, no requirements
- Guild tier progression: requires collective English activity (the grind)
- Top guild tier: requires sustained high-level English practice across all members
- Guild cosmetic exclusives: some earnable, some purchasable, creating dual motivation paths

---

## 3. Architecture Overview

### 3.1 Module Hierarchy

```
GuildManager (ServerScriptService)
├── GuildService.lua          -- Core guild CRUD, membership, permissions
├── GuildProgressionService.lua -- Tier progression, XP accumulation
├── GuildChallengeService.lua  -- Challenge lifecycle, reward distribution
├── GuildLeaderboardService.lua -- Rankings, seasonal resets
├── GuildSocialService.lua     -- Chat, announcements, activity feed
├── GuildCosmeticService.lua   -- Guild-specific cosmetic integration
└── GuildAnalyticsService.lua  -- Telemetry wrapper
```

### 3.2 Client-Side

```
GuildManagerClient (StarterPlayerScripts)
├── GuildUI/
│   ├── CrewHUD.lua            -- Persistent crew info display
│   ├── CrewPanel.lua          -- Full crew management UI
│   ├── CrewBrowser.lua        -- Discovery/join UI
│   ├── CrewMissionBoard.lua   -- Active challenges display
│   └── CrewLeaderboard.lua    -- Rankings UI
├── GuildController.lua        -- Client-side state management
└── GuildRemotes.lua           -- RemoteEvent/RemoteFunction definitions
```

### 3.3 Data Layer

```
DataStore Usage:
├── GuildDataStore             -- Guild metadata, settings, tier
├── GuildMembershipStore       -- Player→Guild mapping (1:1)
├── GuildProgressionStore      -- XP, tier history, milestone tracking
├── GuildChallengeStore        -- Active/completed challenge state
└── GuildLeaderboardStore      -- Ordered rankings (uses OrderedDataStore)
```

### 3.4 Communication Pattern

```
Client → RemoteFunction → GuildService → DataStore
                                       → EnglishRewardsManager (XP bridge)
                                       → CosmeticTrinitySystem (cosmetic unlock)
                                       → MonetizationOrchestrator (purchase flow)
                                       → AnalyticsTelemetryService (events)
```

---

## 4. GuildManager Module API

### 4.1 GuildService

```lua
local GuildService = {}

-- Guild CRUD
function GuildService:CreateGuild(playerId: number, guildName: string, config: GuildConfig): GuildResult
function GuildService:DisbandGuild(playerId: number, guildId: string): Result
function GuildService:GetGuild(guildId: string): Guild?
function GuildService:UpdateGuildSettings(playerId: number, guildId: string, settings: GuildSettings): Result

-- Membership
function GuildService:JoinGuild(playerId: number, guildId: string): MembershipResult
function GuildService:LeaveGuild(playerId: number): Result
function GuildService:KickMember(requesterId: number, targetId: number, guildId: string): Result
function GuildService:PromoteMember(requesterId: number, targetId: number, role: GuildRole): Result
function GuildService:DemoteMember(requesterId: number, targetId: number, role: GuildRole): Result

-- Invitations
function GuildService:InvitePlayer(requesterId: number, targetId: number, guildId: string): Result
function GuildService:AcceptInvite(playerId: number, inviteId: string): MembershipResult
function GuildService:DeclineInvite(playerId: number, inviteId: string): Result

-- Discovery
function GuildService:SearchGuilds(query: string, filters: SearchFilters): GuildList
function GuildService:GetRecommendedGuilds(playerId: number): GuildList
function GuildService:GetGuildLeaderboard(category: string, page: number): LeaderboardPage

-- Player queries
function GuildService:GetPlayerGuild(playerId: number): Guild?
function GuildService:GetGuildMembers(guildId: string): MemberList
function GuildService:GetPlayerGuildHistory(playerId: number): GuildHistoryList
```

### 4.2 GuildProgressionService

```lua
local GuildProgressionService = {}

-- XP & Tier
function GuildProgressionService:AddGuildXP(guildId: string, amount: number, source: XPSource): Result
function GuildProgressionService:GetGuildTier(guildId: string): GuildTier
function GuildProgressionService:GetTierProgress(guildId: string): TierProgress
function GuildProgressionService:CheckTierUp(guildId: string): TierUpResult?

-- English integration (THE KEY BRIDGE)
function GuildProgressionService:OnMemberEnglishActivity(playerId: number, activity: EnglishActivity): void
function GuildProgressionService:GetGuildEnglishScore(guildId: string): EnglishScore
function GuildProgressionService:GetMemberContributions(guildId: string, period: TimePeriod): ContributionList
```

### 4.3 GuildChallengeService

```lua
local GuildChallengeService = {}

-- Challenge lifecycle
function GuildChallengeService:StartChallenge(guildId: string, challengeId: string): ChallengeResult
function GuildChallengeService:GetActiveChallenges(guildId: string): ChallengeList
function GuildChallengeService:ContributeToChallenge(playerId: number, challengeId: string, contribution: Contribution): Result
function GuildChallengeService:CompleteChallenge(guildId: string, challengeId: string): RewardResult
function GuildChallengeService:GetChallengeProgress(challengeId: string): ChallengeProgress

-- Guild vs Guild
function GuildChallengeService:StartGuildWar(challengerGuildId: string, targetGuildId: string, warType: WarType): WarResult
function GuildChallengeService:GetActiveWars(guildId: string): WarList
function GuildChallengeService:ResolveWar(warId: string): WarOutcome
```

---

## 5. Guild Data Schema

### 5.1 Guild Object

```lua
type Guild = {
    guildId: string,              -- UUID
    name: string,                 -- 3-24 chars, profanity filtered
    tag: string,                  -- 2-5 chars, shown in nameplate
    description: string,          -- 0-200 chars
    icon: string,                 -- Asset ID for guild icon
    banner: string,               -- Asset ID for guild banner
    createdAt: number,            -- Unix timestamp
    createdBy: number,            -- Player ID of founder
    
    -- Membership
    memberCount: number,          -- Current count
    maxMembers: number,           -- Tier-based cap (default 10, max 50)
    joinPolicy: "Open" | "Apply" | "InviteOnly",
    minEnglishTier: string?,      -- Optional: minimum tier to join (nil = no req)
    
    -- Progression
    tier: GuildTier,              -- Bronze → Silver → Gold → Diamond → Phoenix
    xp: number,                   -- Current XP toward next tier
    totalXpEarned: number,        -- Lifetime XP
    englishScore: number,         -- Aggregate English activity score
    
    -- Settings
    language: string,             -- Primary guild language (for matching)
    region: string?,              -- Optional region tag
    isRecruiting: boolean,        -- Show in browser
    motd: string,                 -- Message of the day (0-100 chars)
    
    -- Cosmetics
    unlockedCosmetics: {string},  -- Guild-earned cosmetic IDs
    activeTheme: string?,         -- Guild HQ theme
    
    -- State
    lastActiveAt: number,         -- Last member activity timestamp
    seasonPoints: number,         -- Current season ranking points
    warRecord: { wins: number, losses: number, draws: number },
}
```

### 5.2 GuildMember Object

```lua
type GuildMember = {
    playerId: number,
    guildId: string,
    role: GuildRole,              -- "Captain" | "FirstMate" | "Member"
    joinedAt: number,
    lastActiveAt: number,
    
    -- Contributions
    weeklyXpContribution: number,
    totalXpContribution: number,
    challengesCompleted: number,
    englishActivitiesThisWeek: number,
    
    -- Social
    isOnline: boolean,
    currentEnglishTier: string,   -- From EnglishRewardsManager
}
```

### 5.3 GuildTier Enum

```lua
type GuildTier = {
    name: string,
    level: number,
    maxMembers: number,
    xpRequired: number,
    perks: {string},
}

local GUILD_TIERS = {
    { name = "Bronze",   level = 1, maxMembers = 10, xpRequired = 0,      perks = {"basic_banner", "crew_chat"} },
    { name = "Silver",   level = 2, maxMembers = 20, xpRequired = 5000,   perks = {"custom_tag", "crew_emotes", "challenge_slots_2"} },
    { name = "Gold",     level = 3, maxMembers = 30, xpRequired = 25000,  perks = {"crew_hq_basic", "guild_wars", "challenge_slots_4"} },
    { name = "Diamond",  level = 4, maxMembers = 40, xpRequired = 100000, perks = {"crew_hq_premium", "leaderboard_badge", "challenge_slots_6"} },
    { name = "Phoenix",  level = 5, maxMembers = 50, xpRequired = 500000, perks = {"crew_hq_legendary", "phoenix_aura", "all_challenges", "exclusive_cosmetics"} },
}
```

---

## 6. Guild Lifecycle

### 6.1 Creation Flow

```
Player opens Crew Browser → "Create Crew" button
→ Enter name (profanity filter) + tag + icon selection
→ GuildService:CreateGuild()
  → Validate: player not in a guild, name unique, tag unique
  → Create Guild object in GuildDataStore
  → Create GuildMember with role = "Captain"
  → Fire analytics: GUILD_CREATED
  → Return guild info to client
→ CrewPanel opens with onboarding tips
```

**Constraints:**
- One guild per player (leave current to create new)
- Name: 3-24 characters, alphanumeric + spaces, profanity filtered
- Tag: 2-5 characters, alphanumeric, unique, shown in player nameplate
- Creation cost: FREE (Mouse → Tiger: zero friction on-ramp)
- Cooldown: 24h after leaving a guild before creating/joining another (anti-hop)

### 6.2 Join Flow

```
Player opens Crew Browser → Browse/Search → Select Crew
→ Based on joinPolicy:
  → "Open": instant join via GuildService:JoinGuild()
  → "Apply": submit application, Captain/FirstMate reviews
  → "InviteOnly": must receive invite first
→ On join:
  → Add to GuildMembershipStore
  → Update guild memberCount
  → Broadcast to guild: "Player joined!"
  → Fire analytics: GUILD_JOINED
  → Show welcome message with first crew mission
```

### 6.3 Guild Recommendations

```lua
function GuildService:GetRecommendedGuilds(playerId)
    local playerData = EnglishRewardsManager:GetPlayerProfile(playerId)
    local recommendations = {}
    
    -- Priority 1: Friends' guilds
    local friendGuilds = self:GetFriendsGuilds(playerId)
    
    -- Priority 2: Same English tier range
    local tierGuilds = self:GetGuildsByTierRange(playerData.englishTier, 1) -- ±1 tier
    
    -- Priority 3: Active guilds recruiting in player's region
    local regionalGuilds = self:GetRecruitingGuilds(playerData.region)
    
    -- Priority 4: Trending guilds (most XP earned this week)
    local trendingGuilds = self:GetTrendingGuilds(10)
    
    -- Merge, dedup, rank by composite score
    return self:RankRecommendations(friendGuilds, tierGuilds, regionalGuilds, trendingGuilds)
end
```

### 6.4 Dissolution

- Captain can disband (confirmation required, 48h grace period)
- Auto-disband after 30 days of zero member activity
- On disband: members notified, cosmetics remain earned, guild removed from leaderboards
- Guild name/tag released after 7 days

---

## 7. English-Powered Guild Mechanics

### 7.1 The Core Bridge: English Activity → Guild XP

This is **THE** critical integration. Every English learning action a guild member performs contributes to guild progression. English is the fuel; the guild is the engine.

```lua
-- Called by EnglishRewardsManager when any English activity completes
function GuildProgressionService:OnMemberEnglishActivity(playerId, activity)
    local guild = GuildService:GetPlayerGuild(playerId)
    if not guild then return end
    
    local guildXP = self:CalculateGuildXP(activity)
    self:AddGuildXP(guild.guildId, guildXP, {
        source = "MEMBER_ENGLISH",
        playerId = playerId,
        activityType = activity.type,
        englishTier = activity.playerTier,
    })
    
    -- Update member contribution tracking
    self:UpdateMemberContribution(playerId, guild.guildId, guildXP)
    
    -- Check for challenge contributions
    GuildChallengeService:CheckContribution(playerId, guild.guildId, activity)
    
    -- Fire SOCIAL_PROOF trigger if impressive
    if guildXP >= IMPRESSIVE_THRESHOLD then
        MonetizationOrchestrator:FireContextualTrigger("SOCIAL_PROOF", {
            type = "GUILD_ENGLISH_ACHIEVEMENT",
            playerId = playerId,
            guildId = guild.guildId,
            xpAmount = guildXP,
        })
    end
end
```

### 7.2 Guild XP Multipliers

| Activity | Base XP | Streak Bonus | Tier Multiplier | Guild Boost |
|---|---|---|---|---|
| Complete lesson | 10 | +2 per streak day | ×1.0 (Mouse) → ×3.0 (Tiger) | ×1.0 → ×2.0 (purchasable) |
| Pass quiz (≥80%) | 25 | +5 per streak day | Same scale | Same scale |
| Win English duel | 50 | N/A | Same scale | Same scale |
| Streak milestone (7d) | 100 | N/A | Same scale | Same scale |
| Streak milestone (30d) | 500 | N/A | Same scale | Same scale |
| Tier-up (personal) | 1000 | N/A | N/A | Same scale |
| Help another member | 15 | N/A | ×1.5 (mentor bonus) | Same scale |

### 7.3 English Tier Integration (from EnglishRewardsManager §8)

Guild features unlock progressively based on the guild's **aggregate English tier distribution**:

```lua
local ENGLISH_TIER_ORDER = {
    "Mouse-A", "Mouse-B",     -- Beginner
    "Cat-A", "Cat-B", "Cat-C", -- Intermediate  
    "Tiger",                    -- Advanced
}

-- Guild English Score = weighted sum of member tiers
function GuildProgressionService:GetGuildEnglishScore(guildId)
    local members = GuildService:GetGuildMembers(guildId)
    local score = 0
    for _, member in ipairs(members) do
        local tierWeight = TIER_WEIGHTS[member.currentEnglishTier] or 1
        local activeMultiplier = member.isActiveThisWeek and 1.5 or 1.0
        score += tierWeight * activeMultiplier
    end
    return score
end

local TIER_WEIGHTS = {
    ["Mouse-A"] = 1,
    ["Mouse-B"] = 2,
    ["Cat-A"]   = 4,
    ["Cat-B"]   = 6,
    ["Cat-C"]   = 8,
    ["Tiger"]   = 12,
}
```

### 7.4 Streak Integration (from EnglishRewardsManager §4)

Guild-level streak mechanics:
- **Crew Streak:** number of consecutive days where ≥50% of members completed at least 1 English activity
- **Streak XP bonus:** crew streak multiplier applied to all guild XP earned that day
- **Streak milestone rewards:** guild cosmetics at 7, 14, 30, 60, 90 day crew streaks
- **Streak freeze:** purchasable guild item (monetization hook) that preserves crew streak for 1 day

```lua
function GuildProgressionService:UpdateCrewStreak(guildId)
    local members = GuildService:GetGuildMembers(guildId)
    local activeToday = 0
    for _, member in ipairs(members) do
        if EnglishRewardsManager:HasActivityToday(member.playerId) then
            activeToday += 1
        end
    end
    
    local threshold = math.ceil(#members * 0.5)
    if activeToday >= threshold then
        self:IncrementCrewStreak(guildId)
    else
        -- Check for streak freeze
        if not self:HasStreakFreeze(guildId) then
            self:ResetCrewStreak(guildId)
            self:FireAnalytics("CREW_STREAK_BROKEN", guildId, { activeCount = activeToday, threshold = threshold })
        end
    end
end
```

---

## 8. Guild Tiers & Progression

### 8.1 Tier Benefits Matrix

| Tier | Max Members | Challenge Slots | Features Unlocked |
|---|---|---|---|
| Bronze | 10 | 1 | Basic banner, crew chat |
| Silver | 20 | 2 | Custom tag, crew emotes, basic HQ |
| Gold | 30 | 4 | Guild wars, premium HQ themes, crew showcase |
| Diamond | 40 | 6 | Leaderboard badge, exclusive emotes, crew tournaments |
| Phoenix | 50 | Unlimited | Legendary HQ, phoenix aura for all members, exclusive cosmetics, all challenges |

### 8.2 Tier-Down Protection

Guilds **never** lose their tier. XP can only go up. This prevents frustration when members leave or go inactive. However, **seasonal rankings** reset, creating recurring competitive pressure without permanent loss.

### 8.3 Prestige System

At Phoenix tier, guilds can "Prestige" (reset to Bronze with a permanent prestige badge):
- Prestige badges are **exclusive cosmetics** visible on all members
- Each prestige level unlocks a new color/style of badge
- Creates an infinite progression ceiling
- Generates monetization opportunity (prestige celebration packages)

---

## 9. Guild Challenges & Events

### 9.1 Challenge Types

#### Daily Crew Missions
- Auto-assigned each day at server reset
- Simple English-based objectives: "Guild completes 50 lessons today"
- Reward: Guild XP + small cosmetic currency
- Purpose: daily engagement driver, crew streak fuel

#### Weekly Crew Missions
- 3 available per week, guild selects based on challenge slots
- Moderate difficulty: "All members reach 80% quiz accuracy this week"
- Reward: Guild XP + rare cosmetic drop chance
- Purpose: medium-term goal setting, cooperative planning

#### Guild Wars (Gold tier+)
- Challenge another guild to a 48-hour English competition
- Categories: total lessons, quiz accuracy, streak maintenance, tier-ups
- Winner gets: XP bonus, war trophy (cosmetic), leaderboard points
- Loser gets: consolation XP (no punishment, Mouse→Tiger)
- Purpose: competitive engagement, social bonding, monetization (war boosts)

#### Seasonal Tournaments (Diamond tier+)
- Server-wide guild competitions each season (3 months)
- Bracket-style elimination based on weekly English metrics
- Prize pool: exclusive seasonal cosmetics, guild titles, leaderboard positions
- Purpose: aspirational endgame content, seasonal re-engagement

### 9.2 Challenge Contribution Tracking

```lua
type ChallengeContribution = {
    playerId: number,
    challengeId: string,
    contributionType: string,    -- "LESSON" | "QUIZ" | "STREAK" | "TIER_UP"
    amount: number,
    timestamp: number,
}

-- Contributions are atomic and immutable once recorded
-- Displayed on CrewMissionBoard with member attribution
-- Drives "who contributed most" mini-leaderboard within guild
```

---

## 10. Social Features Integration

### 10.1 From CosmeticTrinityIntegrationSpec §15

The existing social features spec defines several systems that GuildManager integrates with:

#### Inspect Player (§15.1)
- Guild badge visible on player inspection
- Guild name + tag + tier displayed
- "Join Crew" button if inspected player's guild is Open
- Guild cosmetics highlighted in inspection view

#### Cosmetic Feed (§15.2)
- Guild members' cosmetic acquisitions appear in guild activity feed
- Creates SOCIAL_PROOF triggers within the guild
- "Your crewmate just got [Rare Item]!" notifications

#### Showcase Room (§15.3)
- Guild HQ includes a shared showcase area
- Top contributors' cosmetics displayed
- Visiting other guild HQs is possible (discovery/aspiration)

#### Fashion Contests (§15.4)
- Guild-internal fashion contests
- Winner gets guild recognition + small reward
- Drives cosmetic engagement within guild context

#### Flex Emotes (§15.5)
- Guild-specific emotes unlocked at Silver tier
- Crew-only emotes create in-group identity
- Emote animations reference English tier (Tiger emote > Mouse emote)

### 10.2 Guild Activity Feed

```lua
type GuildActivityEntry = {
    entryId: string,
    guildId: string,
    type: "MEMBER_JOIN" | "MEMBER_LEAVE" | "TIER_UP" | "CHALLENGE_COMPLETE" 
        | "WAR_START" | "WAR_END" | "ENGLISH_MILESTONE" | "COSMETIC_UNLOCK"
        | "STREAK_MILESTONE" | "PRESTIGE",
    playerId: number?,           -- nil for guild-level events
    data: {[string]: any},
    timestamp: number,
}
```

### 10.3 Guild Chat

- Text-based chat in guild panel
- Optional auto-translate for Mouse-tier players (costs premium currency for non-subscribers)
- English-only mode toggle (guild setting) — encourages English practice
- Profanity filter + Roblox chat filter applied
- Message history: last 100 messages cached, older messages paginated from DataStore

---

## 11. Leaderboard System

### 11.1 Leaderboard Categories

| Category | Metric | Reset | Purpose |
|---|---|---|---|
| Total English XP | Sum of all guild XP from English activities | Never | Lifetime achievement |
| Weekly XP | Guild XP earned this week | Weekly (Monday) | Regular competition |
| Crew Streak | Consecutive crew streak days | On break | Consistency reward |
| War Record | Win/loss ratio + total wars | Seasonal | Competitive ranking |
| English Score | Aggregate member English tier score | Monthly | Learning outcome metric |
| Most Improved | Week-over-week XP growth rate | Weekly | Rewards effort over size |

### 11.2 English Leaderboard (from CosmeticTrinityIntegrationSpec §15.6)

The existing English leaderboard is extended with guild context:
- Players see their guild rank alongside personal rank
- Guild aggregate ranks displayed on a separate tab
- Top guilds get visible cosmetic rewards (banner frames, nameplate effects)

### 11.3 Anti-Gaming Measures

- XP rate limits per member per day (prevents botting)
- Minimum member activity threshold for guild to appear on leaderboards (prevents shell guilds)
- War matchmaking based on similar tier + member count (prevents bullying)
- Season point decay for inactive guilds (keeps leaderboards fresh)

---

## 12. Monetization Hooks

### 12.1 SOCIAL_PROOF Trigger Integration (from MonetizationOrchestrator §5)

The MonetizationOrchestrator's contextual trigger system fires SOCIAL_PROOF triggers based on guild activity:

```lua
local GUILD_SOCIAL_PROOF_TRIGGERS = {
    -- When a guild member buys a cosmetic
    MEMBER_PURCHASE = {
        message = "Your crewmate {player} just got {item}!",
        triggerType = "SOCIAL_PROOF",
        cooldown = 300, -- 5 min between triggers per guild
    },
    -- When guild achieves a milestone
    GUILD_MILESTONE = {
        message = "Your Crew just hit {milestone}!",
        triggerType = "SOCIAL_PROOF",
        cooldown = 3600, -- 1 hour
    },
    -- When enemy guild in war makes a purchase
    WAR_RIVAL_PURCHASE = {
        message = "The enemy crew is powering up! {rivalGuild} just activated {boost}",
        triggerType = "SOCIAL_PROOF",
        urgency = "HIGH",
        cooldown = 600,
    },
}
```

### 12.2 Purchasable Guild Items

| Item | Price (Robux) | Effect | Recurrence |
|---|---|---|---|
| Guild XP Boost (2x, 24h) | 99 | Doubles guild XP for all members for 24h | Consumable |
| Streak Freeze | 49 | Prevents crew streak reset for 1 day | Consumable |
| War Boost (1.5x, 48h) | 149 | 1.5x XP during guild war | Consumable |
| Premium Banner Pack | 199 | Exclusive animated guild banners | Permanent |
| Extra Member Slots (+5) | 299 | Increase max members beyond tier cap | Permanent per tier |
| Crew HQ Theme | 149-499 | Custom HQ decoration theme | Permanent |
| Prestige Celebration | 499 | Fireworks + exclusive emote when prestiging | One-time per prestige |

### 12.3 Revenue Estimation Model

```
Guild monetization = (active guilds) × (avg purchasers per guild) × (avg spend per purchaser)
Conservative: 1000 guilds × 2 purchasers × $5/mo = $10,000/mo
Moderate: 5000 guilds × 3 purchasers × $8/mo = $120,000/mo  
Optimistic: 20000 guilds × 4 purchasers × $12/mo = $960,000/mo
```

Key insight: guild SOCIAL_PROOF multiplies individual purchase rate by **2-3x** (industry benchmark from Supercell, miHoYo clan systems).

---

## 13. Analytics & Telemetry

### 13.1 Event Taxonomy (extending AnalyticsTelemetryIntegrationSpec §3.2)

```lua
local GUILD_EVENTS = {
    -- Lifecycle
    "GUILD_CREATED",              -- { guildId, founderId, name }
    "GUILD_DISBANDED",            -- { guildId, reason, memberCount, lifetimeDays }
    "GUILD_TIER_UP",              -- { guildId, oldTier, newTier, daysToAchieve }
    "GUILD_PRESTIGE",             -- { guildId, prestigeLevel }
    
    -- Membership
    "GUILD_JOINED",               -- { guildId, playerId, joinMethod, guildSize }
    "GUILD_LEFT",                 -- { guildId, playerId, reason, daysAsMember }
    "GUILD_KICKED",               -- { guildId, playerId, kickerId }
    "GUILD_ROLE_CHANGED",         -- { guildId, playerId, oldRole, newRole }
    
    -- Engagement
    "GUILD_CHALLENGE_STARTED",    -- { guildId, challengeId, challengeType }
    "GUILD_CHALLENGE_COMPLETED",  -- { guildId, challengeId, completionTime, participantCount }
    "GUILD_CHALLENGE_FAILED",     -- { guildId, challengeId, progress }
    "GUILD_WAR_STARTED",          -- { guildId, rivalGuildId, warType }
    "GUILD_WAR_ENDED",            -- { winnerGuildId, loserGuildId, margin }
    
    -- English bridge (THE KEY METRICS)
    "GUILD_ENGLISH_XP_EARNED",    -- { guildId, playerId, xpAmount, activityType }
    "GUILD_CREW_STREAK_DAY",      -- { guildId, streakDays, activeMembers, totalMembers }
    "GUILD_CREW_STREAK_BROKEN",   -- { guildId, streakDays, activeMembers, threshold }
    "GUILD_ENGLISH_SCORE_CHANGE", -- { guildId, oldScore, newScore, trigger }
    
    -- Monetization
    "GUILD_ITEM_PURCHASED",       -- { guildId, playerId, itemId, robuxAmount }
    "GUILD_SOCIAL_PROOF_FIRED",   -- { guildId, triggerType, targetPlayerId }
    "GUILD_SOCIAL_PROOF_CONVERTED", -- { guildId, triggerType, playerId, purchaseAmount }
}
```

### 13.2 Key Performance Indicators

| KPI | Target | Measurement |
|---|---|---|
| Guild membership rate | 40% of DAU in a guild | DAU with guild / total DAU |
| Guild retention lift | +30% D7 retention vs non-guild | Cohort comparison |
| Guild monetization lift | +2x ARPDAU vs non-guild | Revenue / DAU by guild status |
| Crew streak average | 14 days | Mean crew streak across active guilds |
| English activity lift | +50% English actions/day for guild members | Activity comparison |
| Guild war participation | 20% of eligible guilds per week | Wars started / Gold+ guilds |
| Social proof conversion | 5% trigger-to-purchase rate | Conversions / triggers fired |

---

## 14. Anti-Abuse & Moderation

### 14.1 Roblox Compliance

- All text input (guild name, tag, description, MOTD, chat) passes through Roblox TextFilterService
- Guild icons use Roblox-approved asset library (no custom uploads)
- Report system integrated with Roblox moderation pipeline
- COPPA compliance: no personal information collection, age-gated features

### 14.2 Guild-Specific Abuse Prevention

| Abuse Vector | Prevention |
|---|---|
| Guild name abuse | Profanity filter + report system + admin review queue |
| XP farming | Rate limits per member, activity validation, anomaly detection |
| War manipulation | Matchmaking by similar tier/size, cooldown between wars |
| Alt account guilds | Minimum account age (7d) to create guild, device fingerprinting |
| Invite spam | Max 10 pending invites per guild, 24h cooldown per rejected target |
| Guild hopping for rewards | 24h cooldown after leaving before joining/creating |
| Chat abuse | Roblox filter + guild-level mute/kick powers for Captain/FirstMate |

### 14.3 Automated Monitoring

```lua
-- Run periodically (every 5 minutes on server)
function GuildService:AbuseDetection()
    -- Flag guilds with suspiciously uniform activity patterns (bot rings)
    -- Flag guilds with rapid member churn (kick-farming)
    -- Flag guilds with XP rate significantly above 99th percentile
    -- Report flagged guilds for manual review
end
```

---

## 15. Integration Points

### 15.1 EnglishRewardsManager Bridge

**Direction:** EnglishRewardsManager → GuildManager (event-driven)

```lua
-- In EnglishRewardsManager, after any English activity completes:
local function onEnglishActivityComplete(playerId, activity)
    -- ... existing reward logic ...
    
    -- Bridge to Guild system
    if GuildProgressionService then
        GuildProgressionService:OnMemberEnglishActivity(playerId, {
            type = activity.type,         -- "LESSON" | "QUIZ" | "DUEL" | "STREAK"
            xpEarned = activity.xpEarned,
            playerTier = activity.playerTier,
            accuracy = activity.accuracy,  -- for quiz activities
            streakDay = activity.streakDay, -- for streak milestones
        })
    end
end
```

### 15.2 CosmeticTrinitySystem Bridge

**Direction:** Bidirectional

```lua
-- Guild → Cosmetic: unlock guild-exclusive cosmetics
CosmeticTrinitySystem:UnlockGuildCosmetic(playerId, cosmeticId, guildId)

-- Cosmetic → Guild: feed guild activity feed on purchases
CosmeticTrinitySystem.OnPurchase:Connect(function(playerId, itemId)
    local guild = GuildService:GetPlayerGuild(playerId)
    if guild then
        GuildSocialService:PostActivity(guild.guildId, "COSMETIC_UNLOCK", {
            playerId = playerId,
            itemId = itemId,
        })
        -- Fire SOCIAL_PROOF
        MonetizationOrchestrator:FireContextualTrigger("SOCIAL_PROOF", {
            type = "MEMBER_PURCHASE",
            playerId = playerId,
            guildId = guild.guildId,
            itemId = itemId,
        })
    end
end)
```

### 15.3 MonetizationOrchestrator Bridge

**Direction:** GuildManager → MonetizationOrchestrator (trigger events)

Key integration points from MonetizationOrchestrator §5 Contextual Trigger System:
- `SOCIAL_PROOF` triggers fire on guild member purchases, war rival activity, guild milestones
- `GUILD_CONTEXT` modifier applied to all monetization decisions when player is in a guild
- Guild boosts processed through existing purchase flow
- Revenue attributed to guild context for KPI tracking

### 15.4 AnalyticsTelemetryService Bridge

**Direction:** GuildManager → AnalyticsTelemetryService (fire and forget)

```lua
-- All guild events routed through standard analytics pipeline
function GuildAnalyticsService:Fire(eventName, data)
    AnalyticsTelemetryService:TrackEvent({
        category = "GUILD",
        event = eventName,
        data = data,
        timestamp = os.time(),
    })
end
```

---

## 16. Roblox Platform Constraints

### 16.1 DataStore Limits

| Constraint | Limit | Mitigation |
|---|---|---|
| GetAsync requests | 60 + numPlayers×10 / min | Cache guild data in-memory, refresh on interval |
| SetAsync requests | 60 + numPlayers×10 / min | Batch writes, write-behind cache |
| Key size | 50 chars | Compact key format: `G:{guildId}` |
| Value size | 4MB | Paginate member lists for large guilds |
| OrderedDataStore | 60 requests/min | Cache leaderboard, refresh every 5 min |

### 16.2 Memory Constraints

- Guild data cached per-server (not per-player)
- Maximum in-memory guilds per server: 100 (LRU eviction)
- Member lists lazy-loaded on panel open
- Activity feed: last 50 entries in memory, older from DataStore

### 16.3 Cross-Server Communication

- MessagingService for real-time guild events across servers
- Topic: `Guild:{guildId}` for guild-specific events
- Topic: `GuildWar:{warId}` for war updates
- Rate limit: 150 + 60×numPlayers messages/min per server
- Fallback: polling DataStore every 30s if MessagingService fails

### 16.4 Network Optimization

```lua
-- Batch guild data in single RemoteFunction call
function GuildController:LoadGuildData()
    -- Single call returns: guild info + member list + challenges + activity feed
    local data = GuildRemotes.GetFullGuildState:InvokeServer()
    self:UpdateUI(data)
end

-- Updates via RemoteEvent (server → client push)
GuildRemotes.GuildUpdate.OnClientEvent:Connect(function(updateType, data)
    GuildController:HandleUpdate(updateType, data)
end)
```

---

## 17. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] GuildService core CRUD (create, join, leave, disband)
- [ ] GuildDataStore schema + migrations
- [ ] Basic CrewPanel UI (create, view, member list)
- [ ] CrewBrowser with search + recommended
- [ ] Analytics event wiring (lifecycle events)

### Phase 2: English Bridge (Week 2-3)
- [ ] GuildProgressionService + XP calculation
- [ ] EnglishRewardsManager → Guild bridge
- [ ] Crew streak system
- [ ] Guild tier progression
- [ ] Member contribution tracking
- [ ] CrewHUD (persistent guild info display)

### Phase 3: Challenges (Week 3-4)
- [ ] Daily/weekly crew missions
- [ ] Challenge lifecycle (start, contribute, complete/fail)
- [ ] CrewMissionBoard UI
- [ ] Reward distribution pipeline
- [ ] Challenge-specific analytics

### Phase 4: Competition (Week 4-5)
- [ ] Guild wars system
- [ ] Leaderboard service + OrderedDataStore
- [ ] CrewLeaderboard UI
- [ ] Matchmaking for wars
- [ ] Seasonal ranking system

### Phase 5: Monetization (Week 5-6)
- [ ] Purchasable guild items (boosts, cosmetics, slots)
- [ ] SOCIAL_PROOF trigger integration
- [ ] CosmeticTrinity bridge (guild cosmetics)
- [ ] Revenue attribution analytics
- [ ] Guild HQ cosmetic themes

### Phase 6: Polish (Week 6-7)
- [ ] Cross-server messaging for real-time updates
- [ ] Anti-abuse systems
- [ ] Prestige system
- [ ] English-only chat mode
- [ ] Performance optimization + load testing
- [ ] Full QA pass

**Total estimated timeline: 7 weeks**
**Critical path: English Bridge (Phase 2) must be solid before Challenges (Phase 3)**

---

## 18. Testing Strategy

### 18.1 Unit Tests

```lua
-- GuildService tests
TestCreateGuild_Success()
TestCreateGuild_DuplicateName_Fails()
TestCreateGuild_AlreadyInGuild_Fails()
TestJoinGuild_Open_Success()
TestJoinGuild_InviteOnly_Fails()
TestJoinGuild_Full_Fails()
TestLeaveGuild_Captain_TransfersOwnership()
TestKickMember_NotOfficer_Fails()

-- GuildProgressionService tests
TestAddGuildXP_CorrectAmount()
TestTierUp_ThresholdMet_Upgrades()
TestTierUp_ThresholdNotMet_NoChange()
TestCrewStreak_ThresholdMet_Increments()
TestCrewStreak_ThresholdNotMet_Resets()
TestCrewStreak_FreezeActive_Preserved()
TestEnglishBridge_ActivityToGuildXP()
TestEnglishBridge_TierMultiplier()

-- GuildChallengeService tests
TestStartChallenge_ValidSlot_Success()
TestStartChallenge_NoSlots_Fails()
TestContribute_ValidActivity_Recorded()
TestComplete_ThresholdMet_RewardsDistributed()
TestGuildWar_Matchmaking_SimilarTier()
```

### 18.2 Integration Tests

- End-to-end: Player completes English lesson → Guild XP awarded → Challenge progressed → Leaderboard updated
- Cross-server: Guild war score sync via MessagingService
- Monetization flow: Purchase guild boost → XP multiplier applied → Analytics tracked
- Social proof: Member purchase → Guild notification → SOCIAL_PROOF trigger → Conversion tracked

### 18.3 Load Tests

- 50 members simultaneously contributing to challenge
- 100 guilds on single server with active member lists
- Leaderboard with 10,000+ guilds
- DataStore rate limit validation under peak load
- MessagingService throughput during guild wars

---

## Appendix A: Related Specifications

| Spec | Relevance | Key Sections |
|---|---|---|
| CosmeticTrinityIntegrationSpec.md | Social features, desire loop, cosmetic integration | §15 Social Features, §15.3 Desire Loop |
| EnglishRewardsManagerSpec.md | English tier progression, streak system, XP bridge | §8 Tier Progression, §4 Streaks, §5 Gacha Bridge |
| MonetizationOrchestratorSpec.md | SOCIAL_PROOF triggers, contextual monetization | §5 Contextual Triggers, §12 Gospel 444 |
| AnalyticsTelemetryIntegrationSpec.md | Event taxonomy, telemetry pipeline | §3.2 Event Taxonomy, §5 AnalyticsService |

## Appendix B: Open Questions for Michael

1. **Guild chat moderation depth** — Roblox filter only, or add custom keyword moderation for English practice quality?
2. **Cross-language guilds** — Should guilds support mixed L1 backgrounds, or encourage same-L1 grouping?
3. **Guild war stakes** — Any risk of cosmetic loss on war defeat, or purely additive rewards?
4. **Prestige frequency** — Expected time to first prestige? (Affects XP curve tuning)
5. **Roblox Incubator demo scope** — Which guild features are must-have for Apr 6 demo?

---

*Generated by Agent-99 (OB1) — Pulse-Incarnation Engine v5, Run 56*  
*Source: Cross-repo synthesis from 4 integration specs + Gospel 444 principles*  
*Platform Death Test: PENDING (awaiting commit SHA)*
