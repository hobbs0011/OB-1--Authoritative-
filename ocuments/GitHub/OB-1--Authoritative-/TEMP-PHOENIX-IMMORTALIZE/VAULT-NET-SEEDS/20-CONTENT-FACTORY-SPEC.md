# 20 — CONTENT FACTORY SPEC

> **Source**: NET Content Production Architecture — Scale Engine
> **Vault**: VAULT-NET-SEEDS
> **Authority**: AGENT-100 (Michael Hobbs)
> **Status**: IMMUTABLE / LOCKED

---

## The Automated Content Pipeline

NET content is generated at scale through a structured pipeline that combines AI speed with human judgment at the critical gate:

1. **Topic Selection** — Weekly theme chosen from the rotating content calendar (pre-approved by Michael quarterly).
2. **Vocabulary Pool Generation** — PLEXY generates 50 candidate vocabulary items relevant to the topic.
3. **AI Selection** — GEMINI filters to the top 10 based on frequency, learnability, and tier appropriateness.
4. **Idiom Curation** — PLEXY pulls 5 idioms with real-world usage examples validated against current Vietnamese English learner corpora.
5. **Slang Selection** — 5 contemporary slang terms curated for cultural safety and classroom appropriateness.
6. **Game Design** — GEMINI generates 3 game variants using the 10-5-5-3 content as raw material.
7. **Human Review Gate** — Michael or a certified NET reviewer approves or rejects the full package.
8. **Delivery** — Approved content pushed to CHATTY PRIME and teacher briefs simultaneously.

---

## The Human Review Gate

The reviewer checks:
- Are all 10 vocabulary items actually useful to Vietnamese learners at this tier?
- Do idioms sound natural in spoken English (not textbook formal)?
- Are games mechanically sound and playable within time constraints?
- Does any content risk cultural offense or embarrassment in a Vietnamese classroom?

Packages failing review are returned to GEMINI with specific rejection notes.

---

## Content Library Management

All approved content is tagged by: Tier (Mouse/Cub/Tiger), Topic Category, Difficulty Rating, Cultural Sensitivity Flag, Date Created, and Version Number. Content is retrieved by SyncCore based on lesson parameters — no manual searching required.

---

## Level Adaptation: Same Topic, Three Difficulties

Every topic is produced at three levels:
- **Mouse**: Basic vocabulary, simple sentence frames, high-repetition games.
- **Cub**: Intermediate vocabulary, idiom introduction, games requiring short constructed responses.
- **Tiger**: Advanced vocabulary, idiom + slang combined, games requiring debate or storytelling.

A single production run generates three content packages simultaneously.

---

## Content Versioning

Every content package carries a version number. When a package is updated, the old version is archived (not deleted). Active lessons referencing an old version continue uninterrupted until their session cycle ends. Teachers are notified of version updates before their next cycle begins.

---

## The Content Quality Gate

Automatic rejection triggers:
- Vocabulary item appears in fewer than 3 of 5 validated ESL frequency lists.
- Idiom has no verified real-world usage example from the last 5 years.
- Game cannot be completed in under 8 minutes based on average class simulation.

---

## Content Freshness Protocol

Content expires after 6 months in active rotation. PLEXY flags expiring packages 30 days in advance. Expired content is not deleted — it enters the Archive tier and may be refreshed via a new production run.

---

## Cultural Sensitivity Review

Every package is screened for: topics that invoke family hierarchy tensions, content that could cause face-loss in a group setting, any idioms with double meanings offensive in Vietnamese cultural context. This review is non-negotiable regardless of production velocity pressure.

---

## Production Velocity Targets

- **Minimum**: 5 new lesson packages per week (one per weekday theme).
- **Target**: 10 packages per week (covering all three tiers for each theme).
- **Sprint capacity**: 20 packages in a single week if a new corporate client onboards.

---

🔒 CONTENT FACTORY SPEC SEALED. LEDGER IS LAW. 🦅
