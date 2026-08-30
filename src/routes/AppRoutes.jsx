import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home/Home.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RouteLoading from './RouteLoading.jsx'
import {
  loadAbout,
  loadAccount,
  loadAdmin,
  loadCart,
  loadCatalog,
  loadCheckout,
  loadLogin,
  loadNotFound,
  loadOrderDetails,
  loadOrders,
  loadProductDetails,
  loadRegister,
} from './routeLoaders.js'

const Catalog = lazy(loadCatalog)
const ProductDetails = lazy(loadProductDetails)
const Cart = lazy(loadCart)
const Checkout = lazy(loadCheckout)
const Orders = lazy(loadOrders)
const OrderDetails = lazy(loadOrderDetails)
const Login = lazy(loadLogin)
const Register = lazy(loadRegister)
const Account = lazy(loadAccount)
const About = lazy(loadAbout)
const Admin = lazy(loadAdmin)
const NotFound = lazy(loadNotFound)

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderNumber" element={<OrderDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
