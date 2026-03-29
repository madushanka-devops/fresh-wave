import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, getDoc, doc} from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

export default function Cart() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [cart, setCart] = useState(location.state?.cart || [])
  const [customerName, setCustomerName] = useState('')
  const [placing, setPlacing] = useState(false)

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const removeItem = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }
  
  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!')
      return
    }
    if (!customerName.trim()) {
      toast.error('Please enter your name!')
      return
    }
    setPlacing(true)
    try {

      // Fetch table name first
      const tableDoc = await getDoc(doc(db, 'tables', tableId))
      const tableName = tableDoc.exists() ? tableDoc.data().name : tableId

      const orderRef = await addDoc(collection(db, 'orders'), {
        tableId,
        tableName,
        customerName: customerName.trim(),
        items: cart,
        total: cartTotal,
        status: 'Pending',
        createdAt: serverTimestamp()
      })
      toast.success('Order placed successfully!')
      navigate(`/order-tracking/${orderRef.id}`)
    } catch (error) {
      toast.error('Failed to place order. Try again!')
      console.error(error)
    }
    setPlacing(false)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-gray-500 text-lg">Your cart is empty!</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          ← Back to Menu
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Header */}
      <div className="bg-orange-500 text-white px-6 py-5 shadow flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white text-xl">←</button>
        <div>
          <h1 className="text-xl font-bold">🛒 Your Order</h1>
          <p className="text-orange-100 text-sm">Table {tableId}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 mt-4">

        {/* Customer Name */}
        <div className="bg-white rounded-2xl shadow p-4">
          <label className="text-sm font-medium text-gray-700">Your Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    Rs. {item.price} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-orange-500">
                    Rs. {item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <p className="font-bold text-gray-800">Total</p>
            <p className="font-bold text-orange-500 text-lg">Rs. {cartTotal}</p>
          </div>
        </div>

      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 shadow-lg">
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition text-lg"
        >
          {placing ? 'Placing Order...' : `Place Order — Rs. ${cartTotal}`}
        </button>
      </div>

    </div>
  )
}