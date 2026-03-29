import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function AdminFeedback() {
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFeedbacks(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">💬 Customer Feedback</h1>
        <button
          onClick={() => navigate('/admin')}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-orange-500">{avgRating}</p>
            <p className="text-gray-500 mt-1">Average Rating</p>
            <p className="text-2xl mt-1">⭐</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-orange-500">{feedbacks.length}</p>
            <p className="text-gray-500 mt-1">Total Reviews</p>
            <p className="text-2xl mt-1">💬</p>
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">💬</p>
            <p className="text-gray-400">No feedback yet!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb.id} className="bg-white rounded-2xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-yellow-400 text-xl">
                      {'⭐'.repeat(fb.rating)}
                    </p>
                    {fb.comment && (
                      <p className="text-gray-600 mt-2">{fb.comment}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">
                      {fb.createdAt?.toDate().toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-sm">
                    {fb.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}