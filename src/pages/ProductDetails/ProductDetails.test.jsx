import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { products } from '../../data/products.js'
import ProductDetails from './ProductDetails.jsx'

const cart = vi.hoisted(() => ({
  addItem: vi.fn(),
  getItemQuantity: vi.fn(() => 0),
}))

vi.mock('../../hooks/useCart.js', () => ({
  default: () => cart,
}))

function renderDetails(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('detalhes do produto', () => {
  beforeEach(() => {
    cart.addItem.mockReset()
    cart.getItemQuantity.mockReturnValue(0)
  })

  it('carrega a imagem principal com prioridade e adiciona o produto ao carrinho', async () => {
    const user = userEvent.setup()
    const product = products[2]
    renderDetails(`/product/${product.id}`)

    expect(screen.getByRole('heading', { name: product.name })).toHaveFocus()
    expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high')

    await user.click(screen.getByRole('button', { name: 'Adicionar ao carrinho' }))

    expect(cart.addItem).toHaveBeenCalledWith(product.id)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Adicionado ao carrinho. 1 unidade deste modelo no carrinho.',
    )
  })

  it('mantém um estado acessível para produto inexistente', () => {
    renderDetails('/product/inexistente')

    expect(
      screen.getByRole('heading', {
        name: 'Este androide não está no catálogo.',
      }),
    ).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
