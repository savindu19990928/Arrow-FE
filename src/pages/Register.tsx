import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '../components/auth/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, errorMessage } from '../utils/apiClient';
import type { RegisterPayload } from '../types/api';

const initial: RegisterPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirm: ''
};

export function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/account';
  const [form, setForm] = useState<RegisterPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (user && !submitting) return <Navigate to={from} replace />;

  const set = (key: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setFieldErrors({ password_confirm: ['Passwords don’t match.'] });
      return;
    }
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await register({ ...form, email: form.email.trim() });
      toast.success('Your account is ready');
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors);
      setSubmitting(false);
    }
  };

  const fieldError = (key: string) =>
  fieldErrors[key]?.[0] ? <p className="mt-1 text-sm text-danger">{fieldErrors[key][0]}</p> : null;

  return (
    <AuthShell title="Create account" subtitle="Faster checkout, order history, saved addresses and reviews.">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="r-first">First name</label>
          <input id="r-first" className="field" required autoComplete="given-name" value={form.first_name} onChange={set('first_name')} />
          {fieldError('first_name')}
        </div>
        <div>
          <label className="label" htmlFor="r-last">Last name</label>
          <input id="r-last" className="field" required autoComplete="family-name" value={form.last_name} onChange={set('last_name')} />
          {fieldError('last_name')}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-email">Email</label>
          <input id="r-email" type="email" className="field" required autoComplete="email" value={form.email} onChange={set('email')} />
          {fieldError('email')}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="r-phone">Phone number</label>
          <input id="r-phone" type="tel" className="field" required autoComplete="tel" placeholder="+94771234567" value={form.phone_number} onChange={set('phone_number')} />
          {fieldError('phone_number')}
        </div>
        <div>
          <label className="label" htmlFor="r-pass">Password</label>
          <input id="r-pass" type="password" className="field" required minLength={8} autoComplete="new-password" value={form.password} onChange={set('password')} />
          {fieldError('password')}
        </div>
        <div>
          <label className="label" htmlFor="r-pass2">Confirm password</label>
          <input id="r-pass2" type="password" className="field" required autoComplete="new-password" value={form.password_confirm} onChange={set('password_confirm')} />
          {fieldError('password_confirm')}
        </div>
        {error &&
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-danger sm:col-span-2">
            {error}
          </p>
        }
        <button type="submit" className="btn-primary sm:col-span-2" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-[15px] text-muted">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>);

}