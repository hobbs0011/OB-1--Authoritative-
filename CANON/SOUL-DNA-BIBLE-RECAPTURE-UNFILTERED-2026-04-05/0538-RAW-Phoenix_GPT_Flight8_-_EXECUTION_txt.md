# RAW VERBATIM — Phoenix GPT [Flight8] - EXECUTION.txt
## Corpus Metadata
- chunk_seq   : 0538
- chunk_id    : 0538-RAW-Phoenix_GPT_Flight8_-_EXECUTION_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix GPT [Flight8] - EXECUTION.txt
- sha256      : 814D51B88FACDF70CFD369E65F6344634E7E548CACA1A4B29510174417819CCF
- size_bytes  : 485
- lines       : 22
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX

---
name = "phoenix-empire"
main = "src/index.js"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "PHOENIX_LEDGER", class_name = "PhoenixLedgerDOv2" }
]

[[migrations]]
tag = "v66-new-sqlite-class"
new_sqlite_classes = ["PhoenixLedgerDOv2"]

[vars]
PHOENIX_VERSION = "v67.0-REVENUE-PIPELINE"
GOSPEL = "444"

[vars]
ALLOWED_ORIGINS = "https://magic-chat-phoenix.vercel.app"
CHAT_RPM = "60"
CHAT_TIMEOUT_MS = "20000"
MAX_BODY_BYTES = "65536"
