import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'

const STATUS_STEPS = ['Pending', 'Preparing', 'Ready', 'Served']

const STATUS_INFO = {
  Pending: {
    icon: '⏳',
    message: 'Your order has been received!',
    color: 'text-yellow-500'
  },
  Preparing: {
    icon: '🍳',
    message: 'Kitchen is preparing your order...',
    color: 'text-blue-500'
  },
  Ready: {
    icon: '✅',
    message: 'Your order is ready! Waiter is on the way.',
    color: 'text-green-500'
  },
  Served: {
    icon: '🎉',
    message: 'Enjoy your meal! Thank you.',
    color: 'text-purple-500'
  }
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() })
      }
      setLoading(false)
    })
    return unsubscribe
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-orange-500 text-xl font-semibold animate-pulse">
          Loading your order...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-gray-500">Order not found!</p>
      </div>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const statusInfo = STATUS_INFO[order.status]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-orange-500 text-white px-6 py-5 shadow">
        <h1 className="text-xl font-bold">🌊 Fresh Wave</h1>
        <p className="text-orange-100 text-sm">Order Tracking — Table {order.tableId}</p>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-6xl mb-3">{statusInfo.icon}</p>
          <h2 className={`text-2xl font-bold ${statusInfo.color}`}>
            {order.status}
          </h2>
          <p className="text-gray-500 mt-2">{statusInfo.message}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-6">Order Progress</h3>
          <div className="flex justify-between items-center">
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <p className={`text-xs mt-2 text-center ${
                  index <= currentStep ? 'text-orange-500 font-semibold' : 'text-gray-400'
                }`}>
                  {step}
                </p>
                {index < STATUS_STEPS.length - 1 && (
                  <div className={`h-1 w-full mt-4 ${
                    index < currentStep ? 'bg-orange-500' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Order Details</h3>
          <p className="text-sm text-gray-500 mb-3">
            Customer: <span className="font-semibold text-gray-800">{order.customerName}</span>
          </p>
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} x{item.quantity}</span>
                <span className="font-semibold text-gray-800">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-orange-500">Rs. {order.total}</span>
          </div>
        </div>

      </div>
    </div>
  )
}