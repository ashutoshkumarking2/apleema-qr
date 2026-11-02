import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition',
        variant === 'primary' && 'bg-gradient-to-b from-[#ff7a3d] to-[#ff5a1f] text-white hover:brightness-110',
        variant === 'secondary' && 'border border-white/10 bg-[#1c1c24] text-white hover:bg-[#24242e]',
        variant === 'ghost' && 'text-white underline-offset-4 hover:underline',
        className
      )}
      {...props}
    />
  )
}