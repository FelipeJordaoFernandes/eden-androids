export const EMPTY_CARD_FORM = Object.freeze({
  label: '',
  cardholder: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
})

export const CARD_REQUIRED_FIELDS = Object.freeze([
  'cardholder',
  'cardNumber',
  'expiry',
  'cvv',
])

function onlyDigits(value, maxLength) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength)
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
}

export function formatPaymentCardNumber(value) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatPaymentCardExpiry(value) {
  return onlyDigits(value, 4).replace(/(\d{2})(\d)/, '$1/$2')
}

export function formatPaymentCardCvv(value) {
  return onlyDigits(value, 4)
}

export function detectCardBrand(value) {
  const digits = onlyDigits(value, 16)

  if (digits.startsWith('4')) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'

  return 'Cartão'
}

export function getPaymentCardFieldError(name, value) {
  if (name === 'cardholder') {
    return normalizeText(value).length >= 3
      ? ''
      : 'Informe o nome impresso no cartão.'
  }

  if (name === 'cardNumber') {
    return onlyDigits(value, 16).length === 16
      ? ''
      : 'Informe os 16 dígitos do cartão.'
  }

  if (name === 'expiry') {
    const digits = onlyDigits(value, 4)
    const month = Number(digits.slice(0, 2))

    return digits.length === 4 && month >= 1 && month <= 12
      ? ''
      : 'Informe uma validade no formato MM/AA.'
  }

  if (name === 'cvv') {
    const length = onlyDigits(value, 4).length

    return length === 3 || length === 4
      ? ''
      : 'Informe um CVV com 3 ou 4 dígitos.'
  }

  return ''
}

export function validatePaymentCard(value) {
  return Object.fromEntries(
    CARD_REQUIRED_FIELDS.map((name) => [
      name,
      getPaymentCardFieldError(name, value?.[name]),
    ]).filter(([, message]) => message),
  )
}

export function createSanitizedPaymentMethod(value, id) {
  const cardNumber = onlyDigits(value.cardNumber, 16)
  const lastFour = cardNumber.slice(-4)
  const label = normalizeText(value.label) || `Cartão final ${lastFour}`

  return {
    id,
    label,
    cardholder: normalizeText(value.cardholder),
    brand: detectCardBrand(cardNumber),
    lastFour,
    expiry: formatPaymentCardExpiry(value.expiry),
    isDefault: false,
  }
}

export function normalizeStoredPaymentMethod(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const id = normalizeText(value.id)
  const label = normalizeText(value.label)
  const cardholder = normalizeText(value.cardholder)
  const brand = normalizeText(value.brand) || 'Cartão'
  const lastFour = onlyDigits(value.lastFour, 4)
  const expiry = formatPaymentCardExpiry(value.expiry)

  if (
    !id ||
    !label ||
    cardholder.length < 3 ||
    lastFour.length !== 4 ||
    getPaymentCardFieldError('expiry', expiry)
  ) {
    return null
  }

  return {
    id,
    label,
    cardholder,
    brand,
    lastFour,
    expiry,
    isDefault: Boolean(value.isDefault),
  }
}
