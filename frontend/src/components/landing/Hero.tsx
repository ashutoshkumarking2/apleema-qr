import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BarChart3, Check, Globe2, QrCode, ShieldCheck, Smartphone, Zap } from 'lucide-react'
import ArrowButton from '../ui/ArrowButton'
import { useAuth } from '../../hooks/useAuth'

const qrTypes = ['Website', 'Wi-Fi', 'WhatsApp', 'PDF', 'vCard', 'Menu']

const bars = [30, 45, 35, 68, 48, 82, 58, 95, 72, 88, 62, 100]

export default function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const start = () => navigate(user ? '/dashboard' : '/signup')

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-[#ff5a1f]/[0.10] blur-[150px]" />
      <div className="pointer-events-none absolute -left-48 top-56 -z-10 h-96 w-96 rounded-full bg-sky-500/[0.10] blur-[130px]" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ff5a1f]/25 bg-[#ff5a1f]/[0.08] px-4 py-2 text-xs font-medium text-orange-200">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_#ff5a1f]" />
            One platform. Smarter QR experiences.
            <ArrowUpRight size={14} />
          </div>

          <h1 className="font-display text-5xl leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[82px]">
            Turn every scan into
            <span className="block bg-gradient-to-r from-[#ff986f] via-[#ff5a1f] to-[#ffb18e] bg-clip-text text-transparent">
              an opportunity.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
            Create beautiful QR codes, share your experiences and understand how people interact with them — all from one simple workspace.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ArrowButton onClick={start}>
              {user ? 'Open Dashboard' : 'Get Started'}
            </ArrowButton>
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/5">
              Explore features <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#ff8050]" /> Easy to get started</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#ff8050]" /> Account-secured workspace</span>
            <span className="inline-flex items-center gap-2"><Zap size={14} className="text-[#ff8050]" /> Simple QR workflow</span>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111114] p-2 shadow-[0_35px_120px_rgba(0,0,0,0.55)] sm:p-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-6">
              <div>
                <p className="text-sm font-semibold text-white">Your QR workspace</p>
                <p className="mt-1 text-xs text-gray-500">A preview of your Apleema dashboard</p>
              </div>
              <span className="rounded-full border border-[#ff5a1f]/20 bg-[#ff5a1f]/10 px-3 py-1.5 text-[10px] font-medium text-orange-300">PRODUCT PREVIEW</span>
            </div>

            <div className="grid gap-3 p-2 sm:p-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/[0.07] bg-[#17171c] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">QR code overview</p>
                    <p className="mt-1 text-xs text-gray-500">Illustrative dashboard preview</p>
                  </div>
                  <QrCode className="text-[#ff7040]" size={22} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ['Create', 'Custom QR codes', QrCode],
                    ['Customize', 'Colors & styles', Zap],
                    ['Understand', 'Scan insights', BarChart3]
                  ].map(([title, subtitle, Icon]) => {
                    const ItemIcon = Icon as typeof QrCode
                    return (
                      <div key={title as string} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                        <ItemIcon size={19} className="text-[#ff8050]" />
                        <p className="mt-4 text-sm font-semibold text-white">{title as string}</p>
                        <p className="mt-1 text-[11px] text-gray-500">{subtitle as string}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-white/[0.07] bg-[#101014] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-300">Activity preview</p>
                    <span className="text-[10px] text-gray-500">Sample visualization</span>
                  </div>
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {bars.map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#ff5a1f]/50 to-[#ff8050]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.045 }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/[0.07] bg-[#17171c] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">One QR. Many possibilities.</p>
                    <Globe2 size={19} className="text-[#ff8050]" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {qrTypes.map((type) => (
                      <div key={type} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-xs text-gray-300">
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#251710] to-[#17171c] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff5a1f]/15 text-[#ff8050]"><Smartphone size={20} /></div>
                    <div>
                      <p className="text-sm font-semibold text-white">Made for real-world use</p>
                      <p className="mt-1 text-xs text-gray-400">From screen to print</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-gray-400">Build a QR experience for your shop, brand, event, portfolio or next big idea.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}