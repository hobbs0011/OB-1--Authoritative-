---
description: "Use when: creating or editing Kilo skill files, writing SKILL.md, building reusable investigation or workflow skills, adding new .kilo/skill/ directories"
applyTo: ".kilo/skill/**"
---

# Kilo Skill File Standards

## Directory Structure

Each skill lives in its own directory under `.kilo/skill/`:

```
.kilo/skill/
  <skill-name>/
    SKILL.md          # Required — skill definition
    *.sh, *.js, etc.  # Optional — bundled assets
```

## Required Frontmatter

```yaml
---
name: <skill-name> # Must match directory name exactly
description: "<keyword-rich description for on-demand discovery>"
---
```

The `description` is the discovery surface. Include specific trigger phrases using the "Use when..." pattern. If keywords aren't in the description, the agent won't find the skill.

## Body Structure

Skills are multi-step workflows, not single actions. Structure as:

1. **When to Use** — explicit trigger conditions
2. **Steps/Passes** — numbered sequence, never skip, never stop early
3. **Tool Priority** — which tools to use for which question types
4. **Anti-Patterns** — what NOT to do
5. **Output Format** — exact structure of results

## The Five-Pass Pattern (Forensics Model)

The repo's canonical skill pattern uses 5 passes:

| Pass                        | Purpose                             | Tools                      |
| --------------------------- | ----------------------------------- | -------------------------- |
| 1. Name the Question        | Define what ground truth looks like | None — think first         |
| 2. Wide Semantic Sweep      | Cast wide for related code/docs     | `codesearch` (2-3 queries) |
| 3. Exact-Match Confirmation | Confirm/challenge semantic results  | `grep`, `glob`             |
| 4. Read the Primaries       | Read every flagged file fully       | `read`                     |
| 5. Execute and Validate     | Runtime confirms file truth         | `bash`, `task`             |

Follow this pattern for investigation skills. For builder skills, adapt the numbered-step structure to the workflow.

## Iteration Protocol

After all passes, apply stop/continue:

- All passes agree + direct evidence → **stop, report**
- Passes agree but evidence is indirect → **one more targeted pass**
- Passes conflict → **identify most authoritative, re-run**
- Still uncertain after 2 cycles → **surface conflict to user, do not guess**

## Anti-Patterns

- Never stop at the first search result — relevance ≠ truth
- Never infer file content from its name — always read it
- Never treat a manifest/ledger as ground truth — filesystem decides
- Never conclude without a direct artifact (exact file + line)
- Skills should NOT duplicate agent laws/identity — reference the agent, don't copy
