import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import About from './About.jsx'

describe('About', () => {
  it('apresenta a origem, o fundador e os marcos da Eden', () => {
    render(<About />)

    expect(
      screen.getByRole('heading', { name: 'Tecnologia criada para conviver.' }),
    ).toBeVisible()
    expect(screen.getByText('Londrina, Paraná')).toBeVisible()
    expect(screen.getAllByText('Felipe Jordão Fernandes')).toHaveLength(2)
    expect(
      screen.getByText('Fundador e idealizador da Eden Androids'),
    ).toBeVisible()
    expect(screen.getAllByRole('time')).toHaveLength(5)
  })

  it('renderiza os quatro capítulos com imagens dimensionadas e textos alternados', () => {
    render(<About />)

    const images = screen.getAllByRole('img')

    expect(images).toHaveLength(4)
    images.forEach((image) => {
      expect(image).toHaveAttribute('width', '1448')
      expect(image).toHaveAttribute('height', '1086')
      expect(image).toHaveAttribute('alt')
    })

    expect(
      screen.getByRole('heading', { name: 'Uma ideia além da automação' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'O nascimento da tecnologia Eden' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Uma plataforma, diferentes missões' }),
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: 'O próximo capítulo' })).toBeVisible()
  })

  it('lista os quatro valores institucionais', () => {
    render(<About />)

    expect(
      screen.getByRole('heading', { name: 'Tecnologia responsável' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Segurança por princípio' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Design para convivência' }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'Progresso humano' }),
    ).toBeVisible()
  })
})
