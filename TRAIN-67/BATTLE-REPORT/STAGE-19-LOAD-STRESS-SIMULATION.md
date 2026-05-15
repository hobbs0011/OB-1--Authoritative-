# BATTLE Stage 19 — Load & Stress Simulation

**Date:** 2026-03-26
**Tester:** Agent-99 (OB1)
**Scope:** Theoretical load analysis — what happens when real users hit each system
**Limitation:** Cannot run actual load tests (no HTTP tools, no Roblox Studio access)

---

## Executive Summary

**GRADE: D+ (Multiple Single Points of Failure)**

The system has several components that will fail under modest load. The primary bottlenecks are Roblox DataStore limits, single-server Cloudflare Worker architecture, and zero caching at every layer.

---

## Load Scenarios

### Scenario 1: Roblox Game — 50 Concurrent Players

| Component | Load | Limit | Will It Break? |
|---|---|---|---|
| GameMain server script | 50 players | No hard limit | ⚠️ Performance degrades — no enemy cap means unlimited enemy spawns |
| DataStore reads | 50 GetAsync calls on join | 60 req/min + 10/player/min | ✅ Within limits (barely) |
| DataStore writes | 50 UpdateAsync calls | Same limits | 🔴 UpdateAsync overwrites (data loss on concurrent saves) |
| Enemy spawning | 50 × enemy spawn rate | No cap in code | 🔴 Server lag — hundreds of enemies with no cleanup |
| MainServer_v2 | 50 parallel DataStore calls | Same budget split across 2 servers | 🔴 Double the DataStore consumption for no benefit |
| HUD updates | 50 clients × HUD refresh rate | Client-side, no server impact | ✅ Fine |
| Anti-cheat (AnomalyDetector) | 0 checks | Disconnected | 🔴 Every player can cheat freely |

**Verdict: WILL BREAK at 30+ players.** DataStore budget exhaustion + enemy leak + no anti-cheat.

**Fix priority:**
1. Enemy cap (hard limit of 20-30 per server)
2. Disable MainServer_v2 (stop wasting DataStore budget)
3. Implement DataStore queue with retry logic
4. Connect AnomalyDetector

### Scenario 2: Roblox Game — 200 Concurrent Players (4 servers)

| Component | Load | Will It Break? |
|---|---|---|
| DataStore | 200 players across 4 servers, all hitting same keys | 🔴 CRITICAL — UpdateAsync race conditions, data corruption |
| Matchmaking | Standard Roblox teleport | ✅ Roblox handles this |
| Economy | 200 players killing enemies, earning currency | 🔴 No server validation — currency fabrication at scale |
| Leaderboards | Dormant | ❌ N/A |
| Trading | Dormant | ❌ N/A |

**Verdict: DATA CORRUPTION GUARANTEED.** UpdateAsync without proper merge logic means last-write-wins across servers.

### Scenario 3: NET Website — 1,000 Visitors/Day

| Component | Load | Will It Break? |
|---|---|---|
| Static HTML | 1,000 page loads | ✅ Static files handle unlimited traffic if CDN-served |
| Cloudflare CDN | Standard | ✅ Cloudflare handles millions |
| No server-side logic | N/A | ✅ Nothing to break |
| OBI link to .net | 1,000 clicks → Worker | ⚠️ Depends on Worker limits (see below) |

**Verdict: Website itself is fine.** It's static HTML. The risk is the OBI Worker behind it.

### Scenario 4: OBI Cloudflare Worker — 500 Requests/Day

| Component | Load | Limit | Will It Break? |
|---|---|---|---|
| Worker invocations | 500/day | 100,000/day (free tier) | ✅ Way under limit |
| DeepSeek API calls | 500/day | Rate limit dependent | ✅ Likely fine |
| Deepgram API calls | ~100 voice/day | Usage-based pricing | ✅ Fine at this scale |
| Worker CPU time | 500 × ~2s per request | 10ms CPU per request (free), 50ms (paid) | 🔴 AI proxy likely exceeds 10ms CPU |
| Concurrent connections | Peak: ~20 simultaneous | No hard limit on Workers | ✅ Fine |

