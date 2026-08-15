export const EMPTY_ADDRESS = Object.freeze({
  label: '',
  postalCode: '',
  street: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
})

export const EMPTY_ADDRESS_DETAILS = Object.freeze({
  street: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
})

export const REQUIRED_ADDRESS_FIELDS = Object.freeze([
  'postalCode',
  'street',
  'addressNumber',
  'neighborhood',
  'city',
  'state',
])

const ADDRESS_ERROR_MESSAGES = Object.freeze({
  label: 'Informe um nome para o endereço.',
  postalCode: 'Informe um CEP válido.',
  street: 'Informe o endereço.',
  addressNumber: 'Informe o número.',
  neighborhood: 'Informe o bairro.',
  city: 'Informe a cidade.',
  state: 'Informe uma UF válida.',
})

function onlyDigits(value, maxLength) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength)
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function formatPostalCode(value) {
  return onlyDigits(value, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatState(value) {
  return String(value ?? '')
    .replace(/[^a-z]/gi, '')
    .slice(0, 2)
    .toUpperCase()
}

export function normalizeAddress(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  return {
    ...(Object.hasOwn(value, 'label') ? { label: normalizeText(value.label) } : {}),
    postalCode: formatPostalCode(value.postalCode),
    street: normalizeText(value.street),
    addressNumber: normalizeText(value.addressNumber),
    addressComplement: normalizeText(value.addressComplement),
    neighborhood: normalizeText(value.neighborhood),
    city: normalizeText(value.city),
    state: formatState(value.state),
  }
}

export function getAddressFieldError(name, value) {
  if (name === 'label') {
    return normalizeText(value) ? '' : ADDRESS_ERROR_MESSAGES[name]
  }
  if (name === 'postalCode') {
    return onlyDigits(value, 8).length === 8 ? '' : ADDRESS_ERROR_MESSAGES[name]
  }

  if (name === 'state') {
    return formatState(value).length === 2 ? '' : ADDRESS_ERROR_MESSAGES[name]
  }

  if (name === 'addressComplement') return ''

  return normalizeText(value) ? '' : ADDRESS_ERROR_MESSAGES[name] ?? ''
}

export function validateAddress(value) {
  const address = normalizeAddress(value) ?? EMPTY_ADDRESS

  return Object.fromEntries(
    REQUIRED_ADDRESS_FIELDS.map((name) => [
      name,
      getAddressFieldError(name, address[name]),
    ]).filter(([, message]) => message),
  )
}

export function isCompleteAddress(value) {
  return Object.keys(validateAddress(value)).length === 0
}

export function normalizeStoredAddress(value) {
  const address = normalizeAddress(value)
  const id = normalizeText(value?.id)
  const label = normalizeText(value?.label)

  if (!address || !id || !label || !isCompleteAddress(address)) return null

  return {
    id,
    label,
    postalCode: address.postalCode,
    street: address.street,
    addressNumber: address.addressNumber,
    addressComplement: address.addressComplement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    isDefault: Boolean(value.isDefault),
  }
}
