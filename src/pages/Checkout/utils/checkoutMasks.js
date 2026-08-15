import {
  formatPostalCode,
  formatState,
} from '../../../utils/address.js'
import {
  formatDocument,
  formatPhone,
} from '../../../utils/customerData.js'
import {
  formatPaymentCardCvv,
  formatPaymentCardExpiry,
  formatPaymentCardNumber,
} from '../../../utils/paymentCard.js'

export { formatDocument, formatPhone, formatPostalCode, formatState }

export function onlyDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function formatCardNumber(value) {
  return formatPaymentCardNumber(value)
}

export function formatCardExpiry(value) {
  return formatPaymentCardExpiry(value)
}

const fieldFormatters = Object.freeze({
  document: formatDocument,
  phone: formatPhone,
  postalCode: formatPostalCode,
  cardNumber: formatCardNumber,
  cardExpiry: formatCardExpiry,
  cardCvv: formatPaymentCardCvv,
  state: formatState,
})

export function formatCheckoutFieldValue(name, value) {
  return fieldFormatters[name]?.(value) ?? value
}
