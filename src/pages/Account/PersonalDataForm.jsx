import { useState } from 'react'
import useAuth from '../../hooks/useAuth.js'
import {
  CUSTOMER_PROFILE_FIELDS,
  formatDocument,
  formatPhone,
  validateCustomerProfile,
} from '../../utils/customerData.js'

const fieldConfig = Object.freeze([
  { name: 'name', label: 'Nome completo', autoComplete: 'name' },
  { name: 'email', label: 'E-mail', autoComplete: 'email', type: 'email' },
  {
    name: 'phone',
    label: 'Telefone',
    autoComplete: 'tel',
    inputMode: 'numeric',
    placeholder: '(00) 00000-0000',
  },
  {
    name: 'document',
    label: 'CPF',
    autoComplete: 'off',
    inputMode: 'numeric',
    placeholder: '000.000.000-00',
  },
])

function PersonalDataForm() {
  const { currentUser, updateProfile } = useAuth()
  const [values, setValues] = useState(() => ({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    document: currentUser.document,
  }))
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  function handleChange(event) {
    const { name, value } = event.currentTarget
    const nextValue =
      name === 'phone'
        ? formatPhone(value)
        : name === 'document'
          ? formatDocument(value)
          : value

    setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setNotice('')
    setFormError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateCustomerProfile(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstInvalidField = CUSTOMER_PROFILE_FIELDS.find(
        (name) => validationErrors[name],
      )
      document.getElementById(`account-profile-${firstInvalidField}`)?.focus()
      return
    }

    const result = updateProfile(values)

    if (!result.ok) {
      if (result.code === 'email_exists') {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: 'Já existe uma conta local com este e-mail.',
        }))
        document.getElementById('account-profile-email')?.focus()
      } else {
        setFormError('Não foi possível salvar seus dados neste navegador.')
      }
      return
    }

    setValues({
      name: result.account.name,
      email: result.account.email,
      phone: result.account.phone,
      document: result.account.document,
    })
    setNotice('Seus dados pessoais foram salvos neste dispositivo.')
  }

  return (
    <form className="account-data-form" noValidate onSubmit={handleSubmit}>
      <div className="account-form-grid">
        {fieldConfig.map((field) => {
          const errorId = errors[field.name]
            ? `account-profile-${field.name}-error`
            : undefined

          return (
            <div className={`account-form-field${errors[field.name] ? ' has-error' : ''}`} key={field.name}>
              <label htmlFor={`account-profile-${field.name}`}>{field.label}</label>
              <input
                id={`account-profile-${field.name}`}
                type={field.type ?? 'text'}
                name={field.name}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                value={values[field.name]}
                aria-invalid={errors[field.name] ? 'true' : undefined}
                aria-describedby={errorId}
                onChange={handleChange}
              />
              {errors[field.name] ? (
                <small id={errorId} className="account-form-error">
                  {errors[field.name]}
                </small>
              ) : null}
            </div>
          )
        })}
      </div>

      {formError ? <p className="account-form-error" role="alert">{formError}</p> : null}
      {notice ? <p className="account-form-success" role="status">{notice}</p> : null}

      <button className="button button-primary" type="submit">
        Salvar dados pessoais
      </button>
    </form>
  )
}

export default PersonalDataForm
