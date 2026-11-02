import { Link } from 'react-router-dom'

export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src="/apleemaofficial.png"
        alt="apleema.ai"
        className="h-9 w-auto object-contain"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
      {showText && <span className="text-lg font-semibold tracking-tight">apleema.ai</span>}
    </Link>
  )
}