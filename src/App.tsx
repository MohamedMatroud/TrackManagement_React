import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { LoginPage } from './features/auth/pages/LoginPage'
import { NotFoundPage } from './shared/pages/NotFoundPage'
import { ProtectedRoute } from './shared/routing/ProtectedRoute'

const TrackListPage = lazy(() =>
  import('./features/tracks/pages/TrackListPage').then((module) => ({ default: module.TrackListPage })),
)
const TrackDetailPage = lazy(() =>
  import('./features/tracks/pages/TrackDetailPage').then((module) => ({ default: module.TrackDetailPage })),
)

function PageFallback() {
  return <div className="centered-state"><Spin size="large" /></div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/tracks" element={<Suspense fallback={<PageFallback />}><TrackListPage /></Suspense>} />
        <Route path="/tracks/:trackId" element={<Suspense fallback={<PageFallback />}><TrackDetailPage /></Suspense>} />
      </Route>
      <Route path="/" element={<Navigate to="/tracks" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
