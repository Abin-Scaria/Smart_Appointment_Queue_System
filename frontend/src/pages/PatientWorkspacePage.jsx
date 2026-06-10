import { CalendarClock, MessageSquareReply, NotebookText, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusPill from '../components/ui/StatusPill';
import { formatDateLabel, formatTimeLabel } from '../lib/formatters';

function statusTone(status) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED') return 'danger';
  if (status === 'CONFIRMED') return 'info';
  return 'warning';
}

export default function PatientWorkspacePage() {
  const [appointments, setAppointments] = useState([]);
  const [draftAppointment, setDraftAppointment] = useState(null);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadAppointments = async () => {
    try {
      const response = await api.get('/dashboard/patient/');
      setAppointments(response.data);
    } catch {
      setStatusMessage('Unable to load your appointments right now.');
    }
  };

  useEffect(() => {
    async function hydrateAppointments() {
      try {
        const response = await api.get('/dashboard/patient/');
        setAppointments(response.data);
      } catch {
        setStatusMessage('Unable to load your appointments right now.');
      }
    }

    hydrateAppointments();
  }, []);

  const sendEnquiry = async () => {
    if (!enquiryMessage.trim() || !draftAppointment) {
      return;
    }

    try {
      await api.post(`/appointments/${draftAppointment.id}/enquiries/`, { message: enquiryMessage });
      setStatusMessage('Your follow-up question was sent successfully.');
      setDraftAppointment(null);
      setEnquiryMessage('');
      loadAppointments();
    } catch {
      setStatusMessage('Unable to send your follow-up question.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">Patient workspace</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--color-brand-navy)]">Appointments, records, and follow-up communication</h1>
        </div>
        {statusMessage ? <div className="rounded-full bg-sky-50 px-4 py-2 text-sm text-sky-700">{statusMessage}</div> : null}
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <article key={appointment.id} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-ocean)]">Appointment</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--color-brand-navy)]">
                    Dr. {appointment.doctor_detail?.user?.first_name} {appointment.doctor_detail?.user?.last_name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{appointment.doctor_detail?.specialization}</p>
                </div>
                <StatusPill tone={statusTone(appointment.status)}>{appointment.status}</StatusPill>
              </div>

              <div className="mt-6 space-y-3 rounded-[1.6rem] bg-[var(--color-brand-surface)] p-5 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-[var(--color-brand-ocean)]" />
                  {formatDateLabel(appointment.date)} at {formatTimeLabel(appointment.slot_time)}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound size={16} className="text-[var(--color-brand-ocean)]" />
                  Queue number #{appointment.queue_number}
                </p>
                <p>{appointment.reason_for_visit || 'No visit note provided.'}</p>
              </div>

              {appointment.prescription ? (
                <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <NotebookText size={18} />
                    <h3 className="font-semibold">Prescription and notes</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-emerald-900 whitespace-pre-wrap">
                    {appointment.prescription.medicines || 'No medicines recorded.'}
                  </p>
                  {appointment.prescription.notes ? (
                    <p className="mt-3 text-sm leading-7 text-emerald-800 whitespace-pre-wrap">{appointment.prescription.notes}</p>
                  ) : null}
                </div>
              ) : null}

              {appointment.enquiries?.length ? (
                <div className="mt-5 rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5">
                  <h3 className="font-semibold text-sky-900">Previous follow-up questions</h3>
                  <div className="mt-3 space-y-3">
                    {appointment.enquiries.map((enquiry) => (
                      <div key={enquiry.id} className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                        <p className="font-semibold text-sky-900">Q: {enquiry.message}</p>
                        <p className="mt-2">{enquiry.response ? `A: ${enquiry.response}` : 'Awaiting clinician response.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {appointment.status === 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={() => setDraftAppointment(appointment)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  <MessageSquareReply size={16} />
                  Ask a follow-up question
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-600 lg:col-span-3">
            No appointments have been booked yet.
          </div>
        )}
      </section>

      {draftAppointment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-[var(--color-brand-navy)]">Send a follow-up question</h2>
            <p className="mt-2 text-sm text-slate-500">
              This message will be attached to your appointment with Dr. {draftAppointment.doctor_detail?.user?.first_name}.
            </p>
            <textarea
              rows="5"
              value={enquiryMessage}
              onChange={(event) => setEnquiryMessage(event.target.value)}
              className="mt-6 w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 outline-none transition focus:border-[var(--color-brand-ocean)]"
              placeholder="Share your question about prescription, symptoms, or after-care instructions."
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDraftAppointment(null);
                  setEnquiryMessage('');
                }}
                className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendEnquiry}
                className="flex-1 rounded-full bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-semibold text-white"
              >
                Send question
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
