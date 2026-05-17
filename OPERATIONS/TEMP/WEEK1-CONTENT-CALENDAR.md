# 📅 WEEK 1 CONTENT CALENDAR — Survive a Brainrot (Post-Launch)

> **Artifact Class:** 🔨 BUILD
> **Run:** 98 | **Date:** 2026-03-29 06:00 ICT
> **Active Mission:** LAUNCH-READY OVERNIGHT SPRINT — Action 7/8
> **Cross-repo sources:** 7 files (STORE-LISTING-COPY.md, DISCORD-SERVER-SETUP-GUIDE.md, LAUNCH-DAY-PLAYBOOK.md, DAY1-HOTFIX-PLAYBOOK.md, PostLaunchMonitorPlan.md, MONEY-PRINTER-PIPELINE.md, GAME-BIBLE-DEPLOY-STATUS-FINAL.md)
> **Principle applied:** 🔴 Kids aren't stupid — no educational framing. Game leads with FUN. English is differentiator, not mission.

---

## 🎯 WEEK 1 GOAL

**Survive launch. Build momentum. Hit 100 Discord members. First revenue.**

Week 1 is about STABILITY + HYPE. Don't over-update the game — focus on community building, bug squashing, and getting the word out. The game code is solid (48 files, zero broken requires, LAUNCH-READY). The first week is about PLAYERS, not features.

---

## 📊 Week 1 KPIs

| Metric | Target | Measured How |
|---|---|---|
| Peak CCU | 10+ by Day 3 | Creator Dashboard → Real Time |
| Total Plays | 500+ by Day 7 | Creator Dashboard → Analytics |
| D1 Retention | >20% | Creator Dashboard → Engagement |
| Revenue | Any R$ by Day 2 | Creator Dashboard → Monetization |
| Discord Members | 100+ by Day 7 | Discord Server Settings |
| Likes:Dislikes | >4:1 | Game Page |
| Avg Session Time | >5 min | Creator Dashboard → Engagement |

---

## 🗓️ DAY-BY-DAY CALENDAR

### 🚀 DAY 1 — SUNDAY (Launch Day) — March 29

**Theme:** LAUNCH HYPE. Get the game live, stable, and earning.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **08:00** | ☀️ Morning launch prep | Roblox Studio | Create 21 Product IDs, paste into configs, boot test, publish. See `LAUNCH-DAY-PLAYBOOK.md` |
| **09:00** | 🚀 **GAME GOES PUBLIC** | Roblox | Set to Public in Creator Dashboard |
| **09:05** | 📢 Launch announcement | Twitter/X | Post launch tweet (copy from STORE-LISTING-COPY.md) |
| **09:10** | 📢 Launch announcement | Discord | First message in #general + #updates. Use: `🧟 SURVIVE A BRAINROT IS LIVE! Play now → [GAME LINK]` |
| **09:15** | 📱 Share game link | Personal network | WhatsApp, Line, direct messages to first 10-20 people |
| **09:30** | 📊 First health check | Creator Dashboard | CCU, errors, join rate. See DAY1-HOTFIX-PLAYBOOK.md |
| **10:00** | 📊 30-min health check | Creator Dashboard | Session time >3min? Any crashes? |
| **10:30** | 📱 Mobile playtest | Phone | Join on phone, verify touch controls, complete FTUE |
| **11:00** | 💰 Revenue check | Creator Dashboard | Any purchases? If 0 with CCU: check purchase flow |
| **12:00** | 📊 Economy check | Creator Dashboard | Coin balances in expected range? See economy levers in DAY1-HOTFIX-PLAYBOOK.md |
| **14:00** | 📢 "How far did you get?" post | Twitter/X + Discord | `🧟 SURVIVE A BRAINROT has been live for 5 hours! What day did YOU survive to? Drop your record below 💀🔥 #SurviveABrainrot` |
| **16:00** | 🎁 **First Daily Drop** | Discord #drop-alerts | Bot posts featured weapon rotation (if bot is live). Manual post if not: `⚔️ TODAY'S FEATURED DROP: [Random weapon from the 19-weapon pool] — hunt it in Biome 2! 🔥` |
| **18:00** | 📊 Half-day review | Creator Dashboard | Total revenue, peak CCU, worst bug, best moment |
| **20:00** | 📢 Evening hype post | Discord #general | `Day 1 stats: [X] players survived, [Y] zombies eliminated, [Z] brainrots defeated. The apocalypse is just getting started 🧟💀` |
| **22:00** | 📊 End-of-day review | Creator Dashboard | Full Day 1 metrics. Log to PostLaunchMonitorPlan.md template |

