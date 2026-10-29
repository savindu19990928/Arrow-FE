import React from 'react';
import type { PaymentMethod } from '../../types/api';

const methods: {id: PaymentMethod;name: string;description: string;}[] = [
{ id: 'KOKO', name: 'Koko', description: 'Buy now, pay later in 3 interest-free installments. You’ll be redirected to Koko.' },
{ id: 'MINTPAY', name: 'Mintpay', description: 'Split your payment into 3 installments. You’ll be redirected to Mintpay.' },
{
  id: 'BANK_TRANSFER',
  name: 'Direct bank transfer',
  description: 'Transfer to our account and upload your deposit slip. We verify and confirm your order.'
}];


interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Payment method">
      {methods.map((method) => {
        const active = value === method.id;
        return (
          <label
            key={method.id}
            className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors duration-150 ${
            active ? 'border-fg bg-raised' : 'border-line hover:border-fg/40'}`
            }>
            
            <input
              type="radio"
              name="payment-method"
              value={method.id}
              checked={active}
              onChange={() => onChange(method.id)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-white" />
            
            <span>
              <span className="block text-sm font-semibold text-fg">{method.name}</span>
              <span className="mt-0.5 block text-sm text-muted">{method.description}</span>
            </span>
          </label>);

      })}
    </div>);

}