# Game Codes Configuration — Launch Codes
**Date:** 2026-03-29 | **Auditor:** OB1 | **Pipeline Action:** #14 of 20

## Overview
Promo codes for launch marketing. Distributed via Discord, DevForum, social media.
All codes validated server-side. One-time use per player.

## Launch Code Set

| Code | Reward | Distribution | Expiry |
|------|--------|-------------|--------|
| `BRAINROT` | 500 Coins + 10 Gems | DevForum post | 30 days |
| `SKIBIDI` | 250 Coins + Standard Crate | Discord welcome message | 14 days |
| `SIGMA` | Exclusive "Sigma Tester" Title | Early testers only | 7 days |
| `RIZZ` | 100 Gems | Twitter/X launch post | 30 days |
| `OHIO` | Ohio Anomaly Nameplate | Discord milestone (100 members) | Never |
| `SURVIVE` | 1,000 Coins | Week 1 content calendar Day 3 | 7 days |
| `LAUNCH` | Premium Crate + 500 Coins | Launch day announcement | 24 hours |
| `TOILET` | Skibidi Toilet Hat (cosmetic) | DevForum share post | 30 days |
| `ZOMBIE` | 2x Coin Boost (1 hour) | Discord event reward | 14 days |
| `RIZZLORD` | 500 Gems + Legendary Crate | Hidden code in game world | Never |

## Server-Side Validation Schema
```lua
local CODES = {
    BRAINROT = {
        rewards = { Coins = 500, Gems = 10 },
        maxRedemptions = nil, -- unlimited
        expiresAt = os.time() + (30 * 86400),
        onePerPlayer = true,
    },
    SKIBIDI = {
        rewards = { Coins = 250, crate = "Standard" },
        maxRedemptions = nil,
        expiresAt = os.time() + (14 * 86400),
        onePerPlayer = true,
    },
    -- ... etc
}
```

## Integration
- Code redemption UI: simple text input on main menu
- Server validates via DataStore (tracks redeemed codes per player)
- `EconomyManager.grant()` for currency rewards
- `EconomyManager.GrantCrate()` for crate rewards (currently stub)
- Code list stored in `ReplicatedStorage.GameConfig` or server module

## Marketing Strategy
1. **Pre-launch (Discord):** SKIBIDI code in welcome channel
2. **Launch day:** LAUNCH code in all announcements (24h urgency)
3. **Week 1 drip:** One new code revealed per day in content calendar
4. **DevForum:** BRAINROT and TOILET codes in post
5. **Hidden:** RIZZLORD code placed as an Easter egg in game world
