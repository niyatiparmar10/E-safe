import { LogOut, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Outlet, useNavigate } from 'react-router'
import BottomNavigation from '../components/BottomNavigation'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

function AppLayout() {
  const { user, logout } = useAuth()
  const prefersReducedMotion = useReducedMotion()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <BrandMark to="/dashboard/home" />
        <div className="app-header__actions">
          <span className="identity-chip"><ShieldCheck size={15} aria-hidden="true" /> {user?.name || 'Demo user'}</span>
          <button className="logout-action" type="button" onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut size={18} />
            <span>{isLoggingOut ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </header>
      <motion.main
        className="app-main"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <Outlet />
      </motion.main>
      <BottomNavigation />
    </div>
  )
}

export default AppLayout
