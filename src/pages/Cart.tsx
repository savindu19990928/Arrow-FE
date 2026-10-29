import React from 'react';
import { Link } from 'react-router-dom';
import { ImageOffIcon, ShoppingBagIcon, Trash2Icon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatLKR, toNumber } from '../utils/format';
import { buttonClasses } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { Spinner } from '../components/ui/Spinner';

export function Cart() {
  const { cart, loading, error, refresh, updateQuantity, removeItem, pendingItemId } = useCart();

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">Cart</h1>

        {loading && !cart ?
        <Spinner label="Loading your cart" /> :
        error && !cart ?
        <div className="mt-10">
            <ErrorState message={error} onRetry={() => void refresh()} />
          </div> :
        !cart?.items.length ?
        <EmptyState
          icon={ShoppingBagIcon}
          title="Your cart is empty"
          message="Find your next ride or the parts to keep it running."
          action={
          <Link to="/catalog" className={buttonClasses('primary', 'md')}>
                Browse the catalog
              </Link>
          } /> :


        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-line border-y border-line">
              {cart.items.map((item) =>
            <li key={item.id} className={`flex gap-5 py-6 ${pendingItemId === item.id ? 'opacity-60' : ''}`}>
                  <Link
                to={`/product/${item.product_slug}`}
                className="h-24 w-28 shrink-0 overflow-hidden rounded-md border border-line bg-surface sm:h-28 sm:w-36">
                
                    {item.product_image ?
                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" /> :

                <span className="flex h-full items-center justify-center text-subtle">
                        <ImageOffIcon className="h-6 w-6" aria-hidden="true" />
                      </span>
                }
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link to={`/product/${item.product_slug}`} className="font-medium text-fg hover:underline">
                          {item.product_name}
                        </Link>
                        {item.variant_name && <p className="mt-0.5 text-sm text-muted">{item.variant_name}</p>}
                        <p className="mt-0.5 text-xs text-subtle">{formatLKR(item.unit_price)} each</p>
                      </div>
                      <p className="whitespace-nowrap font-semibold tabular-nums text-fg">{formatLKR(item.line_total)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    onChange={(q) => void updateQuantity(item.id, q)}
                    disabled={pendingItemId === item.id} />
                  
                      <button
                    type="button"
                    onClick={() => void removeItem(item.id)}
                    disabled={pendingItemId === item.id}
                    className="flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg">
                    
                        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
            )}
            </ul>

            <aside className="h-fit rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-24" aria-label="Order summary">
              <h2 className="text-lg font-semibold text-fg">Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal ({cart.total_items_count} items)</dt>
                  <dd className="tabular-nums text-fg">{formatLKR(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Estimated delivery</dt>
                  <dd className="tabular-nums text-fg">
                    {toNumber(cart.estimated_delivery_fee) === 0 ? 'Free' : formatLKR(cart.estimated_delivery_fee)}
                  </dd>
                </div>
                {cart.max_lead_time_days ?
              <div className="flex justify-between">
                    <dt className="text-muted">Arrives in</dt>
                    <dd className="text-fg">up to {cart.max_lead_time_days} days</dd>
                  </div> :
              null}
                <div className="flex justify-between border-t border-line pt-4 text-base">
                  <dt className="font-semibold text-fg">Total</dt>
                  <dd className="font-semibold tabular-nums text-fg">{formatLKR(cart.grand_total)}</dd>
                </div>
              </dl>
              <Link to="/checkout" className={`${buttonClasses('primary', 'lg', true)} mt-6`}>
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-subtle">Coupon codes can be applied at checkout.</p>
            </aside>
          </div>
        }
      </div>
    </div>);

}