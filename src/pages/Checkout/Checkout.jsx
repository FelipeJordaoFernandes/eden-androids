import CheckoutHeader from './components/CheckoutHeader.jsx'
import CheckoutSummary from './components/CheckoutSummary.jsx'
import {
  CheckoutConfirmation,
  CheckoutEmpty,
  CheckoutProfileRequired,
} from './components/CheckoutStateViews.jsx'
import DeliverySection from './components/DeliverySection.jsx'
import PaymentSection from './components/PaymentSection.jsx'
import useCheckoutController from './hooks/useCheckoutController.js'
import './Checkout.css'
import './CheckoutSummary.css'
import './CheckoutStates.css'

function Checkout() {
  const checkout = useCheckoutController()

  if (checkout.completedOrder) {
    return (
      <CheckoutConfirmation
        confirmationRef={checkout.confirmationRef}
        order={checkout.completedOrder}
      />
    )
  }

  if (checkout.cart.cartItems.length === 0) {
    return <CheckoutEmpty titleRef={checkout.titleRef} />
  }

  if (!checkout.isProfileComplete) {
    return <CheckoutProfileRequired titleRef={checkout.titleRef} />
  }

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <CheckoutHeader titleRef={checkout.titleRef} />

      <div className="checkout-layout">
        <div className="checkout-sections">
          <DeliverySection
            addresses={checkout.currentUser.addresses}
            formData={checkout.formData}
            onAddressChange={checkout.handleAddressChange}
            onAddressSave={checkout.handleAddressSave}
            onCalculateShipping={checkout.handleCalculateShipping}
            onFieldChange={checkout.handleFieldChange}
            selectedAddressId={checkout.selectedAddressId}
            shippingButtonRef={checkout.shippingButtonRef}
            shippingCalculated={checkout.shippingCalculated}
            shippingCalculationError={checkout.shippingCalculationError}
          />
          <PaymentSection
            formData={checkout.formData}
            grandTotal={checkout.grandTotal}
            onCardSave={checkout.handlePaymentMethodSave}
            onFieldChange={checkout.handleFieldChange}
            onPaymentMethodSelect={checkout.setSelectedPaymentMethodId}
            paymentError={checkout.paymentError}
            paymentMethods={checkout.currentUser.paymentMethods}
            selectedPaymentMethodId={checkout.selectedPaymentMethodId}
          />
        </div>

        <CheckoutSummary
          cartItems={checkout.cart.cartItems}
          formData={checkout.formData}
          grandTotal={checkout.grandTotal}
          onFieldChange={checkout.handleFieldChange}
          onSubmit={checkout.handleSubmit}
          selectedShipping={checkout.selectedShipping}
          submissionError={checkout.submissionError}
          submissionErrorRef={checkout.submissionErrorRef}
          subtotal={checkout.cart.subtotal}
          totalItems={checkout.cart.totalItems}
          warrantyTotal={checkout.cart.warrantyTotal}
          termsError={checkout.termsError}
        />
      </div>
    </section>
  )
}

export default Checkout
