# TRAIN-67 — Launch Checklist (No Secrets)

## Code hygiene
- [ ] `UnifiedServer.lua` contains **no** HTML entities (`&lt;`, `&gt;`, `&amp;`).
- [ ] `AnalyticsService.lua` contains **no** HTML entities.
- [ ] `QuestionBankV2.lua` contains **no** HTML entities.

## Studio smoke
- [ ] Game boots with zero red errors.
- [ ] Required modules resolve correctly.
- [ ] Core loop runs at least once.

## Publish
- [ ] Publish a new version to Roblox.
- [ ] Record identifiers (place/universe/group) in state store.

## Deferred (explicit)
- [ ] API keys / tokens
- [ ] External endpoints
- [ ] Paid analytics / attribution
