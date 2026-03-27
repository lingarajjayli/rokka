import { Wallet, TrendingUp, Users, CreditCard, User, Contact } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: TrendingUp },
    { label: 'Personal', path: '/personal', icon: CreditCard },
    { label: 'Individual', path: '/individual', icon: Contact },
    { label: 'Groups', path: '/groups', icon: Users },
    { label: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-glow group-hover:scale-105 transition-all duration-300">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-900 to-brand-600 font-heading tracking-tight">
                Rokka
              </h1>
              <p className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em] mt-0.5">Finance</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 h-full">
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`relative flex items-center space-x-2 px-4 h-full text-sm font-medium transition-all duration-300 ${
                    isActive ? 'text-primary-600' : 'text-brand-500 hover:text-brand-900 hover:bg-brand-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-600 to-primary-400 rounded-t-full shadow-[0_-2px_8px_rgba(109,40,217,0.5)] animate-fade-in" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
