import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveOrder } from '../services/orderStorage.js'
import AuthProvider from '../context/AuthContext.jsx'
import {
  clearSession,
  registerAccount,
} from '../services/authStorage.js'
import AppRoutes from './AppRoutes.jsx'

const cartActions = vi.hoisted(() => ({
  clearCart: vi.fn(),
}))

vi.mock('../hooks/useCart.js', () => ({
  default: vi.fn(() => ({
    cartItems: [],
    clearCart: cartActions.clearCart,
    subtotal: 0,
    total: 0,
    totalItems: 0,
    warrantyTotal: 0,
  })),
}))

describe('AppRoutes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    cartActions.clearCart.mockReset()
  })

  function renderRoutes(initialEntry) {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>,
    )
  }

  it('exibe e focaliza a página não encontrada em uma rota inválida', () => {
    renderRoutes('/rota-inexistente')

    const heading = screen.getByRole('heading', {
      name: 'Página não encontrada.',
    })

    expect(heading).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Voltar para a home' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('disponibiliza o histórico e os detalhes por suas rotas públicas', () => {
    saveOrder({
      number: 'EDN-260808-1234',
      createdAt: '2026-08-08T12:30:00.000Z',
      items: [
        {
          id: 1,
          name: 'Eden Home H-01',
          modelCode: 'EN-H01',
          image: '/images/products/eden-home-h01.png',
          quantity: 1,
          unitPrice: 48900,
          warranty: { label: 'Garantia padrão', value: 0 },
        },
      ],
      subtotal: 48900,
      warrantyTotal: 0,
      shipping: {
        method: 'Entrega agendada',
        estimate: '12 a 18 dias úteis',
        price: 0,
      },
      total: 48900,
      paymentMethod: 'Pix',
    })

    const historyView = renderRoutes('/orders')

    expect(
      screen.getByRole('heading', { name: 'Seus pedidos.' }),
    ).toBeVisible()

    historyView.unmount()
    renderRoutes('/orders/EDN-260808-1234')

    expect(
      screen.getByRole('heading', { name: 'Detalhes do pedido.' }),
    ).toBeVisible()
    expect(screen.getByText('EDN-260808-1234')).toBeVisible()
  })

  it('redireciona a área do cliente protegida para o login', () => {
    renderRoutes('/account')

    expect(
      screen.getByRole('heading', { name: 'Entre na sua conta.' }),
    ).toHaveFocus()
  })

  it('mantém o carrinho público, mas protege o checkout e restaura o destino após o login', async () => {
    await registerAccount({
      name: 'Felipe Jordão',
      email: 'felipe@exemplo.com',
      password: 'eden2026',
    })
    clearSession()
    const user = userEvent.setup()

    const cartView = renderRoutes('/cart')
    expect(
      screen.getByRole('heading', { name: 'Seu carrinho' }),
    ).toBeVisible()
    cartView.unmount()

    const checkoutView = renderRoutes('/checkout')
    expect(
      screen.getByRole('heading', { name: 'Entre na sua conta.' }),
    ).toHaveFocus()

    checkoutView.unmount()
    renderRoutes('/checkout')
    expect(
      screen.getByRole('heading', { name: 'Entre na sua conta.' }),
    ).toHaveFocus()

    await user.type(screen.getByLabelText('E-mail'), 'felipe@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'eden2026')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByRole('heading', { name: 'Seu checkout está vazio.' }),
    ).toHaveFocus()
    expect(cartActions.clearCart).not.toHaveBeenCalled()
  })
})
