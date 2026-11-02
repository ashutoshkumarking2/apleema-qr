import { Utensils, ShoppingBag, Smartphone, CalendarDays, Briefcase, GraduationCap } from 'lucide-react'
import Card from '../ui/Card'

const cases = [
  { icon: Utensils, title: 'Restaurants & cafes', text: 'Give guests a convenient way to open menus, promotions and other digital experiences.' },
  { icon: ShoppingBag, title: 'Retail & stores', text: 'Connect packaging, displays and printed materials to useful online destinations.' },
  { icon: Smartphone, title: 'Apps & creators', text: 'Make it easier for audiences to reach your app, channel, profile or portfolio.' },
  { icon: CalendarDays, title: 'Events & experiences', text: 'Share event information, schedules, registration pages and useful resources.' },
  { icon: Briefcase, title: 'Businesses & teams', text: 'Bring your website, contact details and business resources within easy scanning reach.' },
  { icon: GraduationCap, title: 'Education', text: 'Connect classrooms, learning materials, notices and resources with a simple scan.' },
]

export default function UseCases() {
  return (
    <section id="usecases" className="relative z-10 border-y border-white/[0.05] bg-white/[0.015]">
      <div className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#ff8050]">BUILT FOR MANY MOMENTS</p>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">One scan can open<br /><span className="text-gray-500">a whole new experience.</span></h2>
          <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base">From a small business to a growing brand, make the physical and digital worlds work together.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border border-white/[0.07] bg-[#111114]/80 transition hover:border-[#ff5a1f]/30">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-[#ff8050]"><Icon size={21} /></span>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-400">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}