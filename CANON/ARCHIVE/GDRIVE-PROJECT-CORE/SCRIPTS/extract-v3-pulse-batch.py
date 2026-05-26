#!/usr/bin/env python3
"""
Extract keywords from all 2026-03-25 pulse files and add to v3.
Standalone version — no imports, works directly with JSON.
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path

def compute_merkle_root(entries):
    """Compute merkle root of keyword entries."""
    if not entries:
        return hashlib.sha256(b"").hexdigest()
    
    combined = "".join(entry["keyword"] for entry in entries)
    return hashlib.sha256(combined.encode()).hexdigest()

# Files to extract (2026-03-25 pulse files)
pulse_files = [
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run4-0500-handoff.md", "run4-0500"),
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run4-handoff.md", "run4"),
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run5-handoff.md", "run5"),
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run6-alpha-omega-canon.md", "run6"),
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run7-handoff.md", "run7"),
    ("d:\\OB-1\\CANON\\PULSE-HANDOFFS\\2026-03-25-run12-ruling-closures.md", "run12"),
]

reincarnation_files = [
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-v5-overnight-mining-hardened.md", "overnight-mining"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-v5-extraction-engine.md", "extraction-engine"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-trigger-audit-rulings-v3.md", "trigger-audit"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-super-saiyan-hardening.md", "super-saiyan"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-RISE-WEBSITE-BUILD.md", "rise-website"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-pulse-v3-galaxy-lessons-patch-first.md", "galaxy-lessons"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-net-methodology-bottleneck-fix.md", "net-methodology"),
    ("d:\\OB-1\\CANON\\REINCARNATION\\2026-03-25-mss-v5-security-authority.md", "mss-security"),
]

batch_keywords = []
layer_counter = 300  # Start v3 pulse/reincarnation at 300+

print(f"\n{'='*80}")
print("EXTRACTING KEYWORDS FROM 2026-03-25 PULSE FILES")
print(f"{'='*80}\n")

# === PULSE HANDOFFS ===
print("PULSE HANDOFFS (CANON/PULSE-HANDOFFS/):")
for filepath, tag in pulse_files:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        print(f"  ✓ {tag}")
        
        # Extract high-level sections as keywords
        sections = []
        if "decisions" in content.lower():
            sections.append(f"{tag.upper()}_DECISIONS")
        if "corrections" in content.lower():
            sections.append(f"{tag.upper()}_CORRECTIONS")
        if "principles" in content.lower():
            sections.append(f"{tag.upper()}_PRINCIPLES")
        if "state" in content.lower():
            sections.append(f"{tag.upper()}_STATE_SNAPSHOT")
        if "open questions" in content.lower():
            sections.append(f"{tag.upper()}_OPEN_QUESTIONS")
        if "emotional" in content.lower():
            sections.append(f"{tag.upper()}_EMOTIONAL_SIGNAL")
        
        for section in sections:
            batch_keywords.append({
                "layer": layer_counter,
                "keyword": section,
                "truth": f"Decision or guidance from {tag} pulse run",
                "source": f"PULSE-{tag}"
            })
            layer_counter += 1
            
    except FileNotFoundError:
        print(f"  ✗ {tag} (NOT FOUND)")

print(f"\n  Extracted: {len([k for k in batch_keywords if 'PULSE' in k['source']])} keywords\n")

# === REINCARNATION SESSIONS ===
print("REINCARNATION LOGS (CANON/REINCARNATION/):")
for filepath, tag in reincarnation_files:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        print(f"  ✓ {tag}")
        
        # Extract key topics
        keywords_found = []
        if "decision" in content.lower():
            keywords_found.append(f"{tag.upper()}_DECISIONS")
        if "principle" in content.lower():
            keywords_found.append(f"{tag.upper()}_PRINCIPLES")
        if "correction" in content.lower():
            keywords_found.append(f"{tag.upper()}_CORRECTIONS")
        if "insight" in content.lower() or "finding" in content.lower():
            keywords_found.append(f"{tag.upper()}_INSIGHTS")
        if "blocker" in content.lower():
            keywords_found.append(f"{tag.upper()}_BLOCKERS")
        if "architecture" in content.lower():
            keywords_found.append(f"{tag.upper()}_ARCHITECTURE")
        if "validation" in content.lower():
            keywords_found.append(f"{tag.upper()}_VALIDATION")
        
        for keyword in keywords_found:
            batch_keywords.append({
                "layer": layer_counter,
                "keyword": keyword,
                "truth": f"Session artifact from {tag} reincarnation",
                "source": f"REINCARN-{tag}"
            })
            layer_counter += 1
            
    except FileNotFoundError:
        print(f"  ✗ {tag} (NOT FOUND)")

print(f"\n  Extracted: {len([k for k in batch_keywords if 'REINCARN' in k['source']])} keywords\n")

print(f"{'='*80}")
print(f"TOTAL EXTRACTED: {len(batch_keywords)} keywords")
print(f"Layer range: 300-{layer_counter-1}")
print(f"{'='*80}\n")

# Save batch
with open("SCRIPTS/v3_pulse_batch.json", "w") as f:
    json.dump(batch_keywords, f, indent=2)

print(f"✅ Batch saved to SCRIPTS/v3_pulse_batch.json\n")

# Now load registry and add
try:
    with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "r") as f:
        registry = json.load(f)
    print(f"✅ Registry loaded")
except FileNotFoundError:
    print(f"⚠️  Registry not found, creating new")
    registry = {
        "metadata": {"current_version": "v0", "total_versions": 0},
        "versions": {}
    }

# Add v3
v3_version_key = "v3"
if v3_version_key not in registry["versions"]:
    existing_entries = []
    if registry["metadata"]["current_version"] != "v0":
        for v, data in registry["versions"].items():
            existing_entries.extend(data["entries"])
    
    all_entries = existing_entries + batch_keywords
    
    v3_data = {
        "created": datetime.utcnow().isoformat() + "Z",
        "entries": all_entries,
        "merkle_root": compute_merkle_root(all_entries),
        "prior_root": registry["versions"].get(registry["metadata"]["current_version"], {}).get("merkle_root", "ORIGIN"),
        "change_count": len(batch_keywords),
        "source_description": "Archaeological audit + reincarnation sessions + pulse handoffs (2026-03-25)"
    }
    
    registry["versions"][v3_version_key] = v3_data
    registry["metadata"]["current_version"] = v3_version_key
    registry["metadata"]["total_versions"] = len(registry["versions"])
    
    # Save registry
    with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "w") as f:
        json.dump(registry, f, indent=2)
    
    print(f"✅ v3 created in registry")
    print(f"\n{'='*80}")
    print(f"v3 SUMMARY")
    print(f"{'='*80}")
    print(f"Total keywords in v3: {len(all_entries)}")
    print(f"New keywords added: {len(batch_keywords)}")
    print(f"Merkle root v3: {v3_data['merkle_root']}")
    print(f"Prior root: {v3_data['prior_root'][:16]}...")
    print(f"{'='*80}\n")
else:
    print(f"⚠️  v3 already exists")

print(f"✅ Task complete: v3 registry updated with {len(batch_keywords)} keywords from 2026-03-25 pulse files")
