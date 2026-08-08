import { beforeEach, describe, expect, it } from 'vitest'
import {
  findOrderByNumber,
  loadOrders,
  MAX_STORED_ORDERS,
  ORDER_STORAGE_KEY,
  saveOrder,
} from './orderStorage.js'

function createOrder(overrides = {}) {
  return {
    number: 'EDN-260808-0001',
    createdAt: '2026-08-08T12:00:00.000Z',
    items: [
      {
        id: 1,
        name: 'Eden Home H-01',
        modelCode: 'EN-H01',
        image: '/images/products/eden-home-h01.png',
        quantity: 1,
        unitPrice: 48900,
        warranty: {
          label: 'Garantia padrão',
          value: 0,
        },
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
    destination: {
      city: 'São Paulo',
      state: 'SP',
    },
    ...overrides,
  }
}

describe('orderStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('salva e recupera uma fotografia válida do pedido', () => {
    const order = createOrder()

    expect(saveOrder(order)).toEqual(order)
    expect(loadOrders()).toEqual([order])
    expect(findOrderByNumber(order.number)).toEqual(order)
  })

  it('ordena os pedidos do mais recente para o mais antigo', () => {
    saveOrder(
      createOrder({
        number: 'EDN-260808-0001',
        createdAt: '2026-08-08T10:00:00.000Z',
      }),
    )
    saveOrder(
      createOrder({
        number: 'EDN-260808-0002',
        createdAt: '2026-08-08T14:00:00.000Z',
      }),
    )

    expect(loadOrders().map((order) => order.number)).toEqual([
      'EDN-260808-0002',
      'EDN-260808-0001',
    ])
  })

  it('não grava duas vezes o mesmo número de pedido', () => {
    const order = createOrder()

    saveOrder(order)
    saveOrder({ ...order, total: 999999 })

    expect(loadOrders()).toHaveLength(1)
    expect(loadOrders()[0].total).toBe(48900)
  })

  it('mantém somente os vinte pedidos mais recentes', () => {
    for (let index = 1; index <= 25; index += 1) {
      saveOrder(
        createOrder({
          number: `EDN-260808-${String(index).padStart(4, '0')}`,
          createdAt: new Date(Date.UTC(2026, 7, index)).toISOString(),
        }),
      )
    }

    const orders = loadOrders()

    expect(orders).toHaveLength(MAX_STORED_ORDERS)
    expect(orders[0].number).toBe('EDN-260808-0025')
    expect(orders.at(-1).number).toBe('EDN-260808-0006')
  })

  it('ignora conteúdo corrompido ou de versão incompatível', () => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, '{conteúdo inválido')
    expect(loadOrders()).toEqual([])

    window.localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({ version: 999, orders: [createOrder()] }),
    )
    expect(loadOrders()).toEqual([])
  })

  it('persiste somente os campos permitidos e descarta dados pessoais', () => {
    saveOrder({
      ...createOrder(),
      fullName: 'Ada Lovelace',
      email: 'ada@eden.test',
      phone: '(11) 91234-5678',
      document: '529.982.247-25',
      address: 'Praça da Sé, 100',
      cardNumber: '4111111111111111',
      cardExpiry: '12/30',
      cardCvv: '123',
    })

    const storedValue = window.localStorage.getItem(ORDER_STORAGE_KEY)
    const persistedOrder = JSON.parse(storedValue).orders[0]

    expect(persistedOrder).not.toHaveProperty('fullName')
    expect(persistedOrder).not.toHaveProperty('email')
    expect(persistedOrder).not.toHaveProperty('phone')
    expect(persistedOrder).not.toHaveProperty('document')
    expect(persistedOrder).not.toHaveProperty('address')
    expect(persistedOrder).not.toHaveProperty('cardNumber')
    expect(persistedOrder).not.toHaveProperty('cardExpiry')
    expect(persistedOrder).not.toHaveProperty('cardCvv')
    expect(storedValue).not.toContain('ada@eden.test')
    expect(storedValue).not.toContain('529.982.247-25')
    expect(storedValue).not.toContain('4111111111111111')
  })
})
