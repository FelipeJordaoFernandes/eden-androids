import { useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { validateLogin } from '../../utils/authValidation.js'
import AuthField from './AuthField.jsx'
import PasswordField from './PasswordField.jsx'
import './Auth.css'

const initialValues = { email: '', password: '' }

function getDestination(locationState) {
  const destination = locationState?.from

  if (
    !destination ||
    typeof destination.pathname !== 'string' ||
    !destination.pathname.startsWith('/') ||
    destination.pathname.startsWith('//')
  ) {
    return '/account'
  }

  return `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}`
}

function Login() {
  const titleRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isProcessing, login } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  if (currentUser) {
    return <Navigate to={getDestination(location.state)} replace />
  }

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateLogin(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      document.getElementById(`login-${Object.keys(validationErrors)[0]}`)?.focus()
      return
    }

    const result = await login(values)

    if (!result.ok) {
      setValues((currentValues) => ({ ...currentValues, password: '' }))
      setFormError(
        result.code === 'authentication_unavailable'
          ? 'Não foi possível acessar a conta neste navegador. Tente novamente.'
          : 'E-mail ou senha inválidos.',
      )
      document.getElementById('login-email')?.focus()
      return
    }

    navigate(getDestination(location.state), { replace: true })
  }

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-intro">
        <span className="eyebrow auth-eyebrow">Acesso local</span>
        <h1 id="login-title" ref={titleRef} tabIndex={-1}>
          Entre na sua conta.
        </h1>
        <p>
          Acesse seus dados básicos e os pedidos disponíveis neste dispositivo.
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
            id="login-email"
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={handleChange}
          />
          <PasswordField
            id="login-password"
            name="password"
            label="Senha"
            autoComplete="current-password"
            value={values.password}
            error={errors.password}
            onChange={handleChange}
          />

          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={isProcessing}
          >
            {isProcessing ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Ainda não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
        <p className="auth-local-notice">
          Conta demonstrativa salva somente neste navegador. Nenhuma autenticação
          em servidor é realizada.
        </p>
      </div>
    </section>
  )
}

export default Login
