import {
  getEmailError,
  getNameError,
  getPasswordError,
  normalizeEmail,
  normalizeName,
} from '../utils/authValidation.js'
import { isCompleteAddress, normalizeAddress } from '../utils/address.js'
import {
  normalizeCustomerProfile,
  validateCustomerProfile,
} from '../utils/customerData.js'
import {
  createSanitizedPaymentMethod,
  validatePaymentCard,
} from '../utils/paymentCard.js'
import {
  ACCOUNT_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  SESSION_STORAGE_VERSION,
  getDefaultStorage,
  isRecord,
  normalizeText,
} from './auth/authConfig.js'
import {
  createCredential,
  createLocalId,
  getDefaultCrypto,
  verifyCredential,
} from './auth/authCrypto.js'
import {
  loadAccountRecords,
  toPublicAccount,
  updateStoredAccount,
  writeAccountRecords,
  writeSession,
} from './auth/authRepository.js'

export {
  ACCOUNT_STORAGE_KEY,
  AUTH_STORAGE_VERSION,
  LEGACY_ACCOUNT_STORAGE_KEY,
  PASSWORD_DERIVATION_ITERATIONS,
  SESSION_STORAGE_KEY,
  SESSION_STORAGE_VERSION,
} from './auth/authConfig.js'

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
    if (!(await verifyCredential(password, account.credential, cryptoProvider))) {
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
