import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './landing/Landing'
import { Shell } from './dashboard/Shell'
import MapPage from './dashboard/pages/MapPage'
import WallPage from './dashboard/pages/WallPage'
import VehiclesPage from './dashboard/pages/VehiclesPage'
import JourneyPage from './dashboard/pages/JourneyPage'
import AlertsPage from './dashboard/pages/AlertsPage'
import CamerasPage from './dashboard/pages/CamerasPage'
import AnalyticsPage from './dashboard/pages/AnalyticsPage'
import AuditPage from './dashboard/pages/AuditPage'
import FieldPage from './dashboard/pages/FieldPage'
import IdentityPage from './dashboard/pages/IdentityPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Shell />}>
          <Route index element={<Navigate to="/app/peta" replace />} />
          <Route path="peta" element={<MapPage />} />
          <Route path="dinding" element={<WallPage />} />
          <Route path="kendaraan" element={<VehiclesPage />} />
          <Route path="kendaraan/:plate" element={<JourneyPage />} />
          <Route path="peringatan" element={<AlertsPage />} />
          <Route path="identitas" element={<IdentityPage />} />
          <Route path="kamera" element={<CamerasPage />} />
          <Route path="analitik" element={<AnalyticsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="petugas" element={<FieldPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
