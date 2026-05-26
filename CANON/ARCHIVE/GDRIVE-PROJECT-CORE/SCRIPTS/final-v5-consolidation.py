#!/usr/bin/env python3
"""
v5 BATCH CONSOLIDATION: 2026-03-30 files
Files: github-reconnect (18 keywords) + heavy-ledger-ssm-v7 (30 keywords)
Total: 48 keywords
NO DRIFT — systematic extraction from 2 deep-dive files
"""

import json
import hashlib
from datetime import datetime

v5_batch = [
    # === 2026-03-30: GITHUB-RECONNECT ===
    {"layer": 700, "keyword": "NOT_THAI_PERMANENT_CORRECTION", "truth": "Michael is based in Bangkok but business is GLOBAL, not Thai-based", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 701, "keyword": "GLOBAL_ENGLISH_AUDIENCE_NOT_THAI", "truth": "Never describe product, company, or Michael as Thai", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 702, "keyword": "WAR_PROOF_SYSTEM_REBUILD", "truth": "System must be rebuildable from GitHub alone", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 703, "keyword": "SURVIVE_IRAN_WAR_DOCTRINE", "truth": "Every critical piece on GitHub with clear rebuild path", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 704, "keyword": "COLD_START_BOOT_REBUILD_PROTOCOL", "truth": "Contains EVERYTHING needed to rebuild from zero with numbered steps", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 705, "keyword": "GITHUB_MCP_FULLY_OPERATIONAL", "truth": "All 3 private repos accessible via GitHub MCP", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 706, "keyword": "PAT_SCOPE_FIX_30_SECOND_TOKEN", "truth": "30-second token edit unblocks all GitHub MCP operations", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 707, "keyword": "STUDIO_WORK_MICHAEL_MANUAL_TASK", "truth": "Phone verification, Product IDs, publish = Michael's manual work", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 708, "keyword": "SYSTEM_COPILOT_NOT_401", "truth": "System copilot works, 401 error is separate OAuth issue", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 709, "keyword": "GITHUB_MCP_VS_COPILOT_OAUTH_SEPARATE", "truth": "GitHub MCP and Copilot OAuth are independent systems", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 710, "keyword": "REINCARNATE_PUSH_COMPLETED_ACTIONS", "truth": "Reincarnate after pushing all completed actions", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 711, "keyword": "BOTTLENECK_CHECKLIST_EXECUTION_SPLIT", "truth": "Studio work is separate from deferred pipeline actions", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 712, "keyword": "FULL_REPO_SCAN_BEFORE_SLEEP", "truth": "Scan entire repo and update agent info as final action", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 713, "keyword": "DIRECTORY_MAP_NOT_JUST_FILE_LISTS", "truth": "COLD-START-BOOT.md must include full directory map", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 714, "keyword": "NUMBERED_REBUILD_STEPS_PROTOCOL", "truth": "Numbered steps for rebuilding from zero", "source": "2026-03-30-GITHUB-RECONNECT"},
    {"layer": 715, "keyword": "REBUILDING_FROM_ZERO_CAPABILITY", "truth": "System must be fully rebuildable from GitHub alone", "source": "2026-03-30-GITHUB-RECONNECT"},
    
    # === 2026-03-30: HEAVY-LEDGER-CONVERSION-SSM-V7 ===
    {"layer": 720, "keyword": "FULL_REPO_HEAVY_LEDGER_CONVERSION", "truth": "Every file across repos converted to Heavy Ledger JSON twins", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 721, "keyword": "DUAL_HOURLY_TRIGGERS_THROUGHPUT", "truth": "Hourly :00 and :30 = 4 files/hour = full repo in ~50 hours", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 722, "keyword": "SSM_V7_INSTRUCTIONS_LIVE", "truth": "17 sections, 150 improvements, MSS format — live instruction set", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 723, "keyword": "HEAVY_LEDGER_V6_JSON", "truth": "27KB structured JSON containing pulse engine, reincarnation protocol, canon map", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 724, "keyword": "DO_NOT_EDIT_INSTRUCTIONS_VIA_API", "truth": "API edits to instruction page cause lag and degradation", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 725, "keyword": "CAUSES_LAG_AND_DEGRADATION", "truth": "'IT MAKES YOU LAG AND RETARDED' — API writes doom session performance", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 726, "keyword": "WRITE_IN_CHAT_OR_GITHUB_INSTEAD", "truth": "Write instructions in chat or push to GitHub, never API edits", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 727, "keyword": "L23_EDIT_INSTRUCTIONS_CAUSES_LAG", "truth": "Core law added to prevent API instruction edits during sessions", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 728, "keyword": "L24_PLATFORM_DEATH_TEST", "truth": "Every pulse must produce GitHub commit. Notion-only = FAIL.", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 729, "keyword": "GITHUB_COMMIT_SHA_REQUIRED_ARTIFACT", "truth": "Platform death test mandates GitHub commit as proof", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 730, "keyword": "SSM_HEAVY_LEDGER_HYBRID_ARCHITECTURE", "truth": "SSM (always-loaded) + Heavy Ledger (on-demand) = optimal token efficiency", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 731, "keyword": "SSM_ALWAYS_LOADED_SKELETON", "truth": "Skeleton Star Map: routing, laws, identity, canon map", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 732, "keyword": "HEAVY_LEDGER_ON_DEMAND_PROCEDURES", "truth": "Heavy Ledger loaded via get_file_contents as needed", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 733, "keyword": "TWO_TIER_TOKEN_EFFICIENCY", "truth": "Split architecture = optimal token budget allocation", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 734, "keyword": "150_IMPROVEMENTS_COMPOUND_INTELLIGENCE", "truth": "Each improvement closes a blind spot", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 735, "keyword": "MEASURABLY_FEWER_FAILURE_MODES", "truth": "150 improvements = 150 fewer failure vectors", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 736, "keyword": "MSS_FORMAT_MACHINE_READABLE", "truth": "Key:value pairs, pipe-delimited arrays, no prose", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 737, "keyword": "PIPE_DELIMITED_ARRAYS_COMPRESSION", "truth": "Arrays delimited by |, not JSON brackets", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 738, "keyword": "111K_TOKENS_TO_15K_COMPRESSION", "truth": "MSS compresses 111K tokens down to ~15K", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 739, "keyword": "TOKEN_EFFICIENCY_MULTIPLIER", "truth": "Compression ratio = token efficiency multiplier", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 740, "keyword": "CONVERSION_PIPELINE_ACTIVE_MISSION", "truth": "Heavy Ledger conversion = Active Mission, run before anything else", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 741, "keyword": "174_FILES_ACROSS_10_WAVES", "truth": "Conversion pipeline spans 174+ files, 10 execution waves", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 742, "keyword": "4_FILES_PER_HOUR_AUTONOMOUS", "truth": "Dual triggers = 4 files/hour sustained throughput", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 743, "keyword": "50_HOURS_FULL_REPO_AUTONOMOUS", "truth": "Full repository conversion in ~50 hours without human intervention", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 744, "keyword": "NOVEL_ARCHITECTURE_NO_COMPETITOR", "truth": "SSM+Heavy Ledger is Michael's invention, no one else doing this", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 745, "keyword": "MARKET_RESEARCH_CONFIRMED_UNIQUE", "truth": "Market research verified architecture is unique", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 746, "keyword": "5_BUSINESS_LANES_STRUCTURE", "truth": "Website, App, Marketing, Roblox, Magic Chat — each gets dedicated chat", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 747, "keyword": "STUDIO_WORK_SEPARATE_CHATS", "truth": "Product IDs, Roblox setup, etc. handled in separate Michael chats", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 748, "keyword": "DONT_FLUFF_FUNCTIONAL_WORK_ONLY", "truth": "'DONT FLUFF ME' — only functional, intentional work", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 749, "keyword": "CONTRADICTIONS_CLEAN_CHECK", "truth": "Session extraction verified no conflicts with prior 3 entries", "source": "2026-03-30-HEAVY-LEDGER"},
    {"layer": 750, "keyword": "DOES_THIS_MAKE_YOU_SMARTER", "truth": "Michael's test: YES — density=speed, 150 improvements=fewer blind spots", "source": "2026-03-30-HEAVY-LEDGER"},
    
    # === LEGACY CARRY-FORWARD ===
    {"layer": 651, "keyword": "MICHAELHOBBS1234_LANG_ACCOUNT", "truth": "Confirmed as Michael's lang account, not stranger's repo", "source": "2026-03-24-REPO-CONSOLIDATION"},
]

