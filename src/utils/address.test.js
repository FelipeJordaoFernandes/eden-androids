import { describe, expect, it } from 'vitest'
import {
  formatPostalCode,
  formatState,
  normalizeAddress,
  validateAddress,
} from './address.js'

describe('endereço local', () => {
  it('aplica máscaras de CEP e UF', () => {
    expect(formatPostalCode('01001abc000')).toBe('01001-000')
    expect(formatState('s-p')).toBe('SP')
  })

  it('normaliza um endereço completo sem exigir complemento', () => {
    expect(
      normalizeAddress({
        postalCode: '01001000',
        street: '  Praça da Sé ',
        addressNumber: ' 100 ',
        neighborhood: ' Sé ',
        city: ' São Paulo ',
        state: 'sp',
      }),
    ).toEqual({
      postalCode: '01001-000',
      street: 'Praça da Sé',
      addressNumber: '100',
      addressComplement: '',
      neighborhood: 'Sé',
      city: 'São Paulo',
      state: 'SP',
    })
  })

  it('informa os campos obrigatórios ausentes', () => {
    expect(validateAddress({ postalCode: '123' })).toEqual({
      postalCode: 'Informe um CEP válido.',
      street: 'Informe o endereço.',
      addressNumber: 'Informe o número.',
      neighborhood: 'Informe o bairro.',
      city: 'Informe a cidade.',
      state: 'Informe uma UF válida.',
    })
  })
})
