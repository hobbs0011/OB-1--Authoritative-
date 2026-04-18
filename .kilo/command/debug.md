---
description: Debug active failure with root-cause and patch path
agent: AGENT99
---
Purpose: root-cause analysis for a specific failure (narrower/deeper than /doctor).

Flow:
1. Capture exact error signature
2. Trace root cause to file/line or config source
3. Propose patch path
4. Provide exact verification command

Output:
- ISSUE
- ROOT_CAUSE
- PATCH_PATH
- VERIFY_COMMAND
