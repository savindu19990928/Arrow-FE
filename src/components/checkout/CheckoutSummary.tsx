import React, { useState } from 'react';
import { CheckCircle2Icon, XIcon } from 'lucide-react';
import { errorMessage } from '../../utils/apiClient';
import { formatLKR } from '../../utils/format';
import { promoApi } from '../../utils/storeApi';
import type { Cart, CouponResult } from '../../types/api';

interface CheckoutSummaryProps {
  cart: Cart;
  coupon: CouponResult | null;
  onCouponChange: (coupon: CouponResult | null) => void;
  children?: React.ReactNode;
}

export function CheckoutSummary({ cart, coupon, onCouponChange, children }: CheckoutSummaryProps) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const subtotal = parseFloat(cart.subtotal);
  const delivery = parseFloat(cart.estimated_delivery_fee ?? '0') || 0;
  const discount = coupon?.valid ? coupon.discount_amount : 0;
  const total = Math.max(0, subtotal - discount + delivery);

  const apply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setMessage(null);
    try {
      const res = await promoApi.validateCoupon(code.trim(), subtotal);
      if (res.valid) {
        onCouponChange(res);
        setCode('');
      } else {
        setMessage(res.message || 'This coupon can’t be applied.');
      }
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <aside className="h-fit rounded-md bg-white p-6 lg:sticky lg:top-28" aria-label="Order summary">
      <h2 className="text-lg font-semibold">Your order</h2>
      <ul className="mt-5 space-y-4">
        {cart.items.map((item) =>
        <li key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-canvas">
              {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-contain mix-blend-multiply" />}
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">{item.product_name}</p>
              {item.variant_name && <p className="text-muted">{item.variant_name}</p>}
            </div>
            <p className="whitespace-nowrap text-sm font-medium">{formatLKR(item.line_total)}</p>
          </li>
        )}
      </ul>

      <div className="mt-6 border-t border-line pt-5">
        {coupon?.valid ?
        <div className="flex items-center justify-between rounded-md bg-lime/50 px-3 py-2.5 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2Icon className="h-4 w-4" aria-hidden /> {coupon.code} applied
            </span>
            <button type="button" onClick={() => onCouponChange(null)} className="focus-ring rounded p-1" aria-label="Remove coupon">
              <XIcon className="h-4 w-4" />
            </button>
          </div> :

        <>
            <label htmlFor="coupon" className="label">
              Coupon code
            </label>
            <div className="flex gap-2">
              <input
              id="coupon"
              className="field uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void apply();
                }
              }} />
            
              <button type="button" className="btn-secondary px-4" onClick={() => void apply()} disabled={checking || !code.trim()}>
                {checking ? '…' : 'Apply'}
              </button>
            </div>
            {message &&
          <p role="alert" className="mt-2 text-sm text-danger">
                {message}
              </p>
          }
          </>
        }
      </div>

      <dl className="mt-6 space-y-3 border-t border-line pt-5 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatLKR(subtotal)}</dd>
        </div>
        {discount > 0 &&
        <div className="flex justify-between text-leaf">
            <dt>Discount</dt>
            <dd>−{formatLKR(discount)}</dd>
          </div>
        }
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{delivery > 0 ? formatLKR(delivery) : 'Free'}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{formatLKR(total)}</dd>
        </div>
      </dl>
      {children}
    </aside>);

}