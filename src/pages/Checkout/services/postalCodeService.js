import { formatPostalCode, onlyDigits } from '../utils/checkoutMasks.js'

export async function fetchAddressByPostalCode(postalCodeValue, request = fetch) {
  const postalCode = onlyDigits(postalCodeValue, 8)
  const response = await request(`https://viacep.com.br/ws/${postalCode}/json/`)

  if (!response.ok) throw new Error('postal-code-request-failed')

  const address = await response.json()

  if (address.erro) return null

  return {
    postalCode: formatPostalCode(address.cep || postalCode),
    street: address.logradouro || '',
    neighborhood: address.bairro || '',
    city: address.localidade || '',
    state: address.uf || '',
  }
}
