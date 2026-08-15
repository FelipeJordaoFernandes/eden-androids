import {
  getCustomerProfileFieldError,
  isValidCpf,
  isValidPhone,
} from '../../../utils/customerData.js'

export { isValidEmail } from '../../../utils/validation.js'
export { isValidCpf, isValidPhone }

export function getCustomerFieldError(name, value) {
  return getCustomerProfileFieldError(name, value)
}

export function isRequiredAddressComplete(formData, requiredFields) {
  return requiredFields.every((name) => String(formData[name]).trim())
}
