import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../product/ProductCardSkeleton';
import { StateMessage } from '../StateMessage';
import { useApi } from '../../hooks/useApi';
import { useCatalog } from '../../contexts/CatalogContext';
import { catalogApi } from '../../utils/storeApi';

export function FeaturedBikes() {
  const { bikeCategory, loading: catalogLoading } = useCatalog();
  const slug = bikeCategory?.slug;

  const { data, loading, error, reload } = useApi(
    async () => {
      const featured = await catalogApi.products({ category: slug, is_featured: true, page_size: 3 });
      if (featured.results.length > 0) return featured.results;
      const latest = await catalogApi.products({ category: slug, ordering: '-created_at', page_size: 3 });
      return latest.results;
    },
    [slug],
    !catalogLoading
  );

  const viewAll = slug ? `/shop?category=${slug}` : '/shop';

  return (
    <section className="bg-canvas" aria-labelledby="find-your-ride">
      <div className="mx-auto max-w-site px-5 py-16 md:px-10 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Our e-bikes</p>
            <h2 id="find-your-ride" className="display mt-3 text-[44px] md:text-[64px]">
              Find your ride
            </h2>
          </div>
          <Link to={viewAll} className="link-underline focus-ring mb-2">
            View all bikes <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10">
          {error ?
          <StateMessage tone="error" title="We couldn’t load our bikes" description={error} onRetry={reload} /> :
          loading || !data ?
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) =>
            <ProductCardSkeleton key={i} />
            )}
            </div> :
          data.length === 0 ?
          <StateMessage title="New bikes are on the way" description="Our latest e-bikes will appear here as soon as they’re in stock." /> :

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) =>
            <li key={p.id}>
                  <ProductCard product={p} />
                </li>
            )}
            </ul>
          }
        </div>
      </div>
    </section>);

}