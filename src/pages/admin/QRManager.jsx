import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

export default function QRManager() {
  const navigate = useNavigate()
  const [tables, setTables] = useState([])
  const [tableName, setTableName] = useState('')
  const [loading, setLoading] = useState(true)

  const BASE_URL = window.location.origin

  // Fetch tables from Firestore
  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'tables'))
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTables(data)
    } catch (error) {
      toast.error('Failed to load tables')
    }
    setLoading(false)
  }

  // Add new table
  const addTable = async () => {
    if (!tableName.trim()) {
      toast.error('Please enter a table name!')
      return
    }
    try {
      await addDoc(collection(db, 'tables'), {
        name: tableName.trim(),
        createdAt: new Date()
      })
      toast.success(`Table "${tableName}" added!`)
      setTableName('')
      fetchTables()
    } catch (error) {
      toast.error('Failed to add table')
    }
  }

  // Delete table
  const deleteTable = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await deleteDoc(doc(db, 'tables', id))
      toast.success(`Table "${name}" deleted!`)
      fetchTables()
    } catch (error) {
      toast.error('Failed to delete table')
    }
  }

  // Download QR as PNG
  const downloadQR = (tableId, tableName) => {
    const canvas = document.getElementById(`qr-${tableId}`)
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${tableName}-QR.png`
    link.href = url
    link.click()
    toast.success(`QR code downloaded for ${tableName}!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🔲 QR Code Manager</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {/* Add Table */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Table</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTable()}
              placeholder="e.g. Table 1, VIP Table, Garden Table..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={addTable}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              + Add Table
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading tables...</p>
        ) : tables.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🪑</p>
            <p className="text-gray-400 text-lg">No tables yet. Add your first table above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table.id} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">

                {/* Table Name */}
                <h3 className="font-bold text-gray-800 text-lg mb-4">{table.name}</h3>

                {/* QR Code */}
                <QRCodeCanvas
                  id={`qr-${table.id}`}
                  value={`${BASE_URL}/menu/${table.id}`}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />

                {/* URL Label */}
                <p className="text-xs text-gray-400 mt-3 text-center break-all">
                  {BASE_URL}/menu/{table.id}
                </p>

                {/* Buttons */}
                <div className="flex gap-2 mt-4 w-full">
                  <button
                    onClick={() => downloadQR(table.id, table.name)}
                    className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => deleteTable(table.id, table.name)}
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