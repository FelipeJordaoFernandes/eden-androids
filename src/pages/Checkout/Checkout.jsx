import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useCart from '../../hooks/useCart.js'
import { formatCurrency } from '../../utils/formatCurrency.js'
import './Checkout.css'

const shippingOptions = [
  {
    id: 'scheduled',
    label: 'Entrega agendada',
    description: 'Transporte especializado, instalação e ativação assistida.',
    estimate: '12 a 18 dias úteis',
    price: 0,
  },
  {
    id: 'priority',
    label: 'Entrega prioritária',
    description: 'Prioridade logística e janela de instalação reduzida.',
    estimate: '7 a 10 dias úteis',
    price: 1890,
  },
]

const paymentOptions = [
  {
    id: 'pix',
    label: 'Pix',
    description: 'Aprovação simulada imediata',
  },
  {
    id: 'card',
    label: 'Cartão',
    description: 'Até 12 parcelas sem juros',
  },
  {
    id: 'invoice',
    label: 'Boleto',
    description: 'Vencimento simulado em 3 dias',
  },
]

const requiredAddressFields = [
  'postalCode',
  'street',
  'addressNumber',
  'neighborhood',
  'city',
  'state',
]

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  document: '',
  postalCode: '',
  street: '',
  addressNumber: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
  shippingId: '',
  paymentMethod: 'pix',
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  installments: '1',
  termsAccepted: false,
}

function onlyDigits(value, maxLength) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

