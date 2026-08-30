import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { products } from '../data/products.js'
import RouteMetadata from './RouteMetadata.jsx'

function renderMetadata(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RouteMetadata />
    </MemoryRouter>,
  )
}

describe('metadados por rota', () => {
  it('publica título, descrição e canonical específicos para o catálogo', async () => {
    renderMetadata('/catalog?category=Doméstico')

    await waitFor(() => {
      expect(document.title).toBe('Catálogo de androides | Eden Androids')
    })
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    )
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://eden-androids.vercel.app/catalog',
    )
  })

  it('usa os dados do produto nas tags sociais', async () => {
    const product = products[2]
    renderMetadata(`/product/${product.id}`)

    await waitFor(() => {
      expect(document.title).toBe(`${product.name} | Eden Androids`)
    })
    expect(document.querySelector('meta[property="og:type"]')).toHaveAttribute(
      'content',
      'product',
    )
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `https://eden-androids.vercel.app${product.image}`,
    )
  })

  it('impede indexação de áreas locais e páginas inexistentes', async () => {
    const view = renderMetadata('/account?tab=addresses')

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      )
    })

    view.unmount()
    renderMetadata('/rota-inexistente')

    await waitFor(() => {
      expect(document.title).toBe('Página não encontrada | Eden Androids')
    })
  })
})
