import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, disabled, size = 'md' }: QuantityStepperProps) {
  const h = size === 'sm' ? 'h-10' : 'h-11';
  const btn = `flex ${h} w-10 items-center justify-center text-muted transition-colors duration-150 hover:text-fg disabled:opacity-40 disabled:hover:text-muted`;
  return (
    <div className={`inline-flex ${h} items-center rounded-md border border-line`} role="group" aria-label="Quantity">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity">
        
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums text-fg" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity">
        
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>);

}