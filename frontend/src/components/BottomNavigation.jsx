import { History, Home, MapPinned, ScanLine } from 'lucide-react'
import { NavLink } from 'react-router'

const items = [
  { label: 'Home', to: '/dashboard/home', Icon: Home },
  { label: 'Scan', to: '/dashboard/scan', Icon: ScanLine, featured: true },
  { label: 'History', to: '/dashboard/history', Icon: History },
  { label: 'Recyclers', to: '/dashboard/recyclers', Icon: MapPinned },
]

function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Worker navigation">
      {items.map(({ label, to, Icon, featured }) => (
        <NavLink
          className={({ isActive }) => `bottom-nav__item${featured ? ' bottom-nav__item--featured' : ''}${isActive ? ' is-active' : ''}`}
          key={to}
          to={to}
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNavigation
