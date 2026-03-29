import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Preparing: 'bg-blue-100 text-blue-700',
  Ready: 'bg-green-100 text-green-700',
  Served: 'bg-purple-100 text-purple-700'
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

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
      setOrders(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter)

  const totalRevenue = orders
    .filter(o => o.status === 'Served')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">📋 All Orders</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['Pending', 'Preparing', 'Ready', 'Served'].map(status => (
            <div key={status} className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">
                {orders.filter(o => o.status === status).length}
              </p>
              <p className="text-sm text-gray-500">{status}</p>
            </div>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="bg-orange-500 text-white rounded-2xl shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-orange-100 text-sm">Total Revenue (Served Orders)</p>
            <p className="text-3xl font-bold mt-1">Rs. {totalRevenue}</p>
          </div>
          <span className="text-5xl">💰</span>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Pending', 'Preparing', 'Ready', 'Served'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                filter === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-400">No orders found!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800">Table {order.tableName || order.tableId}</h3>
                    <p className="text-sm text-gray-400">{order.customerName}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {order.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x{item.quantity}</span>
                      <span className="text-gray-800 font-semibold">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-orange-500">Rs. {order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}