**Daily Drop Rotation Pool (19 weapons across 6 tiers):**
> Feature ONE weapon per day. Cycle through rarity tiers to create variety. Day 1 = something accessible (Rare tier). Save Legendary/RIZZLORD features for Days 5-7 when engagement needs a boost.

| Day | Featured Tier | Why |
|---|---|---|
| 1 | Rare | Accessible. Shows weapon variety without scaring new players |
| 2 | Uncommon | Shows depth of collection |
| 3 | Epic | Mid-week hype bump |
| 4 | Rare (different weapon) | Keeps it fresh, still accessible |
| 5 | Legendary | Friday flex — "this exists and YOU could get it" |
| 6 | Epic (different) | Weekend warrior energy |
| 7 | RIZZLORD tease | Week-end climax: "The ultimate weapon exists. 0.1% drop rate. Are you worthy?" |

---

### 📈 DAY 2 — MONDAY — March 30

**Theme:** STABILITY + FIRST RETENTION CHECK. Did Day 1 players come back?

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 📊 D1 Retention check | Creator Dashboard | Target: >20% of Day 1 players returned. If <10%: FTUE is broken — investigate |
| **09:30** | 🐛 Bug triage | Studio + Discord | Check #bug-reports for common issues. Fix top 1-2 if blocking |
| **10:00** | 📢 "Tip of the Day" post | Discord #general | `💡 PRO TIP: Build combos by tapping fast! 3-hit combos = 2x damage. 5-hit = MASSIVE crit. Master the rhythm and you'll survive longer 🔥⚔️` |
| **12:00** | 📢 DevForum post | Roblox DevForum | Post in "Cool Creations" using hook from STORE-LISTING-COPY.md. This drives organic dev community traffic |
| **16:00** | 🎁 Daily Drop | Discord #drop-alerts | Feature an Uncommon weapon: `⚔️ TODAY'S DROP: [Weapon Name] — Perfect starter weapon. Drops in Biome 1 waves 5-15` |
| **18:00** | 📊 Economy review | Creator Dashboard | Check if anyone has abnormal coin balances. Tune levers if needed (see DAY1-HOTFIX-PLAYBOOK.md) |
| **20:00** | 📢 Player spotlight | Discord #general | If anyone posted in #flex-your-loot: repost with hype. If not: post your own gameplay moment |
| **22:00** | 🔧 Set BattlePass SEASON_START | Studio | If not done Day 1: set `SEASON_START = "2026-03-29"` in BattlePass.lua. Re-publish. |

---

### ⚡ DAY 3 — TUESDAY — March 31

