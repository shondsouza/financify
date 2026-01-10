// Minimal WebCrypto helpers for E2EE chat
// Curve: P-256 for ECDH; Symmetric: AES-GCM; KDF: HKDF-SHA-256

export async function generateIdentityKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  )
  return keyPair
}

export async function exportPublicKeyJwk(publicKey) {
  return await crypto.subtle.exportKey('jwk', publicKey)
}

export async function exportPrivateKeyPkcs8(privateKey) {
  return await crypto.subtle.exportKey('pkcs8', privateKey)
}

export async function importPublicKeyFromJwk(jwk) {
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  )
}

export async function importPrivateKeyFromPkcs8(pkcs8Bytes) {
  return await crypto.subtle.importKey(
    'pkcs8',
    pkcs8Bytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  )
}

export function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
}

export function base64ToBytes(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export async function deriveConversationKey(myPrivateKey, peerPublicKeyJwk) {
  const peerPub = await importPublicKeyFromJwk(peerPublicKeyJwk)
  const derivedKey = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerPub },
    myPrivateKey,
    { name: 'HKDF', hash: 'SHA-256', info: new Uint8Array([]), salt: new Uint8Array(32) },
    false,
    ['deriveBits']
  )
  const rawBits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', info: new Uint8Array([]), salt: new Uint8Array(32) },
    myPrivateKey,
    256
  )
  // Import as AES-GCM key
  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawBits,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  return aesKey
}

export async function encryptMessage(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(plaintext)
  )
  return { iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext) }
}

export async function decryptMessage(aesKey, ivB64, ciphertextB64) {
  const iv = new Uint8Array(base64ToBytes(ivB64))
  const ct = base64ToBytes(ciphertextB64)
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ct
  )
  return new TextDecoder().decode(pt)
}

// Password protect private key using PBKDF2 + AES-GCM
export async function encryptPrivateKey(privateKeyPkcs8, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    privateKeyPkcs8
  )
  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  }
}

export async function decryptPrivateKey(encrypted, password) {
  const salt = new Uint8Array(base64ToBytes(encrypted.salt))
  const iv = new Uint8Array(base64ToBytes(encrypted.iv))
  const ct = base64ToBytes(encrypted.ciphertext)
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  const pkcs8 = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct)
  return pkcs8
}



