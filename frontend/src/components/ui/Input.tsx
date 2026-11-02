import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string }

export default function Input({ label, className, ...props }: Props) {
  return (
    <label className="block text-left">
      {label && <span className="mb-1.5 block text-sm text-gray-300">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#ff5a1f] focus:ring-2 focus:ring-[#ff5a1f]/30',
          className
        )}
        {...props}
      />
    </label>
  )
}