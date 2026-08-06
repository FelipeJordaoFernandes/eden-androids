import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/formatCurrency.js'

function CheckoutSummary({
  cartItems,
  formData,
  grandTotal,
  onFieldChange,
  selectedShipping,
  subtotal,
  totalItems,
  warrantyTotal,
}) {
  return (
    <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
      <div className="checkout-summary-heading">
        <span className="eyebrow">Seu pedido</span>
        <h2 id="checkout-summary-title">Resumo</h2>
        <Link className="inline-link" to="/cart">Editar carrinho</Link>
      </div>

      <ul className="checkout-summary-items">
        {cartItems.map((item) => (
          <li key={item.id}>
            <div className={`checkout-summary-visual${item.image ? ' has-image' : ''}`}>
              {item.image ? (
                <img src={item.image} alt="" width="1122" height="1402" />
              ) : (
                <span aria-hidden="true">{item.modelCode}</span>
              )}
              <strong aria-label={`${item.quantity} unidades`}>{item.quantity}</strong>
            </div>
            <div>
              <span>{item.line}</span>
              <strong>{item.name}</strong>
              <small>{item.warrantyDetails.label}</small>
            </div>
            <strong>{formatCurrency(item.itemTotal)}</strong>
          </li>
        ))}
      </ul>

      <dl className="checkout-summary-values">
        <div>
          <dt>Produtos ({totalItems})</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        <div>
          <dt>Garantias adicionais</dt>
          <dd>{formatCurrency(warrantyTotal)}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>
            {selectedShipping
              ? selectedShipping.price === 0
                ? 'Inclusa'
                : formatCurrency(selectedShipping.price)
              : 'A calcular'}
          </dd>
        </div>
        <div className="checkout-summary-total">
          <dt>Total</dt>
          <dd>{formatCurrency(grandTotal)}</dd>
        </div>
      </dl>

      <label className="checkout-terms">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={formData.termsAccepted}
          onChange={onFieldChange}
          required
        />
        <span>
          Confirmo que este é um checkout fictício, sem compra, cobrança ou
          entrega real.
        </span>
      </label>

      <button className="button button-primary checkout-submit" type="submit">
        Concluir pedido simulado
      </button>
      <p className="checkout-security-note">
        <span aria-hidden="true">◇</span>
        Ambiente demonstrativo. Dados pessoais e de pagamento não são
        armazenados; apenas o CEP é consultado no ViaCEP.
      </p>
    </aside>
  )
}

export default CheckoutSummary
