import React from 'react';
import { Link } from 'react-router-dom';
import { buttonClasses } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="font-display text-7xl font-extrabold text-fg">404</p>
      <h1 className="mt-4 text-xl font-semibold text-fg">This page took a wrong turn</h1>
      <p className="mt-2 text-sm text-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/catalog" className={`${buttonClasses('primary')} mt-8`}>
        Go to catalog
      </Link>
    </div>);

}