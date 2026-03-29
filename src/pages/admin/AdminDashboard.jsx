import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/config'
import { signOut } from 'firebase/auth'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Logged out!')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">🌊 Fresh Wave — Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-orange-500 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition"
        >
          Logout
        </button>
      </nav>

      {/* Dashboard Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-4">
        
        <DashboardCard
          icon="🍽️"
          title="Menu Management"
          description="Add, edit or remove menu items"
          onClick={() => navigate('/admin/menu')}
        />
        <DashboardCard
          icon="📋"
          title="Active Orders"
          description="View and manage current orders"
          onClick={() => navigate('/admin/orders')}
        />
        <DashboardCard
          icon="🔲"
          title="QR Codes"
          description="Generate QR codes for tables"
          onClick={() => navigate('/admin/qr')}
        />
        <DashboardCard
          icon="📊"
          title="Reports"
          description="View sales and analytics"
          onClick={() => navigate('/admin/reports')}
        />
        <DashboardCard
          icon="💬"
          title="Feedback"
          description="View customer feedback"
          onClick={() => navigate('/admin/feedback')}
        />

      </div>
    </div>
  )
}

function DashboardCard({ icon, title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-md hover:border-orange-400 border-2 border-transparent transition"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  )
}