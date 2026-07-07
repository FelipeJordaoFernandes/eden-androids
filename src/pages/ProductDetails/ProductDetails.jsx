import { Link, useParams } from 'react-router-dom'
import { products } from '../../data/products.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const product = products.find((item) => String(item.id) === id)

  if (!product) {
    return (
      <section className="details-page details-page-empty">
        <span className="details-eyebrow">Produto não encontrado</span>
        <h1>Este androide não está no catálogo.</h1>
        <p>
          O modelo solicitado não foi localizado. Volte ao catálogo para
          explorar as unidades Eden disponíveis.
        </p>
        <Link className="details-back-link" to="/catalog">
          Voltar ao catálogo
        </Link>
      </section>
    )
  }

  return (
    <section className="details-page">
      <div className="details-hero">
        <div className="details-copy">
          <span className="details-eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="details-line">{product.line}</p>
          <div className="details-tags">
            <span>{product.type}</span>
            <span>{product.modelCode}</span>
          </div>
          <strong className="details-price">{formatCurrency(product.price)}</strong>
          <p className="details-specialty">
            <strong>Especialidade:</strong> {product.specialty}
          </p>
          <p>{product.description}</p>

          <div className="details-actions">
            <button className="details-cart-button" type="button" disabled>
              Adicionar ao carrinho
            </button>
            <Link className="details-back-link" to="/catalog">
              Voltar ao catálogo
            </Link>
          </div>
        </div>

        <aside className="details-visual" aria-label={`Imagem futura de ${product.name}`}>
          <span>{product.line}</span>
          <strong>{product.name}</strong>
          <small>{product.image}</small>
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
          <strong>{product.stock} unidades</strong>
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
        <span className="details-eyebrow">Aviso ético e legal</span>
        <p>{product.ethicalNotice}</p>
      </aside>
    </section>
  )
}

export default ProductDetails
