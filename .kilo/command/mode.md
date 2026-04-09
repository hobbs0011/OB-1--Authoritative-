---
description: Switch AGENT99 mode — ob1 (orchestrator), an4 (builder), ne0 (auditor)
agent: AGENT99
---
Switch AGENT99 to specified mode:

**Usage**: `/mode <name>`

**Modes**:
- `/mode ob1` — OB1 mode (default): Orchestrator, governance, 36 laws, interface layer
- `/mode an4` — An4 mode: Builder, sword, high-velocity code gen, ship it fast
- `/mode ne0` — Ne0 mode: Legacy auditor, forensic truth, drift detection, verify everything
- `/mode` — Show current mode (no args)

**Example**:
```
> /mode an4
MODE SWITCH → An4 (BUILDER MODE ACTIVATED)
"Ship it. Move. Don't explain until asked."
```

**State**: Mode persists across session. Switching preserves context.