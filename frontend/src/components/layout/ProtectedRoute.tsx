import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { hasConsent } from '../../lib/utils'
import { checkOtpSession } from '../../lib/api'
import Spinner from '../ui/Spinner'

type OtpState = {
  uid: string | null
  status: 'checking' | 'verified' | 'missing'
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  const [otpState, setOtpState] = useState<OtpState>({
    uid: null,
    status: 'checking',
  })

  useEffect(() => {
    let active = true

    if (loading) return

    if (!user) {
      setOtpState({ uid: null, status: 'missing' })
      return
    }

    setOtpState({ uid: user.uid, status: 'checking' })

    checkOtpSession()
      .then(verified => {
        if (active) {
          setOtpState({
            uid: user.uid,
            status: verified ? 'verified' : 'missing',
          })
        }
      })
      .catch(() => {
        if (active) {
          setOtpState({ uid: user.uid, status: 'missing' })
        }
      })

    return () => {
      active = false
    }
  }, [user?.uid, loading])

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" replace />

  if (otpState.uid !== user.uid || otpState.status === 'checking') {
    return <Spinner />
  }

  if (otpState.status !== 'verified') {
    return <Navigate to="/verify-otp" replace />
  }

  if (!hasConsent(user.uid)) {
    return <Navigate to="/consent" replace />
  }

  return <>{children}</>
}
