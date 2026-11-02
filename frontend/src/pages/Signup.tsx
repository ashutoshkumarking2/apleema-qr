import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import SocialButton from '../components/ui/SocialButtons'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage, saveConsent } from '../lib/utils'
import { firebaseReady } from '../lib/firebase'
import { clearOtpSession } from '../lib/api'

export default function Signup() {
  const { loginGoogle, loginGithub, signupEmail } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(fn: () => Promise<{ uid: string }>) {
    setError('')
    if (!agree) return setError('Please tick the consent box to continue.')
    setBusy(true)
    try {
      const user = await fn()
      saveConsent(user.uid)
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
    run(() => signupEmail(name, email, password))
  }

  return (
    <AuthLayout title="Create your account" subtitle="Make smart QR codes and track every scan.">
      {!firebaseReady && (
        <p className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
          Firebase keys are missing in .env. Add them and restart the dev server.
        </p>
      )}

      <div className="mb-5 rounded-xl border border-white/5 bg-white/[0.03] p-4">
        <Checkbox checked={agree} onChange={setAgree}>
          I agree to the{' '}
          <a href="/privacy" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Privacy Policy</a>,{' '}
          <a href="/terms" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Terms</a> and{' '}
          <a href="/cookies" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Cookie Policy</a>
          , and I consent to providing my name, email and profile photo to run my account and show QR analytics. This service is for people aged 18 or older. I can withdraw my consent at any time.
        </Checkbox>
      </div>

      <div className="space-y-3">
        <SocialButton provider="google" disabled={busy || !agree} onClick={() => run(loginGoogle)} />
        <SocialButton provider="github" disabled={busy || !agree} onClick={() => run(loginGithub)} />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" /> or sign up with email <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={busy || !agree} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? 'Please wait...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-[#ff5a1f] underline-offset-4 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  )
}

