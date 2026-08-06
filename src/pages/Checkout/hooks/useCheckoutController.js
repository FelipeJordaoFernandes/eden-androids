import { useLayoutEffect, useRef, useState } from 'react'
import useCart from '../../../hooks/useCart.js'
import {
  createInitialCheckoutData,
  customerFieldNames,
  emptyAddressFields,
  paymentOptions,
  requiredAddressFields,
  shippingOptions,
} from '../checkoutConfig.js'
import { fetchAddressByPostalCode } from '../services/postalCodeService.js'
import {
  formatCheckoutFieldValue,
  onlyDigits,
} from '../utils/checkoutMasks.js'
import {
  calculateCheckoutTotal,
  createOrderSnapshot,
} from '../utils/checkoutOrder.js'
import {
  getCustomerFieldError,
  isRequiredAddressComplete,
} from '../utils/checkoutValidation.js'

function useCheckoutController() {
  const titleRef = useRef(null)
  const postalCodeRef = useRef(null)
  const shippingButtonRef = useRef(null)
  const confirmationRef = useRef(null)
  const postalLookupIdRef = useRef(0)
  const [formData, setFormData] = useState(createInitialCheckoutData)
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
  const cart = useCart()

  const selectedShipping =
    shippingOptions.find((option) => option.id === formData.shippingId) ?? null
  const isAddressComplete =
    postalCodeResolved &&
    isRequiredAddressComplete(formData, requiredAddressFields)
  const grandTotal = calculateCheckoutTotal(cart.total, selectedShipping)

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
    const nextValue =
      type === 'checkbox'
        ? checked
        : formatCheckoutFieldValue(name, value)
    const shouldResetShipping = requiredAddressFields.includes(name)

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
      ...(shouldResetShipping ? { shippingId: '' } : {}),
      ...(name === 'postalCode' ? emptyAddressFields : {}),
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
    const lookupId = postalLookupIdRef.current + 1
    postalLookupIdRef.current = lookupId
    setIsPostalCodeLoading(true)
    setPostalCodeResolved(false)
    setPostalLookupNotice('')
    setShippingCalculated(false)
    setShippingError('')

    try {
      const address = await fetchAddressByPostalCode(postalCodeValue)

      if (postalLookupIdRef.current !== lookupId) return

      if (!address) {
        setShippingError('CEP não encontrado. Confira os números informados.')
        return
      }

      setFormData((currentData) => ({
        ...currentData,
        ...address,
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
    const order = createOrderSnapshot({
      cartItems: cart.cartItems,
      customerName: formData.fullName,
      email: formData.email,
      paymentLabel: payment?.label ?? 'Pagamento simulado',
      shipping: selectedShipping,
      subtotal: cart.subtotal,
      warrantyTotal: cart.warrantyTotal,
      grandTotal,
    })

    setCompletedOrder(order)
    cart.clearCart()
  }

  return {
    cart,
    completedOrder,
    confirmationRef,
    fieldErrors,
    formData,
    grandTotal,
    handleCalculateShipping,
    handleCustomerFieldBlur,
    handleCustomerFieldInvalid,
    handleFieldChange,
    handleSubmit,
    isAddressComplete,
    isPostalCodeLoading,
    postalCodeRef,
    postalCodeResolved,
    postalLookupNotice,
    selectedShipping,
    shippingButtonRef,
    shippingCalculated,
    shippingCalculationError,
    shippingError,
    titleRef,
  }
}

export default useCheckoutController
