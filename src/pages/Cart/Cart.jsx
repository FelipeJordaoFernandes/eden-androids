import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CartItem from '../../components/CartItem/CartItem.jsx'
import useCart from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './Cart.css'

function Cart() {
  const titleRef = useRef(null)
  const [statusMessage, setStatusMessage] = useState('')
  const {
    cartItems,
    clearCart,
    subtotal,
    total,
    totalItems,
    warrantyTotal,
  } = useCart()

  useLayoutEffect(() => {
    const root = document.documentElement
    const previousScrollBehavior = root.style.getPropertyValue('scroll-behavior')
    const previousScrollPriority = root.style.getPropertyPriority('scroll-behavior')

    root.style.setProperty('scroll-behavior', 'auto', 'important')
    getComputedStyle(root).getPropertyValue('scroll-behavior')
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })

    if (previousScrollBehavior) {
      root.style.setProperty(
        'scroll-behavior',
        previousScrollBehavior,
        previousScrollPriority,
      )
    } else {
      root.style.removeProperty('scroll-behavior')
    }

    titleRef.current?.focus({ preventScroll: true })
  }, [])

  function handleClearCart() {
    const removedItems = totalItems
    clearCart()
    setStatusMessage(
      `${removedItems} ${removedItems === 1 ? 'item removido' : 'itens removidos'} do carrinho.`,
    )
  }

  return (
    <section className="cart-page" aria-labelledby="cart-title">
      <div className="cart-header">
        <span className="eyebrow cart-eyebrow">Seleção Eden</span>
        <h1 id="cart-title" ref={titleRef} tabIndex={-1}>
          Seu carrinho
        </h1>
        <p>
          Revise os modelos selecionados, ajuste as quantidades e escolha a
          cobertura de garantia ideal para cada unidade.
        </p>
        <span className="cart-header-count" aria-live="polite">
          {totalItems} {totalItems === 1 ? 'unidade selecionada' : 'unidades selecionadas'}
        </span>
      </div>

      <p
        className="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </p>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-symbol" aria-hidden="true">
            <span />
          </div>
          <span className="eyebrow cart-empty-eyebrow">Nenhuma unidade selecionada</span>
          <h2>Seu carrinho está vazio.</h2>
          <p>
            Explore o catálogo e escolha androides alinhados à sua residência,
            equipe ou operação.
          </p>
          <Link className="button button-primary" to="/catalog">
            Explorar androides
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-products">
            <div className="cart-products-heading">
              <h2>Androides selecionados</h2>
              <Link className="inline-link" to="/catalog">
                Continuar comprando
              </Link>
            </div>

            <ul className="cart-items-list">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <CartItem item={item} onAnnounce={setStatusMessage} />
                </li>
              ))}
            </ul>
          </div>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <span className="eyebrow cart-summary-eyebrow">Resumo</span>
            <h2 id="cart-summary-title">Resumo do pedido</h2>

            <dl className="cart-summary-values">
              <div>
                <dt>Produtos</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div>
                <dt>Garantias adicionais</dt>
                <dd>{formatCurrency(warrantyTotal)}</dd>
              </div>
              <div>
                <dt>Frete</dt>
                <dd>Calculado no checkout</dd>
              </div>
              <div>
                <dt>Quantidade total</dt>
                <dd>
                  {totalItems} {totalItems === 1 ? 'unidade' : 'unidades'}
                </dd>
              </div>
              <div className="cart-summary-total">
                <dt>Total</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
            </dl>

            <Link className="button button-primary cart-checkout-link" to="/checkout">
              Continuar para checkout
            </Link>
            <p className="cart-checkout-note">
              O checkout é uma simulação em desenvolvimento. Nenhuma compra ou
              cobrança será realizada.
            </p>
            <button
              className="button button-ghost cart-clear-button"
              type="button"
              onClick={handleClearCart}
            >
              Limpar carrinho
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Cart
