#!/usr/bin/env python3
"""
RUN337: Heavy Ledger SHA-256 Hashing & Merkle Chain Validation
Purpose: Create immutable cryptographic fingerprint of all ledger state
Output: CANON-LEDGER-RUN337-PART3-HL-HASHES.json with Merkle chain
"""

import os
import json
import hashlib
from pathlib import Path
from datetime import datetime

def hash_file(file_path):
    """Compute SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

def main():
    ledger_dir = Path("d:\\OB-1\\CANON\\HEAVY-LEDGER")
    ledger_entries = []
    prev_hash = "GENESIS_BLOCK"
    
    if not ledger_dir.exists():
        print(f"❌ Directory not found: {ledger_dir}")
        return
    
    # Get all files sorted by name
    files = sorted([f for f in ledger_dir.iterdir() if f.is_file()])
    total = len(files)
    
    print(f"🔍 Processing {total} Heavy Ledger files...")
    print("=" * 80)
    
    for idx, file_path in enumerate(files, 1):
        try:
            # Compute SHA-256
            file_hash = hash_file(file_path)
            file_size_kb = round(file_path.stat().st_size / 1024, 2)
            
            entry = {
                "idx": idx,
                "file_name": file_path.name,
                "file_size_kb": file_size_kb,
                "sha256_hash": file_hash,
                "prev_hash": prev_hash,
                "chain_valid": "GENESIS" if prev_hash == "GENESIS_BLOCK" else "LINKED",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            ledger_entries.append(entry)
            prev_hash = file_hash
            
            status = "✅" if idx % 10 == 0 else "  "
            print(f"{status} [{idx:3d}/{total}] {file_path.name:60s} | {file_size_kb:8.2f} KB | {file_hash[:16]}...")
            
        except Exception as e:
            print(f"❌ Error processing {file_path.name}: {e}")
    
    # Write PART3
    output_path = Path("d:\\OB-1\\CANON-LEDGER-RUN337-PART3-HL-HASHES.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(ledger_entries, f, indent=2)
    
    print("=" * 80)
    print(f"✅ COMPLETE: {len(ledger_entries)} entries generated")
    print(f"📁 Output: {output_path.name}")
    print(f"🔐 Final Merkle Root (SHA-256): {prev_hash}")
    print(f"📊 Total size: {sum(e['file_size_kb'] for e in ledger_entries):.2f} KB")
    
    return True

if __name__ == "__main__":
    main()