**Theme:** CONTENT PUSH. DevForum traction + first social media expansion.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 📊 Metrics review | Creator Dashboard | CCU trend, D1 retention confirmed, revenue so far |
| **10:00** | 📢 Tuesday Update Tease | Discord #updates | `📢 WEEK 1 UPDATE INCOMING THIS SATURDAY! New content dropping. Stay tuned 👀🔥 @Updates` |
| **12:00** | 📹 First gameplay clip | TikTok / YouTube Shorts | Record 15-30 sec clip: dramatic boss fight or rare weapon drop. Caption: `POV: you just got the Legendary drop in Survive a Brainrot 😳🔥 #Roblox #SurviveABrainrot #BrainrotZombie` |
| **14:00** | 📢 "Did you know?" post | Discord #general | `🧠 DID YOU KNOW? There are 5 biomes in Survive a Brainrot, each with unique zombies. Biome 3 has the Sigma Boss — only appears after Day 30. How far have you gotten?` |
| **16:00** | 🎁 Daily Drop | Discord #drop-alerts | Feature an Epic weapon |
| **18:00** | 🏆 First leaderboard post | Discord #leaderboards | Manually post top 5 players by survival day. `🏆 WEEK 1 LEADERBOARD — Who's surviving the longest?` |
| **20:00** | 📢 Engagement question | Twitter/X | `What's the hardest boss you've faced in Survive a Brainrot? 🧟 Reply with your answer! #SurviveABrainrot #Roblox` |

---

### 🎯 DAY 4 — WEDNESDAY — April 1

**Theme:** COMMUNITY BUILDING. Focus on Discord growth and player interaction.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 📊 Mid-week metrics | Creator Dashboard | Trend check: CCU stable? Growing? Revenue pace? |
| **10:00** | 📢 Meme post | Discord #memes | Post a brainrot meme related to the game. Encourage community submissions: `Drop your best Survive a Brainrot memes below 🧟😂 Best one gets featured!` |
| **12:00** | 🎁 First redemption code | Discord #codes | Create a code in-game (if supported) or announce a secret: `🔑 FIRST EVER CODE: "BRAINROT1" — Redeem for 500 Survival Coins! Limited to first 100 uses 🏃‍♂️💨` |
| **14:00** | 📢 Guild recruitment push | Discord #general | `👥 GUILDS ARE LIVE! Create your squad, level up together, dominate the leaderboards. First guild to clear Day 50 gets shouted out! Use #looking-for-group to find teammates` |
| **16:00** | 🎁 Daily Drop | Discord #drop-alerts | Feature a different Rare weapon |
| **18:00** | 📹 Gameplay tip video | TikTok / YouTube Shorts | 15-sec clip: "How to build a 5-hit combo in Survive a Brainrot" — show the tap rhythm |
| **20:00** | 📢 Community challenge tease | Discord #events | `🎯 COMMUNITY CHALLENGE dropping Friday! Get ready to prove you're a real survivor... 👀` |

---

### 🔥 DAY 5 — THURSDAY — April 2

**Theme:** HYPE BUILDING. Tease Saturday update. Push for Legendary drop excitement.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 📊 Metrics review | Creator Dashboard | D3 retention check. Revenue trend. Bug report count |
| **10:00** | 📢 Saturday update tease #2 | Discord #updates + Twitter/X | `🔥 SATURDAY UPDATE PREVIEW: Something LEGENDARY is coming... 👀⚔️ #SurviveABrainrot` (follow Grow a Garden's Thursday announce pattern) |
| **12:00** | 🏆 Mid-week leaderboard update | Discord #leaderboards | Updated top 10 with progress since Day 3 |
| **14:00** | 📢 Weapon showcase | Discord #general | Feature a Legendary weapon with full stats: `⚔️ WEAPON SPOTLIGHT: [Legendary Weapon] — DPS: [X], Ability: [Y], Drop Rate: 0.5%. Only 3 players have found it so far. Will you be next?` |
| **16:00** | 🎁 Daily Drop — LEGENDARY | Discord #drop-alerts | `🌟 LEGENDARY DROP DAY! Today's featured weapon: [Name]. This is the real deal. Hunt it in Biome 4, waves 60+. Good luck, survivor. You'll need it. 💀` |
| **18:00** | 📹 Boss fight montage | TikTok / YouTube Shorts | Dramatic boss fight clip with trending audio |
| **20:00** | 📢 "Flex Friday" preview | Discord #general | `Tomorrow is FLEX FRIDAY — show off your best loot, highest day survived, or rarest weapon in #flex-your-loot! Best flex gets pinned 📌` |

---

### 💪 DAY 6 — FRIDAY — April 3

