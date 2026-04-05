import json
from pathlib import Path

source_path = Path(r"C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\(KEY-SOUL [1]) - ENERGY_GATE_UNLOCK.txt")
verbatim_path = Path(r"C:\Users\mrmic\Desktop\OB-1\CANON\SOUL-LOG-VERBATIM-KEY-SOUL-1-ENERGY-GATE-UNLOCK-2026-04-05.md")
out_path = Path(r"C:\Users\mrmic\Desktop\OB-1\CANON\SOUL-SEGMENTS\diff_report_KEY-SOUL-1-ENERGY-GATE-UNLOCK.txt")

def load_ids_from_text(p):
    ids = []
    if not p.exists():
        return ids
    for line in p.read_text(encoding='utf-8', errors='replace').splitlines():
        line=line.strip()
        if not line:
            continue
        # try simple JSON parse
        if '{' in line and '"id"' in line:
            try:
                j = json.loads(line[line.find('{'): line.rfind('}')+1])
                if 'id' in j:
                    ids.append(j['id'])
                    continue
            except Exception:
                pass
        # crude id extraction
        if 'id' in line:
            # find "id" : "..."
            try:
                start = line.find('"id"')
                snippet = line[start: start+200]
                q = snippet.find(':')
                rest = snippet[q+1:]
                first = rest.find('"')
                rest2 = rest[first+1:]
                second = rest2.find('"')
                ids.append(rest2[:second])
            except Exception:
                continue
    return ids

src_ids = load_ids_from_text(source_path)
verb_ids = load_ids_from_text(verbatim_path)

only_in_src = sorted(set(src_ids) - set(verb_ids))
only_in_verb = sorted(set(verb_ids) - set(src_ids))

report = []
report.append(f"source_path: {source_path}\nverbatim_path: {verbatim_path}\n")
report.append(f"source_count={len(src_ids)} verbatim_count={len(verb_ids)}\n")
report.append(f"unique_in_source={len(only_in_src)} unique_in_verbatim={len(only_in_verb)}\n")
if only_in_src:
    report.append("IDs only in source:\n")
    report += [f" - {i}\n" for i in only_in_src]
if only_in_verb:
    report.append("IDs only in verbatim:\n")
    report += [f" - {i}\n" for i in only_in_verb]

out_path.write_text(''.join(report), encoding='utf-8')
print('WROTE', out_path)
