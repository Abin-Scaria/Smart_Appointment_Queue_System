import { useEffect, useState } from 'react';
import AppFooter from './AppFooter';
import TopNavigation from './TopNavigation';
import { isSessionActive } from '../../lib/session';

export default function AppShell({ children }) {
  const [authenticated, setAuthenticated] = useState(isSessionActive());

  useEffect(() => {
    const syncSession = () => setAuthenticated(isSessionActive());
    window.addEventListener('storage', syncSession);
    window.addEventListener('sessionchange', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('sessionchange', syncSession);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <TopNavigation authenticated={authenticated} />
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
