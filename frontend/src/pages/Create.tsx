import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'
import {
  createQr,
  getGithubAppStatus,
  beginGithubAppConnect,
  getGithubAppRepositories,
  type GithubAppStatus,
  type GithubRepository,
} from '../lib/api'

type QrType = 'static' | 'dynamic'
type Category = 'url' | 'whatsapp' | 'instagram' | 'text' | 'username' | 'phone' | 'app'

type Design = {
  id: string
  name: string
  theme: string
  foreground: string
  background: string
  accent: string
}

const palettes = [
  { name: 'Classic', fg: '#111111', accents: ['#111111','#222222','#303030','#343434','#181818','#252525','#000000','#292929','#3b3b3b','#202020'] },
  { name: 'Orange & Black', fg: '#171717', accents: ['#ff5a1f','#f97316','#ea580c','#fb923c','#c2410c','#ff6b35','#fd7e14','#e85d04','#ff7a00','#d9480f'] },
  { name: 'Midnight', fg: '#111827', accents: ['#6366f1','#818cf8','#4f46e5','#4338ca','#a5b4fc','#7c3aed','#6d28d9','#8b5cf6','#312e81','#5b21b6'] },
  { name: 'Ocean Blue', fg: '#082f49', accents: ['#0284c7','#0ea5e9','#0369a1','#38bdf8','#2563eb','#1d4ed8','#0891b2','#06b6d4','#155e75','#3b82f6'] },
  { name: 'Royal Purple', fg: '#2e1065', accents: ['#9333ea','#a855f7','#7e22ce','#c084fc','#6b21a8','#8b5cf6','#7c3aed','#d8b4fe','#581c87','#a21caf'] },
  { name: 'Forest Green', fg: '#052e16', accents: ['#16a34a','#15803d','#22c55e','#4ade80','#166534','#059669','#047857','#10b981','#65a30d','#84cc16'] },
  { name: 'Ruby Red', fg: '#450a0a', accents: ['#dc2626','#ef4444','#b91c1c','#f87171','#be123c','#e11d48','#9f1239','#fb7185','#c02626','#991b1b'] },
  { name: 'Golden', fg: '#422006', accents: ['#ca8a04','#eab308','#d97706','#f59e0b','#a16207','#b45309','#fbbf24','#92400e','#c2410c','#854d0e'] },
  { name: 'Rose', fg: '#500724', accents: ['#e11d48','#f43f5e','#be185d','#ec4899','#db2777','#f472b6','#9d174d','#fb7185','#c026d3','#a21caf'] },
  { name: 'Teal', fg: '#042f2e', accents: ['#0d9488','#14b8a6','#0f766e','#2dd4bf','#0891b2','#06b6d4','#115e59','#5eead4','#0e7490','#155e75'] },
  { name: 'Slate', fg: '#0f172a', accents: ['#475569','#64748b','#334155','#94a3b8','#1e293b','#52525b','#71717a','#3f3f46','#78716c','#57534e'] },
  { name: 'Coffee', fg: '#292018', accents: ['#78350f','#92400e','#a16207','#854d0e','#b45309','#9a3412','#c2410c','#713f12','#a0522d','#6f4e37'] },
]

const designs: Design[] = palettes.flatMap((palette, paletteIndex) =>
  palette.accents.map((accent, variationIndex) => ({
    id: `${paletteIndex}-${variationIndex}`,
    name: paletteIndex === 0 && variationIndex === 0
      ? 'Classic Black & White'
      : paletteIndex === 1 && variationIndex === 0
        ? 'Orange & Black'
        : `${palette.name} ${variationIndex + 1}`,
    theme: palette.name,
    foreground: palette.fg,
    background: '#ffffff',
    accent,
  }))
)

