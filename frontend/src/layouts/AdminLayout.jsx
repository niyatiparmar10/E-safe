import { Database, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react'
import { Outlet, NavLink, useNavigate } from 'react-router'
import BrandMark from '../components/BrandMark'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'

function AdminLayout() {
  const { logout } = useAuth()
  const { admin } = useMessages()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navigation = [
    { to: '/admin', label: admin.navOverview, Icon: LayoutDashboard, end: true },
    { to: '/admin/data', label: admin.navData, Icon: Database },
  ]

  return (
    <div className="admin-shell">
      <header className="admin-mobile-header"><BrandMark to="/admin" /><button className="logout-action" type="button" onClick={handleLogout}><LogOut size={17} /> {admin.logout}</button></header>
      <aside className="admin-sidebar">
        <BrandMark to="/admin" inverse />
        <nav aria-label="Admin navigation">
          {navigation.map(({ to, label, Icon, end }) => <NavLink className={({ isActive }) => `admin-sidebar__link${isActive ? ' is-active' : ''}`} end={end} key={to} to={to}><Icon size={18} /> {label}</NavLink>)}
        </nav>
        <p className="admin-sidebar__note"><ShieldCheck size={16} /> Review workspace</p>
        <button className="admin-sidebar__logout" type="button" onClick={handleLogout}><LogOut size={17} /> {admin.logout}</button>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}

export default AdminLayout
