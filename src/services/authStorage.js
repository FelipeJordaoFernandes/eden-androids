import {
  getEmailError,
  getNameError,
  getPasswordError,
  normalizeEmail,
  normalizeName,
} from '../utils/authValidation.js'
import {
  isCompleteAddress,
  normalizeAddress,
  normalizeStoredAddress,
} from '../utils/address.js'
import {
  formatDocument,
  formatPhone,
  isValidCpf,
  isValidPhone,
  normalizeCustomerProfile,
  validateCustomerProfile,
} from '../utils/customerData.js'
import {
  createSanitizedPaymentMethod,
  normalizeStoredPaymentMethod,
  validatePaymentCard,
} from '../utils/paymentCard.js'

export const LEGACY_ACCOUNT_STORAGE_KEY = 'eden-androids:accounts:v1'
export const ACCOUNT_STORAGE_KEY = 'eden-androids:accounts:v2'
export const SESSION_STORAGE_KEY = 'eden-androids:session:v1'
export const AUTH_STORAGE_VERSION = 2
export const SESSION_STORAGE_VERSION = 1
export const PASSWORD_DERIVATION_ITERATIONS = 120000

const PASSWORD_ALGORITHM = 'PBKDF2-SHA-256'
const PASSWORD_HASH_BITS = 256

function getDefaultStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function getDefaultCrypto() {
  return globalThis.crypto ?? null
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value) {
  if (typeof value !== 'string') return null

  const normalizedValue = value.trim()

  return normalizedValue || null
}

function normalizeCreatedAt(value) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) return null

  const timestamp = Date.parse(normalizedValue)

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
}

function normalizeCredential(value) {
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

function normalizeDefaultCollection(values, normalizer) {
  const knownIds = new Set()
  const normalizedValues = values
    .map(normalizer)
    .filter(Boolean)
    .filter((value) => {
      if (knownIds.has(value.id)) return false
      knownIds.add(value.id)
      return true
    })

  if (normalizedValues.length === 0) return []

  const selectedDefault = normalizedValues.findIndex((value) => value.isDefault)
  const defaultIndex = selectedDefault < 0 ? 0 : selectedDefault

  return normalizedValues.map((value, index) => ({
    ...value,
    isDefault: index === defaultIndex,
  }))
}

function createLegacyAddress(accountId, value) {
  const address = normalizeAddress(value)

  if (!address || !isCompleteAddress(address)) return []

  return [
    {
      id: `legacy-address-${accountId}`,
      label: 'Endereço principal',
      postalCode: address.postalCode,
      street: address.street,
      addressNumber: address.addressNumber,
      addressComplement: address.addressComplement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      isDefault: true,
    },
  ]
}

function normalizeStoredAccount(value) {
  if (!isRecord(value)) return null

  const id = normalizeText(value.id)
  const name = normalizeName(value.name)
  const email = normalizeEmail(value.email)
  const createdAt = normalizeCreatedAt(value.createdAt)
  const credential = normalizeCredential(value.credential)

  if (
    !id ||
    getNameError(name) ||
    getEmailError(email) ||
    !createdAt ||
    !credential
  ) {
    return null
  }

  const phone = isValidPhone(value.phone) ? formatPhone(value.phone) : ''
  const document = isValidCpf(value.document)
    ? formatDocument(value.document)
    : ''
  const addresses = Array.isArray(value.addresses)
    ? normalizeDefaultCollection(value.addresses, normalizeStoredAddress)
    : createLegacyAddress(id, value.address)
  const paymentMethods = Array.isArray(value.paymentMethods)
    ? normalizeDefaultCollection(
        value.paymentMethods,
        normalizeStoredPaymentMethod,
      )
    : []

  return {
    id,
    name,
    email,
    phone,
    document,
    createdAt,
    credential,
    addresses,
    paymentMethods,
  }
}

function cloneCollection(values) {
  return values.map((value) => ({ ...value }))
}

function toPublicAccount(account) {
  if (!account) return null

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone,
    document: account.document,
    createdAt: account.createdAt,
    addresses: cloneCollection(account.addresses),
    paymentMethods: cloneCollection(account.paymentMethods),
  }
}

