# 14 — MARKET INTELLIGENCE PROTOCOL

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / MONITORING
**Vault:** VAULT-ORACLE
**Classification:** OPERATIONAL — MARKET INTELLIGENCE

---

## Purpose

NET language schools compete in a real market. That market has competitors, demand cycles, teacher supply constraints, and pricing dynamics. Oracle tracks it all. This document defines what Oracle monitors in the Vietnam language school market, how market intel is gathered, and how it feeds decision-making in VAULT-NET-SEEDS.

**Market intelligence that doesn't drive a decision is noise. Oracle produces signal, not noise.**

---

## Competitor Monitoring

Oracle tracks the top-tier competitors in each NET franchise city.

| Competitor Tier | Description | Monitoring Target | Frequency |
|-----------------|-------------|-------------------|-----------|
| Tier 1 — National chains | ILA, IELTS Viet, Apax English (major chains) | Pricing, locations, enrollment promotions | Monthly |
| Tier 2 — Regional leaders | City-specific dominant schools | Course offerings, teacher quality signals, social media activity | Monthly |
| Tier 3 — Local independents | Neighborhood English centers | Pricing undercuts, local reputation changes | Quarterly |

**What to track for each competitor:**
- Published course pricing (compared to NET pricing)
- New location openings (signals demand in that area)
- Promotions and discount campaigns (pricing pressure signals)
- Teacher recruitment activity (signals teacher supply tightness)
- Online reviews (student satisfaction benchmark)
- Social media follower growth (brand strength signal)

**What NOT to do:** Oracle does not engage in any illegal competitive intelligence gathering. Public information only.

---

## Student Demand Signals

Oracle monitors leading indicators of student demand across NET cities:

| Signal | Source | Oracle Action | Frequency |
|--------|--------|---------------|-----------|
| IELTS exam registration volume | IDP, British Council Vietnam public data | Spike in registrations = demand surge upcoming | Monthly |
| University entrance exam calendar | Ministry of Education Vietnam | Pre-exam periods = peak tutoring demand | Quarterly planning |
| Corporate training RFP activity | LinkedIn Vietnam, business news | Corporate English training demand signals | Monthly |
| Zalo group enrollment inquiries | Agent-98 field monitoring | Real-time demand signals from Zalo education groups | Weekly |
| Google Trends: "học tiếng Anh [city]" | Google Trends | Search volume trend per city | Monthly |

When multiple demand signals spike simultaneously in a city: Oracle flags it as `DEMAND_SURGE` and alerts Agent-99. Agent-99 reviews whether current capacity can absorb the surge or whether emergency teacher deployment is needed.

---

## Teacher Supply Analysis

Teacher supply is a constraint that can kill a franchise launch or cap revenue growth. Oracle monitors:

- **CELTA certification course schedules** in each major Vietnamese city (British Council, IDP)
- **Facebook and Zalo teacher groups** (monitored by Agent-98) for supply/demand signals
- **Visa approval rates** for foreign English teachers (government policy changes)
- **Salary benchmarking** — NET teacher compensation vs market (if NET pays below market, supply dries up)

**Teacher supply alert thresholds:**
- If available certified teachers in a city drops below minimum launch requirement: `SUPPLY_WARNING` alert
- If a competitor is actively recruiting with premium salaries: `COMPETITIVE_THREAT` alert to Agent-99

---

## Revenue Opportunity Mapping by City

Oracle maintains a revenue opportunity score for each potential NET city based on:

1. **Population size** (larger = more potential students)
2. **GDP per capita** (higher = more willingness to pay)
3. **Competitor saturation** (lower saturation = easier entry)
4. **Demand signal strength** (current IELTS/university demand)
5. **Teacher supply availability** (can we staff a launch?)

| City | Opportunity Score (1–10) | Current NET Status | Next Review |
|------|-------------------------|--------------------|-------------|
| Ho Chi Minh City | 10 | Phase 1 ACTIVE | Monthly |
| Hanoi | 9 | Phase 1 ACTIVE | Monthly |
| Da Nang | 7 | Phase 2 PLANNING | Quarterly |
| Can Tho | 6 | Phase 2 PLANNING | Quarterly |
| Hue | 5 | Phase 3 PIPELINE | Quarterly |
| Nha Trang | 6 | Phase 3 PIPELINE | Quarterly |
| Hai Phong | 6 | Phase 3 PIPELINE | Quarterly |
| Vung Tau | 5 | Phase 4 FUTURE | Bi-annual |
| Bien Hoa | 5 | Phase 4 FUTURE | Bi-annual |

---

## How Market Intel Feeds VAULT-NET-SEEDS Decisions

Market intelligence is not stored in isolation. It directly feeds NET franchise decisions:

- **Demand surge detected:** → Agent-99 reviews capacity → If expansion needed, VAULT-NET-SEEDS updated with new student capacity targets → PHOENIXMASTERKEY required for structural changes
- **Competitor price cut:** → NET pricing strategy reviewed → Agent-100 decides on pricing response → VAULT-NET-SEEDS pricing docs updated
- **Teacher supply warning:** → Recruitment campaign initiated → Teacher certification incentives reviewed
- **New city opportunity score hits 7+:** → Agent-100 briefed → Feasibility assessment → Phase scheduling update in VAULT-NET-SEEDS

---

## Agent-99 Market Report Format

Monthly market report delivered to Agent-100 via Agent-99:

```
NET MARKET INTELLIGENCE REPORT
Month: [Month Year]
Cities active: [N]
Key findings:
  1. [Most important finding]
  2. [Second finding]
  3. [Third finding]
Demand status: [STABLE / GROWING / DECLINING] per city
Competitor activity: [Key moves by competitors this month]
Teacher supply: [ADEQUATE / TIGHT / CRITICAL] per city
Revenue vs target: [% performance per active city]
Recommended actions: [Top 3 specific actions for Agent-100 to consider]
```

**Reporting cadence:** Monthly delivery, first business day of each month.
