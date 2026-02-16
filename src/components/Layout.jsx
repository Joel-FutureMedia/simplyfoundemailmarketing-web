import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DashboardIcon, SubscribersIcon, NewsletterIcon, HistoryIcon, AnalyticsIcon } from './Icons'
import { useAuth } from '../contexts/AuthContext'
import logoImage from '../asset/logo.png'

const Layout = ({ children }) => {
  const location = useLocation()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: DashboardIcon },
    { path: '/subscribers', label: 'Subscribers', icon: SubscribersIcon },
    { path: '/create-newsletter', label: 'Create Newsletter', icon: NewsletterIcon },
    { path: '/newsletters', label: 'Newsletter History', icon: HistoryIcon },
    { path: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-600 text-white shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-500">
          <div className="flex flex-col items-center">
            <img 
              src={logoImage} 
              alt="Company Logo" 
              className="w-48 h-auto mb-3 object-contain"
            />
            <p className="text-gray-200 text-xs">Admin Dashboard</p>
          </div>
        </div>
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* User Info and Logout */}
        <div className="p-4 border-t border-gray-500 bg-gray-700">
          <div className="text-gray-300 text-xs mb-2 truncate" title={user?.email}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  )
}

export default Layout

