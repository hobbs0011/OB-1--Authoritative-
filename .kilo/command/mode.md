---
description: Switch AGENT99 mode — ob1 (orchestrator), an4 (builder), ne0 (auditor)
agent: AGENT99
---
Switch AGENT99 to specified mode:

**Usage**: `/mode <name>`

**Modes**:
- `/mode ob1` — OB1 mode (default): orchestrator, governance, laws, interface layer
- `/mode an4` — An4 mode: builder, high-velocity code gen, ship fast
- `/mode ne0` — Ne0 mode: auditor, forensic truth, drift detection
- `/mode` — Show current mode (no args)

**State**: Mode persists across session. Switching preserves context.
