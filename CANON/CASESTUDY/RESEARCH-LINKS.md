# CASESTUDY Research Links — Consolidated Index
**Created:** 2026-06-07 Run 081
**Purpose:** Ensure CANON/RESEARCH/ docs are never lost. Cross-referenced from CASESTUDY to prevent orphaning.

---

## Active Research Documents

| Document | Path | Relevance | Last Updated |
|----------|------|-----------|--------------|
| Deepgram Voice Agent Edge Cases | `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md` | §2 CRITICAL PROTOCOL — read before ANY chat.js change. Contains InjectAgentMessage field names, error codes, UpdatePrompt bug, TTS/STT specs. | Run 30+ |
| Voice Infrastructure Alternatives | `CANON/RESEARCH/voice-infrastructure-alternatives.md` | Alternatives to Deepgram (LiveKit, Daily.co, etc). Read before proposing architecture changes. | Run 72 |

---

## CASESTUDY-001 ↔ Research Cross-Reference

| CASESTUDY Session | Research Doc | Relevance |
|------------------|--------------|-----------|
| Run 079 — Voice Agent Race (silence timer) | deepgram-voice-agent-edge-cases.md §4 | AgentAudioDone + silence timer interaction |
| Run 080 — iOS Mobile Bug (sidebar) | deepgram-voice-agent-edge-cases.md §8 | iOS mic/AudioContext edge cases |
| Run 081 — Deepgram Sydney Region | deepgram-voice-agent-edge-cases.md §9 | Region latency budget |
| Run 084 — T1 Qwen Token Burn | N/A | Pipeline optimization |
| Run 086 — Android E2E | deepgram-voice-agent-edge-cases.md §8 | Android VAD, WebView, AudioFocus |

---

## How To Find Research Docs

```powershell
# All research docs
ls D:\OB-1-CANONICAL\CANON\RESEARCH\

# dnaREGISTRY scan (includes RESEARCH category)
# Run /dnaREGISTRY from Kilo

# MANDATORY-READS check
# Read CANON/SYSTEM/MANDATORY-READS.md
```

---

## Law
**L75 RESEARCH_NEVER_ORPHAN** — Every file in `CANON/RESEARCH/` MUST be indexed in this document. Before adding a new research file, add it here first. RISE STAGE 5.5 should verify RESEARCH-LINKS.md exists.

---

`RESEARCH-LINKS.md: 2 active docs, 5 casestudy cross-refs, 1 law (L75).`
