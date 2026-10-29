import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage, getFieldErrors } from '../utils/apiClient';
import { BrandMark } from '../components/layout/BrandMark';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (key: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setErrors({});
    setError(null);
    try {
      await register({ ...form, email: form.email.trim() });
      toast.success('Account created. Welcome to Arrow Ventures!');
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center bg-bg px-4 py-20">
      <div className="w-full max-w-md">
        <BrandMark size="lg" />
        <h1 className="mt-10 font-display text-3xl font-extrabold uppercase tracking-tight text-fg">Create account</h1>
        <p className="mt-2 text-sm text-muted">Track orders, save addresses and keep a wishlist.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <TextField label="First name" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} error={errors.first_name} required />
          <TextField label="Last name" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} error={errors.last_name} required />
          <TextField
            label="Email"
            type="email"
            className="sm:col-span-2"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            required />
          
          <TextField
            label="Phone number"
            type="tel"
            className="sm:col-span-2"
            autoComplete="tel"
            placeholder="+94 77 123 4567"
            value={form.phone_number}
            onChange={set('phone_number')}
            error={errors.phone_number}
            required />
          
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            minLength={8}
            required />
          
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.password_confirm}
            onChange={set('password_confirm')}
            error={errors.password_confirm}
            required />
          
          {error && !Object.keys(errors).length &&
          <p role="alert" className="text-sm text-danger sm:col-span-2">
              {error}
            </p>
          }
          <Button type="submit" size="lg" fullWidth loading={loading} className="sm:col-span-2">
            Create account
          </Button>
          <p className="text-xs text-subtle sm:col-span-2">
            By creating an account you agree to our{' '}
            <Link to="/policies/terms" className="underline underline-offset-2 hover:text-fg">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/policies/privacy" className="underline underline-offset-2 hover:text-fg">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
        <p className="mt-8 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-fg underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>);

}