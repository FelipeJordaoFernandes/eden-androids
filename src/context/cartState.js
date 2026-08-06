import { products } from '../data/products.js'
import { CART_STORAGE_KEY, warrantyOptions } from './cartConfig.js'

const productById = new Map(products.map((product) => [product.id, product]))

export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getValidProduct(productId) {
  if (!Number.isInteger(productId)) return null

  return productById.get(productId) ?? null
}

function isKnownWarranty(warranty) {
  return Object.hasOwn(warrantyOptions, warranty)
}

export function initializeCart(
  storage = typeof window === 'undefined' ? null : window.localStorage,
) {
  if (!storage) return []

  try {
    const storedValue = storage.getItem(CART_STORAGE_KEY)

    if (!storedValue) return []

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) return []

    const normalizedItems = new Map()

    parsedValue.forEach((item) => {
      if (!item || typeof item !== 'object') return

      const product = getValidProduct(item.productId)

      if (
        !product ||
        product.stock < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !isKnownWarranty(item.warranty)
      ) {
        return
      }

      const previousItem = normalizedItems.get(product.id)
      const quantity = Math.min(
        (previousItem?.quantity ?? 0) + item.quantity,
        product.stock,
      )

      normalizedItems.set(product.id, {
        productId: product.id,
        quantity,
        warranty: item.warranty,
      })
    })

    return Array.from(normalizedItems.values())
  } catch {
    return []
  }
}

function incrementExistingItem(state, productId) {
  const product = getValidProduct(productId)
  const currentItem = state.find((item) => item.productId === productId)

  if (!product || !currentItem || currentItem.quantity >= product.stock) {
    return state
  }

  return state.map((item) =>
    item.productId === productId
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  )
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const product = getValidProduct(action.productId)

      if (!product || product.stock < 1) return state

      const currentItem = state.find(
        (item) => item.productId === action.productId,
      )

      if (currentItem) return incrementExistingItem(state, action.productId)

      return [
        ...state,
        {
          productId: product.id,
          quantity: 1,
          warranty: 'standard',
        },
      ]
    }

    case 'REMOVE_ITEM':
      return state.filter((item) => item.productId !== action.productId)

    case 'INCREMENT_ITEM':
      return incrementExistingItem(state, action.productId)

    case 'DECREMENT_ITEM': {
      const currentItem = state.find(
        (item) => item.productId === action.productId,
      )

      if (!currentItem || currentItem.quantity <= 1) return state

      return state.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      )
    }

    case 'SET_QUANTITY': {
      const product = getValidProduct(action.productId)
      const currentItem = state.find(
        (item) => item.productId === action.productId,
      )

      if (!product || !currentItem || !Number.isInteger(action.quantity)) {
        return state
      }

      const quantity = Math.min(Math.max(action.quantity, 1), product.stock)

      if (quantity === currentItem.quantity) return state

      return state.map((item) =>
        item.productId === action.productId ? { ...item, quantity } : item,
      )
    }

    case 'SET_WARRANTY': {
      if (!isKnownWarranty(action.warranty)) return state

      const currentItem = state.find(
        (item) => item.productId === action.productId,
      )

      if (!currentItem || currentItem.warranty === action.warranty) return state

      return state.map((item) =>
        item.productId === action.productId
          ? { ...item, warranty: action.warranty }
          : item,
      )
    }

    case 'CLEAR_CART':
      return state.length > 0 ? [] : state

    default:
      return state
  }
}

export function createCartItems(items) {
  return items.flatMap((item) => {
    const product = productById.get(item.productId)

    if (!product) return []

    const warranty = warrantyOptions[item.warranty]
    const itemSubtotal = roundMoney(product.price * item.quantity)
    const warrantyCost = roundMoney(
      product.price * warranty.rate * item.quantity,
    )

    return [
      {
        ...product,
        quantity: item.quantity,
        includedWarranty: product.warranty,
        warranty: item.warranty,
        warrantyDetails: warranty,
        itemSubtotal,
        warrantyCost,
        itemTotal: roundMoney(itemSubtotal + warrantyCost),
      },
    ]
  })
}

export function calculateCartTotals(cartItems) {
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const subtotal = roundMoney(
    cartItems.reduce((total, item) => total + item.itemSubtotal, 0),
  )
  const warrantyTotal = roundMoney(
    cartItems.reduce((total, item) => total + item.warrantyCost, 0),
  )

  return {
    totalItems,
    subtotal,
    warrantyTotal,
    total: roundMoney(subtotal + warrantyTotal),
  }
}
