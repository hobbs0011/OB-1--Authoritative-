---
description: Check openclaw package status and version
agent: RISE
---
Check if openclaw is installed and show version. If not installed, show installation instructions.

Runs: npm list -g openclaw 2>/dev/null || echo "NOT INSTALLED"