**Theme:** FLEX FRIDAY. Community showcase + community challenge launch.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 📊 Metrics review | Creator Dashboard | Week trend review. Prepare for Saturday update |
| **10:00** | 📢 FLEX FRIDAY launch | Discord #flex-your-loot + #general | `💪 FLEX FRIDAY IS HERE! Show us what you've got: rarest weapon, highest day, craziest kill combo. Best flex gets PINNED and shouted out! Drop your screenshots below 🏆` |
| **12:00** | 🎯 Community Challenge GO | Discord #events | `🎯 COMMUNITY CHALLENGE: SERVER-WIDE 10,000 ZOMBIE KILLS THIS WEEKEND! Every kill counts. If we hit the target by Sunday night, EVERYONE who played gets a reward code! Track progress: [manual counter or bot] 🧟🔥` |
| **14:00** | 📢 Challenge progress update | Discord #events | `🧟 KILL COUNT: [X]/10,000 — Keep going survivors! [Y]% of the way there!` |
| **16:00** | 🎁 Daily Drop — Epic | Discord #drop-alerts | Feature a different Epic weapon |
| **18:00** | 📢 Saturday tease FINAL | Twitter/X + Discord | `⏰ LESS THAN 24 HOURS until the first Survive a Brainrot update drops. Are you ready? 🔥🧟 #SurviveABrainrot` |
| **20:00** | 📹 Community highlight reel | Discord #general | Compile best Flex Friday submissions. React and hype them. |
| **22:00** | 🔧 Prep Saturday update | Studio | Whatever content drop is planned for Week 2 — get it ready to publish Saturday AM |

---

### 🎉 DAY 7 — SATURDAY — April 4

**Theme:** FIRST WEEKLY UPDATE. Follow the Saturday Rule (Grow a Garden model). This is the start of the recurring weekly cycle.

| Time (ICT) | Action | Platform | Details |
|---|---|---|---|
| **09:00** | 🔧 Publish Saturday update | Studio → Roblox | Push the update. Even if it's small (balance tweak, new cosmetic, QoL fix) — the update SIGNAL matters more than the size |
| **09:05** | 📢 UPDATE LIVE announcement | Discord #updates | `🚨 UPDATE V1.1 IS LIVE! 🚨\n\n[List changes]\n\n⭐ LIKE & FAVORITE the game for more updates!\n▶️ Play now: [GAME LINK]\n@Updates @everyone` |
| **09:10** | 📢 Update post | Twitter/X | `🧟 SURVIVE A BRAINROT — UPDATE V1.1 🔥\n\n[Key changes]\n\nPlay now → [GAME LINK]\n#SurviveABrainrot #RobloxUpdate #Roblox` |
| **10:00** | 🎁 Update celebration code | Discord #codes | `🔑 UPDATE CODE: "WEEK1" — Redeem for [reward]! Expires in 24 hours ⏰` |
| **12:00** | 📊 Post-update metrics | Creator Dashboard | CCU spike from update? New player influx? |
| **14:00** | 🎯 Challenge final push | Discord #events | `🧟 FINAL HOURS! Kill count: [X]/10,000 — We need [Y] more kills by midnight! PUSH PUSH PUSH! 🔥💀` |
| **16:00** | 🎁 Daily Drop — RIZZLORD TEASE | Discord #drop-alerts | `👑 THE RIZZLORD TIER EXISTS. 0.01% drop rate. The ultimate weapon. The ultimate flex. Only the chosen survive long enough to find it. Do you have what it takes? 💀🔥👑` |
| **18:00** | 📹 Week 1 recap video | TikTok / YouTube Shorts | 30-sec montage: launch highlights, community moments, stats |
| **20:00** | 📢 Week 1 stats celebration | Discord #general + Twitter/X | `📊 WEEK 1 STATS:\n🧟 [X] total plays\n⚔️ [X] zombies killed\n💀 [X] player deaths\n🏆 Highest day survived: [X]\n👥 [X] Discord members\n\nTHANK YOU for an incredible first week! Week 2 is going to be even crazier 🔥` |
| **22:00** | 🎯 Challenge results | Discord #events | `🎯 CHALLENGE RESULTS: [X]/10,000 kills! [PASS/FAIL]! [If pass: reward code dropping tomorrow!]` |

