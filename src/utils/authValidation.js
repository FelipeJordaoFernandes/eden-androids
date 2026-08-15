import { isValidEmail } from './validation.js'

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

export function getNameError(value) {
  const normalizedName = normalizeName(value)

  if (normalizedName.length < 2) {
    return 'Informe seu nome com pelo menos 2 caracteres.'
  }

  if (normalizedName.length > 80) {
    return 'Informe um nome com no máximo 80 caracteres.'
  }

  return ''
}

export function getEmailError(value) {
  return isValidEmail(normalizeEmail(value))
    ? ''
    : 'Informe um e-mail válido, como nome@exemplo.com.'
}

export function getPasswordError(value) {
  const password = String(value ?? '')

  if (password.length < 8) {
    return 'Use pelo menos 8 caracteres.'
  }

  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(password) || !/\d/.test(password)) {
    return 'Inclua pelo menos uma letra e um número.'
  }

  return ''
}

export function validateRegistration(values) {
  const errors = {
    name: getNameError(values.name),
    email: getEmailError(values.email),
    password: getPasswordError(values.password),
    passwordConfirmation:
      values.password === values.passwordConfirmation
        ? ''
        : 'As senhas precisam ser iguais.',
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  )
}

export function validateLogin(values) {
  const errors = {
    email: getEmailError(values.email),
    password: values.password ? '' : 'Informe sua senha.',
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  )
}
