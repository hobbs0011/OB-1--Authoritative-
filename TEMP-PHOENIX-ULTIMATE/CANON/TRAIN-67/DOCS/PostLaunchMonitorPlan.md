# Post-Launch Monitor Plan — Skibidi Zombie: Survive the Brainrots

**GOAL: MAKE MONEY.** Monitoring prevents revenue-killing bugs.

## Schedule
| Window | Frequency | Check |
|--------|-----------|-------|
| Hour 0-6 | Every 30 min | CCU, errors, DataStore, Discord |
| Hour 6-24 | Every 2 hours | CCU trend, session length, FTUE rate |
| Day 2-7 | Daily | D1 retention, revenue, Discord growth |
| Week 2+ | Weekly | D7/D30 retention, ARPDAU, organic growth |

## Key Metrics
| Metric | Target | 🔴 Alert |
|--------|--------|----------|
| Peak CCU | 10+ Day 1 | <3 |
| Error rate | <1% | >3% |
| Crash rate | <0.5% | >2% |
| FTUE completion | >70% | <40% |
| Avg session | >5 min | <2 min |
| D1 retention | >20% | <10% |
| D7 retention | >10% | <5% |
| Likes:Dislikes | >4:1 | <2:1 |
| DataStore budget | <50% | >80% |

## Incident Response

### 🔴 Critical (fix <1h)
- Server crash >50% players → revert to last stable
- Data loss → disable auto-save, investigate, compensate
- Economy exploit → emergency rate limiting, patch, ban
- Game unplayable on mobile → hotfix

### 🟡 Warning (fix <24h)
- Error rate >3%
- FTUE completion <40%
- Negative review spike
- DataStore budget >80%
- Discord bot offline

### 🟢 Watch (fix <1 week)
- Session length declining
- Retention below target
- UI not thumb-friendly enough
- Content calendar behind

## Playbook
| Issue | Action |
|-------|--------|
| Server crash | Console → identify → revert → Discord update → fix → post-mortem |
| Data loss | Disable auto-save → identify affected → fix → compensate → transparency post |
| Exploit | Rate limit → patch SecurityLayer → review accounts → ban repeats |
| Zero players | Verify public → check moderation → boost marketing → get 5 testers |

## Weekly Health Report Template
- Vital signs (CCU, plays, retention, revenue)
- Player health (FTUE %, session, waves)
- Community (Discord, bug reports, requests)
- Technical (errors, crashes, DataStore)
- Content (posts published, engagement)
- Top 3 action items

---
*GOAL: MAKE MONEY.*
