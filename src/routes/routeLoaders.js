export const loadCatalog = () => import('../pages/Catalog/Catalog.jsx')
export const loadProductDetails = () =>
  import('../pages/ProductDetails/ProductDetails.jsx')
export const loadCart = () => import('../pages/Cart/Cart.jsx')
export const loadCheckout = () => import('../pages/Checkout/Checkout.jsx')
export const loadOrders = () => import('../pages/Orders/Orders.jsx')
export const loadOrderDetails = () => import('../pages/Orders/OrderDetails.jsx')
export const loadLogin = () => import('../pages/Auth/Login.jsx')
export const loadRegister = () => import('../pages/Auth/Register.jsx')
export const loadAccount = () => import('../pages/Account/Account.jsx')
export const loadAbout = () => import('../pages/About/About.jsx')
export const loadAdmin = () => import('../pages/Admin/Admin.jsx')
export const loadNotFound = () => import('../pages/NotFound/NotFound.jsx')

const routePreloaders = {
  '/catalog': loadCatalog,
  '/cart': loadCart,
  '/orders': loadOrders,
  '/login': loadLogin,
  '/account': loadAccount,
  '/about': loadAbout,
}

export function preloadRoute(path) {
  routePreloaders[path]?.()
}
