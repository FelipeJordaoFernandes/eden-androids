import {
  getEmailError,
  getNameError,
  normalizeEmail,
  normalizeName,
} from '../../utils/authValidation.js'
import {
  isCompleteAddress,
  normalizeAddress,
  normalizeStoredAddress,
} from '../../utils/address.js'
import {
  formatDocument,
  formatPhone,
  isValidCpf,
  isValidPhone,
} from '../../utils/customerData.js'
import { normalizeStoredPaymentMethod } from '../../utils/paymentCard.js'
import {
  ACCOUNT_STORAGE_KEY,
  AUTH_STORAGE_VERSION,
  LEGACY_ACCOUNT_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  SESSION_STORAGE_VERSION,
  getDefaultStorage,
  normalizeText,
} from './authConfig.js'
import { normalizeCredential } from './authCrypto.js'

function normalizeCreatedAt(value) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) return null

  const timestamp = Date.parse(normalizedValue)

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
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
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

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

export function toPublicAccount(account) {
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
      !parsedValue ||
      typeof parsedValue !== 'object' ||
      Array.isArray(parsedValue) ||
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

export function writeAccountRecords(accounts, storage) {
  storage.setItem(
    ACCOUNT_STORAGE_KEY,
    JSON.stringify({ version: AUTH_STORAGE_VERSION, accounts }),
  )
}

export function loadAccountRecords(storage = getDefaultStorage()) {
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

export function writeSession(accountId, storage) {
  storage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ version: SESSION_STORAGE_VERSION, accountId }),
  )
}

export function updateStoredAccount(
  accountId,
  updater,
  storage = getDefaultStorage(),
) {
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
