import React from 'react';
import { Loader2Icon } from 'lucide-react';

export function Spinner({ label = 'Loading' }: {label?: string;}) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
      <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}…</span>
    </div>);

}