import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

function observeConsole(page) {
  const issues = []

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      issues.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`))

  return issues
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

test('carrega as rotas públicas sem erros ou overflow', async ({ page }) => {
  const consoleIssues = observeConsole(page)

  for (const route of ['/', '/catalog', '/product/3', '/about']) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await expectNoHorizontalOverflow(page)
  }

  await page.goto('/rota-inexistente-e2e')
  await expect(
    page.getByRole('heading', { name: 'Página não encontrada.' }),
  ).toBeVisible()
  await expectNoHorizontalOverflow(page)
  expect(consoleIssues).toEqual([])
})

test('carrega as 24 imagens do catálogo e prioriza os primeiros resultados', async ({
  page,
}) => {
  const consoleIssues = observeConsole(page)

  await page.goto('/catalog')
  const productImages = page.locator('.product-card img')
  await expect(productImages).toHaveCount(24)
  await expect(productImages.nth(0)).toHaveAttribute('loading', 'eager')
  await expect(productImages.nth(7)).toHaveAttribute('loading', 'eager')
  await expect(productImages.nth(8)).toHaveAttribute('loading', 'lazy')

  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('.product-card img')]

    for (const image of images) {
      image.scrollIntoView({ block: 'center' })
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }

    await Promise.all(images.map((image) => image.decode()))
  })

  const brokenImages = await productImages.evaluateAll((images) =>
    images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  )

  expect(brokenImages).toEqual([])
  expect(consoleIssues).toEqual([])
})

test('mantém as páginas institucionais sem violações automáticas de acessibilidade', async ({
  page,
}) => {
  for (const route of ['/', '/catalog', '/about']) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()

    const results = await new AxeBuilder({ page }).analyze()

    expect(results.violations).toEqual([])
  }
})
