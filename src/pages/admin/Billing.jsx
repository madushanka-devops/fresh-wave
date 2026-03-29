import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Billing() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setOrders(data.filter(o => o.status === 'Served'))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const filteredOrders = orders.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.tableId.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)

  const printBill = (order) => {
    const billWindow = window.open('', '_blank')
    billWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${order.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            h1 { text-align: center; color: #f97316; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 1.2em; color: #f97316; }
            .footer { text-align: center; color: #999; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <h1>🌊 Fresh Wave</h1>
          <p style="text-align:center">Table: ${order.tableId}</p>
          <p style="text-align:center">Customer: ${order.customerName}</p>
          <p style="text-align:center">${order.createdAt?.toDate().toLocaleString()}</p>
          <div class="divider"></div>
          ${order.items.map(item => `
            <div class="row">
              <span>${item.name} x${item.quantity}</span>
              <span>Rs. ${item.price * item.quantity}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="row total">
            <span>Total</span>
            <span>Rs. ${order.total}</span>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>🌊 Fresh Wave Restaurant</p>
          </div>
        </body>
      </html>
    `)
    billWindow.document.close()
    billWindow.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">💳 Billing</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Revenue Summary */}
        <div className="bg-orange-500 text-white rounded-2xl shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-orange-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">Rs. {totalRevenue}</p>
            <p className="text-orange-100 text-sm mt-1">{filteredOrders.length} served orders</p>
          </div>
          <span className="text-5xl">💰</span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer name or table..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />

        {/* Bills List */}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading bills...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-gray-400">No completed bills yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">{order.customerName}</h3>
                    <p className="text-sm text-gray-400">Table {order.tableId}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {order.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <p className="font-bold text-orange-500 text-lg">Rs. {order.total}</p>
                </div>

                <div className="space-y-1 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="text-gray-800">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => printBill(order)}
                  className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
                >
                  🖨️ Print Bill
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}