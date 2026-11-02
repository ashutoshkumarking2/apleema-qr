import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

type Props = { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }

export default function Checkbox({ checked, onChange, children }: Props) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-left text-sm text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 peer-checked:border-[#ff5a1f] peer-checked:bg-[#ff5a1f] peer-focus-visible:ring-2 peer-focus-visible:ring-[#ff5a1f]/50">
        {checked && <Check size={14} className="text-white" />}
      </span>
      <span>{children}</span>
    </label>
  )
}