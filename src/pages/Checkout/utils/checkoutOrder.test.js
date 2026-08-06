import { describe, expect, it } from 'vitest'
import { shippingOptions } from '../checkoutConfig.js'
import {
  calculateCheckoutTotal,
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

  it('cria uma cópia estável dos itens para a confirmação', () => {
    const cartItems = [
      {
        id: 1,
        name: 'Eden Home H-01',
        modelCode: 'EN-H01',
        quantity: 2,
        itemTotal: 97800,
      },
    ]
    const order = createOrderSnapshot({
      cartItems,
      customerName: 'Ada Lovelace',
      email: 'ada@eden.test',
      paymentLabel: 'Pix',
      shipping: shippingOptions[0],
      subtotal: 97800,
      warrantyTotal: 0,
      grandTotal: 97800,
    })

    cartItems[0].quantity = 4

    expect(order.items[0].quantity).toBe(2)
    expect(order.grandTotal).toBe(97800)
  })
})
