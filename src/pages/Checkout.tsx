import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2Icon, LockIcon } from 'lucide-react';
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useApi } from '../hooks/useApi';
import { paymentMethods } from '../data/paymentMethods';
import { ApiError, errorMessage, toList, tokenStore } from '../utils/apiClient';
import { addressApi, orderApi, paymentApi } from '../utils/storeApi';
import type { Address, CheckoutPayload, CouponResult, PaymentMethod } from '../types/api';

interface ShippingForm {
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  notes: string;
}

const emptyShipping: ShippingForm = { recipient: '', phone: '', line1: '', line2: '', city: '', state: '', postal: '', notes: '' };

export function Checkout() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, refresh } = useCart();
  const navigate = useNavigate();

  const addressesReq = useApi(() => addressApi.list(), [user?.id], !!user);
  const addresses = toList<Address>(addressesReq.data);

  const [selectedAddress, setSelectedAddress] = useState<number | 'new'>('new');
  const [shipping, setShipping] = useState<ShippingForm>(emptyShipping);
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
  const [saveAddress, setSaveAddress] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('KOKO');
  const [coupon, setCoupon] = useState<CouponResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (addresses.length > 0 && selectedAddress === 'new') {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setSelectedAddress(def.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesReq.data]);

  useEffect(() => {
    if (selectedAddress === 'new') return;
    const a = addresses.find((x) => x.id === selectedAddress);
    if (a) {
      setShipping({
        recipient: a.recipient_name,
        phone: a.phone_number,
        line1: a.address_line1,
        line2: a.address_line2 ?? '',
        city: a.city,
        state: a.state_or_province ?? '',
        postal: a.postal_code,
        notes: a.delivery_notes ?? ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress]);

  if (!cartLoading && (!cart || cart.items.length === 0) && !submitting) {
    return <Navigate to="/cart" replace />;
  }

  const set = (key: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  setShipping((s) => ({ ...s, [key]: e.target.value }));

  const err = (key: string) => fieldErrors[key]?.[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    const contact = user ? user.email : guest.email.trim();
    const payload: CheckoutPayload = {
      shipping_recipient_name: shipping.recipient.trim() || guest.name.trim(),
      shipping_phone: shipping.phone.trim() || guest.phone.trim(),
      shipping_address_line1: shipping.line1.trim(),
      shipping_address_line2: shipping.line2.trim() || undefined,
      shipping_city: shipping.city.trim(),
      shipping_state: shipping.state.trim() || undefined,
      shipping_postal_code: shipping.postal.trim(),
      shipping_country: 'Sri Lanka',
      payment_method: method,
      coupon_code: coupon?.valid ? coupon.code : undefined,
      delivery_notes: shipping.notes.trim() || undefined
    };
    if (!user) {
      Object.assign(payload, {
        guest_name: guest.name.trim(),
        guest_email: guest.email.trim(),
        guest_phone: guest.phone.trim(),
        guest_token: tokenStore.getGuestToken()
      });
    }

    try {
      if (user && selectedAddress === 'new' && saveAddress) {
        try {
          await addressApi.create({
            recipient_name: payload.shipping_recipient_name,
            phone_number: payload.shipping_phone,
            address_line1: payload.shipping_address_line1,
            address_line2: payload.shipping_address_line2 ?? '',
            city: payload.shipping_city,
            state_or_province: payload.shipping_state ?? '',
            postal_code: payload.shipping_postal_code,
            country: 'Sri Lanka',
            is_default: addresses.length === 0,
            delivery_notes: payload.delivery_notes ?? ''
          });
        } catch {
          toast.error('We couldn’t save that address, but your order will still go through.');
        }
      }

      const order = await orderApi.checkout(payload);
      sessionStorage.setItem(`av.order.${order.order_number}`, JSON.stringify({ id: order.id, contact }));
      void refresh();

      if (method !== 'BANK_TRANSFER') {
        try {
          const init = await paymentApi.initiate(order.order_number, method);
          if (init.checkout_url) {
            toast.success(`Order ${order.order_number} placed. Redirecting to ${init.provider}…`);
            window.location.href = init.checkout_url;
            return;
          }
        } catch (payErr) {
          toast.error(`Order placed, but we couldn’t start the payment: ${errorMessage(payErr)}`);
        }
      }

      navigate(`/order/${order.order_number}?contact=${encodeURIComponent(contact)}`, { state: { order } });
    } catch (error) {
      setFormError(errorMessage(error));
      if (error instanceof ApiError) setFieldErrors(error.fieldErrors);
      setSubmitting(false);
    }
  };

  const showAddressForm = !user || selectedAddress === 'new' || addresses.length === 0;

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-10 md:px-10 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-[44px] md:text-[64px]">Checkout</h1>
          {!user &&
          <p className="text-[15px] text-muted">
              Have an account?{' '}
              <Link to="/login" state={{ from: '/checkout' }} className="font-medium text-ink underline underline-offset-4">
                Sign in
              </Link>{' '}
              for faster checkout.
            </p>
          }
        </div>

        {cartLoading || !cart ?
        <div className="mt-10 flex items-center gap-2 text-muted" role="status">
            <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Loading…
          </div> :

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]" noValidate={false}>
            <div className="space-y-12">
              {!user &&
            <section aria-labelledby="contact-h">
                  <h2 id="contact-h" className="mb-5 text-xl font-semibold">
                    Contact details
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="label" htmlFor="g-name">Full name</label>
                      <input id="g-name" className="field" required autoComplete="name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
                      {err('guest_name') && <p className="mt-1 text-sm text-danger">{err('guest_name')}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="g-email">Email</label>
                      <input id="g-email" type="email" className="field" required autoComplete="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                      {err('guest_email') && <p className="mt-1 text-sm text-danger">{err('guest_email')}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="g-phone">Phone</label>
                      <input id="g-phone" type="tel" className="field" required autoComplete="tel" placeholder="+94 77 123 4567" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                      {err('guest_phone') && <p className="mt-1 text-sm text-danger">{err('guest_phone')}</p>}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">We’ll use these to send your order confirmation and tracking updates.</p>
                </section>
            }

              <section aria-labelledby="ship-h">
                <h2 id="ship-h" className="mb-5 text-xl font-semibold">
                  Delivery address
                </h2>

                {user && addressesReq.loading && <p className="text-muted">Loading saved addresses…</p>}

                {user && addresses.length > 0 &&
              <fieldset className="mb-6 grid gap-2">
                    <legend className="sr-only">Saved addresses</legend>
                    {addresses.map((a) =>
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 rounded-md border bg-white p-4 ${selectedAddress === a.id ? 'border-ink' : 'border-line'}`}>
                  
                        <input type="radio" name="address" className="mt-1 accent-ink" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} />
                        <span className="text-[15px]">
                          <span className="font-medium">{a.recipient_name}</span>
                          {a.is_default && <span className="ml-2 rounded-full bg-canvas px-2 py-0.5 text-xs">Default</span>}
                          <span className="block text-muted">
                            {[a.address_line1, a.address_line2, a.city, a.postal_code].filter(Boolean).join(', ')}
                          </span>
                          <span className="block text-muted">{a.phone_number}</span>
                        </span>
                      </label>
                )}
                    <label className={`flex cursor-pointer items-center gap-3 rounded-md border bg-white p-4 ${selectedAddress === 'new' ? 'border-ink' : 'border-line'}`}>
                      <input
                    type="radio"
                    name="address"
                    className="accent-ink"
                    checked={selectedAddress === 'new'}
                    onChange={() => {
                      setSelectedAddress('new');
                      setShipping(emptyShipping);
                    }} />
                  
                      <span className="text-[15px] font-medium">Deliver to a new address</span>
                    </label>
                  </fieldset>
              }

                {showAddressForm &&
              <div className="grid gap-4 md:grid-cols-2">
                    {user &&
                <>
                        <div>
                          <label className="label" htmlFor="s-name">Recipient name</label>
                          <input id="s-name" className="field" required autoComplete="name" value={shipping.recipient} onChange={set('recipient')} />
                        </div>
                        <div>
                          <label className="label" htmlFor="s-phone">Recipient phone</label>
                          <input id="s-phone" type="tel" className="field" required autoComplete="tel" value={shipping.phone} onChange={set('phone')} />
                        </div>
                      </>
                }
                    <div className="md:col-span-2">
                      <label className="label" htmlFor="s-l1">Address line 1</label>
                      <input id="s-l1" className="field" required autoComplete="address-line1" value={shipping.line1} onChange={set('line1')} />
                      {err('shipping_address_line1') && <p className="mt-1 text-sm text-danger">{err('shipping_address_line1')}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="label" htmlFor="s-l2">Address line 2 <span className="font-normal text-subtle">(optional)</span></label>
                      <input id="s-l2" className="field" autoComplete="address-line2" value={shipping.line2} onChange={set('line2')} />
                    </div>
                    <div>
                      <label className="label" htmlFor="s-city">City</label>
                      <input id="s-city" className="field" required autoComplete="address-level2" value={shipping.city} onChange={set('city')} />
                    </div>
                    <div>
                      <label className="label" htmlFor="s-state">Province <span className="font-normal text-subtle">(optional)</span></label>
                      <input id="s-state" className="field" autoComplete="address-level1" value={shipping.state} onChange={set('state')} />
                    </div>
                    <div>
                      <label className="label" htmlFor="s-postal">Postal code</label>
                      <input id="s-postal" className="field" required autoComplete="postal-code" value={shipping.postal} onChange={set('postal')} />
                    </div>
                    <div>
                      <label className="label" htmlFor="s-country">Country</label>
                      <input id="s-country" className="field bg-canvas" value="Sri Lanka" readOnly />
                    </div>
                    {user &&
                <label className="flex items-center gap-3 text-[15px] md:col-span-2">
                        <input type="checkbox" className="h-4 w-4 accent-ink" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                        Save this address to my account
                      </label>
                }
                  </div>
              }

                <div className="mt-4">
                  <label className="label" htmlFor="s-notes">Delivery notes <span className="font-normal text-subtle">(optional)</span></label>
                  <textarea id="s-notes" className="field min-h-[80px]" value={shipping.notes} onChange={set('notes')} placeholder="E.g. call before delivery" />
                </div>
              </section>

              <section aria-labelledby="pay-h">
                <h2 id="pay-h" className="mb-5 text-xl font-semibold">
                  Payment method
                </h2>
                <fieldset className="grid gap-2">
                  <legend className="sr-only">Payment method</legend>
                  {paymentMethods.map((pm) =>
                <label
                  key={pm.id}
                  className={`flex cursor-pointer gap-4 rounded-md border bg-white p-5 transition-colors duration-150 ease-out ${method === pm.id ? 'border-ink' : 'border-line hover:border-ink/40'}`}>
                  
                      <input type="radio" name="payment" className="mt-1 accent-ink" checked={method === pm.id} onChange={() => setMethod(pm.id)} />
                      <span>
                        <span className="block font-medium">{pm.title}</span>
                        <span className="mt-0.5 block text-sm text-muted">{pm.description}</span>
                      </span>
                    </label>
                )}
                </fieldset>
              </section>
            </div>

            <CheckoutSummary cart={cart} coupon={coupon} onCouponChange={setCoupon}>
              {formError &&
            <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-danger">
                  {formError}
                </p>
            }
              <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
                {submitting ?
              <>
                    <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> Placing order…
                  </> :

              <>
                    <LockIcon className="h-4 w-4" aria-hidden /> Place order
                  </>
              }
              </button>
              <p className="mt-3 text-center text-xs text-muted">Stock is reserved as soon as your order is placed.</p>
            </CheckoutSummary>
          </form>
        }
      </div>
    </div>);

}