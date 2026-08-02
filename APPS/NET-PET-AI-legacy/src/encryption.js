// src/encryption.js — P10: AES-GCM field encryption
// Uses CF Workers global crypto (Web Crypto API). No node:crypto import.
// hexKey = 64-char hex string (32 bytes = AES-256). Set via ENCRYPTION_KEY wrangler secret.
// Storage format: base64(12-byte-iv + ciphertext)

export async function encryptField(plaintext, hexKey) {
  const keyBytes = Uint8Array.from(hexKey.match(/.{2}/g).map(b => parseInt(b, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptField(b64ciphertext, hexKey) {
  const combined = Uint8Array.from(atob(b64ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const keyBytes = Uint8Array.from(hexKey.match(/.{2}/g).map(b => parseInt(b, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const plaintextBytes = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    ciphertext
  );
  return new TextDecoder().decode(plaintextBytes);
}
