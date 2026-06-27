const fs = require('fs');
const path = 'D:\\OB-1-CANONICAL\\CANON\\REGISTRY\\dna-registry-run142.json';

try {
  // Try opening for write
  const fd = fs.openSync(path, 'w');
  fs.closeSync(fd);
  console.log('File opened for write successfully');
} catch (e) {
  console.error('Cannot open for write:', e.message);
}
