import { Link, Outlet } from 'react-router'
import BrandMark from '../components/BrandMark'
import { useMessages } from '../hooks/useMessages'

function PublicLayout() {
  const messages = useMessages()

  return (
    <div className="public-shell">
      <header className="public-header shell-width">
        <BrandMark />
        <nav className="public-header__actions" aria-label="Account actions">
          <Link className="public-header__login" to="/login">{messages.navigation.login}</Link>
          <Link className="public-header__signup" to="/sign-up">{messages.navigation.signup}</Link>
        </nav>
      </header>
      <Outlet />
      <footer className="public-footer shell-width">
        <span>© 2026 E-Safe</span>
        <span>Safer choices for electronic waste.</span>
      </footer>
    </div>
  )
}

export default PublicLayout
