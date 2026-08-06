import { onlyDigits } from './checkoutMasks.js'

const validAreaCodes = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '51', '53', '54', '55',
  '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '73', '74', '75', '77', '79',
  '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '91', '92', '93', '94', '95', '96', '97', '98', '99',
])

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim())
}

export function isValidPhone(value) {
  const digits = onlyDigits(value, 11)

  if (/^(\d)\1+$/.test(digits)) return false

  const areaCode = digits.slice(0, 2)
  const subscriberNumber = digits.slice(2)
  const isLandline = /^([2-5])\d{7}$/.test(subscriberNumber)
  const isMobile = /^9\d{8}$/.test(subscriberNumber)

  return validAreaCodes.has(areaCode) && (isLandline || isMobile)
}

function calculateCpfDigit(baseDigits) {
  const sum = baseDigits.reduce(
    (total, digit, index) =>
      total + Number(digit) * (baseDigits.length + 1 - index),
    0,
  )
  const remainder = (sum * 10) % 11

  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(value) {
  const digits = onlyDigits(value, 11)

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const firstNineDigits = digits.slice(0, 9).split('')
  const firstCheckDigit = calculateCpfDigit(firstNineDigits)
  const firstTenDigits = [...firstNineDigits, String(firstCheckDigit)]
  const secondCheckDigit = calculateCpfDigit(firstTenDigits)

  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`)
}

export function getCustomerFieldError(name, value) {
  if (name === 'email' && !isValidEmail(value)) {
    return 'Informe um e-mail válido, como nome@exemplo.com.'
  }

  if (name === 'phone' && !isValidPhone(value)) {
    return 'Informe um telefone válido com DDD.'
  }

  if (name === 'document' && !isValidCpf(value)) {
    return 'Informe um CPF válido.'
  }

  return ''
}

export function isRequiredAddressComplete(formData, requiredFields) {
  return requiredFields.every((name) => String(formData[name]).trim())
}
