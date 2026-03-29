import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import CustomerMenu from './pages/customer/CustomerMenu'
import QRManager from './pages/admin/QRManager'
import Cart from './pages/customer/Cart'
import OrderTracking from './pages/customer/OrderTracking'
import KitchenDashboard from './pages/kitchen/KitchenDashboard'
import MenuManager from './pages/admin/MenuManager'
import AdminOrders from './pages/admin/AdminOrders'
import Billing from './pages/admin/Billing'
import Feedback from './pages/customer/Feedback'
import AdminFeedback from './pages/admin/AdminFeedback'
import WaiterDashboard from './pages/waiter/WaiterDashboard'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/qr" element={<QRManager />} />
        <Route path="/admin/menu" element={<MenuManager />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/billing" element={<Billing />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/cart/:tableId" element={<Cart />} />
        <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="/feedback/:orderId" element={<Feedback />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />
        <Route path="/waiter" element={<WaiterDashboard />} />
      </Routes>
    </>
  )
}

export default App