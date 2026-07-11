# Phettrail — Scout Learned Update
**Scout run:** 2026-07-01T21:43:58+07:00
**Zone scanned:** `.kilo/` (active command surface)

## What changed
1. Scout now excludes `.kilo/worktrees/` and `.kilo/node_modules/` from `.kilo/` zone sweeps by default. Without this rule, `.kilo/` expands to ~219k files, causing scan blowup and flag noise.
2. Scout learned to treat `deepseek-chat` / `deepseek-reasoner` mentions in `.kilo/command/*.md` and `.kilo/agent/*.md` as documentation artifacts by default, UNLESS they appear in frontmatter `model:` fields. Frontmatter model IDs are live config; markdown body references are doctrine.

## Rule updates
- **Scope rule:** `.kilo/` zone = active surface only:
  - Include: `.kilo/fieldguide.md`, `.kilo/command/*.md`, `.kilo/agent/*.md`, `.kilo/skills/*/SKILL.md`, `.kilo/plans/*.md`, `.kilo/*.json`
  - Exclude: `.kilo/worktrees/**`, `.kilo/node_modules/**`
- **Alias lens:** retired alias grep in `.kilo/` must be paired with frontmatter check for `model:` lines to distinguish dead config from dead docs.

## Next-run doctrine
- Always run `git status` before lens checks in `.kilo/`; fieldguide.md is expected to be the dirtiest file because it is actively edited.
- Verify `.kilo/agent/SS-Agent99.md` frontmatter `model:` against canonical alias list before any other agent file.
