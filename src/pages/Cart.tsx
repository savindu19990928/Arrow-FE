import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ImageOffIcon, Loader2Icon, Trash2Icon } from 'lucide-react';
import { QuantityStepper } from '../components/QuantityStepper';
import { StateMessage } from '../components/StateMessage';
import { useCart } from '../contexts/CartContext';
import { formatLKR } from '../utils/format';

export function Cart() {
  const { cart, loading, error, refresh, updateItem, removeItem, busyItemId } = useCart();

  return (
    <div className="min-h-[60vh] bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-10 md:px-10 md:pt-14">
        <h1 className="display text-[44px] md:text-[64px]">Your cart</h1>

        {error && !cart ?
        <StateMessage tone="error" title="We couldn’t load your cart" description={error} onRetry={() => void refresh()} /> :
        loading && !cart ?
        <div className="mt-10 flex items-center gap-2 text-muted" role="status">
            <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Loading your cart…
          </div> :
        !cart || cart.items.length === 0 ?
        <StateMessage
          title="Your cart is empty"
          description="Find an e-bike, battery or accessory to get started."
          action={
          <Link to="/shop" className="btn-primary">
                Start shopping <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
          } /> :


        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-line border-y border-line" aria-label="Cart items">
              {cart.items.map((item) => {
              const busy = busyItemId === item.id;
              return (
                <li key={item.id} className={`flex gap-5 py-6 ${busy ? 'opacity-60' : ''}`}>
                    <Link to={`/product/${item.product_slug}`} className="h-28 w-28 shrink-0 overflow-hidden rounded bg-white md:h-32 md:w-36">
                      {item.product_image ?
                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-contain mix-blend-multiply" /> :

                    <div className="flex h-full items-center justify-center text-subtle">
                          <ImageOffIcon className="h-6 w-6" aria-hidden />
                        </div>
                    }
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link to={`/product/${item.product_slug}`} className="text-lg font-medium hover:underline">
                            {item.product_name}
                          </Link>
                          {item.variant_name && <p className="mt-0.5 text-sm text-muted">{item.variant_name}</p>}
                          <p className="mt-1 text-sm text-muted">{formatLKR(item.unit_price)} each</p>
                        </div>
                        <p className="whitespace-nowrap text-lg font-medium">{formatLKR(item.line_total)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <QuantityStepper
                        value={item.quantity}
                        disabled={busy}
                        onChange={(q) => void updateItem(item.id, q)}
                        label={`Quantity for ${item.product_name}`} />
                      
                        <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        disabled={busy}
                        className="focus-ring inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted hover:text-danger">
                        
                          <Trash2Icon className="h-4 w-4" aria-hidden /> Remove
                        </button>
                      </div>
                    </div>
                  </li>);

            })}
            </ul>

            <aside className="h-fit rounded-md bg-white p-6 lg:sticky lg:top-28" aria-label="Order summary">
              <h2 className="text-lg font-semibold">Summary</h2>
              <dl className="mt-5 space-y-3 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal ({cart.total_items_count} items)</dt>
                  <dd>{formatLKR(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Delivery</dt>
                  <dd>
                    {cart.estimated_delivery_fee && parseFloat(cart.estimated_delivery_fee) > 0 ?
                  formatLKR(cart.estimated_delivery_fee) :
                  'Free'}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
                  <dt>Total</dt>
                  <dd>{formatLKR(cart.grand_total)}</dd>
                </div>
              </dl>
              {cart.max_lead_time_days ?
            <p className="mt-3 text-sm text-muted">Estimated delivery within {cart.max_lead_time_days} days.</p> :
            null}
              <p className="mt-1 text-sm text-muted">Coupon codes can be applied at checkout.</p>
              <Link to="/checkout" className="btn-primary mt-6 w-full">
                Proceed to checkout <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/shop" className="mt-4 block text-center text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
                Continue shopping
              </Link>
            </aside>
          </div>
        }
      </div>
    </div>);

}