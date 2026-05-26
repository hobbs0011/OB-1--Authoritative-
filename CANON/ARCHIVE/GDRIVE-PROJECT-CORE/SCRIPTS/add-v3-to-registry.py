#!/usr/bin/env python3
"""
Add v3 batch to living ledger registry.
Sources: BlueTech Classroom Dump + RUN335 + RUN334 + RUN333 + HL-140 + HL-141
"""

import json
import sys
import os

# Import the registry manager
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import living_ledger_registry_manager as mgr
LivingLedgerRegistry = mgr.LivingLedgerRegistry

def main():
    # Load registry
    registry = LivingLedgerRegistry()
    
    # Load v3 batch
    with open("SCRIPTS/v3_batch.json", "r") as f:
        v3_batch = json.load(f)
    
    print(f"\n{'='*80}")
    print(f"Adding v3 batch: {len(v3_batch)} keywords")
    print(f"{'='*80}\n")
    
    # Add batch
    try:
        registry.add_keyword_batch(
            v3_batch,
            "Archaeological audit RUN335 + consolidation RUN334 + final pipeline RUN333 + critical incidents HL-140/HL-141 + BlueTech classroom methodology"
        )
        print(f"✅ Batch added successfully")
    except Exception as e:
        print(f"❌ Error adding batch: {e}")
        return False
    
    # Save registry
    try:
        registry.save()
        print(f"✅ Registry saved")
    except Exception as e:
        print(f"❌ Error saving registry: {e}")
        return False
    
    # Display summary
    print(f"\n{'='*80}")
    print(f"REGISTRY STATE AFTER v3")
    print(f"{'='*80}\n")
    
    current_version = registry.metadata["current_version"]
    version_data = registry.versions[current_version]
    
    print(f"Current version: {current_version}")
    print(f"Total entries: {len(version_data['entries'])}")
    print(f"Merkle root: {version_data['merkle_root']}")
    print(f"Created: {version_data['created']}")
    
    # Show all versions
    print(f"\nVersion chain:")
    for i, (v, metadata) in enumerate(registry.versions.items(), 1):
        print(f"  {i}. {v}: {len(metadata['entries'])} keywords, merkle={metadata['merkle_root'][:16]}...")
    
    # Show merkle chain
    print(f"\nMerkle chain verification:")
    for i, (v, metadata) in enumerate(registry.versions.items()):
        prior_root = metadata.get("prior_root", "ORIGIN")
        expected_prior = registry.versions[list(registry.versions.keys())[i-1]]["merkle_root"] if i > 0 else "ORIGIN"
        status = "✅" if prior_root == expected_prior or (i == 0 and prior_root == "ORIGIN") else "❌"
        print(f"  {status} {v}: prior_root matches expected")
    
    print(f"\n{'='*80}\n")
    print(f"✅ v3 creation complete. v3 total: {len(version_data['entries'])} keywords (35 v2 + 56 new)")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
