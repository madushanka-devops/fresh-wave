import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase/config'

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks']

export default function CustomerMenu() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const q = query(
          collection(db, 'menu'),
          where('available', '==', true)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setMenuItems(items)
      } catch (error) {
        console.error('Error fetching menu:', error)
      }
      setLoading(false)
    }
    fetchMenu()
  }, [])

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory)

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        return prev.map(i => i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === itemId)
      if (exists && exists.quantity > 1) {
        return prev.map(i => i.id === itemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
        )
      }
      return prev.filter(i => i.id !== itemId)
    })
  }

  const getItemQuantity = (itemId) => {
    const item = cart.find(i => i.id === itemId)
    return item ? item.quantity : 0
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-orange-500 text-xl font-semibold animate-pulse">
          Loading menu...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Header */}
      <div className="bg-orange-500 text-white px-6 py-5 shadow">
        <h1 className="text-2xl font-bold">🌊 Fresh Wave</h1>
        <p className="text-orange-100 text-sm">Table {tableId} — Browse & Order</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between">
            <div>

              
              <div className="rounded-xl h-32 overflow-hidden mb-3 bg-orange-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-5xl">🍽️</span>
                </div>
              )}
              </div>

              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
            </div>

            {/* Add/Remove Controls */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-orange-500 font-bold text-lg">
                Rs. {item.price}
              </span>
              {getItemQuantity(item.id) === 0 ? (
                <button
                  onClick={() => addToCart(item)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                >
                  + Add
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-orange-100 text-orange-500 w-8 h-8 rounded-full font-bold hover:bg-orange-200 transition"
                  >
                    −
                  </button>
                  <span className="font-bold text-gray-800 w-4 text-center">
                    {getItemQuantity(item.id)}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-orange-500 text-white w-8 h-8 rounded-full font-bold hover:bg-orange-600 transition"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-lg">
          <div>
            <p className="font-bold">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</p>
            <p className="text-orange-100 text-sm">Rs. {cartTotal}</p>
          </div>
          <button
            onClick={() => navigate(`/cart/${tableId}`, { state: { cart } })}
            className="bg-white text-orange-500 font-bold px-6 py-2 rounded-xl hover:bg-orange-50 transition"
          >
            View Order →
          </button>
        </div>
      )}

    </div>
  )
}