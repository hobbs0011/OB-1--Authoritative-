import json, urllib.request

PA_API = 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/art'

CLEAN_MAP = {
    'tiger-portrait-hd.png':    'isolated/tiger-portrait-clean.png',
    'tiger-face-neon-hd.png':   'isolated/tiger-face-neon-clean.png',
    'tiger-cub-hd.png':         'isolated/tiger-cub-clean.png',
    'tiger-child-hd.png':       'isolated/tiger-child-clean.png',
    'tiger-roaring-hd.png':     'isolated/tiger-roaring-clean.png',
    'phoenix-crest-hd.png':     'isolated/phoenix-crest-clean.png',
    'phoenix-neon-hd.png':      'isolated/phoenix-neon-clean.png',
    'phoenix-dna-fusion-hd.png':'isolated/phoenix-dna-fusion-clean.png',
    'mouse-wireframe-hd.png':   'isolated/mouse-clean.png',
}

req = urllib.request.Request(PA_API + '?limit=400', headers={'User-Agent': 'NET/1.0'})
with urllib.request.urlopen(req, timeout=15) as r:
    pieces = json.loads(r.read())['pieces']

updated = 0
for p in pieces:
    src = p.get('url', '').split('/')[-1]
    if src not in CLEAN_MAP:
        continue
    new_url = CLEAN_MAP[src]
    payload = json.dumps({
        'url': new_url,
        'notes': 'Textless verified. Auto-cleaned — text stripped by clean-isolates.py.'
    }).encode()
    req2 = urllib.request.Request(
        PA_API + '/' + p['id'],
        data=payload, method='PATCH',
        headers={'Content-Type': 'application/json', 'User-Agent': 'NET/1.0'}
    )
    with urllib.request.urlopen(req2, timeout=10) as r:
        resp = json.loads(r.read())
        print('  PATCH ' + p['title'][:35] + ' -> ' + new_url)
        updated += 1

print('\nRegistry: ' + str(updated) + ' pieces updated.')
