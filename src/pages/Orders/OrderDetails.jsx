import { useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findOrderByNumber } from '../../services/orderStorage.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import {
  formatOrderDate,
  formatOrderItemCount,
} from './orderFormatting.js'
import './Orders.css'

function OrderDetails() {
  const { orderNumber } = useParams()
  const titleRef = useRef(null)
  const order = findOrderByNumber(orderNumber)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [orderNumber])

  if (!order) {
    return (
      <section className="orders-page" aria-labelledby="order-details-title">
        <div className="orders-empty order-not-found">
          <span className="eyebrow orders-eyebrow">Histórico local</span>
          <h1 id="order-details-title" ref={titleRef} tabIndex={-1}>
            Pedido não encontrado.
          </h1>
          <p>
            O número informado não corresponde a um pedido salvo neste
            navegador. O histórico pode pertencer a outro dispositivo ou ter
            sido removido.
          </p>
          <div className="orders-empty-actions">
            <Link className="button button-primary" to="/orders">
              Ver histórico
            </Link>
            <Link className="button button-ghost" to="/catalog">
              Continuar comprando
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <article className="order-detail-page" aria-labelledby="order-details-title">
      <header className="order-detail-header">
        <span className="eyebrow orders-eyebrow">Pedido</span>
        <Link className="order-back-link" to="/orders">
          Voltar ao histórico
        </Link>
        <h1 id="order-details-title" ref={titleRef} tabIndex={-1}>
          Detalhes do pedido.
        </h1>
        <strong className="order-detail-number">{order.number}</strong>
        <p>
          Registrado em <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>.
          Este pedido está salvo somente neste navegador.
        </p>
      </header>

      <div className="order-detail-layout">
        <section className="order-detail-panel" aria-labelledby="order-items-title">
          <div className="order-detail-section-heading">
            <div>
              <span>Modelos selecionados</span>
              <h2 id="order-items-title">Itens do pedido</h2>
            </div>
            <strong>{formatOrderItemCount(order.items)}</strong>
          </div>

          <ul className="order-detail-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <img src={item.image} alt={`${item.name} — ${item.modelCode}`} />
                <div className="order-detail-item-copy">
                  <span>{item.modelCode}</span>
                  <h3>{item.name}</h3>
                  <p>
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <div className="order-detail-warranty">
                  <span>{item.warranty.label}</span>
                  <strong>
                    {item.warranty.value > 0
                      ? formatCurrency(item.warranty.value)
                      : 'Inclusa'}
                  </strong>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="order-detail-sidebar" aria-label="Resumo do pedido">
          <section className="order-detail-panel">
            <span className="eyebrow order-detail-eyebrow">Resumo</span>
            <h2>Valores do pedido</h2>
            <dl className="order-detail-totals">
              <div>
                <dt>Produtos</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div>
                <dt>Garantias adicionais</dt>
                <dd>{formatCurrency(order.warrantyTotal)}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>
                  {order.shipping.price > 0
                    ? formatCurrency(order.shipping.price)
                    : 'Inclusa'}
                </dd>
              </div>
              <div className="order-detail-total">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="order-detail-panel order-detail-logistics">
            <h2>Entrega e pagamento</h2>
            <dl>
              <div>
                <dt>Modalidade</dt>
                <dd>{order.shipping.method}</dd>
              </div>
              <div>
                <dt>Prazo estimado</dt>
                <dd>{order.shipping.estimate}</dd>
              </div>
              <div>
                <dt>Pagamento</dt>
                <dd>{order.paymentMethod}</dd>
              </div>
              {order.destination ? (
                <div>
                  <dt>Destino de referência</dt>
                  <dd>{order.destination.city} — {order.destination.state}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>

      <footer className="order-detail-footer">
        <p>
          Dados de contato e endereço completo não fazem parte deste histórico.
        </p>
        <Link className="button button-primary" to="/catalog">
          Continuar comprando
        </Link>
      </footer>
    </article>
  )
}

export default OrderDetails
