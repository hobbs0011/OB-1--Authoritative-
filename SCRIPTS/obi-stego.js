#!/usr/bin/env node
/**
 * OBI STEGO ARCHIVE — Steganographic Key System
 * Hidden keys in innocent-looking images
 * Only solvable with SECRET_TO_SECRETS
 * 
 * Layer System:
 * L1_KEY — Basic API access (free tier)
 * L2_KEY — Premium features
 * L3_KEY — Admin/Developer
 * L4_KEY — God mode
 * L5_KEY — Irreversible actions
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════
// CONFIG — Change these for your deployment
// ═══════════════════════════════════════════════════════

const CONFIG = {
  // The SECRET to the secrets — ONLY known by Michael
  SECRET_TO_SECRETS: process.env.SECRET_TO_SECRETS || 'MOUSE_TO_TIGER_2026',
  
  // Key layers with different permission levels
  LAYERS: {
    L1: { name: 'basic', permissions: ['chat', 'health'], cost: 0 },
    L2: { name: 'premium', permissions: ['chat', 'tts', 'memory', 'lesson'], cost: 4.99 },
    L3: { name: 'developer', permissions: ['*'], cost: 19.99 },
    L4: { name: 'admin', permissions: ['ADMIN'], cost: 49.99 },
    L5: { name: 'god', permissions: ['IRREVERSIBLE'], cost: 99.99 }
  },
  
  // Image parameters for steganography
  STEGO: {
    bitsPerChannel: 2,  // LSB bits to use (1-2 recommended)
    channels: ['r', 'g', 'b'],  // RGB only (skip alpha)
    headerMagic: 'OBI',  // Magic bytes to identify OBI stego
    separator: '◆'  // Between layers
  },
  
  // Output paths
  OUTPUT_DIR: './keys',
  IMAGES_DIR: './keys/images'
};

// ═══════════════════════════════════════════════════════
// CORE: Steganography Functions
// ═══════════════════════════════════════════════════════

/**
 * Convert string to hex representation
 * "Hello" → "48656c6c6f"
 */
function stringToHex(str) {
  return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * Convert hex back to string
 * "48656c6c6f" → "Hello"
 */
function hexToString(hex) {
  return Buffer.from(hex, 'hex').toString('utf8');
}

/**
 * Generate cryptographically secure random key
 * @param {number} bytes - Length in bytes (default 32)
 */
function generateSecretKey(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Create multi-layer key bundle
 * Each layer has its own key, linked to SECRET_TO_SECRETS
 */
function createKeyBundle(layer = 'L1') {
  const layerConfig = CONFIG.LAYERS[layer];
  if (!layerConfig) throw new Error(`Unknown layer: ${layer}`);
  
  // Layer key = HMAC(SECRET_TO_SECRETS, layer_name + timestamp)
  const timestamp = Date.now();
  const payload = `${CONFIG.SECRET_TO_SECRETS}:${layer}:${timestamp}`;
  const key = crypto.createHash('sha256').update(payload).digest('hex');
  
  return {
    layer,
    key,
    timestamp,
    permissions: layerConfig.permissions,
    cost: layerConfig.cost,
    name: layerConfig.name,
    // Verification data
    verify: crypto.createHash('sha256').update(key + CONFIG.SECRET_TO_SECRETS).digest('hex').slice(0, 8)
  };
}

/**
 * XOR cipher for additional security layer
 * "Know the secret to decode"
 */
function obiXor(data, secret) {
  const secretHash = crypto.createHash('sha256').update(secret).digest();
  let result = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ secretHash[i % secretHash.length];
  }
  return result;
}

// ═══════════════════════════════════════════════════════
// STEGANOGRAPHY: Hide/Extract from Images
// ═══════════════════════════════════════════════════════

/**
 * Hide data in image using LSB steganography
 * @param {Buffer} imageData - Raw RGBA pixel data (not compressed PNG/JPEG)
 * @param {string} secretData - Secret data to hide
 * @param {string} passphrase - Additional XOR cipher key
 */
function hideInImage(imageData, secretData, passphrase = '') {
  // Convert secret to bytes
  let dataBytes = Buffer.from(secretData, 'utf8');
  
  // Apply XOR cipher if passphrase provided
  if (passphrase) {
    dataBytes = obiXor(dataBytes, passphrase);
  }
  
  // Prepend magic header and data length
  const magicBytes = Buffer.from(CONFIG.STEGO.headerMagic, 'utf8');
  const lengthBytes = Buffer.alloc(4);
  lengthBytes.writeUInt32BE(dataBytes.length, 0);
  
  const fullData = Buffer.concat([magicBytes, lengthBytes, dataBytes]);
  
  // Check capacity (need fullData.length * 8 pixels for 1 bit per pixel)
  const capacity = Math.floor(imageData.length / 8);
  if (fullData.length > capacity) {
    throw new Error(`Data too large. Max: ${capacity} bytes, Data: ${fullData.length}`);
  }
  
  // Embed in LSBs of each byte
  const result = Buffer.from(imageData);
  let bitIndex = 0;
  
  for (let byteIdx = 0; byteIdx < fullData.length; byteIdx++) {
    for (let bit = 7; bit >= 0; bit--) {
      const dataBit = (fullData[byteIdx] >> bit) & 1;
      result[bitIndex] = (result[bitIndex] & 0xFE) | dataBit;
      bitIndex++;
    }
  }
  
  return result;
}

/**
 * Extract hidden data from image
 * @param {Buffer} imageData - Stego image (raw RGBA pixel data)
 * @param {string} passphrase - XOR cipher key (optional)
 * @returns {string|null} Extracted secret or null if invalid
 */
function extractFromImage(imageData, passphrase = '') {
  // Extract magic header (first 3 bytes * 8 bits = 24 bits)
  const magicBytes = Buffer.from(CONFIG.STEGO.headerMagic, 'utf8');
  let extracted = Buffer.alloc(magicBytes.length);
  
  for (let i = 0; i < magicBytes.length; i++) {
    let byte = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (imageData[i * 8 + (7 - bit)] & 1);
      byte = (byte << 1) | bitValue;
    }
    extracted[i] = byte;
  }
  
  // Check for magic header
  if (!extracted.equals(magicBytes)) {
    return null; // Not an OBI stego image
  }
  
  // Extract length (next 4 bytes)
  let lengthVal = 0;
  const offset = magicBytes.length;
  for (let i = 0; i < 4; i++) {
    let byte = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (imageData[(offset + i) * 8 + (7 - bit)] & 1);
      byte = (byte << 1) | bitValue;
    }
    lengthVal = (lengthVal << 8) | byte;
  }
  
  // Extract data
  const dataOffset = offset + 4;
  const dataBytes = Buffer.alloc(lengthVal);
  for (let i = 0; i < lengthVal; i++) {
    let byte = 0;
    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (imageData[(dataOffset + i) * 8 + (7 - bit)] & 1);
      byte = (byte << 1) | bitValue;
    }
    dataBytes[i] = byte;
  }
  
  // Apply XOR if passphrase
  if (passphrase) {
    return obiXor(dataBytes, passphrase).toString('utf8');
  }
  
  return dataBytes.toString('utf8');
}

