import { describe, expect, it } from 'vitest'
import {
  getEmailError,
  getNameError,
  getPasswordError,
  normalizeEmail,
  normalizeName,
  validateRegistration,
} from './authValidation.js'

describe('validações da conta local', () => {
  it('normaliza nome e e-mail antes do armazenamento', () => {
    expect(normalizeName('  Felipe   Jordão  ')).toBe('Felipe Jordão')
    expect(normalizeEmail('  FELIPE@EXEMPLO.COM  ')).toBe(
      'felipe@exemplo.com',
    )
  })

  it('valida nome, e-mail e força mínima da senha', () => {
    expect(getNameError('F')).toMatch(/2 caracteres/)
    expect(getEmailError('felipe@')).toMatch(/e-mail válido/)
    expect(getPasswordError('curta1')).toMatch(/8 caracteres/)
    expect(getPasswordError('semsomenteletras')).toMatch(/letra e um número/)
    expect(getPasswordError('eden2026')).toBe('')
  })

  it('exige confirmação idêntica no cadastro', () => {
    expect(
      validateRegistration({
        name: 'Felipe Jordão',
        email: 'felipe@example.com',
        password: 'eden2026',
        passwordConfirmation: 'eden2027',
      }),
    ).toEqual({ passwordConfirmation: 'As senhas precisam ser iguais.' })
  })
})
