# Mission G Synthesis - Cross-Class Analysis

## VOCAB OVERLAP (Highest Priority to Seed)

Words appearing in BOTH classes - seed to both students:

| Word | Meaning | Priority | Reason |
|------|---------|----------|--------|
| persist | kiên trì | P0 | Core vocab, both students need perseverance mindset |
| articulate | nói rõ ràng | P0 | Both identified pronunciation/output issues |
| connector words | từ nối ý | P1 | Both students need linking phrases for fluency |
| presentation | thuyết trình | P1 | Key skill both students are developing |
| freeze | đóng băng | P0 | Both students experience speaking blocks |

## SHARED GAPS (Patterns Across Students)

1. **Speaking Block When Anxious** - Both "freeze" when prompted to speak independently
2. **Rhythm/Pause Control** - Both rush through natural speaking pauses (period/comma markers)
3. **Internal Editor Overdrive** - Both self-interrupt with "I I I" or "Not nothing" corrections
4. **Ending Consonant Dropping** - Both reduce pronunciation clarity on word endings
5. **Tech Vocabulary Gap** - Both struggle describing app issues in English

## DEV TODOS (Merged + Deduped, Ranked)

**P0 - Critical:**
- Make mode cards clickable in app UI
- Add pronunciation tracking for final consonants
- Implement /api/class/ingest endpoint for vocab injection

**P1 - Important:**
- Add "fluency mode" that delays corrections
- Enable audio snippet playback in app
- Parent portal dashboard for lesson assignment
- Session recording integration

**P2 - Nice to Have:**
- Slang context engine (when to use "suck" vs "that sucks")
- Self-correction pattern detection
- Connector word prompting during pauses

## INGEST COMMANDS (curl to seed vocab)

```bash
# For Huong (run after /api/class/ingest is deployed — Mission D)
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/class/ingest \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $WORKER_ADMIN_KEY" \
  -d '{"studentId":"huong-bluetech","words":[{"word":"persist","meaning_vi":"kiên trì","used_by_student":true},{"word":"articulate","meaning_vi":"nói rõ ràng","used_by_student":true},{"word":"prioritize","meaning_vi":"ưu tiên","used_by_student":true},{"word":"streamline","meaning_vi":"tinh giản","used_by_student":true},{"word":"resilient","meaning_vi":"kiên cường","used_by_student":true}],"source":"2026-06-11"}'

# For Mai Tram
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/class/ingest \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $WORKER_ADMIN_KEY" \
  -d '{"studentId":"mai-tram-bluetech","words":[{"word":"persist","meaning_vi":"kiên trì","used_by_student":true},{"word":"accumulate","meaning_vi":"tích lũy","used_by_student":true},{"word":"articulate","meaning_vi":"nói rõ ràng","used_by_student":true},{"word":"delegate","meaning_vi":"phân công","used_by_student":true},{"word":"prioritize","meaning_vi":"ưu tiên","used_by_student":true}],"source":"2026-06-10"}'
```

## CLIP EXTRACTION (ffmpeg ready)

**For Huong:**
- 31:07-33:30: "I could sell ice to Eskimos" idiom
- 66:51-67:45: "Your English is already inside you" confidence mantra
- 14:39-14:55: "You don't need to be afraid to make mistakes"

**For Mai Tram:**
- 14:44-14:58: "That sucks. Oh, that sucks." slang with emotion
- 49:39-49:51: "I am an animal lover" pause modeling
- 48:53-49:00: "It's not a knowledge problem. It's a practice problem."

## NEXT LESSON SEEDS (3 Focus Areas Per Student)

### Huong:
1. **App Description Fluency** - Practice describing technical problems without "I I I" stalling
2. **Word Ending Clarity** - Focus on /t/, /d/, /s/ endings in connected speech
3. **Presentation Skills** - Build on "natural people person" strength with structured delivery

### Mai Tram:
1. **Grammar Acceptance Mode** - Practice speaking without self-editing for "me vs I" 
2. **Connector Usage** - Use "and then", "because", "so" for natural flow
3. **Emotional Expression** - Expand beyond "sucks" to other workplace emotional phrases