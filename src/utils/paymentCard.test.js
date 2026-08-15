import { describe, expect, it } from 'vitest'
import {
  createSanitizedPaymentMethod,
  detectCardBrand,
  formatPaymentCardCvv,
  formatPaymentCardExpiry,
  formatPaymentCardNumber,
  validatePaymentCard,
} from './paymentCard.js'

describe('cartão fictício', () => {
  it('aplica máscaras e limites de tamanho', () => {
    expect(formatPaymentCardNumber('411111111111111199')).toBe(
      '4111 1111 1111 1111',
    )
    expect(formatPaymentCardExpiry('123099')).toBe('12/30')
    expect(formatPaymentCardCvv('12345')).toBe('1234')
  })

  it('valida todos os campos obrigatórios e o mês da validade', () => {
    expect(
      validatePaymentCard({
        cardholder: 'ADA LOVELACE',
        cardNumber: '4111 1111 1111 1111',
        expiry: '12/30',
        cvv: '123',
      }),
    ).toEqual({})
    expect(
      validatePaymentCard({
        cardholder: '',
        cardNumber: '4111',
        expiry: '13/30',
        cvv: '12',
      }),
    ).toEqual({
      cardholder: expect.any(String),
      cardNumber: expect.any(String),
      expiry: expect.any(String),
      cvv: expect.any(String),
    })
  })

  it('detecta marcas genéricas e cria somente a fotografia sanitizada', () => {
    expect(detectCardBrand('4111111111111111')).toBe('Visa')
    expect(detectCardBrand('5555555555554444')).toBe('Mastercard')
    expect(detectCardBrand('1111111111111111')).toBe('Cartão')

    const sanitized = createSanitizedPaymentMethod(
      {
        label: '',
        cardholder: '  ADA   LOVELACE ',
        cardNumber: '4111 1111 1111 1111',
        expiry: '1230',
        cvv: '123',
      },
      'card-1',
    )

    expect(sanitized).toEqual({
      id: 'card-1',
      label: 'Cartão final 1111',
      cardholder: 'ADA LOVELACE',
      brand: 'Visa',
      lastFour: '1111',
      expiry: '12/30',
      isDefault: false,
    })
    expect(sanitized).not.toHaveProperty('cardNumber')
    expect(sanitized).not.toHaveProperty('cvv')
  })
})
