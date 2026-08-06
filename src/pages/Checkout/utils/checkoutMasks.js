export function onlyDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function formatDocument(value) {
  const digits = onlyDigits(value, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(value) {
  const digits = onlyDigits(value, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatPostalCode(value) {
  return onlyDigits(value, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatCardNumber(value) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatCardExpiry(value) {
  return onlyDigits(value, 4).replace(/(\d{2})(\d)/, '$1/$2')
}

export function formatState(value) {
  return value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase()
}

const fieldFormatters = Object.freeze({
  document: formatDocument,
  phone: formatPhone,
  postalCode: formatPostalCode,
  cardNumber: formatCardNumber,
  cardExpiry: formatCardExpiry,
  cardCvv: (value) => onlyDigits(value, 4),
  state: formatState,
})

export function formatCheckoutFieldValue(name, value) {
  return fieldFormatters[name]?.(value) ?? value
}
