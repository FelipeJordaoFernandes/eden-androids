import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { products } from '../data/products.js'

describe('arquivos públicos de SEO', () => {
  it('publica robots.txt com sitemap e protege rotas locais', () => {
    const robots = readFileSync(resolve('public/robots.txt'), 'utf8')

    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Disallow: /account')
    expect(robots).toContain('Disallow: /checkout')
    expect(robots).toContain('Disallow: /orders')
    expect(robots).toContain(
      'Sitemap: https://eden-androids.vercel.app/sitemap.xml',
    )
  })

  it('lista as páginas públicas e todos os 24 produtos no sitemap', () => {
    const sitemap = readFileSync(resolve('public/sitemap.xml'), 'utf8')

    expect(sitemap).toContain('<loc>https://eden-androids.vercel.app/</loc>')
    expect(sitemap).toContain(
      '<loc>https://eden-androids.vercel.app/catalog</loc>',
    )
    expect(sitemap).toContain(
      '<loc>https://eden-androids.vercel.app/about</loc>',
    )
    products.forEach((product) => {
      expect(sitemap).toContain(
        `<loc>https://eden-androids.vercel.app/product/${product.id}</loc>`,
      )
    })
    expect(sitemap).not.toContain('/account')
    expect(sitemap).not.toContain('/orders')
  })
})
