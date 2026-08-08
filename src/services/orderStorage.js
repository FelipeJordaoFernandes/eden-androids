export const ORDER_STORAGE_KEY = 'eden-androids:orders:v1'
export const ORDER_STORAGE_VERSION = 1
export const MAX_STORED_ORDERS = 20

function getDefaultStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value) {
  if (typeof value !== 'string') return null

  const normalizedValue = value.trim()

  return normalizedValue || null
}

function normalizeMoney(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null
}

function normalizeCreatedAt(value) {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) return null

  const timestamp = Date.parse(normalizedValue)

  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
}

function normalizeItem(item) {
  if (!isRecord(item)) return null

  const id = Number.isInteger(item.id) && item.id > 0 ? item.id : null
  const name = normalizeText(item.name)
  const modelCode = normalizeText(item.modelCode)
  const image = normalizeText(item.image)
  const quantity =
    Number.isInteger(item.quantity) && item.quantity > 0
      ? item.quantity
      : null
  const unitPrice = normalizeMoney(item.unitPrice)
  const warranty = isRecord(item.warranty) ? item.warranty : null
  const warrantyLabel = normalizeText(warranty?.label)
  const warrantyValue = normalizeMoney(warranty?.value)

  if (
    id === null ||
    !name ||
    !modelCode ||
    !image ||
    quantity === null ||
    unitPrice === null ||
    !warrantyLabel ||
    warrantyValue === null
  ) {
    return null
  }

  return {
    id,
    name,
    modelCode,
    image,
    quantity,
    unitPrice,
    warranty: {
      label: warrantyLabel,
      value: warrantyValue,
    },
  }
}

function normalizeShipping(shipping) {
  if (!isRecord(shipping)) return null

  const method = normalizeText(shipping.method)
  const estimate = normalizeText(shipping.estimate)
  const price = normalizeMoney(shipping.price)

  if (!method || !estimate || price === null) return null

  return { method, estimate, price }
}

function normalizeDestination(destination) {
  if (!isRecord(destination)) return null

  const city = normalizeText(destination.city)
  const state = normalizeText(destination.state)

  return city && state ? { city, state } : null
}

export function normalizeStoredOrder(order) {
  if (!isRecord(order)) return null

  const number = normalizeText(order.number)
  const createdAt = normalizeCreatedAt(order.createdAt)
  const items = Array.isArray(order.items)
    ? order.items.map(normalizeItem).filter(Boolean)
    : []
  const subtotal = normalizeMoney(order.subtotal)
  const warrantyTotal = normalizeMoney(order.warrantyTotal)
  const shipping = normalizeShipping(order.shipping)
  const total = normalizeMoney(order.total)
  const paymentMethod = normalizeText(order.paymentMethod)
  const destination = normalizeDestination(order.destination)

  if (
    !number ||
    !createdAt ||
    items.length === 0 ||
    subtotal === null ||
    warrantyTotal === null ||
    !shipping ||
    total === null ||
    !paymentMethod
  ) {
    return null
  }

  return {
    number,
    createdAt,
    items,
    subtotal,
    warrantyTotal,
    shipping,
    total,
    paymentMethod,
    ...(destination ? { destination } : {}),
  }
}

export function loadOrders(storage = getDefaultStorage()) {
  if (!storage) return []

  try {
    const storedValue = storage.getItem(ORDER_STORAGE_KEY)

    if (!storedValue) return []

    const parsedValue = JSON.parse(storedValue)

    if (
      !isRecord(parsedValue) ||
      parsedValue.version !== ORDER_STORAGE_VERSION ||
      !Array.isArray(parsedValue.orders)
    ) {
      return []
    }

    const normalizedOrders = parsedValue.orders
      .map(normalizeStoredOrder)
      .filter(Boolean)
      .sort((firstOrder, secondOrder) =>
        secondOrder.createdAt.localeCompare(firstOrder.createdAt),
      )
    const knownNumbers = new Set()

    return normalizedOrders
      .filter((order) => {
        if (knownNumbers.has(order.number)) return false

        knownNumbers.add(order.number)
        return true
      })
      .slice(0, MAX_STORED_ORDERS)
  } catch {
    return []
  }
}

export function saveOrder(order, storage = getDefaultStorage()) {
  if (!storage) return null

  const normalizedOrder = normalizeStoredOrder(order)

  if (!normalizedOrder) return null

  try {
    const currentOrders = loadOrders(storage)
    const existingOrder = currentOrders.find(
      (storedOrder) => storedOrder.number === normalizedOrder.number,
    )

    if (existingOrder) return existingOrder

    const nextOrders = [normalizedOrder, ...currentOrders]
      .sort((firstOrder, secondOrder) =>
        secondOrder.createdAt.localeCompare(firstOrder.createdAt),
      )
      .slice(0, MAX_STORED_ORDERS)

    storage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        version: ORDER_STORAGE_VERSION,
        orders: nextOrders,
      }),
    )

    return normalizedOrder
  } catch {
    return null
  }
}

export function findOrderByNumber(orderNumber, storage = getDefaultStorage()) {
  const normalizedNumber = normalizeText(orderNumber)

  if (!normalizedNumber) return null

  return (
    loadOrders(storage).find((order) => order.number === normalizedNumber) ??
    null
  )
}