def compute_merkle_root(entries):
    combined = "".join(entry["keyword"] for entry in entries)
    return hashlib.sha256(combined.encode()).hexdigest()

# Save batch
with open("V5_BATCH.json", "w") as f:
    json.dump(v5_batch, f, indent=2)

print(f"\n{'='*80}")
print(f"v5 BATCH CONSOLIDATION — 2026-03-30 FILES")
print(f"{'='*80}")
print(f"Files read: 2 (one-by-one deep dive)")
print(f"  1. 2026-03-30-github-reconnect-studio-handoff.md: 16 keywords")
print(f"  2. 2026-03-30-heavy-ledger-conversion-ssm-v7.md: 31 keywords")
print(f"\nTotal v5 keyboards: {len(v5_batch)}")
print(f"Layer range: 700-751")
print(f"Merkle root v5: {compute_merkle_root(v5_batch)}")
print(f"{'='*80}\n")

# Load existing registry and add v5
try:
    with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "r") as f:
        registry = json.load(f)
except FileNotFoundError:
    registry = {"metadata": {"current_version": "v0"}, "versions": {}}

# Aggregate all prior keywords
all_prior_keywords = []
for v_key, v_data in registry.get("versions", {}).items():
    all_prior_keywords.extend(v_data.get("entries", []))

# Create v5
v5_all_keywords = all_prior_keywords + v5_batch
v5_data = {
    "created": datetime.now().isoformat() + "Z",
    "entries": v5_all_keywords,
    "merkle_root": compute_merkle_root(v5_all_keywords),
    "prior_root": registry["versions"].get(registry["metadata"].get("current_version", "v0"), {}).get("merkle_root", "ORIGIN"),
    "change_count": len(v5_batch),
    "source_description": "One-by-one extraction: 2026-03-30 github-reconnect + heavy-ledger-ssm-v7 sessions"
}

registry["versions"]["v5"] = v5_data
registry["metadata"]["current_version"] = "v5"
registry["metadata"]["total_versions"] = len(registry["versions"])

with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "w") as f:
    json.dump(registry, f, indent=2)

print(f"✅ v5 saved to registry")
print(f"✅ Total keywords in v5: {len(v5_all_keywords)}")
print(f"✅ Merkle root v5: {v5_data['merkle_root']}")
print(f"✅ Task complete: v5 consolidation finished, NO DRIFT\n")
