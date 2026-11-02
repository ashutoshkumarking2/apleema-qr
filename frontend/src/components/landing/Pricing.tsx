import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const shared = [
  'QR design options',
  'QR project workspace',
  'Account-secured access',
  'Simple creation workflow',
]

const plans = [
  { name: 'Free', price: '0', limit: '20,000', unit: 'free scans', desc: 'Explore Apleema and get started.', cta: 'Start free', popular: false },
  { name: 'Starter', price: '200', limit: '4 Lakh', unit: 'scans / month', desc: 'For small shops and personal projects.', cta: 'Choose Starter', popular: false },
  { name: 'Pro', price: '400', limit: '20 Lakh', unit: 'scans / month', desc: 'For growing brands and campaigns.', cta: 'Choose Pro', popular: true },
  { name: 'Business', price: '1,200', limit: '3 Crore', unit: 'scans / month', desc: 'For larger campaigns and teams.', cta: 'Choose Business', popular: false },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <section id="pricing" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#ff8050]">SIMPLE PLANS</p>
        <h2 className="font-display text-4xl text-white sm:text-5xl">Room to grow.<br /><span className="text-gray-500">Plans for every stage.</span></h2>
        <p className="mt-5 text-sm leading-7 text-gray-400">Explore the plans and choose what suits your QR projects.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.name} className={clsx(
            'relative flex flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1',
            plan.popular
              ? 'border border-[#ff5a1f]/70 bg-gradient-to-b from-[#29180f] to-[#141417] shadow-[0_0_55px_rgba(255,90,31,0.10)]'
              : 'border border-white/10 bg-[#121216]'
          )}>
            {plan.popular && <span className="mb-5 w-fit rounded-full bg-[#ff5a1f] px-3 py-1 text-[10px] font-bold tracking-wider text-white">POPULAR PLAN</span>}
            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="mt-2 min-h-10 text-sm text-gray-400">{plan.desc}</p>
            <p className="mt-6 flex items-end gap-1">
              <span className="font-display text-5xl text-white">₹{plan.price}</span>
              {plan.price !== '0' && <span className="pb-2 text-xs text-gray-500">/ month</span>}
            </p>
            <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-4">
              <p className="text-xl font-semibold text-[#ff8050]">{plan.limit}</p>
              <p className="mt-1 text-xs text-gray-500">{plan.unit}</p>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-300">
              {shared.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#ff8050]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.popular ? 'primary' : 'secondary'}
              className="mt-7 w-full"
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
            >
              {user ? 'Open Dashboard' : plan.cta}
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-7 text-center text-xs leading-6 text-gray-500">Prices shown in INR. Confirm plan limits, billing and availability before enabling payments.</p>
    </section>
  )
}