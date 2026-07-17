---
description: Transcribe audio via Deepgram Nova-3
agent: AGENT99
---
## What

Uploads audio to Deepgram's REST API (nova-3, diarized, punctuated, utterances) and saves to `OPERATIONS/CLASS-INTEL/`.

## Why

Run 165 — Node.js fetch/https both timeout on large audio. PowerShell's HttpClient handles large uploads reliably. Content-Type `audio/m4a` direct POST is ~200× faster than multipart form.

## Usage

```powershell
.\transcribe PATH\TO\file.m4a
```

Output: `OPERATIONS/CLASS-INTEL/{filename}-transcript.json`

## Params

| Param | Default | Description |
|-------|---------|-------------|
| path (positional) | required | Audio file path |
| `-OutDir` | `OPERATIONS/CLASS-INTEL/` | Output directory |
| `-Key` | from preflight doc | Deepgram API key |

## Required

- curl.exe or PowerShell
- Audio file <500MB

## Deepgram Params

model=nova-3, punctuate=true, utterances=true, diarize=true, smart_format=true, paragraphs=true