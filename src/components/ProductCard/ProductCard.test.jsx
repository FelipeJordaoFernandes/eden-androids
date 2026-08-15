import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { products } from '../../data/products.js'
import Home from '../../pages/Home/Home.jsx'
import ProductCard from './ProductCard.jsx'

describe('cards navegáveis de produto', () => {
  it('transforma o card inteiro em um único link acessível e remove o texto redundante', async () => {
    const user = userEvent.setup()
    const product = products[0]

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ProductCard product={product} />} />
          <Route path={`/product/${product.id}`} element={<h1>Produto aberto</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', {
      name: `Ver detalhes de ${product.name}`,
    })

    expect(link).toHaveAttribute('href', `/product/${product.id}`)
    expect(screen.queryByText('Ver detalhes')).toBeNull()
    expect(screen.getAllByRole('link')).toHaveLength(1)

    await user.tab()
    expect(link).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Produto aberto' })).toBeVisible()
  })

  it('aplica a mesma navegação aos três cards de destaque da Home', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.queryByText('Ver detalhes')).toBeNull()
    expect(screen.getAllByRole('link', { name: /Ver detalhes de Eden/ })).toHaveLength(
      3,
    )
  })
})