---

## 🔁 RECURRING DAILY SCHEDULE (After Week 1)

Once Week 1 is complete, this becomes the standing daily rotation:

| Time (ICT) | Action | Frequency |
|---|---|---|
| **09:00** | Metrics check (Creator Dashboard) | Daily |
| **10:00** | Community post (tip, question, showcase) | Daily |
| **12:00** | Content post (DevForum, social, video) | 3x/week |
| **14:00** | Engagement post (question, poll, challenge update) | Daily |
| **16:00** | Daily Drop in Discord #drop-alerts | Daily |
| **18:00** | Video content (TikTok/Shorts) | 2x/week |
| **20:00** | Evening community interaction | Daily |

### Weekly Rhythm (The Saturday Rule)
| Day | Role |
|---|---|
| Monday | Review weekend data. Plan week. |
| Tuesday | Update tease starts |
| Wednesday | Community focus (codes, events) |
| Thursday | Announce Saturday update details |
| Friday | Flex Friday + final hype |
| Saturday | **UPDATE DAY** — publish, announce, celebrate |
| Sunday | Community day — events, challenges, chill |

---

## 📱 SOCIAL MEDIA POST TEMPLATES

### Twitter/X Templates (rotate these)

**Hype posts:**
```
🧟 [X] survivors are fighting the brainrot apocalypse RIGHT NOW!
Can you survive longer than them?
▶️ Play: [GAME LINK]
#SurviveABrainrot #Roblox
```

**Engagement posts:**
```
What weapon are you running in Survive a Brainrot? ⚔️
🗡️ Katana
🔫 Plasma Bow
🪓 Sigma Axe
💀 Something else?
Reply below! #SurviveABrainrot
```

**Achievement posts:**
```
🏆 [Player] just survived to Day [X]!
That's top [Y]% of all players.
Think you can beat it? 💀🔥
▶️ [GAME LINK]
```

**Update posts:**
```
🚨 NEW UPDATE — Survive a Brainrot v[X]

✅ [Change 1]
✅ [Change 2]
✅ [Change 3]

Play now → [GAME LINK]
#SurviveABrainrot #RobloxUpdate
```

### Discord Templates

**Daily Drop:**
```
⚔️ DAILY DROP — [DATE]

🔥 Featured Weapon: [NAME]
⭐ Rarity: [TIER]
💥 DPS: [X]
🌟 Ability: [DESCRIPTION]
📍 Found in: [BIOME] — Waves [X-Y]

Hunt it down, survivor. 🧟
```

**Code Drop:**
```
🔑 NEW CODE ALERT!

Code: "[CODE]"
Reward: [WHAT YOU GET]
⏰ Expires: [WHEN]
👥 Limit: [X] uses

REDEEM FAST! 🏃‍♂️💨
```

**Leaderboard:**
```
🏆 WEEKLY LEADERBOARD — [DATE]

🥇 [Player 1] — Day [X]
🥈 [Player 2] — Day [X]
🥉 [Player 3] — Day [X]
4. [Player 4] — Day [X]
5. [Player 5] — Day [X]

Think you can climb? 💀⚔️
```

---

## 🎪 FIRST EVENT: "Brainrot Blitz" (Day 7, Saturday Evening)

**What:** 2-hour event window where zombie spawn rates are DOUBLED and a special boss appears.
**When:** Saturday 18:00-20:00 ICT (prime time for target audience)
**Why:** Creates urgency, shared experience, and a reason to be online at a specific time.

