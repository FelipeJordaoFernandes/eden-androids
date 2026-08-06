import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import useCart from '../hooks/useCart.js'
import { CART_STORAGE_KEY } from './cartConfig.js'
import CartProvider from './CartContext.jsx'

function CartHarness() {
  const cart = useCart()

  return (
    <div>
      <output aria-label="quantidade total">{cart.totalItems}</output>
      <output aria-label="total do carrinho">{cart.total}</output>
      <button type="button" onClick={() => cart.addItem(1)}>Adicionar</button>
      <button type="button" onClick={() => cart.incrementItem(1)}>Aumentar</button>
      <button type="button" onClick={() => cart.setWarranty(1, 'extended12')}>
        Garantia 12 meses
      </button>
      <button type="button" onClick={cart.clearCart}>Limpar</button>
    </div>
  )
}

function renderCart() {
  return render(
    <CartProvider>
      <CartHarness />
    </CartProvider>,
  )
}

describe('CartProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('recupera o carrinho persistido ao iniciar', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: 1, quantity: 2, warranty: 'standard' }]),
    )

    renderCart()

    expect(screen.getByLabelText('quantidade total')).toHaveTextContent('2')
    expect(screen.getByLabelText('total do carrinho')).toHaveTextContent('97800')
  })

  it('persiste adição, quantidade, garantia e limpeza', async () => {
    const user = userEvent.setup()

    renderCart()

    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await user.click(screen.getByRole('button', { name: 'Aumentar' }))
    await user.click(screen.getByRole('button', { name: 'Garantia 12 meses' }))

    expect(screen.getByLabelText('quantidade total')).toHaveTextContent('2')
    expect(screen.getByLabelText('total do carrinho')).toHaveTextContent('103668')
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY))).toEqual([
        { productId: 1, quantity: 2, warranty: 'extended12' },
      ])
    })

    await user.click(screen.getByRole('button', { name: 'Limpar' }))

    expect(screen.getByLabelText('quantidade total')).toHaveTextContent('0')
    await waitFor(() => {
      expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull()
    })
  })
})
