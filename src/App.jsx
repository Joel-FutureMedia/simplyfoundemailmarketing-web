import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Subscribers from './pages/Subscribers'
import CreateNewsletter from './pages/CreateNewsletter'
import NewsletterHistory from './pages/NewsletterHistory'
import Analytics from './pages/Analytics'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscribers"
        element={
          <ProtectedRoute>
            <Layout>
              <Subscribers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-newsletter"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateNewsletter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/newsletters"
        element={
          <ProtectedRoute>
            <Layout>
              <NewsletterHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App

