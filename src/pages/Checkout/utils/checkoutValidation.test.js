import { describe, expect, it } from 'vitest'
import {
  getCustomerFieldError,
  isRequiredAddressComplete,
  isValidCpf,
  isValidEmail,
  isValidPhone,
} from './checkoutValidation.js'

describe('validações do cliente', () => {
  it.each([
    ['cliente@eden.com.br', true],
    ['cliente+teste@eden.ai', true],
    ['cliente@eden', false],
    ['cliente eden.com', false],
  ])('valida o e-mail %s', (email, expected) => {
    expect(isValidEmail(email)).toBe(expected)
  })

  it.each([
    ['(11) 91234-5678', true],
    ['(21) 2345-6789', true],
    ['(10) 91234-5678', false],
    ['(11) 11111-1111', false],
  ])('valida o telefone %s', (phone, expected) => {
    expect(isValidPhone(phone)).toBe(expected)
  })

  it.each([
    ['529.982.247-25', true],
    ['529.982.247-24', false],
    ['111.111.111-11', false],
  ])('valida o CPF %s', (cpf, expected) => {
    expect(isValidCpf(cpf)).toBe(expected)
  })

  it('retorna mensagens específicas para campos inválidos', () => {
    expect(getCustomerFieldError('email', 'inválido')).toContain('e-mail válido')
    expect(getCustomerFieldError('phone', '1111')).toContain('telefone válido')
    expect(getCustomerFieldError('document', '11111111111')).toContain('CPF válido')
  })

  it('só considera o endereço completo com todos os campos obrigatórios', () => {
    const fields = ['postalCode', 'street', 'addressNumber']
    const completeAddress = {
      postalCode: '01001-000',
      street: 'Praça da Sé',
      addressNumber: '100',
    }

    expect(isRequiredAddressComplete(completeAddress, fields)).toBe(true)
    expect(
      isRequiredAddressComplete(
        { ...completeAddress, addressNumber: ' ' },
        fields,
      ),
    ).toBe(false)
  })
})
