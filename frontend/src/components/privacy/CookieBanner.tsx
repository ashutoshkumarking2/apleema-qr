import { useEffect, useState } from 'react'
import Button from '../ui/Button'

const KEY = 'apleema_cookie_choice'

export default function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true)
    const show = () => setOpen(true)
    window.addEventListener('open-cookie-banner', show)
    return () => window.removeEventListener('open-cookie-banner', show)
  }, [])

  function choose(choice: 'essential' | 'all') {
    localStorage.setItem(KEY, JSON.stringify({ choice, at: new Date().toISOString() }))
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-[#14141a]/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:gap-5">
        <p className="text-xs leading-relaxed text-gray-300 sm:text-sm">
          We only use essential cookies and storage (for login and your settings). Analytics or ad cookies will only be used if you say yes.{' '}
          <a href="/cookies" className="text-[#ff5a1f] underline">Cookie Policy</a>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => choose('essential')}>Essential only</Button>
          <Button className="flex-1 sm:flex-none" onClick={() => choose('all')}>Accept all</Button>
        </div>
      </div>
    </div>
  )
}