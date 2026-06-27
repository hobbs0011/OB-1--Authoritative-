Get-ChildItem -LiteralPath 'D:\OB-1-CANONICAL\CANON\TRAIN-67' -Recurse -Filter '*.md' | Select-Object -First 5 | ForEach-Object { $_.FullName + ' | ' + $_.Length }
