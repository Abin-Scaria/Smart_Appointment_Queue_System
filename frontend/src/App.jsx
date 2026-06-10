import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AppointmentCheckoutPage from './pages/AppointmentCheckoutPage';
import AuthPortalPage from './pages/AuthPortalPage';
import ClinicianDirectoryPage from './pages/ClinicianDirectoryPage';
import ClinicianProfilePage from './pages/ClinicianProfilePage';
import LandingPage from './pages/LandingPage';
import PortalRouter from './pages/PortalRouter';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/directory" element={<ClinicianDirectoryPage />} />
          <Route path="/clinicians/:id" element={<ClinicianProfilePage />} />
          <Route path="/appointments/new/:doctorId" element={<AppointmentCheckoutPage />} />
          <Route path="/access" element={<AuthPortalPage />} />
          <Route path="/workspace/*" element={<PortalRouter />} />

          <Route path="/search" element={<Navigate to="/directory" replace />} />
          <Route path="/doctor/:id" element={<Navigate to="/directory" replace />} />
          <Route path="/book/:doctorId" element={<Navigate to="/directory" replace />} />
          <Route path="/login" element={<Navigate to="/access" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
