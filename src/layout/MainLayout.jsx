import { useState, useEffect } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import './MainLayout.css'

function MainLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      {isMobile && <BottomNav />}
    </div>
  )
}

export default MainLayout
