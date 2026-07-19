export const CART_STORAGE_KEY = 'eden-androids:cart:v1'

export const warrantyOptions = Object.freeze({
  standard: Object.freeze({
    label: 'Garantia padrão',
    description: 'Garantia original do produto',
    rate: 0,
  }),
  extended12: Object.freeze({
    label: '+12 meses',
    description: 'Extensão da cobertura por mais 12 meses',
    rate: 0.06,
  }),
  extended24: Object.freeze({
    label: '+24 meses',
    description: 'Extensão da cobertura por mais 24 meses',
    rate: 0.1,
  }),
})

export const warrantyEntries = Object.entries(warrantyOptions)
