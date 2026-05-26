#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, hashlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load registry
with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "r", encoding="utf-8") as f:
    registry = json.load(f)

print(f"Registry loaded. Current version: {registry['metadata']['current_version']}")
print(f"Total keywords: {len(registry['keywords'])}")
print(f"Highest layer: {max([k['layer'] for k in registry['keywords']])}")

# Verify this is v5
if registry['metadata']['current_version'] == 'v5':
    print("✓ Registry is at v5, ready for v6 update")
    v5_count = registry['versions']['v5']['entries']
    print(f"✓ V5 entries: {v5_count}")
else:
    print("✗ Registry is not at v5")
