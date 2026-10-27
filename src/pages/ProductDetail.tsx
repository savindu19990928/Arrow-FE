import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, ChevronRightIcon, HeartIcon, ShieldCheckIcon, TruckIcon } from 'lucide-react';
import { ProductMedia } from '../components/product/ProductMedia';
import { SpecificationsTable } from '../components/product/SpecificationsTable';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductCard } from '../components/product/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { RatingStars } from '../components/RatingStars';
import { StateMessage } from '../components/StateMessage';
import { useApi } from '../hooks/useApi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { catalogApi } from '../utils/storeApi';
import { formatLKR } from '../utils/format';
import type { ProductVariant } from '../types/api';
export function ProductDetail() {
  const {
    slug = ''
  } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    loading,
    error,
    reload
  } = useApi(() => catalogApi.product(slug), [slug]);
  const {
    addItem
  } = useCart();
  const {
    has,
    toggle
  } = useWishlist();
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const variants = useMemo(() => (product?.variants ?? []).filter((v) => v.is_active !== false), [product]);
  useEffect(() => {
    if (!product) return;
    const first = variants.find((v) => v.in_stock) ?? variants[0];
    setVariantId(first ? first.id : null);
    setQuantity(1);
    document.title = `${product.name} · Arrow Ventures`;
  }, [product, variants]);
  const related = useApi(() => catalogApi.products({
    category: product?.category?.slug,
    page_size: 5
  }), [product?.category?.slug], !!product?.category?.slug);
  if (error) {
    return <div className="mx-auto max-w-site px-5 py-20 md:px-10">
        <StateMessage tone="error" title="We couldn’t load this product" description={error} onRetry={reload} action={<Link to="/shop" className="btn-primary">
              Back to shop
            </Link>} />
      </div>;
  }
  if (loading || !product) {
    return <div className="mx-auto grid max-w-site gap-10 px-5 py-10 md:px-10 lg:grid-cols-2" aria-busy="true">
        <div className="aspect-square animate-pulse rounded-md bg-canvas" />
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-canvas" />
          <div className="h-14 w-3/4 animate-pulse rounded bg-canvas" />
          <div className="h-6 w-40 animate-pulse rounded bg-canvas" />
          <div className="h-24 w-full animate-pulse rounded bg-canvas" />
        </div>
      </div>;
  }
  const variant: ProductVariant | undefined = variants.find((v) => v.id === variantId);
  const price = variant?.final_price ?? product.price;
  const inStock = variant ? variant.in_stock : product.in_stock;
  const stockQty = variant ? variant.stock_quantity : product.stock_quantity;
  const compareAt = product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(price) ? product.compare_at_price : null;
  const rating = parseFloat(product.average_rating ?? '0') || 0;
  const saved = has(product.id);
  const relatedProducts = (related.data?.results ?? []).filter((p) => p.id !== product.id).slice(0, 4);
  const attributeLine = (v: ProductVariant) => [v.color, v.battery_capacity, v.wheel_size, v.size, v.configuration].filter(Boolean).join(' · ');
  const handleAdd = async () => {
    setAdding(true);
    const ok = await addItem(product.id, variant?.id ?? null, quantity);
    setAdding(false);
    if (ok) {
      toast.success(`${product.name} added to your cart`, {
        action: {
          label: 'View cart',
          onClick: () => navigate('/cart')
        }
      });
    }
  };
  return <div className="bg-paper">
      <div className="mx-auto max-w-site px-5 pb-20 pt-6 md:px-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
            {product.category && <>
                <li>
                  <Link to={`/shop?category=${product.category.slug}`} className="hover:text-ink">
                    {product.category.name}
                  </Link>
                </li>
                <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
              </>}
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <ProductMedia product={product} variantImage={variant?.image} />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">
              {[product.brand?.name, product.category?.name].filter(Boolean).join(' · ')}
            </p>
            <h1 className="display mt-3 text-[40px] md:text-[56px]">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {product.review_count > 0 && <a href="#reviews" className="inline-flex items-center gap-2 hover:text-ink">
                  <RatingStars rating={rating} /> {rating.toFixed(1)} ({product.review_count})
                </a>}
              <span>SKU {variant?.sku ?? product.sku}</span>
              {product.has_3d_model && <span className="inline-flex items-center gap-1 text-ink">
                  <div className="h-3.5 w-3.5" aria-hidden /> 3D view available
                </span>}
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-medium">{formatLKR(price)}</span>
              {compareAt && <span className="text-lg text-subtle line-through">{formatLKR(compareAt)}</span>}
              {product.discount_percentage ? <span className="rounded-full bg-lime px-2.5 py-1 text-xs font-semibold">
                  Save {Math.round(product.discount_percentage)}%
                </span> : null}
            </div>

            {product.short_description && <p className="mt-5 text-[17px] leading-relaxed text-ink/85">{product.short_description}</p>}

            {variants.length > 0 && <fieldset className="mt-8">
                <legend className="mb-3 text-sm font-semibold uppercase tracking-wide">Choose configuration</legend>
                <div className="grid gap-2">
                  {variants.map((v) => {
                const selected = v.id === variantId;
                return <label key={v.id} className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 transition-colors duration-150 ease-out ${selected ? 'border-ink bg-white' : 'border-line bg-white hover:border-ink/40'} ${!v.in_stock ? 'opacity-60' : ''}`}>
                        <input type="radio" name="variant" className="sr-only" checked={selected} onChange={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }} />
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-ink bg-ink text-white' : 'border-line'}`} aria-hidden>
                          {selected && <CheckIcon className="h-3 w-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{v.name}</span>
                          {attributeLine(v) && <span className="block text-sm text-muted">{attributeLine(v)}</span>}
                        </span>
                        <span className="text-right text-sm">
                          <span className="block font-medium">{formatLKR(v.final_price)}</span>
                          <span className={`block ${v.in_stock ? 'text-leaf' : 'text-danger'}`}>
                            {v.in_stock ? 'In stock' : 'Out of stock'}
                          </span>
                        </span>
                      </label>;
              })}
                </div>
              </fieldset>}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, stockQty)} disabled={!inStock} />
              <button type="button" className="btn-primary flex-1" disabled={!inStock || adding} onClick={handleAdd}>
                {!inStock ? 'Out of stock' : adding ? 'Adding…' : 'Add to cart'}
              </button>
              <button type="button" onClick={() => toggle(product.id)} className="focus-ring flex h-[50px] w-[50px] items-center justify-center rounded-md border border-line bg-white hover:border-ink" aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={saved}>
                <HeartIcon className={`h-5 w-5 ${saved ? 'fill-ink' : ''}`} />
              </button>
            </div>
            {inStock && stockQty > 0 && stockQty <= 5 && <p className="mt-3 text-sm text-danger">Only {stockQty} left in stock</p>}

            <dl className="mt-8 divide-y divide-line border-y border-line text-[15px]">
              {product.estimated_arrival_days != null && <div className="flex items-start gap-3 py-4">
                  <TruckIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <dt className="font-medium">Delivery</dt>
                    <dd className="text-muted">Estimated arrival in {product.estimated_arrival_days} days across Sri Lanka</dd>
                  </div>
                </div>}
              {product.warranty_information && <div className="flex items-start gap-3 py-4">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <div>
                    <dt className="font-medium">Warranty</dt>
                    <dd className="text-muted">{product.warranty_information}</dd>
                  </div>
                </div>}
            </dl>
            <p className="mt-4 text-sm text-muted">Pay with Koko or Mintpay in instalments, or by direct bank transfer.</p>
          </div>
        </div>

        {product.description && <section className="mt-20 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="overview">
            <h2 id="overview" className="display text-[36px]">
              Overview
            </h2>
            <div className="max-w-3xl whitespace-pre-line text-[17px] leading-relaxed text-ink/85">{product.description}</div>
          </section>}

        <section className="mt-16 grid gap-8 border-t border-line pt-12 lg:grid-cols-[320px_1fr]" aria-labelledby="specs">
          <h2 id="specs" className="display text-[36px]">
            Specifications
          </h2>
          <SpecificationsTable specs={product.specifications ?? []} />
        </section>

        <section id="reviews" className="mt-16 border-t border-line pt-12" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="display mb-8 text-[36px]">
            Rider reviews
          </h2>
          <ProductReviews productId={product.id} productSlug={product.slug} averageRating={rating} reviewCount={product.review_count} />
        </section>

        {relatedProducts.length > 0 && <section className="mt-16 border-t border-line pt-12" aria-labelledby="related">
            <h2 id="related" className="display mb-8 text-[36px]">
              You may also like
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => <li key={p.id}>
                  <ProductCard product={p} />
                </li>)}
            </ul>
          </section>}
      </div>
    </div>;
}