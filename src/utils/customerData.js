import {
  getEmailError,
  getNameError,
  normalizeEmail,
  normalizeName,
} from './authValidation.js'

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

export const CUSTOMER_PROFILE_FIELDS = Object.freeze([
  'name',
  'email',
  'phone',
  'document',
])

export function customerOnlyDigits(value, maxLength) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength)
}

export function formatDocument(value) {
  return customerOnlyDigits(value, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(value) {
  const digits = customerOnlyDigits(value, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function isValidPhone(value) {
  const digits = customerOnlyDigits(value, 11)

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
  const digits = customerOnlyDigits(value, 11)

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const firstNineDigits = digits.slice(0, 9).split('')
  const firstCheckDigit = calculateCpfDigit(firstNineDigits)
  const firstTenDigits = [...firstNineDigits, String(firstCheckDigit)]
  const secondCheckDigit = calculateCpfDigit(firstTenDigits)

  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`)
}

export function getCustomerProfileFieldError(name, value) {
  if (name === 'name') return getNameError(value)
  if (name === 'email') return getEmailError(value)

  if (name === 'phone' && !isValidPhone(value)) {
    return 'Informe um telefone válido com DDD.'
  }

  if (name === 'document' && !isValidCpf(value)) {
    return 'Informe um CPF válido.'
  }

  return ''
}

export function normalizeCustomerProfile(value) {
  return {
    name: normalizeName(value?.name),
    email: normalizeEmail(value?.email),
    phone: formatPhone(value?.phone),
    document: formatDocument(value?.document),
  }
}

export function validateCustomerProfile(value) {
  const profile = normalizeCustomerProfile(value)

  return Object.fromEntries(
    CUSTOMER_PROFILE_FIELDS.map((name) => [
      name,
      getCustomerProfileFieldError(name, profile[name]),
    ]).filter(([, message]) => message),
  )
}

export function isCustomerProfileComplete(value) {
  return Object.keys(validateCustomerProfile(value)).length === 0
}
