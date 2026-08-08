import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadOrders } from '../../services/orderStorage.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import {
  formatOrderDate,
  formatOrderItemCount,
} from './orderFormatting.js'
import './Orders.css'

function Orders() {
  const titleRef = useRef(null)
  const [orders] = useState(loadOrders)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  if (orders.length === 0) {
    return (
      <section className="orders-page" aria-labelledby="orders-title">
        <div className="orders-empty">
          <span className="eyebrow orders-eyebrow">Histórico local</span>
          <div className="orders-empty-symbol" aria-hidden="true">
            <span />
          </div>
          <h1 id="orders-title" ref={titleRef} tabIndex={-1}>
            Nenhum pedido por aqui.
          </h1>
          <p>
            Quando você concluir um pedido, ele aparecerá neste histórico
            somente neste navegador e dispositivo.
          </p>
          <Link className="button button-primary" to="/catalog">
            Explorar androides
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="orders-page" aria-labelledby="orders-title">
      <header className="orders-header">
        <span className="eyebrow orders-eyebrow">Histórico local</span>
        <h1 id="orders-title" ref={titleRef} tabIndex={-1}>
          Seus pedidos.
        </h1>
        <p>
          Consulte os pedidos salvos somente neste navegador e dispositivo.
        </p>
        <span className="orders-count">
          {orders.length} {orders.length === 1 ? 'pedido salvo' : 'pedidos salvos'}
        </span>
      </header>

      <ol className="orders-list">
        {orders.map((order) => (
          <li key={order.number}>
            <article className="order-card">
              <div className="order-card-heading">
                <div>
                  <span>Pedido</span>
                  <h2>{order.number}</h2>
                </div>
                <time dateTime={order.createdAt}>
                  {formatOrderDate(order.createdAt)}
                </time>
              </div>

              <dl className="order-card-summary">
                <div>
                  <dt>Itens</dt>
                  <dd>{formatOrderItemCount(order.items)}</dd>
                </div>
                <div>
                  <dt>Entrega</dt>
                  <dd>{order.shipping.method}</dd>
                </div>
                <div>
                  <dt>Total do pedido</dt>
                  <dd>{formatCurrency(order.total)}</dd>
                </div>
              </dl>

              <Link
                className="button button-ghost order-card-link"
                to={`/orders/${encodeURIComponent(order.number)}`}
                aria-label={`Ver detalhes do pedido ${order.number}`}
              >
                Ver detalhes
              </Link>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Orders
