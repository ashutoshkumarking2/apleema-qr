import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ArrowButton from '../ui/ArrowButton'
import Logo from '../ui/Logo'

export default function Navbar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-7 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#usecases" className="transition hover:text-white">Use cases</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!user && (
            <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white sm:inline-flex">
              Log in
            </Link>
          )}
          <ArrowButton dark onClick={() => navigate(user ? '/dashboard' : '/signup')}>
            {user ? 'Dashboard' : 'Get Started'}
          </ArrowButton>
        </div>
      </div>
    </nav>
  )
}