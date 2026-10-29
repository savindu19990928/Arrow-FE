import React from 'react';
import { useApi } from '../../hooks/useApi';
import { catalogApi } from '../../utils/shopApi';
import { ProductCard } from '../ProductCard';
import type { ProductDetail } from '../../types/api';

export function RelatedProducts({ product }: {product: ProductDetail;}) {
  const categorySlug = product.category?.slug;
  const related = useApi(
    () => catalogApi.products({ category: categorySlug, page_size: 5 }),
    [categorySlug, product.id],
    !!categorySlug
  );
  const items = (related.data?.results ?? []).filter((p) => p.id !== product.id).slice(0, 4);
  if (related.loading || related.error || !items.length) return null;

  return (
    <section aria-labelledby="related-heading" className="border-t border-line py-16">
      <h2 id="related-heading" className="font-display text-2xl font-extrabold uppercase tracking-tight text-fg">
        You may also like
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {items.map((p) =>
        <ProductCard key={p.id} product={p} />
        )}
      </div>
    </section>);

}