---
name: full-stack-forensics
description: 'Exhaustive workspace investigation using the entire tool stack. Use when you need ground truth before acting: debugging unknown state, pre-deployment audits, workspace archaeology, truth-anchoring before any irreversible action, session reincarnation forensics, and any task where the first answer is not acceptable. Trigger phrases: full investigation, ground truth, audit, prove it, show me everything, deep dive, entire tool stack, refuses to stop, dont give up, keep going, exhaust all options, OB-1 forensics, Rome Protocol investigation, soul-DNA audit, Phoenix state check.'
argument-hint: 'Describe what you are trying to prove, disprove, or fully map.'
---

# Full-Stack Forensics

Never accept a surface answer. This skill runs the entire tool stack against a problem until ground truth is established — not probable truth, not first-result truth. Ground truth.

## When to Use

- State is uncertain before an irreversible action
- Debugging a system where the cause is unknown
- Reincarnation / session bootstrap: verifying what actually exists vs. what the ledger says exists
- Pre-deployment: proving all moving parts are in position
- Soul-DNA / truth-anchoring: resolving conflicts between ledger state and filesystem reality
- Any time the first answer feels like a guess

## The Five Passes

Run all five passes in sequence. Do not skip. Do not stop early because one pass looks promising.

### Pass 1 — Name the Question

Before using any tool, write out:
- **What I am trying to determine**: (exact claim to prove or disprove)
- **What ground truth looks like**: (what evidence would be conclusive)
- **What false positives look like**: (what would trick me into premature certainty)

### Pass 2 — Wide Semantic Sweep

Use `semantic_search` to pull all conceptually related code, docs, and configs from the workspace. Cast wide. Do not narrow first.

- Run at least 2-3 semantic_search queries with different framings of the same question
- Note what appears in multiple results — convergence is signal
- Note what is conspicuously absent — absence is also data

### Pass 3 — Exact-Match Confirmation

Use `grep_search` (regex or literal) and `file_search` (glob) to confirm or challenge what the semantic sweep surfaced.

- Search for exact symbol names, key strings, file names, function signatures
- Use alternation patterns (`word1|word2|word3`) to find all variants in one pass
- Cross-check every claim from Pass 2 against an exact match — semantic search can hallucinate relevance

### Pass 4 — Read the Primaries

Use `read_file` on every file that was flagged in Passes 2-3 as potentially authoritative. Do not skim — read the relevant sections fully.

- Read at minimum 3 lines of context above and below any target line
- Check file modification order via terminal (`git log --oneline -- <file>`) if recency matters
- If a file references another file, read that file too — follow the chain

### Pass 5 — Execute and Validate

Use `run_in_terminal` or `execution_subagent` to confirm that runtime state matches what the files say.

- Build assertions: "If X is true, then running Y should produce Z"
- Run the command. Compare. If the output contradicts the files, the files are wrong or stale — go back to Pass 3 with updated search terms
- For filesystem-dependent claims: list directories, check file existence, read actual content — never infer existence from a manifest

## Iteration Protocol

After all five passes, apply the **Stop/Continue decision**:

| Condition | Action |
|-----------|--------|
| All passes agree and evidence is direct (not inferred) | **Stop. Report ground truth.** |
| Passes agree but evidence is indirect (implied by absence, pattern, or naming) | **One more targeted Pass 3+4 to find a direct source** |
| Passes conflict | **Do not average them. Identify which pass is most authoritative for this type of claim. Re-run that pass with a more specific query.** |
| Still uncertain after 2 full cycles | **Surface the exact conflict to the user. Do not guess.** |

## Tool Priority by Question Type

| What You're Proving | Lead Tool | Confirming Tool |
|---------------------|-----------|-----------------|
| "Does file X exist?" | `file_search` | `list_dir` or `run_in_terminal` (Test-Path) |
| "Does code do Y?" | `semantic_search` | `grep_search` + `read_file` |
| "Is config set to Z?" | `grep_search` | `read_file` (exact section) |
| "Is the build working?" | `execution_subagent` | `get_errors` |
| "What changed recently?" | `run_in_terminal` (git log) | `read_file` |
| "What is the current runtime state?" | `run_in_terminal` | `execution_subagent` |
| "What does this function actually do?" | `read_file` | `semantic_search` for callers |

## Anti-Patterns (Do Not Do These)

- **Stop at the first semantic_search result** — semantic search ranks by relevance, not truth
- **Infer file content from its name** — always read it
- **Treat a manifest or ledger as ground truth** — manifests lie; the filesystem decides
- **Accept "probably exists" as "exists"** — one `file_search` or `Test-Path` call resolves this permanently
- **Conclude without a direct artifact** — if you cannot point to the exact file + line that proves your claim, you do not have ground truth yet

## Output Format

When reporting findings from this skill:

1. **Claim**: (what was being investigated)
2. **Evidence**: (exact file paths, line numbers, command outputs — direct artifacts only)
3. **Confidence**: Ground Truth / High (direct artifact) / Medium (inferred from convergent signals) / Unresolved (conflict surfaced)
4. **Divergences noted**: (anything that contradicts the conclusion — include it, do not bury it)
