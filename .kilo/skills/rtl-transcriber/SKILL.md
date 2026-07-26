# /rtl-transcribe — RTL Transcription Skill

**RTL (Raw Transcript Log)** — Unified audio transcription pipeline for class recordings.

## Invocation

```
node .kilo/skills/rtl-transcriber/transcribe-rtl.js <audio-file> [--student "Name"] [--label "label"]
```

## Examples

```
node .kilo/skills/rtl-transcriber/transcribe-rtl.js "C:\recordings\class.m4a" --student "Mai Tram"
node .kilo/skills/rtl-transcriber/transcribe-rtl.js "C:\recordings\voice.m4a" --student "Hoa" --label "phonics"
```

## Output

| File | Format | Description |
|------|--------|-------------|
| `RTL/<student>/<date>-<student>-RTL.txt` | JSONL | Conversation with speaker labels |
| `RTL/<student>/<date>-<student>-RTL-COLORIZED.md` | Markdown | Readable transcript |
| `RTL/<student>/<date>-<student>-RTL-STATS.json` | JSON | Word counts, frequency, metadata |

## Pipeline

1. Compress audio to 48kbps MP3 via ffmpeg
2. Split into 5-minute segments
3. Transcribe each with Deepgram Nova-2 + diarization
4. Merge word-level diarization into speaker conversation
5. Write JSONL + STATS + COLORIZED to `RTL/<student>/`

## Schema (RTL V1)

```json
{"role":"user|assistant","speaker":"Name","time":<epoch>,"content":[{"type":"text","data":{"text":"..."}}]}
```

## Dependencies

- `ffmpeg` — audio compression/splitting
- `DEEPGRAM_API_KEY` — from `.env` or env var
- `node >= 18`