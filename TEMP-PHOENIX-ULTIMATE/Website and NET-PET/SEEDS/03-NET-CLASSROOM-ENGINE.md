# NET Classroom Engine — Comet RE V101

**Source**: NET_GOD_SEED_V3 (3.0.1) + NET_ECOSYSTEM_TOTAL_DUMP_V3
**Status**: Architecture Reference

---

## Comet Rendering Engine V101

The classroom engine handles real-time lesson delivery, state management, and student interaction tracking.

### State Model
```
StudentState {
  id: string
  tier: 'mouse' | 'cub' | 'tiger' | 'enterprise'
  currentLesson: LessonID
  progress: ProgressMap
  voiceLevel: number (1-10, Mouse=1, Tiger=10)
  streakDays: number
  lastSession: timestamp
}
```

### Event System
- `lesson.start` → Initialize 10-5-5-3 payload
- `lesson.vocab.complete` → Track 10 vocab items
- `lesson.idiom.complete` → Track 5 idioms
- `lesson.slang.complete` → Track 5 slang items
- `lesson.game.start` → Launch gamification module
- `lesson.game.complete` → Score + dopamine lock
- `session.end` → Write to ledger, update profile

### Content Security Policy (CSP)
- Scripts: self + Cloudflare Workers
- Styles: self + inline (for dynamic theming)
- Connect: self + api.deepgram.com + Workers AI
- Media: self + R2 bucket (audio assets)
- Frame: none (no iframes)

### Save Engine V30.1
- Auto-save every 30 seconds during active session
- Durable Object persistence for real-time state
- D1 write-behind for permanent storage
- Conflict resolution: last-write-wins with timestamp

## Infrastructure
- **Runtime**: Cloudflare Workers
- **State**: Durable Objects (real-time) + D1 (persistent)
- **Cache**: KV (rate limiting, session tokens)
- **Assets**: R2 (audio, images, lesson packs)
- **AI**: Workers AI (Llama-3) + DeepSeek (/api/chat)
- **Voice**: Deepgram Aura 2 TTS (aura-2-orion-en)
