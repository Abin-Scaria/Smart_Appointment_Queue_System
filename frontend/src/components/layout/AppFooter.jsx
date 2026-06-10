export default function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[#fffaf1]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-brand-ocean)]">
            CareAxis Booking Suite
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            A professional booking workflow for evening clinics, follow-up communication, and patient-friendly queue visibility.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          <p>Designed for web and mobile-friendly workflows.</p>
          <p className="mt-1">© 2026 CareAxis Health Systems.</p>
        </div>
      </div>
    </footer>
  );
}
