import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home/Home.jsx'
import Catalog from '../pages/Catalog/Catalog.jsx'
import ProductDetails from '../pages/ProductDetails/ProductDetails.jsx'
import Cart from '../pages/Cart/Cart.jsx'
import Checkout from '../pages/Checkout/Checkout.jsx'
import About from '../pages/About/About.jsx'
import Admin from '../pages/Admin/Admin.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default AppRoutes
