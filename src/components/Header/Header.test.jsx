import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthProvider from '../../context/AuthContext.jsx'
import { registerAccount } from '../../services/authStorage.js'
import Header from './Header.jsx'

vi.mock('../../hooks/useCart.js', () => ({
  default: vi.fn(() => ({ totalItems: 2 })),
}))

function renderHeader(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function getLinkLabels(navigation) {
  return within(navigation)
    .getAllByRole('link')
    .map((link) => link.textContent)
}

describe('Header com conta local', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('exibe Entrar para visitantes na ordem aprovada no desktop e no menu móvel', async () => {
    const user = userEvent.setup()

    renderHeader()

    expect(
      getLinkLabels(
        screen.getByRole('navigation', { name: 'Navegação principal' }),
      ),
    ).toEqual(['Home', 'Catálogo', 'Sobre', 'Entrar', 'Carrinho2'])

    await user.click(screen.getByRole('button', { name: 'Abrir menu principal' }))

    expect(
      getLinkLabels(
        screen.getByRole('navigation', { name: 'Navegação móvel principal' }),
      ),
    ).toEqual(['Home', 'Catálogo', 'Sobre', 'Entrar', 'Carrinho2'])
  })

  it('substitui Entrar por Minha conta quando a sessão existe', async () => {
    await registerAccount({
      name: 'Felipe Jordão',
      email: 'felipe@exemplo.com',
      password: 'eden2026',
    })

    renderHeader()

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação principal',
    })

    expect(getLinkLabels(navigation)).toEqual([
      'Home',
      'Catálogo',
      'Sobre',
      'Pedidos',
      'Minha conta',
      'Carrinho2',
    ])
    expect(within(navigation).getByRole('link', { name: 'Minha conta' })).toHaveAttribute(
      'href',
      '/account',
    )
    expect(within(navigation).queryByRole('link', { name: 'Entrar' })).toBeNull()
  })

  it('mantém o acesso de visitante ativo durante o cadastro', () => {
    renderHeader('/register')

    expect(
      within(
        screen.getByRole('navigation', { name: 'Navegação principal' }),
      ).getByRole('link', { name: 'Entrar' }),
    ).toHaveClass('nav-link-active')
  })
})