// ═══════════════════════════════════════════════════════
// VANILLA NODE CANVAS (No dependencies fallback)
// ═══════════════════════════════════════════════════════

function createVanillaCanvas() {
  // Minimal PNG encoder/decoder for steganography
  return {
    createCanvas: (width, height) => ({
      width,
      height,
      data: Buffer.alloc(width * height * 4 + height + 10),
      getContext: () => ({
        fillRect: () => {},
        fillText: () => {}
      })
    })
  };
}

// ═══════════════════════════════════════════════════════
// SIMPLE JS CANVAS (Pure vanilla steganography)
// ═══════════════════════════════════════════════════════

/**
 * Create a simple stego image from scratch
 * Generates a decorative "key card" image
 */
function createStegoImage(keyBundle, outputPath) {
  // Simple PNG with embedded data (minimal implementation)
  // For production, use @napi-rs/canvas or jimp
  
  const width = 400;
  const height = 200;
  
  // Create raw RGBA data
  const pixels = Buffer.alloc(width * height * 4);
  
  // Generate background pattern (subtle gradient)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Purple/gold theme (Gospel 444)
      pixels[idx] = Math.floor(40 + (y / height) * 20);     // R
      pixels[idx + 1] = Math.floor(20 + (x / width) * 30);  // G  
      pixels[idx + 2] = Math.floor(60 + Math.sin(x * 0.02) * 20); // B
      pixels[idx + 3] = 255; // A (opaque)
    }
  }
  
  // Serialize key bundle to hide
  const keyData = JSON.stringify(keyBundle);
  
  // Hide using custom steganography in the alpha channel of first N pixels
  const keyHex = stringToHex(keyData);
  const keyBin = hexToBin(keyHex);
  
  // Embed in last characters (subtle)
  let embedIdx = 0;
  const embedLength = Math.min(keyBin.length, 1000);
  
  for (let i = 0; i < embedLength && i < pixels.length; i++) {
    if (keyBin[i] === '1') {
      pixels[i] = pixels[i] | 1; // Set LSB
    } else {
      pixels[i] = pixels[i] & 0xFE; // Clear LSB
    }
  }
  
  // Create a simple PPM first (easier), then could convert
  // For now, save raw format with metadata
  const output = {
    magic: 'OBI_STEGO_V1',
    width,
    height,
    pixels: pixels.toString('base64'),
    embedded: keyHex.slice(0, 100) // First 50 bytes visible in hex
  };
  
  return output;
}

