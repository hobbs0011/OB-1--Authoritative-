import json
p = "CANON/PIPELINE/pipeline-run0.json"
with open(p, encoding="utf-8") as f:
    d = json.load(f)
# Write back with explicit safe ASCII
d["dna_status"] = "WARN_GAP - extract 400 (Python batch OK but endpoint 400)"
d["result"]      = "FIXED - SOUL 201 OK, DNA probe gap, DNA extract 400"
d["fix_note"]    = "Em-dash encoding flush in all RRL scripts. RRL-0 pipeline: SOUL +154667 bytes (D1 delta), LEDGER HL-146, STARMAP, KEYWORD, PIPELINE - all written. Death seal deferred to COMMIT block."
with open(p, "w", encoding="utf-8") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
print("pipeline-run0.json: em-dashes replaced with ASCII-safe text")
