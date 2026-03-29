import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  { label: 'Admin', icon: '👨‍💼', email: 'admin@freshwave.com' },
  { label: 'Kitchen', icon: '👨‍🍳', email: 'kitchen@freshwave.com' },
  { label: 'Waiter', icon: '🧑‍🍽️', email: 'waiter@freshwave.com' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      if (email === 'kitchen@freshwave.com') {
        navigate('/kitchen')
      } else if (email === 'waiter@freshwave.com') {
        navigate('/waiter')
      } else {
        navigate('/admin')
      }
    } catch (error) {
      toast.error('Invalid email or password!')
    }
    setLoading(false)
  }

  const quickLogin = (roleEmail) => {
    setEmail(roleEmail)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-8 text-center">
          <div className="text-6xl mb-3">🌊</div>
          <h1 className="text-3xl font-bold text-white">Fresh Wave</h1>
          <p className="text-orange-100 mt-1">Restaurant Management System</p>
        </div>

        {/* Quick Role Select */}
        <div className="px-8 pt-6">
          <p className="text-sm font-medium text-gray-500 mb-3 text-center">Quick Login As</p>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(role => (
              <button
                key={role.label}
                onClick={() => quickLogin(role.email)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition ${
                  email === role.email
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 hover:border-orange-200'
                }`}
              >
                <span className="text-2xl">{role.icon}</span>
                <span className="text-xs font-semibold text-gray-600 mt-1">{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition duration-200 text-lg"
          >
            {loading ? '⏳ Logging in...' : 'Login →'}
          </button>
        </div>

      </div>
    </div>
  )
}