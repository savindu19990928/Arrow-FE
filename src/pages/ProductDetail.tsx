import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { catalogApi } from '../utils/shopApi';
import { ProductMedia } from '../components/product/ProductMedia';
import { PurchasePanel } from '../components/product/PurchasePanel';
import { ProductSpecs } from '../components/product/ProductSpecs';
import { ReviewsSection } from '../components/product/ReviewsSection';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { ErrorState } from '../components/ui/ErrorState';
import type { Variant } from '../types/api';

type Tab = 'description' | 'specs';

export function ProductDetail() {
  const { slug = '' } = useParams();
  const product = useApi(() => catalogApi.product(slug), [slug]);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [tab, setTab] = useState<Tab>('description');

  useEffect(() => {
    const data = product.data;
    if (!data) return;
    const active = (data.variants ?? []).filter((v) => v.is_active !== false);
    setVariant(active.find((v) => v.in_stock) ?? active[0] ?? null);
    document.title = `${data.name} — Arrow Ventures`;
  }, [product.data]);

  if (product.loading) {
    return (
      <div className="mx-auto grid max-w-7xl animate-pulse gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:px-8" aria-hidden="true">
        <div className="aspect-[5/4] rounded-xl bg-surface" />
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded bg-surface" />
          <div className="h-10 w-3/4 rounded bg-surface" />
          <div className="h-8 w-1/3 rounded bg-surface" />
          <div className="h-24 rounded bg-surface" />
          <div className="h-12 rounded bg-surface" />
        </div>
      </div>);

  }

  if (product.error || !product.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState title="Product unavailable" message={product.error ?? 'This product could not be found.'} onRetry={product.reload} />
        <p className="mt-6 text-center text-sm">
          <Link to="/catalog" className="text-fg underline underline-offset-2">
            Back to catalog
          </Link>
        </p>
      </div>);

  }

  const data = product.data;

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-6 text-xs text-subtle">
          <Link to="/catalog" className="hover:text-fg">
            Catalog
          </Link>
          {data.category &&
          <>
              <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
              <Link to={`/catalog?category=${data.category.slug}`} className="hover:text-fg">
                {data.category.name}
              </Link>
            </>
          }
          <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
          <span className="truncate text-muted" aria-current="page">
            {data.name}
          </span>
        </nav>

        <div className="grid gap-12 pb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductMedia product={data} variantImage={variant?.image ?? null} />
          </div>
          <PurchasePanel product={data} selectedVariant={variant} onSelectVariant={setVariant} />
        </div>

        <section className="border-t border-line py-16" aria-label="Product information">
          <div className="flex gap-6 border-b border-line" role="tablist">
            {(
            [
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' }] as
            const).
            map((t) =>
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors duration-150 ${
              tab === t.id ? 'border-fg text-fg' : 'border-transparent text-muted hover:text-fg'}`
              }>
              
                {t.label}
              </button>
            )}
          </div>
          <div className="pt-8" role="tabpanel">
            {tab === 'description' ?
            <div className="max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-muted">
                {data.description || data.short_description || 'No description available.'}
              </div> :

            <ProductSpecs specifications={data.specifications ?? []} />
            }
          </div>
        </section>

        <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24 border-t border-line py-16">
          <h2 id="reviews-heading" className="mb-10 font-display text-2xl font-extrabold uppercase tracking-tight text-fg">
            Reviews
          </h2>
          <ReviewsSection product={data} />
        </section>

        <RelatedProducts product={data} />
      </div>
    </div>);

}