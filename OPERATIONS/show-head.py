with open('RRL/RRL-0.txt', encoding='utf-8') as f:
    sample = f.read(3000)
with open('OPERATIONS/rrl0-head.txt', 'w', encoding='utf-8') as out:
    out.write(sample)
print("Wrote first 3000 chars to OPERATIONS/rrl0-head.txt")
