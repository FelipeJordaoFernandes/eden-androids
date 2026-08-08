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
        <p>Adicione ao menos um androide ao carrinho para continuar.</p>
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
        <span className="eyebrow checkout-eyebrow">Pedido salvo</span>
        <h1
          id="checkout-confirmation-title"
          ref={confirmationRef}
          tabIndex={-1}
        >
          Pedido concluído.
        </h1>
        <p>
          Seu pedido foi salvo neste dispositivo. O histórico fica disponível
          somente neste navegador.
        </p>

        <div className="checkout-confirmation-number">
          <span>Número do pedido</span>
          <strong>{order.number}</strong>
        </div>

        <div className="checkout-confirmation-grid">
          <div>
            <span>Entrega</span>
            <strong>{order.shipping.method}</strong>
            <small>{order.shipping.estimate}</small>
          </div>
          <div>
            <span>Pagamento</span>
            <strong>{order.paymentMethod}</strong>
            <small>Forma escolhida no checkout</small>
          </div>
          <div>
            <span>Total do pedido</span>
            <strong>{formatCurrency(order.total)}</strong>
            <small>
              {order.items.length}{' '}
              {order.items.length === 1 ? 'modelo' : 'modelos'} no pedido
            </small>
          </div>
        </div>

        <div className="checkout-confirmation-actions">
          <Link
            className="button button-primary"
            to={`/orders/${encodeURIComponent(order.number)}`}
          >
            Ver detalhes do pedido
          </Link>
          <Link className="button button-ghost" to="/orders">
            Ver histórico de pedidos
          </Link>
          <Link className="button button-ghost" to="/catalog">
            Continuar comprando
          </Link>
        </div>
      </div>
    </section>
  )
}
