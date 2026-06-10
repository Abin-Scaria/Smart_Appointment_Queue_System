import { CalendarDays, Clock3, MapPin, MessageSquareHeart, Star, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import StatusPill from '../components/ui/StatusPill';
import { formatCurrency, formatDateLabel, formatTimeLabel } from '../lib/formatters';
import { isSessionActive } from '../lib/session';

export default function ClinicianProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [reviewDraft, setReviewDraft] = useState({ score: 5, review: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const [doctorResponse, reviewResponse] = await Promise.all([
          api.get(`/doctors/${id}/`, { params: { date: selectedDate } }),
          api.get(`/doctors/${id}/rating/`),
        ]);
        if (active) {
          setDoctor(doctorResponse.data);
          setReviews(reviewResponse.data);
          setMessage('');
        }
      } catch {
        if (active) {
          setMessage('Unable to load this clinician profile right now.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [id, selectedDate]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/doctors/${id}/rating/`, reviewDraft);
      const reviewResponse = await api.get(`/doctors/${id}/rating/`);
      const doctorResponse = await api.get(`/doctors/${id}/`, { params: { date: selectedDate } });
      setReviews(reviewResponse.data);
      setDoctor(doctorResponse.data);
      setReviewDraft({ score: 5, review: '' });
      setMessage('Your review has been published.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to submit your review.');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">Loading clinician profile...</div>;
  }

  if (!doctor) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">{message || 'Clinician not found.'}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">Clinician Profile</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--color-brand-navy)]">
                Dr. {doctor.user?.first_name} {doctor.user?.last_name}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                {doctor.specialization} · {doctor.experience_years} years of experience
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-amber-50 px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Patient rating</p>
              <div className="mt-2 flex items-center gap-2">
                <Star size={18} className="fill-amber-500 text-amber-500" />
                <span className="text-2xl font-semibold text-amber-900">{doctor.average_rating || 'New'}</span>
              </div>
              <p className="mt-1 text-sm text-amber-800">{doctor.total_reviews} reviews</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5">
              <p className="flex items-center gap-2 text-slate-600">
                <MapPin size={16} className="text-[var(--color-brand-ocean)]" />
                {doctor.clinic_address}, {doctor.city}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5">
              <p className="flex items-center gap-2 text-slate-600">
                <WalletCards size={16} className="text-[var(--color-brand-ocean)]" />
                {formatCurrency(doctor.consultation_fee)} consultation fee
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5">
              <p className="flex items-center gap-2 text-slate-600">
                <Clock3 size={16} className="text-[var(--color-brand-ocean)]" />
                Evening clinic: {formatTimeLabel(doctor.timing?.start_time)} to {formatTimeLabel(doctor.timing?.end_time)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5">
              <p className="text-slate-600">Languages: {doctor.languages}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatusPill tone={doctor.is_verified ? 'success' : 'warning'}>
              {doctor.is_verified ? 'Verified clinician' : 'Verification in progress'}
            </StatusPill>
            <StatusPill tone="info">Follow-up questions supported</StatusPill>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-slate-200 bg-[var(--color-brand-navy)] p-8 text-white shadow-xl shadow-slate-900/10">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Booking control</p>
          <h2 className="mt-3 text-3xl font-semibold">Choose your date and slot</h2>
          <label className="mt-8 block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Consultation date</span>
            <div className="mt-3 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/6 px-4 py-4">
              <CalendarDays size={18} />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </label>

          <p className="mt-6 text-sm text-slate-300">Showing availability for {formatDateLabel(selectedDate)}.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {doctor.available_slots?.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => navigate(`/appointments/new/${doctor.id}`, { state: { doctor, slot: slot.time, date: selectedDate } })}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  slot.available
                    ? 'bg-white text-[var(--color-brand-navy)] hover:-translate-y-0.5'
                    : 'cursor-not-allowed border border-white/10 bg-white/10 text-slate-400'
                }`}
              >
                {formatTimeLabel(slot.time)}
              </button>
            ))}
          </div>
          {!doctor.available_slots?.length ? (
            <p className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300">
              No slots are available for this date.
            </p>
          ) : null}
        </aside>
      </section>

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-ocean)]">Patient feedback</p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--color-brand-navy)]">Reviews and visit experience</h2>
          </div>
          {message ? (
            <div className="rounded-full bg-sky-50 px-4 py-2 text-sm text-sky-700">{message}</div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.78fr]">
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] border border-slate-200 bg-[var(--color-brand-surface)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[var(--color-brand-navy)]">{review.patient_name}</h3>
                    <StatusPill tone="warning">{review.score} / 5</StatusPill>
                  </div>
                  <p className="mt-4 leading-7 text-slate-600">{review.review || 'No written note provided.'}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-[var(--color-brand-surface)] p-8 text-slate-600">
                No reviews yet. The first patient review can set the tone for future bookings.
              </div>
            )}
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--color-brand-cream)] p-3 text-[var(--color-brand-ocean)]">
                <MessageSquareHeart size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--color-brand-navy)]">Share a review</h3>
                <p className="text-sm text-slate-500">Available after login for patient accounts.</p>
              </div>
            </div>

            {isSessionActive() ? (
              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Score</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={reviewDraft.score}
                    onChange={(event) => setReviewDraft((current) => ({ ...current, score: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Review</span>
                  <textarea
                    rows="4"
                    value={reviewDraft.review}
                    onChange={(event) => setReviewDraft((current) => ({ ...current, review: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
                    placeholder="Describe the consultation, clarity, and overall experience."
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Submit review
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-[var(--color-brand-surface)] p-6 text-sm leading-7 text-slate-600">
                Sign in to rate this clinician after your visit.
                <div className="mt-4">
                  <Link to="/access" className="font-semibold text-[var(--color-brand-ocean)]">
                    Open access portal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
