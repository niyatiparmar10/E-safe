import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminDataManagementPage from './pages/AdminDataManagementPage'
import HistoryPage from './pages/HistoryPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RecyclerPage from './pages/RecyclerPage'
import ScanPage from './pages/ScanPage'
import ScanContextPage from './pages/ScanContextPage'
import ScanResultPage from './pages/ScanResultPage'
import SignUpPage from './pages/SignUpPage'
import WorkerHomePage from './pages/WorkerHomePage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="sign-in" element={<Navigate to="/login" replace />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<AppLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<WorkerHomePage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="recyclers" element={<RecyclerPage />} />
        </Route>
        <Route path="scan" element={<AppLayout />}>
          <Route path="context" element={<ScanContextPage />} />
          <Route path="result" element={<ScanResultPage />} />
        </Route>
        <Route path="recyclers" element={<AppLayout />}>
          <Route index element={<RecyclerPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="data" element={<AdminDataManagementPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="app/*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