function formatDocument(value) {
  const digits = onlyDigits(value, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value) {
  const digits = onlyDigits(value, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function formatPostalCode(value) {
  return onlyDigits(value, 8).replace(/(\d{5})(\d)/, '$1-$2')
}

function formatCardNumber(value) {
  return onlyDigits(value, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatCardExpiry(value) {
  return onlyDigits(value, 4).replace(/(\d{2})(\d)/, '$1/$2')
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim())
}

function isValidPhone(value) {
  const digits = onlyDigits(value, 11)

  if (/^(\d)\1+$/.test(digits)) return false

  const areaCode = digits.slice(0, 2)
  const validAreaCodes = new Set([
    '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '21', '22', '24', '27', '28',
    '31', '32', '33', '34', '35', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55',
    '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '71', '73', '74', '75', '77', '79',
    '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '91', '92', '93', '94', '95', '96', '97', '98', '99',
  ])
  const subscriberNumber = digits.slice(2)
  const isLandline = /^([2-5])\d{7}$/.test(subscriberNumber)
  const isMobile = /^9\d{8}$/.test(subscriberNumber)

  return validAreaCodes.has(areaCode) && (isLandline || isMobile)
}

function calculateCpfDigit(baseDigits) {
  const sum = baseDigits.reduce(
    (total, digit, index) => total + Number(digit) * (baseDigits.length + 1 - index),
    0,
  )
  const remainder = (sum * 10) % 11

  return remainder === 10 ? 0 : remainder
}

function isValidCpf(value) {
  const digits = onlyDigits(value, 11)

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false

  const firstNineDigits = digits.slice(0, 9).split('')
  const firstCheckDigit = calculateCpfDigit(firstNineDigits)
  const firstTenDigits = [...firstNineDigits, String(firstCheckDigit)]
  const secondCheckDigit = calculateCpfDigit(firstTenDigits)

  return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`)
}

function getCustomerFieldError(name, value) {
  if (name === 'email' && !isValidEmail(value)) {
    return 'Informe um e-mail válido, como nome@exemplo.com.'
  }

  if (name === 'phone' && !isValidPhone(value)) {
    return 'Informe um telefone válido com DDD.'
  }

  if (name === 'document' && !isValidCpf(value)) {
    return 'Informe um CPF válido.'
  }

  return ''
}

function createOrderNumber() {
  const now = new Date()
  const dateCode = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0')

  return `EDN-${dateCode}-${sequence}`
}

function Checkout() {
  const titleRef = useRef(null)
  const postalCodeRef = useRef(null)
  const shippingButtonRef = useRef(null)
  const confirmationRef = useRef(null)
  const postalLookupIdRef = useRef(0)
  const [formData, setFormData] = useState(initialFormData)
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
    document: '',
  })
  const [shippingCalculated, setShippingCalculated] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const [shippingCalculationError, setShippingCalculationError] = useState('')
  const [postalCodeResolved, setPostalCodeResolved] = useState(false)
  const [postalLookupNotice, setPostalLookupNotice] = useState('')
  const [isPostalCodeLoading, setIsPostalCodeLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const {
    cartItems,
    clearCart,
    subtotal,
    total,
    totalItems,
    warrantyTotal,
  } = useCart()

  const selectedShipping = useMemo(
    () =>
      shippingOptions.find((option) => option.id === formData.shippingId) ??
      null,
    [formData.shippingId],
  )
  const isAddressComplete =
    postalCodeResolved &&
    requiredAddressFields.every((name) => String(formData[name]).trim())
  const grandTotal = total + (selectedShipping?.price ?? 0)

  useLayoutEffect(() => {
    const root = document.documentElement
    const previousScrollBehavior = root.style.getPropertyValue('scroll-behavior')
    const previousScrollPriority = root.style.getPropertyPriority('scroll-behavior')

    root.style.setProperty('scroll-behavior', 'auto', 'important')
    getComputedStyle(root).getPropertyValue('scroll-behavior')
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    if (previousScrollBehavior) {
      root.style.setProperty(
        'scroll-behavior',
        previousScrollBehavior,
        previousScrollPriority,
      )
    } else {
      root.style.removeProperty('scroll-behavior')
    }

    titleRef.current?.focus({ preventScroll: true })
  }, [])

  useLayoutEffect(() => {
    if (!completedOrder) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    confirmationRef.current?.focus({ preventScroll: true })
  }, [completedOrder])

  function handleFieldChange(event) {
    const { checked, name, type, value } = event.currentTarget
    let nextValue = type === 'checkbox' ? checked : value

    if (name === 'document') nextValue = formatDocument(value)
    if (name === 'phone') nextValue = formatPhone(value)
    if (name === 'postalCode') nextValue = formatPostalCode(value)
    if (name === 'cardNumber') nextValue = formatCardNumber(value)
    if (name === 'cardExpiry') nextValue = formatCardExpiry(value)
    if (name === 'cardCvv') nextValue = onlyDigits(value, 4)
    if (name === 'state') nextValue = value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase()

    const shouldResetShipping = requiredAddressFields.includes(name)

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
      ...(shouldResetShipping ? { shippingId: '' } : {}),
      ...(name === 'postalCode'
        ? {
            street: '',
            addressNumber: '',
            addressComplement: '',
            neighborhood: '',
            city: '',
            state: '',
          }
        : {}),
    }))

    if (shouldResetShipping) {
      setShippingCalculated(false)
      setShippingCalculationError('')
    }

    if (Object.hasOwn(fieldErrors, name) && fieldErrors[name]) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: getCustomerFieldError(name, nextValue),
      }))
    }

    if (name === 'postalCode') {
      postalLookupIdRef.current += 1
      setPostalCodeResolved(false)
      setPostalLookupNotice('')
      setShippingError('')
      setIsPostalCodeLoading(false)

      if (onlyDigits(nextValue, 8).length === 8) {
        void lookupPostalCode(nextValue)
      }
    }
  }

  function handleCustomerFieldBlur(event) {
    const { name, value } = event.currentTarget

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: getCustomerFieldError(name, value),
    }))
  }

  function handleCustomerFieldInvalid(event) {
    event.preventDefault()
    handleCustomerFieldBlur(event)
  }

  async function lookupPostalCode(postalCodeValue) {
    const postalCode = onlyDigits(postalCodeValue, 8)
    const lookupId = postalLookupIdRef.current + 1
    postalLookupIdRef.current = lookupId
    setIsPostalCodeLoading(true)
    setPostalCodeResolved(false)
    setPostalLookupNotice('')
    setShippingCalculated(false)
    setShippingError('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`)

      if (!response.ok) throw new Error('postal-code-request-failed')

      const address = await response.json()

      if (postalLookupIdRef.current !== lookupId) return

      if (address.erro) {
        setShippingError('CEP não encontrado. Confira os números informados.')
        return
      }

      setFormData((currentData) => ({
        ...currentData,
        postalCode: formatPostalCode(address.cep || postalCode),
        street: address.logradouro || '',
        neighborhood: address.bairro || '',
        city: address.localidade || '',
        state: address.uf || '',
        shippingId: '',
      }))
      setPostalCodeResolved(true)
    } catch {
      if (postalLookupIdRef.current !== lookupId) return

      setPostalCodeResolved(true)
      setPostalLookupNotice(
        'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.',
      )
    } finally {
      if (postalLookupIdRef.current === lookupId) {
        setIsPostalCodeLoading(false)
      }
    }
  }

  function handleCalculateShipping(event) {
    const firstMissingField = requiredAddressFields.find(
      (name) => !String(formData[name]).trim(),
    )

    if (!postalCodeResolved || firstMissingField) {
      setShippingCalculationError(
        'Preencha todas as informações obrigatórias do endereço antes de calcular o frete.',
      )

      if (!postalCodeResolved || firstMissingField === 'postalCode') {
        postalCodeRef.current?.focus()
      } else {
        event.currentTarget.form?.elements[firstMissingField]?.focus()
      }

      return
    }

    setShippingCalculationError('')
    setShippingCalculated(true)
    setFormData((currentData) => ({
      ...currentData,
      shippingId: currentData.shippingId || shippingOptions[0].id,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const customerFieldNames = ['email', 'phone', 'document']
    const customerErrors = Object.fromEntries(
      customerFieldNames.map((name) => [
        name,
        getCustomerFieldError(name, formData[name]),
      ]),
    )
    const firstInvalidField = customerFieldNames.find(
      (name) => customerErrors[name],
    )

    setFieldErrors(customerErrors)

    if (firstInvalidField) {
      event.currentTarget.elements[firstInvalidField]?.focus()
      return
    }

    if (!shippingCalculated || !selectedShipping) {
      setShippingCalculationError(
        'Calcule o frete e selecione uma opção de entrega para continuar.',
      )

      if (postalCodeResolved) {
        shippingButtonRef.current?.focus()
      } else {
        postalCodeRef.current?.focus()
      }

      return
    }

    const payment = paymentOptions.find(
      (option) => option.id === formData.paymentMethod,
    )
    const order = {
      number: createOrderNumber(),
      customerName: formData.fullName,
      email: formData.email,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        modelCode: item.modelCode,
        quantity: item.quantity,
        total: item.itemTotal,
      })),
      paymentLabel: payment?.label ?? 'Pagamento simulado',
      shipping: selectedShipping,
      subtotal,
      warrantyTotal,
      grandTotal,
    }

    setCompletedOrder(order)
    clearCart()
  }

  if (completedOrder) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-confirmation-title">
        <div className="checkout-confirmation">
          <div className="checkout-confirmation-symbol" aria-hidden="true">
            <span>✓</span>
          </div>
          <span className="eyebrow checkout-eyebrow">Simulação concluída</span>
          <h1
            id="checkout-confirmation-title"
            ref={confirmationRef}
            tabIndex={-1}
          >
            Pedido simulado concluído.
          </h1>
          <p>
            Obrigado, {completedOrder.customerName}. O pedido abaixo é apenas
            demonstrativo e nenhuma mensagem foi enviada para{' '}
            <strong>{completedOrder.email}</strong>. Nenhuma cobrança ou entrega
            real será realizada.
          </p>

          <div className="checkout-confirmation-number">
            <span>Número do pedido</span>
            <strong>{completedOrder.number}</strong>
          </div>

          <div className="checkout-confirmation-grid">
            <div>
              <span>Entrega</span>
              <strong>{completedOrder.shipping.label}</strong>
              <small>{completedOrder.shipping.estimate}</small>
            </div>
            <div>
              <span>Pagamento</span>
              <strong>{completedOrder.paymentLabel}</strong>
              <small>Aprovação apenas demonstrativa</small>
            </div>
            <div>
              <span>Total simulado</span>
              <strong>{formatCurrency(completedOrder.grandTotal)}</strong>
              <small>
                {completedOrder.items.length}{' '}
                {completedOrder.items.length === 1 ? 'modelo' : 'modelos'} no pedido
              </small>
            </div>
          </div>

          <div className="checkout-confirmation-actions">
            <Link className="button button-primary" to="/catalog">
              Explorar novos modelos
            </Link>
            <Link className="button button-ghost" to="/">
              Voltar para a home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (cartItems.length === 0) {
    return (
      <section className="checkout-page" aria-labelledby="checkout-title">
        <div className="checkout-empty">
          <span className="eyebrow checkout-eyebrow">Checkout Eden</span>
          <h1 id="checkout-title" ref={titleRef} tabIndex={-1}>
            Seu checkout está vazio.
          </h1>
          <p>
            Adicione ao menos um androide ao carrinho para iniciar a simulação
            de compra.
          </p>
          <Link className="button button-primary" to="/catalog">
            Explorar androides
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <header className="checkout-header">
        <span className="eyebrow checkout-eyebrow">Checkout demonstrativo</span>
        <h1 id="checkout-title" ref={titleRef} tabIndex={-1}>
          Prepare sua unidade Eden.
        </h1>
        <p>
          Complete os dados abaixo para simular a entrega e a ativação dos
          androides selecionados.
        </p>
        <ol className="checkout-progress" aria-label="Etapas do checkout">
          <li><span>01</span> Identificação</li>
          <li><span>02</span> Entrega</li>
          <li><span>03</span> Pagamento</li>
        </ol>
      </header>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-sections">
          <section className="checkout-panel" aria-labelledby="customer-data-title">
            <div className="checkout-panel-heading">
              <span aria-hidden="true">01</span>
              <div>
                <h2 id="customer-data-title">Dados do cliente</h2>
                <p>Usados somente durante esta demonstração.</p>
              </div>
            </div>

            <div className="checkout-fields">
              <label className="checkout-field checkout-field-wide">
                <span>Nome completo</span>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  minLength="3"
                  value={formData.fullName}
                  onChange={handleFieldChange}
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
                  onChange={handleFieldChange}
                  onBlur={handleCustomerFieldBlur}
                  onInvalid={handleCustomerFieldInvalid}
                  required
                />
                {fieldErrors.email && (
                  <small id="email-error" className="checkout-field-error" role="alert">
                    {fieldErrors.email}
                  </small>
                )}
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
                  onChange={handleFieldChange}
                  onBlur={handleCustomerFieldBlur}
                  onInvalid={handleCustomerFieldInvalid}
                  required
                />
                {fieldErrors.phone && (
                  <small id="phone-error" className="checkout-field-error" role="alert">
                    {fieldErrors.phone}
                  </small>
                )}
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
                  onChange={handleFieldChange}
                  onBlur={handleCustomerFieldBlur}
                  onInvalid={handleCustomerFieldInvalid}
                  required
                />
                {fieldErrors.document && (
                  <small id="document-error" className="checkout-field-error" role="alert">
                    {fieldErrors.document}
                  </small>
                )}
              </div>
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="delivery-data-title">
            <div className="checkout-panel-heading">
              <span aria-hidden="true">02</span>
              <div>
                <h2 id="delivery-data-title">Endereço e entrega</h2>
                <p>Escolha a janela de instalação mais conveniente.</p>
              </div>
            </div>

            <div className="checkout-fields">
              <div className="checkout-field checkout-postal-field">
                <label htmlFor="checkout-postal-code">CEP</label>
                <div>
                  <input
                    id="checkout-postal-code"
                    ref={postalCodeRef}
                    type="text"
                    name="postalCode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    minLength="9"
                    placeholder="00000-000"
                    value={formData.postalCode}
                    aria-invalid={shippingError ? 'true' : undefined}
                    aria-describedby={
                      shippingError
                        ? 'shipping-error'
                        : isPostalCodeLoading
                          ? 'postal-code-loading'
                          : postalLookupNotice
                            ? 'postal-lookup-notice'
                            : postalCodeResolved
                              ? 'shipping-success'
                              : undefined
                    }
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                {isPostalCodeLoading && (
                  <small id="postal-code-loading" className="checkout-field-loading" role="status">
                    Buscando endereço…
                  </small>
                )}
                {shippingError && (
                  <small id="shipping-error" className="checkout-field-error" role="alert">
                    {shippingError}
                  </small>
                )}
                {postalLookupNotice && (
                  <small
                    id="postal-lookup-notice"
                    className="checkout-field-notice"
                    role="status"
                  >
                    {postalLookupNotice}
                  </small>
                )}
                {!shippingError && !postalLookupNotice && postalCodeResolved && (
                  <small id="shipping-success" className="checkout-field-success" role="status">
                    CEP encontrado. Confira o endereço e informe o número.
                  </small>
                )}
              </div>
              <label className="checkout-field checkout-field-wide">
                <span>Endereço</span>
                <input
                  type="text"
                  name="street"
                  autoComplete="address-line1"
                  value={formData.street}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Número</span>
                <input
                  type="text"
                  name="addressNumber"
                  autoComplete="address-line2"
                  value={formData.addressNumber}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Complemento <small>(opcional)</small></span>
                <input
                  type="text"
                  name="addressComplement"
                  autoComplete="address-line3"
                  value={formData.addressComplement}
                  onChange={handleFieldChange}
                />
              </label>
              <label className="checkout-field">
                <span>Bairro</span>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="checkout-field">
                <span>Cidade</span>
                <input
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={handleFieldChange}
                  required
                />
              </label>
              <label className="checkout-field checkout-state-field">
                <span>UF</span>
                <input
                  type="text"
                  name="state"
                  autoComplete="address-level1"
                  minLength="2"
                  maxLength="2"
                  value={formData.state}
                  onChange={handleFieldChange}
                  required
                />
              </label>
            </div>

            <div className="checkout-shipping-action">
              <button
                ref={shippingButtonRef}
                className="button button-secondary"
                type="button"
                aria-describedby={
                  isAddressComplete ? undefined : 'shipping-calculation-hint'
                }
                onClick={handleCalculateShipping}
                disabled={!isAddressComplete || isPostalCodeLoading}
              >
                Calcular frete
              </button>
              {!isAddressComplete && (
                <small id="shipping-calculation-hint">
                  Preencha CEP, endereço, número, bairro, cidade e UF para
                  liberar o cálculo.
                </small>
              )}
              {shippingCalculationError && (
                <small className="checkout-field-error" role="alert">
                  {shippingCalculationError}
                </small>
              )}
            </div>

            {shippingCalculated && (
              <fieldset className="checkout-option-group checkout-shipping-options">
                <legend>Opções disponíveis para o CEP informado</legend>
                {shippingOptions.map((option) => (
                  <label className="checkout-option" key={option.id}>
                    <input
                      type="radio"
                      name="shippingId"
                      value={option.id}
                      checked={formData.shippingId === option.id}
                      onChange={handleFieldChange}
                      required
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
            )}
          </section>

          <section className="checkout-panel" aria-labelledby="payment-data-title">
            <div className="checkout-panel-heading">
              <span aria-hidden="true">03</span>
              <div>
                <h2 id="payment-data-title">Pagamento simulado</h2>
                <p>Nenhum dado de pagamento será processado ou enviado.</p>
              </div>
            </div>

            <fieldset className="checkout-option-group checkout-payment-options">
              <legend className="visually-hidden">Forma de pagamento</legend>
              {paymentOptions.map((option) => (
                <label className="checkout-option" key={option.id}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={formData.paymentMethod === option.id}
                    onChange={handleFieldChange}
                  />
                  <span className="checkout-option-marker" aria-hidden="true" />
                  <span className="checkout-option-content">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            {formData.paymentMethod === 'card' && (
              <div className="checkout-card-fields">
                <div className="checkout-fields">
                  <label className="checkout-field checkout-field-wide">
                    <span>Número do cartão fictício</span>
                    <input
                      type="text"
                      name="cardNumber"
                      autoComplete="cc-number"
                      inputMode="numeric"
                      minLength="19"
                      placeholder="0000 0000 0000 0000"
                      value={formData.cardNumber}
                      onChange={handleFieldChange}
                      required
                    />
                  </label>
                  <label className="checkout-field checkout-field-wide">
                    <span>Nome impresso no cartão</span>
                    <input
                      type="text"
                      name="cardName"
                      autoComplete="cc-name"
                      minLength="3"
                      value={formData.cardName}
                      onChange={handleFieldChange}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Validade</span>
                    <input
                      type="text"
                      name="cardExpiry"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      minLength="5"
                      placeholder="MM/AA"
                      value={formData.cardExpiry}
                      onChange={handleFieldChange}
                      required
                    />
                  </label>
                  <label className="checkout-field">
                    <span>CVV</span>
                    <input
                      type="text"
                      name="cardCvv"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      minLength="3"
                      maxLength="4"
                      placeholder="000"
                      value={formData.cardCvv}
                      onChange={handleFieldChange}
                      required
                    />
                  </label>
                  <label className="checkout-field checkout-field-wide">
                    <span>Parcelamento</span>
                    <select
                      name="installments"
                      value={formData.installments}
                      onChange={handleFieldChange}
                    >
                      {[1, 3, 6, 10, 12].map((installments) => (
                        <option value={installments} key={installments}>
                          {installments}x de {formatCurrency(grandTotal / installments)} sem juros
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
          <div className="checkout-summary-heading">
            <span className="eyebrow">Seu pedido</span>
            <h2 id="checkout-summary-title">Resumo</h2>
            <Link className="inline-link" to="/cart">Editar carrinho</Link>
          </div>

          <ul className="checkout-summary-items">
            {cartItems.map((item) => (
              <li key={item.id}>
                <div className={`checkout-summary-visual${item.image ? ' has-image' : ''}`}>
                  {item.image ? (
                    <img src={item.image} alt="" width="1122" height="1402" />
                  ) : (
                    <span aria-hidden="true">{item.modelCode}</span>
                  )}
                  <strong aria-label={`${item.quantity} unidades`}>{item.quantity}</strong>
                </div>
                <div>
                  <span>{item.line}</span>
                  <strong>{item.name}</strong>
                  <small>{item.warrantyDetails.label}</small>
                </div>
                <strong>{formatCurrency(item.itemTotal)}</strong>
              </li>
            ))}
          </ul>

          <dl className="checkout-summary-values">
            <div>
              <dt>Produtos ({totalItems})</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div>
              <dt>Garantias adicionais</dt>
              <dd>{formatCurrency(warrantyTotal)}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>
                {selectedShipping
                  ? selectedShipping.price === 0
                    ? 'Inclusa'
                    : formatCurrency(selectedShipping.price)
                  : 'A calcular'}
              </dd>
            </div>
            <div className="checkout-summary-total">
              <dt>Total</dt>
              <dd>{formatCurrency(grandTotal)}</dd>
            </div>
          </dl>

          <label className="checkout-terms">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleFieldChange}
              required
            />
            <span>
              Confirmo que este é um checkout fictício, sem compra, cobrança ou
              entrega real.
            </span>
          </label>

          <button className="button button-primary checkout-submit" type="submit">
            Concluir pedido simulado
          </button>
          <p className="checkout-security-note">
            <span aria-hidden="true">◇</span>
            Ambiente demonstrativo. Dados pessoais e de pagamento não são
            armazenados; apenas o CEP é consultado no ViaCEP.
          </p>
        </aside>
      </form>
    </section>
  )
}

export default Checkout
