import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import SocialButton from '../components/ui/SocialButtons'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage } from '../lib/utils'
import { firebaseReady } from '../lib/firebase'
import { clearOtpSession } from '../lib/api'

export default function Login() {
  const { loginGoogle, loginGithub, loginEmail, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function run(fn: () => Promise<unknown>) {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await fn()
      clearOtpSession()
      navigate('/verify-otp')
    } catch (e) {
      setError(authErrorMessage((e as { code?: string }).code))
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    run(() => loginEmail(email, password))
  }

  async function onForgot() {
    setError('')
    setInfo('')
    if (!email) return setError('Enter your email above first, then click "Forgot password".')
    try {
      await resetPassword(email)
      setInfo('A password reset link has been sent to your email.')
    } catch (e) {
      setError(authErrorMessage((e as { code?: string }).code))
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your QR codes and analytics.">
      {!firebaseReady && (
        <p className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
          Firebase keys are missing in .env. Add them and restart the dev server.
        </p>
      )}

      <div className="space-y-3">
        <SocialButton provider="google" disabled={busy} onClick={() => run(loginGoogle)} />
        <SocialButton provider="github" disabled={busy} onClick={() => run(loginGithub)} />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" /> or continue with email <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="text-right">
          <button type="button" onClick={onForgot} className="cursor-pointer text-xs text-gray-400 underline underline-offset-4 hover:text-white">
            Forgot password?
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-green-400">{info}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Please wait...' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        New here?{' '}
        <Link to="/signup" className="text-[#ff5a1f] underline-offset-4 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

