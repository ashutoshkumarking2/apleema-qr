import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import Footer from './Footer'
import { LEGAL_UPDATED } from '../../lib/legal'

export default function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="dots-bg min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link to="/" className="text-sm text-gray-300 underline underline-offset-4">Home</Link>
      </nav>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-2 text-xs text-gray-500">Last updated: {LEGAL_UPDATED}</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-300 sm:text-base [&_a]:text-[#ff5a1f] [&_a]:underline [&_b]:text-white [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white sm:[&_h2]:text-xl [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}