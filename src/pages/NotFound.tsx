import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-canvas px-5 text-center">
      <p className="display text-[96px]">404</p>
      <p className="mt-2 text-lg text-muted">This page took a different trail.</p>
      <Link to="/" className="btn-primary mt-8">Back home</Link>
    </div>);

}