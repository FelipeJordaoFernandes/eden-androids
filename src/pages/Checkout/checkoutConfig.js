export const shippingOptions = Object.freeze([
  Object.freeze({
    id: 'scheduled',
    label: 'Entrega agendada',
    description: 'Transporte especializado, instalação e ativação assistida.',
    estimate: '12 a 18 dias úteis',
    price: 0,
  }),
  Object.freeze({
    id: 'priority',
    label: 'Entrega prioritária',
    description: 'Prioridade logística e janela de instalação reduzida.',
    estimate: '7 a 10 dias úteis',
    price: 1890,
  }),
])

export const paymentOptions = Object.freeze([
  Object.freeze({
    id: 'pix',
    label: 'Pix',
    orderLabel: 'Pix',
    description: 'Pagamento à vista',
  }),
  Object.freeze({
    id: 'card',
    label: 'Cartão',
    orderLabel: 'Cartão de crédito',
    description: 'De 1x a 10x sem juros',
  }),
  Object.freeze({
    id: 'invoice',
    label: 'Boleto',
    orderLabel: 'Boleto',
    description: 'Vencimento em 3 dias',
  }),
])

export const installmentOptions = Object.freeze(
  Array.from({ length: 10 }, (_, index) => index + 1),
)

export const requiredAddressFields = Object.freeze([
  'postalCode',
  'street',
  'addressNumber',
  'neighborhood',
  'city',
  'state',
])

export const customerFieldNames = Object.freeze([
  'email',
  'phone',
  'document',
])

export const emptyAddressFields = Object.freeze({
  street: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
})

export function createInitialCheckoutData() {
  return {
    fullName: '',
    email: '',
    phone: '',
    document: '',
    postalCode: '',
    ...emptyAddressFields,
    shippingId: '',
    paymentMethod: 'pix',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
    termsAccepted: false,
  }
}
