import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Catalog from './Catalog.jsx'

describe('Catálogo', () => {
  it('renderiza os 24 produtos e prioriza os oito primeiros', () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('link', { name: /Ver detalhes de/ })).toHaveLength(
      24,
    )
    expect(screen.getByRole('status')).toHaveAccessibleName(
      '24 produtos encontrados',
    )

    const images = screen.getAllByRole('img')
    expect(images[0]).toHaveAttribute('loading', 'eager')
    expect(images[7]).toHaveAttribute('loading', 'eager')
    expect(images[8]).toHaveAttribute('loading', 'lazy')
  })

  it('combina busca, categoria e tipo sem perder o estado acessível', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Categoria'), 'Segurança')
    expect(screen.getByRole('option', { name: 'Vigilante patrimonial' })).toBeVisible()

    await user.type(screen.getByLabelText('Buscar'), 'Sentinel')
    expect(screen.getByRole('status')).toHaveAccessibleName('1 produto encontrado')
    expect(
      screen.getByRole('link', { name: 'Ver detalhes de Eden Sentinel S-20' }),
    ).toBeVisible()

    await user.clear(screen.getByLabelText('Buscar'))
    await user.selectOptions(
      screen.getByLabelText('Tipo'),
      'Vigilante patrimonial',
    )
    expect(screen.getByRole('status')).toHaveAccessibleName('1 produto encontrado')
  })

  it('apresenta um estado vazio quando não há correspondência', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Buscar'), 'modelo inexistente')

    expect(
      screen.getByRole('heading', { name: 'Nenhum androide encontrado' }),
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveAccessibleName(
      '0 produtos encontrados',
    )
  })
})
