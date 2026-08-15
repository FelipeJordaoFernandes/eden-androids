import { webcrypto } from 'node:crypto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../../context/AuthContext.jsx'
import useCart from '../../hooks/useCart.js'
import {
  addAccountAddress,
  addAccountPaymentMethod,
  registerAccount,
  updateAccountProfile,
} from '../../services/authStorage.js'
import {
  loadOrders,
  ORDER_STORAGE_KEY,
} from '../../services/orderStorage.js'
import { fetchAddressByPostalCode } from '../../services/postalCodeService.js'
import Checkout from './Checkout.jsx'

vi.mock('../../hooks/useCart.js', () => ({
  default: vi.fn(),
}))

vi.mock('../../services/postalCodeService.js', () => ({
  fetchAddressByPostalCode: vi.fn(),
}))

const cartItem = {
  id: 1,
  name: 'Eden Home H-01',
  line: 'Habitat Series',
  modelCode: 'EN-H01',
  image: '/images/products/eden-home-h01.png',
  price: 48900,
  quantity: 1,
  itemTotal: 48900,
  warrantyDetails: { label: 'Garantia padrão' },
  warrantyCost: 0,
}

const profile = {
  name: 'Ada Lovelace',
  email: 'ada@eden.com.br',
  phone: '(11) 91234-5678',
  document: '529.982.247-25',
}

const address = {
  label: 'Casa',
  postalCode: '01001-000',
  street: 'Praça da Sé',
  addressNumber: '100',
  addressComplement: '',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
}

function createCart(overrides = {}) {
  return {
    cartItems: [cartItem],
    clearCart: vi.fn(),
    subtotal: 48900,
    total: 48900,
    totalItems: 1,
    warrantyTotal: 0,
    ...overrides,
  }
}

async function prepareAccount({
  complete = true,
  withAddress = true,
  withCard = false,
} = {}) {
  const registered = await registerAccount(
    {
      name: profile.name,
      email: profile.email,
      password: 'eden2026',
    },
    {
      storage: window.localStorage,
      cryptoProvider: webcrypto,
      now: () => new Date('2026-08-15T12:00:00.000Z'),
    },
  )

  if (complete) {
    updateAccountProfile(registered.account.id, profile, window.localStorage)
  }
  if (withAddress) {
    addAccountAddress(registered.account.id, address, {
      storage: window.localStorage,
      cryptoProvider: webcrypto,
    })
  }
  if (withCard) {
    addAccountPaymentMethod(
      registered.account.id,
      {
        label: 'Principal',
        cardholder: 'ADA LOVELACE',
        cardNumber: '4111 1111 1111 1111',
        expiry: '12/30',
        cvv: '123',
      },
      {
        storage: window.localStorage,
        cryptoProvider: webcrypto,
      },
    )
  }

  return registered.account.id
}

