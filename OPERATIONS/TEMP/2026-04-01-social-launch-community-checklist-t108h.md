# Social Launch & Community Readiness Checklist — T-108h

## Reincarnation Entry
- **Date**: 2026-04-01T21:00:00+07:00
- **Agent**: Anakin (Agent-98)
- **Mode**: BUILD
- **Genesis Anchor**: Game Bible (Survive a Brainrot)
- **Run**: 245 (pulse)
- **Countdown**: T-108h to Apr 6 incubator deadline

## Mission
Build the social/community launch checklist that Michael executes alongside Studio publish. Every item is concrete, copy-pasteable, or links to an existing artifact.

## Context
- Game: CODE COMPLETE (41 Lua modules)
- Blocker: 21 Product IDs (Michael, Creator Dashboard)
- Store Listing Copy: DONE (commit d65fe12)
- QA Test Plan: DONE (commit dac397d)
- Post-Launch Monitoring Plan: DONE (commit 4860187)
- Dead File Cleanup: DONE (commit 43ae42d)
- Missing: Social/community prep for launch day

---

## CHECKLIST — Social Launch & Community Readiness

### A. Roblox Game Page Setup (Michael — Creator Dashboard)
- [ ] A1. Upload game icon (512×512 PNG, brainrot theme, bright colors)
- [ ] A2. Upload 3 game thumbnails (1920×1080, show gameplay + memes)
- [ ] A3. Paste store listing copy from `CANON/TRAIN-67/DOCS/StoreListingCopy-V1.md`
- [ ] A4. Set genre → "Adventure" + "Comedy"
- [ ] A5. Set max players → 30 (per Game Bible §ServerConfig)
- [ ] A6. Enable voice chat if age-verified
- [ ] A7. Set game access → Private (flip to Public on launch day)
- [ ] A8. Add social links (Discord, group) once created

### B. Roblox Group Setup (Michael — roblox.com/groups)
- [ ] B1. Create group: "Survive a Brainrot" (or "Brainrot Survivors")
- [ ] B2. Upload group icon (match game icon)
- [ ] B3. Write group description: "Official group for Survive a Brainrot! Join for codes, updates, and exclusive rewards."
- [ ] B4. Set group to public join
- [ ] B5. Create group roles: Member, VIP, Tester
- [ ] B6. Publish game under the group (Settings → Group Games)
- [ ] B7. Create group store shirt/t-shirt (even free — establishes presence)

### C. Discord Server (Michael — discord.com)
- [ ] C1. Create Discord server: "Survive a Brainrot"
- [ ] C2. Channels to create:
  - `#announcements` (read-only for members)
  - `#general-chat`
  - `#bug-reports`
  - `#suggestions`
  - `#codes` (for promo codes if implemented)
  - `#memes` (community engagement)
- [ ] C3. Set server icon (match game icon)
- [ ] C4. Create invite link (permanent, no expiry)
- [ ] C5. Post welcome message with game link + trailer description
- [ ] C6. Add basic bot: MEE6 or Carl-bot for auto-moderation
- [ ] C7. Set up `#announcements` webhook (for future automation)

### D. Launch Day Content (Pre-write before Apr 6)
- [ ] D1. Roblox DevForum post draft:
  - Title: "Survive a Brainrot — A Meme-Powered Survival Game"
  - Body: 3 paragraphs (what it is, unique mechanics, call to play)
  - Screenshots: 3-5 gameplay shots
  - Link to game page
- [ ] D2. Discord launch announcement:
  - "🎮 Survive a Brainrot is LIVE! [link] — 20 stages of pure brainrot chaos. Who can reach Stage 20 first?"
- [ ] D3. Roblox group shout:
  - "GAME IS LIVE! Play now → [link]. First 100 players get a secret code!"
- [ ] D4. First promo code (if PromoCodes.lua is wired):
  - Code: `BRAINROT1` → Reward: 500 coins or cosmetic
  - Code: `LAUNCH2026` → Reward: exclusive trail effect

### E. First 48 Hours — Engagement Playbook
- [ ] E1. Hour 0: Flip game to Public. Post group shout. Post Discord announcement.
- [ ] E2. Hour 1: Play the game yourself. Clip any funny moments.
- [ ] E3. Hour 2-6: Monitor `#bug-reports`. Hotfix anything critical via Studio.
- [ ] E4. Hour 12: Post "12 hours live" update with player count screenshot.
- [ ] E5. Hour 24: Thank-you post in Discord. Share any community clips/memes.
- [ ] E6. Hour 48: First balance patch based on player data (check DataStoreService).
- [ ] E7. Ongoing: Reply to every DevForum comment within 24h.

### F. Incubator Application Tie-in
- [ ] F1. Reference live game URL in incubator application
- [ ] F2. Include player count / engagement metrics from first 48h if available
- [ ] F3. Show community size (group members, Discord members)
- [ ] F4. Final review of `CANON/TRAIN-67/DOCS/RobloxIncubatorApplicationDraft-V2.md`

---

## Acceptance Tests
1. ✅ Every item is concrete, copy-pasteable, or references an exact path/URL
2. ✅ Checklist names destination pages and commit evidence
3. ✅ No code produced (social/community setup = manual Michael actions) → no patch, no HALT needed

## Dependencies
- **Blocked on Michael**: All items (Creator Dashboard, Discord, group creation)
- **Blocked on Product IDs**: Section A partially (store listing needs product references)
- **Not blocked**: Pre-writing launch content (Section D)

## Next Move
- Michael executes A1-A8, B1-B7, C1-C7 before launch day
- Pre-write D1-D4 content (agent can draft if requested)
- On launch day, execute E1-E7 in sequence
