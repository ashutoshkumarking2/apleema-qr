import type { ReactNode } from 'react'
import clsx from 'clsx'

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl border border-white/5 bg-[#14141a]/90 p-5 backdrop-blur', className)}>
      {children}
    </div>
  )
}