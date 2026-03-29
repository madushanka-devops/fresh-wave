import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomerMenu from './pages/customer/CustomerMenu'
import QRManager from './pages/admin/QRManager'
import Cart from './pages/customer/Cart'
import OrderTracking from './pages/customer/OrderTracking'
import KitchenDashboard from './pages/kitchen/KitchenDashboard'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/qr" element={<QRManager />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/cart/:tableId" element={<Cart />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
      </Routes>
    </>
  )
}

export default App