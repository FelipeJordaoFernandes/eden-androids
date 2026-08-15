import { useState } from 'react'
import AuthField from './AuthField.jsx'

function PasswordField(props) {
  const [isVisible, setIsVisible] = useState(false)
  const toggleLabel = props.toggleLabel ?? props.label.toLowerCase()

  return (
    <div className="auth-password-field">
      <AuthField {...props} type={isVisible ? 'text' : 'password'} />
      <button
        className="auth-password-toggle"
        type="button"
        aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} ${toggleLabel}`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((currentValue) => !currentValue)}
      >
        {isVisible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}

export default PasswordField
