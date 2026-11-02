import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Consent from './pages/Consent'
import Dashboard from './pages/Dashboard'
import Create from './pages/Create'
import QrDetail from './pages/QrDetail'
import VerifyOtp from './pages/VerifyOtp'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Cookies from './pages/Cookies'
import ProtectedRoute from './components/layout/ProtectedRoute'
import CookieBanner from './components/privacy/CookieBanner'

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center text-xl text-gray-400">
      Page not found
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/consent" element={<Consent />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/qr/:id" element={<ProtectedRoute><QrDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <CookieBanner />
    </>
  )
}
