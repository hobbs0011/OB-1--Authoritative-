# Class Recording: 2026-07-13 BlueTech Session

**Date:** 2026-07-13
**Time:** 18:03:32 (57 minutes)
**Source:** Voice 260713_180332.m4a
**Transcription Service:** Deepgram Nova-3
**Transcription Date:** 2026-07-18T04:30:00+07:00

## Participants

| Speaker | Student | Utterances | Speaking Time |
|---------|---------|------------|---------------|
| Speaker 0 | Mai Tram | 171 | ~5 min |
| Speaker 1 | Michael (Teacher) | 861 | ~45 min |
| Speaker 2 | Huong | 37 | ~1 min |

## Topics Covered

1. Thailand travel experiences
2. Vocabulary: consistent vs inconsistent
3. Compliment culture (Vietnamese vs Western)
4. Sickness vocabulary: cold vs flu
5. Grammar practice with insults and compliments

## Transcript Files

- `huong-transcript.json` — Huong's utterances with timestamps
- `mai-tram-transcript.json` — Mai Tram's utterances with timestamps
- `full-transcript.json` — Complete diarized transcript (all speakers)

## Usage

```javascript
// Load Mai Tram's transcript
const transcript = await fetch('/2026-07-18-bluechat/mai-tram-transcript.json')
  .then(r => r.json());

// Access utterances
transcript.transcript.forEach(u => {
  console.log(`[${u.start.toFixed(1)}s] ${u.text}`);
});
```

## Metadata

- **Words captured:** 34,211 characters
- **Total utterances:** 1,033
- **Processing notes:** Diarization enabled, punctuated, paragraphs grouped