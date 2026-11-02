import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { sendOtp, verifyOtp } from '../lib/api'

export default function VerifyOtp() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (seconds <= 0) return

    const timer = window.setTimeout(() => {
      setSeconds(value => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [seconds])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  async function requestCode() {
    if (sending || !user?.email) return

    setError('')
    setInfo('')
    setSending(true)

    try {
      await sendOtp('login')
      setSent(true)
      setCode('')
      setInfo('A verification code has been sent to your email.')
      setSeconds(60)
    } catch (e) {
      const err = e as Error & { wait?: number }
      setError(err.message)

      if (err.wait) setSeconds(err.wait)
    } finally {
      setSending(false)
    }
  }

  async function resendCode() {
    if (sending || seconds > 0) return
    await requestCode()
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!/^\d{6}$/.test(code)) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setBusy(true)

    try {
      await verifyOtp(code, 'login')
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Confirm that you want Apleema to send you a 6-digit security code."
    >
      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-gray-400">Verification email address</p>
        <p className="mt-1 break-all font-medium text-white">
          {user.email || 'No email available'}
        </p>
      </div>

      {!user.email ? (
        <p className="text-sm text-red-400">
          This login provider did not provide an email address. Please use an account with an accessible email.
        </p>
      ) : !sent ? (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-gray-400">
            No verification email will be sent until you confirm below.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="button"
            disabled={sending}
            onClick={requestCode}
            className="w-full"
          >
            {sending
              ? 'Sending verification code...'
              : 'Yes, Apleema, give me a verification code'}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-gray-300">
            6-digit verification code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-[#ff5a1f]"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {info && <p className="text-sm text-green-400">{info}</p>}

          <p className="text-xs text-gray-500">
            Code expires in 10 minutes. Never share your code.
          </p>

          <Button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full"
          >
            {busy ? 'Verifying...' : 'Verify and continue'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              disabled={sending || seconds > 0}
              onClick={resendCode}
              className="text-sm text-[#ff5a1f] disabled:opacity-40"
            >
              {sending
                ? 'Sending...'
                : seconds > 0
                  ? `Resend in ${seconds}s`
                  : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
