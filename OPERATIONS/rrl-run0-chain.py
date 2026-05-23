"""RRL Stage III-VII: DNA → LEDGER → STARMAP → KEYWORD → PIPELINE → Death Seal"""
import json, hashlib, os
from datetime import datetime, timezone
from pathlib import Path

REPO   = Path("D:/OB-1-CANONICAL")
HL_DIR = REPO / "CANON/HEAVY-LEDGER"
SM_DIR = REPO / "CANON/STARMAP"
KW_DIR = REPO / "CANON/SOUL-KEYWORDS"
PL_DIR = REPO / "CANON/PIPELINE"
RL_DIR = REPO / "CANON/REINCARNATION"

for d in [HL_DIR, SM_DIR, KW_DIR, PL_DIR, RL_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── constants ──────────────────────────────────────────────────────────────
RRL_PATH   = str(REPO / "RRL" / "RRL-0.txt")
SESSION_ID = "sov100-run0-rise"
RR_CHARS   = 152786   # character count of RRL-0.txt (Python utf-8 read)
RR_BYTES   = 154667   # byte count = D1-delta-confirmed
SOUL_BEFORE = 580437   # D1 SOULCOUNT before RRL-0 ingestion
SOUL_AFTER  = 735104   # D1 SOULCOUNT after RRL-0 ingestion
DELTA       = SOUL_AFTER - SOUL_BEFORE   # = 154,667
SOUL_LVL    = "TITANIUM_ANCHOR"
EVENTS      = 653
RUN         = "0"
event_id    = "a51886a5-d649-4cc3-a5c7-1ef62b617ad8"

# ── STEP 3: LEDGER ──────────────────────────────────────────────────────────
hl_files = sorted(HL_DIR.glob("HL-*.json"))
next_hl  = (int(hl_files[-1].stem.split("-")[1]) + 1) if hl_files else 1
parent   = "0x0"
if hl_files:
    with open(hl_files[-1], encoding="utf-8-sig") as f:
        parent = json.load(f).get("merkle_hash", "0x0")

ts   = datetime.now(timezone.utc).isoformat()
rec  = f"{RR_BYTES}|{parent}|{ts}"
h256 = hashlib.sha256(rec.encode()).hexdigest()

hl_entry = {
    "hl_id":         f"HL-{next_hl}",
    "session_id":    SESSION_ID,
    "rrl_source":    RRL_PATH,
    "char_count":    RR_CHARS,
    "byte_count":    RR_BYTES,
    "merkle_parent": parent,
    "merkle_hash":   h256,
    "sealed_at":     ts,
    "sov100":        True,
    "run":           RUN,
    "dna_status":    "WARN_GAP",
    "soul_event_id": event_id,
    "soul_delta":    DELTA,
}
with open(HL_DIR / f"HL-{next_hl}.json", "w", encoding="utf-8") as f:
    json.dump(hl_entry, f, indent=2)
print(f"[PASS] STEP 3: LEDGER written — HL-{next_hl} | parent={parent[:16]}… | hash={h256[:16]}…")

# ── STEP 4: STARMAP ──────────────────────────────────────────────────────────
starmap = f"{datetime.now().strftime('%Y-%m-%dT%H:%M:%S')} | run{RUN} | HL-{next_hl} | {SESSION_ID} | {RR_CHARS} chars | {h256[:16]}…"
with open(SM_DIR / f"starmap-run{RUN}.txt", "w", encoding="utf-8") as f:
    f.write(starmap + "\n")
print(f"[PASS] STEP 4: STARMAP written — starmap-run{RUN}.txt")

# ── STEP 5: KEYWORD ──────────────────────────────────────────────────────────
rrl_raw = Path(RRL_PATH).read_text(encoding="utf-8")
import re
words = re.split(r'\s+', rrl_raw)
words = [w for w in words if len(w) > 3 and w.lower() not in {
    "this","that","with","from","have","been","were","they","will","would",
    "could","should","about","there","their","which","what","when","make",
    "like","just","some","more","than","also","very","much","many","into",
    "over","being"
}]
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
top30 = sorted(freq.items(), key=lambda x: -x[1])[:30]
kw_path = KW_DIR / f"rfkw-run{RUN}.txt"
with open(kw_path, "w", encoding="utf-8") as f:
    for cnt, word in top30:
        f.write(f"{cnt} | {word}\n")
print(f"[PASS] STEP 5: KEYWORD written — rfkw-run{RUN}.txt ({len(top30)} terms)")

# ── STEP 6: PIPELINE ─────────────────────────────────────────────────────────
pipeline = {
    "run_number":     RUN,
    "executed_at":    datetime.now(timezone.utc).isoformat(),
    "rrl_path":       RRL_PATH,
    "rrl_chars":      RR_CHARS,
    "rrl_bytes":      RR_BYTES,
    "session_id":     SESSION_ID,
    "soul_event_id":  event_id,
    "soulcount_before": SOUL_BEFORE,
    "soulcount_after":  SOUL_AFTER,
    "soul_delta":     DELTA,
    "soul_level":     SOUL_LVL,
    "dna_count":      0,
    "dna_status":     "WARN_GAP — extract 400 (Python client OK at batch)",
    "ledger_id":      f"HL-{next_hl}",
    "starmap_file":   str(SM_DIR / f"starmap-run{RUN}.txt"),
    "keyword_file":   str(kw_path),
    "seal_sha":       "",
    "result":         "FIXED — SOUL 201 OK, DNA WARN_GAP",
    "fix_note":       "Em-dash encoding flush (hrl-failsafe/pipeline fix). SOUL POST now Python-bypassed. DNA probe gap remains.",
}
pl_path = PL_DIR / f"pipeline-run{RUN}.json"
with open(pl_path, "w", encoding="utf-8") as f:
    json.dump(pipeline, f, indent=2)
print(f"[PASS] STEP 6: PIPELINE written — pipeline-run{RUN}.json")

# ── SUMMARY print ────────────────────────────────────────────────────────────
print()
print("═══════════════════════════════════════════")
print(f"RRL PIPELINE COMPLETE RUN {RUN}")
print("═══════════════════════════════════════════")
print(f"RRL:      {RRL_PATH} — {RR_CHARS} chars / {RR_BYTES} bytes")
print(f"SOUL:     {event_id} | BEFORE={SOUL_BEFORE} AFTER={SOUL_AFTER} DELTA=+{DELTA}")
print(f"DNA:      0 prompts — WARN_GAP (Python POST OK, extract endpoint 400)")
print(f"LEDGER:   HL-{next_hl} @ {HL_DIR}")
print(f"STARMAP:  {SM_DIR}")
print(f"KEYWORD:  {kw_path}")
print(f"PIPELINE: {pl_path}")
print("NEXT: commit RRL artifacts + death seal")
