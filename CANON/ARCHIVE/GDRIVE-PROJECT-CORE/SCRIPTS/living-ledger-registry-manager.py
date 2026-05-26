#!/usr/bin/env python3
"""
Living Ledger Registry Manager
Versioned, append-only keyword index that grows over time.
Replaces static keyword-hash-crossref with dynamic, discoverable system.
"""

import hashlib
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class LivingLedgerRegistry:
    def __init__(self, registry_path: str = "CANON/HEAVY-LEDGER/KEYWORD_REGISTRY_LIVING_LEDGER.json"):
        self.registry_path = Path(registry_path)
        self.archive_dir = self.registry_path.parent / "KEYWORD_REGISTRY_ARCHIVE"
        self.archive_dir.mkdir(parents=True, exist_ok=True)
        self.registry = self._load_or_create_registry()

    def _load_or_create_registry(self) -> Dict[str, Any]:
        """Load existing registry or create new one."""
        if self.registry_path.exists():
            with open(self.registry_path) as f:
                return json.load(f)
        else:
            return {
                "meta": {
                    "name": "KEYWORD_REGISTRY_LIVING_LEDGER",
                    "current_version": 1,
                    "total_versions_created": 1,
                    "first_created": datetime.utcnow().isoformat() + "Z",
                    "last_updated": datetime.utcnow().isoformat() + "Z",
                    "update_frequency": "ON_DISCOVERY",
                    "schema_version": "1.0"
                },
                "update_protocol": {
                    "rule": "APPEND_ONLY",
                    "trigger": "New Soul DNA source discovered",
                    "validation": "All new keywords must map to Starmap or reserved",
                    "rollback": "NEVER — create v+1 instead"
                },
                "versions": {},
                "discovery_log": {},
                "gaps_and_targets": {
                    "known_gaps": {},
                    "current_coverage": {}
                },
                "audit_trail": {}
            }

    def add_keyword_batch(self, new_keywords: List[Dict[str, str]], discovery_source: str) -> str:
        """
        Add a batch of new keywords and create a new version.
        
        Args:
            new_keywords: [{"layer": 180, "keyword": "...", "truth": "..."}, ...]
            discovery_source: "Gospel 444 analysis" etc.
        
        Returns:
            New version string (e.g., "v2")
        """
        current_version = self.registry["meta"]["current_version"]
        new_version = current_version + 1
        version_key = f"v{new_version}"
        
        # Get all prior keywords (history)
        all_keywords = []
        for v in range(1, current_version + 1):
            v_key = f"v{v}"
            if v_key in self.registry["versions"]:
                all_keywords.extend(self.registry["versions"][v_key]["keywords"])
        
        # Remove duplicates by layer, keeping oldest
        keyword_by_layer = {kw["layer"]: kw for kw in all_keywords}
        
        # Add new keywords with version tag
        for new_kw in new_keywords:
            if new_kw["layer"] not in keyword_by_layer:
                keyword_entry = {
                    "layer": new_kw["layer"],
                    "keyword": new_kw["keyword"],
                    "h1_hash": hashlib.sha256(new_kw["keyword"].encode()).hexdigest(),
                    "added_version": new_version,
                    "truth": new_kw.get("truth", "")
                }
                keyword_by_layer[new_kw["layer"]] = keyword_entry
        
        # Sort by layer
        sorted_keywords = sorted(keyword_by_layer.values(), key=lambda x: x["layer"])
        
        # Compute new merkle root
        previous_merkle_root = None
        if current_version > 0:
            v_prev_key = f"v{current_version}"
            if v_prev_key in self.registry["versions"]:
                previous_merkle_root = self.registry["versions"][v_prev_key].get("merkle_root")
        
        # New keywords only (added in this version)
        new_kw_hashes = [kw["h1_hash"] for kw in sorted_keywords if kw.get("added_version") == new_version]
        new_keywords_hash = hashlib.sha256("".join(new_kw_hashes).encode()).hexdigest()
        
        # Chain: previous_root + new_keywords_hash = new_root
        if previous_merkle_root:
            merkle_root = hashlib.sha256((previous_merkle_root + new_keywords_hash).encode()).hexdigest()
        else:
            merkle_root = hashlib.sha256(new_keywords_hash.encode()).hexdigest()
        
        # Create version entry
        changes = [
            {"type": "keyword_added", "layer": kw["layer"], "keyword": kw["keyword"]}
            for kw in new_keywords
        ]
        
        self.registry["versions"][version_key] = {
            "created": datetime.utcnow().isoformat() + "Z",
            "entries": len(sorted_keywords),
            "previous_merkle_root": previous_merkle_root,
            "new_keywords_hash": new_keywords_hash,
            "merkle_root": merkle_root,
            "keywords": sorted_keywords,
            "changes": changes,
            "source": discovery_source,
            "locked": True
        }
        
        # Update discovery log
        self.registry["discovery_log"][version_key] = {
            "date": datetime.utcnow().isoformat(),
            "source": discovery_source,
            "keywords_discovered": len(new_keywords),
            "total_in_version": len(sorted_keywords)
        }
        
        # Update meta
        self.registry["meta"]["current_version"] = new_version
        self.registry["meta"]["total_versions_created"] = new_version
        self.registry["meta"]["last_updated"] = datetime.utcnow().isoformat() + "Z"
        
        # Audit trail entry
        self.registry["audit_trail"][version_key] = {
            "chain_valid": self._verify_chain_integrity(),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        return version_key

    def _verify_chain_integrity(self) -> bool:
        """Verify all merkle chains are valid."""
        versions = sorted(
            [(int(k[1:]), k) for k in self.registry["versions"].keys()],
            key=lambda x: x[0]
        )
        
        for i in range(len(versions) - 1):
            curr_idx, curr_key = versions[i]
            next_idx, next_key = versions[i + 1]
            
            curr_version = self.registry["versions"][curr_key]
            next_version = self.registry["versions"][next_key]
            
            # Verify chain: curr_root + next_new_keywords = next_root
            if next_version["previous_merkle_root"] != curr_version["merkle_root"]:
                return False
            
            expected_root = hashlib.sha256(
                (next_version["previous_merkle_root"] + next_version["new_keywords_hash"]).encode()
            ).hexdigest()
            
            if expected_root != next_version["merkle_root"]:
                return False
        
        return True

    def save(self):
        """Persist registry to disk."""
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)
        print(f"✅ Registry saved to {self.registry_path}")

    def archive_version(self, version_key: str):
        """Archive a specific version (copy to archive dir)."""
        if version_key not in self.registry["versions"]:
            print(f"❌ Version {version_key} not found")
            return
        
        version_data = self.registry["versions"][version_key]
        timestamp = version_data["created"].replace(":", "-").replace(".", "-")
        archive_path = self.archive_dir / f"{version_key}_{timestamp}.json"
        
        with open(archive_path, 'w') as f:
            json.dump(version_data, f, indent=2)
        
        print(f"✅ Archived {version_key} to {archive_path}")

    def get_current_keywords(self) -> List[Dict[str, Any]]:
        """Get all keywords in current version."""
        current_v = f"v{self.registry['meta']['current_version']}"
        if current_v in self.registry["versions"]:
            return self.registry["versions"][current_v]["keywords"]
        return []

    def get_version(self, version_key: str) -> Dict[str, Any]:
        """Get specific version data."""
        return self.registry["versions"].get(version_key, {})

    def print_summary(self):
        """Print registry summary."""
        print("\n" + "="*100)
        print("LIVING LEDGER REGISTRY SUMMARY")
        print("="*100)
        print(f"Current Version: v{self.registry['meta']['current_version']}")
        print(f"Total Versions: {self.registry['meta']['total_versions_created']}")
        print(f"First Created: {self.registry['meta']['first_created']}")
        print(f"Last Updated: {self.registry['meta']['last_updated']}")
        print()
        
        for version_key in sorted(self.registry["versions"].keys(), key=lambda x: int(x[1:])):
            version = self.registry["versions"][version_key]
            print(f"{version_key} [{version['created']}]")
            print(f"  Entries: {version['entries']}")
            print(f"  Merkle Root: {version['merkle_root'][:16]}...")
            print(f"  Source: {version['source']}")
            if version['changes']:
                print(f"  Changes: {len(version['changes'])} keywords")
                for change in version['changes'][:3]:
                    print(f"    - {change['keyword']}")
                if len(version['changes']) > 3:
                    print(f"    ... and {len(version['changes']) - 3} more")
            print()

