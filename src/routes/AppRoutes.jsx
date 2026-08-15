import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home/Home.jsx'
import Catalog from '../pages/Catalog/Catalog.jsx'
import ProductDetails from '../pages/ProductDetails/ProductDetails.jsx'
import Cart from '../pages/Cart/Cart.jsx'
import Checkout from '../pages/Checkout/Checkout.jsx'
import About from '../pages/About/About.jsx'
import Admin from '../pages/Admin/Admin.jsx'
import NotFound from '../pages/NotFound/NotFound.jsx'
import Orders from '../pages/Orders/Orders.jsx'
import OrderDetails from '../pages/Orders/OrderDetails.jsx'
import Login from '../pages/Auth/Login.jsx'
import Register from '../pages/Auth/Register.jsx'
import Account from '../pages/Account/Account.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

function AppRoutes() {
  return (
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
  )
}

export default AppRoutes
