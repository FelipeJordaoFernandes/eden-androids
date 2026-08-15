import { useState } from 'react'
import PaymentCardForm from '../../../components/PaymentCardForm/PaymentCardForm.jsx'
import { formatCurrency } from '../../../utils/formatCurrency.js'
import { installmentOptions, paymentOptions } from '../checkoutConfig.js'
import CheckoutSectionHeading from './CheckoutSectionHeading.jsx'

function PaymentSection({
  formData,
  grandTotal,
  onCardSave = () => ({ ok: false }),
  onFieldChange,
  onPaymentMethodSelect = () => {},
  paymentError,
  paymentMethods = [],
  selectedPaymentMethodId,
}) {
  const [isAddingCard, setIsAddingCard] = useState(false)

  function handleCardSave(values) {
    const result = onCardSave(values)

    if (result.ok) setIsAddingCard(false)

    return result
  }

  return (
    <section className="checkout-panel" aria-labelledby="payment-data-title">
      <CheckoutSectionHeading
        number="02"
        title="Pagamento"
        titleId="payment-data-title"
        description="Escolha a forma de pagamento para o pedido."
      />

      <fieldset className="checkout-option-group checkout-payment-options">
        <legend className="visually-hidden">Forma de pagamento</legend>
        {paymentOptions.map((option) => (
          <label className="checkout-option" key={option.id}>
            <input
              id={option.id === 'card' ? 'checkout-payment-card' : undefined}
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

      {formData.paymentMethod === 'card' ? (
        <div className="checkout-card-fields">
          <p className="checkout-demo-warning">
            Use somente dados fictícios. Nenhuma cobrança real é processada.
          </p>

          {paymentMethods.length > 0 ? (
            <fieldset className="checkout-option-group checkout-saved-card-options">
              <legend>Cartão fictício para este pedido</legend>
              {paymentMethods.map((method) => (
                <label className="checkout-option" key={method.id}>
                  <input
                    type="radio"
                    name="selectedPaymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethodId === method.id}
                    onChange={() => onPaymentMethodSelect(method.id)}
                  />
                  <span className="checkout-option-marker" aria-hidden="true" />
                  <span className="checkout-option-content">
                    <strong>{method.label}{method.isDefault ? ' · Principal' : ''}</strong>
                    <small>{method.brand} •••• {method.lastFour} · validade {method.expiry}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="checkout-inline-empty">
              <h3>Nenhum cartão fictício cadastrado.</h3>
              <p>Adicione uma opção sanitizada para continuar com cartão.</p>
            </div>
          )}

          {isAddingCard || paymentMethods.length === 0 ? (
            <div className="checkout-inline-editor">
              <h3>Novo cartão fictício</h3>
              <PaymentCardForm
                formId="checkout-card"
                onSave={handleCardSave}
                onCancel={paymentMethods.length > 0 ? () => setIsAddingCard(false) : undefined}
                submitLabel="Salvar e usar este cartão"
              />
            </div>
          ) : (
            <button className="button button-secondary" type="button" onClick={() => setIsAddingCard(true)}>
              Cadastrar outro cartão fictício
            </button>
          )}

          {paymentError ? <p className="checkout-field-error" role="alert">{paymentError}</p> : null}

          <label className="checkout-field checkout-installments-field">
            <span>Parcelamento</span>
            <select name="installments" value={formData.installments} onChange={onFieldChange}>
              {installmentOptions.map((installments) => (
                <option value={installments} key={installments}>
                  {installments}x de {formatCurrency(grandTotal / installments)} sem juros
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  )
}

export default PaymentSection
