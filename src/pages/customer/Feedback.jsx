import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import toast from 'react-hot-toast'

const RATINGS = [1, 2, 3, 4, 5]

export default function Feedback() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating!')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        orderId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      })
      setSubmitted(true)
      toast.success('Thank you for your feedback!')
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
        <p className="text-6xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
        <p className="text-gray-500 mt-2 text-center">
          Your feedback helps us serve you better!
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-orange-500 text-white px-6 py-5 shadow">
        <h1 className="text-xl font-bold">🌊 Fresh Wave</h1>
        <p className="text-orange-100 text-sm">We'd love your feedback!</p>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">

        {/* Rating */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="font-bold text-gray-800 text-lg mb-2">How was your experience?</h2>
          <p className="text-gray-400 text-sm mb-6">Tap a star to rate</p>
          <div className="flex justify-center gap-3">
            {RATINGS.map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl transition ${
                  star <= rating ? 'opacity-100' : 'opacity-30'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-4 text-orange-500 font-semibold">
              {rating === 5 ? 'Excellent! 🎉' :
               rating === 4 ? 'Great! 😊' :
               rating === 3 ? 'Good 👍' :
               rating === 2 ? 'Could be better 😐' :
               'Sorry to hear that 😔'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl shadow p-6">
          <label className="font-bold text-gray-800">Additional Comments</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tell us more about your experience..."
            rows={4}
            className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition text-lg"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback ⭐'}
        </button>

      </div>
    </div>
  )
}