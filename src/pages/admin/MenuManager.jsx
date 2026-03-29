import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, updateDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks']

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Mains',
  available: true
}

export default function MenuManager() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'menu'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setItems(data)
    } catch (error) {
      toast.error('Failed to load menu items')
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error('Please fill in all required fields!')
      return
    }
    setSubmitting(true)
    try {
      const data = {
        ...form,
        price: Number(form.price),
        available: form.available
      }
      if (editingId) {
        await updateDoc(doc(db, 'menu', editingId), data)
        toast.success('Item updated!')
        setEditingId(null)
      } else {
        await addDoc(collection(db, 'menu'), data)
        toast.success('Item added!')
      }
      setForm(EMPTY_FORM)
      fetchItems()
    } catch (error) {
      toast.error('Failed to save item')
    }
    setSubmitting(false)
  }

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    })
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deleteDoc(doc(db, 'menu', id))
      toast.success(`"${name}" deleted!`)
      fetchItems()
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const toggleAvailability = async (id, current) => {
    try {
      await updateDoc(doc(db, 'menu', id), { available: !current })
      toast.success(`Item ${!current ? 'enabled' : 'disabled'}!`)
      fetchItems()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🍽️ Menu Manager</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Add / Edit Form */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Item Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grilled Chicken"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Price (Rs.) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 1500"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Available</label>
              <select
                value={form.available}
                onChange={e => setForm({ ...form, available: e.target.value === 'true' })}
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Juicy grilled chicken with herbs"
                className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && (
              <button
                onClick={() => { setForm(EMPTY_FORM); setEditingId(null) }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['All', ...CATEGORIES].map(cat => (
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

        {/* Menu Items List */}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.category}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <p className="font-bold text-orange-500">Rs. {item.price}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(item.id, item.available)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                      item.available
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {item.available ? '✅ Available' : '❌ Unavailable'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="flex-1 bg-red-50 text-red-500 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}