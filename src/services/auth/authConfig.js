export const LEGACY_ACCOUNT_STORAGE_KEY = 'eden-androids:accounts:v1'
export const ACCOUNT_STORAGE_KEY = 'eden-androids:accounts:v2'
export const SESSION_STORAGE_KEY = 'eden-androids:session:v1'
export const AUTH_STORAGE_VERSION = 2
export const SESSION_STORAGE_VERSION = 1
export const PASSWORD_DERIVATION_ITERATIONS = 120000

export const PASSWORD_ALGORITHM = 'PBKDF2-SHA-256'
export const PASSWORD_HASH_BITS = 256

export function getDefaultStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeText(value) {
  if (typeof value !== 'string') return null

  const normalizedValue = value.trim()

  return normalizedValue || null
}
