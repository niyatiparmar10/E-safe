import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

// UX-only role protection. The backend must enforce admin authorization in production.
function AdminRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <main className="route-loading"><span aria-hidden="true" /> Checking your access…</main>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard/home" replace />

  return <Outlet />
}

export default AdminRoute
