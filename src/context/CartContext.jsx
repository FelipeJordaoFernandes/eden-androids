import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { products } from '../data/products.js'
import CartContext from './cartContext.js'
import { CART_STORAGE_KEY, warrantyOptions } from './cartConfig.js'

const productById = new Map(products.map((product) => [product.id, product]))

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function getValidProduct(productId) {
  if (!Number.isInteger(productId)) return null

  return productById.get(productId) ?? null
}

function isKnownWarranty(warranty) {
  return Object.hasOwn(warrantyOptions, warranty)
}

function initializeCart() {
  if (typeof window === 'undefined') return []

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY)

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

function cartReducer(state, action) {
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

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, initializeCart)

  useEffect(() => {
    try {
      if (items.length === 0) {
        window.localStorage.removeItem(CART_STORAGE_KEY)
      } else {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      }
    } catch {
      // O carrinho continua disponível em memória quando o armazenamento falha.
    }
  }, [items])

  const cartItems = useMemo(
    () =>
      items.flatMap((item) => {
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
      }),
    [items],
  )

  const totalItems = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )
  const subtotal = useMemo(
    () =>
      roundMoney(
        cartItems.reduce((total, item) => total + item.itemSubtotal, 0),
      ),
    [cartItems],
  )
  const warrantyTotal = useMemo(
    () =>
      roundMoney(
        cartItems.reduce((total, item) => total + item.warrantyCost, 0),
      ),
    [cartItems],
  )
  const total = roundMoney(subtotal + warrantyTotal)

  const addItem = useCallback((productId) => {
    dispatch({ type: 'ADD_ITEM', productId })
  }, [])
  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE_ITEM', productId })
  }, [])
  const incrementItem = useCallback((productId) => {
    dispatch({ type: 'INCREMENT_ITEM', productId })
  }, [])
  const decrementItem = useCallback((productId) => {
    dispatch({ type: 'DECREMENT_ITEM', productId })
  }, [])
  const setQuantity = useCallback((productId, quantity) => {
    dispatch({ type: 'SET_QUANTITY', productId, quantity })
  }, [])
  const setWarranty = useCallback((productId, warranty) => {
    dispatch({ type: 'SET_WARRANTY', productId, warranty })
  }, [])
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])
  const isInCart = useCallback(
    (productId) => items.some((item) => item.productId === productId),
    [items],
  )
  const getItemQuantity = useCallback(
    (productId) =>
      items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items],
  )

  const contextValue = useMemo(
    () => ({
      cartItems,
      totalItems,
      subtotal,
      warrantyTotal,
      total,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      setQuantity,
      setWarranty,
      clearCart,
      isInCart,
      getItemQuantity,
    }),
    [
      addItem,
      cartItems,
      clearCart,
      decrementItem,
      getItemQuantity,
      incrementItem,
      isInCart,
      removeItem,
      setQuantity,
      setWarranty,
      subtotal,
      total,
      totalItems,
      warrantyTotal,
    ],
  )

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  )
}

export default CartProvider
