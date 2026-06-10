import { ArrowRight, CalendarClock, HeartPulse, ShieldCheck, Star, Stethoscope, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Live appointment orchestration',
    description: 'Search doctors, reserve an evening slot, and see your queue number instantly.',
    icon: CalendarClock,
  },
  {
    title: 'Consultation continuity',
    description: 'Prescriptions, advice, and follow-up questions stay connected to every visit.',
    icon: HeartPulse,
  },
  {
    title: 'Reliable operational control',
    description: 'Doctors manage their patient flow, inbox, and clinic profile from one workspace.',
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: 'Average check-in savings', value: '32 mins' },
  { label: 'Supported follow-up window', value: '7 days' },
  { label: 'Queue visibility coverage', value: '100%' },
];

const journey = [
  {
    title: 'Discover the right clinician',
    description: 'Browse by city, specialty, and consultation fee with a cleaner provider directory.',
    icon: Stethoscope,
  },
  {
    title: 'Reserve a confident timeslot',
    description: 'Book an evening consultation with a structured checkout and transparent pricing.',
    icon: CalendarClock,
  },
  {
    title: 'Stay updated without waiting rooms',
    description: 'Queue visibility and post-visit communication reduce uncertainty for both sides.',
    icon: TimerReset,
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="hero-grid border-b border-slate-200/70">
        <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)] shadow-sm">
              <Star size={14} className="fill-[var(--color-brand-gold)] text-[var(--color-brand-gold)]" />
              Professional clinic booking for modern care teams
            </div>
            <h1 className="mt-8 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] text-[var(--color-brand-navy)] sm:text-6xl">
              Evening care scheduling that feels credible, calm, and ready for production.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              CareAxis Booking Suite helps patients secure after-hours consultations while giving clinicians a more organized queue, cleaner follow-up workflow, and a more trustworthy digital presence.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/directory"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-7 py-4 text-sm font-semibold !text-white shadow-[0_18px_40px_rgba(16,35,61,0.22)] transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                Explore clinician directory
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/access"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Open workspace
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="glass-panel min-h-24 rounded-3xl border border-white/70 p-5 shadow-lg shadow-slate-900/5">
                  <p className="text-2xl font-semibold text-[var(--color-brand-navy)]">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-10 top-12 hidden h-24 w-24 rounded-full bg-[var(--color-brand-mint)]/20 blur-2xl lg:block" />
            <div className="glass-panel relative rounded-[2rem] border border-white/80 p-6 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.6rem] bg-[var(--color-brand-navy)] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Clinician Control</p>
                    <h2 className="mt-3 text-2xl font-semibold">Tonight&apos;s queue</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Waiting</p>
                    <p className="text-3xl font-semibold">08</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {['6:10 PM  |  Arun Thomas  |  Follow-up fever case', '6:20 PM  |  Aditi Shah  |  Paediatric review', '6:30 PM  |  Neha Iyer  |  Prescription clarification'].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-ocean)]">Patient confidence</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--color-brand-navy)]">4.9/5</p>
                  <p className="mt-2 text-sm text-slate-600">Review-backed clinician profiles and faster confirmation.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-[var(--color-brand-cream)] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-brand-ocean)]">Queue transparency</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--color-brand-navy)]">Real-time</p>
                  <p className="mt-2 text-sm text-slate-600">Every appointment carries a clear queue number and status.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map(({ title, description, icon }) => {
            const HighlightIcon = icon;
            return (
              <article key={title} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1">
                <div className="inline-flex rounded-2xl bg-[var(--color-brand-cream)] p-3 text-[var(--color-brand-ocean)]">
                  <HighlightIcon size={24} />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-[var(--color-brand-navy)]">{title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="journey" className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-brand-ocean)]">Journey</p>
            <h2 className="mt-4 text-4xl font-semibold text-[var(--color-brand-navy)]">A more professional experience for both patients and clinicians</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {journey.map(({ title, description, icon }, index) => {
              const JourneyIcon = icon;
              return (
                <div key={title} className="rounded-[2rem] border border-slate-200 bg-white p-8">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-[var(--color-brand-ocean)]">
                      <JourneyIcon size={22} />
                    </div>
                    <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-[var(--color-brand-navy)]">{title}</h3>
                  <p className="mt-4 text-slate-600 leading-7">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
