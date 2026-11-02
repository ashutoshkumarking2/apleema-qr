import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { saveConsent } from '../lib/utils'

export default function Consent() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [agree, setAgree] = useState(false)

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />

  function accept() {
    saveConsent(user!.uid)
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Your consent" subtitle="Required before you continue, as per India's DPDP Act 2023.">
      <div className="mb-5 space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-gray-300">
        <p><b>Data we collect:</b> your name, email and profile photo.</p>
        <p><b>Why:</b> to run your account and show analytics for your QR codes.</p>
        <p><b>Your rights:</b> access, correct or delete your data, withdraw consent, and file a complaint.</p>
      </div>

      <div className="mb-5">
        <Checkbox checked={agree} onChange={setAgree}>
          I agree to the{' '}
          <a href="/privacy" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Privacy Policy</a>,{' '}
          <a href="/terms" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Terms</a> and{' '}
          <a href="/cookies" target="_blank" rel="noreferrer" className="text-[#ff5a1f] underline">Cookie Policy</a>
          , and I consent to providing my data. This service is for people aged 18 or older.
        </Checkbox>
      </div>

      <div className="space-y-3">
        <Button onClick={accept} disabled={!agree} className="w-full disabled:cursor-not-allowed disabled:opacity-50">
          Agree and continue
        </Button>
        <Button variant="ghost" onClick={() => logout().then(() => navigate('/'))} className="w-full">
          Decline and log out
        </Button>
      </div>
    </AuthLayout>
  )
}