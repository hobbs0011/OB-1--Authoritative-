---
description: Reverse engineer a system, file, or concept — understand how it works from outside
agent: RISE
---
Execute reverse engineering protocol:

**Target**: Code, config, system, or concept specified in $ARGUMENTS

**Process**:
1. **Observation** — Read the target without assumptions
2. **Behavior mapping** — What does it DO, not what does it say
3. **Structure analysis** — How is it organized
4. **Dependency tracing** — What does it import/call/require
5. **Black-box testing** — Run it, observe outputs
6. **Synthesis** — Explain in plain language

**Output format**:
```
REVERSE ENGINEER: <target>
├── WHAT_IT_DOES: <1-sentence>
├── HOW_IT_WORKS: <mechanism>
├── DEPENDENCIES: <files/modules>
├── KEY_COMPONENTS: <parts>
└── SIMPLE_EXPLANATION: <for-mortal>
```

**Use cases**:
- Understanding legacy code
- Figuring out how a system works
- Documenting unknown files
- Finding entry points

Use $ARGUMENTS to specify target file or concept.