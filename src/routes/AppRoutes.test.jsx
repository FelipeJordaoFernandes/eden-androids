import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AppRoutes from './AppRoutes.jsx'

vi.mock('../hooks/useCart.js', () => ({
  default: vi.fn(() => ({ cartItems: [], totalItems: 0 })),
}))

describe('AppRoutes', () => {
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
})
