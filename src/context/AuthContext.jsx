import { useCallback, useMemo, useState } from 'react'
import {
  addAccountAddress,
  addAccountPaymentMethod,
  authenticateAccount,
  clearSession,
  deleteAccountAddress,
  deleteAccountPaymentMethod,
  loadCurrentAccount,
  registerAccount,
  setDefaultAccountAddress,
  setDefaultAccountPaymentMethod,
  updateAccountAddress,
  updateAccountProfile,
} from '../services/authStorage.js'
import AuthContext from './authContext.js'

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadCurrentAccount)
  const [isProcessing, setIsProcessing] = useState(false)

  const register = useCallback(async (accountData) => {
    setIsProcessing(true)

    try {
      const result = await registerAccount(accountData)

      if (result.ok) setCurrentUser(result.account)

      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    setIsProcessing(true)

    try {
      const result = await authenticateAccount(credentials)

      if (result.ok) setCurrentUser(result.account)

      return result
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setCurrentUser(null)
  }, [])

  const runAccountUpdate = useCallback(
    (operation) => {
      if (!currentUser) return { ok: false, code: 'account_not_found' }

      const result = operation(currentUser.id)

      if (result.ok) setCurrentUser(result.account)

      return result
    },
    [currentUser],
  )

  const updateProfile = useCallback(
    (profile) =>
      runAccountUpdate((accountId) =>
        updateAccountProfile(accountId, profile),
      ),
    [runAccountUpdate],
  )
  const addAddress = useCallback(
    (address) =>
      runAccountUpdate((accountId) => addAccountAddress(accountId, address)),
    [runAccountUpdate],
  )
  const editAddress = useCallback(
    (addressId, address) =>
      runAccountUpdate((accountId) =>
        updateAccountAddress(accountId, addressId, address),
      ),
    [runAccountUpdate],
  )
  const removeAddress = useCallback(
    (addressId) =>
      runAccountUpdate((accountId) =>
        deleteAccountAddress(accountId, addressId),
      ),
    [runAccountUpdate],
  )
  const selectDefaultAddress = useCallback(
    (addressId) =>
      runAccountUpdate((accountId) =>
        setDefaultAccountAddress(accountId, addressId),
      ),
    [runAccountUpdate],
  )
  const addPaymentMethod = useCallback(
    (card) =>
      runAccountUpdate((accountId) =>
        addAccountPaymentMethod(accountId, card),
      ),
    [runAccountUpdate],
  )
  const removePaymentMethod = useCallback(
    (paymentMethodId) =>
      runAccountUpdate((accountId) =>
        deleteAccountPaymentMethod(accountId, paymentMethodId),
      ),
    [runAccountUpdate],
  )
  const selectDefaultPaymentMethod = useCallback(
    (paymentMethodId) =>
      runAccountUpdate((accountId) =>
        setDefaultAccountPaymentMethod(accountId, paymentMethodId),
      ),
    [runAccountUpdate],
  )

  const contextValue = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isProcessing,
      register,
      login,
      logout,
      addAddress,
      addPaymentMethod,
      editAddress,
      removeAddress,
      removePaymentMethod,
      selectDefaultAddress,
      selectDefaultPaymentMethod,
      updateProfile,
    }),
    [
      addAddress,
      addPaymentMethod,
      currentUser,
      editAddress,
      isProcessing,
      login,
      logout,
      register,
      removeAddress,
      removePaymentMethod,
      selectDefaultAddress,
      selectDefaultPaymentMethod,
      updateProfile,
    ],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export default AuthProvider
