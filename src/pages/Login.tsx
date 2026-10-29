import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/apiClient';
import { BrandMark } from '../components/layout/BrandMark';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center bg-bg px-4 py-20">
      <div className="w-full max-w-sm">
        <BrandMark size="lg" />
        <h1 className="mt-10 font-display text-3xl font-extrabold uppercase tracking-tight text-fg">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Access your orders, wishlist and saved addresses.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
          
          {error &&
          <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          }
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
        <p className="mt-8 text-sm text-muted">
          New to Arrow Ventures?{' '}
          <Link to="/register" state={{ from }} className="text-fg underline underline-offset-2">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-sm text-muted">
          Checked out as a guest?{' '}
          <Link to="/track-order" className="text-fg underline underline-offset-2">
            Track your order
          </Link>
        </p>
      </div>
    </div>);

}