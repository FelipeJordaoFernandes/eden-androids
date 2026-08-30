import {
  PASSWORD_ALGORITHM,
  PASSWORD_DERIVATION_ITERATIONS,
  PASSWORD_HASH_BITS,
  isRecord,
  normalizeText,
} from './authConfig.js'

export function getDefaultCrypto() {
  return globalThis.crypto ?? null
}

export function normalizeCredential(value) {
  if (!isRecord(value)) return null

  const algorithm = normalizeText(value.algorithm)
  const salt = normalizeText(value.salt)
  const hash = normalizeText(value.hash)
  const iterations = Number.isInteger(value.iterations) ? value.iterations : 0

  if (
    algorithm !== PASSWORD_ALGORITHM ||
    !salt ||
    !hash ||
    iterations < 10000
  ) {
    return null
  }

  return { algorithm, salt, hash, iterations }
}

function bytesToBase64(bytes) {
  let binaryValue = ''

  bytes.forEach((byte) => {
    binaryValue += String.fromCharCode(byte)
  })

  return btoa(binaryValue)
}

function base64ToBytes(value) {
  const binaryValue = atob(value)

  return Uint8Array.from(binaryValue, (character) => character.charCodeAt(0))
}

async function derivePasswordHash(password, salt, iterations, cryptoProvider) {
  const keyMaterial = await cryptoProvider.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derivedBits = await cryptoProvider.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    keyMaterial,
    PASSWORD_HASH_BITS,
  )

  return bytesToBase64(new Uint8Array(derivedBits))
}

export function createLocalId(prefix, cryptoProvider = getDefaultCrypto()) {
  if (typeof cryptoProvider?.randomUUID === 'function') {
    return `${prefix}-${cryptoProvider.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function createCredential(password, cryptoProvider) {
  const salt = new Uint8Array(16)
  cryptoProvider.getRandomValues(salt)

  return {
    algorithm: PASSWORD_ALGORITHM,
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(
      password,
      salt,
      PASSWORD_DERIVATION_ITERATIONS,
      cryptoProvider,
    ),
    iterations: PASSWORD_DERIVATION_ITERATIONS,
  }
}

function areHashesEqual(firstHash, secondHash) {
  if (firstHash.length !== secondHash.length) return false

  let difference = 0

  for (let index = 0; index < firstHash.length; index += 1) {
    difference |= firstHash.charCodeAt(index) ^ secondHash.charCodeAt(index)
  }

  return difference === 0
}

export async function verifyCredential(password, credential, cryptoProvider) {
  const derivedHash = await derivePasswordHash(
    String(password),
    base64ToBytes(credential.salt),
    credential.iterations,
    cryptoProvider,
  )

  return areHashesEqual(derivedHash, credential.hash)
}