**Verdict: Needs paid Worker plan ($5/mo).** Free tier CPU limit will cause timeouts on AI responses.

### Scenario 5: Discord Server — 500 Members

| Component | Load | Will It Break? |
|---|---|---|
| Discord infrastructure | Standard | ✅ Discord handles millions |
| OBI Bot (custom) | ~200 commands/day | Rate limit: 50 req/10s per guild | ✅ Fine |
| XP Bot (MEE6) | ~500 messages/day | Standard MEE6 limits | ✅ Fine |
| Voice channels | ~20 concurrent speakers | No limit | ✅ Fine |
| Webhook (GitHub → Discord) | ~10/day | 30/min limit | ✅ Fine |

**Verdict: Discord will handle this easily.** The platform scales well.

### Scenario 6: Content Pipeline — 10 Posts/Day

| Component | Load | Will It Break? |
|---|---|---|
| Template rendering | 10 images/day | Cloudflare Browser: 2 req/min free | ⚠️ Tight but workable |
| DeepSeek for content | 10 generations/day | Way under limits | ✅ Fine |
| GitHub pushes | 10 commits/day | No practical limit | ✅ Fine |
| Social media posting | 10 posts/day across platforms | Platform limits vary | ✅ Fine |

**Verdict: Fine at this scale.** Only concern is Browser Rendering API rate limit.

---

## Single Points of Failure (SPOF)

| SPOF | Impact if Down | Redundancy | Fix |
|---|---|---|---|
| Cloudflare Worker (OBI) | OBI completely offline | None | Add health check + fallback static response |
| DeepSeek API | OBI can't generate responses | None | Add fallback to local response templates |
| Deepgram API | Voice features offline | None | Graceful degrade to text-only |
| GitHub (repos) | No code deployment | None | Local backups exist (Michael's machine) |
| Roblox DataStore | Game data inaccessible | None | Implement retry + local cache |
| Michael's Cloudflare account | Everything goes down | None | Document recovery procedures |
| DNS (domain registrar) | Sites unreachable | None | Document registrar access |

---

## Scaling Roadmap

| Scale | Players | Discord | Website | Monthly Cost |
|---|---|---|---|---|
| **MVP** | 10-50 | 50-100 | 100/day | $5-20 |
| **Growth** | 50-200 | 500-1,000 | 1,000/day | $20-50 |
| **Scale** | 200-1,000 | 5,000+ | 10,000/day | $50-200 |
| **Enterprise** | 1,000+ | 10,000+ | 100,000/day | $200-500 |

### What Needs to Change at Each Scale

**MVP → Growth:**
- Fix DataStore merge logic (prevent corruption)
- Add enemy cap and cleanup
- Connect anti-cheat
- Upgrade Worker to paid plan

**Growth → Scale:**
- Implement proper DataStore queue with ProfileService or similar
- Add GameAnalytics for telemetry
- Set up CDN for game assets
- Add database for cross-platform identity

**Scale → Enterprise:**
- Multiple Worker instances with load balancing
- Dedicated DeepSeek/Deepgram enterprise plans
- Roblox MessagingService for cross-server events
- Proper CI/CD with staging environment

---

## Chaos Engineering Recommendations

Tests Michael should run before launch:

| Test | How | Expected Outcome |
|---|---|---|
| Kill the Worker | Disable Worker in Cloudflare dashboard | OBI should fail gracefully, not crash |
| Revoke DeepSeek key | Temporarily remove secret | OBI should return "I'm temporarily unavailable" |
| Spawn 100 enemies | Remove enemy cap (if implemented) | Server should not crash |
| Dual save | Two scripts write to same DataStore key simultaneously | Data should merge, not overwrite |
| Network disconnect mid-save | Close Roblox Studio during DataStore write | Data should not corrupt |
| Invalid webhook payload | Send malformed JSON to Discord webhook | Bot should log error, not crash |
| Rate limit slam | Send 100 OBI commands in 10 seconds | Rate limiter should throttle, not crash |
