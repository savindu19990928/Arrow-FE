import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted" role="status">
        <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Loading your account…
      </div>);

  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}