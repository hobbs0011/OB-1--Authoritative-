# RAW VERBATIM — FULL_SYSTEM_SAVE_v1.txt
## Corpus Metadata
- chunk_seq   : 0306
- chunk_id    : 0306-RAW-FULL_SYSTEM_SAVE_v1_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\FULL_SYSTEM_SAVE_v1.txt
- sha256      : 4A0FDFD073964508E402152F2597BF2799C3257CEC154FCDB5C1D57B07075EC6
- size_bytes  : 1624
- lines       : 65
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : 

---
=== FULL_SYSTEM_SAVE_V1 ===
PAYLOAD_TYPE: SYSTEM_SNAPSHOT
VERSION: 1.0

INCLUDES:
- CORE SEEDS
- DATA CRUNCHER SEED
- OLD CHAT HARVEST SEED
- BLUEPRINT PAYLOADS
- ENGINE CONFIG
- RUNTIME META
- COMMANDSTATION PROTOCOLS

-------------------------------------------
SEED: DATA_CRUNCHER_SEED_V1
-------------------------------------------
[DATASET]
NAME: OldChat-DataCruncher
DESCRIPTION: Aggregates and normalizes long-history conversation logs into structured engine-ready JSON packets.
SCHEMA:
{
  "type": "chat_harvest_packet",
  "source": "legacy_chats",
  "timestamp_generated": "<auto>",
  "payload": {
      "nodes": [],
      "relationships": [],
      "memory_candidates": [],
      "topic_clusters": [],
      "timeline": [],
      "missing_links": []
  }
}
PROCESSORS:
- cluster.topic()
- extract.entities()
- map.runtimememory()
- time.ordering()
- anomaly.spotter()

-------------------------------------------
SEED: OLD_CHAT_HARVEST_ENGINE_V1
-------------------------------------------
PROCESS:
1) Load all txt/json/md files from ./OldChats/
2) Run through DataCruncher
3) Output ? system-snapshots/harvest_output/
4) Final export ? seeds/harvest-compiled.json
5) Mark all consumed chats as archived

-------------------------------------------
SEED: MASTER_BLUEPRINT_V10_POINTER
-------------------------------------------
Stored externally as FINAL_MASTER_BLUEPRINT_ACQUISITION_V10

-------------------------------------------
ENGINE_RUNTIME
config:
  enable_multinode_pipeline: true
  enable_seed_overrides: true
  validate_checksum_on_restore: true

-------------------------------------------
END_PAYLOAD

