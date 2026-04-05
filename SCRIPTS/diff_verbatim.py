import json
from pathlib import Path

source_path = Path(r"c:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\(KEY-SOUL10)-FROMSCRATCH__V1.jsonl.txt")
verbatim_path = Path(r"c:\Users\mrmic\Desktop\OB-1\CANON\SOUL-LOG-VERBATIM-KEY-SOUL10-2026-04-05.md")
out_path = Path(r"c:\Users\mrmic\Desktop\OB-1\CANON\SOUL-SEGMENTS\diff_report_KEY-SOUL10.txt")

def load_ids_from_jsonl(p):
    ids = []
    if not p.exists():
        return ids
    for line in p.read_text(encoding='utf-8', errors='replace').splitlines():
        line = line.strip()
        if not line:
            continue
        # try parse JSON object from line
        try:
            obj = json.loads(line)
            if isinstance(obj, dict) and 'id' in obj:
                ids.append(obj['id'])
            else:
                # fallback: look for id substring
                if '"id"' in line:
                    # crude extraction
                    start = line.find('"id"')
                    snippet = line[start: start+200]
                    # find next quoted value
                    q = snippet.find(':')
                    if q!=-1:
                        rest = snippet[q+1:]
                        # find first quote
                        first = rest.find('"')
                        if first!=-1:
                            rest2 = rest[first+1:]
                            second = rest2.find('"')
                            if second!=-1:
                                ids.append(rest2[:second])
        except Exception:
            # not pure json, try to find id pattern
            if '"id"' in line:
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

def load_ids_from_verbatim(p):
    ids = []
    if not p.exists():
        return ids
    for line in p.read_text(encoding='utf-8', errors='replace').splitlines():
        line = line.strip()
        # find first JSON object in the line (some lines have prefixes like L00001 ...)
        if '{' in line and '"id"' in line:
            try:
                json_part = line[line.find('{'):]
                obj = json.loads(json_part)
                if 'id' in obj:
                    ids.append(obj['id'])
            except Exception:
                # crude fallback extraction
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

src_ids = load_ids_from_jsonl(source_path)
verb_ids = load_ids_from_verbatim(verbatim_path)

src_set = set(src_ids)
verb_set = set(verb_ids)

only_in_src = sorted(src_set - verb_set)
only_in_verb = sorted(verb_set - src_set)

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
