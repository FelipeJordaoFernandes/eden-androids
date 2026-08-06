export function calculateCheckoutTotal(cartTotal, shippingOption) {
  return cartTotal + (shippingOption?.price ?? 0)
}

export function createOrderNumber(now = new Date(), random = Math.random) {
  const dateCode = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const sequence = String(Math.floor(random() * 10000)).padStart(4, '0')

  return `EDN-${dateCode}-${sequence}`
}

export function createOrderSnapshot({
  cartItems,
  customerName,
  email,
  grandTotal,
  paymentLabel,
  shipping,
  subtotal,
  warrantyTotal,
}) {
  return {
    number: createOrderNumber(),
    customerName,
    email,
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      modelCode: item.modelCode,
      quantity: item.quantity,
      total: item.itemTotal,
    })),
    paymentLabel,
    shipping,
    subtotal,
    warrantyTotal,
    grandTotal,
  }
}
