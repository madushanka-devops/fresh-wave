import { useEffect, useState } from 'react'
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Preparing: 'bg-blue-100 text-blue-700 border-blue-200',
  Ready: 'bg-green-100 text-green-700 border-green-200',
  Served: 'bg-purple-100 text-purple-700 border-purple-200'
}

const NEXT_STATUS = {
  Pending: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Served'
}

const NEXT_STATUS_LABEL = {
  Pending: '🍳 Start Preparing',
  Preparing: '✅ Mark as Ready',
  Ready: '🎉 Mark as Served'
}

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  // Real-time orders listener
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

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      })
      toast.success(`Order marked as ${newStatus}!`)
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const filteredOrders = filter === 'All'
    ? orders.filter(o => o.status !== 'Served')
    : orders.filter(o => o.status === filter)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">👨‍🍳 Kitchen Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live</span>
        </div>
      </nav>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto">
        {['All', 'Pending', 'Preparing', 'Ready'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              filter === tab
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="px-6 pb-8">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse mt-16">
            Loading orders...
          </p>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-gray-400 text-lg">No active orders right now!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-5">

                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800">Table {order.tableId}</h3>
                    <p className="text-sm text-gray-400">{order.customerName}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-1 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-semibold text-gray-800">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-3 mb-4 flex justify-between">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="font-bold text-orange-500">Rs. {order.total}</span>
                </div>

                {/* Action Button */}
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                    className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
                  >
                    {NEXT_STATUS_LABEL[order.status]}
                  </button>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}