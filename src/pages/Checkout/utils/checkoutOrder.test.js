import { describe, expect, it } from 'vitest'
import { shippingOptions } from '../checkoutConfig.js'
import {
  calculateCheckoutTotal,
  createAvailableOrderNumber,
  createOrderNumber,
  createOrderSnapshot,
} from './checkoutOrder.js'

describe('cálculos e criação do pedido', () => {
  it('soma o frete selecionado ao total do carrinho', () => {
    expect(calculateCheckoutTotal(100000, shippingOptions[0])).toBe(100000)
    expect(calculateCheckoutTotal(100000, shippingOptions[1])).toBe(101890)
    expect(calculateCheckoutTotal(100000, null)).toBe(100000)
  })

  it('gera um número de pedido no formato aprovado', () => {
    const now = new Date(2026, 7, 5)

    expect(createOrderNumber(now, () => 0.1234)).toBe('EDN-260805-1234')
  })

  it('escolhe uma sequência livre quando o número gerado já existe', () => {
    const now = new Date(2026, 7, 5)

    expect(
      createAvailableOrderNumber(['EDN-260805-1234'], now, () => 0.1234),
    ).toBe('EDN-260805-0000')
  })

  it('cria uma cópia estável dos itens para a confirmação', () => {
    const now = new Date('2026-08-08T12:30:00.000Z')
    const cartItems = [
      {
        id: 1,
        name: 'Eden Home H-01',
        modelCode: 'EN-H01',
        image: '/images/products/eden-home-h01.png',
        price: 48900,
        quantity: 2,
        warrantyDetails: { label: '+12 meses' },
        warrantyCost: 5868,
      },
    ]
    const order = createOrderSnapshot({
      cartItems,
      destination: { city: 'São Paulo', state: 'SP' },
      now,
      paymentLabel: 'Pix',
      random: () => 0.1234,
      shipping: shippingOptions[0],
      subtotal: 97800,
      warrantyTotal: 5868,
      grandTotal: 103668,
    })

    cartItems[0].quantity = 4

    expect(order.number).toBe('EDN-260808-1234')
    expect(order.createdAt).toBe('2026-08-08T12:30:00.000Z')
    expect(order.items[0].quantity).toBe(2)
    expect(order.items[0]).toEqual({
      id: 1,
      name: 'Eden Home H-01',
      modelCode: 'EN-H01',
      image: '/images/products/eden-home-h01.png',
      quantity: 2,
      unitPrice: 48900,
      warranty: { label: '+12 meses', value: 5868 },
    })
    expect(order.shipping).toEqual({
      method: 'Entrega agendada',
      estimate: '12 a 18 dias úteis',
      price: 0,
    })
    expect(order.destination).toEqual({ city: 'São Paulo', state: 'SP' })
    expect(order.total).toBe(103668)
    expect(order).not.toHaveProperty('customerName')
    expect(order).not.toHaveProperty('email')
  })
})
