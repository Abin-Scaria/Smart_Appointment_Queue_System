import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ShieldPlus, Stethoscope, X } from 'lucide-react';
import { clearAccessToken } from '../../lib/session';

const navItems = [
  { label: 'Directory', to: '/directory' },
  { label: 'How It Works', to: '#journey', isAnchor: true },
];

function navClass({ isActive }) {
  return `transition ${isActive ? 'text-[var(--color-brand-ocean)]' : 'text-slate-600 hover:text-[var(--color-brand-navy)]'}`;
}

export default function TopNavigation({ authenticated }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAccessPage = location.pathname === '/access';

  const handleLogout = () => {
    clearAccessToken();
    setMenuOpen(false);
    navigate('/access');
  };

  const handleJourneyNavigation = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/#journey');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[rgba(255,252,246,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-brand-navy)] text-white shadow-lg shadow-slate-900/15">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-brand-ocean)]">CareAxis</p>
            <p className="text-lg font-semibold text-[var(--color-brand-navy)]">CareAxis Booking Suite</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.isAnchor ? (
              <button
                key={item.label}
                type="button"
                onClick={handleJourneyNavigation}
                className="text-slate-600 transition hover:text-[var(--color-brand-navy)]"
              >
                {item.label}
              </button>
            ) : (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            )
          )}
          {authenticated ? (
            <>
              <NavLink to="/workspace" className={navClass}>
                Workspace
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            isAccessPage ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
                <ShieldPlus size={16} />
                Access Portal
              </span>
            ) : (
              <Link
                to="/access"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold !text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                <ShieldPlus size={16} className="text-white" />
                Access Portal
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="inline-flex rounded-full border border-slate-300 p-2 text-slate-700 md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-[var(--color-brand-surface)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) =>
              item.isAnchor ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleJourneyNavigation}
                  className="text-left text-slate-600 transition hover:text-[var(--color-brand-navy)]"
                >
                  {item.label}
                </button>
              ) : (
                <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </NavLink>
              )
            )}
            {authenticated ? (
              <>
                <NavLink to="/workspace" className={navClass} onClick={() => setMenuOpen(false)}>
                  Workspace
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              isAccessPage ? (
                <span className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                  Access Portal
                </span>
              ) : (
                <Link
                  to="/access"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-semibold !text-white"
                >
                  Access Portal
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
