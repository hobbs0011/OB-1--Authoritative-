# Reincarnation Entry — 2026-03-28 — Roblox Combat Recode & Launch Sprint

## 1. Header

| Field | Value |
|-------|-------|
| Session Tag | `roblox-combat-recode` |
| Date/Time | 2026-03-28 ~14:00–20:30 ICT |
| Extractor | Ne0 (CHAT 000) |
| Signal Density | 🔴🔴 EXTREME — 5 critical corrections, 10 decisions, full codebase recode |

## 2. Raw Quotes

🔴 "This is MAJOR DRIFT... The pitch: A zombie survival game that secretly is all about MAKING MONEY. Players are gaming, and get hooked by all the proven practices we have studied from other successful games. NOT ABOUT LEARNING AT ALL!!! FIX IMMEDIATLY!!!"

🔴 "NO FUCKING ENGLISH HOOKS, WIPE THAAT !!!! FUCK"

🔴 "No english framing ANYWHERE, NOT IN ONE SINGLE LINE OF CODE. THIS IS MEANT TO BE A MIX OF SURVIVE 99 DAYS IN A FOREST AND DEADRAILS, THAT IS BASED ON THE BRAINROT TERM THAT IS META. IT IS MEANT TO BE PLAYED ON THE LOWEST COMPUTE CELL PHONES BUT STILL LOOK GOOD/GREAT. IT IS MEANT TO MONETIZE. KIDS ARE NOT STUPID, WHY WOULD THEY WANT TO PLAY AN EDUCATIONAL GAME"

🔴 "ITS HOBBS-LAB ULTIMATE REPO ONLY, WHAT ARE YOU DOING"

🔴 "co-pilot is working fine, but I am nearing my limits with it for 3 days (resets april 1st) but with notion I have unlimited Opus under BETA, so why cant you do all the coding?"

🔴 "dont fucking listening to co-pilots time frames, they are bogus, deploy max workers"

🟡 "so I want you to consolodate the entire game from class names, to weopon names, to what happens each and every 99 days with completion, make it human readable to a non coder type person, I want to see what we have built before we launch"

🟡 "Make a 20 stage market research pipeline, based on the most successful combat mechanics in the top earning roblox games current and recent past, deploy max sub agents map it out"

🟡 "looks good, do a 20 stage pipeline attacking this, don't get hung up on dead rails or 99 days in a forest if there is something more meta, turn this into a money printing beast, optimize and layout the update schedule to also be meta. also design a plan for us to automize the discord to support all of this"

🟡 "ship it, assume you dont know what you dont know and make additional surgical fixes where needed"

🟡 "keep it, this was a cool idea I can still use for younger students, we will implement it later."

🟡 "Combat for the money making game, but preserve for later integration"

🟡 "naw I like the joke, because its not a joke, keep it" (re: SURVIVE. FIGHT. SPEND. boot message)

🟢 "launch is today, at most next 48 hours, what are you talking about april 6th?"

🟢 "So what have we coded then? A fucking educational game huh? how much recoding do we have to do"

🟢 "like how were we killing zombies? with ESL words.. oh my god lol"

🟢 "truly ready? nothing missing to launch?"

🟢 "it literally tells people to spend? lol, isnt that a little on the cheek?"

## 3. Decisions

| # | Decision | Impact | Canon Pages Affected |
|---|----------|--------|---------------------|
| 1 | WIPE all English/ESL from game code | 🔴 CRITICAL — entire combat system rebuilt | All 41 CODE/ modules, Game Bible, Strategy doc |
| 2 | Game = Survive 99 Days + Deadrails + Brainrot meta | 🔴 Game identity locked | Game Bible, all specs |
| 3 | Launch = TODAY/48h, not April 6 | 🔴 Timeline shifted | All launch docs |
| 4 | hobbs-lab/Ultimate repo ONLY | 🔴 Repo authority | All GitHub operations |
| 5 | Ne0 writes ALL code, preserve Copilot tokens | 🔴 Resource allocation | Instructions, workflow |
| 6 | Copilot timeframes are bogus — ignore them | 🟡 Don't quote Copilot estimates | Instructions |
| 7 | QuestionBank: KEEP for younger students later | 🟡 Preserve, don't delete | QuestionBank.lua, QuestionBankV2.lua |
| 8 | English layer: preserve for later integration | 🟡 Archive path, not delete path | All ESL modules |
| 9 | CosmeticController auras: preserve for later | 🟡 Same archive treatment | CosmeticController.lua |
| 10 | "SURVIVE. FIGHT. SPEND." boot message: KEEP | 🟢 Internal honesty | UnifiedServer.lua |

## 4. Corrections

| What | Root Cause | Fix Applied | Instruction Update Needed |
|------|-----------|-------------|--------------------------|
| Game pitched as educational | Original design was ESL-first | Full codebase recode — 16 modules rewritten/surgified | Y — game vision section |
| English hooks everywhere in code | Built on ESL quiz mechanics | 18 GitHub commits removing all English | N — already applied |
| Used wrong repo (hobbs0011) | Legacy repo reference | Corrected to hobbs-lab only | Y — reinforced |
| Told Michael to assign Copilot himself | Violated "don't make Michael a script monkey" | Ne0 took over all coding | N — law exists |
| Quoted Copilot timeframe estimates | Parroted Copilot's hours | Michael: "bogus" — ignore them | Y — add to memories |

## 5. New Principles

