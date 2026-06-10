import { Search, SlidersHorizontal, Languages, MapPin, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { SPECIALTIES } from '../data/specialties';
import { formatCurrency } from '../lib/formatters';
import StatusPill from '../components/ui/StatusPill';

export default function ClinicianDirectoryPage() {
  const [filters, setFilters] = useState({
    city: '',
    specialization: '',
    fee_max: '',
  });
  const [submittedFilters, setSubmittedFilters] = useState(filters);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get('/doctors/', { params: submittedFilters });
        if (active) {
          setDoctors(response.data);
        }
      } catch {
        if (active) {
          setErrorMessage('Unable to load clinicians right now. Please check that the API is running.');
          setDoctors([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [submittedFilters]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedFilters(filters);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">Clinician Directory</p>
            <h1 className="mt-3 text-4xl font-semibold text-[var(--color-brand-navy)]">Find a verified specialist for after-hours care.</h1>
            <p className="mt-4 text-slate-600 leading-7">
              Search by city, discipline, or consultation fee to shortlist clinics that fit your evening schedule.
            </p>
          </div>
          <StatusPill tone="info">Mobile-friendly booking journey</StatusPill>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
          <label className="rounded-3xl border border-slate-200 bg-[var(--color-brand-surface)] px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">City</span>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[var(--color-brand-ocean)]" />
              <input
                value={filters.city}
                onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
                placeholder="Kochi, Bengaluru, Mumbai"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>

          <label className="rounded-3xl border border-slate-200 bg-[var(--color-brand-surface)] px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Specialty</span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[var(--color-brand-ocean)]" />
              <select
                value={filters.specialization}
                onChange={(event) => setFilters((current) => ({ ...current, specialization: event.target.value }))}
                className="w-full bg-transparent outline-none"
              >
                <option value="">All specialties</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="rounded-3xl border border-slate-200 bg-[var(--color-brand-surface)] px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Max consultation fee</span>
            <div className="flex items-center gap-2">
              <WalletCards size={16} className="text-[var(--color-brand-ocean)]" />
              <input
                type="number"
                min="0"
                value={filters.fee_max}
                onChange={(event) => setFilters((current) => ({ ...current, fee_max: event.target.value }))}
                placeholder="1500"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[var(--color-brand-navy)] px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          >
            <Search size={16} />
            Search
          </button>
        </form>
      </section>

      <section className="mt-8">
        {errorMessage ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{errorMessage}</div>
        ) : null}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <article key={doctor.id} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-ocean)]">Clinician</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-brand-navy)]">
                      Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {doctor.specialization} · {doctor.experience_years} years of experience
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
                    <p className="text-xs uppercase tracking-[0.15em] text-amber-700">Rating</p>
                    <p className="text-lg font-semibold text-amber-900">{doctor.average_rating || 'New'}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-[var(--color-brand-ocean)]" />
                    {doctor.clinic_address}, {doctor.city}
                  </p>
                  <p className="flex items-center gap-2">
                    <WalletCards size={16} className="text-[var(--color-brand-ocean)]" />
                    {formatCurrency(doctor.consultation_fee)} consultation fee
                  </p>
                  <p className="flex items-center gap-2">
                    <Languages size={16} className="text-[var(--color-brand-ocean)]" />
                    {doctor.languages}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <StatusPill tone={doctor.is_verified ? 'success' : 'warning'}>
                    {doctor.is_verified ? 'Verified clinic' : 'Profile pending verification'}
                  </StatusPill>
                  <Link
                    to={`/clinicians/${doctor.id}`}
                    className="rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                  >
                    View profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600">
            No clinicians matched your current filters.
          </div>
        )}
      </section>
    </div>
  );
}
