import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../../firebase/config'
import { signOut } from 'firebase/auth'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Preparing: 'bg-blue-100 text-blue-700',
  Ready: 'bg-green-100 text-green-700 animate-pulse',
  Served: 'bg-purple-100 text-purple-700'
}

export default function WaiterDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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
      setOrders(data.filter(o => o.status !== 'Served'))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const markServed = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Served'
      })
      toast.success('Order marked as served!')
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  const readyOrders = orders.filter(o => o.status === 'Ready')
  const otherOrders = orders.filter(o => o.status !== 'Ready')

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-xl font-bold">🧑‍🍽️ Waiter Dashboard</h1>
          <p className="text-orange-100 text-xs">Fresh Wave Restaurant</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-orange-500 px-3 py-1 rounded-xl text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {orders.filter(o => o.status === 'Pending').length}
            </p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">
              {orders.filter(o => o.status === 'Preparing').length}
            </p>
            <p className="text-sm text-gray-500">Preparing</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center border-2 border-green-400">
            <p className="text-2xl font-bold text-green-500">
              {readyOrders.length}
            </p>
            <p className="text-sm text-gray-500">Ready to Serve!</p>
          </div>
        </div>

        {/* Ready Orders — Priority Section */}
        {readyOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              🔔 Ready to Serve ({readyOrders.length})
            </h2>
            <div className="space-y-3">
              {readyOrders.map(order => (
                <div key={order.id} className="bg-green-50 border-2 border-green-400 rounded-2xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Table {order.tableName || order.tableId}
                      </h3>
                      <p className="text-sm text-gray-500">{order.customerName}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm animate-pulse">
                      ✅ Ready!
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {order.items.map(item => (
                      <p key={item.id} className="text-sm text-gray-600">
                        {item.name} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={() => markServed(order.id)}
                    className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition"
                  >
                    🎉 Mark as Served
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Orders */}
        {otherOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              📋 Other Active Orders
            </h2>
            <div className="space-y-3">
              {otherOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800">Table {order.tableName || order.tableId}</h3>
                      <p className="text-sm text-gray-400">{order.customerName}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-gray-400 text-lg">No active orders right now!</p>
          </div>
        )}

      </div>
    </div>
  )
}