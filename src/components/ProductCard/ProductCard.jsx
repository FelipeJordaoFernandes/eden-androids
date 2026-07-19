import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './ProductCard.css'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div
        className={`product-card-visual${
          product.image ? ' product-card-visual-has-image' : ''
        }`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} — ${product.type}`}
            width="1122"
            height="1402"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span aria-hidden="true">{product.modelCode}</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="badge">{product.category}</span>
          <span className="badge badge-neutral">{product.type}</span>
        </div>

        <h3>{product.name}</h3>
        <p className="product-line">{product.line}</p>
        <p className="product-specialty">
          <span>Especialidade</span>
          {product.specialty}
        </p>
        <strong className="product-price">{formatCurrency(product.price)}</strong>

        <div className="product-spec-row">
          <span>Autonomia: {product.autonomyLevel}</span>
          <span>Bateria: {product.battery}</span>
          <span>Avaliação: {product.rating.toFixed(1)}</span>
        </div>

        <p className="product-description">{product.shortDescription}</p>

        <Link className="inline-link product-details-link" to={`/product/${product.id}`}>
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}

export default ProductCard
