import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  confirmDeleteQr,
  getQrs,
  sendQrDeleteCode,
  sendBulkQrDeleteCode,
  confirmBulkDeleteQrs,
  type QrRecord,
} from '../lib/api'

export default function QrDashboard() {
  const [items, setItems] = useState<QrRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [selected, setSelected] = useState<QrRecord | null>(null)
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sentEmail, setSentEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await getQrs())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function resetVerification() {
    setEmail('')
    setCode('')
    setSentEmail('')
    setError('')
  }

  function openSingleDelete(item: QrRecord) {
    setSelected(item)
    setBulkConfirm(false)
    resetVerification()
    setMenuId(null)
  }

  function openBulkDelete() {
    setBulkMode(true)
    setBulkConfirm(false)
    setMenuId(null)
    resetVerification()
  }

  function closeBulk() {
    setBulkMode(false)
    setBulkConfirm(false)
    setCheckedIds([])
    resetVerification()
  }

  function toggleId(id: string) {
    setCheckedIds(current =>
      current.includes(id) ? current.filter(value => value !== id) : [...current, id]
    )
  }

  function toggleAll() {
    setCheckedIds(current =>
      current.length === items.length ? [] : items.map(item => item.id)
    )
  }

  async function requestCode() {
    setSending(true)
    setError('')
    try {
      const result = bulkConfirm
        ? await sendBulkQrDeleteCode(checkedIds)
        : selected
          ? await sendQrDeleteCode(selected.id)
          : null

      if (result) setSentEmail(result.email)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  async function removeSingle() {
    if (!selected) return
    setDeleting(true)
    setError('')
    try {
      await confirmDeleteQr(selected.id, email, code)
      setItems(current => current.filter(item => item.id !== selected.id))
      setSelected(null)
      resetVerification()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  async function removeBulk() {
    if (!checkedIds.length) return
    setDeleting(true)
    setError('')
    try {
      await confirmBulkDeleteQrs(checkedIds, email, code)
      setItems(current => current.filter(item => !checkedIds.includes(item.id)))
      closeBulk()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const allSelected = items.length > 0 && checkedIds.length === items.length

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Your QR codes</h2>
          <p className="mt-1 text-sm text-gray-400">Manage your saved QR codes and track performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bulkMode && (
            <button onClick={toggleAll} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-200 hover:bg-white/5">
              {allSelected ? 'Deselect all' : 'Select all'}
            </button>
          )}
          <Link to="/create" className="rounded-xl bg-[#ff5a1f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e94b12]">+ Create QR</Link>
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {bulkMode && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 p-4">
          <div>
            <p className="font-semibold text-white">Bulk selection</p>
            <p className="mt-1 text-sm text-gray-400">{checkedIds.length} of {items.length} QR codes selected</p>
          </div>
          <div className="flex gap-2">
            <button onClick={closeBulk} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5">Cancel</button>
            <button disabled={!checkedIds.length} onClick={() => { setBulkConfirm(true); resetVerification() }} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
              Delete selected ({checkedIds.length})
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#14141a] p-8 text-gray-400">Loading your QR codes...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#14141a] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff5a1f]/10 text-2xl text-[#ff5a1f]">▦</div>
          <h3 className="mt-4 text-lg font-semibold">Create your first QR code</h3>
          <p className="mt-2 text-sm text-gray-400">Your saved QR codes will appear here.</p>
          <Link to="/create" className="mt-5 inline-flex rounded-xl bg-[#ff5a1f] px-5 py-3 font-semibold text-white">Create QR code</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <article key={item.id} className={`group relative rounded-2xl border bg-[#14141a] p-5 transition hover:bg-[#19191f] ${checkedIds.includes(item.id) ? 'border-[#ff5a1f]' : 'border-white/10 hover:border-[#ff5a1f]/60'}`}>
              {bulkMode && (
                <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={checkedIds.includes(item.id)} onChange={() => toggleId(item.id)} className="h-4 w-4 accent-[#ff5a1f]" />
                  Select QR
                </label>
              )}

              <Link to={bulkMode ? '#' : `/qr/${encodeURIComponent(item.id)}`} onClick={e => { if (bulkMode) e.preventDefault() }} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold group-hover:text-[#ff8a5f]">{item.name}</h3>
                    <p className="mt-1 text-xs capitalize text-gray-500">{item.type} · {item.category}</p>
                  </div>
                  <span className="rounded-full bg-[#ff5a1f]/10 px-3 py-1 text-xs text-[#ff8a5f]">{item.type}</span>
                </div>
                <p className="mt-4 break-all text-xs text-gray-400">{item.content}</p>
                {item.shortUrl && <p className="mt-2 break-all text-xs text-[#ff8a5f]">{item.shortUrl}</p>}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm font-medium text-white">{item.scanCount || 0} scans</span>
                  <span className="text-xs text-[#ff5a1f]">View analytics →</span>
                </div>
              </Link>

              {!bulkMode && (
                <div className="relative mt-3 flex justify-end">
                  <button onClick={() => setMenuId(current => current === item.id ? null : item.id)} className="rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    Delete ▾
                  </button>
                  {menuId === item.id && (
                    <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-white/10 bg-[#202027] p-2 shadow-2xl">
                      <button onClick={() => openSingleDelete(item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-red-300 hover:bg-red-500/10">
                        <span>⌫</span> Delete this QR
                      </button>
                      <button onClick={openBulkDelete} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-gray-200 hover:bg-white/5">
                        <span>▦</span> Bulk delete QR codes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {(selected || bulkConfirm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-qr-title">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17171d] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-xl text-red-400">⌫</div>
            <h3 id="delete-qr-title" className="text-xl font-semibold text-white">
              {bulkConfirm ? `Delete ${checkedIds.length} QR codes?` : 'Permanently delete QR?'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {bulkConfirm
                ? `You selected ${checkedIds.length} QR codes. All selected QR codes and their scan history will be permanently deleted. This cannot be undone.`
                : <>This deletes <strong className="text-white">{selected?.name}</strong> and its scan history. This cannot be undone.</>}
            </p>

            {!sentEmail ? (
              <button disabled={sending} onClick={() => void requestCode()} className="mt-5 w-full rounded-xl bg-[#ff5a1f] px-4 py-3 font-semibold text-white disabled:opacity-50">
                {sending ? 'Sending secure code...' : 'Send one-time code to my email'}
              </button>
            ) : (
              <>
                <p className="mt-4 text-sm text-gray-300">A 6-digit security code was sent to <strong>{sentEmail}</strong>.</p>
                <label className="mt-4 block text-sm text-gray-300">Confirm your account email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Enter your registered email" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#ff5a1f]" />
                <label className="mt-4 block text-sm text-gray-300">Email verification code</label>
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="6-digit code" className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 tracking-[0.3em] text-white outline-none focus:border-[#ff5a1f]" />
                <button disabled={deleting || email.trim().toLowerCase() !== sentEmail.trim().toLowerCase() || code.length !== 6} onClick={() => void (bulkConfirm ? removeBulk() : removeSingle())} className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {deleting ? 'Deleting QR codes and scan history...' : 'Confirm permanent deletion'}
                </button>
                <button disabled={sending} onClick={() => void requestCode()} className="mt-3 w-full text-sm text-[#ff8a5f] disabled:opacity-50">Resend code</button>
              </>
            )}

            {error && <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

            <button onClick={() => { setSelected(null); setBulkConfirm(false); resetVerification() }} className="mt-4 w-full rounded-xl border border-white/15 px-4 py-3 text-sm text-gray-300 hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}
    </section>
  )
}

