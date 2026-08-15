import { formatPostalCode, formatState } from '../utils/address.js'

function getPostalCodeDigits(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8)
}

export async function fetchAddressByPostalCode(postalCodeValue, request = fetch) {
  const postalCode = getPostalCodeDigits(postalCodeValue)
  const response = await request(`https://viacep.com.br/ws/${postalCode}/json/`)

  if (!response.ok) throw new Error('postal-code-request-failed')

  const address = await response.json()

  if (address.erro) return null

  return {
    postalCode: formatPostalCode(address.cep || postalCode),
    street: address.logradouro || '',
    neighborhood: address.bairro || '',
    city: address.localidade || '',
    state: formatState(address.uf || ''),
  }
}
