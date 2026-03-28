/**
 * APP.JSX
 * Root component — sets up routing and global providers
 */

import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingScreen from './components/ui/LoadingScreen'

// Lazy-load pages for performance
const Home          = lazy(() => import('./pages/Home'))
const Vehicles      = lazy(() => import('./pages/Vehicles'))
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'))
const Booking       = lazy(() => import('./pages/Booking'))
const Login         = lazy(() => import('./pages/Login'))
const Register      = lazy(() => import('./pages/Register'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Wishlist      = lazy(() => import('./pages/Wishlist'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'))
const AdminVehicles  = lazy(() => import('./pages/Admin/AdminVehicles'))
const AdminBookings  = lazy(() => import('./pages/Admin/AdminBookings'))
const AdminUsers     = lazy(() => import('./pages/Admin/AdminUsers'))

// ─── Route Guards ──────────────────────────────

// Redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// Redirect to home if not admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <Navigate to="/" replace /> : children
}

// ─── App Content ──────────────────────────────
const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/vehicles"       element={<Vehicles />} />
            <Route path="/vehicles/:id"   element={<VehicleDetail />} />

            {/* Auth */}
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected */}
            <Route path="/book/:id"   element={<PrivateRoute><Booking /></PrivateRoute>} />
            <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/wishlist"   element={<PrivateRoute><Wishlist /></PrivateRoute>} />

            {/* Admin */}
            <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/vehicles" element={<AdminRoute><AdminVehicles /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
            <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

// ─── Root App ─────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1a27',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#0a0a0f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' },
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}
