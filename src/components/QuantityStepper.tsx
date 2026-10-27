import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, label = 'Quantity' }: QuantityStepperProps) {
  return (
    <div className="inline-flex h-11 items-center rounded-md border border-line bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className="focus-ring flex h-full w-10 items-center justify-center rounded-l-md hover:bg-canvas disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity">
        
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-[15px] font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="focus-ring flex h-full w-10 items-center justify-center rounded-r-md hover:bg-canvas disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity">
        
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>);

}