# BATTLE Stage 10 — Discord Community Recon

**Date:** 2026-03-26
**Auditor:** Agent-99 (OB1)
**Scope:** Discord community activation strategy for Natural English Training
**Limitation:** No direct Discord API access — this is strategic architecture based on product knowledge

---

## Executive Summary

Discord is the ideal community platform for NET's target demographic (Vietnamese English learners, age 13-35). This stage maps the community architecture needed to turn a Discord server from empty to self-sustaining.

---

## Platform Fit Analysis

| Factor | Discord | Zalo | Facebook | Assessment |
|---|---|---|---|---|
| Bot ecosystem | ★★★★★ | ★★☆☆☆ | ★★☆☆☆ | Discord wins massively |
| Voice channels | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | Critical for English practice |
| Gamification | ★★★★★ | ★☆☆☆☆ | ★☆☆☆☆ | Roles, XP, levels native |
| Vietnamese user base | ★★★☆☆ | ★★★★★ | ★★★★★ | Discord growing fast in VN gaming |
| Cost | Free | Free | Free (ads needed) | Tie |
| OBI integration potential | ★★★★★ | ★★☆☆☆ | ★☆☆☆☆ | Discord webhooks + bots = seamless |
| Roblox crossover | ★★★★★ | ★☆☆☆☆ | ★★☆☆☆ | Roblox players live on Discord |

**Verdict:** Discord is the correct choice. The Roblox game audience already lives there.

---

## Server Architecture Blueprint

### Category: WELCOME
| Channel | Purpose | Bot Integration |
|---|---|---|
| `#welcome` | Auto-greeting, rules, role selection | Welcome bot + OBI intro |
| `#rules` | Read-only server rules | None |
| `#introductions` | New members introduce themselves (in English!) | XP bot rewards first post |
| `#choose-your-level` | Reaction roles: 🐭 Mouse / 🐱 Cat / 🐯 Tiger | Role assignment bot |

### Category: ENGLISH PRACTICE
| Channel | Purpose | Bot Integration |
|---|---|---|
| `#daily-challenge` | Daily English prompt (auto-posted) | OBI bot posts at 08:00 ICT |
| `#vocabulary-builder` | Word of the day + usage examples | OBI bot + community submissions |
| `#grammar-help` | Ask grammar questions | OBI bot auto-responds |
| `#pronunciation-lab` | Voice message practice | Community feedback |
| `🔊 Speaking Room 1-3` | Voice channels for live practice | Stage channels for events |
| `#writing-workshop` | Weekly writing prompts | Peer review system |

### Category: GAME ZONE
| Channel | Purpose | Bot Integration |
|---|---|---|
| `#roblox-updates` | Game development updates | GitHub webhook for commits |
| `#game-feedback` | Player bug reports and suggestions | Backlog integration |
| `#leaderboards` | Weekly XP and engagement leaderboards | Leaderboard bot |
| `#trading-post` | In-game trading discussion | Economy bot |
| `#screenshots` | Share gameplay moments | Media-only channel |

### Category: COMMUNITY
| Channel | Purpose | Bot Integration |
|---|---|---|
| `#general-chat` | Free conversation (English encouraged) | XP for English messages |
| `#vietnamese-corner` | Vietnamese-only safe space | No XP (incentivize English elsewhere) |
| `#memes` | Meme channel (English memes get bonus XP) | Media-only |
| `#achievements` | Auto-announce level-ups and milestones | Level bot |
| `#events` | Event announcements | Scheduled events integration |

### Category: STAFF
| Channel | Purpose | Access |
|---|---|---|
| `#mod-chat` | Moderator discussion | Mods only |
| `#bot-logs` | Bot action logs | Staff only |
| `#analytics` | Weekly community metrics | Staff only |

---

## Role Hierarchy

| Role | Color | Permissions | How Earned |
|---|---|---|---|
| 👑 Sovereign | Gold | Full admin | Michael only |
| 🛡️ Moderator | Purple | Manage messages, mute, kick | Appointed |
| 🐯 Tiger | Orange | All channels + voice priority | Level 50+ or verified advanced |
| 🐱 Cat | Blue | Most channels | Level 20+ or intermediate |
| 🐭 Mouse | Green | Basic channels | Default on join |
| 🎮 Player | Red accent | Game zone access | Verified Roblox account |
| 🤖 OBI | Gold accent | Bot role | Bot account |
| 📚 Teacher | Purple accent | Teaching channels | Appointed by Michael |

---

## Growth Targets

| Milestone | Target | Timeline | Strategy |
|---|---|---|---|
| First 50 members | Seed community | Week 1-2 | Personal invites from Michael's existing students |
| 100 members | Critical mass | Month 1 | Roblox game integration + social media |
| 500 members | Self-sustaining | Month 3 | Organic growth from content + word of mouth |
| 1,000 members | Monetizable | Month 6 | Premium tiers, paid events, game crossover |
| 5,000 members | Brand authority | Year 1 | SEO, partnerships, Roblox discovery |

---

## Competitive Recon

| Competitor Pattern | What Works | What to Steal |
|---|---|---|
| English practice Discord servers | Daily challenges, voice rooms, level roles | XP system tied to English usage |
| Roblox game Discords | Update announcements, bug reports, leaderboards | GitHub → Discord webhook pipeline |
| Language exchange servers | Tandem partners, correction channels | Pair Vietnamese speakers with English speakers |
| Gaming community Discords | Events, tournaments, seasonal content | Tie Discord events to in-game events |

---

## Action Items

| # | Action | Owner |
|---|---|---|
| 1 | Create Discord server with architecture above | Michael (or bot setup) |
| 2 | Configure role hierarchy and permissions | Stage 13 |
| 3 | Deploy OBI bot (Stage 11) | Dev |
| 4 | Seed with first 10-20 members from existing students | Michael |
| 5 | Launch daily challenge system | Bot automation |
| 6 | Connect Roblox game to Discord (webhooks) | Dev |
