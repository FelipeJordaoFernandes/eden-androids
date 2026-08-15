import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const config = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'))

function getConfiguredHeaders() {
  return Object.fromEntries(
    config.headers[0].headers.map(({ key, value }) => [key, value]),
  )
}

describe('configuração da Vercel', () => {
  it('mantém um fallback de SPA após a resolução dos arquivos estáticos', () => {
    expect(config.rewrites).toEqual([
      { source: '/(.*)', destination: '/index.html' },
    ])
    const spaMatcher = new RegExp(`^${config.rewrites[0].source}$`)

    const routes = [
      '/',
      '/catalog',
      '/product/1',
      '/cart',
      '/checkout',
      '/account',
      '/account?tab=addresses',
      '/orders',
      '/orders/EDN-260815-0001',
      '/login',
      '/register',
      '/about',
      '/admin',
      '/rota-inexistente',
    ]

    routes.forEach((route) => {
      expect(spaMatcher.test(route)).toBe(true)
    })
  })

  it('configura os cabeçalhos essenciais sem ampliar scripts ou estilos', () => {
    expect(config.headers).toHaveLength(1)
    expect(config.headers[0].source).toBe('/(.*)')

    const headers = getConfiguredHeaders()
    const csp = headers['Content-Security-Policy']

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("style-src 'self' https://fonts.googleapis.com")
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com")
    expect(csp).toContain("connect-src 'self' https://viacep.com.br")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain('upgrade-insecure-requests')
    expect(csp).not.toContain("'unsafe-inline'")
    expect(csp).not.toContain("'unsafe-eval'")
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
    expect(headers['Referrer-Policy']).toBe(
      'strict-origin-when-cross-origin',
    )
    expect(headers['Permissions-Policy']).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    )
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin')
    expect(headers).not.toHaveProperty('Strict-Transport-Security')
  })

  it('não sobrescreve build, projeto, funções ou credenciais', () => {
    expect(config).not.toHaveProperty('buildCommand')
    expect(config).not.toHaveProperty('outputDirectory')
    expect(config).not.toHaveProperty('framework')
    expect(config).not.toHaveProperty('functions')
    expect(config).not.toHaveProperty('env')
    expect(config).not.toHaveProperty('build.env')
  })
})
