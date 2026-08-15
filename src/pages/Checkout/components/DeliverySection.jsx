import { useState } from 'react'
import AddressForm from '../../../components/AddressForm/AddressForm.jsx'
import { formatCurrency } from '../../../utils/formatCurrency.js'
import { shippingOptions } from '../checkoutConfig.js'
import CheckoutSectionHeading from './CheckoutSectionHeading.jsx'

function DeliverySection({
  addresses,
  formData,
  onAddressChange,
  onAddressSave,
  onCalculateShipping,
  onFieldChange,
  selectedAddressId,
  shippingButtonRef,
  shippingCalculated,
  shippingCalculationError,
}) {
  const [isAddingAddress, setIsAddingAddress] = useState(addresses.length === 0)

  function handleAddressSave(values) {
    const result = onAddressSave(values)

    if (result.ok) setIsAddingAddress(false)

    return result
  }

  return (
    <section className="checkout-panel" aria-labelledby="delivery-data-title">
      <CheckoutSectionHeading
        number="01"
        title="Endereço e entrega"
        titleId="delivery-data-title"
        description="Selecione um endereço salvo ou cadastre uma nova opção."
      />

      {addresses.length > 0 ? (
        <fieldset className="checkout-option-group checkout-address-options">
          <legend>Endereço para esta entrega</legend>
          {addresses.map((address) => (
            <label className="checkout-option checkout-address-option" key={address.id}>
              <input
                type="radio"
                name="selectedAddress"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={() => onAddressChange(address.id)}
              />
              <span className="checkout-option-marker" aria-hidden="true" />
              <span className="checkout-option-content">
                <strong>
                  {address.label}
                  {address.isDefault ? ' · Principal' : ''}
                </strong>
                <small>
                  {address.street}, {address.addressNumber}
                  {address.addressComplement ? ` — ${address.addressComplement}` : ''}
                </small>
                <span>{address.city} — {address.state} · CEP {address.postalCode}</span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="checkout-inline-empty">
          <h3>Nenhum endereço cadastrado.</h3>
          <p>Adicione um endereço para calcular a entrega.</p>
        </div>
      )}

      {isAddingAddress ? (
        <div className="checkout-inline-editor">
          <h3>Novo endereço</h3>
          <AddressForm
            formId="checkout-address"
            onSave={handleAddressSave}
            onCancel={addresses.length > 0 ? () => setIsAddingAddress(false) : undefined}
            submitLabel="Salvar e usar este endereço"
          />
        </div>
      ) : (
        <button className="button button-secondary" type="button" onClick={() => setIsAddingAddress(true)}>
          Cadastrar novo endereço
        </button>
      )}

      <div className="checkout-shipping-action">
        <button
          ref={shippingButtonRef}
          className="button button-secondary"
          type="button"
          onClick={onCalculateShipping}
          disabled={!selectedAddressId}
        >
          Calcular frete
        </button>
        {!selectedAddressId ? <small>Selecione um endereço completo para liberar o cálculo.</small> : null}
        {shippingCalculationError ? (
          <small className="checkout-field-error" role="alert">{shippingCalculationError}</small>
        ) : null}
      </div>

      {shippingCalculated ? (
        <fieldset className="checkout-option-group checkout-shipping-options">
          <legend>Opções disponíveis para o endereço selecionado</legend>
          {shippingOptions.map((option) => (
            <label className="checkout-option" key={option.id}>
              <input
                type="radio"
                name="shippingId"
                value={option.id}
                checked={formData.shippingId === option.id}
                onChange={onFieldChange}
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
      ) : null}
    </section>
  )
}

export default DeliverySection
