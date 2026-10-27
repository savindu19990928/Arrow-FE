import React from 'react';
import { CheckIcon, XCircleIcon } from 'lucide-react';
import { humanize } from '../../utils/format';

const steps = [
{ key: 'PENDING', label: 'Placed' },
{ key: 'CONFIRMED', label: 'Confirmed' },
{ key: 'PROCESSING', label: 'Processing' },
{ key: 'IN_TRANSIT', label: 'In transit' },
{ key: 'DELIVERED', label: 'Delivered' }];


const aliases: Record<string, string> = {
  PACKED: 'PROCESSING',
  SHIPPED: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'IN_TRANSIT',
  COMPLETED: 'DELIVERED'
};

export function OrderProgress({ status }: {status: string;}) {
  const normalized = aliases[status.toUpperCase()] ?? status.toUpperCase();
  const index = steps.findIndex((s) => s.key === normalized);

  if (index === -1) {
    return (
      <div className="flex items-center gap-3 rounded-md bg-canvas p-4 text-[15px]">
        <XCircleIcon className="h-5 w-5 shrink-0 text-danger" aria-hidden />
        This order is currently <strong className="font-semibold">{humanize(status)}</strong>.
      </div>);

  }

  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {steps.map((step, i) => {
        const done = i <= index;
        return (
          <li key={step.key} className="flex flex-col gap-2" aria-current={i === index ? 'step' : undefined}>
            <div className={`h-1.5 rounded-full ${done ? 'bg-lime-bright' : 'bg-line'}`} />
            <span className={`flex items-center gap-1 text-xs md:text-sm ${done ? 'font-medium text-ink' : 'text-subtle'}`}>
              {done && <CheckIcon className="hidden h-3.5 w-3.5 md:block" aria-hidden />}
              {step.label}
            </span>
          </li>);

      })}
    </ol>);

}