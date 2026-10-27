import React from 'react';
import { AlertCircleIcon, RotateCwIcon } from 'lucide-react';

interface StateMessageProps {
  title: string;
  description?: string;
  tone?: 'empty' | 'error';
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function StateMessage({ title, description, tone = 'empty', onRetry, action }: StateMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-center px-6 py-16 text-center">
      
      {tone === 'error' && <AlertCircleIcon className="mb-4 h-8 w-8 text-danger" aria-hidden />}
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {description && <p className="mt-2 max-w-md text-[15px] text-muted">{description}</p>}
      {(onRetry || action) &&
      <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry &&
        <button type="button" onClick={onRetry} className="btn-secondary">
              <RotateCwIcon className="h-4 w-4" aria-hidden /> Try again
            </button>
        }
          {action}
        </div>
      }
    </div>);

}