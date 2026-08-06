import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/formatCurrency.js'

export function CheckoutEmpty({ titleRef }) {
  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <div className="checkout-empty">
        <span className="eyebrow checkout-eyebrow">Checkout Eden</span>
        <h1 id="checkout-title" ref={titleRef} tabIndex={-1}>
          Seu checkout está vazio.
        </h1>
        <p>
          Adicione ao menos um androide ao carrinho para iniciar a simulação
          de compra.
        </p>
        <Link className="button button-primary" to="/catalog">
          Explorar androides
        </Link>
      </div>
    </section>
  )
}

export function CheckoutConfirmation({ confirmationRef, order }) {
  return (
    <section className="checkout-page" aria-labelledby="checkout-confirmation-title">
      <div className="checkout-confirmation">
        <div className="checkout-confirmation-symbol" aria-hidden="true">
          <span>✓</span>
        </div>
        <span className="eyebrow checkout-eyebrow">Simulação concluída</span>
        <h1
          id="checkout-confirmation-title"
          ref={confirmationRef}
          tabIndex={-1}
        >
          Pedido simulado concluído.
        </h1>
        <p>
          Obrigado, {order.customerName}. O pedido abaixo é apenas
          demonstrativo e nenhuma mensagem foi enviada para{' '}
          <strong>{order.email}</strong>. Nenhuma cobrança ou entrega real será
          realizada.
        </p>

        <div className="checkout-confirmation-number">
          <span>Número do pedido</span>
          <strong>{order.number}</strong>
        </div>

        <div className="checkout-confirmation-grid">
          <div>
            <span>Entrega</span>
            <strong>{order.shipping.label}</strong>
            <small>{order.shipping.estimate}</small>
          </div>
          <div>
            <span>Pagamento</span>
            <strong>{order.paymentLabel}</strong>
            <small>Aprovação apenas demonstrativa</small>
          </div>
          <div>
            <span>Total simulado</span>
            <strong>{formatCurrency(order.grandTotal)}</strong>
            <small>
              {order.items.length}{' '}
              {order.items.length === 1 ? 'modelo' : 'modelos'} no pedido
            </small>
          </div>
        </div>

        <div className="checkout-confirmation-actions">
          <Link className="button button-primary" to="/catalog">
            Explorar novos modelos
          </Link>
          <Link className="button button-ghost" to="/">
            Voltar para a home
          </Link>
        </div>
      </div>
    </section>
  )
}
