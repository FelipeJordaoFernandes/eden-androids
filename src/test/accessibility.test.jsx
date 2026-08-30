import axe from 'axe-core'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import About from '../pages/About/About.jsx'
import Home from '../pages/Home/Home.jsx'

async function expectNoAxeViolations(view) {
  const results = await axe.run(view.container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })

  expect(results.violations).toEqual([])
}

describe('acessibilidade automática das páginas públicas', () => {
  it('não encontra violações na Home', async () => {
    const view = render(
      <MemoryRouter>
        <main>
          <Home />
        </main>
      </MemoryRouter>,
    )

    await expectNoAxeViolations(view)
  })

  it('não encontra violações na página Sobre', async () => {
    const view = render(
      <main>
        <About />
      </main>,
    )

    await expectNoAxeViolations(view)
  })
})
