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
    label: 'Cartão de crédito',
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

export function createInitialCheckoutData() {
  return {
    shippingId: '',
    paymentMethod: 'pix',
    installments: '1',
    termsAccepted: false,
  }
}
