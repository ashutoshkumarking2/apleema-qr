import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-4 py-8 text-xs text-gray-400 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p>© {new Date().getFullYear()} apleema.ai</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
          <Link to="/cookies" className="hover:text-white">Cookie Policy</Link>
          <button
            type="button"
            className="cursor-pointer hover:text-white"
            onClick={() => window.dispatchEvent(new Event('open-cookie-banner'))}
          >
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  )
}