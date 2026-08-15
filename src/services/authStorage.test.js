import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  ACCOUNT_STORAGE_KEY,
  AUTH_STORAGE_VERSION,
  LEGACY_ACCOUNT_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  addAccountAddress,
  addAccountPaymentMethod,
  authenticateAccount,
  clearSession,
  deleteAccountAddress,
  deleteAccountPaymentMethod,
  loadAccounts,
  loadCurrentAccount,
  registerAccount,
  setDefaultAccountAddress,
  setDefaultAccountPaymentMethod,
  updateAccountAddress,
  updateAccountProfile,
} from './authStorage.js'

const accountData = {
  name: '  Felipe   Jordão  ',
  email: '  FELIPE@EXEMPLO.COM  ',
  password: 'eden2026',
  cpf: '123.456.789-00',
  phone: '(11) 99999-9999',
  address: 'Rua de teste, 10',
}

const profile = {
  name: 'Felipe Jordão',
  email: 'felipe@exemplo.com',
  phone: '(11) 91234-5678',
  document: '529.982.247-25',
}

const address = {
  label: 'Casa',
  postalCode: '01001000',
  street: 'Praça da Sé',
  addressNumber: '100',
  addressComplement: 'Conjunto 12',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'sp',
}

const card = {
  label: 'Cartão principal',
  cardholder: 'FELIPE JORDAO',
  cardNumber: '4111 1111 1111 1111',
  expiry: '12/30',
  cvv: '123',
}

function register(overrides = {}) {
  return registerAccount(
    { ...accountData, ...overrides },
    {
      storage: window.localStorage,
      cryptoProvider: webcrypto,
      now: () => new Date('2026-08-15T12:00:00.000Z'),
    },
  )
}

function addAddress(accountId, value = address) {
  return addAccountAddress(accountId, value, {
    storage: window.localStorage,
    cryptoProvider: webcrypto,
  })
}

function addCard(accountId, value = card) {
  return addAccountPaymentMethod(accountId, value, {
    storage: window.localStorage,
    cryptoProvider: webcrypto,
  })
}