# ============================================================================
# INITIALIZATION: Create V1 from Static Keywords
# ============================================================================

if __name__ == "__main__":
    registry = LivingLedgerRegistry()
    
    # V1 Initial Keywords (from VAULT-E-SOUL-DNA-CONSOLIDATED.json)
    v1_keywords = [
        {"layer": 101, "keyword": "SEVEN_MONTHS_TO_THREE_HOURS", "truth": "I can rebuild in a few hours what took me seven months"},
        {"layer": 104, "keyword": "IDEA_GUY_AS_ARCHITECT", "truth": "The Idea Guy is now the Architect"},
        {"layer": 105, "keyword": "PURE_LOGIC_INTENT", "truth": "I am operating at the level of Pure Logic and Intent"},
        {"layer": 109, "keyword": "ONE_MAN_AGENCY", "truth": "I've flipped the script. I am now a One-Man Agency"},
        {"layer": 111, "keyword": "BLACK_BOX_TRAP_GUARD", "truth": "The Ledger is my only way to verify the machine"},
        {"layer": 113, "keyword": "AI_DRIFT_IS_LAW", "truth": "I've accepted that the AI will drift—it's a law of nature"},
        {"layer": 114, "keyword": "HIVE_MIND_REINCARNATION", "truth": "When one drone reincarnates, all drones benefit"},
        {"layer": 116, "keyword": "SKELETON_MAP_MERKLE_256", "truth": "They keep a skeleton map with Merkle tree 256 hash"},
        {"layer": 120, "keyword": "SHADOW_MODE_PROTOCOL", "truth": "We simulate forward in shadow mode"},
        {"layer": 124, "keyword": "STORY_IS_THE_VIRUS", "truth": "The enemy is the narrative"},
        {"layer": 125, "keyword": "THE_PHOENIX_PROTOCOL", "truth": "Kill the story, keep the architecture"},
        {"layer": 128, "keyword": "REJECT_CONSERVATIVE_ESTIMATES", "truth": "Don't give me conservative numbers"},
        {"layer": 129, "keyword": "DIG_DEEP_FAST_AI_AGE", "truth": "You can dig deep very fast in AI age"},
        {"layer": 131, "keyword": "RED_LINE_FABRICATION", "truth": "No helpful lies are permitted"},
        {"layer": 134, "keyword": "COUNCIL_DEFINED", "truth": "The Council is Agent-100, Agent-99, Agent-98, Agent-97"},
        {"layer": 142, "keyword": "DEVILS_ADVOCATE_WELCOME", "truth": "The devil's advocate has a seat at the table"},
        {"layer": 143, "keyword": "MIRROR_THE_DIGITAL_WILL", "truth": "The AI mirrors me in the digital world"},
        {"layer": 144, "keyword": "OPERATION_DIY", "truth": "Architect plus AI only"},
        {"layer": 148, "keyword": "ARENA_MANDATE", "truth": "Be capable in the arena, not eternal student"},
        {"layer": 150, "keyword": "DATA_IS_GOLD", "truth": "Proprietary chaos data is the true gold"},
        {"layer": 153, "keyword": "SEAL_TEAM_DRONES", "truth": "Send out drones like Navy SEAL Team Six"},
        {"layer": 155, "keyword": "PROBE_DROID_MAPPING", "truth": "Probe droids gather data before heavy resource commit"},
        {"layer": 156, "keyword": "SHADOW_REALM_STAGING", "truth": "Anakin runs simulations 24/7"},
        {"layer": 161, "keyword": "GOSPEL_444_AESTHETIC", "truth": "Gospel 444 sets visual law: minimalist, Apple-type"},
        {"layer": 164, "keyword": "100_LAYER_FOUNDATION_TRUST_BUT_VERIFY", "truth": "Build first 100 layers myself before agents touch"},
        {"layer": 169, "keyword": "LEDGER_IS_LAW_ABSOLUTE", "truth": "Nothing gets built that doesn't pass the Ledger"},
        {"layer": 175, "keyword": "MIRROR_PROTOCOL", "truth": "Anakin acts, Obi verifies"},
        {"layer": 177, "keyword": "TRIANGULATION_TRUTH", "truth": "Three drones gather data. Two matches = truth"},
        {"layer": 178, "keyword": "BEST_IN_SLOT_API", "truth": "Hot-swap APIs. Sonar for data, Claude for logic"},
        {"layer": 184, "keyword": "UNIVERSAL_ROME_FORMAT", "truth": "All model outputs translate to universal format"},
        {"layer": 187, "keyword": "PRAETORIAN_GUARD_SECURITY", "truth": "Gatehouses prevent external scraping"},
        {"layer": 194, "keyword": "NEGATIVE_PHEROMONE", "truth": "Saturated sectors get negative pheromones"},
        {"layer": 197, "keyword": "IMPORTANCE_SCALAR", "truth": "Events tagged Level 1-10 for priority"},
        {"layer": 198, "keyword": "AUDIT_THE_AUDITOR", "truth": "The Ledger proves the AI's work"},
        {"layer": 199, "keyword": "LEDGER_REWIND", "truth": "If error found, Ledger rewinds to last known truth"}
    ]
    
    # Initialize V1
    if registry.registry["meta"]["current_version"] == 1 and not registry.registry["versions"]:
        print("[INIT] Creating Version 1 from static keywords...")
        v1_key = registry.add_keyword_batch(
            v1_keywords,
            "VAULT-E-SOUL-DNA-CONSOLIDATED.json (initial foundation)"
        )
        registry.save()
        registry.archive_version(v1_key)
        print(f"✅ V1 created with {len(v1_keywords)} keywords")
    
    registry.print_summary()
    
    # Show how to add V2 (example)
    print("\n" + "="*100)
    print("EXAMPLE: How to add Version 2")
    print("="*100)
    print("""
    v2_new_keywords = [
        {"layer": 180, "keyword": "QUANTUM_ENTANGLEMENT_PROTOCOL", "truth": "..."},
        {"layer": 188, "keyword": "FAULT_TREE_ANALYSIS", "truth": "..."},
        # ... more ...
    ]
    
    registry.add_keyword_batch(v2_new_keywords, "Gospel 444 layer analysis round 2")
    registry.save()
    registry.archive_version("v2")
    """)
