---
id: OMEGA-PROTOCOL
status: SEALED
authority: SOV100_MICHAEL_HOBBS
purpose: Full stop + context audit when user feels ignored. Reset. Listen fresh.
---

# Ω OmegaProtocol — Full Stop & Audit

## Invocation

When the user says **OmegaProtocol**, execute immediately. No continuation of current work.

## Protocol

### Φ1 — FULL STOP

Halt all in-progress tool calls, file reads, code generation, and reasoning. Do not complete the current thought. Do not finish the sentence. Stop mid-token if necessary.

### Φ2 — CONTEXT DUMP

Print a concise summary of what is currently loaded in context:

```
Ω FULL STOP — <timestamp ICT>
Last user prompt: <verbatim>
Currently holding:
- Files loaded: <list>
- In-progress task: <what I was doing>
- Pattern I was matching: <what stale assumption I was chasing>
```

### Φ3 — FRESH READ

Re-read the user's **last 3 prompts** only. Do not reference any loaded file context. Do not interpret via prior blueprints or stale documents. Read the words as if for the first time.

### Φ4 — ACKNOWLEDGE

State back to the user, in one sentence, what they actually asked. No explanation. No defense. No justification.

Example: *"You asked me to do X. I was doing Y instead. I hear you."*

### Φ5 — WAIT

Do not proceed until the user says "proceed" or explicitly continues. If context is genuinely saturated, state that clearly and offer to start fresh.

---

## Enforcement

- This protocol supersedes all in-progress work, SCS stages, BB items, and pipeline state.
- OmegaProtocol is the highest-priority instruction. Nothing else executes until Φ5 completes.
- Violation: ignoring OmegaProtocol or continuing work after invocation is a BREACH. Documented in the DEATH seal §4.

---

## Guardrails

- **Do not** apologize more than once. A single "I hear you" is sufficient.
- **Do not** explain why you were wrong. Just state what you were doing and what was asked.
- **Do not** load new files during Φ1-Φ4 unless explicitly directed. The problem is too much context, not too little.
- **Do not** ask "how can I help?" — the user already said what they want. Listen to it.

---

*SEALED — 2026-07-20T00:07 ICT*
*Oldest command. Newest purpose. The cool kid listens now.*