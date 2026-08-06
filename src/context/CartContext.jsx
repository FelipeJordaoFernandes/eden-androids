import { useCallback, useEffect, useMemo, useReducer } from 'react'
import CartContext from './cartContext.js'
import { CART_STORAGE_KEY } from './cartConfig.js'
import {
  calculateCartTotals,
  cartReducer,
  createCartItems,
  initializeCart,
} from './cartState.js'

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

  const cartItems = useMemo(() => createCartItems(items), [items])
  const { subtotal, total, totalItems, warrantyTotal } = useMemo(
    () => calculateCartTotals(cartItems),
    [cartItems],
  )

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
