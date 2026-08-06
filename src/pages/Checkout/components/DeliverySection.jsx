import { shippingOptions } from '../checkoutConfig.js'
import { formatCurrency } from '../../../utils/formatCurrency.js'
import CheckoutSectionHeading from './CheckoutSectionHeading.jsx'

function DeliverySection({
  formData,
  isAddressComplete,
  isPostalCodeLoading,
  onCalculateShipping,
  onFieldChange,
  postalCodeRef,
  postalCodeResolved,
  postalLookupNotice,
  shippingButtonRef,
  shippingCalculated,
  shippingCalculationError,
  shippingError,
}) {
  return (
    <section className="checkout-panel" aria-labelledby="delivery-data-title">
      <CheckoutSectionHeading
        number="02"
        title="Endereço e entrega"
        titleId="delivery-data-title"
        description="Escolha a janela de instalação mais conveniente."
      />

      <div className="checkout-fields">
        <div className="checkout-field checkout-postal-field">
          <label htmlFor="checkout-postal-code">CEP</label>
          <div>
            <input
              id="checkout-postal-code"
              ref={postalCodeRef}
              type="text"
              name="postalCode"
              autoComplete="postal-code"
              inputMode="numeric"
              minLength="9"
              placeholder="00000-000"
              value={formData.postalCode}
              aria-invalid={shippingError ? 'true' : undefined}
              aria-describedby={
                shippingError
                  ? 'shipping-error'
                  : isPostalCodeLoading
                    ? 'postal-code-loading'
                    : postalLookupNotice
                      ? 'postal-lookup-notice'
                      : postalCodeResolved
                        ? 'shipping-success'
                        : undefined
              }
              onChange={onFieldChange}
              required
            />
          </div>

          {isPostalCodeLoading && (
            <small
              id="postal-code-loading"
              className="checkout-field-loading"
              role="status"
            >
              Buscando endereço…
            </small>
          )}
          {shippingError && (
            <small id="shipping-error" className="checkout-field-error" role="alert">
              {shippingError}
            </small>
          )}
          {postalLookupNotice && (
            <small
              id="postal-lookup-notice"
              className="checkout-field-notice"
              role="status"
            >
              {postalLookupNotice}
            </small>
          )}
          {!shippingError && !postalLookupNotice && postalCodeResolved && (
            <small
              id="shipping-success"
              className="checkout-field-success"
              role="status"
            >
              CEP encontrado. Confira o endereço e informe o número.
            </small>
          )}
        </div>

        <label className="checkout-field checkout-field-wide">
          <span>Endereço</span>
          <input
            type="text"
            name="street"
            autoComplete="address-line1"
            value={formData.street}
            onChange={onFieldChange}
            required
          />
        </label>
        <label className="checkout-field">
          <span>Número</span>
          <input
            type="text"
            name="addressNumber"
            autoComplete="address-line2"
            value={formData.addressNumber}
            onChange={onFieldChange}
            required
          />
        </label>
        <label className="checkout-field">
          <span>Complemento <small>(opcional)</small></span>
          <input
            type="text"
            name="addressComplement"
            autoComplete="address-line3"
            value={formData.addressComplement}
            onChange={onFieldChange}
          />
        </label>
        <label className="checkout-field">
          <span>Bairro</span>
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={onFieldChange}
            required
          />
        </label>
        <label className="checkout-field">
          <span>Cidade</span>
          <input
            type="text"
            name="city"
            autoComplete="address-level2"
            value={formData.city}
            onChange={onFieldChange}
            required
          />
        </label>
        <label className="checkout-field checkout-state-field">
          <span>UF</span>
          <input
            type="text"
            name="state"
            autoComplete="address-level1"
            minLength="2"
            maxLength="2"
            value={formData.state}
            onChange={onFieldChange}
            required
          />
        </label>
      </div>

      <div className="checkout-shipping-action">
        <button
          ref={shippingButtonRef}
          className="button button-secondary"
          type="button"
          aria-describedby={
            isAddressComplete ? undefined : 'shipping-calculation-hint'
          }
          onClick={onCalculateShipping}
          disabled={!isAddressComplete || isPostalCodeLoading}
        >
          Calcular frete
        </button>
        {!isAddressComplete && (
          <small id="shipping-calculation-hint">
            Preencha CEP, endereço, número, bairro, cidade e UF para liberar o
            cálculo.
          </small>
        )}
        {shippingCalculationError && (
          <small className="checkout-field-error" role="alert">
            {shippingCalculationError}
          </small>
        )}
      </div>

      {shippingCalculated && (
        <fieldset className="checkout-option-group checkout-shipping-options">
          <legend>Opções disponíveis para o CEP informado</legend>
          {shippingOptions.map((option) => (
            <label className="checkout-option" key={option.id}>
              <input
                type="radio"
                name="shippingId"
                value={option.id}
                checked={formData.shippingId === option.id}
                onChange={onFieldChange}
                required
              />
              <span className="checkout-option-marker" aria-hidden="true" />
              <span className="checkout-option-content">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
                <span>{option.estimate}</span>
              </span>
              <strong className="checkout-option-price">
                {option.price === 0 ? 'Inclusa' : formatCurrency(option.price)}
              </strong>
            </label>
          ))}
        </fieldset>
      )}
    </section>
  )
}

export default DeliverySection
