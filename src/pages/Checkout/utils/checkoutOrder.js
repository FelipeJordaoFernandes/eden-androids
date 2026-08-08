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

export function createAvailableOrderNumber(
  existingNumbers = [],
  now = new Date(),
  random = Math.random,
) {
  const knownNumbers = new Set(existingNumbers)

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = createOrderNumber(now, random)

    if (!knownNumbers.has(candidate)) return candidate
  }

  const numberPrefix = createOrderNumber(now, () => 0).slice(0, -4)

  for (let sequence = 0; sequence < 10000; sequence += 1) {
    const candidate = `${numberPrefix}${String(sequence).padStart(4, '0')}`

    if (!knownNumbers.has(candidate)) return candidate
  }

  throw new Error('Não foi possível gerar um número de pedido disponível.')
}

export function createOrderSnapshot({
  cartItems,
  destination,
  grandTotal,
  orderNumber,
  paymentLabel,
  random = Math.random,
  shipping,
  subtotal,
  warrantyTotal,
  now = new Date(),
}) {
  return {
    number: orderNumber ?? createOrderNumber(now, random),
    createdAt: now.toISOString(),
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      modelCode: item.modelCode,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.price,
      warranty: {
        label: item.warrantyDetails.label,
        value: item.warrantyCost,
      },
    })),
    paymentMethod: paymentLabel,
    shipping: {
      method: shipping.label,
      estimate: shipping.estimate,
      price: shipping.price,
    },
    subtotal,
    warrantyTotal,
    total: grandTotal,
    ...(destination?.city && destination?.state
      ? {
          destination: {
            city: destination.city,
            state: destination.state,
          },
        }
      : {}),
  }
}