**Announcement schedule:**
- Thursday: Tease "Something big is happening Saturday evening..."
- Friday: Reveal "BRAINROT BLITZ — Double spawns, special boss, exclusive loot"
- Saturday AM: Reminder with countdown
- Saturday 17:50: "10 MINUTES until Brainrot Blitz!"
- Saturday 18:00: "IT'S GO TIME 🧟🧟🧟"
- Saturday 20:00: Results and stats

**If not ready for an in-game event:** Run it as a Discord-only challenge instead. "Most kills in 2 hours wins a shoutout + future in-game reward."

---

## 📊 ENGAGEMENT HOOKS — The Psychology

| Hook | What It Does | When to Deploy |
|---|---|---|
| **Daily Drop rotation** | FOMO — today's weapon is different from tomorrow's | Every day at 16:00 |
| **Redemption codes** | Drives Discord joins (codes only in Discord) | 2x/week |
| **Leaderboards** | Competition + social proof | 2x/week |
| **Community challenges** | Collective goal = shared identity | 1x/week |
| **Flex Friday** | User-generated content = free marketing | Every Friday |
| **Saturday updates** | "Recently updated" Roblox algo boost + return habit | Every Saturday |
| **Weapon teasers** | Collection desire + aspiration | Tied to daily drops |
| **Countdown hype** | Anticipation = engagement even when not playing | Thu-Sat before updates |
| **Player spotlights** | Recognition = loyalty | 2-3x/week |

---

## 🔗 CROSS-REFERENCES

| Document | What It Provides |
|---|---|
| `STORE-LISTING-COPY.md` | Social media post copy, hashtags, DevForum hook, thumbnail specs |
| `DISCORD-SERVER-SETUP-GUIDE.md` | Channel structure, bot setup, automation flows, Day 1 Discord checklist |
| `LAUNCH-DAY-PLAYBOOK.md` | Morning launch steps, Product ID creation, Studio publish flow |
| `DAY1-HOTFIX-PLAYBOOK.md` | Monitoring checklist, top 10 issues & fixes, economy levers, kill switches |
| `PostLaunchMonitorPlan.md` | Monitoring schedule, KPI targets, incident response tiers |
| `MONEY-PRINTER-PIPELINE.md` | 12-week content calendar, update cadence bible, monetization strategy |
| `GAME-BIBLE-DEPLOY-STATUS-FINAL.md` | Game stats, module status, feature list |

---

## ⚡ TL;DR — Week 1 in 7 Lines

1. **Day 1 (Sun):** LAUNCH. Publish, announce everywhere, monitor every 30 min, first daily drop.
2. **Day 2 (Mon):** Check D1 retention. DevForum post. First tip post. Fix top bugs.
3. **Day 3 (Tue):** First TikTok/Short. Leaderboard post. Tease Saturday update.
4. **Day 4 (Wed):** First code drop. Guild push. Meme content.
5. **Day 5 (Thu):** Legendary drop day. Saturday tease #2. Boss fight montage.
6. **Day 6 (Fri):** Flex Friday. Community challenge launch. Final Saturday hype.
7. **Day 7 (Sat):** FIRST UPDATE. Celebration code. RIZZLORD tease. Week 1 stats. First event.

**The engine:** Daily drops + Discord codes + Saturday updates + community challenges = players open the game every day and check Discord twice.

---

*Built by OB1 — Pulse Run 98 — 2026-03-29 06:00 ICT*
*Active Mission: LAUNCH-READY OVERNIGHT SPRINT (Action 7/8)*
*Artifact Class: 🔨 BUILD*
*🔴 CORRECTION APPLIED: Zero educational framing in all content*
*Cross-repo sources: 7 (STORE-LISTING-COPY, DISCORD-SERVER-SETUP-GUIDE, LAUNCH-DAY-PLAYBOOK, DAY1-HOTFIX-PLAYBOOK, PostLaunchMonitorPlan, MONEY-PRINTER-PIPELINE, GAME-BIBLE-DEPLOY-STATUS-FINAL)*
*Platform Death Test: PASS (this file is the artifact)*
