import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { HeartIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatLKR, toNumber } from '../../utils/format';
import { Button } from '../ui/Button';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Rating } from '../ui/Rating';
import type { ProductDetail, Variant } from '../../types/api';

interface PurchasePanelProps {
  product: ProductDetail;
  selectedVariant: Variant | null;
  onSelectVariant: (variant: Variant) => void;
}

const variantAttributes: {key: keyof Variant;label: string;}[] = [
{ key: 'color', label: 'Color' },
{ key: 'size', label: 'Size' },
{ key: 'model_variant', label: 'Model' },
{ key: 'battery_capacity', label: 'Battery' },
{ key: 'wheel_size', label: 'Wheel size' },
{ key: 'configuration', label: 'Configuration' }];


export function PurchasePanel({ product, selectedVariant, onSelectVariant }: PurchasePanelProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isSaved, toggle, pendingId } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const variants = (product.variants ?? []).filter((v) => v.is_active !== false);
  const price = selectedVariant ? selectedVariant.final_price : product.price;
  const compareAt = toNumber(product.compare_at_price);
  const inStock = selectedVariant ? selectedVariant.in_stock : product.in_stock;
  const stock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const needsVariant = variants.length > 0 && !selectedVariant;
  const saved = isSaved(product.id);

  const handleAdd = async () => {
    if (needsVariant) {
      toast.error('Please choose an option first.');
      return;
    }
    setAdding(true);
    const ok = await addItem(product.id, selectedVariant?.id ?? null, quantity);
    setAdding(false);
    if (ok) {
      toast.success(`${product.name} added to cart`, {
        action: { label: 'View cart', onClick: () => navigate('/cart') }
      });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {product.brand &&
        <Link to={`/catalog?brand=${product.brand.slug}`} className="hover:text-fg">
            {product.brand.name}
          </Link>
        }
        {product.brand && product.category && <span aria-hidden="true">·</span>}
        {product.category &&
        <Link to={`/catalog?category=${product.category.slug}`} className="hover:text-fg">
            {product.category.name}
          </Link>
        }
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-fg md:text-4xl">
        {product.name}
      </h1>
      <div className="mt-3">
        <a href="#reviews" className="inline-flex hover:opacity-80">
          <Rating value={product.average_rating} count={product.review_count} size="md" />
        </a>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-semibold tabular-nums text-fg">{formatLKR(price)}</span>
        {compareAt > toNumber(price) &&
        <span className="text-base tabular-nums text-subtle line-through">{formatLKR(compareAt)}</span>
        }
      </div>
      {product.short_description && <p className="mt-4 text-[15px] leading-relaxed text-muted">{product.short_description}</p>}

      {variants.length > 0 &&
      <fieldset className="mt-8">
          <legend className="text-sm font-medium text-fg">Choose an option</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {variants.map((variant) => {
            const active = selectedVariant?.id === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => onSelectVariant(variant)}
                aria-pressed={active}
                disabled={!variant.in_stock}
                className={`flex flex-col items-start rounded-md border px-3.5 py-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? 'border-fg bg-raised' : 'border-line hover:border-fg/40'}`
                }>
                
                  <span className="text-sm font-medium text-fg">{variant.name}</span>
                  <span className="mt-0.5 text-xs tabular-nums text-muted">
                    {formatLKR(variant.final_price)}
                    {!variant.in_stock && ' · Out of stock'}
                  </span>
                </button>);

          })}
          </div>
          {selectedVariant &&
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {variantAttributes.
          filter((attr) => selectedVariant[attr.key]).
          map((attr) =>
          <div key={attr.key} className="flex justify-between gap-3 border-b border-line py-1.5">
                    <dt className="text-subtle">{attr.label}</dt>
                    <dd className="text-right text-fg">{String(selectedVariant[attr.key])}</dd>
                  </div>
          )}
            </dl>
        }
        </fieldset>
      }

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, stock || 1)} disabled={!inStock} />
        <Button size="lg" className="min-w-0 flex-1 whitespace-nowrap" onClick={handleAdd} loading={adding} disabled={!inStock}>
          {inStock ? 'Add to cart' : 'Out of stock'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => void toggle(product.id)}
          disabled={pendingId === product.id}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="w-12 shrink-0 px-0">
          
          <HeartIcon className={`h-5 w-5 ${saved ? 'fill-fg' : ''}`} aria-hidden="true" />
        </Button>
      </div>
      <p className={`mt-3 text-sm ${inStock ? 'text-muted' : 'text-danger'}`}>
        {inStock ? stock > 0 && stock <= 5 ? `Only ${stock} left in stock` : 'In stock' : 'Currently unavailable'}
      </p>

      <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
        {product.estimated_arrival_days ?
        <div className="flex items-start gap-3 py-4">
            <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <div>
              <dt className="font-medium text-fg">Delivery</dt>
              <dd className="mt-0.5 text-muted">Estimated arrival in {product.estimated_arrival_days} days</dd>
            </div>
          </div> :
        null}
        {product.warranty_information &&
        <div className="flex items-start gap-3 py-4">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <div>
              <dt className="font-medium text-fg">Warranty</dt>
              <dd className="mt-0.5 text-muted">
                {product.warranty_information}.{' '}
                <Link to="/maintenance" className="text-fg underline-offset-2 hover:underline">
                  Coverage details
                </Link>
              </dd>
            </div>
          </div>
        }
        <div className="flex justify-between py-4">
          <dt className="text-subtle">SKU</dt>
          <dd className="font-mono text-xs text-muted">{selectedVariant?.sku ?? product.sku}</dd>
        </div>
      </dl>
    </div>);

}