function renderCheckout(initialEntries = ['/checkout']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Checkout />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Checkout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useCart.mockReset()
    vi.mocked(fetchAddressByPostalCode).mockReset()
    vi.mocked(fetchAddressByPostalCode).mockResolvedValue({
      postalCode: '01001-000',
      street: 'Praça da Sé',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
    })
  })

  it('exibe o estado vazio para uma conta autenticada sem itens', async () => {
    await prepareAccount({ complete: false, withAddress: false })
    useCart.mockReturnValue(createCart({ cartItems: [], totalItems: 0 }))

    renderCheckout()

    expect(
      screen.getByRole('heading', { name: 'Seu checkout está vazio.' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('link', { name: 'Explorar androides' }),
    ).toHaveAttribute('href', '/catalog')
  })

  it('interrompe o checkout até os dados pessoais da conta estarem completos', async () => {
    await prepareAccount({ complete: false, withAddress: false })
    useCart.mockReturnValue(createCart())

    renderCheckout()

    expect(
      screen.getByRole('heading', { name: 'Complete seus dados pessoais.' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('link', { name: 'Completar dados pessoais' }),
    ).toHaveAttribute('href', '/account?tab=personal')
    expect(screen.queryByText('Eden Home H-01')).not.toBeInTheDocument()
  })

  it('usa o endereço salvo sem solicitar novamente dados pessoais', async () => {
    await prepareAccount()
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())

    renderCheckout()

    expect(screen.getByRole('radio', { name: /Casa · Principal/ })).toBeChecked()
    expect(screen.getByText(/Praça da Sé, 100/)).toBeVisible()
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('CPF')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Calcular frete' }))

    expect(
      screen.getByRole('radio', { name: /Entrega agendada/ }),
    ).toBeChecked()
    expect(screen.getByText('12 a 18 dias úteis')).toBeVisible()
  })

  it('consulta o ViaCEP simulado, salva um novo endereço e libera o frete', async () => {
    await prepareAccount({ withAddress: false })
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())

    renderCheckout()

    const shippingButton = screen.getByRole('button', {
      name: 'Calcular frete',
    })
    expect(shippingButton).toBeDisabled()

    await user.type(screen.getByLabelText('Nome do endereço'), 'Trabalho')
    await user.type(screen.getByLabelText('CEP'), '01001000')

    expect(await screen.findByDisplayValue('Praça da Sé')).toBeVisible()
    expect(fetchAddressByPostalCode).toHaveBeenCalledWith('01001-000')

    await user.type(screen.getByLabelText('Número'), '200')
    await user.click(
      screen.getByRole('button', { name: 'Salvar e usar este endereço' }),
    )

    expect(screen.getByRole('radio', { name: /Trabalho/ })).toBeChecked()
    expect(shippingButton).toBeEnabled()
    await user.click(shippingButton)
    expect(
      screen.getByRole('radio', { name: /Entrega agendada/ }),
    ).toBeChecked()
  })

  it('salva antes de limpar o carrinho, sem copiar dados pessoais, e restaura a confirmação', async () => {
    await prepareAccount()
    const user = userEvent.setup()
    const clearCart = vi.fn(() => {
      expect(loadOrders()).toHaveLength(1)
    })
    useCart.mockReturnValue(createCart({ clearCart }))

    const view = renderCheckout()

    await user.click(screen.getByRole('button', { name: 'Calcular frete' }))
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que revisei os dados deste pedido.',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Concluir pedido' }))

    const confirmation = await screen.findByRole('heading', {
      name: 'Pedido concluído.',
    })
    expect(confirmation).toHaveFocus()
    const orderNumber = screen.getByText(/^EDN-\d{6}-\d{4}$/).textContent
    const rawOrders = window.localStorage.getItem(ORDER_STORAGE_KEY)

    expect(orderNumber).toBeTruthy()
    expect(screen.getByText(/R\$\s*48\.900/)).toBeVisible()
    expect(clearCart).toHaveBeenCalledOnce()
    expect(loadOrders()).toHaveLength(1)
    expect(loadOrders()[0]).toMatchObject({
      number: orderNumber,
      paymentMethod: 'Pix',
      destination: { city: 'São Paulo', state: 'SP' },
    })
    expect(rawOrders).not.toMatch(
      /Ada Lovelace|ada@eden\.com\.br|529\.982\.247-25|\(11\) 91234-5678|Praça da Sé/,
    )
    expect(rawOrders).not.toContain('postalCode')
    expect(rawOrders).not.toContain('addressNumber')
    expect(
      screen.getByRole('link', { name: 'Ver detalhes do pedido' }),
    ).toHaveAttribute('href', `/orders/${orderNumber}`)

    view.unmount()
    useCart.mockReturnValue(
      createCart({ cartItems: [], clearCart, totalItems: 0 }),
    )
    renderCheckout([`/checkout?order=${orderNumber}`])

    expect(
      screen.getByRole('heading', { name: 'Pedido concluído.' }),
    ).toHaveFocus()
    expect(screen.getByText(orderNumber)).toBeVisible()
  })

  it('seleciona o cartão sanitizado e mantém as dez parcelas no checkout', async () => {
    await prepareAccount({ withCard: true })
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())

    renderCheckout()
    await user.click(
      screen.getByRole('radio', { name: /Cartão de crédito/ }),
    )

    expect(
      screen.getByRole('radio', { name: /Principal · Principal/ }),
    ).toBeChecked()
    expect(screen.getByText(/Visa •••• 1111/)).toBeVisible()
    expect(
      screen.getByRole('combobox', { name: 'Parcelamento' }).options,
    ).toHaveLength(10)
    expect(screen.queryByText('4111 1111 1111 1111')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('CVV')).not.toBeInTheDocument()
  })
})