function readAccountEnvelope(storage, key, version) {
  try {
    const storedValue = storage.getItem(key)

    if (!storedValue) return null

    const parsedValue = JSON.parse(storedValue)

    if (
      !isRecord(parsedValue) ||
      parsedValue.version !== version ||
      !Array.isArray(parsedValue.accounts)
    ) {
      return null
    }

    const knownEmails = new Set()

    return parsedValue.accounts
      .map(normalizeStoredAccount)
      .filter(Boolean)
      .filter((account) => {
        if (knownEmails.has(account.email)) return false
        knownEmails.add(account.email)
        return true
      })
  } catch {
    return null
  }
}

function writeAccountRecords(accounts, storage) {
  storage.setItem(
    ACCOUNT_STORAGE_KEY,
    JSON.stringify({ version: AUTH_STORAGE_VERSION, accounts }),
  )
}

function loadAccountRecords(storage = getDefaultStorage()) {
  if (!storage) return []

  const currentAccounts = readAccountEnvelope(
    storage,
    ACCOUNT_STORAGE_KEY,
    AUTH_STORAGE_VERSION,
  )

  if (currentAccounts) return currentAccounts

  const legacyAccounts = readAccountEnvelope(
    storage,
    LEGACY_ACCOUNT_STORAGE_KEY,
    1,
  )

  if (!legacyAccounts) return []

  try {
    writeAccountRecords(legacyAccounts, storage)
  } catch {
    // A migração pode continuar em memória quando o armazenamento está indisponível.
  }

  return legacyAccounts
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

function createLocalId(prefix, cryptoProvider = getDefaultCrypto()) {
  if (typeof cryptoProvider?.randomUUID === 'function') {
    return `${prefix}-${cryptoProvider.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function createCredential(password, cryptoProvider) {
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

function writeSession(accountId, storage) {
  storage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ version: SESSION_STORAGE_VERSION, accountId }),
  )
}

function updateStoredAccount(accountId, updater, storage = getDefaultStorage()) {
  if (!storage) return { ok: false, code: 'storage_unavailable' }

  const accounts = loadAccountRecords(storage)
  const accountIndex = accounts.findIndex((account) => account.id === accountId)

  if (accountIndex < 0) return { ok: false, code: 'account_not_found' }

  const updateResult = updater(accounts[accountIndex], accounts)

  if (!updateResult?.account) {
    return { ok: false, code: updateResult?.code ?? 'invalid_input' }
  }

  const updatedAccounts = [...accounts]
  updatedAccounts[accountIndex] = updateResult.account

  try {
    writeAccountRecords(updatedAccounts, storage)
    return {
      ok: true,
      account: toPublicAccount(updateResult.account),
      ...(updateResult.value ? { value: { ...updateResult.value } } : {}),
    }
  } catch {
    return { ok: false, code: 'storage_unavailable' }
  }
}

export function loadAccounts(storage = getDefaultStorage()) {
  return loadAccountRecords(storage).map(toPublicAccount)
}

export function loadCurrentAccount(storage = getDefaultStorage()) {
  if (!storage) return null

  try {
    const storedValue = storage.getItem(SESSION_STORAGE_KEY)

    if (!storedValue) return null

    const parsedValue = JSON.parse(storedValue)

    if (
      !isRecord(parsedValue) ||
      parsedValue.version !== SESSION_STORAGE_VERSION ||
      typeof parsedValue.accountId !== 'string'
    ) {
      return null
    }

    return toPublicAccount(
      loadAccountRecords(storage).find(
        (account) => account.id === parsedValue.accountId,
      ),
    )
  } catch {
    return null
  }
}

export async function registerAccount(
  { name, email, password },
  {
    storage = getDefaultStorage(),
    cryptoProvider = getDefaultCrypto(),
    now = () => new Date(),
  } = {},
) {
  const normalizedName = normalizeName(name)
  const normalizedEmail = normalizeEmail(email)

  if (
    getNameError(normalizedName) ||
    getEmailError(normalizedEmail) ||
    getPasswordError(password)
  ) {
    return { ok: false, code: 'invalid_input' }
  }

  if (!storage) return { ok: false, code: 'storage_unavailable' }
  if (!cryptoProvider?.subtle || !cryptoProvider.getRandomValues) {
    return { ok: false, code: 'crypto_unavailable' }
  }

  const currentAccounts = loadAccountRecords(storage)

  if (currentAccounts.some((account) => account.email === normalizedEmail)) {
    return { ok: false, code: 'email_exists' }
  }

  try {
    const account = {
      id: createLocalId('eden', cryptoProvider),
      name: normalizedName,
      email: normalizedEmail,
      phone: '',
      document: '',
      createdAt: now().toISOString(),
      credential: await createCredential(password, cryptoProvider),
      addresses: [],
      paymentMethods: [],
    }
    const previousAccounts = storage.getItem(ACCOUNT_STORAGE_KEY)
    const previousSession = storage.getItem(SESSION_STORAGE_KEY)

    try {
      writeAccountRecords([...currentAccounts, account], storage)
      writeSession(account.id, storage)
    } catch {
      if (previousAccounts === null) storage.removeItem(ACCOUNT_STORAGE_KEY)
      else storage.setItem(ACCOUNT_STORAGE_KEY, previousAccounts)

      if (previousSession === null) storage.removeItem(SESSION_STORAGE_KEY)
      else storage.setItem(SESSION_STORAGE_KEY, previousSession)

      return { ok: false, code: 'storage_unavailable' }
    }

    return { ok: true, account: toPublicAccount(account) }
  } catch {
    return { ok: false, code: 'registration_failed' }
  }
}

export async function authenticateAccount(
  { email, password },
  {
    storage = getDefaultStorage(),
    cryptoProvider = getDefaultCrypto(),
  } = {},
) {
  if (!storage || !cryptoProvider?.subtle) {
    return { ok: false, code: 'authentication_unavailable' }
  }

  const account = loadAccountRecords(storage).find(
    (storedAccount) => storedAccount.email === normalizeEmail(email),
  )

  if (!account) return { ok: false, code: 'invalid_credentials' }

  try {
    const derivedHash = await derivePasswordHash(
      String(password),
      base64ToBytes(account.credential.salt),
      account.credential.iterations,
      cryptoProvider,
    )

    if (!areHashesEqual(derivedHash, account.credential.hash)) {
      return { ok: false, code: 'invalid_credentials' }
    }

    writeSession(account.id, storage)
    return { ok: true, account: toPublicAccount(account) }
  } catch {
    return { ok: false, code: 'invalid_credentials' }
  }
}

export function updateAccountProfile(accountId, profileValue, storage) {
  const profile = normalizeCustomerProfile(profileValue)

  if (Object.keys(validateCustomerProfile(profile)).length > 0) {
    return { ok: false, code: 'invalid_profile' }
  }

  return updateStoredAccount(
    accountId,
    (account, accounts) => {
      if (
        accounts.some(
          (candidate) =>
            candidate.id !== accountId && candidate.email === profile.email,
        )
      ) {
        return { code: 'email_exists' }
      }

      return { account: { ...account, ...profile } }
    },
    storage,
  )
}

export function addAccountAddress(accountId, addressValue, options = {}) {
  const address = normalizeAddress(addressValue)
  const label = normalizeText(addressValue?.label)

  if (!address || !label || !isCompleteAddress(address)) {
    return { ok: false, code: 'invalid_address' }
  }

  return updateStoredAccount(
    accountId,
    (account) => {
      const newAddress = {
        id: createLocalId('address', options.cryptoProvider),
        label,
        postalCode: address.postalCode,
        street: address.street,
        addressNumber: address.addressNumber,
        addressComplement: address.addressComplement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        isDefault: account.addresses.length === 0,
      }

      return {
        account: {
          ...account,
          addresses: [...account.addresses, newAddress],
        },
        value: newAddress,
      }
    },
    options.storage,
  )
}

export function updateAccountAddress(accountId, addressId, addressValue, storage) {
  const address = normalizeAddress(addressValue)
  const label = normalizeText(addressValue?.label)

  if (!address || !label || !isCompleteAddress(address)) {
    return { ok: false, code: 'invalid_address' }
  }

  return updateStoredAccount(
    accountId,
    (account) => {
      const addressIndex = account.addresses.findIndex(
        (item) => item.id === addressId,
      )

      if (addressIndex < 0) return { code: 'address_not_found' }

      const addresses = [...account.addresses]
      addresses[addressIndex] = {
        ...addresses[addressIndex],
        label,
        postalCode: address.postalCode,
        street: address.street,
        addressNumber: address.addressNumber,
        addressComplement: address.addressComplement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
      }

      return { account: { ...account, addresses } }
    },
    storage,
  )
}

export function deleteAccountAddress(accountId, addressId, storage) {
  return updateStoredAccount(
    accountId,
    (account) => {
      const removedAddress = account.addresses.find(
        (address) => address.id === addressId,
      )

      if (!removedAddress) return { code: 'address_not_found' }

      const remainingAddresses = account.addresses.filter(
        (address) => address.id !== addressId,
      )
      const addresses = remainingAddresses.map((address, index) => ({
        ...address,
        isDefault: removedAddress.isDefault ? index === 0 : address.isDefault,
      }))

      return { account: { ...account, addresses } }
    },
    storage,
  )
}

export function setDefaultAccountAddress(accountId, addressId, storage) {
  return updateStoredAccount(
    accountId,
    (account) => {
      if (!account.addresses.some((address) => address.id === addressId)) {
        return { code: 'address_not_found' }
      }

      return {
        account: {
          ...account,
          addresses: account.addresses.map((address) => ({
            ...address,
            isDefault: address.id === addressId,
          })),
        },
      }
    },
    storage,
  )
}

export function addAccountPaymentMethod(accountId, cardValue, options = {}) {
  if (Object.keys(validatePaymentCard(cardValue)).length > 0) {
    return { ok: false, code: 'invalid_payment_method' }
  }

  return updateStoredAccount(
    accountId,
    (account) => {
      const paymentMethod = {
        ...createSanitizedPaymentMethod(
          cardValue,
          createLocalId('card', options.cryptoProvider),
        ),
        isDefault: account.paymentMethods.length === 0,
      }

      return {
        account: {
          ...account,
          paymentMethods: [...account.paymentMethods, paymentMethod],
        },
        value: paymentMethod,
      }
    },
    options.storage,
  )
}

export function deleteAccountPaymentMethod(accountId, paymentMethodId, storage) {
  return updateStoredAccount(
    accountId,
    (account) => {
      const removedMethod = account.paymentMethods.find(
        (method) => method.id === paymentMethodId,
      )

      if (!removedMethod) return { code: 'payment_method_not_found' }

      const remainingMethods = account.paymentMethods.filter(
        (method) => method.id !== paymentMethodId,
      )
      const paymentMethods = remainingMethods.map((method, index) => ({
        ...method,
        isDefault: removedMethod.isDefault ? index === 0 : method.isDefault,
      }))

      return { account: { ...account, paymentMethods } }
    },
    storage,
  )
}

export function setDefaultAccountPaymentMethod(
  accountId,
  paymentMethodId,
  storage,
) {
  return updateStoredAccount(
    accountId,
    (account) => {
      if (
        !account.paymentMethods.some((method) => method.id === paymentMethodId)
      ) {
        return { code: 'payment_method_not_found' }
      }

      return {
        account: {
          ...account,
          paymentMethods: account.paymentMethods.map((method) => ({
            ...method,
            isDefault: method.id === paymentMethodId,
          })),
        },
      }
    },
    storage,
  )
}

export function clearSession(storage = getDefaultStorage()) {
  if (!storage) return false

  try {
    storage.removeItem(SESSION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
