import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BoxIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { catalogApi } from '../../utils/storeApi';
import { formatLKR } from '../../utils/format';

export function ThreeDShowcase() {
  const { data, loading, error } = useApi(() => catalogApi.products({ has_3d_model: true, page_size: 4 }), []);
  const products = data?.results ?? [];

  if (error || !loading && products.length === 0) return null;

  return (
    <section className="border-y border-transparent bg-night text-snow dark:border-line dark:bg-canvas" aria-labelledby="inspect-3d">
      <div className="mx-auto grid max-w-site gap-12 px-5 py-16 md:px-10 md:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-lime">
            <BoxIcon className="h-4 w-4" aria-hidden /> Interactive 3D
          </span>
          <h2 id="inspect-3d" className="display mt-4 text-[44px] md:text-[60px]">
            Inspect every
            <br />
            angle first
          </h2>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-snow/70">
            Rotate and zoom into selected models before you buy — the frame, the motor, the details that matter.
          </p>
          <Link to="/shop" className="mt-8 inline-flex items-center gap-2 border-b-2 border-lime pb-1 text-sm font-medium text-snow">
            Browse all products <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="divide-y divide-snow/10 border-y border-snow/10">
          {loading ?
          [0, 1, 2].map((i) =>
          <li key={i} className="flex items-center gap-5 py-5" aria-hidden>
                  <div className="h-20 w-24 animate-pulse rounded bg-snow/10" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-snow/10" />
                </li>
          ) :
          products.map((p) =>
          <li key={p.id}>
                  <Link to={`/product/${p.slug}`} className="focus-ring group flex items-center gap-5 py-5">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded bg-[#F3F3F1]">
                      {p.primary_image &&
                <img src={p.primary_image} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                }
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-medium">{p.name}</h3>
                      <p className="mt-0.5 text-sm text-snow/60">{formatLKR(p.price)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-snow/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 ease-out group-hover:border-lime group-hover:text-lime">
                      View in 3D
                    </span>
                  </Link>
                </li>
          )}
        </ul>
      </div>
    </section>);

}