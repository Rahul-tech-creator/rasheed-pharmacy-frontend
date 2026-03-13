import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { PharmacyProvider } from './context/PharmacyContext'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './components/landing/LandingPage'
import CustomerPortal from './components/customer/CustomerPortal'
import OwnerDashboard from './components/owner/OwnerDashboard'
import LoginPage from './components/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/landing/Navbar'
import Footer from './components/landing/Footer'

const MainLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
)

function App() {
  return (
    <AuthProvider>
      <PharmacyProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/customer/*" element={
                  <ProtectedRoute>
                    <CustomerPortal />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="/owner/*" element={
                <ProtectedRoute requireRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </PharmacyProvider>
    </AuthProvider>
  )
}

export default App
