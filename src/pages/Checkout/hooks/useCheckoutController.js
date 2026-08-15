import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth.js'
import useCart from '../../../hooks/useCart.js'
import {
  findOrderByNumber,
  loadOrders,
  saveOrder,
} from '../../../services/orderStorage.js'
import { isCustomerProfileComplete } from '../../../utils/customerData.js'
import {
  createInitialCheckoutData,
  paymentOptions,
  shippingOptions,
} from '../checkoutConfig.js'
import {
  calculateCheckoutTotal,
  createAvailableOrderNumber,
  createOrderSnapshot,
} from '../utils/checkoutOrder.js'

function getDefaultItemId(items) {
  return items.find((item) => item.isDefault)?.id ?? items[0]?.id ?? ''
}

function useCheckoutController() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const titleRef = useRef(null)
  const shippingButtonRef = useRef(null)
  const confirmationRef = useRef(null)
  const orderSubmissionRef = useRef(false)
  const [formData, setFormData] = useState(createInitialCheckoutData)
  const { addAddress, addPaymentMethod, currentUser } = useAuth()
  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    getDefaultItemId(currentUser.addresses),
  )
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(() =>
    getDefaultItemId(currentUser.paymentMethods),
  )
  const [shippingCalculated, setShippingCalculated] = useState(false)
  const [shippingCalculationError, setShippingCalculationError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [termsError, setTermsError] = useState('')
  const [completedOrder, setCompletedOrder] = useState(() =>
    findOrderByNumber(searchParams.get('order')),
  )
  const cart = useCart()

  const isProfileComplete = isCustomerProfileComplete(currentUser)
  const selectedAddress =
    currentUser.addresses.find((address) => address.id === selectedAddressId) ?? null
  const selectedPaymentMethod =
    currentUser.paymentMethods.find(
      (method) => method.id === selectedPaymentMethodId,
    ) ?? null
  const selectedShipping =
    shippingOptions.find((option) => option.id === formData.shippingId) ?? null
  const grandTotal = calculateCheckoutTotal(cart.total, selectedShipping)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  useLayoutEffect(() => {
    if (!completedOrder) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    confirmationRef.current?.focus({ preventScroll: true })
  }, [completedOrder])

  function handleFieldChange(event) {
    const { checked, name, type, value } = event.currentTarget

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (name === 'paymentMethod') setPaymentError('')
    if (name === 'termsAccepted') setTermsError('')
  }

  function handleAddressChange(addressId) {
    setSelectedAddressId(addressId)
    setShippingCalculated(false)
    setShippingCalculationError('')
    setFormData((currentData) => ({ ...currentData, shippingId: '' }))
  }

  function handleAddressSave(address) {
    const result = addAddress(address)

    if (result.ok) handleAddressChange(result.value.id)

    return result
  }

  function handlePaymentMethodSave(card) {
    const result = addPaymentMethod(card)

    if (result.ok) {
      setSelectedPaymentMethodId(result.value.id)
      setPaymentError('')
    }

    return result
  }

  function handleCalculateShipping() {
    if (!selectedAddress) {
      setShippingCalculationError(
        'Selecione ou cadastre um endereço antes de calcular o frete.',
      )
      return
    }

    setShippingCalculationError('')
    setShippingCalculated(true)
    setFormData((currentData) => ({
      ...currentData,
      shippingId: currentData.shippingId || shippingOptions[0].id,
    }))
  }

  function handleSubmit() {
    if (!shippingCalculated || !selectedShipping || !selectedAddress) {
      setShippingCalculationError(
        'Calcule o frete e selecione uma opção de entrega para continuar.',
      )
      shippingButtonRef.current?.focus()
      return
    }

    if (formData.paymentMethod === 'card' && !selectedPaymentMethod) {
      setPaymentError('Selecione ou cadastre um cartão fictício para continuar.')
      document.getElementById('checkout-payment-card')?.focus()
      return
    }

    if (!formData.termsAccepted) {
      setTermsError('Confirme a revisão dos dados deste pedido.')
      document.getElementById('checkout-terms')?.focus()
      return
    }

    if (orderSubmissionRef.current) return
    orderSubmissionRef.current = true

    const payment = paymentOptions.find(
      (option) => option.id === formData.paymentMethod,
    )
    const now = new Date()
    const orderNumber = createAvailableOrderNumber(
      loadOrders().map((storedOrder) => storedOrder.number),
      now,
    )
    const order = createOrderSnapshot({
      cartItems: cart.cartItems,
      destination: {
        city: selectedAddress.city,
        state: selectedAddress.state,
      },
      now,
      orderNumber,
      paymentLabel: payment?.orderLabel ?? 'Não informado',
      shipping: selectedShipping,
      subtotal: cart.subtotal,
      warrantyTotal: cart.warrantyTotal,
      grandTotal,
    })
    const persistedOrder = saveOrder(order)

    setCompletedOrder(persistedOrder ?? order)
    navigate(
      `/checkout?order=${encodeURIComponent(
        persistedOrder?.number ?? order.number,
      )}`,
      { replace: true },
    )
    cart.clearCart()
  }

  return {
    cart,
    completedOrder,
    confirmationRef,
    currentUser,
    formData,
    grandTotal,
    handleAddressChange,
    handleAddressSave,
    handleCalculateShipping,
    handleFieldChange,
    handlePaymentMethodSave,
    handleSubmit,
    isProfileComplete,
    paymentError,
    selectedAddress,
    selectedAddressId,
    selectedPaymentMethodId,
    selectedShipping,
    setSelectedPaymentMethodId,
    shippingButtonRef,
    shippingCalculated,
    shippingCalculationError,
    termsError,
    titleRef,
  }
}

export default useCheckoutController
