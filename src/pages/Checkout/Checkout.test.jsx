import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useCart from '../../hooks/useCart.js'
import {
  loadOrders,
  ORDER_STORAGE_KEY,
} from '../../services/orderStorage.js'
import Checkout from './Checkout.jsx'

vi.mock('../../hooks/useCart.js', () => ({
  default: vi.fn(),
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

function createPostalCodeResponse(overrides = {}) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
      ...overrides,
    }),
  }
}

function renderCheckout(initialEntries = ['/checkout']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Checkout />
    </MemoryRouter>,
  )
}

async function fillValidCustomerData(user) {
  await user.type(screen.getByLabelText('Nome completo'), 'Ada Lovelace')
  await user.type(screen.getByLabelText('E-mail'), 'ada@eden.com.br')
  await user.type(screen.getByLabelText('Telefone'), '11912345678')
  await user.type(screen.getByLabelText('CPF'), '52998224725')
}

async function fillAddressAndCalculateShipping(user) {
  await user.type(screen.getByLabelText('CEP'), '01001000')
  await waitFor(() => {
    expect(screen.getByLabelText('Endereço')).toHaveValue('Praça da Sé')
  })
  await user.type(screen.getByLabelText('Número'), '100')
  await user.click(screen.getByRole('button', { name: 'Calcular frete' }))
}

describe('Checkout', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useCart.mockReset()
    vi.unstubAllGlobals()
  })

  it('exibe o estado vazio quando não há itens', () => {
    useCart.mockReturnValue(createCart({ cartItems: [], totalItems: 0 }))

    renderCheckout()

    expect(
      screen.getByRole('heading', { name: 'Seu checkout está vazio.' }),
    ).toHaveFocus()
    expect(
      screen.getByRole('link', { name: 'Explorar androides' }),
    ).toHaveAttribute('href', '/catalog')
  })

  it('destaca e explica dados de cliente inválidos', async () => {
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())

    renderCheckout()

    const email = screen.getByLabelText('E-mail')
    const phone = screen.getByLabelText('Telefone')
    const document = screen.getByLabelText('CPF')

    await user.type(email, 'invalido')
    await user.tab()
    await user.type(phone, '11111111111')
    await user.tab()
    await user.type(document, '11111111111')
    await user.tab()

    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(phone).toHaveAttribute('aria-invalid', 'true')
    expect(document).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/Informe um e-mail válido/)).toBeVisible()
    expect(screen.getByText(/Informe um telefone válido/)).toBeVisible()
    expect(screen.getByText(/Informe um CPF válido/)).toBeVisible()
  })

  it('preenche o endereço com o ViaCEP simulado e libera o frete', async () => {
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createPostalCodeResponse()),
    )

    renderCheckout()

    const shippingButton = screen.getByRole('button', {
      name: 'Calcular frete',
    })

    await user.type(screen.getByLabelText('CEP'), '01001000')

    await waitFor(() => {
      expect(screen.getByLabelText('Endereço')).toHaveValue('Praça da Sé')
    })
    expect(screen.getByLabelText('Bairro')).toHaveValue('Sé')
    expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo')
    expect(screen.getByLabelText('UF')).toHaveValue('SP')
    expect(shippingButton).toBeDisabled()

    await user.type(screen.getByLabelText('Número'), '100')
    expect(shippingButton).toBeEnabled()

    await user.click(shippingButton)

    expect(
      screen.getByRole('radio', { name: /Entrega agendada/ }),
    ).toBeChecked()
    expect(screen.getByText('12 a 18 dias úteis')).toBeVisible()
  })

  it('mostra erro quando o ViaCEP simulado não encontra o CEP', async () => {
    const user = userEvent.setup()
    useCart.mockReturnValue(createCart())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createPostalCodeResponse({ erro: true })),
    )

    renderCheckout()

    await user.type(screen.getByLabelText('CEP'), '99999999')

    expect(
      await screen.findByText('CEP não encontrado. Confira os números informados.'),
    ).toBeVisible()
    expect(screen.getByLabelText('CEP')).toHaveAttribute('aria-invalid', 'true')
  })

  it('salva antes de limpar o carrinho e restaura a confirmação após recarregar', async () => {
    const user = userEvent.setup()
    const clearCart = vi.fn(() => {
      expect(loadOrders()).toHaveLength(1)
    })
    const cart = createCart({ clearCart })
    useCart.mockReturnValue(cart)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createPostalCodeResponse()),
    )

    const view = renderCheckout()

    await fillValidCustomerData(user)
    await fillAddressAndCalculateShipping(user)
    await user.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que revisei os dados deste pedido.',
      }),
    )
    await user.dblClick(
      screen.getByRole('button', { name: 'Concluir pedido' }),
    )

    const confirmation = await screen.findByRole('heading', {
      name: 'Pedido concluído.',
    })
    expect(confirmation).toHaveFocus()
    const orderNumber = screen.getByText(/^EDN-\d{6}-\d{4}$/).textContent

    expect(orderNumber).toBeTruthy()
    expect(screen.getByText(/R\$\s*48\.900/)).toBeVisible()
    expect(clearCart).toHaveBeenCalledOnce()
    expect(loadOrders()).toHaveLength(1)
    expect(loadOrders()[0]).toMatchObject({
      number: orderNumber,
      paymentMethod: 'Pix',
      destination: { city: 'São Paulo', state: 'SP' },
    })
    expect(window.localStorage.getItem(ORDER_STORAGE_KEY)).not.toMatch(
      /Ada Lovelace|ada@eden\.com\.br|529\.982\.247-25|\(11\) 91234-5678|Praça da Sé/,
    )
    expect(
      screen.getByRole('link', { name: 'Ver detalhes do pedido' }),
    ).toHaveAttribute('href', `/orders/${orderNumber}`)
    expect(
      screen.getByRole('link', { name: 'Ver histórico de pedidos' }),
    ).toHaveAttribute('href', '/orders')
    expect(
      screen.getByRole('link', { name: 'Continuar comprando' }),
    ).toHaveAttribute('href', '/catalog')

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
})
