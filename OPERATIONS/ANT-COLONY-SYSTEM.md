# ANT COLONY SYSTEM — MOLD + NET-PET-AI TRANSLATION

**Status:** FOUNDATION (5%) — engine `src/ant-colony.js` landed, design + wiring in progress.
**Authority:** This is the "mold" Michael handed down — plagiarize it into NET-PET-AI. No lawyers. Ants don't either.
**Guiding light:** pheromones are a *biological mechanical* system, not an intelligence thing. They do not require conscious thought. They cannot lie. They amplify whatever cards are dealt. They eliminate luck by making failure mechanically impossible (evaporation prunes losers; reinforcement makes winners inescapable).

---

## PART I — THE MOLD (most accurate studies on ants)

All citations verified. Ordered by foundational weight.

1. **Grassé, P.-P. (1959).** *La reconstruction du nid et les coordinations interindividuelles… la théorie de la stigmergie.* Insectes Sociaux 6:41–80. DOI:10.1007/BF02223791.
   → Coined **stigmergy**: work performed by an agent leaves a trace in the environment that stimulates the next agent's work. No planning, no control, no direct communication. Solves the "coordination paradox" — how near-zero-intelligence insects build cathedrals. **This is the root.**

2. **Goss, S., Aron, S., Deneubourg, J.-L., et al. (1989).** *Self-organized shortcuts in the Argentine ant.* Naturwissenschaften 76:579–581.
   → The double-bridge experiment. Shorter paths accumulate more pheromone (traveled more often) → **positive feedback** → colony converges on the shortest route. The canonical "ants find the optimal path without knowing geometry" proof.

3. **Dreyer, T., et al. (2024).** *Comparing cooperative geometric puzzle solving in ants versus humans.* PNAS. DOI:10.1073/pnas.2414274121. (Weizmann Institute, O. Feinerman lab; *Paratrechina longicornis* — longhorn crazy ants.)
   → The 2024 study the brief pointed at. Ant groups **outperformed individual ants AND humans** at moving a T-shaped object through a maze, *especially in larger groups / when human communication was suppressed*. Emergent **collective memory** — they persist in a direction and avoid repeated mistakes. "Although individual ants cannot grasp the global nature of the puzzle, their collective motion translates into emergent cognitive skills." Humans in groups (no talk) dropped to worse-than-individual via "greedy" groupthink. **Direct proof that the swarm beats the smart individual when communication is cheap-but-fragile.**

4. **Feinerman, O. & Korman, A. (2017).** *Individual versus collective cognition in social insects.* J. Exp. Biology 220(1):73–82. DOI:10.1242/jeb.143891.
   → Distinguishes individual insect cognition from colony-level computation. Relevant: individual ants are cognitively capable yet the colony leverages *amplification of individual signal*, not individual brilliance.

5. **Dorigo, M., Maniezzo, V., Colorni, A. (1996).** *The ant system: optimization by a colony of cooperating agents.* IEEE Trans. Systems, Man, Cybernetics B 26(1):29–41. → **Ant Colony Optimization (ACO)** — the algorithmic mold. Deposit/evaporate/reinforce over a graph.

6. **Bonabeau, E., Dorigo, M., Théraulaz, G. (1999).** *Swarm Intelligence: From Natural to Artificial Systems.* Oxford University Press.

7. **Detrain, C. & Deneubourg, J.-L. (2008).** *Collective decision-making and foraging patterns in ants.* Annual Review of Entomology 53:155–175.

8. **Heylighen, F. (2016).** *Stigmergy as a universal coordination mechanism.* Cognitive Systems Research 38:4–13. DOI:10.1016/j.cogsys.2015.12.002.

---

## PART II — WHAT THE MOLD DEMANDS (translated to operating law)

