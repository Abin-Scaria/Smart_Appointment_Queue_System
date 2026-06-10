import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import api from '../api';
import ClinicianWorkspacePage from './ClinicianWorkspacePage';
import PatientWorkspacePage from './PatientWorkspacePage';
import { clearAccessToken, isSessionActive } from '../lib/session';

function WorkspaceIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function routeWorkspace() {
      if (!isSessionActive()) {
        navigate('/access', { replace: true });
        return;
      }

      try {
        await api.get('/dashboard/doctor/profile/');
        if (active) {
          navigate('/workspace/clinician', { replace: true });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearAccessToken();
          if (active) {
            navigate('/access', { replace: true });
          }
          return;
        }

        if (active) {
          navigate('/workspace/patient', { replace: true });
        }
      }
    }

    routeWorkspace();

    return () => {
      active = false;
    };
  }, [navigate]);

  return <div className="px-4 py-16 text-center text-slate-500">Loading workspace...</div>;
}

export default function PortalRouter() {
  return (
    <Routes>
      <Route path="/" element={<WorkspaceIndex />} />
      <Route path="patient" element={<PatientWorkspacePage />} />
      <Route path="clinician" element={<ClinicianWorkspacePage />} />
      <Route path="*" element={<Navigate to="/workspace" replace />} />
    </Routes>
  );
}