describe('persistência da conta local', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('salva a conta v2, inicia a sessão e preserva o verificador PBKDF2', async () => {
    const result = await register()
    const rawAccounts = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)
    const storedEnvelope = JSON.parse(rawAccounts)

    expect(result).toEqual({
      ok: true,
      account: {
        id: expect.any(String),
        name: 'Felipe Jordão',
        email: 'felipe@exemplo.com',
        phone: '',
        document: '',
        createdAt: '2026-08-15T12:00:00.000Z',
        addresses: [],
        paymentMethods: [],
      },
    })
    expect(storedEnvelope.version).toBe(AUTH_STORAGE_VERSION)
    expect(storedEnvelope.accounts[0].credential).toMatchObject({
      algorithm: 'PBKDF2-SHA-256',
      salt: expect.any(String),
      hash: expect.any(String),
      iterations: expect.any(Number),
    })
    expect(rawAccounts).not.toContain(accountData.password)
    expect(rawAccounts).not.toContain(accountData.cpf)
    expect(rawAccounts).not.toContain(accountData.phone)
    expect(rawAccounts).not.toContain(accountData.address)
    expect(loadAccounts()).toEqual([result.account])
    expect(loadCurrentAccount()).toEqual(result.account)
  })

  it('impede e-mails duplicados no cadastro e na edição do perfil', async () => {
    const first = await register()
    clearSession()
    const second = await register({
      name: 'Ada Lovelace',
      email: 'ada@exemplo.com',
    })

    expect(await register({ email: ' felipe@EXEMPLO.com ' })).toEqual({
      ok: false,
      code: 'email_exists',
    })
    expect(
      updateAccountProfile(
        second.account.id,
        { ...profile, name: 'Ada Lovelace' },
        window.localStorage,
      ),
    ).toEqual({ ok: false, code: 'email_exists' })
    expect(loadAccounts()).toHaveLength(2)
    expect(loadAccounts()[0].id).toBe(first.account.id)
  })

  it('atualiza e normaliza os dados pessoais completos', async () => {
    const registered = await register()
    const result = updateAccountProfile(
      registered.account.id,
      { ...profile, phone: '11912345678', document: '52998224725' },
      window.localStorage,
    )

    expect(result).toMatchObject({ ok: true, account: profile })
    expect(loadCurrentAccount()).toMatchObject(profile)
  })

  it('autentica credenciais válidas e rejeita credenciais incorretas genericamente', async () => {
    await register()
    clearSession()

    await expect(
      authenticateAccount(
        { email: 'FELIPE@EXEMPLO.COM', password: 'eden2026' },
        { storage: window.localStorage, cryptoProvider: webcrypto },
      ),
    ).resolves.toMatchObject({ ok: true })

    clearSession()

    await expect(
      authenticateAccount(
        { email: 'felipe@exemplo.com', password: 'senhaerrada1' },
        { storage: window.localStorage, cryptoProvider: webcrypto },
      ),
    ).resolves.toEqual({ ok: false, code: 'invalid_credentials' })
    await expect(
      authenticateAccount(
        { email: 'inexistente@exemplo.com', password: 'senhaerrada1' },
        { storage: window.localStorage, cryptoProvider: webcrypto },
      ),
    ).resolves.toEqual({ ok: false, code: 'invalid_credentials' })
  })

  it('restaura e encerra a sessão sem remover a conta', async () => {
    await register()

    expect(loadCurrentAccount()?.email).toBe('felipe@exemplo.com')
    expect(clearSession()).toBe(true)
    expect(loadCurrentAccount()).toBeNull()
    expect(loadAccounts()).toHaveLength(1)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('mantém vários endereços, permite editar, escolher o principal e excluir', async () => {
    const registered = await register()
    const first = addAddress(registered.account.id)
    const second = addAddress(registered.account.id, {
      ...address,
      label: 'Trabalho',
      addressNumber: '200',
    })

    expect(first.value).toMatchObject({ label: 'Casa', isDefault: true })
    expect(second.value).toMatchObject({ label: 'Trabalho', isDefault: false })

    const selected = setDefaultAccountAddress(
      registered.account.id,
      second.value.id,
      window.localStorage,
    )
    expect(selected.account.addresses.find(({ id }) => id === second.value.id))
      .toMatchObject({ isDefault: true })

    const edited = updateAccountAddress(
      registered.account.id,
      second.value.id,
      { ...address, label: 'Escritório', addressNumber: '300' },
      window.localStorage,
    )
    expect(edited.account.addresses.find(({ id }) => id === second.value.id))
      .toMatchObject({ label: 'Escritório', addressNumber: '300' })

    const removed = deleteAccountAddress(
      registered.account.id,
      second.value.id,
      window.localStorage,
    )
    expect(removed.account.addresses).toEqual([
      expect.objectContaining({ id: first.value.id, isDefault: true }),
    ])
  })

  it('persiste cartões somente de forma sanitizada e gerencia o principal', async () => {
    const registered = await register()
    const first = addCard(registered.account.id)
    const second = addCard(registered.account.id, {
      ...card,
      label: 'Cartão reserva',
      cardNumber: '5555 5555 5555 4444',
      cvv: '9876',
    })
    const rawAccounts = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)

    expect(first.value).toEqual({
      id: expect.any(String),
      label: 'Cartão principal',
      cardholder: 'FELIPE JORDAO',
      brand: 'Visa',
      lastFour: '1111',
      expiry: '12/30',
      isDefault: true,
    })
    expect(rawAccounts).not.toContain('4111111111111111')
    expect(rawAccounts).not.toContain('4111 1111 1111 1111')
    expect(rawAccounts).not.toContain('5555 5555 5555 4444')
    expect(rawAccounts).not.toContain('"cvv"')
    expect(rawAccounts).not.toContain('9876')

    const selected = setDefaultAccountPaymentMethod(
      registered.account.id,
      second.value.id,
      window.localStorage,
    )
    expect(selected.account.paymentMethods.find(({ id }) => id === second.value.id))
      .toMatchObject({ isDefault: true })

    const removed = deleteAccountPaymentMethod(
      registered.account.id,
      second.value.id,
      window.localStorage,
    )
    expect(removed.account.paymentMethods).toEqual([
      expect.objectContaining({ id: first.value.id, isDefault: true }),
    ])
  })

  it('isola perfil, endereços e cartões entre contas', async () => {
    const first = await register()
    clearSession()
    const second = await register({
      name: 'Ada Lovelace',
      email: 'ada@exemplo.com',
    })

    updateAccountProfile(first.account.id, profile, window.localStorage)
    addAddress(first.account.id)
    addCard(first.account.id)

    expect(loadAccounts().find(({ id }) => id === first.account.id)).toMatchObject({
      phone: profile.phone,
      addresses: [expect.objectContaining({ label: 'Casa' })],
      paymentMethods: [expect.objectContaining({ lastFour: '1111' })],
    })
    expect(loadAccounts().find(({ id }) => id === second.account.id)).toMatchObject({
      phone: '',
      addresses: [],
      paymentMethods: [],
    })
  })

  it('migra a conta v1 e transforma o endereço único em endereço principal', async () => {
    await register()
    const currentEnvelope = JSON.parse(
      window.localStorage.getItem(ACCOUNT_STORAGE_KEY),
    )
    const legacyRecord = {
      ...currentEnvelope.accounts[0],
      address: {
        postalCode: '01001-000',
        street: 'Praça da Sé',
        addressNumber: '100',
        addressComplement: '',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
      },
    }
    delete legacyRecord.addresses
    delete legacyRecord.paymentMethods
    window.localStorage.setItem(
      LEGACY_ACCOUNT_STORAGE_KEY,
      JSON.stringify({ version: 1, accounts: [legacyRecord] }),
    )
    window.localStorage.removeItem(ACCOUNT_STORAGE_KEY)

    expect(loadCurrentAccount()).toMatchObject({
      addresses: [
        expect.objectContaining({
          label: 'Endereço principal',
          isDefault: true,
          street: 'Praça da Sé',
        }),
      ],
      paymentMethods: [],
    })
    expect(
      JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).version,
    ).toBe(2)
  })

  it('rejeita dados incompletos sem alterar a conta armazenada', async () => {
    const registered = await register()
    const storedAccounts = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)

    expect(
      addAddress(registered.account.id, { postalCode: '01001-000' }),
    ).toEqual({ ok: false, code: 'invalid_address' })
    expect(
      addCard(registered.account.id, { cardNumber: '4111111111111111' }),
    ).toEqual({ ok: false, code: 'invalid_payment_method' })
    expect(window.localStorage.getItem(ACCOUNT_STORAGE_KEY)).toBe(storedAccounts)
  })

  it('ignora armazenamento ausente, corrompido ou incompatível sem quebrar', () => {
    expect(loadAccounts()).toEqual([])
    expect(loadCurrentAccount()).toBeNull()

    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, '{corrompido')
    window.localStorage.setItem(SESSION_STORAGE_KEY, '{corrompido')

    expect(loadAccounts()).toEqual([])
    expect(loadCurrentAccount()).toBeNull()

    window.localStorage.setItem(
      ACCOUNT_STORAGE_KEY,
      JSON.stringify({ version: 99, accounts: [] }),
    )
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ version: 99, accountId: 'incompatível' }),
    )

    expect(loadAccounts()).toEqual([])
    expect(loadCurrentAccount()).toBeNull()
  })
})