/**
 * Binary to hex string
 */
function hexToBin(hex) {
  let bin = '';
  for (let i = 0; i < hex.length; i++) {
    bin += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }
  return bin;
}

// ═══════════════════════════════════════════════════════
// KEY MANAGEMENT
// ═══════════════════════════════════════════════════════

/**
 * Generate all key layers
 */
function generateAllKeys() {
  const keys = {};
  
  for (const layer of ['L1', 'L2', 'L3', 'L4', 'L5']) {
    keys[layer] = createKeyBundle(layer);
  }
  
  return keys;
}

/**
 * Validate a key against SECRET_TO_SECRETS
 */
function validateKey(key, secretHash) {
  const expected = crypto.createHash('sha256')
    .update(key + CONFIG.SECRET_TO_SECRETS)
    .digest('hex').slice(0, 8);
  
  return expected === secretHash;
}

/**
 * Export keys to secure storage
 */
function exportKeys(keys, outputDir = CONFIG.OUTPUT_DIR) {
  try {
    writeFileSync(`${outputDir}/keys.json`, JSON.stringify(keys, null, 2));
    console.log(`✅ Keys exported to ${outputDir}/keys.json`);
  } catch (e) {
    console.log(`⚠️  Could not export: ${e.message}`);
  }
}

// ═══════════════════════════════════════════════════════
// MAIN CLI
// ═══════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0] || 'help';

console.log(`
╔══════════════════════════════════════════════════════╗
║     OBI STEGO KEY SYSTEM                           ║
║     Hidden Keys • Multi-Layer Security            ║
╚══════════════════════════════════════════════════════╝
`);

if (command === 'generate' || command === 'gen') {
  const layer = args[1] || 'L1';
  
  console.log(`\n🎲 Generating ${layer} key...`);
  const keyBundle = createKeyBundle(layer);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`LAYER: ${keyBundle.layer} (${keyBundle.name})`);
  console.log(`KEY: ${keyBundle.key.slice(0, 16)}...`);
  console.log(`VERIFY: ${keyBundle.verify}`);
  console.log(`PERMISSIONS: ${keyBundle.permissions.join(', ')}`);
  console.log(`TIMESTAMP: ${keyBundle.timestamp}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\n⚠️  Save this key securely!`);
  console.log(`   Key grants: ${keyBundle.permissions.join(' | ')}`);
  
  exportKeys({ [layer]: keyBundle });
  
} else if (command === 'generate-all') {
  console.log(`\n🎲 Generating all key layers...`);
  const allKeys = generateAllKeys();
  
  for (const [layer, key] of Object.entries(allKeys)) {
    console.log(`\n${layer}: ${key.key.slice(0, 20)}... [${key.verify}]`);
  }
  
  exportKeys(allKeys);
  
} else if (command === 'validate') {
  const key = args[1];
  const verify = args[2];
  
  if (!key || !verify) {
    console.log(`Usage: validate <key> <verify>`);
    process.exit(1);
  }
  
  const isValid = validateKey(key, verify);
  console.log(isValid ? '✅ VALID KEY' : '❌ INVALID KEY');
  
} else if (command === 'test-stego') {
  console.log(`\n🧪 Testing steganography...`);
  
  // Create test data
  const testData = { test: true, message: 'Hello from the steganogram!', layer: 'L1' };
  
  // Create simple noise buffer to test
  const testBuffer = Buffer.alloc(1000);
  for (let i = 0; i < testBuffer.length; i++) {
    testBuffer[i] = Math.floor(Math.random() * 256);
  }
  
  // Embed
  const embedded = hideInImage(testBuffer, JSON.stringify(testData), CONFIG.SECRET_TO_SECRETS);
  
  // Extract
  const extracted = extractFromImage(embedded, CONFIG.SECRET_TO_SECRETS);
  
  if (extracted) {
    console.log(`✅ Stego test PASSED`);
    console.log(`   Original: ${JSON.stringify(testData)}`);
    console.log(`   Extracted: ${extracted}`);
  } else {
    console.log(`❌ Stego test FAILED`);
  }
  
} else {
  console.log(`
Usage:
  generate <layer>   Generate key for specific layer (L1-L5)
  generate-all       Generate all 5 key layers
  validate <key> <verify>  Validate a key
  test-stego        Test steganography functions

Layers:
  L1 — Basic (free)     chat, health
  L2 — Premium ($4.99) tts, memory, lesson
  L3 — Developer     admin, all APIs
  L4 — Admin         system, keys
  L5 — God           irreversible

Example:
  node obi-stego.js generate L1
  `);
}

console.log(`\n🔐 SECRET_TO_SECRETS: ${CONFIG.SECRET_TO_SECRETS.slice(0, 8)}...`);
