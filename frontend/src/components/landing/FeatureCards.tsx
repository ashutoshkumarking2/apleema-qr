import { Palette, Activity, Sparkles, RefreshCw, ShieldCheck, Download, Layers, Smartphone, BarChart3 } from 'lucide-react'
import Card from '../ui/Card'

const features = [
  { icon: Palette, tag: 'DESIGN', title: 'Make it unmistakably yours', text: 'Explore QR styles, colors, shapes and frames to create a look that fits your brand.' },
  { icon: Activity, tag: 'INSIGHTS', title: 'Understand scan activity', text: 'Explore scan activity and available analytics from your QR workspace.' },
  { icon: Sparkles, tag: 'CREATION', title: 'A simpler creation workflow', text: 'Create QR experiences with a clear, guided process from start to finish.' },
  { icon: RefreshCw, tag: 'FLEXIBILITY', title: 'Manage your QR projects', text: 'Keep your QR projects organized and manage them from one workspace.' },
  { icon: ShieldCheck, tag: 'CONTROL', title: 'Account-aware access', text: 'Keep your workspace behind your account sign-in and verification flow.' },
  { icon: Download, tag: 'EXPORT', title: 'Ready to share', text: 'Prepare your QR designs for digital sharing and supported download formats.' },
  { icon: Layers, tag: 'WORKSPACE', title: 'Everything in one place', text: 'Access your QR projects, creation tools and settings without switching workflows.' },
  { icon: Smartphone, tag: 'RESPONSIVE', title: 'Works across screens', text: 'Use a responsive workspace on desktop, tablet and mobile devices.' },
  { icon: BarChart3, tag: 'OVERVIEW', title: 'A clearer picture', text: 'Keep useful project information together so it is easier to review and manage.' },
]

export default function FeatureCards() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#ff8050]">THE APLEEMA EXPERIENCE</p>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">More than a QR code.<br /><span className="text-gray-500">A smarter workflow.</span></h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-gray-400">Everything is designed to make creating, organizing and understanding your QR projects feel effortless.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, tag, title, text }, index) => (
          <Card key={title} className="group relative overflow-hidden border border-white/[0.07] bg-[#111114]/80 transition duration-300 hover:-translate-y-1 hover:border-[#ff5a1f]/35 hover:bg-[#17171c]">
            <div className="mb-7 flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ff5a1f]/20 bg-[#ff5a1f]/10 text-[#ff8050] transition group-hover:bg-[#ff5a1f]/20">
                <Icon size={20} />
              </span>
              <span className="text-[10px] tracking-[0.18em] text-gray-600">0{index + 1} / {tag}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-gray-400">{text}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}