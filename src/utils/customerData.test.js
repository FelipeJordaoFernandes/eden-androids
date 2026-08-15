import { describe, expect, it } from 'vitest'
import {
  formatDocument,
  formatPhone,
  isCustomerProfileComplete,
  isValidCpf,
  isValidPhone,
  normalizeCustomerProfile,
  validateCustomerProfile,
} from './customerData.js'

describe('dados pessoais do cliente', () => {
  it('aplica as máscaras de telefone e CPF', () => {
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678')
    expect(formatPhone('1132345678')).toBe('(11) 3234-5678')
    expect(formatDocument('52998224725')).toBe('529.982.247-25')
  })

  it('valida telefone com DDD e rejeita sequências inválidas', () => {
    expect(isValidPhone('(11) 91234-5678')).toBe(true)
    expect(isValidPhone('(11) 3234-5678')).toBe(true)
    expect(isValidPhone('(00) 91234-5678')).toBe(false)
    expect(isValidPhone('11111111111')).toBe(false)
  })

  it('valida os dígitos verificadores do CPF', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('529.982.247-24')).toBe(false)
  })

  it('normaliza o perfil e exige todos os dados válidos', () => {
    const normalized = normalizeCustomerProfile({
      name: '  Ada   Lovelace ',
      email: ' ADA@EXEMPLO.COM ',
      phone: '11912345678',
      document: '52998224725',
    })

    expect(normalized).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@exemplo.com',
      phone: '(11) 91234-5678',
      document: '529.982.247-25',
    })
    expect(validateCustomerProfile(normalized)).toEqual({})
    expect(isCustomerProfileComplete(normalized)).toBe(true)
    expect(validateCustomerProfile({})).toEqual({
      name: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      document: expect.any(String),
    })
  })
})
