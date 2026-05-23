with open('SCRIPTS/rrl-extract.ps1', 'rb') as f:
    data = f.read()
fixed = data.replace(b'\xe2\x80\x94', b' - ')
with open('SCRIPTS/rrl-extract.ps1', 'wb') as f:
    f.write(fixed)
print(f'rrl-extract.ps1: {data.count(b"\xe2\x80\x94")} em-dashes replaced')

with open('SCRIPTS/rrl-pipeline.ps1', 'rb') as f:
    data = f.read()
fixed = data.replace(b'\xe2\x80\x94', b' - ')
with open('SCRIPTS/rrl-pipeline.ps1', 'wb') as f:
    f.write(fixed)
print(f'rrl-pipeline.ps1: {data.count(b"\xe2\x80\x94")} em-dashes replaced')

with open('SCRIPTS/rrl-failsafe.ps1', 'rb') as f:
    data = f.read()
fixed = data.replace(b'\xe2\x80\x94', b' - ')
with open('SCRIPTS/rrl-failsafe.ps1', 'wb') as f:
    f.write(fixed)
print(f'rrl-failsafe.ps1: {data.count(b"\xe2\x80\x94")} em-dashes replaced')
