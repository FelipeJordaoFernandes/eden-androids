import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveOrder } from '../../services/orderStorage.js'
import OrderDetails from './OrderDetails.jsx'
import Orders from './Orders.jsx'

function createOrder(overrides = {}) {
  return {
    number: 'EDN-260808-1234',
    createdAt: '2026-08-08T12:30:00.000Z',
    items: [
      {
        id: 1,
        name: 'Eden Home H-01',
        modelCode: 'EN-H01',
        image: '/images/products/eden-home-h01.png',
        quantity: 2,
        unitPrice: 48900,
        warranty: { label: '+12 meses', value: 5868 },
      },
    ],
    subtotal: 97800,
    warrantyTotal: 5868,
    shipping: {
      method: 'Entrega prioritária',
      estimate: '7 a 10 dias úteis',
      price: 1890,
    },
    total: 105558,
    paymentMethod: 'Cartão de crédito',
    destination: { city: 'São Paulo', state: 'SP' },
    ...overrides,
  }
}

function renderOrders(initialEntry = '/orders') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderNumber" element={<OrderDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('histórico local de pedidos', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('exibe um estado vazio amigável e acessível', () => {
    renderOrders()

    expect(
      screen.getByRole('heading', {
        name: 'Nenhum pedido por aqui.',
      }),
    ).toHaveFocus()
    expect(
      screen.getByRole('link', { name: 'Explorar androides' }),
    ).toHaveAttribute('href', '/catalog')
  })

  it('renderiza o histórico do mais recente para o mais antigo', () => {
    saveOrder(createOrder())
    saveOrder(
      createOrder({
        number: 'EDN-260809-5678',
        createdAt: '2026-08-09T10:00:00.000Z',
      }),
    )

    renderOrders()

    const cards = screen.getAllByRole('article')

    expect(within(cards[0]).getByText('EDN-260809-5678')).toBeVisible()
    expect(within(cards[1]).getByText('EDN-260808-1234')).toBeVisible()
    expect(
      screen.getByRole('link', {
        name: 'Ver detalhes do pedido EDN-260809-5678',
      }),
    ).toHaveAttribute('href', '/orders/EDN-260809-5678')
  })

  it('renderiza os detalhes e os recupera após uma nova montagem', () => {
    saveOrder(createOrder())

    const view = renderOrders('/orders/EDN-260808-1234')

    expect(
      screen.getByRole('heading', { name: 'Detalhes do pedido.' }),
    ).toHaveFocus()
    expect(screen.getByText('Eden Home H-01')).toBeVisible()
    expect(screen.getByText('Cartão de crédito')).toBeVisible()
    expect(screen.getByText('São Paulo — SP')).toBeVisible()
    expect(screen.getByText(/R\$\s*105\.558/)).toBeVisible()

    view.unmount()
    renderOrders('/orders/EDN-260808-1234')

    expect(screen.getByText('EDN-260808-1234')).toBeVisible()
    expect(screen.getByText('7 a 10 dias úteis')).toBeVisible()
  })

  it('exibe um estado apropriado para um número inexistente', () => {
    renderOrders('/orders/EDN-INEXISTENTE')

    expect(
      screen.getByRole('heading', {
        name: 'Pedido não encontrado.',
      }),
    ).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Ver histórico' })).toHaveAttribute(
      'href',
      '/orders',
    )
  })
})
