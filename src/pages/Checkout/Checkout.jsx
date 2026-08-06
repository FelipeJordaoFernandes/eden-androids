import CheckoutHeader from './components/CheckoutHeader.jsx'
import CheckoutSummary from './components/CheckoutSummary.jsx'
import {
  CheckoutConfirmation,
  CheckoutEmpty,
} from './components/CheckoutStateViews.jsx'
import CustomerDataSection from './components/CustomerDataSection.jsx'
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

  return (
    <section className="checkout-page" aria-labelledby="checkout-title">
      <CheckoutHeader titleRef={checkout.titleRef} />

      <form className="checkout-layout" onSubmit={checkout.handleSubmit}>
        <div className="checkout-sections">
          <CustomerDataSection
            fieldErrors={checkout.fieldErrors}
            formData={checkout.formData}
            onFieldBlur={checkout.handleCustomerFieldBlur}
            onFieldChange={checkout.handleFieldChange}
            onFieldInvalid={checkout.handleCustomerFieldInvalid}
          />
          <DeliverySection
            formData={checkout.formData}
            isAddressComplete={checkout.isAddressComplete}
            isPostalCodeLoading={checkout.isPostalCodeLoading}
            onCalculateShipping={checkout.handleCalculateShipping}
            onFieldChange={checkout.handleFieldChange}
            postalCodeRef={checkout.postalCodeRef}
            postalCodeResolved={checkout.postalCodeResolved}
            postalLookupNotice={checkout.postalLookupNotice}
            shippingButtonRef={checkout.shippingButtonRef}
            shippingCalculated={checkout.shippingCalculated}
            shippingCalculationError={checkout.shippingCalculationError}
            shippingError={checkout.shippingError}
          />
          <PaymentSection
            formData={checkout.formData}
            grandTotal={checkout.grandTotal}
            onFieldChange={checkout.handleFieldChange}
          />
        </div>

        <CheckoutSummary
          cartItems={checkout.cart.cartItems}
          formData={checkout.formData}
          grandTotal={checkout.grandTotal}
          onFieldChange={checkout.handleFieldChange}
          selectedShipping={checkout.selectedShipping}
          subtotal={checkout.cart.subtotal}
          totalItems={checkout.cart.totalItems}
          warrantyTotal={checkout.cart.warrantyTotal}
        />
      </form>
    </section>
  )
}

export default Checkout
