import React from 'react';
import { CheckIcon, XCircleIcon } from 'lucide-react';
import { orderSteps } from '../../data/site';
import { formatDate, humanize } from '../../utils/format';
import type { StatusHistoryEntry } from '../../types/api';

interface OrderStatusTimelineProps {
  status: string;
  history?: StatusHistoryEntry[];
}

export function OrderStatusTimeline({ status, history = [] }: OrderStatusTimelineProps) {
  const currentIndex = orderSteps.indexOf(status);

  if (currentIndex === -1) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-line p-4">
        <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        <div>
          <p className="font-medium text-fg">Order {humanize(status).toLowerCase()}</p>
          {history.length > 0 && <p className="mt-1 text-sm text-muted">{history[history.length - 1].note}</p>}
        </div>
      </div>);

  }

  const dateFor = (step: string) => history.find((h) => h.status === step)?.created_at;

  return (
    <ol className="grid gap-4 md:grid-cols-5 md:gap-0" aria-label="Order progress">
      {orderSteps.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
            <div className="flex items-center md:w-full">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                done ? 'border-fg bg-fg text-bg' : 'border-line text-subtle'}`
                }
                aria-current={current ? 'step' : undefined}>
                
                {done ? <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
              </span>
              {index < orderSteps.length - 1 &&
              <span className={`hidden h-px flex-1 md:block ${index < currentIndex ? 'bg-fg' : 'bg-line'}`} aria-hidden="true" />
              }
            </div>
            <div className="md:mt-3 md:pr-4">
              <p className={`text-sm ${done ? 'font-medium text-fg' : 'text-subtle'}`}>{humanize(step)}</p>
              {dateFor(step) && <p className="text-xs text-subtle">{formatDate(dateFor(step), true)}</p>}
            </div>
          </li>);

      })}
    </ol>);

}