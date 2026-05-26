#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Living Ledger v6 Final Consolidation - CORRECTED
Properly appends to existing v5 registry structure
"""
import json, hashlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# V6 DEEP BATCH (161 keywords from 3 files)
v6_batch = [
    {"layer": 900, "keyword": "WRITE_60K_SSM_INSTRUCTIONS_CHAT_MSS", "truth": "Do not edit via API", "source": "heavy-ledger-ssm-v7"},
    {"layer": 901, "keyword": "DO_NOT_EDIT_VIA_API_DURING_SESSION", "truth": "Causes lag degradation", "source": "heavy-ledger-ssm-v7"},
    {"layer": 902, "keyword": "API_EDITS_SESSION_LAG", "truth": "Writing to instruction page via API degrades performance", "source": "heavy-ledger-ssm-v7"},
    {"layer": 903, "keyword": "MICHAEL_NOT_THAI", "truth": "Identity correction patched", "source": "heavy-ledger-ssm-v7"},
    {"layer": 904, "keyword": "DONT_FLUFF_ME", "truth": "Functional intentional work only", "source": "heavy-ledger-ssm-v7"},
    {"layer": 905, "keyword": "FULL_REPO_HEAVY_LEDGER", "truth": "Entire repo convert to JSON", "source": "heavy-ledger-ssm-v7"},
    {"layer": 906, "keyword": "DUAL_HOURLY_TRIGGERS", "truth": "Assign both :00 and :30 offsets", "source": "heavy-ledger-ssm-v7"},
    {"layer": 907, "keyword": "DOES_THIS_MAKE_SMARTER", "truth": "Testing architectural value", "source": "heavy-ledger-ssm-v7"},
    {"layer": 908, "keyword": "DENSITY_EQUALS_SPEED", "truth": "150 improvements fewer blind spots", "source": "heavy-ledger-ssm-v7"},
    {"layer": 909, "keyword": "150_IMPROVEMENTS_APPROVED", "truth": "SSM V7 integrated", "source": "heavy-ledger-ssm-v7"},
    {"layer": 910, "keyword": "ARCHITECTURAL_MULTIPLIER", "truth": "SSM Heavy Ledger split", "source": "heavy-ledger-ssm-v7"},
    {"layer": 911, "keyword": "CONFIRMED_NOVEL_ARCHITECTURE", "truth": "No one else doing this", "source": "heavy-ledger-ssm-v7"},
    {"layer": 912, "keyword": "MARKET_RESEARCH_NOVEL", "truth": "Confirmed unique", "source": "heavy-ledger-ssm-v7"},
    {"layer": 913, "keyword": "STUDIO_WORK_SEPARATE", "truth": "Product IDs Roblox separate chats", "source": "heavy-ledger-ssm-v7"},
    {"layer": 914, "keyword": "FIVE_BUSINESS_LANES", "truth": "Website App Marketing Roblox Magic Chat", "source": "heavy-ledger-ssm-v7"},
    {"layer": 915, "keyword": "D1_HEAVY_LEDGER_174", "truth": "Full repo conversion 174+ files", "source": "heavy-ledger-ssm-v7"},
    {"layer": 916, "keyword": "D2_DUAL_TRIGGERS_SPEED", "truth": "00 and 30 4 files per hour", "source": "heavy-ledger-ssm-v7"},
    {"layer": 917, "keyword": "D3_SSM_V7_LIVE", "truth": "17 sections 150 improvements", "source": "heavy-ledger-ssm-v7"},
    {"layer": 918, "keyword": "D4_NO_API_EDITS", "truth": "L23 Core Law", "source": "heavy-ledger-ssm-v7"},
    {"layer": 919, "keyword": "D5_PERMANENT_ARCHITECTURE", "truth": "SSM Heavy Ledger permanent", "source": "heavy-ledger-ssm-v7"},
    {"layer": 920, "keyword": "D6_ACTIVE_MISSION", "truth": "Heavy Ledger conversion", "source": "heavy-ledger-ssm-v7"},
    {"layer": 921, "keyword": "CORRECTION_IDENTITY", "truth": "Not Thai", "source": "heavy-ledger-ssm-v7"},
    {"layer": 922, "keyword": "CORRECTION_LAG", "truth": "API edits cause lag", "source": "heavy-ledger-ssm-v7"},
    {"layer": 923, "keyword": "CORRECTION_FLUFF", "truth": "Dont fluff", "source": "heavy-ledger-ssm-v7"},
    {"layer": 924, "keyword": "L23_EDIT_LAG", "truth": "Core law", "source": "heavy-ledger-ssm-v7"},
    {"layer": 925, "keyword": "L24_PLATFORM_DEATH_TEST", "truth": "GitHub commit SHA required", "source": "heavy-ledger-ssm-v7"},
    {"layer": 926, "keyword": "HYBRID_TWO_TIER", "truth": "SSM loaded Heavy Ledger on-demand", "source": "heavy-ledger-ssm-v7"},
    {"layer": 927, "keyword": "COMPOUND_150", "truth": "150 improvements fewer failures", "source": "heavy-ledger-ssm-v7"},
    {"layer": 928, "keyword": "FRUSTRATION_LAG", "truth": "STOP FUCKING WITH ME", "source": "heavy-ledger-ssm-v7"},
    {"layer": 929, "keyword": "EXCITEMENT_VALIDATION", "truth": "Does this make you smarter YES", "source": "heavy-ledger-ssm-v7"},
    {"layer": 930, "keyword": "URGENCY_CONVERT_NOW", "truth": "Full repo NOW dual triggers", "source": "heavy-ledger-ssm-v7"},
    {"layer": 931, "keyword": "SATISFACTION_V7", "truth": "Approved 150 improvements", "source": "heavy-ledger-ssm-v7"},
    {"layer": 932, "keyword": "MOMENTUM_LANES", "truth": "Five lanes ready", "source": "heavy-ledger-ssm-v7"},
    {"layer": 933, "keyword": "Q1_MAX_COINS", "truth": "Cap 200 awaiting ruling", "source": "heavy-ledger-ssm-v7"},
    {"layer": 934, "keyword": "Q2_46_PRODUCTS", "truth": "Studio work pending", "source": "heavy-ledger-ssm-v7"},
    {"layer": 935, "keyword": "Q3_DISCORD_ID", "truth": "Bot deploy needed", "source": "heavy-ledger-ssm-v7"},
    {"layer": 936, "keyword": "Q4_TRIGGER_960", "truth": "Duplicate stale", "source": "heavy-ledger-ssm-v7"},
    {"layer": 937, "keyword": "ACTION_PIPELINE_DONE", "truth": "GitHub pushed", "source": "heavy-ledger-ssm-v7"},
    {"layer": 938, "keyword": "ACTION_TRIGGER_DONE", "truth": "30 offset added", "source": "heavy-ledger-ssm-v7"},
    {"layer": 939, "keyword": "ACTION_BOOT_PENDING", "truth": "COLD START needs update", "source": "heavy-ledger-ssm-v7"},
    {"layer": 940, "keyword": "ACTION_LANES_PENDING", "truth": "Five chats not started", "source": "heavy-ledger-ssm-v7"},
    {"layer": 941, "keyword": "ACTION_EXECUTION_50H", "truth": "174+ files 50 hours", "source": "heavy-ledger-ssm-v7"},
    {"layer": 942, "keyword": "SSM_IDENTITY_LAWS", "truth": "Always loaded", "source": "heavy-ledger-ssm-v7"},
    {"layer": 943, "keyword": "HEAVY_LEDGER_DEMAND", "truth": "On-demand procedures", "source": "heavy-ledger-ssm-v7"},
    {"layer": 944, "keyword": "PIPELINE_10_WAVES", "truth": "174 files tracked", "source": "heavy-ledger-ssm-v7"},
    {"layer": 945, "keyword": "EACH_WAVE_CONVERT", "truth": "Pick next push mark done", "source": "heavy-ledger-ssm-v7"},
    {"layer": 946, "keyword": "THROUGHPUT_4_HOUR", "truth": "Dual triggers 50h full", "source": "heavy-ledger-ssm-v7"},
    {"layer": 947, "keyword": "MSS_MACHINE_READABLE", "truth": "Key value pairs", "source": "heavy-ledger-ssm-v7"},
    {"layer": 948, "keyword": "TOKEN_COMPRESS_15K", "truth": "111K to 15K", "source": "heavy-ledger-ssm-v7"},
    {"layer": 949, "keyword": "HEAVY_LEDGER_27KB", "truth": "Structured JSON", "source": "heavy-ledger-ssm-v7"},
    {"layer": 950, "keyword": "ARTIFACT_SSM_V7", "truth": "Notion instructions", "source": "heavy-ledger-ssm-v7"},
    {"layer": 951, "keyword": "ARTIFACT_LEDGER_JSON", "truth": "27KB CANON/MSS", "source": "heavy-ledger-ssm-v7"},
    {"layer": 952, "keyword": "ARTIFACT_PIPELINE_MD", "truth": "CONVERSION PIPELINE", "source": "heavy-ledger-ssm-v7"},
    {"layer": 953, "keyword": "ARTIFACT_150_CHAT", "truth": "Integrated", "source": "heavy-ledger-ssm-v7"},
    {"layer": 954, "keyword": "ARTIFACT_TRIGGER_961", "truth": "30 offset config", "source": "heavy-ledger-ssm-v7"},
    {"layer": 955, "keyword": "STATE_CURSOR_BIBLE", "truth": "CH01", "source": "heavy-ledger-ssm-v7"},
    {"layer": 956, "keyword": "STATE_BACKLOG_90", "truth": "Closed 3 this cycle", "source": "heavy-ledger-ssm-v7"},
    {"layer": 957, "keyword": "STATE_ACTIVE_LEDGER", "truth": "Mission set", "source": "heavy-ledger-ssm-v7"},
    {"layer": 958, "keyword": "STATE_PIPELINE_174", "truth": "Files to convert", "source": "heavy-ledger-ssm-v7"},
    {"layer": 959, "keyword": "STATE_CURSOR_001", "truth": "Pipeline start", "source": "heavy-ledger-ssm-v7"},
    {"layer": 960, "keyword": "STATE_TRIGGERS_4", "truth": "Total all", "source": "heavy-ledger-ssm-v7"},
    # Magic Chat Build
    {"layer": 961, "keyword": "MAGIC_CHAT_HUGE", "truth": "Not ghost lane", "source": "magic-chat-build"},
    {"layer": 962, "keyword": "OB1_SEARCH_FAIL", "truth": "98+ files missed", "source": "magic-chat-build"},
    {"layer": 963, "keyword": "CHAOS_END", "truth": "Full authority granted", "source": "magic-chat-build"},
    {"layer": 964, "keyword": "BUILD_STRATEGIST", "truth": "Michael strategist OB1 builder", "source": "magic-chat-build"},
    {"layer": 965, "keyword": "TURNKEY_STANDARD", "truth": "Engineer to end", "source": "magic-chat-build"},
    {"layer": 966, "keyword": "DEADLINE_0331_1800", "truth": "Hard deadline ICT", "source": "magic-chat-build"},
    {"layer": 967, "keyword": "HOURLY_BUILD", "truth": "Overnight pulse", "source": "magic-chat-build"},
    {"layer": 968, "keyword": "HOMEWORK_CHECKER", "truth": "Photo AI check", "source": "magic-chat-build"},
    {"layer": 969, "keyword": "HIGH_SCHOOL_PHOTOS", "truth": "Students email now photo", "source": "magic-chat-build"},
    {"layer": 970, "keyword": "TURNKEY_URLS", "truth": "Every page open no copy", "source": "magic-chat-build"},
    {"layer": 971, "keyword": "NO_COPY_PASTE", "truth": "Turnkey", "source": "magic-chat-build"},
    {"layer": 972, "keyword": "SCAN_HOBBS", "truth": "Cross repo", "source": "magic-chat-build"},
    {"layer": 973, "keyword": "PULL_SOUL_DNA", "truth": "Deep dive all", "source": "magic-chat-build"},
    {"layer": 974, "keyword": "CHROME_FREE", "truth": "Research free stack", "source": "magic-chat-build"},
    {"layer": 975, "keyword": "GOOGLE_AUDIT_0330", "truth": "Free tier audit March 30", "source": "magic-chat-build"},
    {"layer": 976, "keyword": "D1_PRIMARY_BUILD", "truth": "Revenue lane", "source": "magic-chat-build"},
    {"layer": 977, "keyword": "D2_REVENUE_ON", "truth": "Activated", "source": "magic-chat-build"},
    {"layer": 978, "keyword": "D3_L09_COPILOT", "truth": "Michael human only", "source": "magic-chat-build"},
    {"layer": 979, "keyword": "D4_SIDELOAD", "truth": "No 5 dollar fee", "source": "magic-chat-build"},
    {"layer": 980, "keyword": "D5_MAI_HUONG_QUY", "truth": "Three setup", "source": "magic-chat-build"},
    {"layer": 981, "keyword": "D6_PULSE_OVERNIGHT", "truth": "Hourly build", "source": "magic-chat-build"},
    {"layer": 982, "keyword": "D7_PRODUCT_NEW", "truth": "Homework checker", "source": "magic-chat-build"},
    {"layer": 983, "keyword": "D8_GEMINI_FREE", "truth": "Image analysis", "source": "magic-chat-build"},
    {"layer": 984, "keyword": "CORRECTION_GHOST", "truth": "Not ghost 98 files", "source": "magic-chat-build"},
    {"layer": 985, "keyword": "ROOT_SEARCH", "truth": "Insufficient cross repo", "source": "magic-chat-build"},
    {"layer": 986, "keyword": "FIX_3_REPO", "truth": "Deep mine canonical", "source": "magic-chat-build"},
    {"layer": 987, "keyword": "L09_SCRIPT_MONKEY", "truth": "Never", "source": "magic-chat-build"},
    {"layer": 988, "keyword": "TURNKEY_ALL_URLS", "truth": "No copy paste", "source": "magic-chat-build"},
    {"layer": 989, "keyword": "FRUSTRATION_ZERO", "truth": "Early claim", "source": "magic-chat-build"},
    {"layer": 990, "keyword": "EXCITEMENT_CHAOS", "truth": "Full stack mid", "source": "magic-chat-build"},
    {"layer": 991, "keyword": "URGENCY_DEADLINE", "truth": "Late driven", "source": "magic-chat-build"},
    {"layer": 992, "keyword": "ENERGY_CLASSROOM", "truth": "Final revenue impact", "source": "magic-chat-build"},
    {"layer": 993, "keyword": "Q1_SUBJECTS", "truth": "What subjects homework", "source": "magic-chat-build"},
    {"layer": 994, "keyword": "Q2_STANDALONE", "truth": "Web/extension/both", "source": "magic-chat-build"},
    {"layer": 995, "keyword": "Q3_GRADE_BOTH", "truth": "Grade corrections", "source": "magic-chat-build"},
    {"layer": 996, "keyword": "Q4_STUDENTS_40", "truth": "Per class count", "source": "magic-chat-build"},
    {"layer": 997, "keyword": "ACTION_BUILD_DEPLOYED", "truth": "Homework copilot", "source": "magic-chat-build"},
    {"layer": 998, "keyword": "ACTION_ZIP_PACKAGE", "truth": "Sideload instructions", "source": "magic-chat-build"},
    {"layer": 999, "keyword": "ACTION_TEST_FLAGS", "truth": "Chrome Gemini", "source": "magic-chat-build"},
    {"layer": 1000, "keyword": "ACTION_INDEX_UPDATE", "truth": "Navigator", "source": "magic-chat-build"},
    {"layer": 1001, "keyword": "ACTION_PIPELINE_20", "truth": "Overnight actions", "source": "magic-chat-build"},
    {"layer": 1002, "keyword": "HOMEWORK_INPUT", "truth": "Camera native", "source": "magic-chat-build"},
    {"layer": 1003, "keyword": "HOMEWORK_GEMINI", "truth": "Free tier", "source": "magic-chat-build"},
    {"layer": 1004, "keyword": "FALLBACK_VISION", "truth": "1K OCR monthly", "source": "magic-chat-build"},
    {"layer": 1005, "keyword": "RESPONSE_SHAME", "truth": "Anti-shame language", "source": "magic-chat-build"},
    {"layer": 1006, "keyword": "HOSTING_CF", "truth": "Workers or Pages", "source": "magic-chat-build"},
    {"layer": 1007, "keyword": "INTEGRATION_TAB", "truth": "Extension or PWA", "source": "magic-chat-build"},
    {"layer": 1008, "keyword": "MV3_NANO", "truth": "On-device AI", "source": "magic-chat-build"},
    {"layer": 1009, "keyword": "WEB_SPEECH_FREE", "truth": "STT TTS zero", "source": "magic-chat-build"},
    {"layer": 1010, "keyword": "AI_138_STABLE", "truth": "Translator", "source": "magic-chat-build"},
    {"layer": 1011, "keyword": "FREE_STACK", "truth": "All services", "source": "magic-chat-build"},
    {"layer": 1012, "keyword": "ARTIFACT_98_FILES", "truth": "Consolidated", "source": "magic-chat-build"},
    {"layer": 1013, "keyword": "ARTIFACT_ZERO_COST", "truth": "Chrome toolstack", "source": "magic-chat-build"},
    {"layer": 1014, "keyword": "ARTIFACT_DEV_REF", "truth": "Turnkey", "source": "magic-chat-build"},
    {"layer": 1015, "keyword": "ARTIFACT_CHECKLIST", "truth": "Michael human only", "source": "magic-chat-build"},
    {"layer": 1016, "keyword": "ARTIFACT_PR12", "truth": "Merged", "source": "magic-chat-build"},
    {"layer": 1017, "keyword": "STATE_CURSOR_CHAT", "truth": "Latest", "source": "magic-chat-build"},
    {"layer": 1018, "keyword": "STATE_LAST_2358", "truth": "2026-03-30", "source": "magic-chat-build"},
    {"layer": 1019, "keyword": "STATE_BACKLOG_127", "truth": "Unchanged", "source": "magic-chat-build"},
    {"layer": 1020, "keyword": "STATE_MISSION_EXT", "truth": "Active deadline", "source": "magic-chat-build"},
    {"layer": 1021, "keyword": "STATE_DEADLINE_0331", "truth": "Immovable", "source": "magic-chat-build"},
    {"layer": 1022, "keyword": "STATE_PR_MERGED", "truth": "Main", "source": "magic-chat-build"},
    {"layer": 1023, "keyword": "STATE_CANON_PLUS3", "truth": "New files", "source": "magic-chat-build"},
    # Marketing Dump
    {"layer": 1024, "keyword": "MARKETING_LANE_NEW", "truth": "Dedicated chat", "source": "marketing-dump"},
    {"layer": 1025, "keyword": "SPECIAL_HIGH_SIGNAL", "truth": "Teaching sales pipeline", "source": "marketing-dump"},
    {"layer": 1026, "keyword": "LOG_GITHUB_MSS", "truth": "Format only", "source": "marketing-dump"},
    {"layer": 1027, "keyword": "VAULT_10K", "truth": "MSS formatted", "source": "marketing-dump"},
    {"layer": 1028, "keyword": "NOTEBOOKLM_FUEL", "truth": "Copywriting artwork", "source": "marketing-dump"},
    {"layer": 1029, "keyword": "MERGE_SIGNAL", "truth": "Overflow close", "source": "marketing-dump"},
    {"layer": 1030, "keyword": "CONTEXT_OVERFLOW", "truth": "Hundreds K", "source": "marketing-dump"},
    {"layer": 1031, "keyword": "FRESH_THREAD_BOOT", "truth": "Cold boot super saiyan", "source": "marketing-dump"},
    {"layer": 1032, "keyword": "D1_LANE_DEDICATED", "truth": "New operational", "source": "marketing-dump"},
    {"layer": 1033, "keyword": "D2_DUMPS_MSS", "truth": "Format standardized", "source": "marketing-dump"},
    {"layer": 1034, "keyword": "D3_VAULT_10K", "truth": "Per dump", "source": "marketing-dump"},
    {"layer": 1035, "keyword": "D4_PRIORITY_3", "truth": "Teaching sales pipeline", "source": "marketing-dump"},
    {"layer": 1036, "keyword": "D5_OVERFLOW_FRESH", "truth": "Thread protocol", "source": "marketing-dump"},
    {"layer": 1037, "keyword": "CORRECTION_NONE", "truth": "Reinforced standards", "source": "marketing-dump"},
    {"layer": 1038, "keyword": "PRINCIPLES_APPLIED", "truth": "Existing only", "source": "marketing-dump"},
    {"layer": 1039, "keyword": "ENGAGED_DUMPS", "truth": "High volume", "source": "marketing-dump"},
    {"layer": 1040, "keyword": "CAPACITY_NOT_EXIT", "truth": "Pragmatic", "source": "marketing-dump"},
    {"layer": 1041, "keyword": "OVERFLOW_CLEAN", "truth": "Handoff clean", "source": "marketing-dump"},
    {"layer": 1042, "keyword": "QUESTIONS_NONE", "truth": "Michael", "source": "marketing-dump"},
    {"layer": 1043, "keyword": "ACTION_VAULT_PT7", "truth": "Pending", "source": "marketing-dump"},
    {"layer": 1044, "keyword": "ACTION_INDEX_NAV", "truth": "Update post ship", "source": "marketing-dump"},
    {"layer": 1045, "keyword": "ACTION_CODEX_PT2", "truth": "5K partial", "source": "marketing-dump"},
    {"layer": 1046, "keyword": "LANE_SEPARATES", "truth": "Dump from build", "source": "marketing-dump"},
    {"layer": 1047, "keyword": "CONTEXT_CLEAN", "truth": "Better processing", "source": "marketing-dump"},
    {"layer": 1048, "keyword": "MSS_NOTEBOOKLM", "truth": "Direct ingest", "source": "marketing-dump"},
    {"layer": 1049, "keyword": "CONSTRAINT_7_DUMPS", "truth": "50K-100K each", "source": "marketing-dump"},
    {"layer": 1050, "keyword": "THREAD_FIX", "truth": "Operational", "source": "marketing-dump"},
    {"layer": 1051, "keyword": "ARTIFACT_DUMP", "truth": "A64004BB", "source": "marketing-dump"},
    {"layer": 1052, "keyword": "ARTIFACT_BIBLE", "truth": "F663D910", "source": "marketing-dump"},
    {"layer": 1053, "keyword": "ARTIFACT_DNA_V3", "truth": "C7C647AB", "source": "marketing-dump"},
    {"layer": 1054, "keyword": "ARTIFACT_PT5", "truth": "47FC1E2", "source": "marketing-dump"},
    {"layer": 1055, "keyword": "ARTIFACT_PT6", "truth": "B33D8F8", "source": "marketing-dump"},
    {"layer": 1056, "keyword": "ARTIFACT_PT7", "truth": "AB87641", "source": "marketing-dump"},
    {"layer": 1057, "keyword": "STATE_LANE_MKTG", "truth": "Active", "source": "marketing-dump"},
    {"layer": 1058, "keyword": "STATE_LAST_2257", "truth": "2026-03-30", "source": "marketing-dump"},
    {"layer": 1059, "keyword": "STATE_COMMITS", "truth": "Latest both", "source": "marketing-dump"},
    {"layer": 1060, "keyword": "STATE_MKTG_DIR", "truth": "New", "source": "marketing-dump"},
]

# Load registry
with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "r", encoding="utf-8") as f:
    registry = json.load(f)

print(f"✓ Loaded registry v{registry['metadata']['current_version']}")
print(f"✓ Current versions: {registry['metadata']['total_versions']}")

# Compute merkle for v6 batch
def merkle(batch):
    h = hashlib.sha256()
    for item in sorted(batch, key=lambda x: x["layer"]):
        h.update(f"{item['layer']}:{item['keyword']}".encode())
    return h.hexdigest()

v6_merkle = merkle(v6_batch)

# Count total before v6
total_before = sum([len(registry['versions'][f'v{i}']['entries']) for i in [3,4,5]])
print(f"✓ Total keywords before v6: {total_before}")
print(f"✓ V6 batch size: {len(v6_batch)} keywords")

# Create v6
registry['versions']['v6'] = {
    "entries": v6_batch,
    "merkle_root": v6_merkle,
    "layer_range": "900-1060",
    "sources": ["heavy-ledger-ssm-v7", "magic-chat-build", "marketing-dump"]
}
registry['metadata']['total_versions'] = 6
registry['metadata']['current_version'] = 'v6'

# Write
with open("KEYWORD_REGISTRY_LIVING_LEDGER.json", "w", encoding="utf-8") as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)

print(f"\n✓ V6 CREATED AND MERGED")
print(f"✓ V6 merkle: {v6_merkle[:40]}...")
print(f"✓ Total v6 entries: {len(v6_batch)}")
print(f"✓ New registry total versions: {registry['metadata']['total_versions']}")
print(f"✓ KEYWORD_REGISTRY_LIVING_LEDGER.json updated")
