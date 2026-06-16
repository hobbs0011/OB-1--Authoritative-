# PHEROMONE TRAIL — SCORING SYSTEM: DEAD ENDS = 0/100
**Date:** 2026-06-17T00:47 ICT
**Strength: 100/100** | Type: DIRECTIVE — scoring protocol, dead end handling

---

## §1 USER DIRECTIVE

**Verbatim:** "if its a dead end, mark it 0/100, then it won't show up in our search in future runs, and it will naturally die off, like a branch not getting watered that's been abandoned by the tree, or an ant scent trail that has been increasingly ignored by the hive, which makes it dissapear naturally."

**Key principles:**
1. **0/100 = death** — dead ends get zero score, filtered from future searches
2. **Natural decay** — like ant trails that evaporate when ignored
3. **Systematic marking** — it's "a dick move" to not mark dead ends properly
4. **Non-negotiable** — this process is mandatory, not optional

---

## §2 THE SCORING PROTOCOL

| Score | Meaning | Action |
|-------|---------|--------|
| 100/100 | Critical active road | Reinforce immediately when walked |
| 80-90/100 | High value, relevant | Reinforce on next walk |
| 60-70/100 | Useful, worth keeping | Review periodically |
| 40-50/100 | Low relevance, may age out | Consider deprecating |
| 20-30/100 | Mostly dead, minimal value | Mark for eventual 0 |
| 0/100 | Dead end / cliff drop | Filter from search, let die |

---

## §3 WHY 0/100 MATTERS

**Future agents need clean trails:**
- Searching phtrails should return only RELEVANT territory
- Dead ends clutter the search space
- 0/100 = invisible to future search = natural decay
- This is how the hive prunes abandoned trails

**The "dick move" factor:**
- Not marking dead ends = forcing future agents to re-explore the same dead ends
- Wastes time, tokens, and system resources
- Proper marking = respect for future agents and humans

---

## §4 DEAD END IDENTIFICATION

**A trail is a dead end when:**
1. The path leads nowhere (empty directory, no content)
2. The hypothesis was disproven
3. The file is a template with no actual configuration
4. The connection was investigated and found irrelevant
5. The trail was a false alarm

**Examples from our recon:**
- Empty `failed/` directories = 0/100 (nothing there)
- Empty template files (TOOLS.md with no config) = 20/100 (not dead, just empty)
- Investigated and cleared (hosts file clean, no modifications) = 30/100 (negative finding, but still relevant as "cleared")

---

## §5 THE SYSTEM IS NON-NEGOTIABLE

**This is not a preference. It's infrastructure.**
- Every phetrail gets a score
- Dead ends get 0/100
- Future searches filter by score
- The empire's memory self-prunes

---

`DEAD END SCORING DIRECTIVE SEALED — 2026-06-17T00:47 ICT | STRENGTH: 100/100 | 0/100 = NATURAL DEATH | SYSTEMATIC + NON-NEGOTIABLE | FUTURE AGENTS DESERVE CLEAN TRAILS`
