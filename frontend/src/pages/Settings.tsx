import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/ui/Logo'
import { useAuth } from '../hooks/useAuth'
import { sendOtp, verifyOtp, getGithubAppStatus, beginGithubAppConnect, getGithubAppRepositories, disconnectGithubApp, type GithubAppStatus, type GithubRepository } from '../lib/api'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showConfirm, setShowConfirm] = useState(false)
  const [showGithubDisconnectConfirm, setShowGithubDisconnectConfirm] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [github, setGithub] = useState<GithubAppStatus>({ connected: false })
  const [repositories, setRepositories] = useState<GithubRepository[]>([])
  const [githubBusy, setGithubBusy] = useState(false)
  const [githubError, setGithubError] = useState('')
  const [showRepositories, setShowRepositories] = useState(false)

  useEffect(() => {
    getGithubAppStatus().then(setGithub).catch(e => setGithubError((e as Error).message))
    const params = new URLSearchParams(window.location.search)
    if (params.get('github') === 'connected') { setInfo('GitHub account connected successfully.'); window.history.replaceState({}, '', '/settings') }
    if (params.get('github') === 'error') { setGithubError(params.get('message') || 'GitHub connection failed.'); window.history.replaceState({}, '', '/settings') }
  }, [])

  async function connectGithub() {
    setGithubBusy(true); setGithubError('')
    try { window.location.href = await beginGithubAppConnect() } catch (e) { setGithubError((e as Error).message); setGithubBusy(false) }
  }
  async function loadGithubRepositories() {
    setGithubBusy(true); setGithubError('')
    try { setRepositories(await getGithubAppRepositories()); setShowRepositories(true) } catch (e) { setGithubError((e as Error).message) } finally { setGithubBusy(false) }
  }
  async function removeGithub() {
    setGithubBusy(true)
    setGithubError('')
    try {
      await disconnectGithubApp()
      setGithub({ connected: false })
      setRepositories([])
      setShowRepositories(false)
      setShowGithubDisconnectConfirm(false)
    } catch (e) {
      setGithubError((e as Error).message)
    } finally {
      setGithubBusy(false)
    }
  }

  async function startLogout() {
    setBusy(true)
    setError('')
    setInfo('')

    try {
      await sendOtp('logout')
      setShowConfirm(false)
      setShowOtp(true)
      setInfo(`A logout verification code has been sent to ${user?.email}.`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function confirmLogout(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^\d{6}$/.test(code)) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setBusy(true)

    try {
      await verifyOtp(code, 'logout')
      await logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dots-bg min-h-screen">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link
          to="/dashboard"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          Back to dashboard
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-4xl sm:text-5xl">Settings</h1>
        <p className="mt-2 text-gray-400">Manage your account and security.</p>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <p className="mt-1 text-sm text-gray-400">Your signed-in account information.</p>

          <div className="mt-5 flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-12 w-12 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg text-white">
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-white">{user?.displayName || 'Apleema user'}</p>
              <p className="break-all text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">GitHub App Connection</h2>
          <p className="mt-1 text-sm text-gray-400">Connect GitHub separately to authorize repository access. This does not change your Apleema sign-in method.</p>
          {github.connected ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {github.avatarUrl && <img src={github.avatarUrl} alt="" className="h-10 w-10 rounded-full" />}
              <div className="min-w-0 flex-1"><p className="font-medium text-white">@{github.login}</p><p className="text-xs text-green-400">Connected</p></div>
              <button type="button" disabled={githubBusy} onClick={loadGithubRepositories} className="rounded-xl bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{githubBusy ? 'Loading...' : 'View repositories'}</button>
              <button type="button" disabled={githubBusy} onClick={() => setShowGithubDisconnectConfirm(true)} className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 disabled:opacity-50">Disconnect</button>
            </div>
          ) : <button type="button" disabled={githubBusy} onClick={connectGithub} className="mt-4 rounded-xl bg-[#ff5a1f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{githubBusy ? 'Connecting...' : 'Connect GitHub App'}</button>}
          {githubError && <p className="mt-3 text-sm text-red-400">{githubError}</p>}
          {showRepositories && <div className="mt-4 space-y-2">{repositories.length === 0 ? <p className="text-sm text-gray-400">No repositories were returned.</p> : repositories.map(repo => <div key={repo.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{repo.fullName}</p><p className="text-xs text-gray-500">{repo.description || 'No description'}</p></div><span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-gray-300">{repo.private ? 'Private' : 'Public'}</span></div>)}</div>}
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <p className="mt-1 text-sm text-gray-400">
            Your account uses email verification for sensitive actions.
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 p-4">
            <div>
              <p className="text-sm font-medium text-white">Email verification</p>
              <p className="mt-1 text-xs text-gray-500">Verification code required for logout</p>
            </div>
            <span className="text-xs font-medium text-green-400">Enabled</span>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Session</h2>
          <p className="mt-1 text-sm text-gray-400">
            Sign out of your Apleema account on this device.
          </p>
          <button
            type="button"
            onClick={() => {
              setError('')
              setShowConfirm(true)
            }}
            className="mt-5 rounded-xl border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            Log out
          </button>
        </section>
      </main>

            {showGithubDisconnectConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151519] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Are you sure?
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Do you really want to disconnect your GitHub account from Apleema? Your GitHub repository access will be removed. Your Apleema account will remain connected.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={githubBusy}
                onClick={() => setShowGithubDisconnectConfirm(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={githubBusy}
                onClick={removeGithub}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {githubBusy ? 'Disconnecting...' : 'Yes, Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
{showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151519] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">Are you sure you want to log out?</h2>
            <p className="mt-3 text-sm text-gray-400">
              We will send a 6-digit verification code to your registered email address.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs text-gray-500">Verified account email</p>
              <p className="mt-1 break-all text-sm font-medium text-white">
                {user?.email || 'Email unavailable'}
              </p>
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !user?.email}
                onClick={startLogout}
                className="rounded-xl bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? 'Sending code...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={confirmLogout}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151519] p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white">Verify your logout</h2>
            <p className="mt-3 break-all text-sm text-gray-400">
              Enter the 6-digit code sent to {user?.email}.
            </p>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              required
              className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-[#ff5a1f]"
            />

            <p className="mt-2 text-xs text-gray-500">
              Code expires in 10 minutes. Never share this code.
            </p>

            {info && <p className="mt-3 text-sm text-green-400">{info}</p>}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowOtp(false)
                  setCode('')
                  setError('')
                  setInfo('')
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="rounded-xl bg-[#ff5a1f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? 'Verifying...' : 'Verify and log out'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