export default function Create() {
  const previewRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState<QrType>('static')
  const [category, setCategory] = useState<Category>('url')
  const [content, setContent] = useState('')
  const [selectedId, setSelectedId] = useState('0-0')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [githubStatus, setGithubStatus] = useState<GithubAppStatus | null>(null)
  const [githubRepositories, setGithubRepositories] = useState<GithubRepository[]>([])
  const [githubRepositoryId, setGithubRepositoryId] = useState<number | ''>('')
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState('')

  useEffect(() => {
    let active = true
    getGithubAppStatus()
      .then(async status => {
        if (!active) return
        setGithubStatus(status)
        if (status.connected) {
          setGithubLoading(true)
          try {
            const repositories = await getGithubAppRepositories()
            if (active) setGithubRepositories(repositories)
          } catch (e) {
            if (active) setGithubError((e as Error).message || 'Could not load repositories.')
          } finally {
            if (active) setGithubLoading(false)
          }
        }
      })
      .catch(e => {
        if (active) setGithubError((e as Error).message || 'Could not check GitHub connection.')
      })
    return () => { active = false }
  }, [])

  async function connectGithub() {
    setGithubError('')
    try {
      const url = await beginGithubAppConnect()
      window.location.assign(url)
    } catch (e) {
      setGithubError((e as Error).message || 'Could not start GitHub connection.')
    }
  }

  async function reloadGithubRepositories() {
    setGithubLoading(true)
    setGithubError('')
    try {
      setGithubRepositories(await getGithubAppRepositories())
    } catch (e) {
      setGithubError((e as Error).message || 'Could not load repositories.')
    } finally {
      setGithubLoading(false)
    }
  }

  const selectedDesign = designs.find(d => d.id === selectedId) || designs[0]

  const filteredDesigns = useMemo(() => {
    const query = search.trim().toLowerCase()
    return designs.filter(d =>
      !query ||
      d.name.toLowerCase().includes(query) ||
      d.theme.toLowerCase().includes(query)
    )
  }, [search])

  function getQrContent() {
    const value = content.trim()

    if (category === 'whatsapp') {
      const phone = value.replace(/\D/g, '')
      return `https://wa.me/${phone}`
    }

    if (category === 'phone') {
      const phone = value.replace(/[^\d+]/g, '')
      return `tel:${phone}`
    }

    if (category === 'instagram') {
      if (/^https?:\/\//i.test(value)) return value
      const username = value.replace(/^@/, '').replace(/\/$/, '')
      return `https://www.instagram.com/${username}/`
    }

    return value
  }

  const qrContent = getQrContent()

  function getValidation() {
    const value = content.trim()

    if (!value) return { valid: false, message: 'Please enter your content.' }

    if (category === 'url' || category === 'app') {
      try {
        const parsed = new URL(value)
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
        if (category === 'app') {
          const host = parsed.hostname.toLowerCase()
          const allowed = host === 'play.google.com' ||
            host === 'apps.apple.com' ||
            host === 'itunes.apple.com' ||
            host === 'apleema.ai' ||
            host.endsWith('.apleema.ai')
          if (!allowed) return { valid: false, message: 'Use a Google Play, Apple App Store or Apleema app link.' }
        }
        return { valid: true, message: 'Valid link' }
      } catch {
        return { valid: false, message: 'Enter a valid link starting with https:// or http://.' }
      }
    }

    if (category === 'instagram') {
      const isLink = /^https?:\/\//i.test(value)
      if (isLink) {
        try {
          const parsed = new URL(value)
          if (!['instagram.com', 'www.instagram.com'].includes(parsed.hostname.toLowerCase())) throw new Error()
          if (!/^\/[a-zA-Z0-9._]+\/?$/.test(parsed.pathname)) throw new Error()
          return { valid: true, message: 'Valid Instagram profile link' }
        } catch {
          return { valid: false, message: 'Enter a valid Instagram profile URL or username.' }
        }
      }
      if (/^@?[a-zA-Z0-9._]{1,30}$/.test(value)) {
        return { valid: true, message: 'Valid Instagram username' }
      }
      return { valid: false, message: 'Enter a valid Instagram username.' }
    }

    if (category === 'whatsapp' || category === 'phone') {
      const digits = value.replace(/\D/g, '')
      if (digits.length >= 7 && digits.length <= 15) {
        return { valid: true, message: 'Valid phone number' }
      }
      return { valid: false, message: 'Enter a phone number with country code (7–15 digits).' }
    }

    if (category === 'username') {
      return /^[a-zA-Z0-9._-]{2,40}$/.test(value)
        ? { valid: true, message: 'Valid username' }
        : { valid: false, message: 'Use 2–40 letters, numbers, dots, underscores or hyphens.' }
    }

    if (category === 'text') {
      return value.length <= 4096
        ? { valid: true, message: 'Text is ready for QR' }
        : { valid: false, message: 'Text is too long.' }
    }

    return { valid: false, message: 'Unsupported content type.' }
  }

  const validation = getValidation()

  useEffect(() => {
    if (!previewRef.current) return

    const qr = new QRCodeStyling({
      width: 320,
      height: 320,
      type: 'canvas',
      data: qrContent || 'https://apleema.ai',
      margin: 20,
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: {
        color: selectedDesign.foreground,
        type: 'square',
      },
      cornersSquareOptions: {
        color: selectedDesign.accent,
        type: 'square',
      },
      cornersDotOptions: {
        color: selectedDesign.foreground,
        type: 'square',
      },
      backgroundOptions: {
        color: selectedDesign.background,
      },
    })

    qrRef.current = qr
    previewRef.current.innerHTML = ''
    qr.append(previewRef.current)

    return () => {
      if (previewRef.current) previewRef.current.innerHTML = ''
    }
  }, [qrContent, selectedDesign])

  async function saveQr() {
    setError('')
    setSaved(false)

    if (!content.trim()) {
      setError('Please enter your QR content.')
      return
    }

    const currentValidation = getValidation()
    if (!currentValidation.valid) {
      setError(currentValidation.message)
      return
    }

    if (type === 'dynamic' && !['url', 'instagram', 'app'].includes(category)) {
      setError('Dynamic QR requires a website, Instagram or supported app URL. Use Static QR for phone numbers, usernames and plain text.')
      return
    }

    if (type === 'dynamic' && category === 'url') {
      if (!githubStatus?.connected) {
        setError('Connect your GitHub account before creating a Dynamic Website QR.')
        return
      }
      if (!githubRepositoryId) {
        setError('Please select a GitHub repository for your website QR.')
        return
      }
    }

    setBusy(true)

    try {
      const qr = await createQr({
        name: name.trim() || 'My QR Code',
        type,
        category,
        content: qrContent,
        ...(type === 'dynamic' && category === 'url'
          ? { githubRepositoryId: Number(githubRepositoryId) }
          : {}),
        style: {
          foreground: selectedDesign.foreground,
          background: selectedDesign.background,
          accent: selectedDesign.accent,
          theme: selectedDesign.theme,
          design: selectedDesign.name,
          dots: 'square',
        },
      })

      const finalData =
        type === 'dynamic'
          ? qr.shortUrl
          : qrContent

      if (!finalData) {
        throw new Error('QR destination was not returned by the server.')
      }

      const downloadQr = new QRCodeStyling({
        width: 1000,
        height: 1000,
        type: 'canvas',
        data: finalData,
        margin: 32,
        qrOptions: { errorCorrectionLevel: 'H' },
        dotsOptions: {
          color: selectedDesign.foreground,
          type: 'square',
        },
        cornersSquareOptions: {
          color: selectedDesign.accent,
          type: 'square',
        },
        cornersDotOptions: {
          color: selectedDesign.foreground,
          type: 'square',
        },
        backgroundOptions: {
          color: selectedDesign.background,
        },
      })

      await downloadQr.download({
        name: (name.trim() || 'apleema-qr')
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-'),
        extension: 'png',
      })

      setSaved(true)
    } catch (e) {
      setError((e as Error).message || 'Could not save QR code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            <span className="text-[#ff5a1f]">A</span>pleema
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#ff5a1f]">
            QR Studio
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Create your QR code<span className="text-[#ff5a1f]">.</span>
          </h1>
          <p className="mt-3 text-gray-400">
            Explore 120 colour designs. Create, save and download your QR code.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="space-y-6 rounded-3xl border border-white/10 bg-[#14141a] p-6 sm:p-8">
            <div>
              <label className="mb-2 block text-sm text-gray-300">QR name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="My website QR"
                maxLength={80}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ff5a1f]"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm text-gray-300">QR type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['static', 'dynamic'] as const).map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={`rounded-xl border p-4 text-left transition ${
                      type === item
                        ? 'border-[#ff5a1f] bg-[#ff5a1f]/10'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <span className="block font-semibold capitalize">{item} QR</span>
                    <span className="mt-1 block text-xs text-gray-400">
                      {item === 'static'
                        ? 'Permanent content'
                        : 'Editable destination and scan tracking'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Content type</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none focus:border-[#ff5a1f]"
              >
                <option value="url">Website URL</option>
                <option value="instagram">Instagram profile link / username</option>
                <option value="username">Username</option>
                <option value="whatsapp">WhatsApp number</option>
                <option value="phone">Phone number (Dialer)</option>
                <option value="app">App link (Play Store / App Store)</option>
                <option value="text">Plain text</option>
              </select>
            </div>

            {type === 'dynamic' && category === 'url' && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div>
                  <h3 className="font-semibold">GitHub repository</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Connect GitHub and choose the repository containing your website.
                  </p>
                </div>
                {!githubStatus?.connected ? (
                  <button type="button" onClick={connectGithub}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-medium hover:bg-white/10">
                    Connect GitHub
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-green-400">Connected as @{githubStatus.login || 'GitHub user'}</span>
                      <button type="button" onClick={reloadGithubRepositories} disabled={githubLoading}
                        className="text-[#ff5a1f] hover:underline disabled:opacity-50">Refresh</button>
                    </div>
                    <select value={githubRepositoryId}
                      onChange={e => setGithubRepositoryId(e.target.value ? Number(e.target.value) : '')}
                      disabled={githubLoading || githubRepositories.length === 0}
                      className="w-full rounded-xl border border-white/10 bg-[#0b0b0f] px-4 py-3 text-white outline-none focus:border-[#ff5a1f] disabled:opacity-50">
                      <option value="">{githubLoading ? 'Loading repositories...' : 'Select a repository'}</option>
                      {githubRepositories.map(repo => (
                        <option key={repo.id} value={repo.id}>
                          {repo.fullName}{repo.private ? ' (Private)' : ' (Public)'}
                        </option>
                      ))}
                    </select>
                    {!githubLoading && githubRepositories.length === 0 && (
                      <p className="text-xs text-gray-400">No accessible repositories found.</p>
                    )}
                  </>
                )}
                {githubError && <p className="text-sm text-red-400">{githubError}</p>}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                {category === 'url'
                  ? 'Website URL'
                  : category === 'whatsapp'
                    ? 'WhatsApp number with country code'
                    : category === 'phone'
                      ? 'Phone number with country code'
                      : category === 'instagram'
                        ? 'Instagram profile URL or username'
                        : category === 'username'
                          ? 'Username'
                          : category === 'app'
                            ? 'Google Play or Apple App Store URL'
                            : 'Your text'}
              </label>
              <textarea
                value={content}
                onChange={e => {
                  setContent(e.target.value)
                  setSaved(false)
                }}
                placeholder={
                  category === 'url'
                    ? 'https://example.com'
                    : category === 'whatsapp'
                      ? 'Enter WhatsApp number'
                      : category === 'phone'
                        ? 'Enter phone number'
                        : category === 'instagram'
                          ? 'https://instagram.com/username'
                          : category === 'username'
                            ? '@yourusername'
                            : category === 'app'
                              ? 'https://play.google.com/store/apps/details?id=...'
                              : 'Enter your message'
                }
                rows={3}
                maxLength={4096}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#ff5a1f]"
              />
              <div className={`mt-2 flex items-center gap-2 text-xs ${
                validation.valid ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>{validation.valid ? '✓' : '!'}</span>
                <span>{validation.message}</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-200">
                    Choose your QR design
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    {designs.length} colour combinations available
                  </p>
                </div>
                <span className="rounded-full bg-[#ff5a1f]/10 px-3 py-1 text-xs font-semibold text-[#ff7b4d]">
                  {filteredDesigns.length} designs
                </span>
              </div>

              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setShowAll(true)
                }}
                placeholder="Search Classic, Orange, Blue, Purple..."
                className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#ff5a1f]"
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(showAll ? filteredDesigns : filteredDesigns.slice(0, 12)).map(design => (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setSelectedId(design.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedId === design.id
                        ? 'border-[#ff5a1f] bg-[#ff5a1f]/10 ring-1 ring-[#ff5a1f]'
                        : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <div
                      className="mb-3 flex h-12 items-center justify-center rounded-lg border border-black/10"
                      style={{ backgroundColor: design.background }}
                    >
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-[2px]"
                            style={{
                              backgroundColor: i === 4 ? design.accent : design.foreground,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="block truncate text-xs font-semibold text-gray-200">
                      {design.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-gray-500">
                      {design.theme}
                    </span>
                    {selectedId === design.id && (
                      <span className="mt-2 block text-[10px] font-bold text-[#ff7b4d]">
                        SELECTED ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {!showAll && filteredDesigns.length > 12 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-[#ff7b4d] hover:bg-white/5"
                >
                  Show all {filteredDesigns.length} designs
                </button>
              )}

              {showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="mt-4 w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                >
                  Show fewer designs
                </button>
              )}

              {filteredDesigns.length === 0 && (
                <p className="py-5 text-center text-sm text-gray-500">
                  No matching designs found.
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            {saved && (
              <p className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                QR saved successfully. PNG download started.
              </p>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={saveQr}
              className="w-full rounded-xl bg-[#ff5a1f] px-5 py-4 font-semibold text-white transition hover:bg-[#e94b12] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving QR...' : 'Save QR & Download PNG'}
            </button>
          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-[#14141a] p-6 lg:sticky lg:top-6">
            <p className="text-sm font-semibold text-gray-300">Live preview</p>

            <div className="mt-5 flex min-h-[310px] items-center justify-center rounded-2xl p-5">
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: selectedDesign.background }}
              >
                <div ref={previewRef} />
              </div>
            </div>

            <p className="mt-5 text-center text-sm font-semibold">
              {name || 'My QR Code'}
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              {selectedDesign.name}
            </p>
            <p className="mt-2 text-center text-xs text-gray-500">
              {type === 'dynamic'
                ? 'Dynamic QR • Editable destination'
                : 'Static QR • Permanent content'}
            </p>
            <p className="mt-5 text-center text-xs text-gray-500">
              High error correction and square QR modules are used for reliable scanning.
              Always test before printing.
            </p>
          </aside>
        </div>
      </main>
    </div>
  )
}



