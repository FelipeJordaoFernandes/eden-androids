import CheckoutSectionHeading from './CheckoutSectionHeading.jsx'

function FieldError({ id, message }) {
  if (!message) return null

  return (
    <small id={id} className="checkout-field-error" role="alert">
      {message}
    </small>
  )
}

function CustomerDataSection({
  fieldErrors,
  formData,
  onFieldBlur,
  onFieldChange,
  onFieldInvalid,
}) {
  return (
    <section className="checkout-panel" aria-labelledby="customer-data-title">
      <CheckoutSectionHeading
        number="01"
        title="Dados do cliente"
        titleId="customer-data-title"
        description="Usados somente durante esta demonstração."
      />

      <div className="checkout-fields">
        <label className="checkout-field checkout-field-wide">
          <span>Nome completo</span>
          <input
            type="text"
            name="fullName"
            autoComplete="name"
            minLength="3"
            value={formData.fullName}
            onChange={onFieldChange}
            required
          />
        </label>

        <div className="checkout-field">
          <label htmlFor="checkout-email">E-mail</label>
          <input
            id="checkout-email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            aria-invalid={fieldErrors.email ? 'true' : undefined}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            onInvalid={onFieldInvalid}
            required
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </div>

        <div className="checkout-field">
          <label htmlFor="checkout-phone">Telefone</label>
          <input
            id="checkout-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="numeric"
            minLength="14"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            aria-invalid={fieldErrors.phone ? 'true' : undefined}
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            onInvalid={onFieldInvalid}
            required
          />
          <FieldError id="phone-error" message={fieldErrors.phone} />
        </div>

        <div className="checkout-field">
          <label htmlFor="checkout-document">CPF</label>
          <input
            id="checkout-document"
            type="text"
            name="document"
            autoComplete="off"
            inputMode="numeric"
            minLength="14"
            placeholder="000.000.000-00"
            value={formData.document}
            aria-invalid={fieldErrors.document ? 'true' : undefined}
            aria-describedby={fieldErrors.document ? 'document-error' : undefined}
            onChange={onFieldChange}
            onBlur={onFieldBlur}
            onInvalid={onFieldInvalid}
            required
          />
          <FieldError id="document-error" message={fieldErrors.document} />
        </div>
      </div>
    </section>
  )
}

export default CustomerDataSection
