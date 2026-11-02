import type { ReactNode } from 'react'
import Logo from '../ui/Logo'
import Card from '../ui/Card'

type Props = { title: string; subtitle?: string; children: ReactNode }

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="dots-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-40 top-20 h-[450px] w-[450px] rounded-full bg-[#1f6f9f]/40 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[450px] w-[500px] rounded-full bg-[#ff5a1f]/40 blur-[160px]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <div className="p-2">
            <h1 className="font-display text-4xl">{title}</h1>
            {subtitle && <p className="mb-6 mt-2 text-sm text-gray-400">{subtitle}</p>}
            {children}
          </div>
        </Card>
      </div>
    </div>
  )
}