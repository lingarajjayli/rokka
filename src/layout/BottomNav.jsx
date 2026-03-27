import { Home, Users, Wallet, User, Contact } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, label: 'Dash', path: '/dashboard' },
    { icon: Wallet, label: 'Personal', path: '/personal' },
    { icon: Contact, label: 'Indiv', path: '/individual' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
      <nav className="bg-white/80 backdrop-blur-2xl border border-brand-200/50 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] rounded-3xl px-2 py-3">
        <div className="flex items-center justify-around">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="relative flex flex-col items-center justify-center w-16 group"
              >
                <div className={`flex flex-col items-center justify-center w-full rounded-2xl transition-all duration-300 ${
                  isActive ? 'text-primary-600' : 'text-brand-400 group-hover:text-brand-600 group-hover:-translate-y-1'
                }`}>
                  <div className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-50 shadow-inner' : ''}`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : ''}`} />
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default BottomNav
