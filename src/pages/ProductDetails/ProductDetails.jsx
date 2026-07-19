import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../../data/products.js'
import useCart from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const titleRef = useRef(null)
  const [cartFeedback, setCartFeedback] = useState(null)
  const { addItem, getItemQuantity } = useCart()
  const product = products.find((item) => String(item.id) === id)
  const cartQuantity = product ? getItemQuantity(product.id) : 0

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
  }, [id])

  function handleAddToCart() {
    if (!product || product.stock < 1 || cartQuantity >= product.stock) return

    const nextQuantity = cartQuantity + 1
    addItem(product.id)
    setCartFeedback({
      productId: product.id,
      message: `Adicionado ao carrinho. ${nextQuantity} ${
        nextQuantity === 1 ? 'unidade deste modelo' : 'unidades deste modelo'
      } no carrinho.`,
    })
  }

  if (!product) {
    return (
      <section className="details-page details-page-empty">
        <span className="eyebrow details-eyebrow">Produto não encontrado</span>
        <h1 ref={titleRef} tabIndex={-1}>
          Este androide não está no catálogo.
        </h1>
        <p>
          O modelo solicitado não foi localizado. Volte ao catálogo para
          explorar as unidades Eden disponíveis.
        </p>
        <Link className="button button-secondary details-back-link" to="/catalog">
          Voltar ao catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="details-page">
      <div className="details-hero">
        <div className="details-copy">
          <span className="eyebrow details-eyebrow">{product.category}</span>
          <h1 ref={titleRef} tabIndex={-1}>
            {product.name}
          </h1>
          <p className="details-line">{product.line}</p>
          <div className="details-tags">
            <span className="badge">{product.type}</span>
            <span className="badge badge-neutral">{product.modelCode}</span>
          </div>
          <strong className="details-price">{formatCurrency(product.price)}</strong>
          <p className="details-specialty">
            <strong>Especialidade:</strong> {product.specialty}
          </p>
          <p>{product.description}</p>

          <div className="details-actions">
            <button
              className="button button-primary details-cart-button"
              type="button"
              disabled={product.stock < 1 || cartQuantity >= product.stock}
              onClick={handleAddToCart}
            >
              {product.stock < 1
                ? 'Produto indisponível'
                : cartQuantity >= product.stock
                  ? 'Limite de estoque atingido'
                  : 'Adicionar ao carrinho'}
            </button>
            <Link className="button button-secondary details-back-link" to="/catalog">
              Voltar ao catálogo
            </Link>
          </div>

          <div className="details-cart-meta">
            <p
              className="details-cart-feedback"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {cartFeedback?.productId === product.id
                ? cartFeedback.message
                : cartQuantity > 0
                  ? `${cartQuantity} ${
                      cartQuantity === 1 ? 'unidade' : 'unidades'
                    } deste modelo no carrinho.`
                  : ''}
            </p>
            {cartQuantity > 0 && (
              <Link className="inline-link details-cart-link" to="/cart">
                Ver carrinho
              </Link>
            )}
          </div>
        </div>

        <aside
          className={`details-visual${
            product.image ? ' details-visual-has-image' : ''
          }`}
          aria-label={product.image ? undefined : `Imagem futura de ${product.name}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={`${product.name} — ${product.type}`}
              width="1122"
              height="1402"
              decoding="async"
            />
          ) : (
            <>
              <span>{product.line}</span>
              <strong>{product.name}</strong>
              <small>Imagem em preparação</small>
            </>
          )}
        </aside>
      </div>

      <div className="details-metrics">
        <div>
          <span>Categoria</span>
          <strong>{product.category}</strong>
        </div>
        <div>
          <span>Tipo</span>
          <strong>{product.type}</strong>
        </div>
        <div>
          <span>Código</span>
          <strong>{product.modelCode}</strong>
        </div>
        <div>
          <span>Estoque</span>
          <span className="badge badge-success">{product.stock} unidades</span>
        </div>
        <div>
          <span>Avaliação</span>
          <strong>
            {product.rating.toFixed(1)} / 5 ({product.reviews} avaliações)
          </strong>
        </div>
        <div>
          <span>Autonomia</span>
          <strong>{product.autonomyLevel}</strong>
        </div>
        <div>
          <span>Bateria</span>
          <strong>{product.battery}</strong>
        </div>
        <div>
          <span>Garantia</span>
          <strong>{product.warranty}</strong>
        </div>
      </div>

      <div className="details-content-grid">
        <article className="details-panel">
          <h2>Funções principais</h2>
          <ul>
            {product.functions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="details-panel">
          <h2>Ficha técnica</h2>
          <dl>
            {Object.entries(product.specs).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <aside className="details-ethical-notice">
        <span className="eyebrow details-eyebrow">Aviso ético e legal</span>
        <p>{product.ethicalNotice}</p>
      </aside>
    </section>
  )
}

export default ProductDetails
