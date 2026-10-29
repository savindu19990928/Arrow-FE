import React from 'react';
import { AlertTriangleIcon, RotateCwIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center rounded-lg border border-line bg-surface text-center ${
      compact ? 'px-5 py-8' : 'px-6 py-16'}`
      }>
      
      <AlertTriangleIcon className="h-6 w-6 text-muted" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>
      {onRetry &&
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCwIcon className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      }
    </div>);

}