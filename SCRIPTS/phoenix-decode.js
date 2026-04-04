/**
 * OBI Phoenix Decoder
 * Decode the hidden verification from .obiphoenix.png
 * 
 * Usage: node SCRIPTS/phoenix-decode.js
 */

const fs = require('fs');
const crypto = require('crypto');

const PHOENIX_PHRASE = "The Phoenix Rising Protocol";
const PHOENIX_HASH = crypto.createHash('sha256').update(PHOENIX_PHRASE).digest();

// Read the stego image
const imgPath = 'ASSETS/.obiphoenix.png';
if (!fs.existsSync(imgPath)) {
  console.log('❌ Image not found:', imgPath);
  process.exit(1);
}

const img = fs.readFileSync(imgPath);
console.log('📖 Reading:', imgPath);
console.log('📏 Size:', img.length, 'bytes');

// Extract LSBs from last 64 bytes
let extracted = Buffer.alloc(32);
for (let i = 0; i < 32; i++) {
  const byte = img[img.length - 64 + i];
  extracted[i] = byte & 1;
}

// Compare with expected hash
let match = true;
for (let i = 0; i < 32; i++) {
  if ((extracted[i] & 1) !== (PHOENIX_HASH[i] & 1)) {
    match = false;
    break;
  }
}

if (match) {
  console.log('✅ PHOENIX VERIFIED');
  console.log('🔓 Access: GRANTED');
} else {
  console.log('❌ Verification failed');
  console.log('🔒 Access: DENIED');
}

// Also show what's in the file
console.log('\n📦 Extracted LSBs:', extracted.toString('hex').slice(0, 32) + '...');
console.log('🎯 Expected:     ', PHOENIX_HASH.toString('hex').slice(0, 32) + '...');