import type { ButtonHTMLAttributes } from 'react'
import { ArrowRight } from 'lucide-react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { dark?: boolean }

export default function ArrowButton({ children, className, dark, ...props }: Props) {
  return (
    <button
      className={clsx(
        'group inline-flex cursor-pointer items-center gap-2 rounded-full py-1 pl-4 pr-1 text-xs font-semibold text-white transition hover:brightness-110 sm:gap-3 sm:py-1.5 sm:pl-6 sm:pr-1.5 sm:text-sm',
        dark
          ? 'border border-white/10 bg-[#1a1a20]'
          : 'bg-gradient-to-b from-[#ff7a3d] to-[#ff5a1f] shadow-[0_0_30px_rgba(255,90,31,0.35)]',
        className
      )}
      {...props}
    >
      {children}
      <span
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-0.5 sm:h-9 sm:w-9',
          dark ? 'bg-[#ff5a1f] text-white' : 'bg-white text-black'
        )}
      >
        <ArrowRight size={18} />
      </span>
    </button>
  )
}