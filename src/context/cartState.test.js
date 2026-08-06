import { describe, expect, it, vi } from 'vitest'
import { products } from '../data/products.js'
import {
  calculateCartTotals,
  cartReducer,
  createCartItems,
  initializeCart,
} from './cartState.js'

describe('estado do carrinho', () => {
  it('recupera e normaliza apenas itens persistidos válidos', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(
        JSON.stringify([
          { productId: 1, quantity: 1, warranty: 'standard' },
          { productId: 1, quantity: 2, warranty: 'extended12' },
          { productId: 999, quantity: 1, warranty: 'standard' },
          { productId: 2, quantity: 0, warranty: 'standard' },
        ]),
      ),
    }

    expect(initializeCart(storage)).toEqual([
      { productId: 1, quantity: 3, warranty: 'extended12' },
    ])
  })

  it('ignora armazenamento ausente ou corrompido', () => {
    expect(initializeCart(null)).toEqual([])
    expect(
      initializeCart({ getItem: vi.fn().mockReturnValue('{inválido') }),
    ).toEqual([])
  })

  it('executa as operações principais e respeita o estoque', () => {
    let state = cartReducer([], { type: 'ADD_ITEM', productId: 1 })
    expect(state).toEqual([
      { productId: 1, quantity: 1, warranty: 'standard' },
    ])

    state = cartReducer(state, { type: 'INCREMENT_ITEM', productId: 1 })
    expect(state[0].quantity).toBe(2)

    state = cartReducer(state, {
      type: 'SET_QUANTITY',
      productId: 1,
      quantity: 999,
    })
    expect(state[0].quantity).toBe(products[0].stock)

    state = cartReducer(state, { type: 'DECREMENT_ITEM', productId: 1 })
    expect(state[0].quantity).toBe(products[0].stock - 1)

    state = cartReducer(state, {
      type: 'SET_WARRANTY',
      productId: 1,
      warranty: 'extended24',
    })
    expect(state[0].warranty).toBe('extended24')

    state = cartReducer(state, { type: 'REMOVE_ITEM', productId: 1 })
    expect(state).toEqual([])
  })

  it('calcula produtos, garantia e total com arredondamento monetário', () => {
    const cartItems = createCartItems([
      { productId: 1, quantity: 2, warranty: 'extended12' },
    ])

    expect(cartItems[0]).toMatchObject({
      itemSubtotal: 97800,
      warrantyCost: 5868,
      itemTotal: 103668,
    })
    expect(calculateCartTotals(cartItems)).toEqual({
      totalItems: 2,
      subtotal: 97800,
      warrantyTotal: 5868,
      total: 103668,
    })
  })

  it('limpa todos os itens', () => {
    const state = [{ productId: 1, quantity: 1, warranty: 'standard' }]

    expect(cartReducer(state, { type: 'CLEAR_CART' })).toEqual([])
  })
})
