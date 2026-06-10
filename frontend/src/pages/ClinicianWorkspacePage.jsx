import { ClipboardPenLine, MessageSquareMore, Stethoscope, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';
import StatusPill from '../components/ui/StatusPill';
import { SPECIALTIES } from '../data/specialties';
import { formatDateLabel, formatTimeLabel } from '../lib/formatters';

const tabs = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'messages', label: 'Messages' },
  { id: 'profile', label: 'Profile' },
];

export default function ClinicianWorkspacePage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [profile, setProfile] = useState({
    specialization: '',
    consultation_fee: '',
    clinic_address: '',
    city: '',
    experience_years: '',
    languages: '',
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionDraft, setPrescriptionDraft] = useState({ medicines: '', notes: '' });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responseDraft, setResponseDraft] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadAppointments = async () => {
    const response = await api.get('/dashboard/doctor/');
    setAppointments(response.data);
  };

  const loadEnquiries = async () => {
    const response = await api.get('/dashboard/doctor/enquiries/');
    setEnquiries(response.data);
  };

  const loadProfile = async () => {
    const response = await api.get('/dashboard/doctor/profile/');
    setProfile({
      specialization: response.data.specialization || '',
      consultation_fee: response.data.consultation_fee || '',
      clinic_address: response.data.clinic_address || '',
      city: response.data.city || '',
      experience_years: response.data.experience_years || '',
      languages: response.data.languages || '',
    });
  };

  useEffect(() => {
    async function hydrateWorkspace() {
      try {
        const [appointmentsResponse, enquiriesResponse, profileResponse] = await Promise.all([
          api.get('/dashboard/doctor/'),
          api.get('/dashboard/doctor/enquiries/'),
          api.get('/dashboard/doctor/profile/'),
        ]);
        setAppointments(appointmentsResponse.data);
        setEnquiries(enquiriesResponse.data);
        setProfile({
          specialization: profileResponse.data.specialization || '',
          consultation_fee: profileResponse.data.consultation_fee || '',
          clinic_address: profileResponse.data.clinic_address || '',
          city: profileResponse.data.city || '',
          experience_years: profileResponse.data.experience_years || '',
          languages: profileResponse.data.languages || '',
        });
      } catch {
        setStatusMessage('Unable to load the clinician workspace.');
      }
    }

    hydrateWorkspace();
  }, []);

  const savePrescription = async () => {
    try {
      await api.post(`/appointments/${selectedAppointment.id}/prescription/`, prescriptionDraft);
      setSelectedAppointment(null);
      setPrescriptionDraft({ medicines: '', notes: '' });
      setStatusMessage('Prescription saved successfully.');
      loadAppointments();
    } catch {
      setStatusMessage('Unable to save the prescription.');
    }
  };

  const saveReply = async () => {
    if (!responseDraft.trim() || !selectedEnquiry) {
      return;
    }

    try {
      await api.put(`/enquiries/${selectedEnquiry.id}/`, { response: responseDraft });
      setSelectedEnquiry(null);
      setResponseDraft('');
      setStatusMessage('Response sent successfully.');
      loadEnquiries();
    } catch {
      setStatusMessage('Unable to send the response.');
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      await api.put('/dashboard/doctor/profile/', profile);
      setStatusMessage('Profile updated successfully.');
      loadProfile();
    } catch {
      setStatusMessage('Unable to update the profile.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">Clinician workspace</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--color-brand-navy)]">Schedule management, follow-up messaging, and profile control</h1>
        </div>
        {statusMessage ? <div className="rounded-full bg-sky-50 px-4 py-2 text-sm text-sky-700">{statusMessage}</div> : null}
      </div>

      <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab.id
                ? 'bg-[var(--color-brand-navy)] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {appointments.length ? (
            appointments.map((appointment) => (
              <article key={appointment.id} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-ocean)]">Patient appointment</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-brand-navy)]">
                      {appointment.patient_detail?.first_name} {appointment.patient_detail?.last_name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">Queue #{appointment.queue_number}</p>
                  </div>
                  <StatusPill tone={appointment.status === 'COMPLETED' ? 'success' : 'warning'}>{appointment.status}</StatusPill>
                </div>

                <div className="mt-6 rounded-[1.6rem] bg-[var(--color-brand-surface)] p-5 text-sm text-slate-600">
                  <p>{formatDateLabel(appointment.date)}</p>
                  <p className="mt-2">{formatTimeLabel(appointment.slot_time)}</p>
                  <p className="mt-4 leading-7">{appointment.reason_for_visit || 'No visit note provided.'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setPrescriptionDraft({
                      medicines: appointment.prescription?.medicines || '',
                      notes: appointment.prescription?.notes || '',
                    });
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white"
                >
                  <ClipboardPenLine size={16} />
                  {appointment.prescription ? 'Edit prescription' : 'Add prescription'}
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-600 lg:col-span-3">
              No appointments are scheduled for the selected clinician today.
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'messages' ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {enquiries.length ? (
            enquiries.map((enquiry) => (
              <article key={enquiry.id} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-ocean)]">Patient message</p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-brand-navy)]">{enquiry.sender_name}</h2>
                  </div>
                  <StatusPill tone={enquiry.response ? 'success' : 'danger'}>
                    {enquiry.response ? 'Answered' : 'Open'}
                  </StatusPill>
                </div>

                <div className="mt-6 rounded-[1.6rem] bg-[var(--color-brand-surface)] p-5 text-sm leading-7 text-slate-600">
                  <p className="font-semibold text-slate-700">Question</p>
                  <p className="mt-2">{enquiry.message}</p>
                  {enquiry.response ? (
                    <>
                      <p className="mt-5 font-semibold text-slate-700">Response</p>
                      <p className="mt-2">{enquiry.response}</p>
                    </>
                  ) : null}
                </div>

                {!enquiry.response ? (
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-5 py-3 text-sm font-semibold text-white"
                  >
                    <MessageSquareMore size={16} />
                    Reply
                  </button>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-slate-600 lg:col-span-3">
              There are no follow-up questions right now.
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'profile' ? (
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
          <form onSubmit={updateProfile} className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Specialization</span>
              <select
                value={profile.specialization}
                onChange={(event) => setProfile((current) => ({ ...current, specialization: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              >
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Consultation fee</span>
              <input
                type="number"
                value={profile.consultation_fee}
                onChange={(event) => setProfile((current) => ({ ...current, consultation_fee: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">City</span>
              <input
                value={profile.city}
                onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Experience in years</span>
              <input
                type="number"
                value={profile.experience_years}
                onChange={(event) => setProfile((current) => ({ ...current, experience_years: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Clinic address</span>
              <textarea
                rows="4"
                value={profile.clinic_address}
                onChange={(event) => setProfile((current) => ({ ...current, clinic_address: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Languages</span>
              <input
                value={profile.languages}
                onChange={(event) => setProfile((current) => ({ ...current, languages: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-6 py-4 text-sm font-semibold text-white"
              >
                <Stethoscope size={16} />
                Update clinician profile
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {selectedAppointment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-950/20">
            <h2 className="text-2xl font-semibold text-[var(--color-brand-navy)]">Prescription for {selectedAppointment.patient_detail?.first_name}</h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Medicines</span>
                <textarea
                  rows="5"
                  value={prescriptionDraft.medicines}
                  onChange={(event) => setPrescriptionDraft((current) => ({ ...current, medicines: event.target.value }))}
                  className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 outline-none transition focus:border-[var(--color-brand-ocean)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
                <textarea
                  rows="4"
                  value={prescriptionDraft.notes}
                  onChange={(event) => setPrescriptionDraft((current) => ({ ...current, notes: event.target.value }))}
                  className="w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 outline-none transition focus:border-[var(--color-brand-ocean)]"
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button type="button" onClick={savePrescription} className="flex-1 rounded-full bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-semibold text-white">
                Save prescription
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedEnquiry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-[var(--color-brand-cream)] p-3 text-[var(--color-brand-ocean)]">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-brand-navy)]">{selectedEnquiry.sender_name}</h2>
                <p className="text-sm text-slate-500">Reply to the patient&apos;s follow-up question</p>
              </div>
            </div>
            <div className="mt-6 rounded-[1.5rem] bg-[var(--color-brand-surface)] p-5 text-sm leading-7 text-slate-600">
              {selectedEnquiry.message}
            </div>
            <textarea
              rows="5"
              value={responseDraft}
              onChange={(event) => setResponseDraft(event.target.value)}
              className="mt-6 w-full rounded-[1.5rem] border border-slate-200 px-4 py-4 outline-none transition focus:border-[var(--color-brand-ocean)]"
              placeholder="Provide a clinically appropriate follow-up response."
            />
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedEnquiry(null);
                  setResponseDraft('');
                }}
                className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button type="button" onClick={saveReply} className="flex-1 rounded-full bg-[var(--color-brand-navy)] px-4 py-3 text-sm font-semibold text-white">
                Send response
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
