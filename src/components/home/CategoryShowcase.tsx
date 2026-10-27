import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import { useCatalog } from '../../contexts/CatalogContext';

export function CategoryShowcase() {
  const { categories, loading, error } = useCatalog();
  const roots = categories.filter((c) => !c.parent);

  if (error || !loading && roots.length === 0) return null;

  return (
    <section className="bg-paper" aria-labelledby="shop-by-category">
      <div className="mx-auto max-w-site px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Parts, power & gear</p>
            <h2 id="shop-by-category" className="display mt-3 text-[40px] md:text-[52px]">
              Everything
              <br />
              for the ride
            </h2>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted">
              Keep your e-bike running with genuine batteries, motors, controllers and accessories.
            </p>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {loading ?
            [0, 1, 2].map((i) =>
            <li key={i} className="flex items-center gap-5 py-5" aria-hidden>
                    <div className="h-16 w-20 animate-pulse rounded bg-canvas" />
                    <div className="h-5 w-1/3 animate-pulse rounded bg-canvas" />
                  </li>
            ) :
            roots.map((c) =>
            <li key={c.id}>
                    <Link
                to={`/shop?category=${c.slug}`}
                className="focus-ring group flex items-center gap-5 py-5 md:gap-8">
                
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded bg-canvas md:h-20 md:w-28">
                        {c.image &&
                  <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover mix-blend-multiply" />
                  }
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-medium md:text-2xl">{c.name}</h3>
                        {c.description && <p className="mt-1 line-clamp-1 text-[15px] text-muted">{c.description}</p>}
                      </div>
                      {typeof c.product_count === 'number' &&
                <span className="hidden whitespace-nowrap text-sm text-muted sm:block">
                          {c.product_count} products
                        </span>
                }
                      <ArrowUpRightIcon
                  className="h-5 w-5 shrink-0 text-ink transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden />
                
                    </Link>
                  </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}