import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '../components/auth/AuthShell';
import { useAuth } from '../contexts/AuthContext';
import { errorMessage } from '../utils/apiClient';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && !submitting) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const u = await login(email.trim(), password);
      toast.success(`Welcome back, ${u.first_name || 'rider'}`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Track orders, save addresses and keep a wishlist of your next ride.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="l-email">Email</label>
          <input id="l-email" type="email" className="field" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="l-pass">Password</label>
          <input id="l-pass" type="password" className="field" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error &&
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-danger">
            {error}
          </p>
        }
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-[15px] text-muted">
        New to Arrow Ventures?{' '}
        <Link to="/register" state={{ from }} className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-[15px] text-muted">
        Checked out as a guest?{' '}
        <Link to="/track" className="font-medium text-ink underline underline-offset-4">
          Track your order
        </Link>
      </p>
    </AuthShell>);

}