function AuthField({
  autoComplete,
  error,
  helpText,
  id,
  label,
  name,
  onBlur,
  onChange,
  type = 'text',
  value,
}) {
  const descriptionIds = [helpText ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`auth-field${error ? ' auth-field-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-describedby={descriptionIds || undefined}
        aria-invalid={Boolean(error)}
        onBlur={onBlur}
        onChange={onChange}
      />
      {helpText ? (
        <span className="auth-field-help" id={`${id}-help`}>
          {helpText}
        </span>
      ) : null}
      {error ? (
        <span className="auth-field-message" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

export default AuthField
