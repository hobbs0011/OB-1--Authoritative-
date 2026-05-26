#!/usr/bin/env python3
"""
RUN337: Merkle Chain Validation & Integrity Report
Purpose: Verify SHA-256 chain integrity and detect any tampering
Input: CANON-LEDGER-RUN337-PART3-HL-HASHES.json
Output: MERKLE-CHAIN-VALIDATION-RUN337.json + integrity report
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime

def compute_merkle_root(hashes):
    """Compute Merkle root from list of hashes"""
    if not hashes:
        return None
    
    # Single layer: pair up and hash
    while len(hashes) > 1:
        new_layer = []
        for i in range(0, len(hashes), 2):
            if i + 1 < len(hashes):
                combined = hashes[i] + hashes[i + 1]
            else:
                combined = hashes[i] + hashes[i]  # Duplicate if odd count
            
            pair_hash = hashlib.sha256(combined.encode()).hexdigest()
            new_layer.append(pair_hash)
        
        hashes = new_layer
    
    return hashes[0]

def main():
    # Load the hashes we just generated
    hash_file = Path("d:\\OB-1\\CANON-LEDGER-RUN337-PART3-HL-HASHES.json")
    
    if not hash_file.exists():
        print(f"❌ Hash file not found: {hash_file}")
        return False
    
    with open(hash_file, 'r', encoding='utf-8') as f:
        entries = json.load(f)
    
    print(f"🔐 Starting Merkle Chain Validation for {len(entries)} entries...")
    print("=" * 80)
    
    # Validate chain links
    validation_report = {
        "run": "RUN337",
        "phase": "Merkle Chain Validation",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total_entries": len(entries),
        "chain_valid": True,
        "errors": [],
        "warnings": [],
        "statistics": {
            "genesis_blocks": 0,
            "valid_links": 0,
            "broken_links": 0,
            "total_size_kb": 0
        }
    }
    
    # First pass: validate each link
    for i, entry in enumerate(entries):
        validation_report["statistics"]["total_size_kb"] += entry["file_size_kb"]
        
        if entry["chain_valid"] == "GENESIS":
            validation_report["statistics"]["genesis_blocks"] += 1
            print(f"✅ Entry {i+1}: GENESIS (root)")
        elif entry["chain_valid"] == "LINKED":
            # Verify previous hash matches
            if i > 0:
                expected_prev = entries[i - 1]["sha256_hash"]
                actual_prev = entry["prev_hash"]
                
                if expected_prev == actual_prev:
                    validation_report["statistics"]["valid_links"] += 1
                    if (i + 1) % 20 == 0:
                        print(f"✅ Entry {i+1}: Chain link VALID → {entry['file_name'][:50]}")
                else:
                    validation_report["chain_valid"] = False
                    validation_report["statistics"]["broken_links"] += 1
                    error_msg = f"Entry {i+1}: CHAIN BREAK! Expected {expected_prev[:16]}... got {actual_prev[:16]}... ({entry['file_name']})"
                    validation_report["errors"].append(error_msg)
                    print(f"❌ {error_msg}")
    
    # Compute full Merkle root
    all_hashes = [e["sha256_hash"] for e in entries]
    merkle_root = compute_merkle_root(all_hashes)
    
    validation_report["merkle_root"] = merkle_root
    validation_report["final_ledger_hash"] = entries[-1]["sha256_hash"] if entries else None
    
    # Write report
    report_path = Path("d:\\OB-1\\MERKLE-CHAIN-VALIDATION-RUN337.json")
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(validation_report, f, indent=2)
    
    print("=" * 80)
    print(f"✅ Validation Complete")
    print(f"   Chain Valid: {validation_report['chain_valid']}")
    print(f"   Valid Links: {validation_report['statistics']['valid_links']}")
    print(f"   Broken Links: {validation_report['statistics']['broken_links']}")
    print(f"   Total Size: {validation_report['statistics']['total_size_kb']:.2f} KB")
    print(f"   Merkle Root: {merkle_root}")
    print(f"   Report: {report_path.name}")
    
    return validation_report['chain_valid']

if __name__ == "__main__":
    main()
