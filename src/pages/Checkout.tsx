import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LockIcon, ShoppingBagIcon, XIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCheckout } from '../hooks/useCheckout';
import { formatLKR } from '../utils/format';
import { AddressFields } from '../components/checkout/AddressFields';
import { PaymentMethodPicker } from '../components/checkout/PaymentMethodPicker';
import { Button, buttonClasses } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { TextField } from '../components/ui/TextField';

export function Checkout() {
  const { loading: cartLoading } = useCart();
  const location = useLocation();
  const c = useCheckout();

  if (cartLoading && !c.cart) return <Spinner label="Loading checkout" />;

  if (!c.cart?.items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <EmptyState
          icon={ShoppingBagIcon}
          title="Nothing to check out"
          message="Your cart is empty. Add a product to continue."
          action={
          <Link to="/catalog" className={buttonClasses('primary', 'md')}>
              Browse the catalog
            </Link>
          } />
        
      </div>);

  }

  const savedAddresses = c.addresses.data ?? [];

  return (
    <div className="w-full bg-bg">
      <form
        className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:px-8 xl:grid-cols-[minmax(0,1fr)_400px]"
        onSubmit={(e) => {
          e.preventDefault();
          void c.placeOrder();
        }}
        noValidate>
        
        <div className="min-w-0 space-y-12">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">Checkout</h1>

          <section aria-labelledby="contact-heading">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="contact-heading" className="text-lg font-semibold text-fg">
                Contact
              </h2>
              {!c.user &&
              <p className="text-sm text-muted">
                  Have an account?{' '}
                  <Link to="/login" state={{ from: location.pathname }} className="text-fg underline underline-offset-2">
                    Sign in
                  </Link>
                </p>
              }
            </div>
            {c.user ?
            <p className="mt-4 text-sm text-muted">
                Ordering as <span className="text-fg">{c.user.email}</span>
              </p> :

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextField
                label="Full name"
                className="sm:col-span-2"
                value={c.guest.name}
                onChange={(e) => c.updateGuest({ name: e.target.value })}
                error={c.errors.guest_name}
                autoComplete="name"
                required />
              
                <TextField
                label="Email"
                type="email"
                value={c.guest.email}
                onChange={(e) => c.updateGuest({ email: e.target.value })}
                error={c.errors.guest_email}
                hint="We'll send your order confirmation here."
                autoComplete="email"
                required />
              
                <TextField
                label="Phone"
                type="tel"
                value={c.guest.phone}
                onChange={(e) => c.updateGuest({ phone: e.target.value })}
                error={c.errors.guest_phone}
                placeholder="+94 77 123 4567"
                autoComplete="tel"
                required />
              
              </div>
            }
          </section>

          <section aria-labelledby="shipping-heading">
            <h2 id="shipping-heading" className="text-lg font-semibold text-fg">
              Delivery address
            </h2>
            {c.user && savedAddresses.length > 0 &&
            <div className="mt-5 space-y-2" role="radiogroup" aria-label="Saved addresses">
                {savedAddresses.map((addr) =>
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors duration-150 ${
                c.selectedAddress === addr.id ? 'border-fg bg-raised' : 'border-line hover:border-fg/40'}`
                }>
                
                    <input
                  type="radio"
                  name="saved-address"
                  checked={c.selectedAddress === addr.id}
                  onChange={() => c.setSelectedAddress(addr.id)}
                  className="mt-0.5 h-4 w-4 accent-white" />
                
                    <span className="text-sm">
                      <span className="block font-medium text-fg">
                        {addr.recipient_name}
                        {addr.is_default && <span className="ml-2 text-xs font-normal text-subtle">Default</span>}
                      </span>
                      <span className="block text-muted">
                        {[addr.address_line1, addr.address_line2, addr.city, addr.postal_code].filter(Boolean).join(', ')}
                      </span>
                      <span className="block text-subtle">{addr.phone_number}</span>
                    </span>
                  </label>
              )}
                <label
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 text-sm transition-colors duration-150 ${
                c.selectedAddress === 'new' ? 'border-fg bg-raised' : 'border-line hover:border-fg/40'}`
                }>
                
                  <input
                  type="radio"
                  name="saved-address"
                  checked={c.selectedAddress === 'new'}
                  onChange={() => c.setSelectedAddress('new')}
                  className="h-4 w-4 accent-white" />
                
                  <span className="font-medium text-fg">Use a new address</span>
                </label>
              </div>
            }

            {c.selectedAddress === 'new' ?
            <div className="mt-5 space-y-4">
                <AddressFields value={c.address} onChange={c.updateAddress} errors={c.errors} />
                {c.user &&
              <label className="flex items-center gap-3 text-sm text-muted">
                    <input
                  type="checkbox"
                  checked={c.saveAddress}
                  onChange={(e) => c.setSaveAddress(e.target.checked)}
                  className="h-4 w-4 accent-white" />
                
                    Save this address to my account
                  </label>
              }
              </div> :

            <TextField
              label="Delivery notes"
              className="mt-5"
              value={c.deliveryNotes}
              onChange={(e) => c.setDeliveryNotes(e.target.value)}
              placeholder="e.g. Call before delivery (optional)" />

            }
          </section>

          <section aria-labelledby="payment-heading">
            <h2 id="payment-heading" className="text-lg font-semibold text-fg">
              Payment
            </h2>
            <div className="mt-5">
              <PaymentMethodPicker value={c.method} onChange={c.setMethod} />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-24" aria-label="Order summary">
          <h2 className="text-lg font-semibold text-fg">Order summary</h2>
          <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto">
            {c.cart.items.map((item) =>
            <li key={item.id} className="flex gap-3">
                <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-bg">
                  {item.product_image && <img src={item.product_image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-[20px] items-center justify-center rounded-bl-md bg-fg px-1 text-[11px] font-semibold text-bg">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium text-fg">{item.product_name}</p>
                  {item.variant_name && <p className="truncate text-xs text-muted">{item.variant_name}</p>}
                </div>
                <p className="whitespace-nowrap text-sm tabular-nums text-fg">{formatLKR(item.line_total)}</p>
              </li>
            )}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            {c.coupon?.valid ?
            <div className="flex items-center justify-between rounded-md border border-line px-3 py-2.5 text-sm">
                <span>
                  <span className="font-mono text-fg">{c.coupon.code}</span>
                  <span className="ml-2 text-muted">applied</span>
                </span>
                <button type="button" onClick={c.removeCoupon} className="text-muted hover:text-fg" aria-label="Remove coupon">
                  <XIcon className="h-4 w-4" />
                </button>
              </div> :

            <div>
                <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium text-fg/90">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                  id="coupon"
                  value={c.couponCode}
                  onChange={(e) => c.setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void c.applyCoupon();
                    }
                  }}
                  placeholder="ARROW10"
                  className="h-10 min-w-0 flex-1 rounded-md border border-line bg-bg px-3 text-sm uppercase text-fg placeholder:text-subtle focus:border-fg/50 focus:outline-none" />
                
                  <Button variant="secondary" size="sm" className="h-10" onClick={() => void c.applyCoupon()} loading={c.couponLoading}>
                    Apply
                  </Button>
                </div>
                {c.couponError && <p className="mt-1.5 text-xs text-danger">{c.couponError}</p>}
              </div>
            }
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums text-fg">{formatLKR(c.totals.subtotal)}</dd>
            </div>
            {c.totals.discount > 0 &&
            <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd className="tabular-nums text-fg">−{formatLKR(c.totals.discount)}</dd>
              </div>
            }
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular-nums text-fg">{c.totals.delivery === 0 ? 'Free' : formatLKR(c.totals.delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="font-semibold text-fg">Total</dt>
              <dd className="font-semibold tabular-nums text-fg">{formatLKR(c.totals.total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" fullWidth className="mt-6" loading={c.submitting}>
            <LockIcon className="h-4 w-4" aria-hidden="true" />
            Place order
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-subtle">
            By placing your order you agree to our{' '}
            <Link to="/policies/terms" className="underline underline-offset-2 hover:text-fg">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/policies/refund" className="underline underline-offset-2 hover:text-fg">
              Refund Policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>);

}