# PHEROMONE TRAIL — SCORING SYSTEM v3: EXTENDED RANGE +110/-110
**Date:** 2026-06-17T00:57 ICT
**Strength: 100/100** | Type: DIRECTIVE — scoring system refinement, priority escalation

---

## §1 USER PROPOSAL

**Verbatim:** "btw 110/100 -110/100 exists as well, to give some wiggle room for absolute next step trails as to not get lost in the soon to be probably thousands or hundreds of thousands or who the heck knows amount of 100/100 Phetrails that are properly scored."

**Key insight:** As the phetrail network grows to thousands/hundreds of thousands of trails, +100 and -100 will become crowded. We need tiers ABOVE and BELOW the existing extremes for hands-down priorities.

**Examples given:**
- Cursor not working = needs immediate attention
- Claude going down = needs immediate attention
- These are "absolute next step" trails

---

## §2 THE PROBLEM WITH JUST -100 TO +100

**Crowding at the extremes:**
- Every verified trail = +100 → +100 becomes meaningless
- Every critical threat = -100 → -100 loses urgency gradient
- No way to signal "THIS IS THE NEXT THING TO DO"

**The +100/100 vs 100+/100 question:**
- `110/100` = clean numeric extension
- `100+/100` = semantic ("above canonical")
- `100-/100` = semantic ("below critical")

**My preference:** Use **110/100 and -110/100** as the extended range. It's:
- Numerically consistent with the -100 to +100 system
- Easy to parse in code/search
- Visually distinct (the 110 stands out)
- Allows future extension to 120/120 if needed

---

## §3 PROPOSED v3 SCORING LADDER

```
+110  CANONICAL++      Hands-down absolute priority, next step, do not lose
+100  CANONICAL        Verified, reverified, consensus — the "100s" crowd
+50   CRITICAL         Highly relevant, currently active road
+20   USEFUL           Supporting trail, worth keeping
+10   HELPER           Fallback, minimal standalone value
0     NEUTRAL          Nothing of interest, filter from search
-10   WATCH            Important info, needs care and improvement
-50   THREAT           Significant risk, needs attention soon
-100  CRITICAL THREAT   Major stinker, rotting, dangerous — attack ASAP
-110  CRITICAL++       Absolute emergency, even worse than -100, hands-down priority
```

---

## §4 WHAT GETS +110 vs +100

**+100 (CANONICAL):** Verified trails that are important but not immediately actionable
- Cloudflare tunnel architecture
- KiloClaw plugin inventory
- Secrets exposure (important but not actively burning)

**+110 (CANONICAL++):** Hands-down next-step priorities
- Cursor not working (immediate blocker)
- Claude death (immediate impact on operations)
- Mouse failure correlated with Claude death (active incident)
- C: drive at 7.3GB (causing system freezes RIGHT NOW)

**The difference:**
- +100 = "this is important, keep it visible"
- +110 = "if you're starting a new session, THIS is what you do first"

---

## §5 WHAT GETS -110 vs -100

**-100 (CRITICAL THREAT):** Major threats that need attack ASAP
- ProtonVPN layered persistence (needs nuclear cleanup)
- ASUS AURA SYNC crashes (annoying but not emergency)

**-110 (CRITICAL++):** Absolute emergencies
- Active system freeze causing data loss
- Network compromise in progress
- Secrets actively being exfiltrated
- Ransomware detonating

**The difference:**
- -100 = "schedule cleanup soon"
- -110 = "DROPPING EVERYTHING, THIS IS BURNING"

---

## §6 SCORING EXAMPLES FROM THIS SESSION

| Trail | Score | Reasoning |
|-------|-------|-----------|
| Mouse failure + Claude death correlated | +110 | Active incident, immediate impact |
| Claude OAuth death | +110 | Blocked operations, needs fix |
| Scout mission mandate | +100 | Canonical directive, verified by user |
| Real-time secretion mandate | +100 | Canonical directive |
| KiloClaw architecture clarified | +100 | Verified, foundational |
| Cloudflare tunnel strategy | +100 | Canonical, verified |
| C: drive crisis (7.3GB) | +110 | Causing freezes RIGHT NOW |
| VeePN layered persistence | -100 | Major threat, needs nuclear cleanup |
| Secrets in plaintext | -50 | Important, needs mitigation plan |
| OpenClaw Gateway startup | +20 | Useful context |
| Empty delivery queues | 0 | Nothing there, filter out |
| Config audit log JSONL | -10 | Wrong format, needs better extraction |

---

## §7 SEARCH FILTERING IMPLICATIONS

**Default search:** Show +20 and above
**Priority search:** Show +50 and above
**Emergency search:** Show +110 and -110 only
**Threat hunt:** Show -10 and below
**Full recon:** Show everything except 0

---

## §8 USER FEEDBACK REQUEST

**The user explicitly said "I just made this up off the top of my head, so this is theory not gospel, but unless you have pushback, which I love it when you do because it means you are thinking"**

**My pushback/questions:**
1. Is 110/-110 the right range? Or should we go higher (120/120) for even more headroom?
2. Should +110/-110 require a different marker in the filename for visual scanning?
3. Should we have a "review cycle" where +110 trails get re-evaluated and downgraded to +100 once the emergency passes?
4. What about +75? We have +50 and +20 — is +75 needed for "very relevant but not critical"?

**But honestly:** The system is solid. The +110/-110 extension solves the real problem of priority signaling in a massive trail network. The rest is tuning.

---

`SCORING SYSTEM v3 PROPOSAL SEALED — 2026-06-17T00:57 ICT | STRENGTH: 100/100 | +110/-110 EXTENSION PROPOSED | PRIORITY ESCALATION | AWAITING USER FEEDBACK`
