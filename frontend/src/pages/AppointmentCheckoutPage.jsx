import { CalendarDays, CircleCheckBig, Clock3, CreditCard, ShieldCheck, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { formatCurrency, formatDateLabel, formatTimeLabel } from '../lib/formatters';

export default function AppointmentCheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { doctor, slot, date } = state || {};
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [appointmentDraft, setAppointmentDraft] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (!doctor || !slot || !date) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg text-slate-600">This booking session has expired.</p>
        <Link to="/directory" className="mt-6 inline-flex rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white">
          Return to directory
        </Link>
      </div>
    );
  }

  const startBooking = async () => {
    if (!reasonForVisit.trim()) {
      setMessage('Please add a short reason for the consultation.');
      return;
    }

    try {
      const response = await api.post('/appointments/book/', {
        doctor_id: doctor.id,
        date,
        slot_time: slot,
        reason_for_visit: reasonForVisit,
      });
      setAppointmentDraft(response.data);
      setPaymentOpen(true);
      setMessage('');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/access', {
          state: { warning: 'Please sign in before confirming this appointment.' },
        });
        return;
      }
      setMessage(error.response?.data?.error || 'Unable to reserve this appointment right now.');
    }
  };

  const confirmPayment = async () => {
    try {
      await api.post('/appointments/verify-payment/', {
        appointment_id: appointmentDraft.id,
        razorpay_order_id: appointmentDraft.razorpay_order_id,
        razorpay_payment_id: `DEMO_PAY_${appointmentDraft.id}`,
        razorpay_signature: 'demo-signature',
      });
      navigate('/workspace/patient');
    } catch {
      setMessage('Payment confirmation failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-[var(--color-brand-cream)] p-4 text-[var(--color-brand-ocean)]">
              <Stethoscope size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">Appointment checkout</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--color-brand-navy)]">Review your consultation details</h1>
            </div>
          </div>

          <div className="mt-8 rounded-[1.8rem] bg-[var(--color-brand-surface)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Clinician</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-brand-navy)]">
              Dr. {doctor.user?.first_name} {doctor.user?.last_name}
            </h2>
            <p className="mt-1 text-slate-600">{doctor.specialization}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} className="text-[var(--color-brand-ocean)]" />
                  Date
                </p>
                <p className="mt-2 font-semibold text-[var(--color-brand-navy)]">{formatDateLabel(date)}</p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock3 size={16} className="text-[var(--color-brand-ocean)]" />
                  Slot
                </p>
                <p className="mt-2 font-semibold text-[var(--color-brand-navy)]">{formatTimeLabel(slot)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <label className="block">
              <span className="mb-3 block text-sm font-semibold text-slate-700">Reason for consultation</span>
              <textarea
                rows="5"
                value={reasonForVisit}
                onChange={(event) => setReasonForVisit(event.target.value)}
                placeholder="Summarize the symptoms or reason for this appointment."
                className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <p className="mt-3 text-sm text-slate-500">
              This product is suitable for clinic scheduling and non-emergency consultations. Critical emergencies should still go to a hospital.
            </p>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-[var(--color-brand-navy)] p-8 text-white shadow-xl shadow-slate-900/10">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Checkout summary</p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4">
              <span className="text-slate-300">Consultation fee</span>
              <span className="font-semibold">{formatCurrency(doctor.consultation_fee)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4">
              <span className="text-slate-300">Platform fee</span>
              <span className="font-semibold">{formatCurrency(0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4">
              <span className="text-slate-300">Total</span>
              <span className="text-2xl font-semibold">{formatCurrency(doctor.consultation_fee)}</span>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm leading-7 text-slate-100">
            <div className="flex items-center gap-2 font-semibold text-emerald-200">
              <ShieldCheck size={16} />
              Demo payment enabled
            </div>
            <p className="mt-2 text-slate-200">The checkout flow simulates confirmation so the booking journey stays testable during development.</p>
          </div>

          {message ? <div className="mt-6 rounded-2xl bg-rose-400/12 px-4 py-3 text-sm text-rose-100">{message}</div> : null}

          <button
            type="button"
            onClick={startBooking}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-semibold text-[var(--color-brand-navy)] transition hover:-translate-y-0.5"
          >
            <CreditCard size={18} />
            Reserve and continue
          </button>
        </aside>
      </section>

      {paymentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-950/30">
            <div className="rounded-[1.5rem] bg-[var(--color-brand-navy)] p-6 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Demo payment confirmation</p>
              <h2 className="mt-3 text-2xl font-semibold">{formatCurrency(doctor.consultation_fee)}</h2>
              <p className="mt-2 text-sm text-slate-300">Queue number will be assigned as soon as payment is confirmed.</p>
            </div>
            <div className="mt-6 rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5 text-sm leading-7 text-slate-600">
              Appointment draft #{appointmentDraft?.queue_number} is ready. Confirm to simulate a successful online payment and complete the booking.
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentOpen(false)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
              >
                <CircleCheckBig size={18} />
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