| Ant law | NET-PET-AI translation |
|---------|------------------------|
| Pheromone deposit is **automatic**, not a decision | Coaching wins deposit a trail mechanically at the moment of the win. No "should I log this?" — logging IS the mechanic, like breathing. |
| Trails are **global to the colony**, not per-ant | Trails keyed by **coaching domain** (`th_sound`, `past_tense`, `word_stress`…), NOT per student. A win by *any* student reinforces the trail for *all* students in that domain. Cross-student amplification = the whole point. |
| **Positive feedback** → shortest path wins | Successful coaching actions accumulate weight; the router (`selectAction`) biases toward high-weight actions. Losers get no deposit. |
| **Evaporation** prunes neglected trails | `evaporate()` decays all weights on a 7-day half-life and deletes sub-threshold trails. A technique that stops producing wins vanishes. Mechanical forgetting = no rot. |
| Ants **cannot lie** | Trails are written from *measured outcomes* (phoneme mastery crossing threshold, breakthrough recorded), never from self-congratulatory narrative. Truth propagates; deception cannot be deposited. |
| **No top-down planning** | No central "best practice" committee. The swarm's aggregate deposits ARE the strategy. Emergent, like Dreyer's ants. |
| **Eliminate luck via mechanical impossibility** | Failure to reinforce = automatic evaporation. There is no path where a dead technique stays alive on vibes. Luck removed by construction. |

---

## PART III — ARCHITECTURE (5% foundation)

**New module:** `src/ant-colony.js`
- `ensureColonySchema` / `seedDomainActions` — D1 `pheromone_trails` table (lazy CREATE IF NOT EXISTS, matches Workers idiom), seeded with default candidate actions per domain.
- `depositTrail({segment, action, weight})` — UPSERT, adds weight, stamps `last_deposit_ts`.
- `depositFromBreakthrough(text, weight=2)` — reuses `memory-brain.extractWeaknesses` to derive the domain, deposits on win. Mechanical.
- `evaporate({halfLifeDays=7})` — decay + prune. Runs on cron.
- `getTrailMap(segment)` — sorted trails (the visible pheromone map).
- `selectAction({segment, candidates, exploreRate=0.1})` — weighted-random; 10% explore so the swarm keeps sampling; 90% exploit winning trails.
- `runColonyLoop(env)` — ensure + seed + evaporate. Idempotent, cron-safe.

**Wiring (this pass):**
- `index.js` imports `runColonyLoop`, `depositFromBreakthrough`, `selectAction`.
- Scheduled: `runColonyLoop` fires on the daily cron (`hour % 24 === 0`), beside the existing soul-priority pull.
- Breakthrough save path deposits a trail for each breakthrough's domain (fire-and-forget).
- Admin routes (auto-gated by `checkAdminKey`): `POST /api/admin/colony/loop` (trigger), `GET /api/admin/colony/map?segment=` (view the map).

**D1 table:**
```
pheromone_trails(id, segment, action, weight REAL, deposits INT, last_deposit_ts INT, created_ts INT)
UNIQUE(segment, action)
```

---

## PART IV — WHAT 5% IS AND WHAT COMES NEXT (canon dictates, not me)

Done: research mold (verified citations) + engine + schema + daily loop + breakthrough deposit + admin visibility.

Next (the ant way — amplify, don't ask):
- Wire `selectAction` into `buildAgentPrompt` so Obi's coaching move for a student's weakness domain is biased by the colony's winning trail. (Emergent coaching, no committee.)
- Deposit on **phoneme mastery threshold crossing** (D1 `phonemeDone/phonemeTotal`) — the cleanest objective win signal.
- Track *which action was attempted* per session so wins reinforce the specific technique, not a generic "model_in_reply".
- Dashboard: render the pheromone map so the operator can see the colony's collective memory.
- Cross-product: feed winning coaching trails into the growth-engine so marketing copies what teaching already proved.

**Guardrails honored:** KILO_HOLLOW session means no new test files (H1), no test-suite claims (H5). This is a feature build under explicit "get to work" — new artifact authorized (H4 override by direct instruction). Canonical-first (G1): reuses `memory-brain.extractWeaknesses`, mirrors `virality.runLearningLoop`, uses existing `env.SOUL_DB` binding.
