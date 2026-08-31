import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <main className="route-loading"><span aria-hidden="true" /> Checking your session…</main>
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}

export default ProtectedRoute
