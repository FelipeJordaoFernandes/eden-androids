import { useRef, useState } from 'react'
import { fetchAddressByPostalCode } from '../../services/postalCodeService.js'
import {
  EMPTY_ADDRESS,
  EMPTY_ADDRESS_DETAILS,
  REQUIRED_ADDRESS_FIELDS,
  formatPostalCode,
  formatState,
  validateAddress,
} from '../../utils/address.js'
import './AddressForm.css'

const requiredFormFields = Object.freeze(['label', ...REQUIRED_ADDRESS_FIELDS])

function AddressField({
  autoComplete,
  className = '',
  describedBy,
  error,
  id,
  inputMode,
  label,
  maxLength,
  name,
  onChange,
  optional = false,
  value,
}) {
  const messageId = error ? `${id}-error` : undefined
  const descriptionIds = [messageId, describedBy].filter(Boolean).join(' ')

  return (
    <div className={`address-form-field${error ? ' has-error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label} {optional ? <small>(opcional)</small> : null}
      </label>
      <input
        id={id}
        type="text"
        name={name}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        aria-describedby={descriptionIds || undefined}
        aria-invalid={error ? 'true' : undefined}
        onChange={onChange}
      />
      {error ? (
        <small id={messageId} className="address-form-error">
          {error}
        </small>
      ) : null}
    </div>
  )
}

function AddressForm({
  formId = 'address',
  initialAddress,
  onCancel,
  onSave,
  submitLabel = 'Salvar endereço',
}) {
  const postalLookupIdRef = useRef(0)
  const [values, setValues] = useState(() => ({
    ...EMPTY_ADDRESS,
    ...initialAddress,
  }))
  const [errors, setErrors] = useState({})
  const [isPostalCodeLoading, setIsPostalCodeLoading] = useState(false)
  const [postalNotice, setPostalNotice] = useState('')
  const [saveError, setSaveError] = useState('')

  async function lookupPostalCode(postalCode, lookupId) {
    setIsPostalCodeLoading(true)

    try {
      const address = await fetchAddressByPostalCode(postalCode)

      if (postalLookupIdRef.current !== lookupId) return

      if (!address) {
        setPostalNotice('CEP não encontrado. Confira os números informados.')
        return
      }

      setValues((currentValues) => ({
        ...currentValues,
        ...address,
        addressNumber: '',
        addressComplement: '',
      }))
      setErrors((currentErrors) => ({
        ...currentErrors,
        postalCode: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
      }))
      setPostalNotice('CEP encontrado. Confira o endereço e informe o número.')
    } catch {
      if (postalLookupIdRef.current !== lookupId) return

      setPostalNotice(
        'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.',
      )
    } finally {
      if (postalLookupIdRef.current === lookupId) setIsPostalCodeLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.currentTarget
    const nextValue =
      name === 'postalCode'
        ? formatPostalCode(value)
        : name === 'state'
          ? formatState(value)
          : value

    setSaveError('')
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))

    if (name !== 'postalCode') {
      setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
      return
    }

    const lookupId = postalLookupIdRef.current + 1
    postalLookupIdRef.current = lookupId
    setIsPostalCodeLoading(false)
    setPostalNotice('')
    setValues((currentValues) => ({
      ...currentValues,
      postalCode: nextValue,
      ...EMPTY_ADDRESS_DETAILS,
    }))

    if (nextValue.replace(/\D/g, '').length === 8) {
      void lookupPostalCode(nextValue, lookupId)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = {
      ...(values.label.trim() ? {} : { label: 'Informe um nome para o endereço.' }),
      ...validateAddress(values),
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstInvalidField = requiredFormFields.find(
        (name) => validationErrors[name],
      )
      document.getElementById(`${formId}-${firstInvalidField}`)?.focus()
      return
    }

    const result = onSave(values)

    if (!result?.ok) {
      setSaveError('Não foi possível salvar o endereço neste navegador.')
    }
  }

  const postalDescriptionId =
    isPostalCodeLoading || postalNotice ? `${formId}-postal-notice` : undefined

  return (
    <form className="address-form" noValidate onSubmit={handleSubmit}>
      <div className="address-form-fields">
        <AddressField
          id={`${formId}-label`}
          name="label"
          label="Nome do endereço"
          value={values.label}
          error={errors.label}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-postalCode`}
          name="postalCode"
          label="CEP"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={9}
          value={values.postalCode}
          error={errors.postalCode}
          describedBy={postalDescriptionId}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-street`}
          name="street"
          label="Endereço"
          autoComplete="address-line1"
          className="address-form-field-wide"
          value={values.street}
          error={errors.street}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-addressNumber`}
          name="addressNumber"
          label="Número"
          autoComplete="address-line2"
          value={values.addressNumber}
          error={errors.addressNumber}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-addressComplement`}
          name="addressComplement"
          label="Complemento"
          autoComplete="address-line3"
          optional
          value={values.addressComplement}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-neighborhood`}
          name="neighborhood"
          label="Bairro"
          value={values.neighborhood}
          error={errors.neighborhood}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-city`}
          name="city"
          label="Cidade"
          autoComplete="address-level2"
          value={values.city}
          error={errors.city}
          onChange={handleChange}
        />
        <AddressField
          id={`${formId}-state`}
          name="state"
          label="UF"
          autoComplete="address-level1"
          maxLength={2}
          value={values.state}
          error={errors.state}
          onChange={handleChange}
        />
      </div>

      {postalDescriptionId ? (
        <p id={postalDescriptionId} className="address-form-notice" role="status">
          {isPostalCodeLoading ? 'Buscando endereço…' : postalNotice}
        </p>
      ) : null}
      {saveError ? (
        <p className="address-form-save-error" role="alert">
          {saveError}
        </p>
      ) : null}

      <div className="address-form-actions">
        <button className="button button-primary" type="submit" disabled={isPostalCodeLoading}>
          {submitLabel}
        </button>
        {onCancel ? (
          <button className="button button-ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default AddressForm
