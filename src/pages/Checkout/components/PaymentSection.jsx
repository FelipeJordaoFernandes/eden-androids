import { installmentOptions, paymentOptions } from '../checkoutConfig.js'
import { formatCurrency } from '../../../utils/formatCurrency.js'
import CheckoutSectionHeading from './CheckoutSectionHeading.jsx'

function PaymentSection({ formData, grandTotal, onFieldChange }) {
  return (
    <section className="checkout-panel" aria-labelledby="payment-data-title">
      <CheckoutSectionHeading
        number="03"
        title="Pagamento"
        titleId="payment-data-title"
        description="Escolha a forma de pagamento para o pedido."
      />

      <fieldset className="checkout-option-group checkout-payment-options">
        <legend className="visually-hidden">Forma de pagamento</legend>
        {paymentOptions.map((option) => (
          <label className="checkout-option" key={option.id}>
            <input
              type="radio"
              name="paymentMethod"
              value={option.id}
              checked={formData.paymentMethod === option.id}
              onChange={onFieldChange}
            />
            <span className="checkout-option-marker" aria-hidden="true" />
            <span className="checkout-option-content">
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>

      {formData.paymentMethod === 'card' && (
        <div className="checkout-card-fields">
          <div className="checkout-fields">
            <label className="checkout-field checkout-field-wide">
              <span>Número do cartão</span>
              <input
                type="text"
                name="cardNumber"
                autoComplete="cc-number"
                inputMode="numeric"
                minLength="19"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={onFieldChange}
                required
              />
            </label>
            <label className="checkout-field checkout-field-wide">
              <span>Nome impresso no cartão</span>
              <input
                type="text"
                name="cardName"
                autoComplete="cc-name"
                minLength="3"
                value={formData.cardName}
                onChange={onFieldChange}
                required
              />
            </label>
            <label className="checkout-field">
              <span>Validade</span>
              <input
                type="text"
                name="cardExpiry"
                autoComplete="cc-exp"
                inputMode="numeric"
                minLength="5"
                placeholder="MM/AA"
                value={formData.cardExpiry}
                onChange={onFieldChange}
                required
              />
            </label>
            <label className="checkout-field">
              <span>CVV</span>
              <input
                type="text"
                name="cardCvv"
                autoComplete="cc-csc"
                inputMode="numeric"
                minLength="3"
                maxLength="4"
                placeholder="000"
                value={formData.cardCvv}
                onChange={onFieldChange}
                required
              />
            </label>
            <label className="checkout-field checkout-field-wide">
              <span>Parcelamento</span>
              <select
                name="installments"
                value={formData.installments}
                onChange={onFieldChange}
              >
                {installmentOptions.map((installments) => (
                  <option value={installments} key={installments}>
                    {installments}x de{' '}
                    {formatCurrency(grandTotal / installments)} sem juros
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </section>
  )
}

export default PaymentSection