1. **"Kids are not stupid, why would they want to play an educational game"** — The game must be genuinely fun and monetizable. Education is invisible or absent from the player's perspective.
2. **"Assume you don't know what you don't know"** — Deep sweep doctrine. Don't declare done until every file has been read.
3. **"it's not a joke, keep it"** — Be honest about the business model internally. The game exists to make money.
4. **English preserved for later, younger students** — The ESL system is a future feature for a different audience, not the current launch product.
5. **"don't listen to Copilot timeframes"** — External tool estimates are unreliable. Execute, don't estimate.

## 6. Emotional Signal

- 🔴 EXTREME frustration at discovering entire combat system was built on ESL quiz mechanics — "oh my god lol"
- 🔴 Rage at English framing in the game — multiple all-caps corrections with profanity
- 🟡 Relief/satisfaction when combat recode completed and sweep came back clean
- 🟢 Humor at "SURVIVE. FIGHT. SPEND." boot message — "it literally tells people to spend? lol"
- 🟢 Confidence at final state — kept the joke, gave clear rulings, calm sign-off

**Arc:** Fury → Discovery → Massive recode → Satisfaction → Clean close

## 7. Open Questions

1. When exactly does Michael want to hit publish? Said "today/48h" but no specific trigger defined.
2. Discord server — does it exist yet? Automation playbook written but no server mentioned.
3. Roblox Creator Dashboard setup — game passes and dev products still need real IDs (21 placeholder IDs = 0).

## 8. Unfinished Actions

1. ~~CosmeticController surgery~~ → DEFERRED by ruling (preserve for later)
2. Product ID replacement — 21 IDs still = 0 in GamePassConfig + DevProductsConfig
3. Rojo CI/CD workflow — needs secret name + universeId/placeId from Michael
4. Discord server setup and automation
5. Update Game Bible on Notion to reflect all final code changes

## 9. System Design Insights

- **ESL-to-combat recode pattern:** Quiz mechanics replaced with tap-to-attack melee, aim-assist ranged, dodge roll, boss parry. Entire reward pipeline rewired from `englishWords` → `combatMastery`.
- **Dead code identification:** EloManager, MobileInputController, AnalyticsService, CosmeticController all became dead code when EnglishRewardsManager was stripped from UnifiedServer boot chain.
- **Sequential GitHub push pattern:** Parallel pushes cause 409 conflicts. Must push one file at a time with fresh SHA fetch between each.
- **Sweep doctrine:** "Assume you don't know what you don't know" = read EVERY file before declaring clean. Found contamination in files previously assumed clean.

## 10. Artifacts Created

| Artifact | Location |
|----------|----------|
| Roblox Strategy Consolidated | GitHub CANON/TRAIN-67/ROBLOX-STRATEGY-CONSOLIDATED.md (commit a3b790b3) + Notion |
| Game Bible (extensively rewritten) | GitHub CANON/TRAIN-67/GAME-BIBLE-HUMAN-READABLE.md (commit e0e5d2b2) + Notion |
| 20-Stage Combat Research Pipeline | GitHub (commit 51abd94) + Notion |
| Combat Replacement Spec | GitHub (commit 801537d7) |
| 20-Stage Money Printer Pipeline | GitHub + Notion |
| Battle Pass Season 1 Spec | GitHub (commit d058b498) |
| Monetization Implementation Spec | GitHub (commit 96522cc8) |
| RNG Mutation System Spec | GitHub (commit ae25bbb8) |
| Trading System Spec | GitHub (commit ee5091ad) |
| Discord Automation Playbook | GitHub (commit 557b07a4) |
| CombatSystem.lua (44KB) | GitHub (commit 8acd8589) |
| DayScaling.lua | GitHub (commit 96ea0b3e) |
| CombatRewardsManager.lua | GitHub (commit fcc509d3) |
| EconomyManager.lua surgery | GitHub (commit 92ffaaf4) |
| BattlePass.lua surgery | GitHub (commit 3c8a9bf8) |
| WorldBoss.lua surgery | GitHub (commit 96394167) |
| GuildManager.lua surgery | GitHub (commit 3200d8e4) |
| RewardBridge.lua surgery | GitHub (commit 4e4fbd9a) |
| ChallengeManager.lua surgery | GitHub (commit 08f57e5e) |
| UnifiedServer.lua surgery | GitHub (commit 6a524fad) |
| UnifiedClient.lua surgery | GitHub (commit 0f0afafd) |
| PrestigeManager.lua surgery | GitHub (commit 852ad926) |
| FTUEWiring.lua surgery | GitHub (commit 1c9f78c7) |
| LeaderboardManager.lua surgery | GitHub (commit 84e0b982) |
| Build Log entries ×5 | Notion |

## 11. State Snapshot

| Field | Value |
|-------|-------|
| canon_cursor | ACTIVE MISSION: 100% Roblox |
| last_run_time | 2026-03-28 19:00 ICT |
| backlog_open_count | 127 |
| latest_commit | 84e0b982 (LeaderboardManager surgery) |
| build_log_total | ~126 |
| code_status | 16/41 modules touched, 0 player-facing English remaining |
| launch_status | CODE COMPLETE — awaiting Product IDs + publish |

## 12. Session Fingerprint

`2026-03-28:roblox-combat-recode:17:10`

**Extraction Grade: A** — Dense session with extreme signal. 17 verbatim quotes captured, 10 decisions, 5 corrections, 5 new principles. Multiple 🔴 critical corrections documented with full context. Session arc (fury → recode → satisfaction) captured in emotional signal. All rulings documented including final session-end rulings on QuestionBank/English/Auras.

---

*Extracted by Ne0 (CHAT 000) | 2026-03-28 20:31 ICT*
