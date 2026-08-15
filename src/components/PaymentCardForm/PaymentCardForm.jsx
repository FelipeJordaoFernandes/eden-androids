import { useState } from 'react'
import {
  CARD_REQUIRED_FIELDS,
  EMPTY_CARD_FORM,
  formatPaymentCardCvv,
  formatPaymentCardExpiry,
  formatPaymentCardNumber,
  validatePaymentCard,
} from '../../utils/paymentCard.js'
import './PaymentCardForm.css'

const cardFields = Object.freeze([
  { name: 'label', label: 'Nome do cartão', placeholder: 'Cartão principal', optional: true },
  { name: 'cardholder', label: 'Nome impresso no cartão', placeholder: 'NOME FICTÍCIO' },
  { name: 'cardNumber', label: 'Número do cartão', placeholder: '0000 0000 0000 0000', numeric: true },
  { name: 'expiry', label: 'Validade', placeholder: 'MM/AA', numeric: true },
  { name: 'cvv', label: 'CVV', placeholder: '000', numeric: true },
])

function PaymentCardForm({
  formId = 'card',
  onCancel,
  onSave,
  submitLabel = 'Salvar cartão fictício',
}) {
  const [values, setValues] = useState({ ...EMPTY_CARD_FORM })
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')

  function handleChange(event) {
    const { name, value } = event.currentTarget
    const nextValue =
      name === 'cardNumber'
        ? formatPaymentCardNumber(value)
        : name === 'expiry'
          ? formatPaymentCardExpiry(value)
          : name === 'cvv'
            ? formatPaymentCardCvv(value)
            : value

    setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSaveError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validatePaymentCard(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstInvalidField = CARD_REQUIRED_FIELDS.find(
        (name) => validationErrors[name],
      )
      document.getElementById(`${formId}-${firstInvalidField}`)?.focus()
      return
    }

    const result = onSave(values)

    if (!result?.ok) {
      setSaveError('Não foi possível salvar o cartão fictício neste navegador.')
    }
  }

  return (
    <form className="payment-card-form" noValidate onSubmit={handleSubmit}>
      <div className="payment-card-form-grid">
        {cardFields.map((field) => {
          const errorId = errors[field.name]
            ? `${formId}-${field.name}-error`
            : undefined

          return (
            <div className={`payment-card-field${errors[field.name] ? ' has-error' : ''}`} key={field.name}>
              <label htmlFor={`${formId}-${field.name}`}>
                {field.label} {field.optional ? <small>(opcional)</small> : null}
              </label>
              <input
                id={`${formId}-${field.name}`}
                type="text"
                name={field.name}
                inputMode={field.numeric ? 'numeric' : undefined}
                autoComplete="off"
                placeholder={field.placeholder}
                value={values[field.name]}
                aria-invalid={errors[field.name] ? 'true' : undefined}
                aria-describedby={errorId}
                onChange={handleChange}
              />
              {errors[field.name] ? (
                <small id={errorId} className="payment-card-error">
                  {errors[field.name]}
                </small>
              ) : null}
            </div>
          )
        })}
      </div>

      {saveError ? <p className="payment-card-error" role="alert">{saveError}</p> : null}

      <div className="payment-card-actions">
        <button className="button button-primary" type="submit">{submitLabel}</button>
        {onCancel ? <button className="button button-ghost" type="button" onClick={onCancel}>Cancelar</button> : null}
      </div>
    </form>
  )
}

export default PaymentCardForm
