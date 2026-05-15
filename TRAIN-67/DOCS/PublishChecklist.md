# Publish Checklist — Skibidi Zombie: Survive the Brainrots

**GOAL: MAKE MONEY.** This is the last gate before players see the game.

## Pre-Publish (in Roblox Studio)

### Game Settings
- [ ] Game name: "Skibidi Zombie: Survive the Brainrots 🧟💀"
- [ ] Description: Full SEO copy from GamePageSEO.md
- [ ] Genre: Horror + Fighting
- [ ] Max players per server: 20
- [ ] Allow copying: OFF
- [ ] Allow third-party sales: OFF (until game pass audit)
- [ ] Enable Studio Access to API Services: ON
- [ ] Collaborative editing: OFF for production

### Icon & Thumbnails
- [ ] Game icon uploaded (512x512)
- [ ] At least 2 thumbnails uploaded (1920x1080)
- [ ] Icon readable at 50x50 (mobile grid test)
- [ ] No copyrighted material

### Permissions
- [ ] Game visibility: Public
- [ ] Playable on all devices (phone, tablet, PC, Xbox)
- [ ] Age rating appropriate (no explicit content)

### Developer Products & Game Passes
- [ ] All game passes created and priced
- [ ] All developer products created
- [ ] Prices validated against competitor analysis
- [ ] Purchase flow tested in Studio

## Code Verification

### Boot Test
- [ ] Clean boot with zero errors in Output
- [ ] All 20+ modules initialize
- [ ] All RemoteEvents created
- [ ] No "Infinite yield" warnings

### Integration Test
- [ ] FTUE works for new player
- [ ] Combat loop works (question → answer → damage)
- [ ] Wave system progresses
- [ ] Data saves and loads
- [ ] Economy works (earn, spend, persist)
- [ ] HUD works on mobile
- [ ] Security layer blocks exploits

### Performance
- [ ] 60 FPS on mid-tier PC
- [ ] 30+ FPS on mobile
- [ ] No memory leaks after 30 min play
- [ ] Server doesn't lag with 20 players

## Infrastructure

### DataStore
- [ ] DataStore name finalized: "SkibidiZombie_PlayerData_v2"
- [ ] Migration tested (v1 → v2)
- [ ] Auto-save interval: 120s
- [ ] BindToClose handler active

### Analytics (Phase 2)
- [ ] GameAnalytics SDK integrated (or custom)
- [ ] Track: DAU, session length, wave reached, coins earned
- [ ] Track: FTUE completion rate
- [ ] Track: Purchase conversion

### Discord
- [ ] Server created with all channels
- [ ] Bot deployed and running
- [ ] Game → Discord webhook configured
- [ ] Invite link in game description

## Marketing (Launch Day)

### Roblox Platform
- [ ] Like & Favorite the game from all team accounts
- [ ] Social links in game description
- [ ] Group created (for game updates)
- [ ] Sponsored ad budget allocated (if applicable)

### Social Media
- [ ] Discord announcement posted
- [ ] Twitter/X post with game link
- [ ] TikTok/Shorts clip of gameplay
- [ ] Reddit post in r/roblox, r/robloxgamedev

### Community
- [ ] First 10 players invited (friends, beta testers)
- [ ] Feedback form/channel set up
- [ ] Bug report channel active
- [ ] First giveaway scheduled (24h after launch)

## Post-Publish (First 24 Hours)

### Monitor
- [ ] Check CCU every hour
- [ ] Monitor error logs in Roblox Developer Console
- [ ] Watch for exploit reports
- [ ] Track DataStore budget usage
- [ ] Monitor Discord for player feedback

### Quick Response Plan
| Issue | Action |
|-------|--------|
| Crash on join | Revert to last stable version |
| Data loss | Emergency save, disable auto-save, investigate |
| Exploit found | Enable emergency ban, patch SecurityLayer |
| Zero players | Check game visibility, thumbnails, description |
| Negative reviews | Respond, gather feedback, prioritize fixes |

### Day 1 Metrics Target
| Metric | Target | Failure |
|--------|--------|---------|
| CCU peak | 10+ | <5 |
| D1 retention | 20%+ | <10% |
| FTUE completion | 70%+ | <40% |
| Average session | 5+ min | <2 min |
| Crash rate | <1% | >5% |

## Final GO/NO-GO

**Score card** (10 points max):

| Category | Weight | Pass? | Points |
|----------|--------|-------|--------|
| Boot clean | 2 | ⬜ | /2 |
| Data persistence | 2 | ⬜ | /2 |
| Combat works | 1 | ⬜ | /1 |
| Mobile HUD | 1 | ⬜ | /1 |
| Security active | 1 | ⬜ | /1 |
| Icon/thumbnails | 1 | ⬜ | /1 |
| Game page SEO | 1 | ⬜ | /1 |
| Discord ready | 1 | ⬜ | /1 |

**7+/10 = GO. <7 = FIX FIRST.**

---
*Built for Skibidi Zombie: Survive the Brainrots. GOAL: MAKE MONEY.*
