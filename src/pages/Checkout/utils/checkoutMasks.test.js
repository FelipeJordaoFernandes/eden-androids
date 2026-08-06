import { describe, expect, it } from 'vitest'
import {
  formatCardExpiry,
  formatCardNumber,
  formatCheckoutFieldValue,
  formatDocument,
  formatPhone,
  formatPostalCode,
  formatState,
  onlyDigits,
} from './checkoutMasks.js'

describe('máscaras do checkout', () => {
  it('mantém apenas a quantidade permitida de dígitos', () => {
    expect(onlyDigits('ab12.345-67', 5)).toBe('12345')
  })

  it('formata CPF, telefone e CEP', () => {
    expect(formatDocument('52998224725')).toBe('529.982.247-25')
    expect(formatPhone('1123456789')).toBe('(11) 2345-6789')
    expect(formatPhone('11912345678')).toBe('(11) 91234-5678')
    expect(formatPostalCode('01001000')).toBe('01001-000')
  })

  it('formata os campos do cartão e a UF', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111')
    expect(formatCardExpiry('1228')).toBe('12/28')
    expect(formatState('s1p')).toBe('SP')
  })

  it('aplica a máscara correspondente ao nome do campo', () => {
    expect(formatCheckoutFieldValue('document', '52998224725')).toBe(
      '529.982.247-25',
    )
    expect(formatCheckoutFieldValue('fullName', 'Ada Lovelace')).toBe(
      'Ada Lovelace',
    )
  })
})
