import { LockKeyhole, ShieldCheck, Stethoscope, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { storeAccessToken } from '../lib/session';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'PATIENT',
};

export default function AuthPortalPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const warning = location.state?.warning;

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isLoginMode) {
        const response = await api.post('/auth/login/', {
          username: formData.username,
          password: formData.password,
        });
        storeAccessToken(response.data.access);
        navigate('/workspace');
        return;
      }

      await api.post('/auth/register/', formData);
      setMessage('Registration completed. You can sign in now.');
      setIsLoginMode(true);
      setFormData(emptyForm);
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.username?.[0] ||
          error.response?.data?.message ||
          'Unable to complete the request.'
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="rounded-[2rem] bg-[var(--color-brand-navy)] p-8 text-white shadow-xl shadow-slate-900/10">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <div className="rounded-2xl bg-white/10 p-3">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Patient access</h2>
                <p className="mt-1 text-sm text-slate-300">Book appointments and track your queue.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/10 p-5">
              <div className="rounded-2xl bg-white/10 p-3">
                <Stethoscope size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Clinician access</h2>
                <p className="mt-1 text-sm text-slate-300">Manage visits, responses, and profile details.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          {warning ? (
            <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              {warning}
            </div>
          ) : null}
          {message ? (
            <div className="mb-6 rounded-[1.5rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
              {message}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-ocean)]">
                {isLoginMode ? 'Sign in' : 'Create account'}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-[var(--color-brand-navy)]">
                {isLoginMode ? 'Access your workspace' : 'Register a new account'}
              </h2>
            </div>
            <div className="rounded-3xl bg-[var(--color-brand-cream)] p-4 text-[var(--color-brand-ocean)]">
              {isLoginMode ? <LockKeyhole size={24} /> : <UserRoundPlus size={24} />}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {!isLoginMode ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">First name</span>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={updateField}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Last name</span>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={updateField}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
                  />
                </label>
              </div>
            ) : null}

            {!isLoginMode ? (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={updateField}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Username or phone</span>
              <input
                name="username"
                value={formData.username}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--color-brand-ocean)]"
              />
            </label>

            {!isLoginMode ? (
              <div>
                <span className="mb-3 block text-sm font-semibold text-slate-700">Account role</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Patient', value: 'PATIENT' },
                    { label: 'Clinician', value: 'DOCTOR' },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-[1.5rem] border border-slate-200 px-4 py-4">
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={updateField}
                      />
                      <span className="font-medium text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-brand-navy)] px-5 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              {isLoginMode ? 'Sign in securely' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            {isLoginMode ? 'Need a new account?' : 'Already registered?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode((current) => !current);
                setMessage('');
              }}
              className="font-semibold text-[var(--color-brand-ocean)]"
            >
              {isLoginMode ? 'Register here' : 'Sign in here'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
