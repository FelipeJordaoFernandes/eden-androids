import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveOrder } from '../services/orderStorage.js'
import AppRoutes from './AppRoutes.jsx'

vi.mock('../hooks/useCart.js', () => ({
  default: vi.fn(() => ({ cartItems: [], totalItems: 0 })),
}))

describe('AppRoutes', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('exibe e focaliza a página não encontrada em uma rota inválida', () => {
    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <AppRoutes />
      </MemoryRouter>,
    )

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

    const historyView = render(
      <MemoryRouter initialEntries={['/orders']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Seus pedidos.' }),
    ).toBeVisible()

    historyView.unmount()
    render(
      <MemoryRouter initialEntries={['/orders/EDN-260808-1234']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Detalhes do pedido.' }),
    ).toBeVisible()
    expect(screen.getByText('EDN-260808-1234')).toBeVisible()
  })
})
