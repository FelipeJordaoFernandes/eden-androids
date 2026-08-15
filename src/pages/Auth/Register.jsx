import { useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import {
  getEmailError,
  getNameError,
  getPasswordError,
  validateRegistration,
} from '../../utils/authValidation.js'
import AuthField from './AuthField.jsx'
import PasswordField from './PasswordField.jsx'
import './Auth.css'

const initialValues = {
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
}

function Register() {
  const titleRef = useRef(null)
  const navigate = useNavigate()
  const { currentUser, isProcessing, register } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  if (currentUser) return <Navigate to="/account" replace />

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setFormError('')
  }

  function handleBlur(event) {
    const { name, value } = event.target
    let message = ''

    if (name === 'name') message = getNameError(value)
    if (name === 'email') message = getEmailError(value)
    if (name === 'password') message = getPasswordError(value)
    if (name === 'passwordConfirmation' && value !== values.password) {
      message = 'As senhas precisam ser iguais.'
    }

    setErrors((currentErrors) => ({ ...currentErrors, [name]: message }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateRegistration(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      document
        .getElementById(`register-${Object.keys(validationErrors)[0]}`)
        ?.focus()
      return
    }

    const result = await register(values)

    if (!result.ok) {
      if (result.code === 'email_exists') {
        setErrors((currentErrors) => ({
          ...currentErrors,
          email: 'Já existe uma conta local com este e-mail.',
        }))
        document.getElementById('register-email')?.focus()
      } else {
        setFormError(
          'Não foi possível criar a conta neste navegador. Tente novamente.',
        )
      }

      return
    }

    navigate('/account', { replace: true })
  }

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-intro">
        <span className="eyebrow auth-eyebrow">Conta local</span>
        <h1 id="register-title" ref={titleRef} tabIndex={-1}>
          Crie seu espaço Eden.
        </h1>
        <p>
          Cadastre seus dados básicos para acessar uma área pessoal neste
          dispositivo.
        </p>
      </div>

      <div className="auth-panel">
        <form noValidate onSubmit={handleSubmit}>
          {formError ? (
            <p className="auth-form-alert" role="alert">
              {formError}
            </p>
          ) : null}

          <AuthField
            id="register-name"
            name="name"
            label="Nome"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <AuthField
            id="register-email"
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <PasswordField
            id="register-password"
            name="password"
            label="Senha"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            helpText="Use pelo menos 8 caracteres, incluindo uma letra e um número."
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <PasswordField
            id="register-passwordConfirmation"
            name="passwordConfirmation"
            label="Confirmar senha"
            toggleLabel="senha de confirmação"
            autoComplete="new-password"
            value={values.passwordConfirmation}
            error={errors.passwordConfirmation}
            onBlur={handleBlur}
            onChange={handleChange}
          />

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
        <p className="auth-local-notice">
          Seus dados ficam somente neste navegador. Esta experiência não substitui
          uma autenticação com servidor.
        </p>
      </div>
    </section>
  )
}

export default Register
